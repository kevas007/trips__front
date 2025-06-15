import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountryOption } from '../../services/countryService';
import { COLORS } from '../../design-system';
import { getFontSize, getSpacing, getBorderRadius, getInputHeight } from '../../utils/responsive';

interface CountryPickerModalProps {
  countries: CountryOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  loading?: boolean;
}

const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  countries,
  selectedValue,
  onValueChange,
  loading = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedCountry = countries.find(c => c.value === selectedValue);
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchText.toLowerCase()) ||
    country.code.toLowerCase().includes(searchText.toLowerCase()) ||
    country.value.includes(searchText)
  );

  const handleSelect = (country: CountryOption) => {
    onValueChange(country.value);
    setIsVisible(false);
    setSearchText('');
  };

  const renderCountryItem = ({ item }: { item: CountryOption }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.code} • {item.value}</Text>
      </View>
      {selectedValue === item.value && (
                        <Ionicons name="checkmark" size={20} color="#667eea" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.flag}>{selectedCountry?.flag || '🌍'}</Text>
        <Text style={styles.selectedText} numberOfLines={1}>
          {selectedCountry?.code || 'FR'} {selectedCountry?.value || '+33'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sélectionner un pays</Text>
                <TouchableOpacity
                  onPress={() => setIsVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un pays..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              {/* Country List */}
              <FlatList
                data={filteredCountries}
                renderItem={renderCountryItem}
                keyExtractor={(item, index) => `${item.code}-${index}`}
                style={styles.countryList}
                showsVerticalScrollIndicator={false}
                maxToRenderPerBatch={50}
                windowSize={10}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: Platform.OS === 'web' ? 16 : 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 8,
    height: Platform.OS === 'web' ? 'auto' : getInputHeight() - 8,
    justifyContent: 'space-between',
  },
  flag: {
    fontSize: getFontSize(16),
    marginRight: getSpacing(8),
  },
  selectedText: {
    flex: 1,
    color: '#fff',
    fontSize: Platform.OS === 'web' ? getFontSize(16) : getFontSize(14),
    fontWeight: '500',
  },
  loadingContainer: {
    height: Platform.OS === 'web' ? 'auto' : getInputHeight() - 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: Platform.OS === 'web' ? 16 : 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingVertical: Platform.OS === 'web' ? 16 : 8,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: getFontSize(14),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getSpacing(20),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: getSpacing(4),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    margin: getSpacing(20),
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
  },
  searchIcon: {
    marginRight: getSpacing(12),
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: getFontSize(16),
  },
  countryList: {
    paddingHorizontal: getSpacing(20),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  countryInfo: {
    flex: 1,
    marginLeft: getSpacing(12),
  },
  countryName: {
    color: '#fff',
    fontSize: getFontSize(16),
    fontWeight: '500',
  },
  countryCode: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: getFontSize(14),
    marginTop: getSpacing(2),
  },
});

export default CountryPickerModal; 