import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { StackNavigationProp } from '@react-navigation/stack';

const today = new Date().toLocaleDateString('fr-FR');

type TermsScreenProps = {
  navigation: StackNavigationProp<any>;
};

const TermsScreen: React.FC<TermsScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, { color: theme.colors.primary[0] }]}>{'< Retour'}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Conditions Générales d'Utilisation (CGU) de TripShare</Text>
        <Text style={[styles.date, { color: theme.colors.text.secondary }]}>Dernière mise à jour : {today}</Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>1. Objet</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de l'application TripShare (ci-après « l'Application ») par l'utilisateur.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>2. Inscription et Compte Utilisateur</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          L'inscription à l'Application est gratuite et réservée aux personnes majeures. L'utilisateur s'engage à fournir des informations exactes, à jour et complètes lors de la création de son compte, et à les mettre à jour en cas de modification. L'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>3. Protection des Données Personnelles (RGPD)</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          TripShare collecte et traite vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) :{'\n\n'}
          
          <Text style={styles.bold}>3.1 Consentement explicite :{'\n'}</Text>
          - Avant toute collecte, nous vous demandons votre consentement libre, éclairé et spécifique{'\n'}
          - Vous pouvez retirer votre consentement à tout moment{'\n'}
          - Le traitement de vos données de géolocalisation nécessite votre autorisation explicite{'\n\n'}
          
          <Text style={styles.bold}>3.2 Données collectées :{'\n'}</Text>
          - Données d'identification (nom, prénom, email, téléphone){'\n'}
          - Données de géolocalisation et de mobilité{'\n'}
          - Photos et contenus partagés{'\n'}
          - Données d'utilisation et préférences de voyage{'\n'}
          - Métadonnées d'analyse de contenu (pour la modération automatique){'\n\n'}
          
          <Text style={styles.bold}>3.2bis Modération automatique et protection des données :{'\n'}</Text>
          - Les images sont analysées automatiquement par des services tiers sécurisés (Sightengine){'\n'}
          - Seules les métadonnées d'analyse sont conservées, jamais les images elles-mêmes{'\n'}
          - L'analyse est effectuée de manière chiffrée et confidentielle{'\n'}
          - Aucune donnée personnelle n'est transmise lors de l'analyse de modération{'\n'}
          - Les résultats d'analyse sont supprimés après traitement{'\n\n'}
          
          <Text style={styles.bold}>3.3 Vos droits :{'\n'}</Text>
          - Droit d'accès : consulter vos données personnelles{'\n'}
          - Droit de rectification : corriger des données inexactes{'\n'}
          - Droit de suppression ("droit à l'oubli"){'\n'}
          - Droit de portabilité : récupérer vos données{'\n'}
          - Droit d'opposition et de limitation du traitement{'\n\n'}
          
          <Text style={styles.bold}>3.4 Conservation des données :{'\n'}</Text>
          - Données de compte : conservées pendant la durée active du compte + 3 ans{'\n'}
          - Données de géolocalisation : supprimées après 12 mois d'inactivité{'\n'}
          - Photos et contenus : conservés tant que publiés par l'utilisateur{'\n\n'}
          
          Pour exercer vos droits : contact@tripshare.app ou depuis les paramètres de l'application.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>4. Modération de Contenu et Règles Communautaires</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          <Text style={styles.bold}>4.1 Contenu interdit :{'\n'}</Text>
          L'utilisateur s'engage à ne pas publier de contenus :{'\n'}
          - Illicites, offensants, diffamatoires ou discriminatoires{'\n'}
          - Violant les droits d'autrui (vie privée, image, propriété intellectuelle){'\n'}
          - Contenant des données personnelles de tiers sans autorisation{'\n'}
          - Portant atteinte à l'ordre public ou aux bonnes mœurs{'\n'}
          - Présentant des armes, de la violence ou des menaces{'\n'}
          - À caractère sexuel, pornographique ou inapproprié{'\n'}
          - Montrant du contenu gore ou excessivement violent{'\n'}
          - Comportant des gestes ou symboles offensants{'\n\n'}
          
          <Text style={styles.bold}>4.2 Modération automatique intelligente :{'\n'}</Text>
          - TripShare utilise des technologies d'intelligence artificielle pour analyser automatiquement les images téléchargées{'\n'}
          - Cette modération permet de détecter et bloquer instantanément les contenus inappropriés{'\n'}
          - Les images sont analysées selon des critères stricts de sécurité et de bienveillance{'\n'}
          - Le système respecte la vie privée : les analyses sont effectuées de manière sécurisée et confidentielle{'\n\n'}
          
          <Text style={styles.bold}>4.3 Processus de validation :{'\n'}</Text>
          - <Text style={styles.bold}>Approbation automatique :</Text> Les images conformes sont approuvées instantanément{'\n'}
          - <Text style={styles.bold}>Blocage immédiat :</Text> Les contenus inappropriés sont refusés avec un message explicatif{'\n'}
          - <Text style={styles.bold}>Validation manuelle :</Text> Certaines images peuvent être mises en attente pour vérification humaine (24-48h){'\n'}
          - L'utilisateur reçoit une notification claire sur le statut de chaque image{'\n\n'}
          
          <Text style={styles.bold}>4.4 Signalement et modération humaine :{'\n'}</Text>
          - Un système de signalement reste disponible pour tout contenu inapproprié{'\n'}
          - L'équipe de modération traite les signalements sous 48h ouvrées{'\n'}
          - En cas de violation répétée, le compte peut être suspendu ou supprimé{'\n'}
          - Les décisions de modération peuvent être contestées via contact@tripshare.app{'\n\n'}
          
          <Text style={styles.bold}>4.5 Responsabilité de l'utilisateur :{'\n'}</Text>
          Malgré la modération automatique, l'utilisateur reste entièrement responsable du contenu qu'il tente de publier. TripShare agit en tant qu'hébergeur et ne peut être tenue responsable du contenu publié par les utilisateurs.{'\n\n'}
          
          <Text style={styles.bold}>4.6 Amélioration continue :{'\n'}</Text>
          Les algorithmes de modération sont constamment améliorés pour garantir une expérience sûre et positive. Les utilisateurs peuvent contribuer en signalant les erreurs de modération.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>5. Droits d'Auteur et Propriété Intellectuelle</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          <Text style={styles.bold}>5.1 Contenus protégés :{'\n'}</Text>
          Tous les contenus de l'Application (interface, logos, textes, graphismes) sont protégés par le droit d'auteur et restent la propriété exclusive de TripShare.{'\n\n'}
          
          <Text style={styles.bold}>5.2 Contenus utilisateur - Photos et images :{'\n'}</Text>
          En publiant des photos ou images, l'utilisateur déclare et garantit qu'il :{'\n'}
          - Détient tous les droits nécessaires sur le contenu partagé{'\n'}
          - A obtenu l'autorisation des personnes représentées{'\n'}
          - Respecte les droits d'auteur et droits à l'image{'\n'}
          - N'utilise pas d'images protégées sans autorisation{'\n\n'}
          
          <Text style={styles.bold}>5.3 Licence accordée :{'\n'}</Text>
          En publiant du contenu, vous accordez à TripShare une licence non-exclusive pour afficher, reproduire et distribuer ce contenu dans le cadre du service. Cette licence prend fin lors de la suppression du contenu.{'\n\n'}
          
          <Text style={styles.bold}>5.4 Sanctions :{'\n'}</Text>
          Toute violation des droits d'auteur peut entraîner la suppression immédiate du contenu et la suspension du compte utilisateur.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>6. Utilisation de l'Application</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          L'utilisateur s'engage à utiliser l'Application dans le respect des lois en vigueur. Sont notamment interdits :{'\n'}
          - L'usage commercial non autorisé{'\n'}
          - Les tentatives de piratage ou d'intrusion{'\n'}
          - La collecte automatisée de données{'\n'}
          - L'usurpation d'identité{'\n'}
          - Le spam ou envoi de messages non sollicités
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>7. Responsabilité et Limitations</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          TripShare met tout en œuvre pour assurer la disponibilité, la sécurité et la fiabilité de l'Application, mais ne saurait être tenue responsable :{'\n'}
          - Des interruptions de service, bugs ou pertes de données{'\n'}
          - Des dommages indirects liés à l'utilisation{'\n'}
          - De l'exactitude des informations partagées par les utilisateurs{'\n'}
          - Des interactions entre utilisateurs hors de la plateforme
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>8. Modification des CGU</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          TripShare se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés par notification in-app ou email 30 jours avant l'entrée en vigueur des modifications importantes. L'utilisation continue après modification vaut acceptation.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary[0] }]}>9. Droit Applicable et Litiges</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          Les présentes CGU sont soumises au droit européen et français. En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux français seront compétents.
        </Text>

        <Text style={[styles.paragraph, { color: theme.colors.text.primary }]}>
          <Text style={styles.bold}>Contact :</Text> Pour toute question relative aux présentes CGU : contact@tripshare.app{'\n\n'}
          En utilisant TripShare, vous acceptez l'ensemble des présentes conditions d'utilisation.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingTop: 66,
    paddingLeft: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 10,
    marginBottom: 18,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 19,
  },
  bold: {
    fontWeight: '600',
  },
});

export default TermsScreen; 