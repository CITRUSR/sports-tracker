import { createExerciseRow } from './activeWorkoutUtils';

function parseTimeOnly(timeStr) {
  const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
  return { hours, minutes, seconds };
}

// Backend stores workout date/time in UTC (see WorkoutService.BeginAsync).
function toUtcTimestamp(dateStr, timeStr) {
  const { hours, minutes, seconds } = parseTimeOnly(timeStr);
  const [year, month, day] = dateStr.split('-').map(Number);

  return Date.UTC(year, month - 1, day, hours, minutes, seconds);
}

export function calculateElapsedSeconds({ date, timeStart, pauses = [], isPaused }) {
  const start = toUtcTimestamp(date, timeStart);
  const now = Date.now();
  let elapsedMs = now - start;

  pauses.forEach((pause) => {
    const pauseStart = toUtcTimestamp(date, pause.startTime);
    const pauseEnd = pause.endTime
      ? toUtcTimestamp(date, pause.endTime)
      : isPaused
        ? now
        : pauseStart;

    if (pauseEnd > pauseStart) {
      elapsedMs -= pauseEnd - pauseStart;
    }
  });

  return Math.max(0, Math.floor(elapsedMs / 1000));
}

export function groupEntriesToExerciseRows(entries) {
  if (!entries?.length) {
    return [createExerciseRow()];
  }

  const groups = new Map();

  entries.forEach((entry) => {
    const key = `${entry.exerciseId}|${entry.weight}|${entry.repetitions}`;

    if (!groups.has(key)) {
      groups.set(key, {
        id: entry.entryId,
        exerciseId: String(entry.exerciseId),
        sets: 0,
        reps: entry.repetitions ?? 10,
        weight: entry.weight ?? 0,
      });
    }

    const group = groups.get(key);
    group.sets += 1;
  });

  return Array.from(groups.values());
}

export function expandExerciseRowsToEntries(exercises) {
  const entries = [];

  exercises.forEach((exercise) => {
    const sets = Number(exercise.sets);

    for (let setIndex = 0; setIndex < sets; setIndex += 1) {
      entries.push({
        exerciseId: Number(exercise.exerciseId),
        weight: Number(exercise.weight),
        repetitions: Number(exercise.reps),
      });
    }
  });

  return entries;
}
