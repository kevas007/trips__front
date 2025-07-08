import { StyleSheet, Platform } from 'react-native';
import { SPACING } from '../design-system';
import { BORDER_RADIUS } from '../design-system';

export const screenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? SPACING[4] : 0,
  },
  container: {
    flexGrow: 1,
    padding: SPACING[4],
    paddingTop: Platform.OS === 'ios' ? SPACING[2] : SPACING[4],
  },
  header: {
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[3],
  },
  multiSelectHint: {
    fontSize: 14,
    opacity: 0.6,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING[1],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    margin: SPACING[1],
  },
  chipSelected: {
    borderWidth: 0,
  },
  chipIcon: {
    marginRight: SPACING[1],
  },
  chipText: {
    fontSize: 14,
    marginRight: SPACING[1],
  },
  chipTextSelected: {
    color: '#fff',
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkSelected: {
    borderWidth: 0,
  },
  buttonContainer: {
    marginTop: SPACING[6],
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    padding: SPACING[3],
  },
  skipButtonText: {
    fontSize: 16,
  },
}); 