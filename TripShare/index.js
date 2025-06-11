import 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Ignorer les avertissements spécifiques si nécessaire
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Enregistrement du composant racine
registerRootComponent(App); 