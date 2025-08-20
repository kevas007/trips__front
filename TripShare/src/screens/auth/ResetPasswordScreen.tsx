import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthInput from '../../components/auth/AuthInput';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { tripShareApi } from '../../services';

const ResetPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!token || !password || !confirm) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Erreur', 'Mot de passe trop court (min 8)');
      return;
    }
    try {
      setLoading(true);
      await tripShareApi.resetPassword({ token, new_password: password });
      Alert.alert('Succès', 'Mot de passe réinitialisé');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Échec de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
      <View style={styles.form}>
        <AuthInput
          label="Code / Token"
          value={token}
          onChangeText={setToken}
          placeholder="Entrez le code reçu par email"
        />
        <AuthInput
          label={t('auth.password')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
        />
        <AuthInput
          label={t('auth.confirmPassword')}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t('auth.confirmPasswordPlaceholder')}
        />
        <Button title="Réinitialiser" onPress={onSubmit} disabled={loading} loading={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  form: { gap: 12 },
});

export default ResetPasswordScreen;


