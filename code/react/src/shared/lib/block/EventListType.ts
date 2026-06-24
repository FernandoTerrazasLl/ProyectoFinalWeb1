type DomEventHandler = (event: Event) => void;
export type EventListType = Partial<Record<keyof HTMLElementEventMap, DomEventHandler>>;
