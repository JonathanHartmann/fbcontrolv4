/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export type RouteListener = (relUrl: string) => void;
export type Unsubscribe = () => void;
export class Router {
  private listeners: RouteListener[] = [];
  private rootPath = '/';
  private routeHistory: string[] = [];

  constructor() {
    window.onpopstate = () => this.notifyListeners();
    document.addEventListener('click', (event: MouseEvent) => {
      if (!this.shouldIgnoreEvent(event)) {
        const anchor = this.getAnchor(event); // a-Element ermitteln
        if (anchor && !this.shouldIgnoreAnchor(anchor)) {
          // nur interne Links
          event.preventDefault();
          this.navigate(anchor.pathname + anchor.search + anchor.hash);
        }
      }
    });
    if (document.getElementsByTagName('base').length > 0) {
      this.rootPath = document.getElementsByTagName('base')[0].getAttribute('href')!;
    }
    this.routeHistory.push(location.pathname + location.search);
  }

  subscribe(listener: RouteListener): Unsubscribe {
    this.listeners.push(listener);
    return () => {
      // unsubscribe function
      this.listeners = this.listeners.filter(other => other !== listener);
    };
  }

  navigate(relUrl: string, pushHistory = true) {
    history.pushState(null, '', this.withRootPath(relUrl));
    if(pushHistory) this.routeHistory.push(relUrl);
    this.notifyListeners();
  }

  back() {
    const actualIndex = this.routeHistory.length - 1;
    if(this.routeHistory[actualIndex - 1]) {
      const backRoute = this.routeHistory[actualIndex - 1];
      this.routeHistory.pop();
      this.navigate(backRoute, false);
    }
  }

  // e. g. 'user/sign-in' (without leading slash)
  getPath() {
    return this.withoutRootPath(location.pathname);
  }

  private notifyListeners() {
    const path = this.getPath();
    this.listeners.forEach(listener => listener(path));
  }

  private shouldIgnoreEvent(event: MouseEvent) {
    return (
      event.defaultPrevented || event.button !== 0 || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
    );
  }

  private getAnchor(event: MouseEvent): HTMLAnchorElement {
    for (const target of event.composedPath ? event.composedPath() : []) {
      if (this.isAnchor(target as HTMLElement)) {
        return target as HTMLAnchorElement;
      }
    }
    let elem: any = event.target;
    while (elem && !this.isAnchor(elem)) {
      elem = elem.parentNode;
    }
    return elem && this.isAnchor(elem) ? elem : null;
  }

  private isAnchor(elem: HTMLElement) {
    return elem.nodeName && elem.nodeName.toLowerCase() === 'a';
  }

  private shouldIgnoreAnchor(anchor: HTMLAnchorElement) {
    if (anchor.target && anchor.target.toLowerCase() !== '_self') {
      return true; // it has a non-default target
    }

    if (anchor.hasAttribute('download')) {
      return true;
    }

    if (this.withRootPath(anchor.pathname) === window.location.pathname && anchor.hash !== '') {
      return true; // target URL is a fragment on the current page
    }

    const origin = anchor.origin || this.getAnchorOrigin(anchor);
    if (origin !== window.location.origin) {
      return true; // target is external to the app
    }

    return false;
  }

  private getAnchorOrigin(anchor: HTMLAnchorElement) {
    const port = anchor.port;
    const protocol = anchor.protocol;
    const defaultHttp = protocol === 'http:' && port === '80';
    const defaultHttps = protocol === 'https:' && port === '443';
    const host = defaultHttp || defaultHttps ? anchor.hostname : anchor.host;
    return `${protocol}//${host}`;
  }

  private withRootPath(relURL: string) {
    if (relURL.startsWith(this.rootPath)) {
      return relURL;
    } else {
      return this.rootPath + (relURL.startsWith('/') ? relURL.substring(1) : relURL);
    }
  }

  private withoutRootPath(relURL: string) {
    if (relURL.startsWith(this.rootPath)) {
      return relURL.substring(this.rootPath.length);
    } else {
      return relURL;
    }
  }
}

export const router = new Router();