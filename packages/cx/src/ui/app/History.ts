import { Url } from "./Url";
import { batchUpdatesAndNotify } from "../batchUpdates";
import { SubscriberList } from "../../util/SubscriberList";
import { View } from "../../data/View";

let last = 0,
  next = 1,
  transitions = {},
  subscribers: SubscriberList | null = null,
  reload = false,
  navigateConfirmationCallback:
    | null
    | ((state: any) => boolean | Promise<boolean>) = null,
  permanentNavigateConfirmation = false;

export class History {
  static store: View;
  static urlBinding: string;
  static hashBinding?: string;

  static connect(store: View, urlBinding: string, hashBinding?: string) {
    this.store = store;
    this.urlBinding = urlBinding;
    this.hashBinding = hashBinding;
    this.updateStore();
    window.onpopstate = () => {
      this.updateStore();
    };
  }

  static pushState(state, title, url: string) {
    return this.confirmAndNavigate(state, title, url);
  }

  static replaceState(state, title, url: string) {
    return this.navigate(state, title, url, true);
  }

  static reloadOnNextChange() {
    reload = true;
  }

  static addNavigateConfirmation(callback, permanent = false) {
    navigateConfirmationCallback = callback;
    permanentNavigateConfirmation = permanent;
  }

  static confirm(continueCallback, state) {
    if (!navigateConfirmationCallback) return continueCallback();

    let result = navigateConfirmationCallback(state);
    Promise.resolve(result).then((value) => {
      if (value) {
        if (!permanentNavigateConfirmation) navigateConfirmationCallback = null;
        continueCallback();
      }
    });

    return false;
  }

  static confirmAndNavigate(state, title, url: string, replace = false) {
    return this.confirm(() => this.navigate(state, title, url, replace), url);
  }

  static navigate(state, title, url: string, replace = false) {
    url = Url.resolve(url);

    if (!window.history.pushState || reload) {
      window.location[replace ? "replace" : "assign"](url);
      return true;
    }

    let transition,
      changed = false;
    batchUpdatesAndNotify(
      () => {
        changed = this.updateStore(url);
        if (changed)
          transitions[++last] = transition = {
            url,
            state,
            title,
            replace,
          };
      },
      () => {
        if (transition) transition.completed = true;

        //update history once the page is rendered and the title is set
        while (transitions[next] && transitions[next].completed) {
          let tr = transitions[next];
          delete transitions[next];
          next++;
          let op = tr.replace ? "replaceState" : "pushState";
          window.history[op](tr.state, tr.title, tr.url);
          if (subscribers) subscribers.notify(tr.url, op);
        }
      }
    );

    return changed;
  }

  static updateStore(href?: string) {
    let url = Url.unresolve(href || document.location.href),
      hash = null;
    let hashIndex = url.indexOf("#");
    if (hashIndex !== -1) {
      hash = url.substring(hashIndex);
      url = url.substring(0, hashIndex);
    }
    if (this.hashBinding) this.store.set(this.hashBinding, hash);
    return this.store.set(this.urlBinding, url);
  }

  static subscribe(callback) {
    if (!subscribers) subscribers = new SubscriberList();
    return subscribers.subscribe(callback);
  }
}
