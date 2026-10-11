/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SadhanaProvider } from './src/context/SadhanaContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (

    <>
      <StatusBar barStyle={'dark-content'} />
      <ThemeProvider>
        <SafeAreaProvider>
          <SadhanaProvider>
            <AppNavigator />
          </SadhanaProvider>
        </SafeAreaProvider>
      </ThemeProvider>

    </>
  );
}

export default App;
