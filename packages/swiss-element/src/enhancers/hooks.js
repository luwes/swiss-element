export {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState
} from '../../node_modules/augmentor/esm/index.js';

import augmentor, {
  useEffect as effect
} from '../../node_modules/augmentor/esm/index.js';
import { CONNECTED, DISCONNECTED } from '../create-element.js';

let element;

function hooks(createElement) {
  return options => {
    const el = createElement(options);
    const { component } = options;

    const requestUpdate = augmentor(function() {
      element = el;
      const html = component.call(el, el);
      return el.render(html);
    });

    el.requestUpdate = requestUpdate;
    return el;
  };
}

export function useEffect(fn, inputs = []) {
  const args = [fn];
  if (inputs)
    // if the inputs is an empty array
    // observe the returned element for connect/disconnect events
    // and invoke effects/cleanup on these events only
    args.push(inputs.length ? inputs : lifecycleHandler);
  return effect.apply(null, args);
}

function lifecycleHandler($) {
  const handler = { handleEvent, onconnected, ondisconnected, $, _: null };
  element.addEventListener(CONNECTED, handler, false);
  element.addEventListener(DISCONNECTED, handler, false);
}

function handleEvent(e) {
  this['on' + e.type]();
}

function onconnected() {
  ondisconnected.call(this);
  this._ = this.$();
}

function ondisconnected() {
  const { _ } = this;
  this._ = null;
  if (_) _();
}

export default hooks;