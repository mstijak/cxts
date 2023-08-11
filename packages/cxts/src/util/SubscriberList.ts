export class SubscriberList<S = any> {
  subscriptions: Record<string, S>;
  freeSlots: string[];
  nextSlot: number;
  subscriptionCount: number;

  constructor() {
    this.clear();
  }

  getSlot(): string {
    if (this.freeSlots.length > 0) return this.freeSlots.pop()!;

    let slot = String(this.nextSlot++);
    return slot;
  }

  recycle(slot: string, callback: S) {
    if (this.subscriptions[slot] === callback) {
      this.freeSlots.push(slot);
      delete this.subscriptions[slot];
      this.subscriptionCount--;
    }
  }

  subscribe(callback: S) {
    let slot = this.getSlot();
    this.subscriptions[slot] = callback;
    this.subscriptionCount++;
    return () => {
      this.recycle(slot, callback);
    };
  }

  clear() {
    this.subscriptions = {};
    this.freeSlots = [];
    this.nextSlot = 1;
    this.subscriptionCount = 0;
  }

  isEmpty() {
    return this.subscriptionCount == 0;
  }

  getSubscribers() {
    let result: S[] = [];
    for (let key in this.subscriptions) result.push(this.subscriptions[key]);
    return result;
  }

  notify(...args) {
    for (let key in this.subscriptions) {
      let s: any = this.subscriptions[key];
      s(...args);
    }
  }

  execute(callback: (s: S) => void) {
    for (let key in this.subscriptions) callback(this.subscriptions[key]);
  }
}
