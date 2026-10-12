export function studyProgressValue(value: number, max: number) {
  const limit = Number.isFinite(max) && max > 0 ? max : 1;
  const completed = Number.isFinite(value) ? Math.min(limit, Math.max(0, value)) : 0;
  return { max: limit, value: completed, ratio: completed / limit };
}
