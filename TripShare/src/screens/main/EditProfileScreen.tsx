import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../services/profileService';
import { User } from '../../types/user';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../../types/navigation';
import DateTimePicker from '@react-native-community/datetimepicker';

type EditProfileScreenNavigationProp = StackNavigationProp<MainTabParamList, 'Profile'>;

const EditProfileScreen = ({ navigation }: { navigation: EditProfileScreenNavigationProp }) => {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone_number: '',
    date_of_birth: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await profileService.getProfile();
      setUser(userData);
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        bio: userData.bio || '',
        phone_number: userData.phone_number || '',
        date_of_birth: userData.date_of_birth || '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSaving(true);
        await profileService.updateAvatar(result.assets[0].uri);
        await loadProfile();
        Alert.alert('Succès', 'Photo de profil mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    // Validation simple
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires.');
      return;
    }
    // Validation du format de la date
    if (formData.date_of_birth && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(formData.date_of_birth)) {
      Alert.alert('Erreur', 'La date de naissance doit être au format AAAA-MM-JJ.');
      return;
    }
    try {
      setSaving(true);
      // Correction du format de la date pour l'API (ISO 8601)
      let dataToSend = { ...formData };
      if (dataToSend.date_of_birth && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dataToSend.date_of_birth)) {
        dataToSend.date_of_birth = dataToSend.date_of_birth + 'T00:00:00Z';
      }
      await profileService.updateProfile(dataToSend);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[0]} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick} style={styles.avatarContainer}>
          <Image
            source={
              user?.avatar_url
                ? { uri: user.avatar_url }
                : { uri: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.email || user?.username || 'user')}` }
            }
            style={styles.avatar}
          />
          <View style={[styles.editAvatarButton, { backgroundColor: theme.colors.primary[0] }]}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Prénom</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background.card,
              color: theme.colors.text.primary,
              borderColor: theme.colors.glassmorphism.border,
            }]}
            value={formData.first_name}
            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            placeholder="Votre prénom"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Nom</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background.card,
              color: theme.colors.text.primary,
              borderColor: theme.colors.glassmorphism.border,
            }]}
            value={formData.last_name}
            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            placeholder="Votre nom"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: theme.colors.background.card,
              color: theme.colors.text.primary,
              borderColor: theme.colors.glassmorphism.border,
            }]}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Parlez-nous de vous"
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Téléphone</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.background.card,
              color: theme.colors.text.primary,
              borderColor: theme.colors.glassmorphism.border,
            }]}
            value={formData.phone_number}
            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
            placeholder="Votre numéro de téléphone"
            placeholderTextColor={theme.colors.text.secondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Date de naissance</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                ...styles.input,
                backgroundColor: theme.colors.background.card,
                color: theme.colors.text.primary,
                borderColor: theme.colors.glassmorphism.border,
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                width: '100%',
                fontSize: 16,
              }}
              value={formData.date_of_birth}
              onChange={e => {
                // Format AAAA-MM-JJ
                setFormData({ ...formData, date_of_birth: e.target.value });
              }}
            />
          ) : (
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.glassmorphism.border,
                  justifyContent: 'center',
                },
              ]}
            >
              <Text style={{ color: theme.colors.text.primary }}>
                {formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : 'Sélectionner une date'}
              </Text>
            </TouchableOpacity>
          )}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  // Format AAAA-MM-JJ
                  const yyyy = selectedDate.getFullYear();
                  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const dd = String(selectedDate.getDate()).padStart(2, '0');
                  setFormData({ ...formData, date_of_birth: `${yyyy}-${mm}-${dd}` });
                }
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary[0] }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  actions: {
    padding: 20,
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen; 