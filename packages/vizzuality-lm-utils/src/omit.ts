export const omit = (key: string, obj: any): any => {
  const { [key]: omitted, ...rest } = obj;
  return rest;
};

export default omit;
