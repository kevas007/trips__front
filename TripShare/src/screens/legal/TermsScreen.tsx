import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const today = new Date().toLocaleDateString('fr-FR');

const TermsScreen = ({ navigation }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Text style={styles.backButtonText}>{'< Retour'}</Text>
    </TouchableOpacity>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Conditions Générales d'Utilisation (CGU) de TripShare</Text>
      <Text style={styles.date}>Dernière mise à jour : {today}</Text>

      <Text style={styles.sectionTitle}>1. Objet</Text>
      <Text style={styles.paragraph}>
        Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de l'application TripShare (ci-après « l'Application ») par l'utilisateur.
      </Text>

      <Text style={styles.sectionTitle}>2. Inscription et Compte Utilisateur</Text>
      <Text style={styles.paragraph}>
        L'inscription à l'Application est gratuite et réservée aux personnes majeures. L'utilisateur s'engage à fournir des informations exactes, à jour et complètes lors de la création de son compte, et à les mettre à jour en cas de modification. L'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte.
      </Text>

      <Text style={styles.sectionTitle}>3. Données Personnelles et Confidentialité</Text>
      <Text style={styles.paragraph}>
        TripShare collecte et traite les données personnelles de l'utilisateur conformément au Règlement Général sur la Protection des Données (RGPD) :{''}
        - Les données collectées sont utilisées uniquement pour fournir, améliorer et sécuriser les services de l'Application.{''}
        - L'utilisateur dispose d'un droit d'accès, de rectification, de suppression, de portabilité de ses données, ainsi que d'un droit d'opposition et de limitation du traitement.{''}
        - Pour exercer ces droits, l'utilisateur peut contacter : [adresse email de contact à compléter].{''}
        - Les données ne sont jamais vendues à des tiers sans consentement explicite.{''}
        - Pour plus d'informations, consultez notre Politique de confidentialité.
      </Text>

      <Text style={styles.sectionTitle}>4. Utilisation de l'Application</Text>
      <Text style={styles.paragraph}>
        L'utilisateur s'engage à utiliser l'Application dans le respect des lois en vigueur et à ne pas publier de contenus illicites, offensants, diffamatoires, ou portant atteinte aux droits d'autrui. TripShare se réserve le droit de suspendre ou supprimer tout compte ne respectant pas ces règles.
      </Text>

      <Text style={styles.sectionTitle}>5. Propriété Intellectuelle</Text>
      <Text style={styles.paragraph}>
        Tous les contenus, marques, logos, textes, images, et éléments graphiques de l'Application sont protégés par le droit d'auteur et restent la propriété exclusive de TripShare ou de ses partenaires. Toute reproduction, représentation ou exploitation non autorisée est interdite.
      </Text>

      <Text style={styles.sectionTitle}>6. Responsabilité</Text>
      <Text style={styles.paragraph}>
        TripShare met tout en œuvre pour assurer la disponibilité, la sécurité et la fiabilité de l'Application, mais ne saurait être tenue responsable en cas d'interruption, de bug, de perte de données ou de dommages indirects liés à l'utilisation de l'Application.
      </Text>

      <Text style={styles.sectionTitle}>7. Modification des CGU</Text>
      <Text style={styles.paragraph}>
        TripShare se réserve le droit de modifier les présentes CGU à tout moment. L'utilisateur sera informé de toute modification importante par notification ou email. L'utilisation continue de l'Application après modification vaut acceptation des nouvelles CGU.
      </Text>

      <Text style={styles.sectionTitle}>8. Droit Applicable et Litiges</Text>
      <Text style={styles.paragraph}>
        Les présentes CGU sont soumises au droit de l'Union européenne et, le cas échéant, au droit français. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
      </Text>

      <Text style={styles.paragraph}>
        En utilisant TripShare, vous acceptez l'ensemble des présentes conditions d'utilisation.
      </Text>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    paddingTop: 66,
    paddingLeft: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#4e54c8',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 6,
    color: '#4e54c8',
  },
  paragraph: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
    lineHeight: 22,
  },
});

export default TermsScreen; 