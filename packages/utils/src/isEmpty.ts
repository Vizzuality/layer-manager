export const isEmpty = (obj: any): boolean => {
  if (Array.isArray(obj)) {
    if (!obj.length) return true;
    return false;
  }

  if (!obj || !obj.constructor || obj.constructor !== Object) return true;
  if (Object.keys(obj).length === 0) return true;

  return false;
};

export default isEmpty;
