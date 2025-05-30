# New Screen Integration Guide

This guide explains how to add a new screen to the TandaPay mobile app, which is built on React Native with React Navigation v5 and uses Flow for type checking.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [Screen Types and Patterns](#screen-types-and-patterns)
5. [Navigation Patterns](#navigation-patterns)
6. [Redux Integration](#redux-integration)
7. [Troubleshooting](#troubleshooting)
8. [Examples](#examples)

## Overview

The app uses a stack navigator (`AppNavigator`) that manages all screens. Screens are organized into two main categories:
- **Server Data Dependent**: Screens that require Zulip server data (wrapped with `useHaveServerDataGate`)
- **Independent**: Screens that work without server data (auth, sharing, etc.)

## Prerequisites

Before adding a new screen, ensure you understand:
- React Navigation v5 stack navigator patterns
- Flow type system (strict-local mode)
- The app's Redux architecture
- The Screen component and common UI patterns

## Step-by-Step Integration

### 1. Create the Screen Component

Create your screen file in the appropriate directory:

```javascript
/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import { IconSomeIcon } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'your-screen-name'>,
  route: RouteProp<'your-screen-name', YourParamsType>,
|}>;

export default function YourNewScreen(props: Props): Node {
  const { navigation, route } = props;
  
  return (
    <Screen title="Your Screen Title">
      {/* Your screen content */}
      <NavRow
        leftElement={{ type: 'icon', Component: IconSomeIcon }}
        title="Some Action"
        onPress={() => {
          navigation.push('another-screen');
        }}
        subtitle="Description of the action"
      />
    </Screen>
  );
}
```

**Key Points:**
- Use `/* @flow strict-local */` header
- Import `Node` type for component return type
- Define proper Props type with navigation and route
- Use the `Screen` component wrapper for consistency
- Extract `navigation` and `route` from props for clean code

### 2. Add Route Parameters Type

In `src/nav/AppNavigator.js`, add your screen to the `AppNavigatorParamList`:

```javascript
export type AppNavigatorParamList = {|
  // ... existing routes
  +'your-screen-name': RouteParamsOf<typeof YourNewScreen>,
  // or if no params:
  +'your-screen-name': void,
  // or with specific params:
  +'your-screen-name': {| userId: string, optional?: number |},
|};
```

**Route Parameter Patterns:**
- `void` - No parameters
- `RouteParamsOf<typeof ComponentName>` - Auto-inferred from component
- Explicit object type - For specific parameter shape

### 3. Import and Register Screen

In `src/nav/AppNavigator.js`:

**Add Import:**
```javascript
import YourNewScreen from '../path/to/YourNewScreen';
```

**Register Screen:**
Add to the appropriate section in the `AppNavigator` component:

```javascript
export default function AppNavigator(props: Props): Node {
  // ...
  return (
    <Stack.Navigator>
      {/* Screens requiring server data */}
      <Stack.Screen 
        name="your-screen-name" 
        component={useHaveServerDataGate(YourNewScreen)} 
      />
      
      {/* OR screens not requiring server data */}
      <Stack.Screen 
        name="your-screen-name" 
        component={YourNewScreen} 
      />
    </Stack.Navigator>
  );
}
```

**Server Data Gate Decision:**
- Use `useHaveServerDataGate()` if your screen needs Zulip user data, messages, or streams
- Don't use it for auth screens, wallet setup, or pure utility screens

### 4. Add Navigation Actions (Optional)

In `src/nav/navActions.js`, add navigation helper if needed:

```javascript
export const navigateToYourScreen = (params?: YourParamsType): NavigationAction =>
  StackActions.push('your-screen-name', params);
```

### 5. Access Your Screen

Add navigation to your screen from other screens:

```javascript
// Using navigation prop
navigation.push('your-screen-name', { userId: '123' });

// Using NavRow component
<NavRow
  leftElement={{ type: 'icon', Component: IconSomeIcon }}
  title="Open Your Screen"
  onPress={() => {
    navigation.push('your-screen-name');
  }}
  subtitle="Navigate to your new screen"
/>

// Using ZulipButton
<ZulipButton
  text="Open Screen"
  onPress={() => {
    navigation.push('your-screen-name');
  }}
/>
```

## Screen Types and Patterns

### Basic Screen Structure

```javascript
export default function YourScreen(props: Props): Node {
  const { navigation, route } = props;
  
  return (
    <Screen title="Screen Title">
      {/* Content */}
    </Screen>
  );
}
```

### Screen with Search

```javascript
export default function SearchableScreen(props: Props): Node {
  const [filter, setFilter] = useState<string>('');
  
  return (
    <Screen 
      search 
      searchBarOnChange={setFilter}
      searchPlaceholder="Search items..."
    >
      {/* Filtered content */}
    </Screen>
  );
}
```

### Screen with Parameters

```javascript
type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'user-details'>,
  route: RouteProp<'user-details', {| userId: string |}>,
|}>;

export default function UserDetailsScreen(props: Props): Node {
  const { route } = props;
  const { userId } = route.params;
  
  // Use userId in your screen logic
}
```

### Tab Navigator Screen

For screens that contain their own tab navigator (like `SharingScreen`):

```javascript
const Tab = createMaterialTopTabNavigator<YourNavigatorParamList>();

export default function YourTabScreen(props: Props): Node {
  return (
    <Screen title="Tabbed Screen" shouldShowLoadingBanner={false}>
      <Tab.Navigator {...materialTopTabNavigatorConfig()}>
        <Tab.Screen name="tab1" component={Tab1Screen} />
        <Tab.Screen name="tab2" component={Tab2Screen} />
      </Tab.Navigator>
    </Screen>
  );
}
```

## Navigation Patterns

### Push to Stack
```javascript
navigation.push('screen-name', params);
```

### Replace Current Screen
```javascript
navigation.replace('screen-name', params);
```

### Go Back
```javascript
navigation.goBack();
// or use the action
import { navigateBack } from '../actions';
navigation.dispatch(navigateBack());
```

### Reset Navigation Stack
```javascript
import { resetToMainTabs } from '../nav/navActions';
navigation.dispatch(resetToMainTabs());
```

### Navigate to Specific Narrow/Chat
```javascript
import { doNarrow } from '../actions';
dispatch(doNarrow(someNarrow));
```

## Redux Integration

### Using Redux State

```javascript
import { useSelector } from '../react-redux';
import { getSomeData } from '../selectors';

export default function ReduxScreen(props: Props): Node {
  const data = useSelector(getSomeData);
  
  return (
    <Screen title="Redux Screen">
      {/* Use data */}
    </Screen>
  );
}
```

### Dispatching Actions

```javascript
import { useDispatch } from '../react-redux';
import { someAction } from '../actions';

export default function ActionScreen(props: Props): Node {
  const dispatch = useDispatch();
  
  const handleAction = useCallback(() => {
    dispatch(someAction(params));
  }, [dispatch]);
  
  return (
    <Screen title="Action Screen">
      <ZulipButton text="Do Action" onPress={handleAction} />
    </Screen>
  );
}
```

### TandaPay Redux Integration

For TandaPay-specific screens, use the TandaPay selectors and actions:

```javascript
import { useSelector, useDispatch } from '../react-redux';
import { getTandaPayWallet } from '../tandapay/tandaPaySelectors';
import { setTandaPayWallet } from '../tandapay/tandaPayActions';

export default function TandaPayScreen(props: Props): Node {
  const wallet = useSelector(getTandaPayWallet);
  const dispatch = useDispatch();
  
  const updateWallet = useCallback((newWallet) => {
    dispatch(setTandaPayWallet(newWallet));
  }, [dispatch]);
}
```

## Common UI Components

### Screen Wrapper
Always wrap your screen content in the `Screen` component:

```javascript
<Screen 
  title="Screen Title"
  canGoBack={true}
  search={false}
  padding={false}
  scrollEnabled={true}
>
  {children}
</Screen>
```

### Navigation Rows
Use `NavRow` for navigation options:

```javascript
<NavRow
  leftElement={{ type: 'icon', Component: IconName }}
  title="Action Title"
  subtitle="Description"
  onPress={() => navigation.push('target-screen')}
  type="nested" // or "external"
/>
```

### Text Display Rows
Use `TextRow` for read-only information:

```javascript
<TextRow
  icon={{ Component: IconName }}
  title="Info Title"
  subtitle="Info Value"
/>
```

### Switch Controls
Use `SwitchRow` for boolean settings:

```javascript
<SwitchRow
  label="Setting Name"
  value={settingValue}
  onValueChange={handleSettingChange}
/>
```

### Buttons
Use `ZulipButton` for actions:

```javascript
<ZulipButton
  text="Button Text"
  onPress={handlePress}
  secondary={false}
  disabled={false}
/>
```

## Screen Organization Patterns

### TandaPay Screens
Located in `src/tandapay/` and subdirectories:
- Main menu screens: `src/tandapay/`
- Wallet screens: `src/tandapay/wallet/`
- Feature-specific screens: `src/tandapay/[feature]/`

### Core App Screens
- User management: `src/user-picker/`, `src/account-info/`
- Messaging: `src/chat/`, `src/compose/`
- Settings: `src/settings/`
- Streams: `src/streams/`

### File Naming
- Use PascalCase for screen files: `YourNewScreen.js`
- Include "Screen" suffix for clarity
- Group related screens in subdirectories

## Error Handling Patterns

### Loading States
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<?string>(null);

if (loading) {
  return (
    <Screen title="Loading...">
      <ActivityIndicator />
    </Screen>
  );
}

if (error) {
  return (
    <Screen title="Error">
      <ZulipText text={`Error: ${error}`} />
    </Screen>
  );
}
```

### Network Requests
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.fetchSomeData();
      setData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

## Troubleshooting

### Common Flow Type Errors

**Error: "Property not found in object type"**
- Check that route parameters match the type definition in `AppNavigatorParamList`
- Ensure all required props are passed to components

**Error: "Cannot call property on possibly null value"**
- Add null checks: `route.params?.optionalParam`
- Use proper Flow types: `route: RouteProp<'screen-name', ParamsType>`

**Error: "Property missing in exact object type"**
- Ensure exact object types match: `{| requiredProp: string |}`
- Check for typos in property names

### Navigation Issues

**Screen doesn't appear:**
- Check screen is registered in `AppNavigator.js`
- Verify route name matches exactly
- Ensure proper import path

**Back navigation not working:**
- Use `navigation.goBack()` or `navigateBack()` action
- Check navigation stack state

**Parameters not received:**
- Verify parameter type in `AppNavigatorParamList`
- Check parameter names match exactly

### Redux Integration Issues

**Selector returns undefined:**
- Check selector implementation
- Verify Redux state structure
- Ensure proper store configuration

**Action not dispatching:**
- Check action creator implementation
- Verify reducer handles the action type
- Ensure proper dispatch usage

## Examples

### Simple Info Screen (No Parameters)

```javascript
/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import TextRow from '../common/TextRow';
import { IconInfo } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'app-info'>,
  route: RouteProp<'app-info', void>,
|}>;

export default function AppInfoScreen(props: Props): Node {
  return (
    <Screen title="App Information">
      <TextRow
        icon={{ Component: IconInfo }}
        title="Version"
        subtitle="1.0.0"
      />
      <TextRow
        icon={{ Component: IconInfo }}
        title="Build"
        subtitle="Production"
      />
    </Screen>
  );
}
```

### Screen with Parameters and Navigation

```javascript
/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconUser, IconEdit } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'user-profile'>,
  route: RouteProp<'user-profile', {| userId: string |}>,
|}>;

export default function UserProfileScreen(props: Props): Node {
  const { navigation, route } = props;
  const { userId } = route.params;
  
  const handleEdit = useCallback(() => {
    navigation.push('edit-user', { userId });
  }, [navigation, userId]);
  
  return (
    <Screen title="User Profile">
      <TextRow
        icon={{ Component: IconUser }}
        title="User ID"
        subtitle={userId}
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconEdit }}
        title="Edit Profile"
        onPress={handleEdit}
        subtitle="Modify user information"
      />
    </Screen>
  );
}
```

### TandaPay Feature Screen with Redux

```javascript
/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import { useSelector, useDispatch } from '../../react-redux';
import Screen from '../../common/Screen';
import NavRow from '../../common/NavRow';
import SwitchRow from '../../common/SwitchRow';
import { IconSettings } from '../../common/Icons';
import { getTandaPaySettings } from '../tandaPaySelectors';
import { updateTandaPaySettings } from '../tandaPayActions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-feature'>,
  route: RouteProp<'tandapay-feature', void>,
