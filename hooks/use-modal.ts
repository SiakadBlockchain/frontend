'use client';

import { useState, useCallback } from 'react';
import { ModalState } from '@/types';

export function useModal() {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
  });

  const open = useCallback(
    (data?: any, type: ModalState['type'] = 'view') => {
      setModal({
        isOpen: true,
        data,
        type,
      });
    },
    []
  );

  const close = useCallback(() => {
    setModal({
      isOpen: false,
      data: undefined,
      type: undefined,
    });
  }, []);

  const update = useCallback((data: any) => {
    setModal((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  return {
    ...modal,
    open,
    close,
    update,
  };
}
