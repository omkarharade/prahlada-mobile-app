/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SadhanaProvider } from './src/context/SadhanaContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (

    <>
      <StatusBar barStyle={'dark-content'} />
      <SafeAreaProvider>
        <SadhanaProvider>
          <AppNavigator />
        </SadhanaProvider>
      </SafeAreaProvider>

    </>
  );
}

export default App;
