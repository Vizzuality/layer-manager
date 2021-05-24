export const omit = (key: string, obj: Record<string, unknown>): Record<string, unknown> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: omitted, ...rest } = obj;
  return rest;
};

export default omit;
