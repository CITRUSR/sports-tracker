function parseTimeToMinutes(timeStr) {
  const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
  return hours * 60 + minutes + Math.round(seconds / 60);
}

export function formatWorkoutDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getWorkoutExerciseNames(workout) {
  const names = [...new Set(workout.exercises.map((exercise) => exercise.name))];

  return names.join(', ') || 'Без упражнений';
}

export function formatWorkoutTime(timeStr) {
  if (!timeStr) {
    return '—';
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function groupWorkoutExercises(exercises = []) {
  const groups = new Map();

  exercises.forEach((exercise) => {
    const key = `${exercise.id}|${exercise.weight}|${exercise.repetitions}`;

    if (!groups.has(key)) {
      groups.set(key, {
        name: exercise.name,
        sets: 0,
        reps: exercise.repetitions ?? 0,
        weight: exercise.weight ?? 0,
      });
    }

    groups.get(key).sets += 1;
  });

  return Array.from(groups.values());
}

export function getWorkoutTotalSets(exercises = []) {
  return exercises.length;
}

export function getWorkoutTotalVolume(exercises = []) {
  return exercises.reduce(
    (total, exercise) => total + (exercise.repetitions ?? 0) * (exercise.weight ?? 0),
    0,
  );
}

export function getWorkoutDurationLabel(workout) {
  if (!workout.timeEnd) {
    return 'В процессе';
  }

  let diffMinutes = parseTimeToMinutes(workout.timeEnd) - parseTimeToMinutes(workout.timeStart);

  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} мин`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return minutes ? `${hours} ч ${minutes} мин` : `${hours} ч`;
}
