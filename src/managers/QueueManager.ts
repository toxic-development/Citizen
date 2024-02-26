import { QueuedItem } from "../types/rcon.interface";

/**
 * A simple queue that limits the number of concurrent promises
 * @class PromiseQueue
 * @example
 * const queue = new PromiseQueue(5);
 */
export class PromiseQueue {
    private queue: QueuedItem<any>[];
    private pendingPromiseCount: number;
    public maxConcurrent: number;

    paused = false;

    constructor(maxConcurrent: number) {
        this.queue = [];
        this.pendingPromiseCount = 0;
        this.maxConcurrent = maxConcurrent;
    }

    public async add<T>(promiseGenerator: () => Promise<T>) {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ promiseGenerator, resolve, reject });
            this.dequeue();
        })
    }

    public pause() {
        this.paused = true;
    }

    public resume() {
        this.paused = false;
        this.dequeue();
    }

    private async dequeue() {
        if (this.paused) return;
        if (this.pendingPromiseCount >= this.maxConcurrent) return;

        const item = this.queue.shift();

        if (!item) return;

        this.pendingPromiseCount++;

        try {
            const value = await item.promiseGenerator();
            item.resolve(value);
        } catch (err) {
            item.reject(err);
        } finally {
            this.pendingPromiseCount--;
            this.dequeue();
        }
    }
}