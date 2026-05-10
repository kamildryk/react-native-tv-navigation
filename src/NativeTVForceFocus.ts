import { NativeModules } from 'react-native';

export type TVForceFocusNativeModule = {
  requestFocus: (reactTag: number) => void;
};

const nativeModule = NativeModules.TVForceFocus as
  | TVForceFocusNativeModule
  | undefined;

const TVForceFocus: TVForceFocusNativeModule = {
  requestFocus(reactTag: number) {
    if (typeof reactTag !== 'number') {
      return;
    }

    nativeModule?.requestFocus?.(reactTag);
  },
};

export default TVForceFocus;
