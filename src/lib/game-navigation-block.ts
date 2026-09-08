'use client';

import { useSyncExternalStore } from 'react';

let isBlocked = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return isBlocked;
}

function getServerSnapshot() {
  return false;
}

export function setGameNavigationBlocked(blocked: boolean) {
  if (isBlocked === blocked) return;
  isBlocked = blocked;
  listeners.forEach((listener) => listener());
}

export function useGameNavigationBlocked() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
