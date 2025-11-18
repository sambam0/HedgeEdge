import { useState, useEffect, useRef } from 'react';

type FlashType = 'gain' | 'loss' | 'none';

export function usePriceFlash(value: number | undefined) {
  const [flashType, setFlashType] = useState<FlashType>('none');
  const previousValue = useRef<number | undefined>(value);

  useEffect(() => {
    if (value === undefined || previousValue.current === undefined) {
      previousValue.current = value;
      return;
    }

    if (value > previousValue.current) {
      setFlashType('gain');
    } else if (value < previousValue.current) {
      setFlashType('loss');
    }

    previousValue.current = value;

    // Clear flash after 500ms
    const timeout = setTimeout(() => setFlashType('none'), 500);
    return () => clearTimeout(timeout);
  }, [value]);

  return flashType;
}

export function getFlashClassName(flashType: FlashType): string {
  switch (flashType) {
    case 'gain':
      return 'animate-flash-gain';
    case 'loss':
      return 'animate-flash-loss';
    default:
      return '';
  }
}
