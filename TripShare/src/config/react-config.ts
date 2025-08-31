// Configuration React pour éviter les warnings
import { LogBox } from 'react-native';

// Ignorer les warnings spécifiques
LogBox.ignoreLogs([
  'Warning: useInsertionEffect must not schedule updates.',
  'Warning: useLayoutEffect does nothing on the server',
  'Warning: componentWillReceiveProps has been renamed',
  'Warning: componentWillMount has been renamed',
  'Warning: componentWillUpdate has been renamed',
  'Warning: TypeError: Cannot read property \'length\' of undefined',
  'Warning: TypeError: Cannot convert undefined value to object',
  'TypeError: Cannot convert undefined value to object',
  'Cannot convert undefined value to object',
  'TypeError: Cannot convert undefined value to object',
  'Warning: TypeError: Cannot convert undefined value to object',
]);

// Configuration pour le développement
if (__DEV__) {
  // Désactiver les warnings en développement si nécessaire
  //LogBox.setDisabled(true);
}
