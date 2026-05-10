# react-native-tv-navigation

`react-native-tv-navigation` exports `TVTouchable`, a small `TouchableOpacity` wrapper for React Native TV apps. It keeps the standard `TouchableOpacity` behavior and adds directional forced focus props:

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
import { TVTouchable } from 'react-native-tv-navigation';

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

```

## Limitations

- The target ref must point to a mounted native element.
- The target element must be visible and focusable in the current TV layout.
- If the ref is empty, unmounted, or `findNodeHandle` returns `null`, the focus request safely does nothing.
- tvOS focus is still mediated by the UIKit focus engine, so platform rules can reject focus if the target is not currently eligible.
