import React from 'react';
import { findNodeHandle } from 'react-native';

import TVForceFocus from './NativeTVForceFocus';

export type TVFocusTargetRef = React.RefObject<any>;
export type TVFocusTarget = TVFocusTargetRef | any | null | undefined;

function isRefObject(target: TVFocusTarget): target is TVFocusTargetRef {
  return (
    target != null &&
    typeof target === 'object' &&
    Object.prototype.hasOwnProperty.call(target, 'current')
  );
}

export default function requestTVFocus(target: TVFocusTarget): boolean {
  const node = isRefObject(target) ? target.current : target;

  if (!node) {
    return false;
  }

  const targetTag = findNodeHandle(node);

  if (targetTag == null) {
    return false;
  }

  TVForceFocus.requestFocus(targetTag);
  return true;
}
