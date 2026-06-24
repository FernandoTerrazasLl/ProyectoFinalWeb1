export class Store<State extends object> {
  private state: State;
  private listeners = new Set<(state: State) => void>();

  constructor(initialState: State) {
    this.state = initialState;
  }

  getState(): State {
    return this.state;
  }

  setState(partial: Partial<State>) {
    this.state = { ...this.state, ...partial };
    const currentListeners = new Set(this.listeners);
    currentListeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: State) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
