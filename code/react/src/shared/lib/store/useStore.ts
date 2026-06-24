import { useEffect, useState } from "react";

type ReadableStore<State> = {
  getState(): State;
  subscribe(listener: (state: State) => void): () => void;
};

export function useStore<State>(store: ReadableStore<State>): State {
  const [state, setState] = useState<State>(store.getState());

  useEffect(() => store.subscribe(setState), [store]);

  return state;
}
