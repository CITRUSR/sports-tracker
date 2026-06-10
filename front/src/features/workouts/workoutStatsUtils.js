function parseTimeToMinutes(timeStr) {
  const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
  return hours * 60 + minutes + Math.round(seconds / 60);
}

export function getWorkoutDurationMinutes(workout) {
  if (!workout.timeEnd) {
    return 0;
  }

  let diffMinutes = parseTimeToMinutes(workout.timeEnd) - parseTimeToMinutes(workout.timeStart);

  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  return diffMinutes;
}

export function getExerciseEntryVolume(exercise) {
  return (exercise.weight ?? 0) * (exercise.repetitions ?? 0);
}
