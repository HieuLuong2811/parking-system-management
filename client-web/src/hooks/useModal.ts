import { useCallback, useState } from 'react';

type ModalHook = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
};

export default function useModal(initialState = false): ModalHook {
  const [open, setOpen] = useState(initialState);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const toggleModal = useCallback(() => setOpen((value) => !value), []);

  return { open, openModal, closeModal, toggleModal };
}
