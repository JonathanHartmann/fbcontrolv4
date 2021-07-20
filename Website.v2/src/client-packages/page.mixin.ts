/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { NoShadowMixin } from './noshadow.mixin';
import { connect } from 'pwa-helpers';
import { store } from '../redux/store';
import { LitElement } from 'lit-element';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PageMixin = <T extends new (...args: any[]) => LitElement>(base: T) => {
  class PageMixin extends connect(store)(NoShadowMixin(base)) {

    createRenderRoot() {
      return this;
    }
      
  }
  return PageMixin;
};