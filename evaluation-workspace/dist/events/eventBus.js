"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventBus = void 0;
const node_events_1 = require("node:events");
class InMemoryEventBus {
    emitter = new node_events_1.EventEmitter();
    subscribe(event, listener) {
        this.emitter.on(event, listener);
    }
    publish(event, payload) {
        this.emitter.emit(event, payload);
    }
}
exports.InMemoryEventBus = InMemoryEventBus;
