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
