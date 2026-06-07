export function getDefaultDateFrom() {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date.toISOString().split('T')[0];
}

export function getDefaultDateTo() {
  return new Date().toISOString().split('T')[0];
}
