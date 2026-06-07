import { EventEmitter } from "node:events";
import type { EventPayloads } from "../types";

type EventName = keyof EventPayloads;

export class InMemoryEventBus {
    private readonly emitter = new EventEmitter();

    subscribe<TEvent extends EventName>(
        event: TEvent,
        listener: (payload: EventPayloads[TEvent]) => void
    ): void {
        this.emitter.on(event, listener as (payload: unknown) => void);
    }

    publish<TEvent extends EventName>(
        event: TEvent,
        payload: EventPayloads[TEvent]
    ): void {
        this.emitter.emit(event, payload);
    }
}
