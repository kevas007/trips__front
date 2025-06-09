import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  const { theme } = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{title}</Text>
      {children}
    </View>
  );
};

interface RowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  children?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, label, children, onPress, danger }) => {
  const { theme } = useAppTheme();
  return (
    <TouchableOpacity style={[styles.row, danger && { backgroundColor: theme.colors.semantic.error + '20' }]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={danger ? '#ff4f4f' : '#4f8cff'} style={{ marginRight: 14 }} />
        <Text style={[styles.rowLabel, { color: theme.colors.text.primary }, danger && { color: '#ff4f4f' }]}>{label}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );
};

const SettingsScreen = () => {
  const { theme, toggleTheme, isDark, fontSize, setFontSize } = useAppTheme();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [biometry, setBiometry] = useState(false);

  const fontSizeOptions = ['Petit', 'Normal', 'Grand', 'Très grand'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Apparence */}
      <Section title="Apparence">
        <Row icon="moon" label="Mode sombre">
          <Switch value={isDark} onValueChange={toggleTheme} />
        </Row>
        <Row icon="text" label="Taille de police">
          <TouchableOpacity
            onPress={() => {
              const currentIndex = fontSizeOptions.indexOf(fontSize);
              const nextIndex = (currentIndex + 1) % fontSizeOptions.length;
              setFontSize(fontSizeOptions[nextIndex] as any);
            }}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.colors.background.card }}
          >
            <Text style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>{fontSize}</Text>
          </TouchableOpacity>
        </Row>
      </Section>
      {/* Notifications */}
      <Section title="Notifications">
        <Row icon="notifications" label="Notifications push">
          <Switch value={pushNotif} onValueChange={setPushNotif} />
        </Row>
        <Row icon="mail" label="Notifications email">
          <Switch value={emailNotif} onValueChange={setEmailNotif} />
        </Row>
      </Section>
      {/* Confidentialité */}
      <Section title="Confidentialité">
        <Row icon="eye" label="Profil public">
          <Switch value={publicProfile} onValueChange={setPublicProfile} />
        </Row>
        <Row icon="mail" label="Afficher l'email">
          <Switch value={showEmail} onValueChange={setShowEmail} />
        </Row>
      </Section>
      {/* Sécurité */}
      <Section title="Sécurité">
        <Row icon="lock-closed" label="Changer le mot de passe" onPress={() => navigation.navigate('ChangePassword')} />
        {Platform.OS !== 'web' && (
          <Row icon="finger-print" label="Biométrie">
            <Switch value={biometry} onValueChange={setBiometry} />
          </Row>
        )}
      </Section>
      {/* Compte */}
      <Section title="Compte">
        <Row icon="trash" label="Supprimer le compte" danger onPress={() => Alert.alert('Suppression', 'Fonction à implémenter !')} />
      </Section>
      {/* À propos */}
      <Section title="À propos">
        <Row icon="information-circle" label="Version 1.0.0" />
        <Row icon="help-circle" label="Support" onPress={() => Linking.openURL('mailto:support@tripshare.app?subject=Support TripShare')}/>
        {/* <Row icon="globe" label="Site officiel" onPress={() => Linking.openURL('https://www.tripshare.app')} /> */}
        <View style={{ alignItems: 'center', marginTop: 18, marginBottom: 8 }}>
          <Text style={{ color: theme.colors.text.secondary, fontSize: 13 }}>
            © {new Date().getFullYear()} TripShare. Tous droits réservés.
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 18, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontSize: 16 },
});

export default SettingsScreen; 