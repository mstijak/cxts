import { VDOM } from "./VDOM";
import { SubscriberList } from "../util/SubscriberList";

let isBatching = 0;

interface UpdateInfo {
  id: number;
  pending: number;
  finished: number;
  done: boolean;
  timer?: number;
  complete: (success?: boolean) => void;
}

let promiseSubscribers = new SubscriberList<UpdateInfo>();

export function batchUpdates(callback: () => void) {
  if (VDOM.DOM.unstable_batchedUpdates)
    VDOM.DOM.unstable_batchedUpdates(() => {
      isBatching++;
      try {
        callback();
      } finally {
        isBatching--;
      }
    });
  else callback();
}

export function isBatchingUpdates() {
  return isBatching > 0;
}

export function notifyBatchedUpdateStarting() {
  promiseSubscribers.execute((x) => {
    x.pending++;
  });
}

export function notifyBatchedUpdateCompleted() {
  promiseSubscribers.execute((x) => {
    x.finished++;
    if (x.finished >= x.pending) x.complete(true);
  });
}

let updateId = 0;

export function batchUpdatesAndNotify(
  callback: () => void,
  notifyCallback: (success?: boolean) => void,
  timeout = 1000
) {
  let unsubscribe: () => void;
  let update: UpdateInfo = {
    id: ++updateId,
    pending: 0,
    finished: 0,
    done: false,
    complete: function (success) {
      if (!this.done) {
        this.done = true;
        if (this.timer) clearInterval(this.timer);
        unsubscribe();
        notifyCallback(!!success);
      }
    },
  };
  unsubscribe = promiseSubscribers.subscribe(update);
  batchUpdates(callback);

  if (update.pending <= update.finished) update.complete(true);
  else update.timer = setTimeout(update.complete, timeout);
}
