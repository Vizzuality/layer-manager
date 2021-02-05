export const isEmpty = obj => {
  if (!obj || !obj.constructor || obj.constructor !== Object) return true;
  if (Object.keys(obj).length === 0) return true;

  return false;
};
