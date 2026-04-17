/**
 * React Native mock for the Vitest test environment.
 *
 * This provides a pure-JS implementation of the React Native APIs that our
 * foundational components depend on.  We use actual React elements so that
 * @testing-library/react-native can traverse the component tree with the same
 * accessibility-based queries it would use against a real RN tree.
 *
 * @testing-library/react-native >= 12 renders into a react-test-renderer
 * host.  By mapping RN primitives to their react-test-renderer equivalents
 * here we keep the rendered output structurally equivalent to the real one,
 * while avoiding the Flow / native-code compilation requirement.
 */

const React = require('react');

// ---------------------------------------------------------------------------
// StyleSheet
// ---------------------------------------------------------------------------
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (!style) return {};
    if (Array.isArray(style)) {
      return style.reduce(
        (acc, s) => Object.assign(acc, StyleSheet.flatten(s)),
        {},
      );
    }
    return style;
  },
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

// ---------------------------------------------------------------------------
// Platform
// ---------------------------------------------------------------------------
const Platform = {
  OS: 'ios',
  select: (obj) => (obj.ios !== undefined ? obj.ios : obj.default),
  Version: 17,
  isPad: false,
  isTVOS: false,
  constants: { reactNativeVersion: { major: 0, minor: 81, patch: 5 } },
};

// ---------------------------------------------------------------------------
// Animated (minimal stub)
// ---------------------------------------------------------------------------
const Animated = {
  Value: class {
    constructor(val) {
      this._val = val;
    }
    setValue() {}
    interpolate() {
      return this;
    }
  },
  timing: () => ({ start: (cb) => cb?.({ finished: true }) }),
  spring: () => ({ start: (cb) => cb?.({ finished: true }) }),
  parallel: () => ({ start: (cb) => cb?.({ finished: true }) }),
  View: ({ children, ...props }) =>
    React.createElement('View', props, children),
  Text: ({ children, ...props }) =>
    React.createElement('Text', props, children),
};

// ---------------------------------------------------------------------------
// Helper to forward all props, including testID and accessibilityRole
// ---------------------------------------------------------------------------
function makeComponent(type) {
  const Component = React.forwardRef(function MockComponent(
    { children, ...props },
    ref,
  ) {
    return React.createElement(type, { ...props, ref }, children);
  });
  Component.displayName = type;
  return Component;
}

// ---------------------------------------------------------------------------
// Core components
// ---------------------------------------------------------------------------
const View = makeComponent('View');
const Text = makeComponent('Text');
const TextInput = makeComponent('TextInput');
const ScrollView = makeComponent('ScrollView');
const FlatList = React.forwardRef(function FlatList(
  { data, renderItem, keyExtractor, ListEmptyComponent, ...props },
  ref,
) {
  if (!Array.isArray(data) || data.length === 0) {
    return React.createElement(
      'FlatList',
      { ...props, ref },
      ListEmptyComponent ? React.createElement(ListEmptyComponent, null) : null,
    );
  }

  return React.createElement(
    'FlatList',
    { ...props, ref },
    data.map((item, index) => {
      const rendered = renderItem({
        item,
        index,
        separators: {
          highlight: () => {},
          unhighlight: () => {},
          updateProps: () => {},
        },
      });
      const key = keyExtractor
        ? keyExtractor(item, index)
        : (item?.id ?? index);
      return React.isValidElement(rendered)
        ? React.cloneElement(rendered, { key })
        : React.createElement('View', { key }, rendered);
    }),
  );
});
const SectionList = makeComponent('SectionList');
const RefreshControl = makeComponent('RefreshControl');
const SafeAreaView = makeComponent('SafeAreaView');
const TouchableOpacity = makeComponent('TouchableOpacity');
const TouchableHighlight = makeComponent('TouchableHighlight');
const TouchableWithoutFeedback = makeComponent('TouchableWithoutFeedback');
const Image = makeComponent('Image');
const ImageBackground = makeComponent('ImageBackground');
const Modal = makeComponent('Modal');
const StatusBar = makeComponent('StatusBar');
const Switch = makeComponent('Switch');

// ActivityIndicator renders a visible node so tests can detect it
const ActivityIndicator = ({ testID, ...props }) =>
  React.createElement('ActivityIndicator', { testID, ...props });

// KeyboardAvoidingView – just passes through
const KeyboardAvoidingView = ({ children, ...props }) =>
  React.createElement('View', props, children);

// Pressable supports onPress and accessibilityRole/accessibilityState
const Pressable = React.forwardRef(function MockPressable(
  { children, onPress, style, disabled, ...props },
  ref,
) {
  const resolvedStyle =
    typeof style === 'function' ? style({ pressed: false }) : style;
  function handlePress() {
    if (!disabled && onPress) onPress();
  }
  return React.createElement(
    'View',
    {
      ...props,
      ref,
      style: resolvedStyle,
      onClick: handlePress,
      // accessible={true} is required for RNTL's getByRole to find this element
      accessible: true,
      accessibilityRole: props.accessibilityRole ?? 'button',
    },
    typeof children === 'function' ? children({ pressed: false }) : children,
  );
});
Pressable.displayName = 'Pressable';

// ---------------------------------------------------------------------------
// Alert / other utilities
// ---------------------------------------------------------------------------
const Alert = { alert: () => {} };
const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
};
const Linking = {
  openURL: () => Promise.resolve(),
  canOpenURL: () => Promise.resolve(false),
};
const AppState = {
  addEventListener: () => ({ remove: () => {} }),
  currentState: 'active',
};
const Dimensions = {
  get: (dim) =>
    dim === 'window'
      ? { width: 375, height: 812 }
      : { width: 375, height: 812 },
  addEventListener: () => ({ remove: () => {} }),
};
const PixelRatio = { get: () => 2, getPixelSizeForLayoutSize: (s) => s * 2 };
const InteractionManager = {
  runAfterInteractions: (cb) => {
    cb();
    return { cancel: () => {} };
  },
};
const BackHandler = { addEventListener: () => ({ remove: () => {} }) };

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
const useColorScheme = () => 'light';
const useWindowDimensions = () => ({
  width: 375,
  height: 812,
  scale: 2,
  fontScale: 1,
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  // Components
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  SectionList,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
  Modal,
  StatusBar,
  Switch,
  ActivityIndicator,
  Pressable,
  Animated,

  // APIs
  StyleSheet,
  Platform,
  Alert,
  Keyboard,
  Linking,
  AppState,
  Dimensions,
  PixelRatio,
  InteractionManager,
  BackHandler,

  // Hooks
  useColorScheme,
  useWindowDimensions,

  // Constants
  NativeModules: {},
  NativeEventEmitter: class {
    addListener() {
      return { remove: () => {} };
    }
    removeAllListeners() {}
  },
  DeviceEventEmitter: {
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
  },
};
