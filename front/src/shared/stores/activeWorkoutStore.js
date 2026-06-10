import { makeAutoObservable } from 'mobx';
import api from '../../features/api/api';
import {
  calculateElapsedSeconds,
  createExerciseGroup,
  deleteExerciseGroup,
  groupEntriesToExerciseRows,
  updateExerciseGroup,
} from '../../features/activeWorkout/activeWorkoutSync';
import { createExerciseRow, getTodayDateString } from '../../features/activeWorkout/activeWorkoutUtils';

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
  exercises = [];
  draftExercise = null;
  _timerId = null;

  constructor() {
    makeAutoObservable(this);
  }

  applyActiveWorkout = (activeWorkout) => {
    this.workoutId = activeWorkout.id;
    this.isActive = true;
    this.date = activeWorkout.date;
    this.notes = activeWorkout.comment ?? '';
    this.running = !activeWorkout.isPaused;
    this.elapsed = calculateElapsedSeconds(activeWorkout);
    this.exercises = groupEntriesToExerciseRows(activeWorkout.entries);
    this.syncError = '';
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
    this.exercises = [];
    this.draftExercise = null;
  };

  startTimer = () => {
    if (this._timerId) {
      return;
    }

    this._timerId = setInterval(() => {
      if (this.running) {
        this.elapsed += 1;
      }
    }, 1000);
  };

  stopTimer = () => {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  };

  refreshFromServer = async () => {
    const activeWorkout = await api.getActiveWorkout();

    if (!activeWorkout) {
      this.reset();
      return null;
    }

    this.applyActiveWorkout(activeWorkout);

    if (this.running) {
      this.startTimer();
    } else {
      this.stopTimer();
    }

    return activeWorkout;
  };

  hydrateFromServer = async () => {
    this.isHydrating = true;
    this.syncError = '';

    try {
      const activeWorkout = await this.refreshFromServer();
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

      this.applyActiveWorkout(activeWorkout);
      this.elapsed = 0;
      this.exercises = [];
      this.draftExercise = null;
      this.notes = '';

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

      await this.refreshFromServer();
    } catch {
      this.syncError = 'Не удалось изменить состояние паузы';
    } finally {
      this.isActionPending = false;
    }
  };

  setNotes = (notes) => {
    this.notes = notes;
  };

  beginDraftExercise = () => {
    if (this.draftExercise) {
      return;
    }

    this.draftExercise = createExerciseRow();
  };

  cancelDraftExercise = () => {
    this.draftExercise = null;
  };

  updateDraftExercise = (field, value) => {
    if (!this.draftExercise) {
      return;
    }

    this.draftExercise = { ...this.draftExercise, [field]: value };
  };

  updateExercise = (clientKey, field, value) => {
    this.exercises = this.exercises.map((exercise) =>
      exercise.clientKey === clientKey ? { ...exercise, [field]: value } : exercise,
    );
  };

  saveDraftExercise = async () => {
    if (!this.workoutId || !this.draftExercise) {
      return;
    }

    this.isActionPending = true;
    this.syncError = '';

    try {
      await createExerciseGroup(this.workoutId, this.draftExercise, api);
      this.draftExercise = null;
      await this.refreshFromServer();
    } catch {
      this.syncError = 'Не удалось сохранить упражнение';
      throw new Error('Не удалось сохранить упражнение');
    } finally {
      this.isActionPending = false;
    }
  };

  saveExercise = async (clientKey) => {
    if (!this.workoutId) {
      return;
    }

    const exercise = this.exercises.find((item) => item.clientKey === clientKey);

    if (!exercise) {
      return;
    }

    this.isActionPending = true;
    this.syncError = '';

    try {
      await updateExerciseGroup(this.workoutId, exercise, api);
      await this.refreshFromServer();
    } catch {
      this.syncError = 'Не удалось обновить упражнение';
      throw new Error('Не удалось обновить упражнение');
    } finally {
      this.isActionPending = false;
    }
  };

  removeExercise = async (clientKey) => {
    if (!this.workoutId) {
      return;
    }

    const exercise = this.exercises.find((item) => item.clientKey === clientKey);

    if (!exercise) {
      return;
    }

    this.isActionPending = true;
    this.syncError = '';

    try {
      await deleteExerciseGroup(this.workoutId, exercise.entryIds, api);
      await this.refreshFromServer();
    } catch {
      this.syncError = 'Не удалось удалить упражнение';
      throw new Error('Не удалось удалить упражнение');
    } finally {
      this.isActionPending = false;
    }
  };

  finishWorkout = async () => {
    if (!this.workoutId) {
      throw new Error('Active workout not found');
    }

    this.isActionPending = true;
    this.syncError = '';

    try {
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
