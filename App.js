import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigation from './navigation/AppNavigator';

import { UserProvider } from './context/UserProvider';
import { useUser } from './context/UserProvider';


const RootStack = createNativeStackNavigator();

// Define a custom theme
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
    card: 'white',
    text: 'black',
    border: 'transparent',
    primary: 'black',
  },
};



export default function App() {
  return (
    <UserProvider>
      <AppNavigation />
    </UserProvider>
  );
}

// import React from 'react';
// import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// import AppNavigation from './navigation/AppNavigator';
// import { UserProvider } from './context/UserProvider';

// // Define a custom theme
// const MyTheme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     background: 'white',
//     card: 'white',
//     text: 'black',
//     border: 'transparent',
//     primary: 'black',
//   },
// };

// export default function App() {
//   return (
//     <UserProvider>
//       <NavigationContainer theme={MyTheme}>
//         <AppNavigation />
//       </NavigationContainer>
//     </UserProvider>
//   );
// }