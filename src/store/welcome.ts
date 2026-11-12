import { useSyncExternalStore } from 'react';

/** Whether the hello animation has finished for this app launch. Screens wait on it to animate in. */
let done = false;
const listeners = new Set<() => void>();

export function finishWelcome(): void {
  if (done) return;
  done = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => done;

export function useWelcomeDone(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
