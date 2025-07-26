import React, { useState, useEffect } from 'react';
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
import { getSpacing, getFontSize, getInputHeight } from '../../utils/responsive';
import { useAppTheme } from '../../hooks/useAppTheme';

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
  const { theme, isDark } = useAppTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [filteredCountries, setFilteredCountries] = useState<CountryOption[]>(countries);

  useEffect(() => {
    if (countries.length > 0) {
      const found = countries.find(c => c.value === selectedValue);
      setSelectedCountry(found || null);
    }
  }, [countries, selectedValue]);

  useEffect(() => {
    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchText, countries]);

  const handleSelect = (country: CountryOption) => {
    onValueChange(country.value);
    setSelectedCountry(country);
    setIsVisible(false);
    setSearchText('');
  };

  const renderCountryItem = ({ item }: { item: CountryOption }) => (
    <TouchableOpacity
      style={[styles.countryItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={[styles.countryName, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{item.name}</Text>
        <Text style={[styles.countryCode, { color: isDark ? 'rgba(230,225,229,0.7)' : '#79747E' }]}>{item.code} • {item.value}</Text>
      </View>
      {selectedValue === item.value && (
        <Ionicons name="checkmark" size={20} color="#008080" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingContainer, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
          borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
        }]}>
          <Text style={[styles.loadingText, { color: isDark ? 'rgba(255,255,255,0.8)' : '#1C1B1F' }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.25)',
          borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
        }]}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.flag}>{selectedCountry?.flag || '🌍'}</Text>
        <Text style={[styles.selectedText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]} numberOfLines={1}>
          {selectedCountry?.code || 'BE'} {selectedCountry?.value || '+32'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(28,27,31,0.8)'} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={[styles.modalContent, { 
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(250, 250, 250, 0.95)' 
            }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { 
                borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
              }]}>
                <Text style={[styles.modalTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Sélectionner un pays</Text>
                <TouchableOpacity
                  onPress={() => setIsVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={isDark ? '#E6E1E5' : '#1C1B1F'} />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={[styles.searchContainer, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }]}>
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'} 
                  style={styles.searchIcon} 
                />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}
                  placeholder="Rechercher un pays..."
                  placeholderTextColor={isDark ? 'rgba(230,225,229,0.6)' : '#79747E'}
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
    borderWidth: 1,
    borderRadius: Platform.OS === 'web' ? 16 : 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 8,
    height: getInputHeight(), // Même hauteur que AuthInput
    justifyContent: 'space-between',
  },
  flag: {
    fontSize: getFontSize(16),
    marginRight: getSpacing(8),
  },
  selectedText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? getFontSize(16) : getFontSize(14),
    fontWeight: '500',
  },
  loadingContainer: {
    height: getInputHeight(), // Même hauteur que AuthInput
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Platform.OS === 'web' ? 16 : 12,
    borderWidth: 1,
    paddingVertical: Platform.OS === 'web' ? 16 : 8,
  },
  loadingText: {
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
  },
  modalTitle: {
    fontSize: getFontSize(18),
    fontWeight: '600',
  },
  closeButton: {
    padding: getSpacing(4),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  countryInfo: {
    flex: 1,
    marginLeft: getSpacing(12),
  },
  countryName: {
    fontSize: getFontSize(16),
    fontWeight: '500',
  },
  countryCode: {
    fontSize: getFontSize(14),
    marginTop: getSpacing(2),
  },
});

export default CountryPickerModal; 