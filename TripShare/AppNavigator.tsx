import TermsScreen from './src/screens/legal/TermsScreen';

<Stack.Navigator>
  {/* ...autres écrans... */}
  <Stack.Screen name="TermsScreen" component={TermsScreen} options={{ title: 'Conditions d’utilisation' }} />
</Stack.Navigator> 