import { MouseEvent, useCallback } from 'react';

const usePreventClickOutside = () =>
  useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

export default usePreventClickOutside;
