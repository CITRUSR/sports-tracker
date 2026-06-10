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
    return [];
  }

  const groups = new Map();

  entries.forEach((entry) => {
    const key = `${entry.exerciseId}|${entry.weight}|${entry.repetitions}`;

    if (!groups.has(key)) {
      groups.set(key, {
        clientKey: entry.entryId,
        entryIds: [],
        exerciseId: String(entry.exerciseId),
        sets: 0,
        reps: entry.repetitions ?? 10,
        weight: entry.weight ?? 0,
      });
    }

    const group = groups.get(key);
    group.entryIds.push(entry.entryId);
    group.sets += 1;
  });

  return Array.from(groups.values());
}

function toEntryPayload(row) {
  return {
    exerciseId: Number(row.exerciseId),
    weight: Number(row.weight),
    repetitions: Number(row.reps),
  };
}

export function validateExerciseRow(row) {
  const errors = {};

  if (!row.exerciseId) {
    errors.exerciseId = 'Выберите упражнение';
  }

  if (!row.sets || row.sets < 1) {
    errors.sets = 'Мин. 1';
  }

  if (!row.reps || row.reps < 1) {
    errors.reps = 'Мин. 1';
  }

  if (row.weight != null && row.weight < 0) {
    errors.weight = '≥ 0';
  }

  return errors;
}

export async function createExerciseGroup(workoutId, row, api) {
  const payload = toEntryPayload(row);

  for (let setIndex = 0; setIndex < row.sets; setIndex += 1) {
    await api.addExerciseEntry(workoutId, payload);
  }
}

export async function updateExerciseGroup(workoutId, row, api) {
  const payload = toEntryPayload(row);
  const entryIds = [...row.entryIds];

  for (let index = 0; index < row.sets; index += 1) {
    if (index < entryIds.length) {
      await api.updateExerciseEntry(workoutId, entryIds[index], payload);
    } else {
      await api.addExerciseEntry(workoutId, payload);
    }
  }

  for (let index = row.sets; index < entryIds.length; index += 1) {
    await api.removeExerciseEntry(workoutId, entryIds[index]);
  }
}

export async function deleteExerciseGroup(workoutId, entryIds, api) {
  for (const entryId of entryIds) {
    await api.removeExerciseEntry(workoutId, entryId);
  }
}

export function expandExerciseRowsToEntries(exercises) {
  const entries = [];

  exercises.forEach((exercise) => {
    const payload = toEntryPayload(exercise);

    for (let setIndex = 0; setIndex < exercise.sets; setIndex += 1) {
      entries.push(payload);
    }
  });

  return entries;
}
