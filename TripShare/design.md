# 🌍 TripShare - Design System & Frontend Architecture Complète

## 🚀 STATUT D'IMPLÉMENTATION - MOBILE UNIQUEMENT

### ✅ DÉJÀ IMPLÉMENTÉ

#### 🎨 Design System & Thème
- ✅ **Système de thèmes complet** (`src/theme/`)
  - Thèmes sombre/clair dynamiques
  - Palette de couleurs complète
  - Typographie responsive
  - Hook `useAppTheme()` fonctionnel

#### 🔐 Authentification Complète
- ✅ **Service d'authentification** (`src/services/auth.ts`)
  - Login, Register, ForgotPassword
  - JWT avec refresh tokens
  - Gestion d'erreurs localisées
- ✅ **Store d'authentification** (`src/store/`)
  - Store Zustand + alternative React Context
  - Persistence AsyncStorage
  - Actions complètes (login, register, logout)
- ✅ **Écrans d'authentification**
  - `EnhancedAuthScreen` avec modes (login/register/forgot)
  - Validation des formulaires
  - Sélecteur de pays
  - Interface adaptatif dark/light
- ✅ **Composants d'auth**
  - `AuthInput` - Champs de saisie
  - `CountryPickerModal` - Sélection pays
  - `ErrorHandler` - Gestion d'erreurs
  - `AuthInitializer` - Initialisation

#### 🌐 Internationalisation (i18n)
- ✅ **Système complet** (`src/i18n/`)
  - Support FR/EN
  - Traductions pour auth, erreurs, UI
  - Hook `useTranslation()`
  - Changement dynamique de langue

#### 🏠 Écrans Principaux
- ✅ **HomeScreen** (`src/screens/main/HomeScreen.tsx`)
  - Animations complexes
  - Header animé
  - Composants : SearchBar, Tabs, StatsCards, QuickActions
  - TrendingDestinations, FeaturedTrips
- ✅ **ProfileScreen** (`src/screens/main/`)
  - EditProfileScreen avec photo picker
  - SettingsScreen avec sections
- ✅ **SettingsScreen complet**
  - AppearanceSettingsScreen
  - NotificationSettingsScreen  
  - PrivacySettingsScreen
  - ThemeLanguageSettings

#### 🧩 Composants UI
- ✅ **Composants de base** (`src/components/ui/`)
  - Button component
  - AppLogo
  - ErrorHandler avec types d'erreurs
- ✅ **Composants Home** (`src/components/Home/`)
  - AnimatedHeader avec gradients
  - SearchBar
  - FloatingElements
  - Tabs, StatsCards, QuickActions
- ✅ **Navigation**
  - AuthNavigator
  - Structures de navigation définies

#### 🔧 Services & API
- ✅ **Services complets**
  - `authService` - Authentification backend Go
  - `profileService` - Gestion profils
  - `countryService` - Liste des pays
  - `apiService` avec gestion erreurs
- ✅ **Hooks personnalisés** (`src/hooks/`)
  - `useAppTheme()` - Gestion thème
  - `useAuthErrors()` - Erreurs localisées
  - `useAPI()` - Appels API

#### 📱 Types & Architecture
- ✅ **Types TypeScript complets** (`src/types/`)
  - `api.ts` - Types API complètes (Trip, User, Auth, etc.)
  - `user.ts` - Interfaces utilisateur
  - `theme.ts` - Types thème
  - `navigation.ts` - Types navigation
  - `auth.ts`, `errors.ts` - Types métier

#### 🛠️ Configuration & Outils
- ✅ **Configuration mobile optimisée**
  - Expo 53 avec React Native 0.79
  - TypeScript strict
  - Alias de modules (`@/`)
  - Scripts build Android/iOS
- ✅ **Utilitaires**
  - `responsive.ts` - Fonctions responsive
  - `networkDebug.ts` - Diagnostic réseau

#### 📱 Écrans spécialisés
- ✅ **TravelPreferencesScreen** - Préférences voyage
- ✅ **TermsScreen** - Conditions d'utilisation
- ✅ **ForgotPasswordScreen** - Récupération mot de passe

### 🔄 EN COURS / PARTIELLEMENT IMPLÉMENTÉ
- 🔄 **Navigation principale** - Structure définie, à compléter
- 🔄 **Design system** - Partiellement dans `src/design-system/`

### ❌ À IMPLÉMENTER
- ❌ Écrans de création d'itinéraires
- ❌ Écrans de groupes de voyage  
- ❌ Composants de cartes/géolocalisation
- ❌ Système de notifications push
- ❌ Partage social
- ❌ Intelligence artificielle (recommandations)
- ❌ Système de paiement/budget
- ❌ Chat/messagerie
- ❌ Système de reviews/notes

---

