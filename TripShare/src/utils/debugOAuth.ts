import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

export const debugOAuthInfo = () => {
  const redirectUri = AuthSession.makeRedirectUri();
  const expoConfig = Constants.expoConfig || Constants.manifest;
  
  console.log('🔧 Informations OAuth Debug:');
  console.log('📱 Redirect URI:', redirectUri);
  console.log('📦 Bundle ID:', expoConfig?.ios?.bundleIdentifier || expoConfig?.android?.package);
  console.log('👤 Expo Username:', expoConfig?.owner || 'Non défini');
  console.log('📂 Slug:', expoConfig?.slug);
  
  // URI à ajouter dans Google Console
  const possibleUris = [
    redirectUri,
    `https://auth.expo.io/@${expoConfig?.owner}/${expoConfig?.slug}`,
    `com.tripshare.app://`,
    `exp://localhost:19000/--/`,
  ];
  
  console.log('📋 URIs à ajouter dans Google Console:');
  possibleUris.forEach((uri, index) => {
    console.log(`${index + 1}. ${uri}`);
  });
  
  return {
    redirectUri,
    possibleUris,
    bundleId: expoConfig?.ios?.bundleIdentifier || expoConfig?.android?.package,
    expoUsername: expoConfig?.owner,
    slug: expoConfig?.slug,
  };
}; 