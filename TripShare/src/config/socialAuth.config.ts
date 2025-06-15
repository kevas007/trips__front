// Configuration pour l'authentification sociale
// ⚠️ IMPORTANT: Remplacez ces valeurs par vos vraies clés API

export const SOCIAL_AUTH_CONFIG = {
  google: {
    // ⚠️ Client ID WEB configuré
    // Client OAuth créé pour la version web
    iosClientId: '976853895710-ptreuinrsoirmc3bnvhvf5rmmc53vnnb.apps.googleusercontent.com',
    androidClientId: '976853895710-ptreuinrsoirmc3bnvhvf5rmmc53vnnb.apps.googleusercontent.com',
    
    // Configuration optionnelle
    offlineAccess: true,
    hostedDomain: '', // Domaine d'entreprise si nécessaire
    forceCodeForRefreshToken: true,
  },
  
  apple: {
    // Apple Sign-In est automatiquement configuré pour iOS
    // Aucune clé API nécessaire côté client
    serviceId: 'com.tripshare.app', // Bundle ID de votre app
  }
};

// URLs pour obtenir les clés
export const SETUP_URLS = {
  google: {
    console: 'https://console.cloud.google.com/apis/credentials',
    guide: 'https://developers.google.com/identity/sign-in/android/start-integrating',
  },
  apple: {
    console: 'https://developer.apple.com/account/resources/identifiers/',
    guide: 'https://developer.apple.com/documentation/sign_in_with_apple/implementing_user_authentication_with_sign_in_with_apple',
  }
};

// Instructions de configuration Mobile uniquement
export const SETUP_INSTRUCTIONS = {
  google: `
🔧 Configuration Google Sign-In pour MOBILE (Android + iOS):

📱 ANDROID:
1. Allez sur Google Cloud Console: ${SETUP_URLS.google.console}
2. Créez un nouveau projet "TripShare"
3. Activez l'API "Google Sign-In API"
4. Créez des identifiants OAuth 2.0:
   - Type: Application Android
   - Nom: tripshare-android
   - Nom du package: com.tripshare.app (ou votre bundle ID)
   - Empreinte du certificat SHA-1: 36:9C:33:27:98:85:ED:B2:3C:3E:2A:9A:C0:02:68:06:9A:29:1E:7F

🍎 iOS:
5. Créez un autre identifiant OAuth 2.0:
   - Type: Application iOS
   - Nom: tripshare-ios
   - Bundle ID: com.tripshare.app (même que Android)

6. Copiez les Client IDs générés dans la configuration ci-dessous
7. Téléchargez google-services.json (Android) et GoogleService-Info.plist (iOS)

📁 Fichiers à placer:
- android/app/google-services.json
- ios/GoogleService-Info.plist

⚠️ IMPORTANT: Utilisez la même Bundle ID pour iOS et Android pour la cohérence
  `,
  
  apple: `
🍎 Configuration Apple Sign-In (iOS uniquement):

1. Allez sur Apple Developer Console: ${SETUP_URLS.apple.console}
2. Configurez votre App ID avec "Sign In with Apple" capability
3. Bundle ID suggéré: com.tripshare.app
4. Aucune clé côté client nécessaire pour iOS

⚠️ Prérequis:
- Compte Apple Developer payant (99$/an)
- App ID configuré avec Sign In with Apple capability
  `
};

// Fonction pour vérifier si la configuration mobile est complète
export const isConfigurationComplete = () => {
  const hasGoogleConfig = 
    SOCIAL_AUTH_CONFIG.google.iosClientId !== 'NOUVEAU_CLIENT_ID_WEB.apps.googleusercontent.com' &&
    SOCIAL_AUTH_CONFIG.google.androidClientId !== 'NOUVEAU_CLIENT_ID_WEB.apps.googleusercontent.com';
    
  const hasAppleConfig = 
    SOCIAL_AUTH_CONFIG.apple.serviceId !== 'com.tripshare.app';
    
  return {
    google: hasGoogleConfig,
    apple: hasAppleConfig,
    complete: hasGoogleConfig && hasAppleConfig
  };
};

// Logger pour la configuration
export const logConfigurationStatus = () => {
  const status = isConfigurationComplete();
  
  console.log('📱 Statut configuration authentification mobile:');
  console.log(`   Google (Android + iOS): ${status.google ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log(`   Apple (iOS): ${status.apple ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log('');
  console.log('🔑 Votre empreinte SHA-1 (Android): 36:9C:33:27:98:85:ED:B2:3C:3E:2A:9A:C0:02:68:06:9A:29:1E:7F');
  
  if (!status.complete) {
    console.log('\n📋 Instructions de configuration:');
    if (!status.google) {
      console.log(SETUP_INSTRUCTIONS.google);
    }
    if (!status.apple) {
      console.log(SETUP_INSTRUCTIONS.apple);
    }
  }
}; 