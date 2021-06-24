
export type Listener<T> = (value: T)=> void
export type UnsubscribeFunc = ()=> void; 

export default class Event<T> {

    listeners = new Set<Listener<T>>();

    subscribe(listener: Listener<T>): UnsubscribeFunc {
        this.listeners.add(listener);

        return ()=> {
            this.listeners.delete(listener);
        }
    }

    unsubscribe(listener: Listener<T>) {
        this.listeners.delete(listener);
    }

    invoke(value: T) {
        this.listeners.forEach(fn => fn(value));
    }

    unsubscribeAll() {
        this.listeners.clear();
    }
}