/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { LitElement } from 'lit-element';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NoShadowMixin = <T extends new (...args: any[]) => LitElement>(base: T) => {
  class NoShadow extends base {
    createRenderRoot() {
      return this;
    }
  }
  return NoShadow;
};