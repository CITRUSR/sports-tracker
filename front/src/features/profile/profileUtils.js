export function calculateAge(dateOfBirth) {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

export function ageToDateOfBirth(age) {
  const today = new Date();
  return new Date(today.getFullYear() - age, today.getMonth(), today.getDate()).toISOString();
}

export function mapProfileFromApi(dto) {
  return {
    name: dto.name,
    weight: Number(dto.currentWeight),
    age: calculateAge(dto.dateOfBirth),
    dateOfBirth: dto.dateOfBirth,
  };
}
