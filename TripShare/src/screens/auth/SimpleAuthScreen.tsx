/**
 * SimpleAuthScreen - Écran d'authentification simple avec toggle entre login et register
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import RegisterScreen from './RegisterScreen';
import LoginScreen from './LoginScreen';

type AuthMode = 'login' | 'register';

const SimpleAuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Formulaires */}
      {mode === 'login' && <LoginScreen onSwitchToRegister={() => switchMode('register')} />}
      {mode === 'register' && <RegisterScreen onSwitchToLogin={() => switchMode('login')} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SimpleAuthScreen;
