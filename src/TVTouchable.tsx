import React, { useCallback, useRef } from 'react';
import * as ReactNative from 'react-native';
import {
  findNodeHandle,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import TVForceFocus from './NativeTVForceFocus';

export type TVFocusTargetRef = React.RefObject<any>;

export type TVTouchableProps = TouchableOpacityProps & {
  forceFocusUp?: TVFocusTargetRef | null;
  forceFocusDown?: TVFocusTargetRef | null;
  forceFocusLeft?: TVFocusTargetRef | null;
  forceFocusRight?: TVFocusTargetRef | null;
};

type TouchableOpacityRef = React.ElementRef<typeof TouchableOpacity>;
type TVRemoteDirection = 'up' | 'down' | 'left' | 'right';
type TVRemoteEvent = {
  eventType?: string;
  eventKeyAction?: number | string;
};
type ReactNativeWithTVEventHandler = typeof ReactNative & {
  useTVEventHandler?: (handler: (event: TVRemoteEvent) => void) => void;
};
type ForceFocusPropName =
  | 'forceFocusUp'
  | 'forceFocusDown'
  | 'forceFocusLeft'
  | 'forceFocusRight';

const directionToProp: Record<TVRemoteDirection, ForceFocusPropName> = {
  up: 'forceFocusUp',
  down: 'forceFocusDown',
  left: 'forceFocusLeft',
  right: 'forceFocusRight',
};

const TV_KEY_DOWN = 0;
const TV_KEY_UP = 1;
const FOCUS_EVENT_GUARD_MS = 140;
const DUPLICATE_FORCE_GUARD_MS = 140;
const useTVEventHandlerCompat = (
  ReactNative as ReactNativeWithTVEventHandler
).useTVEventHandler;

function getEventKeyAction(event: TVRemoteEvent) {
  if (typeof event.eventKeyAction === 'number') {
    return event.eventKeyAction;
  }

  if (typeof event.eventKeyAction === 'string') {
    const parsedAction = Number(event.eventKeyAction);

    return Number.isNaN(parsedAction) ? undefined : parsedAction;
  }

  return undefined;
}

function getRemoteDirection(event: TVRemoteEvent) {
  const eventType = event.eventType;

  if (
    eventType !== 'up' &&
    eventType !== 'down' &&
    eventType !== 'left' &&
    eventType !== 'right'
  ) {
    return undefined;
  }

  return eventType;
}

function focusRef(targetRef?: TVFocusTargetRef | null) {
  const target = targetRef?.current;

  if (!target) {
    return false;
  }

  const targetTag = findNodeHandle(target);

  if (targetTag == null) {
    return false;
  }

  TVForceFocus.requestFocus(targetTag);
  return true;
}

const TVTouchable = React.forwardRef<TouchableOpacityRef, TVTouchableProps>(
  (
    {
      forceFocusUp,
      forceFocusDown,
      forceFocusLeft,
      forceFocusRight,
      onBlur,
      onFocus,
      ...touchableProps
    },
    forwardedRef
  ) => {
    const isFocusedRef = useRef(false);
    const focusedAtRef = useRef(0);
    const lastForcedAtRef = useRef(0);

    const setRef = useCallback(
      (node: TouchableOpacityRef | null) => {
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
          return;
        }

        if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<TouchableOpacityRef | null>
          ).current = node;
        }
      },
      [forwardedRef]
    );

    const handleFocus: NonNullable<TouchableOpacityProps['onFocus']> =
      useCallback(
        (event) => {
          isFocusedRef.current = true;
          focusedAtRef.current = Date.now();
          onFocus?.(event);
        },
        [onFocus]
      );

    const handleBlur: NonNullable<TouchableOpacityProps['onBlur']> =
      useCallback(
        (event) => {
          isFocusedRef.current = false;
          onBlur?.(event);
        },
        [onBlur]
      );

    useTVEventHandlerCompat?.(
      useCallback(
        (event: TVRemoteEvent) => {
          if (!isFocusedRef.current) {
            return;
          }

          const eventDirection = getRemoteDirection(event);

          if (!eventDirection) {
            return;
          }

          const eventKeyAction = getEventKeyAction(event);
          const now = Date.now();
          const focusAge = now - focusedAtRef.current;

          if (focusAge < FOCUS_EVENT_GUARD_MS) {
            return;
          }

          if (
            eventKeyAction != null &&
            eventKeyAction !== TV_KEY_DOWN &&
            eventKeyAction !== TV_KEY_UP
          ) {
            return;
          }

          if (now - lastForcedAtRef.current < DUPLICATE_FORCE_GUARD_MS) {
            return;
          }

          const targetRefs: Record<
            ForceFocusPropName,
            TVFocusTargetRef | null | undefined
          > = {
            forceFocusUp,
            forceFocusDown,
            forceFocusLeft,
            forceFocusRight,
          };

          if (focusRef(targetRefs[directionToProp[eventDirection]])) {
            lastForcedAtRef.current = now;
          }
        },
        [forceFocusDown, forceFocusLeft, forceFocusRight, forceFocusUp]
      )
    );

    return (
      <TouchableOpacity
        {...touchableProps}
        ref={setRef}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    );
  }
);

TVTouchable.displayName = 'TVTouchable';

export default TVTouchable;