|}>;

export default function TandaPayFeatureScreen(props: Props): Node {
  const { navigation } = props;
  const settings = useSelector(getTandaPaySettings);
  const dispatch = useDispatch();
  
  const handleToggleSetting = useCallback((key: string, value: boolean) => {
    dispatch(updateTandaPaySettings({ [key]: value }));
  }, [dispatch]);
  
  return (
    <Screen title="TandaPay Feature">
      <SwitchRow
        label="Auto-sync"
        value={settings.autoSync}
        onValueChange={(value) => handleToggleSetting('autoSync', value)}
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconSettings }}
        title="Advanced Settings"
        onPress={() => navigation.push('tandapay-advanced')}
        subtitle="Configure advanced options"
      />
    </Screen>
  );
}
```

## Integration Checklist

Before considering your screen integration complete:

- [ ] Screen component created with proper Flow types
- [ ] Route parameters added to `AppNavigatorParamList`
- [ ] Screen imported and registered in `AppNavigator.js`
- [ ] Proper use of `useHaveServerDataGate` if needed
- [ ] Navigation access added from appropriate screens
- [ ] Redux integration implemented if needed
- [ ] Error handling and loading states implemented
- [ ] Consistent UI components used (`Screen`, `NavRow`, etc.)
- [ ] Flow type checking passes without errors
- [ ] Screen tested on both iOS and Android
- [ ] Back navigation works correctly
- [ ] Screen parameters properly validated

## Related Files

When adding a new screen, you may need to modify:

- `src/nav/AppNavigator.js` - Route registration
- `src/nav/navActions.js` - Navigation helpers (optional)
- `src/actionConstants.js` - Action types (if using Redux)
- `src/actionTypes.js` - Action union types (if using Redux)
- Parent screens - Add navigation to your screen
- `src/common/Icons.js` - Add new icons if needed

This guide should help you successfully integrate new screens into the TandaPay mobile app while maintaining consistency with existing patterns and architecture.
