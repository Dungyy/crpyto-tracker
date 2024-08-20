import debounce from 'lodash.debounce';

export const createDebouncedDispatch = (callback, delay) => {
  return debounce(callback, delay);
};
