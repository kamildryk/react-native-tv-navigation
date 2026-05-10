# react-native-tv-navigation

`react-native-tv-navigation` exports `TVTouchable`, a small `TouchableOpacity` wrapper for React Native TV apps. It also exports `requestTVFocus`, a helper for imperatively moving focus to any mounted target ref.

`TVTouchable` keeps the standard `TouchableOpacity` behavior and adds directional forced focus props:

- `forceFocusUp`
- `forceFocusDown`
- `forceFocusLeft`
- `forceFocusRight`

Each prop accepts a React ref to the target element. When the current `TVTouchable` is focused and the user presses that direction on the TV remote, the component resolves the target with `findNodeHandle` and calls the native `TVForceFocus.requestFocus(targetTag)` method.

## Installation

```sh
npm install react-native-tv-navigation
```

For iOS/tvOS, install pods:

```sh
cd ios
bundle exec pod install
```

This package is a normal native React Native library and supports React Native autolinking. The Android package is declared explicitly in `react-native.config.js` so the app can autolink the Kotlin native module reliably. It does not use Expo-only APIs.

## Usage

```tsx
import React, { useRef } from 'react';
import { Text, View } from 'react-native';
import { TVTouchable, requestTVFocus } from 'react-native-tv-navigation';

export function Example() {
  const buttonARef = useRef(null);
  const buttonBRef = useRef(null);

  return (
    <View>
      <TVTouchable
        ref={buttonARef}
        forceFocusUp={buttonBRef}
        onPress={() => {
          console.log('Button A pressed');
          requestTVFocus(buttonBRef);
        }}
      >
        <Text>Button A</Text>
      </TVTouchable>

      <TVTouchable ref={buttonBRef} forceFocusDown={buttonARef}>
        <Text>Button B</Text>
      </TVTouchable>
    </View>
  );
}
```

## API

```ts
type TVTouchableProps = TouchableOpacityProps & {
  forceFocusUp?: React.RefObject<any> | null;
  forceFocusDown?: React.RefObject<any> | null;
  forceFocusLeft?: React.RefObject<any> | null;
  forceFocusRight?: React.RefObject<any> | null;
};
```

`TVTouchable` forwards its ref to the underlying `TouchableOpacity` and accepts all standard `TouchableOpacity` props. External `onFocus`, `onBlur`, `onPress`, and other handlers keep working normally.

```ts
function requestTVFocus(target: React.RefObject<any> | any | null | undefined): boolean;
```

`requestTVFocus` lets you move focus from any action, not only directional remote input. It accepts a ref or a mounted native target, resolves it with `findNodeHandle`, and calls the same native `TVForceFocus.requestFocus(targetTag)` method used by `TVTouchable`.

It returns `true` when a native focus request was sent and `false` when the target was empty, unmounted, or could not be resolved.

```tsx
import React, { useRef } from 'react';
import { Text, View } from 'react-native';
import { TVTouchable, requestTVFocus } from 'react-native-tv-navigation';

export function ManualFocusExample() {
  const submitRef = useRef(null);
  const cancelRef = useRef(null);

  async function handleSubmit() {
    await saveChanges();
    requestTVFocus(cancelRef);
  }

  return (
    <View>
      <TVTouchable ref={submitRef} onPress={handleSubmit}>
        <Text>Save</Text>
      </TVTouchable>

      <TVTouchable ref={cancelRef}>
        <Text>Cancel</Text>
      </TVTouchable>
    </View>
  );
}
```

```

## Limitations

- The target ref must point to a mounted native element.
- The target element must be visible and focusable in the current TV layout.
- If the ref is empty, unmounted, or `findNodeHandle` returns `null`, the focus request safely does nothing.
- tvOS focus is still mediated by the UIKit focus engine, so platform rules can reject focus if the target is not currently eligible.
