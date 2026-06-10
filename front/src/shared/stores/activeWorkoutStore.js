import { makeAutoObservable } from 'mobx';
import api from '../../features/api/api';
import {
  calculateElapsedSeconds,
  expandExerciseRowsToEntries,
  groupEntriesToExerciseRows,
} from '../../features/activeWorkout/activeWorkoutSync';
import {
  ACTIVE_WORKOUT_STORAGE_KEY,
  createExerciseRow,
  getTodayDateString,
} from '../../features/activeWorkout/activeWorkoutUtils';

function readStoredWorkout() {
  try {
    const raw = sessionStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

class ActiveWorkoutStore {
  isActive = false;
  isHydrating = false;
  isActionPending = false;
  syncError = '';
  workoutId = null;
  elapsed = 0;
  running = false;
  date = getTodayDateString();
  notes = '';
  exercises = [createExerciseRow()];
  _timerId = null;

  constructor() {
    makeAutoObservable(this);
    this.restore();
  }

  persist = () => {
    if (!this.isActive) {
      sessionStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
      return;
    }

    sessionStorage.setItem(
      ACTIVE_WORKOUT_STORAGE_KEY,
      JSON.stringify({
        workoutId: this.workoutId,
        isActive: this.isActive,
        elapsed: this.elapsed,
        running: this.running,
        date: this.date,
        notes: this.notes,
        exercises: this.exercises,
      }),
    );
  };

  restore = () => {
    const stored = readStoredWorkout();

    if (!stored?.isActive) {
      return;
    }

    this.isActive = true;
    this.workoutId = stored.workoutId ?? null;
    this.elapsed = stored.elapsed ?? 0;
    this.running = stored.running ?? false;
    this.date = getTodayDateString();
    this.notes = stored.notes ?? '';
    this.exercises = stored.exercises?.length
      ? stored.exercises.map((exercise) => ({
          id: exercise.id ?? Date.now(),
          exerciseId: exercise.exerciseId ?? '',
          sets: exercise.sets ?? 3,
          reps: exercise.reps ?? 10,
          weight: exercise.weight ?? 0,
        }))
      : [createExerciseRow()];

    if (this.running) {
      this.startTimer();
    }
  };

  applyActiveWorkout = (activeWorkout) => {
    this.workoutId = activeWorkout.id;
    this.isActive = true;
    this.date = activeWorkout.date;
    this.notes = activeWorkout.comment ?? '';
    this.running = !activeWorkout.isPaused;
    this.elapsed = calculateElapsedSeconds(activeWorkout);
    this.exercises = groupEntriesToExerciseRows(activeWorkout.entries);
    this.syncError = '';
    this.persist();
  };

  reset = () => {
    this.stopTimer();
    this.isActive = false;
    this.isActionPending = false;
    this.syncError = '';
    this.workoutId = null;
    this.elapsed = 0;
    this.running = false;
    this.date = getTodayDateString();
    this.notes = '';
    this.exercises = [createExerciseRow()];
    this.persist();
  };

  startTimer = () => {
    if (this._timerId) {
      return;
    }

    this._timerId = setInterval(() => {
      if (this.running) {
        this.elapsed += 1;
        this.persist();
      }
    }, 1000);
  };

  stopTimer = () => {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  };

  hydrateFromServer = async () => {
    this.isHydrating = true;
    this.syncError = '';

    try {
      const activeWorkout = await api.getActiveWorkout();

      if (!activeWorkout) {
        if (this.isActive) {
          this.reset();
        }

        return null;
      }

      this.applyActiveWorkout(activeWorkout);

      const stored = readStoredWorkout();

      if (stored?.workoutId === activeWorkout.id && stored.exercises?.length) {
        this.exercises = stored.exercises.map((exercise) => ({
          id: exercise.id ?? Date.now(),
          exerciseId: exercise.exerciseId ?? '',
          sets: exercise.sets ?? 3,
          reps: exercise.reps ?? 10,
          weight: exercise.weight ?? 0,
        }));
        this.notes = stored.notes ?? this.notes;
        this.persist();
      }

      if (this.running) {
        this.startTimer();
      } else {
        this.stopTimer();
      }

      return activeWorkout;
    } catch {
      this.syncError = 'Не удалось загрузить активную тренировку';
      return null;
    } finally {
      this.isHydrating = false;
    }
  };

  startWorkout = async () => {
    this.isActionPending = true;
    this.syncError = '';

    try {
      try {
        await api.beginWorkout();
      } catch (error) {
        if (error.response?.status !== 409) {
          throw error;
        }
      }

      const activeWorkout = await api.getActiveWorkout();

      if (!activeWorkout) {
        throw new Error('Active workout not found');
      }

      const isNewSession = !this.workoutId || this.workoutId !== activeWorkout.id;

      this.applyActiveWorkout(activeWorkout);

      if (isNewSession) {
        this.elapsed = 0;
        this.exercises = [createExerciseRow()];
        this.notes = '';
      }

      this.persist();

      if (this.running) {
        this.startTimer();
      }
    } catch {
      this.syncError = 'Не удалось начать тренировку';
      throw new Error('Не удалось начать тренировку');
    } finally {
      this.isActionPending = false;
    }
  };

  togglePause = async () => {
    if (!this.workoutId || this.isActionPending) {
      return;
    }

    this.isActionPending = true;
    this.syncError = '';

    try {
      if (this.running) {
        await api.pauseWorkout();
      } else {
        await api.resumeWorkout();
      }

      const activeWorkout = await api.getActiveWorkout();

      if (activeWorkout) {
        this.running = !activeWorkout.isPaused;
        this.elapsed = calculateElapsedSeconds(activeWorkout);
        this.persist();

        if (this.running) {
          this.startTimer();
        } else {
          this.stopTimer();
        }
      }
    } catch {
      this.syncError = 'Не удалось изменить состояние паузы';
    } finally {
      this.isActionPending = false;
    }
  };

  setNotes = (notes) => {
    this.notes = notes;
    this.persist();
  };

  addExercise = () => {
    this.exercises = [...this.exercises, createExerciseRow()];
    this.persist();
  };

  removeExercise = (id) => {
    if (this.exercises.length > 1) {
      this.exercises = this.exercises.filter((exercise) => exercise.id !== id);
      this.persist();
    }
  };

  updateExercise = (id, field, value) => {
    this.exercises = this.exercises.map((exercise) =>
      exercise.id === id ? { ...exercise, [field]: value } : exercise,
    );
    this.persist();
  };

  finishWorkout = async () => {
    if (!this.workoutId) {
      throw new Error('Active workout not found');
    }

    this.isActionPending = true;
    this.syncError = '';

    try {
      const entries = expandExerciseRowsToEntries(this.exercises);

      for (const entry of entries) {
        await api.addExerciseEntry(this.workoutId, entry);
      }

      await api.finishWorkout(this.notes);
      this.reset();
    } catch {
      this.syncError = 'Не удалось завершить тренировку';
      throw new Error('Не удалось завершить тренировку');
    } finally {
      this.isActionPending = false;
    }
  };

  cancelWorkout = async () => {
    this.isActionPending = true;
    this.syncError = '';

    try {
      if (this.workoutId) {
        await api.cancelWorkout();
      }

      this.reset();
    } catch {
      this.syncError = 'Не удалось отменить тренировку';
      throw new Error('Не удалось отменить тренировку');
    } finally {
      this.isActionPending = false;
    }
  };
}

export const activeWorkoutStore = new ActiveWorkoutStore();
