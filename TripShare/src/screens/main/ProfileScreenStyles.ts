import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../design-system';
import { getFontSize, getSpacing, getBorderRadius } from '../../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

export const ProfileScreenStyles = StyleSheet.create({
  // Styles de base
  container: {
    flex: 1,
    backgroundColor: '#008080',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#008080',
  },
  // Header cohérent avec HomeScreen
  header: { 
    padding: 16, 
    backgroundColor: '#008080', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerText: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  settingsButton: { 
    padding: 4 
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(12),
  },
  headerButton: {
    padding: 4,
  },
  // Section profil Instagram-style
  instagramProfileSection: {
    paddingHorizontal: getSpacing(16),
    paddingTop: getSpacing(20),
    paddingBottom: getSpacing(24),
    backgroundColor: 'transparent',
    marginBottom: getSpacing(16),
  },
  instagramProfileHeader: {
    flexDirection: 'row',
    marginBottom: getSpacing(20),
  },
  instagramAvatarSection: {
    marginRight: getSpacing(16),
  },
  instagramAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  instagramAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  instagramUserInfoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  instagramUsername: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: 'white',
    marginBottom: getSpacing(4),
  },
  instagramDisplayName: {
    fontSize: getFontSize(14),
    fontWeight: '500',
    color: 'white',
    marginBottom: getSpacing(8),
  },
  instagramBio: {
    fontSize: getFontSize(14),
    color: 'white',
    lineHeight: 20,
  },
  instagramStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: getSpacing(20),
  },
  instagramStatItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: getSpacing(4),
    borderRadius: getBorderRadius(BORDER_RADIUS.sm),
  },
  instagramStatNumber: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: 'white',
    marginBottom: getSpacing(2),
  },
  instagramStatLabel: {
    fontSize: getFontSize(12),
    color: 'white',
  },
  instagramActionButtonsRow: {
    flexDirection: 'row',
    marginBottom: getSpacing(12),
  },
  instagramEditProfileButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(16),
    borderRadius: getBorderRadius(BORDER_RADIUS.sm),
    borderWidth: 1,
    borderColor: 'white',
  },
  instagramEditProfileButtonText: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: '#008080',
    textAlign: 'center',
  },
  instagramFollowButton: {
    flex: 1,
    backgroundColor: '#008080',
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(16),
    borderRadius: getBorderRadius(BORDER_RADIUS.sm),
    marginRight: getSpacing(8),
  },
  instagramFollowButtonText: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  instagramMessageButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(16),
    borderRadius: getBorderRadius(BORDER_RADIUS.sm),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  instagramMessageButtonText: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // Styles Instagram pour le header
  instagramHeader: {
    paddingHorizontal: getSpacing(16),
    paddingTop: getSpacing(16),
    paddingBottom: getSpacing(24),
    backgroundColor: '#008080',
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: getSpacing(20),
  },
  avatarSection: {
    marginRight: getSpacing(16),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#008080',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#008080',
  },





  extraActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getSpacing(16),
  },
  actionIcon: {
    padding: getSpacing(8),
  },

  // Sections générales
  section: {
    marginHorizontal: getSpacing(16),
    marginBottom: getSpacing(24),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: 'white',
    marginBottom: getSpacing(12),
  },

  // Badges
  badgesGrid: {
    flexDirection: 'column',
    gap: getSpacing(12),
  },
  badgeItem: {
    backgroundColor: 'white',
    padding: getSpacing(16),
    borderRadius: getBorderRadius(BORDER_RADIUS.lg),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: getSpacing(8),
  },
  badgeName: {
    fontSize: getFontSize(11),
    fontWeight: '600',
    color: COLORS.neutral[800],
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: getFontSize(9),
    color: COLORS.neutral[500],
    textAlign: 'center',
  },

  // Préférences
  preferencesContainer: {
    backgroundColor: 'white',
    borderRadius: getBorderRadius(BORDER_RADIUS.lg),
    padding: getSpacing(16),
    marginBottom: getSpacing(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  preferenceGroup: {
    marginBottom: getSpacing(16),
  },
  preferenceGroupTitle: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginBottom: getSpacing(8),
  },
  preferenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(8),
  },
  preferenceTag: {
    backgroundColor: '#E6F3F3',
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(BORDER_RADIUS.full),
    borderWidth: 1,
    borderColor: '#008080',
  },
  preferenceText: {
    fontSize: getFontSize(12),
    color: '#008080',
    fontWeight: '500',
  },

  // Informations détaillées
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: getBorderRadius(BORDER_RADIUS.lg),
    padding: getSpacing(16),
    marginBottom: getSpacing(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(12),
  },
  infoLabel: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginLeft: getSpacing(8),
    marginRight: getSpacing(8),
    minWidth: 80,
  },
  infoValue: {
    fontSize: getFontSize(14),
    color: COLORS.neutral[600],
    flex: 1,
  },

  // Membre depuis
  memberSince: {
    fontSize: getFontSize(14),
    color: '#008080',
    fontStyle: 'italic',
    backgroundColor: 'white',
    padding: getSpacing(12),
    borderRadius: getBorderRadius(BORDER_RADIUS.md),
    textAlign: 'center',
  },

  // Grille Instagram des voyages
  instagramSection: {
    paddingHorizontal: getSpacing(16),
    marginBottom: getSpacing(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  sectionCount: {
    fontSize: getFontSize(14),
    color: 'white',
    marginLeft: getSpacing(4),
  },
  instagramGrid: {
    flexDirection: 'column',
    gap: getSpacing(12),
  },
  instagramTripCard: {
    backgroundColor: 'white',
    borderRadius: getBorderRadius(BORDER_RADIUS.lg),
    padding: getSpacing(16),
    marginBottom: getSpacing(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: getBorderRadius(BORDER_RADIUS.sm),
    marginBottom: getSpacing(8),
  },
  tripOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  tripTitleOverlay: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: COLORS.neutral[800],
    marginBottom: getSpacing(4),
  },
  tripLocationOverlay: {
    fontSize: getFontSize(14),
    color: COLORS.neutral[600],
  },

  // État vide des voyages
  emptyTripsContainer: {
    alignItems: 'center',
    paddingVertical: getSpacing(32),
    backgroundColor: 'white',
    borderRadius: getBorderRadius(BORDER_RADIUS.lg),
    marginHorizontal: getSpacing(16),
    marginBottom: getSpacing(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTripsText: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginTop: getSpacing(12),
    marginBottom: getSpacing(4),
  },
  emptyTripsSubtext: {
    fontSize: getFontSize(14),
    color: COLORS.neutral[500],
    textAlign: 'center',
  },


}); 