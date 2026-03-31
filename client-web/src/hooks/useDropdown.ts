import { RefObject, useEffect, useRef, useState } from 'react';

type DropdownHook = {
  containerRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  toggle: () => void;
  close: () => void;
  openDropdown: () => void;
};

export default function useDropdown(initialState = false): DropdownHook {
  const [open, setOpen] = useState(initialState);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  const openDropdown = () => setOpen(true);
  const toggle = () => setOpen((previous) => !previous);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return { containerRef, open, toggle, close, openDropdown };
}
