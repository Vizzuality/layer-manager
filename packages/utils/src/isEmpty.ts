export const isEmpty = (obj: Record<string, unknown>): boolean => {
  if (!obj || !obj.constructor || obj.constructor !== Object) return true;
  if (Object.keys(obj).length === 0) return true;

  return false;
};

export default isEmpty;
