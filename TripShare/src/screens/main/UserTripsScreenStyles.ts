import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../design-system';
import { getSpacing, getFontSize, getBorderRadius } from '../../utils/responsive';

const screenWidth = Dimensions.get('window').width;

export const UserTripsScreenStyles = StyleSheet.create({
  // Container principal avec gradient
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Supprimer le fond blanc
  },

  // Header avec gradient
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(16),
    backgroundColor: '#008080',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: getSpacing(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: getFontSize(20),
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSpacer: {
    width: 40,
  },

  // Onglets de navigation avec design moderne
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabsScrollContent: {
    paddingHorizontal: getSpacing(16),
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(14),
    marginRight: getSpacing(12),
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    position: 'relative',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    borderBottomColor: '#008080',
  },
  tabLabel: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: COLORS.neutral[500],
    marginLeft: getSpacing(6),
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: getSpacing(16),
    right: getSpacing(16),
    height: 3,
    borderRadius: 2,
  },

  // Contenu
  content: {
    flex: 1,
  },

  // États de chargement et d'erreur
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(32),
  },
  loadingText: {
    fontSize: getFontSize(16),
    color: COLORS.neutral[600],
    marginTop: getSpacing(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(32),
  },
  errorText: {
    fontSize: getFontSize(16),
    color: '#EF4444',
    textAlign: 'center',
    marginTop: getSpacing(16),
    marginBottom: getSpacing(24),
  },
  retryButton: {
    backgroundColor: '#008080',
    paddingHorizontal: getSpacing(24),
    paddingVertical: getSpacing(12),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: getFontSize(16),
    fontWeight: '600',
  },

  // Statistiques avec design moderne
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: getSpacing(16),
    marginTop: getSpacing(20),
    marginBottom: getSpacing(24),
    padding: getSpacing(24),
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 128, 128, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: getFontSize(36),
    fontWeight: '800',
    color: '#008080',
    marginBottom: getSpacing(6),
    textShadowColor: 'rgba(0, 128, 128, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: getFontSize(14),
    color: COLORS.neutral[600],
    fontWeight: '500',
  },

  // État vide avec design amélioré
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(32),
    paddingVertical: getSpacing(64),
  },
  emptyTitle: {
    fontSize: getFontSize(22),
    fontWeight: '700',
    color: COLORS.neutral[700],
    marginTop: getSpacing(20),
    marginBottom: getSpacing(12),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: getFontSize(16),
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
  },

  // Galerie des voyages - Style Instagram moderne
  galleryContainer: {
    paddingHorizontal: getSpacing(16),
    paddingBottom: getSpacing(24),
  },
  galleryTitle: {
    fontSize: getFontSize(20),
    fontWeight: '600',
    color: COLORS.neutral[800],
    marginBottom: getSpacing(16),
  },
  
  // Grille Instagram 3x3 avec espacement moderne
  tripsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    backgroundColor: '#F8F9FA',
  },
  
  // Carte de voyage carrée avec design moderne
  tripCard: {
    width: (screenWidth - 32 - 4) / 3, // 32 = padding horizontal, 4 = gap total
    aspectRatio: 1,
    backgroundColor: 'white',
    position: 'relative',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  
  // Container d'image avec design moderne
  tripImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Image du voyage
  tripImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  
  // Placeholders avec gradients modernes
  tripImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  
  // Overlay avec badge de statut moderne
  tripImageOverlay: {
    position: 'absolute',
    top: getSpacing(8),
    right: getSpacing(8),
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: getSpacing(6),
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Placeholders avec gradients par statut
  plannedImagePlaceholder: {
    backgroundColor: '#FFF8E1',
    // Gradient effect avec overlay
  },
  activeImagePlaceholder: {
    backgroundColor: '#E8F5E8',
  },
  completedImagePlaceholder: {
    backgroundColor: '#E3F2FD',
  },
  savedImagePlaceholder: {
    backgroundColor: '#F3E5F5',
  },
  defaultImagePlaceholder: {
    backgroundColor: '#F5F5F5',
  },

  // Overlay pour les placeholders
  placeholderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  // Overlay avec titre du voyage - Design moderne
  tripTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: getSpacing(10),
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tripTitleText: {
    color: 'white',
    fontSize: getFontSize(13),
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tripLocationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: getFontSize(11),
    textAlign: 'center',
    marginTop: getSpacing(3),
    fontWeight: '500',
  },

  // Indicateur de chargement d'image
  imageLoadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },

  // Effet de pression pour les cartes
  tripCardPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
  },
}); 