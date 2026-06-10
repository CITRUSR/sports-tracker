export function createExerciseRow() {
  return {
    clientKey: `draft-${Date.now()}`,
    entryIds: [],
    exerciseId: '',
    sets: 3,
    reps: 10,
    weight: 0,
  };
}

export function formatElapsed(seconds) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
}

export function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

export function formatWorkoutDateRu(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
