import { makeAutoObservable } from 'mobx';
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

  startWorkout = () => {
    this.isActive = true;
    this.elapsed = 0;
    this.running = true;
    this.date = getTodayDateString();
    this.notes = '';
    this.exercises = [createExerciseRow()];
    this.persist();
    this.startTimer();
  };

  togglePause = () => {
    this.running = !this.running;
    this.persist();

    if (this.running) {
      this.startTimer();
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

  finishWorkout = () => {
    this.stopTimer();
    this.isActive = false;
    this.running = false;
    this.persist();
  };

  cancelWorkout = () => {
    this.stopTimer();
    this.isActive = false;
    this.running = false;
    this.elapsed = 0;
    this.notes = '';
    this.exercises = [createExerciseRow()];
    this.persist();
  };
}

export const activeWorkoutStore = new ActiveWorkoutStore();