## 📋 Table des Matières
1. [Design System](#design-system)
2. [Architecture des Composants](#architecture-des-composants)
3. [Écrans Principaux](#écrans-principaux)
4. [Types TypeScript](#types-typescript)
5. [État Global & Store](#état-global--store)
6. [Services API](#services-api)
7. [Hooks Personnalisés](#hooks-personnalisés)
8. [Animations & Micro-interactions](#animations--micro-interactions)
9. [Guide pour l'IA](#guide-pour-lia)

---

## 🎨 Design System

### Palette de Couleurs Complète
```typescript
export const COLORS = {
  // Couleurs principales TripShare
  primary: {
    50: '#f0f4ff',
    100: '#e0ebff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#667eea',  // Couleur principale
    600: '#5a6fd8',
    700: '#4c5bc6',
    800: '#434190',
    900: '#3c366b',
  },

  // Violet aventure
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#764ba2',  // Violet principal
    600: '#a855f7',
    700: '#9333ea',
    800: '#7c3aed',
    900: '#6b21a8',
  },

  // Couleurs d'accent
  accent: {
    orange: '#ffa726',
    yellow: '#fbbf24',
    green: '#48bb78',
    blue: '#3b82f6',
    red: '#ef4444',
    pink: '#f093fb',
  },

  // Couleurs système
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Couleurs neutres
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Couleurs glassmorphism
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: 'rgba(102, 126, 234, 0.15)',
  },
};
```

### Typographie Système
```typescript
export const TYPOGRAPHY = {
  fonts: {
    heading: 'SF Pro Display, Roboto, system-ui, sans-serif',
    body: 'SF Pro Text, Roboto, system-ui, sans-serif',
    mono: 'SF Mono, Fira Code, monospace',
  },

  sizes: {
    xs: { fontSize: 12, lineHeight: 16 },
    sm: { fontSize: 14, lineHeight: 20 },
    base: { fontSize: 16, lineHeight: 24 },
    lg: { fontSize: 18, lineHeight: 28 },
    xl: { fontSize: 20, lineHeight: 32 },
    '2xl': { fontSize: 24, lineHeight: 36 },
    '3xl': { fontSize: 30, lineHeight: 42 },
    '4xl': { fontSize: 36, lineHeight: 48 },
    '5xl': { fontSize: 48, lineHeight: 60 },
  },

  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};
```

### Espacements & Layout
```typescript
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};
```

---

## 🧩 Architecture des Composants

### Composants UI de Base
```typescript
// Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  fullWidth?: boolean;
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

// Card Component avec glassmorphism
interface CardProps {
  variant: 'elevated' | 'outlined' | 'filled' | 'glass';
  padding?: keyof typeof SPACING;
  margin?: keyof typeof SPACING;
  borderRadius?: keyof typeof BORDER_RADIUS;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

// Input Component avancé
interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  success?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  rightElement?: React.ReactNode;
  type: 'text' | 'email' | 'password' | 'number' | 'search';
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  maxLength?: number;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

// Avatar Component avec statut
interface AvatarProps {
  source?: ImageSourcePropType;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showBorder?: boolean;
  borderColor?: string;
  fallbackText?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

// Badge Component
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle;
}
```

### Composants Spécialisés TripShare
```typescript
// ItineraryCard - Carte d'itinéraire dans le feed
interface ItineraryCardProps {
  itinerary: Itinerary;
  variant: 'compact' | 'detailed' | 'minimal';
  showAuthor?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComment: () => void;
  onPress: () => void;
  style?: ViewStyle;
}

// UserCard - Carte utilisateur/profil
interface UserCardProps {
  user: User;
  variant: 'minimal' | 'detailed' | 'suggestion';
  showFollowButton?: boolean;
  showStats?: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onPress: () => void;
  style?: ViewStyle;
}

// GroupCard - Carte groupe de voyage
interface GroupCardProps {
  group: TravelGroup;
  variant: 'preview' | 'detailed';
  showMembers?: boolean;
  showProgress?: boolean;
  onJoin?: () => void;
  onView: () => void;
  style?: ViewStyle;
}

// TimelineStep - Étape d'itinéraire
interface TimelineStepProps {
  step: ItineraryStep;
  isEditable?: boolean;
  isActive?: boolean;
  showDetails?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

// MapView - Vue carte interactive
interface MapViewProps {
  steps: ItineraryStep[];
  currentLocation?: Location;
  showUserLocation?: boolean;
  showRoute?: boolean;
  editable?: boolean;
  onAddStep?: (location: Location) => void;
  onStepPress?: (step: ItineraryStep) => void;
  onRegionChange?: (region: Region) => void;
  style?: ViewStyle;
}

// FilterPanel - Panneau de filtres avancés
interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
  visible: boolean;
}

// VotingCard - Carte de vote pour groupes
interface VotingCardProps {
  voting: VotingSession;
  userVote?: Vote;
  onVote: (optionId: string) => void;
  onViewResults: () => void;
  style?: ViewStyle;
}

// StoryViewer - Visualiseur de stories
interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onReply: (storyId: string, message: string) => void;
}
```

---

## 📱 Écrans Principaux

### 1. Navigation & Layout
```typescript
// Navigateur principal avec onglets
interface MainTabNavigatorProps {
  initialRouteName?: string;
}

// Structure des onglets
const TabScreens = {
  Home: 'HomeScreen',           // 🏠 Feed personnalisé
  Explore: 'ExploreScreen',     // 🔍 Découverte
  Create: 'CreateScreen',       // ➕ Création
  Groups: 'GroupsScreen',       // 👥 Groupes
  Profile: 'ProfileScreen',     // 👤 Profil
} as const;

// Header personnalisé avec recherche et notifications
interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
}
```

### 2. Écran Home - Feed Personnalisé
```typescript
interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

interface HomeScreenState {
  stories: Story[];
  feed: FeedItem[];
  refreshing: boolean;
  loading: boolean;
  filters: SearchFilters;
  showFilterPanel: boolean;
}

// Composants de l'écran Home
const HomeScreen: React.FC<HomeScreenProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec recherche */}
      <AppHeader 
        showSearch 
        showNotifications 
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
      />

      {/* Stories horizontales */}
      <StoriesSection 
        stories={stories}
        onStoryPress={handleStoryPress}
        onAddStory={handleAddStory}
      />

      {/* Filtres rapides */}
      <QuickFilters 
        activeFilters={filters}
        onFilterPress={handleFilterPress}
        onShowAll={handleShowAllFilters}
      />

      {/* Feed principal avec pull-to-refresh */}
      <FeedList 
        data={feed}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onItemPress={handleItemPress}
        refreshing={refreshing}
        loading={loading}
      />

      {/* Panneau de filtres modal */}
      <FilterPanel 
        visible={showFilterPanel}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClose={handleCloseFilters}
      />
    </SafeAreaView>
  );
};
```

### 3. Écran Explore - Découverte
```typescript
interface ExploreScreenState {
  searchQuery: string;
  searchResults: SearchResult[];
  trendingDestinations: Destination[];
  featuredItineraries: Itinerary[];
  nearbyUsers: User[];
  loading: boolean;
  activeTab: 'all' | 'destinations' | 'itineraries' | 'users';
}

const ExploreScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Barre de recherche avancée */}
      <SearchHeader 
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onVoiceSearch={handleVoiceSearch}
        onFilterPress={handleFilterPress}
      />

      {/* Onglets de recherche */}
      <SearchTabs 
        activeTab={activeTab}
        onTabPress={setActiveTab}
        counts={{
          all: searchResults.length,
          destinations: destinationResults.length,
          itineraries: itineraryResults.length,
          users: userResults.length,
        }}
      />

      {/* Contenu selon l'onglet actif */}
      <TabView>
        <AllTab>
          <TrendingSection destinations={trendingDestinations} />
          <FeaturedSection itineraries={featuredItineraries} />
          <NearbySection users={nearbyUsers} />
        </AllTab>
        
        <DestinationsTab results={destinationResults} />
        <ItinerariesTab results={itineraryResults} />
        <UsersTab results={userResults} />
      </TabView>
    </SafeAreaView>
  );
};
```

### 4. Écran Create - Création d'Itinéraire
```typescript
interface CreateScreenState {
  itinerary: Partial<Itinerary>;
  currentStep: 'basic' | 'timeline' | 'details' | 'preview';
  steps: ItineraryStep[];
  selectedLocation?: Location;
  showMap: boolean;
  isDirty: boolean;
}

const CreateScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec progress et actions */}
      <CreateHeader 
        currentStep={currentStep}
        onBack={handleBack}
        onSave={handleSave}
        onPreview={handlePreview}
        isDirty={isDirty}
      />

      {/* Stepper de progression */}
      <ProgressStepper 
        steps={['Infos', 'Timeline', 'Détails', 'Aperçu']}
        currentStep={stepIndex}
        onStepPress={handleStepPress}
      />

      {/* Contenu selon l'étape */}
      <StepContent>
        {currentStep === 'basic' && (
          <BasicInfoForm 
            data={itinerary}
            onUpdate={handleBasicUpdate}
            onNext={handleNextStep}
          />
        )}

        {currentStep === 'timeline' && (
          <TimelineEditor 
            steps={steps}
            onAddStep={handleAddStep}
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
            onReorder={handleReorderSteps}
            showMap={showMap}
            onToggleMap={setShowMap}
          />
        )}

        {currentStep === 'details' && (
          <DetailsForm 
            data={itinerary}
            onUpdate={handleDetailsUpdate}
            onNext={handleNextStep}
          />
        )}

        {currentStep === 'preview' && (
          <PreviewItinerary 
            itinerary={itinerary}
            steps={steps}
            onEdit={handleEdit}
            onPublish={handlePublish}
          />
        )}
      </StepContent>

      {/* Map modal pour sélection de lieux */}
      <MapModal 
        visible={showMap}
        steps={steps}
        onAddLocation={handleAddLocation}
        onClose={() => setShowMap(false)}
      />
    </SafeAreaView>
  );
};
```

### 5. Écran Groups - Groupes de Voyage
```typescript
interface GroupsScreenState {
  activeTab: 'my-groups' | 'invitations' | 'discover';
  myGroups: TravelGroup[];
  invitations: GroupInvitation[];
  suggestedGroups: TravelGroup[];
  loading: boolean;
}

const GroupsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec création rapide */}
      <GroupsHeader 
        onCreateGroup={handleCreateGroup}
        onSearch={handleSearchGroups}
      />

      {/* Onglets */}
      <GroupsTabs 
        activeTab={activeTab}
        onTabPress={setActiveTab}
        invitationCount={invitations.length}
      />

      {/* Contenu selon l'onglet */}
      <TabContent>
        {activeTab === 'my-groups' && (
          <MyGroupsList 
            groups={myGroups}
            onGroupPress={handleGroupPress}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'invitations' && (
          <InvitationsList 
            invitations={invitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverGroups 
            groups={suggestedGroups}
            onJoinRequest={handleJoinRequest}
            onLoadMore={handleLoadMore}
          />
        )}
      </TabContent>

      {/* FAB pour création rapide */}
      <FloatingActionButton 
        icon="plus"
        onPress={handleCreateGroup}
        style={styles.fab}
      />
    </SafeAreaView>
  );
};
```

### 6. Écran Profile - Profil Utilisateur
```typescript
interface ProfileScreenState {
  user: User;
  isOwnProfile: boolean;
  activeTab: 'posts' | 'saved' | 'stats' | 'reviews';
  posts: Post[];
  savedItineraries: Itinerary[];
  userStats: UserStats;
  reviews: Review[];
  following: boolean;
  loading: boolean;
}

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header du profil */}
      <ProfileHeader 
        user={user}
        isOwnProfile={isOwnProfile}
        following={following}
        onFollow={handleFollow}
        onMessage={handleMessage}
        onEdit={handleEditProfile}
        onSettings={handleSettings}
        onShare={handleShareProfile}
      />

      {/* Stats rapides */}
      <ProfileStats 
        stats={user.stats}
        onStatsPress={handleStatsPress}
      />

      {/* Bio et badges */}
      <ProfileInfo 
        bio={user.bio}
        badges={user.badges}
        verifications={user.verifications}
      />

      {/* Onglets de contenu */}
      <ProfileTabs 
        activeTab={activeTab}
        onTabPress={setActiveTab}
        counts={{
          posts: posts.length,
          saved: savedItineraries.length,
          reviews: reviews.length,
        }}
      />

      {/* Contenu selon l'onglet */}
      <TabContent>
        {activeTab === 'posts' && (
          <PostsGrid 
            posts={posts}
            onPostPress={handlePostPress}
            onLoadMore={handleLoadMore}
          />
        )}

        {activeTab === 'saved' && (
          <SavedItineraries 
            itineraries={savedItineraries}
            onItineraryPress={handleItineraryPress}
          />
        )}

        {activeTab === 'stats' && (
          <DetailedStats 
            stats={userStats}
            timeframe="year"
            onTimeframeChange={handleTimeframeChange}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsList 
            reviews={reviews}
            onReviewPress={handleReviewPress}
          />
        )}
      </TabContent>
    </SafeAreaView>
  );
};
```

---

## 📝 Types TypeScript

### Types de Base
```typescript
// Utilisateur
interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: Location;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Stats publiques
  stats: {
    followersCount: number;
    followingCount: number;
    itinerariesCount: number;
    tripsCompleted: number;
    countriesVisited: number;
    totalDistance: number;
    carbonFootprint: number;
  };
  
  // Préférences
  preferences: {
    travelStyle: TravelStyle[];
    budgetRange: [number, number];
    interests: string[];
    languages: string[];
    accessibility: AccessibilityNeeds;
  };
  
  // Badges et certifications
  badges: Badge[];
  verifications: Verification[];
}

// Itinéraire
interface Itinerary {
  id: string;
  authorId: string;
  author: User;
  title: string;
  description: string;
  coverImage?: string;
  images: string[];
  
  // Métadonnées de voyage
  destination: Destination;
  duration: number; // jours
  budget: {
    amount: number;
    currency: string;
    breakdown: BudgetBreakdown;
  };
  season: Season[];
  difficulty: DifficultyLevel;
  travelStyle: TravelStyle[];
  groupSize: {
    min: number;
    max: number;
    optimal: number;
  };
  
  // Contenu
  steps: ItineraryStep[];
  highlights: string[];
  tips: string[];
  warnings: string[];
  
  // Métadonnées système
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'friends';
  featured: boolean;
  verified: boolean;
  
  // Engagement
  likes: number;
  saves: number;
  views: number;
  shares: number;
  rating: number;
  reviewsCount: number;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Étape d'itinéraire
interface ItineraryStep {
  id: string;
  itineraryId: string;
  order: number;
  
  // Localisation
  location: Location;
  address: string;
  
  // Timing
  startDate?: Date;
  endDate?: Date;
  duration: number; // heures
  
  // Contenu
  title: string;
  description: string;
  images: string[];
  activities: Activity[];
  
  // Logistique
  transportation?: Transportation;
  accommodation?: Accommodation;
  budget?: {
    amount: number;
    currency: string;
    category: BudgetCategory;
  };
  
  // Notes
  publicNotes?: string;
  privateNotes?: string;
  tips: string[];
}

// Groupe de voyage
interface TravelGroup {
  id: string;
  name: string;
  description?: string;
  image?: string;
  
  // Membres
  creatorId: string;
  creator: User;
  members: GroupMember[];
  invitations: GroupInvitation[];
  maxMembers: number;
  
  // Itinéraire
  itinerary?: Itinerary;
  destination?: Destination;
  tentativeDates?: {
    start: Date;
    end: Date;
  };
  
  // Préférences groupe
  preferences: GroupPreferences;
  budget: SharedBudget;
  
  // État
  status: GroupStatus;
  phase: GroupPhase;
  
  // Collaboration
  votingSessions: VotingSession[];
  decisions: GroupDecision[];
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

// Session de vote
interface VotingSession {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  type: VotingType;
  
  // Options
  options: VotingOption[];
  
  // Configuration
  allowMultiple: boolean;
  anonymous: boolean;
  deadline?: Date;
  minVotes?: number;
  
  // État
  status: 'active' | 'completed' | 'cancelled';
  result?: VotingResult;
  
  // Votes
  votes: Vote[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Types d'Interaction Sociale
```typescript
// Post/Publication
interface Post {
  id: string;
  authorId: string;
  author: User;
  type: PostType;
  
  // Contenu
  content?: string;
  images: string[];
  location?: Location;
  
  // Référence (si partage d'itinéraire, etc.)
  relatedItinerary?: Itinerary;
  relatedGroup?: TravelGroup;
  
  // Engagement
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  
  // État
  isLiked: boolean;
  isSaved: boolean;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

// Commentaire
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  parentId?: string; // Pour les réponses
  
  // Engagement
  likes: number;
  replies: number;
  isLiked: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Story de voyage
interface Story {
  id: string;
  authorId: string;
  author: User;
  
  // Contenu
  type: 'image' | 'video' | 'text';
  content: string;
  media?: string;
  location?: Location;
  
  // Métadonnées
  duration: number; // secondes pour l'affichage
  createdAt: Date;
  expiresAt: Date;
  
  // Engagement
  views: number;
  replies: StoryReply[];
}

// Notification
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  
  // Contenu
  title: string;
  message: string;
  image?: string;
  
  // Action
  actionType?: string;
  actionData?: any;
  deepLink?: string;
  
  // État
  read: boolean;
  
  createdAt: Date;
}
```

### Types Énumérés
```typescript
enum TravelStyle {
  ADVENTURE = 'adventure',
  LUXURY = 'luxury',
  BUDGET = 'budget',
  CULTURAL = 'cultural',
  CULINARY = 'culinary',
  NATURE = 'nature',
  URBAN = 'urban',
  RELAXATION = 'relaxation',
  FAMILY = 'family',
  SOLO = 'solo',
  ROMANTIC = 'romantic',
  BUSINESS = 'business',
}

enum DifficultyLevel {
  EASY = 1,
  MODERATE = 2,
  CHALLENGING = 3,
  DIFFICULT = 4,
  EXTREME = 5,
}

enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

enum PostType {
  ITINERARY_SHARE = 'itinerary_share',
  PHOTO = 'photo',
  VIDEO = 'video',
  TIP = 'tip',
  QUESTION = 'question',
  REVIEW = 'review',
  LIVE_UPDATE = 'live_update',
}

enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  MENTION = 'mention',
  GROUP_INVITATION = 'group_invitation',
  VOTE_REMINDER = 'vote_reminder',
  TRIP_REMINDER = 'trip_reminder',
  PRICE_ALERT = 'price_alert',
  WEATHER_ALERT = 'weather_alert',
}

enum GroupStatus {
  PLANNING = 'planning',
  VOTING = 'voting',
  CONFIRMED = 'confirmed',
  TRAVELING = 'traveling',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

---

## 🏪 État Global & Store

### Configuration Zustand
```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Store principal d'authentification
interface AuthStore {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  
  // Sélecteurs
  getUser: () => User | null;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        
        // Actions
        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authAPI.login(credentials);
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error.message, 
              isLoading: false 
            });
          }
        },
        
        logout: async () => {
          await authAPI.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });
        },
        
        register: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authAPI.register(data);
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error.message, 
              isLoading: false 
            });
          }
        },
        
        updateProfile: async (data) => {
          const currentUser = get().user;
          if (!currentUser) return;
          
          set({ isLoading: true });
          try {
            const updatedUser = await userAPI.updateProfile(currentUser.id, data);
            set({ 
              user: updatedUser, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error.message, 
              isLoading: false 
            });
          }
        },
        
        clearError: () => set({ error: null }),
        
        // Sélecteurs
        getUser: () => get().user,
        isLoggedIn: () => get().isAuthenticated,
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Store pour les itinéraires
interface ItineraryStore {
  // État
  feed: Itinerary[];
  myItineraries: Itinerary[];
  savedItineraries: Itinerary[];
  currentItinerary: Itinerary | null;
  filters: SearchFilters;
  loading: boolean;
  
  // Actions
  loadFeed: (refresh?: boolean) => Promise<void>;
  loadMyItineraries: () => Promise<void>;
  loadSavedItineraries: () => Promise<void>;
  createItinerary: (data: CreateItineraryData) => Promise<Itinerary>;
  updateItinerary: (id: string, data: Partial<Itinerary>) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  likeItinerary: (id: string) => Promise<void>;
  saveItinerary: (id: string) => Promise<void>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  
  // Sélecteurs
  getFeedItemById: (id: string) => Itinerary | undefined;
  getFilteredFeed: () => Itinerary[];
}

export const useItineraryStore = create<ItineraryStore>()(
  devtools((set, get) => ({
    // État initial
    feed: [],
    myItineraries: [],
    savedItineraries: [],
    currentItinerary: null,
    filters: {},
    loading: false,
    
    // Actions
    loadFeed: async (refresh = false) => {
      if (refresh) {
        set({ feed: [], loading: true });
      } else {
        set({ loading: true });
      }
      
      try {
        const itineraries = await itineraryAPI.getFeed(get().filters);
        set({ 
          feed: refresh ? itineraries : [...get().feed, ...itineraries],
          loading: false 
        });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },
    
    createItinerary: async (data) => {
      try {
        const newItinerary = await itineraryAPI.create(data);
        set({ 
          myItineraries: [newItinerary, ...get().myItineraries],
          currentItinerary: newItinerary,
        });
        return newItinerary;
      } catch (error) {
        throw error;
      }
    },
    
    likeItinerary: async (id) => {
      // Optimistic update
      const feed = get().feed.map(item => 
        item.id === id 
          ? { ...item, likes: item.likes + 1, isLiked: true }
          : item
      );
      set({ feed });
      
      try {
        await itineraryAPI.like(id);
      } catch (error) {
        // Revert on error
        const revertedFeed = get().feed.map(item => 
          item.id === id 
            ? { ...item, likes: item.likes - 1, isLiked: false }
            : item
        );
        set({ feed: revertedFeed });
        throw error;
      }
    },
    
    setFilters: (filters) => {
      set({ filters: { ...get().filters, ...filters } });
    },
    
    // Sélecteurs
    getFeedItemById: (id) => {
      return get().feed.find(item => item.id === id);
    },
    
    getFilteredFeed: () => {
      const { feed, filters } = get();
      return feed.filter(item => {
        // Appliquer les filtres
        if (filters.destination && !item.destination.name.includes(filters.destination)) {
          return false;
        }
        if (filters.budget_range && (
          item.budget.amount < filters.budget_range[0] || 
          item.budget.amount > filters.budget_range[1]
        )) {
          return false;
        }
        return true;
      });
    },
  }))
);

// Store pour les groupes
interface GroupStore {
  myGroups: TravelGroup[];
  invitations: GroupInvitation[];
  currentGroup: TravelGroup | null;
  loading: boolean;
  
  loadMyGroups: () => Promise<void>;
  loadInvitations: () => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<TravelGroup>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  inviteMembers: (groupId: string, userIds: string[]) => Promise<void>;
  vote: (sessionId: string, optionId: string) => Promise<void>;
}

export const useGroupStore = create<GroupStore>()(
  devtools((set, get) => ({
    myGroups: [],
    invitations: [],
    currentGroup: null,
    loading: false,
    
    loadMyGroups: async () => {
      set({ loading: true });
      try {
        const groups = await groupAPI.getMyGroups();
        set({ myGroups: groups, loading: false });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },
    
    createGroup: async (data) => {
      try {
        const newGroup = await groupAPI.create(data);
        set({ 
          myGroups: [newGroup, ...get().myGroups],
          currentGroup: newGroup,
        });
        return newGroup;
      } catch (error) {
        throw error;
      }
    },
    
    vote: async (sessionId, optionId) => {
      try {
        await groupAPI.vote(sessionId, optionId);
        // Mettre à jour le groupe actuel avec les nouveaux votes
        const updatedGroup = await groupAPI.getGroup(get().currentGroup?.id);
        set({ currentGroup: updatedGroup });
      } catch (error) {
        throw error;
      }
    },
  }))
);
```

---

## 🌐 Services API

### Configuration de Base
```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';

// Configuration Axios
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'auth
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }
}

export const apiClient = new APIClient();
```

### Services Spécialisés
```typescript
// Service d'authentification
export class AuthAPI {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post('/auth/register', data);
  }

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  }

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post('/auth/refresh');
  }

  async forgotPassword(email: string): Promise<void> {
    return apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    return apiClient.post('/auth/reset-password', { token, password });
  }
}

// Service utilisateurs
export class UserAPI {
  async getProfile(userId: string): Promise<User> {
    return apiClient.get(`/users/${userId}`);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return apiClient.put(`/users/${userId}`, data);
  }

  async uploadAvatar(userId: string, imageUri: string): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    return apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async searchUsers(query: string, filters?: UserSearchFilters): Promise<User[]> {
    return apiClient.get('/users/search', { query, ...filters });
  }

  async followUser(userId: string): Promise<void> {
    return apiClient.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<void> {
    return apiClient.delete(`/users/${userId}/follow`);
  }

  async getFollowers(userId: string): Promise<User[]> {
    return apiClient.get(`/users/${userId}/followers`);
  }

  async getFollowing(userId: string): Promise<User[]> {
    return apiClient.get(`/users/${userId}/following`);
  }
}

// Service itinéraires
export class ItineraryAPI {
  async getFeed(filters?: SearchFilters, page = 1): Promise<Itinerary[]> {
    return apiClient.get('/itineraries/feed', { ...filters, page });
  }

  async getItinerary(id: string): Promise<Itinerary> {
    return apiClient.get(`/itineraries/${id}`);
  }

  async create(data: CreateItineraryData): Promise<Itinerary> {
    return apiClient.post('/itineraries', data);
  }

  async update(id: string, data: Partial<Itinerary>): Promise<Itinerary> {
    return apiClient.put(`/itineraries/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/itineraries/${id}`);
  }

  async like(id: string): Promise<void> {
    return apiClient.post(`/itineraries/${id}/like`);
  }

  async unlike(id: string): Promise<void> {
    return apiClient.delete(`/itineraries/${id}/like`);
  }

  async save(id: string): Promise<void> {
    return apiClient.post(`/itineraries/${id}/save`);
  }

  async unsave(id: string): Promise<void> {
    return apiClient.delete(`/itineraries/${id}/save`);
  }

  async getComments(id: string): Promise<Comment[]> {
    return apiClient.get(`/itineraries/${id}/comments`);
  }

  async addComment(id: string, content: string, parentId?: string): Promise<Comment> {
    return apiClient.post(`/itineraries/${id}/comments`, { content, parentId });
  }

  async search(query: string, filters?: SearchFilters): Promise<Itinerary[]> {
    return apiClient.get('/itineraries/search', { query, ...filters });
  }

  async getMyItineraries(): Promise<Itinerary[]> {
    return apiClient.get('/itineraries/mine');
  }

  async getSavedItineraries(): Promise<Itinerary[]> {
    return apiClient.get('/itineraries/saved');
  }
}

// Service groupes
export class GroupAPI {
  async getMyGroups(): Promise<TravelGroup[]> {
    return apiClient.get('/groups/mine');
  }

  async getGroup(id: string): Promise<TravelGroup> {
    return apiClient.get(`/groups/${id}`);
  }

  async create(data: CreateGroupData): Promise<TravelGroup> {
    return apiClient.post('/groups', data);
  }

  async update(id: string, data: Partial<TravelGroup>): Promise<TravelGroup> {
    return apiClient.put(`/groups/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/groups/${id}`);
  }

  async join(id: string): Promise<void> {
    return apiClient.post(`/groups/${id}/join`);
  }

  async leave(id: string): Promise<void> {
    return apiClient.post(`/groups/${id}/leave`);
  }

  async inviteMembers(id: string, userIds: string[]): Promise<void> {
    return apiClient.post(`/groups/${id}/invite`, { userIds });
  }

  async respondToInvitation(invitationId: string, accept: boolean): Promise<void> {
    return apiClient.post(`/groups/invitations/${invitationId}/respond`, { accept });
  }

  async createVoting(groupId: string, data: CreateVotingData): Promise<VotingSession> {
    return apiClient.post(`/groups/${groupId}/voting`, data);
  }

  async vote(sessionId: string, optionId: string): Promise<void> {
    return apiClient.post(`/voting/${sessionId}/vote`, { optionId });
  }

  async getVotingResults(sessionId: string): Promise<VotingResult> {
    return apiClient.get(`/voting/${sessionId}/results`);
  }
}

// Export des instances
export const authAPI = new AuthAPI();
export const userAPI = new UserAPI();
export const itineraryAPI = new ItineraryAPI();
export const groupAPI = new GroupAPI();
```

---

## 🎣 Hooks Personnalisés

### Hooks d'API avec React Query
```typescript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authAPI, userAPI, itineraryAPI, groupAPI } from '../services/api';

// Hook pour le feed d'itinéraires
export const useFeed = (filters?: SearchFilters) => {
  return useQuery(
    ['feed', filters],
    () => itineraryAPI.getFeed(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );
};

// Hook pour un itinéraire spécifique
export const useItinerary = (id: string) => {
  return useQuery(
    ['itinerary', id],
    () => itineraryAPI.getItinerary(id),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
    }
  );
};

// Hook pour créer un itinéraire
export const useCreateItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: CreateItineraryData) => itineraryAPI.create(data),
    {
      onSuccess: (newItinerary) => {
        // Invalider le cache du feed
        queryClient.invalidateQueries(['feed']);
        // Ajouter le nouvel itinéraire au cache
        queryClient.setQueryData(['itinerary', newItinerary.id], newItinerary);
      },
    }
  );
};

// Hook pour liker un itinéraire
export const useLikeItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => itineraryAPI.like(id),
    {
      onMutate: async (id) => {
        // Mise à jour optimiste
        await queryClient.cancelQueries(['itinerary', id]);
        
        const previousItinerary = queryClient.getQueryData(['itinerary', id]);
        
        queryClient.setQueryData(['itinerary', id], (old: Itinerary) => ({
          ...old,
          likes: old.likes + 1,
          isLiked: true,
        }));

        return { previousItinerary };
      },
      onError: (err, id, context) => {
        // Revert en cas d'erreur
        queryClient.setQueryData(['itinerary', id], context?.previousItinerary);
      },
      onSettled: (data, error, id) => {
        queryClient.invalidateQueries(['itinerary', id]);
      },
    }
  );
};

// Hook pour les groupes de l'utilisateur
export const useMyGroups = () => {
  return useQuery(
    ['groups', 'mine'],
    () => groupAPI.getMyGroups(),
    {
      staleTime: 2 * 60 * 1000,
    }
  );
};

// Hook pour rejoindre un groupe
export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (groupId: string) => groupAPI.join(groupId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['groups']);
      },
    }
  );
};

// Hook pour voter
export const useVote = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ sessionId, optionId }: { sessionId: string; optionId: string }) =>
      groupAPI.vote(sessionId, optionId),
    {
      onSuccess: (data, variables) => {
        // Invalider les données du groupe pour rafraîchir les votes
        queryClient.invalidateQueries(['voting', variables.sessionId]);
        queryClient.invalidateQueries(['groups']);
      },
    }
  );
};
```

### Hooks d'UI et d'État
```typescript
// Hook pour gérer l'état des filtres
export const useFilters = (initialFilters?: SearchFilters) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [isActive, setIsActive] = useState(false);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setIsActive(true);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setIsActive(false);
  }, []);

  const applyFilters = useCallback(() => {
    setIsActive(Object.keys(filters).length > 0);
  }, [filters]);

  return {
    filters,
    isActive,
    updateFilter,
    resetFilters,
    applyFilters,
    setFilters,
  };
};

// Hook pour gérer la recherche avec debounce
export const useSearch = (delay: number = 500) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch,
    isSearching: query !== debouncedQuery,
  };
};

// Hook pour gérer la géolocalisation
export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission de localisation refusée');
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
};

// Hook pour gérer l'upload d'images
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = useCallback(async (imageUri: string): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulation de l'upload avec progression
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      // Utiliser votre service d'upload (Cloudinary, AWS S3, etc.)
      const response = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        },
      });

      return response.imageUrl;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadImage,
  };
};

// Hook pour les notifications push
export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<any>(false);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    return () => subscription.remove();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.primary[500],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permissions de notification refusées');
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  };

  return {
    expoPushToken,
    notification,
  };
};
```

---

## 🎬 Animations & Micro-interactions

### Configuration des Animations
```typescript
import { Easing } from 'react-native-reanimated';

export const ANIMATION_CONFIG = {
  durations: {
    fast: 200,
    medium: 300,
    slow: 500,
    verySlow: 800,
  },
  
  easing: {
    easeOut: Easing.out(Easing.quad),
    easeIn: Easing.in(Easing.quad),
    easeInOut: Easing.inOut(Easing.quad),
    spring: Easing.elastic(1),
  },
  
  springs: {
    gentle: {
      damping: 20,
      stiffness: 90,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
    },
    stiff: {
      damping: 30,
      stiffness: 200,
    },
  },
};

// Animations d'entrée pour les écrans
export const screenAnimations = {
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },
  
  slideFromBottom: {
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
      };
    },
  },
  
  fadeIn: {
    cardStyleInterpolator: ({ current }) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
      };
    },
  },
};
```

### Composants Animés
```typescript
// Hook pour l'animation de shake (erreur)
export const useShakeAnimation = () => {
  const shakeValue = useSharedValue(0);

  const shake = useCallback(() => {
    shakeValue.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 })
    );
  }, [shakeValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeValue.value }],
    };
  });

  return { animatedStyle, shake };
};

// Hook pour l'animation de scale (press)
export const useScaleAnimation = (scale: number = 0.95) => {
  const scaleValue = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scaleValue.value = withSpring(scale, ANIMATION_CONFIG.springs.gentle);
  }, [scale, scaleValue]);

  const onPressOut = useCallback(() => {
    scaleValue.value = withSpring(1, ANIMATION_CONFIG.springs.gentle);
  }, [scaleValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  return { animatedStyle, onPressIn, onPressOut };
};

// Composant Button avec animations
export const AnimatedButton: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  ...props
}) => {
  const { animatedStyle, onPressIn, onPressOut } = useScaleAnimation();
  const { animatedStyle: shakeStyle, shake } = useShakeAnimation();

  const handlePress = useCallback(() => {
    if (disabled || loading) {
      shake();
      return;
    }
    onPress();
  }, [disabled, loading, onPress, shake]);

  return (
    <Animated.View style={[animatedStyle, shakeStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.button,
          styles[`button_${variant}`],
          styles[`button_${size}`],
          disabled && styles.button_disabled,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
};

// Animation de like avec particules
export const useLikeAnimation = () => {
  const scaleValue = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  const particlesOpacity = useSharedValue(0);

  const triggerLike = useCallback(() => {
    // Animation du cœur
    scaleValue.value = withSequence(
      withSpring(1.3, ANIMATION_CONFIG.springs.bouncy),
      withSpring(1, ANIMATION_CONFIG.springs.gentle)
    );
    
    // Animation de rotation
    rotateValue.value = withSpring(360, ANIMATION_CONFIG.springs.gentle);
    
    // Animation des particules
    particlesOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 800 })
    );
    
    // Reset la rotation
    setTimeout(() => {
      rotateValue.value = 0;
    }, 1000);
  }, [scaleValue, rotateValue, particlesOpacity]);

  const heartStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { rotateZ: `${rotateValue.value}deg` },
      ],
    };
  });

  const particlesStyle = useAnimatedStyle(() => {
    return {
      opacity: particlesOpacity.value,
    };
  });

  return { heartStyle, particlesStyle, triggerLike };
};

// Animation de pull-to-refresh personnalisée
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return {
    refreshing,
    handleRefresh,
    animatedStyle,
  };
};
```

---

## 🤖 Guide pour l'IA

### Prompts Optimisés pour Développement

#### 1. Prompt pour Création de Composants
```
Tu es un développeur React Native expert specialisé dans TripShare. 

Crée le composant [NOM_COMPOSANT] selon ces spécifications :

DESIGN SYSTEM :
- Utilise les tokens de COLORS, TYPOGRAPHY, SPACING définis
- Style glassmorphism avec COLORS.glass
- Animations fluides avec react-native-reanimated
- Support dark/light mode

FONCTIONNALITÉS :
[Détailler les fonctionnalités spécifiques]

PROPS INTERFACE :
```typescript
interface [NOM_COMPOSANT]Props {
  // [Définir les props nécessaires]
}
```

CONTRAINTES :
- TypeScript strict
- Performances optimales (useMemo, useCallback)
- Accessibilité (testID, accessibility labels)
- Responsive design
- Tests unitaires
- Documentation JSDoc

EXEMPLE D'USAGE :
```tsx
<[NOM_COMPOSANT] 
  prop1="value1"
  onAction={handleAction}
  style={styles.custom}
/>
```

Génère le code complet avec styles, hooks et tests.
```

#### 2. Prompt pour API Integration
```
Tu développes l'intégration API pour TripShare.

Crée le service [NOM_SERVICE] avec ces endpoints :

BASE URL : ${API_BASE_URL}
AUTHENTICATION : Bearer token

ENDPOINTS :
[Lister les endpoints avec méthodes HTTP]

TYPES :
```typescript
// [Définir les types de requête/réponse]
```

GESTION D'ERREUR :
- Retry automatique 3 fois
- Timeout 10 secondes
- Cache avec React Query
- Fallback offline

SÉCURITÉ :
- Validation des données
- Sanitization des inputs
- Rate limiting côté client

Génère le service complet avec types, tests et documentation.
```

#### 3. Prompt pour Écrans Complets
```
Développe l'écran [NOM_ÉCRAN] pour TripShare.

NAVIGATION :
- Stack : [préciser le stack]
- Params : [types des paramètres]
- Transitions : [type d'animation]

LAYOUT :
- Header : [spécifications]
- Content : [description du contenu]
- Footer/Tabs : [si applicable]

ÉTAT :
- Store Zustand : [stores utilisés]
- Local state : [état local]
- API calls : [appels API nécessaires]

FONCTIONNALITÉS :
[Détailler chaque fonctionnalité]

UX/UI :
- Pull-to-refresh
- Infinite scroll si applicable
- Loading states
- Empty states
- Error states

COMPOSANTS RÉUTILISÉS :
[Lister les composants du design system]

Génère l'écran complet avec navigation, hooks et styles.
```

#### 4. Prompt pour Optimisation Performance
```
Optimise ce composant TripShare pour les performances :

[COLLER LE CODE EXISTANT]

CRITÈRES D'OPTIMISATION :
- Réduction des re-renders
- Mémorisation appropriée
- Lazy loading
- Bundle size
- Memory leaks prevention

MÉTRIQUES CIBLES :
- Temps de rendu < 16ms
- Bundle impact < 50kb
- Memory stable

Fournis le code optimisé avec explications des améliorations.
```

### Structure des Dossiers Recommandée
```
src/
├── components/
│   ├── ui/                    # Design system components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── index.ts
│   ├── travel/               # Composants spécifiques voyage
│   │   ├── ItineraryCard/
│   │   ├── MapView/
│   │   ├── TimelineStep/
│   │   └── index.ts
│   └── social/               # Composants sociaux
│       ├── UserCard/
│       ├── GroupCard/
│       └── index.ts
├── screens/
│   ├── Auth/
│   ├── Home/
│   ├── Explore/
│   ├── Create/
│   └── Profile/
├── navigation/
│   ├── AppNavigator.tsx
│   ├── TabNavigator.tsx
│   └── types.ts
├── store/
│   ├── authStore.ts
│   ├── itineraryStore.ts
│   └── groupStore.ts
├── services/
│   ├── api/
│   └── storage/
├── hooks/
│   ├── useApi.ts
│   ├── useLocation.ts
│   └── useAnimation.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   └── validation.ts
├── types/
│   ├── api.ts
│   ├── navigation.ts
│   └── store.ts
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

### Checklist de Développement
```markdown
## 📋 Checklist Composant TripShare

### ✅ Code Quality
- [ ] TypeScript strict mode
- [ ] Props interface définie
- [ ] Gestion d'erreurs
- [ ] Tests unitaires
- [ ] Documentation JSDoc

### 🎨 Design System
- [ ] Tokens de couleurs respectés
- [ ] Typographie cohérente
- [ ] Espacements standardisés
- [ ] Support dark/light mode
- [ ] Glassmorphism si applicable

### 📱 UX/UI
- [ ] Responsive design
- [ ] Animations fluides
- [ ] États loading/error/empty
- [ ] Feedback utilisateur
- [ ] Accessibilité

### ⚡ Performance
- [ ] useMemo pour calculs coûteux
- [ ] useCallback pour handlers
- [ ] Lazy loading si applicable
- [ ] Image optimization
- [ ] Bundle size check

### 🔧 Intégration
- [ ] Store Zustand connecté
- [ ] API calls avec React Query
- [ ] Navigation setup
- [ ] Error boundaries
- [ ] Offline support

### 🧪 Tests
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration
- [ ] Tests E2E critiques
- [ ] Performance tests
- [ ] Accessibilité tests
```

### Variables d'Environnement
```typescript
// .env.example
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=ws://localhost:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_VERSION=1.0.0
```

---

## 🚀 Actions Suivantes

### Phase 1 : Setup Initial (Semaine 1-2)
1. **Initialisation projet** avec Expo
2. **Setup navigation** React Navigation v6
3. **Configuration store** Zustand + React Query
4. **Design system** composants de base
5. **Authentification** écrans + service

### Phase 2 : Core Features (Semaine 3-6)
1. **Écran Home** avec feed personnalisé
2. **Écran Explore** avec recherche avancée
3. **Création d'itinéraires** éditeur complet
4. **Profils utilisateur** avec stats
5. **Système social** likes, follows, comments

### Phase 3 : Fonctionnalités Avancées (Semaine 7-10)
1. **Groupes de voyage** création et collaboration
2. **Système de votes** pour groupes
3. **Chat temps réel** avec Socket.io
4. **Notifications push** avec Expo
5. **Mode offline** avec cache

### Phase 4 : Polish & Launch (Semaine 11-12)
1. **Tests complets** E2E avec Detox
2. **Performance optimization** bundle size
3. **App store** preparation
4. **Documentation** utilisateur
5. **Analytics** tracking events

---

Ce guide complet fournit tout ce dont une IA a besoin pour développer TripShare avec excellence ! 🚀

Chaque section est détaillée avec des exemples concrets, des patterns éprouvés et des bonnes pratiques. L'IA peut maintenant générer du code cohérent et de qualité production pour ton application.

Veux-tu que je développe une section spécifique ou que je crée des composants particuliers pour commencer ?