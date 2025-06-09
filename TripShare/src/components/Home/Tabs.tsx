// src/components/Home/Tabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Tab {
  key: 'trending' | 'nearby' | 'saved';
  label: string;
}

interface TabsProps {
  activeTab: 'trending' | 'nearby' | 'saved';
  setActiveTab: (tab: 'trending' | 'nearby' | 'saved') => void;
}

const tabs: Tab[] = [
  { key: 'trending', label: 'Tendance' },
  { key: 'nearby', label: 'Proche de moi' },
  { key: 'saved', label: 'Enregistrés' },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.underlineActive} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  tabButton: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    paddingBottom: 4,
  },
  tabLabelActive: {
    color: '#1E293B',
    fontWeight: '700',
  },
  underlineActive: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4ECDC4',
    marginTop: 2,
  },
});

export default Tabs;
