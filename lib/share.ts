type ShareEventData = { id: string; title: string } | null;

type ShareModalState = {
  isOpen: boolean;
  event: ShareEventData;
};

type Listener = (state: ShareModalState) => void;

let state: ShareModalState = { isOpen: false, event: null };
const listeners = new Set<Listener>();

export const shareEvent = (event: { id: string; title: string }) => {
  state = { isOpen: true, event };
  listeners.forEach((l) => l(state));
};

export const closeShareModal = () => {
  state = { isOpen: false, event: null };
  listeners.forEach((l) => l(state));
};

export const subscribeShareModal = (listener: Listener) => {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
};
