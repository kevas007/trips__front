import { Alert } from 'react-native';

// Types pour les règles de validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

// Messages d'erreur par défaut
const DEFAULT_MESSAGES = {
  required: 'Ce champ est obligatoire',
  minLength: (min: number) => `Minimum ${min} caractères requis`,
  maxLength: (max: number) => `Maximum ${max} caractères autorisés`,
  pattern: 'Format invalide',
  email: 'Adresse email invalide',
  password: 'Le mot de passe doit contenir au moins 8 caractères',
  passwordMatch: 'Les mots de passe ne correspondent pas',
  date: 'Date invalide',
  futureDate: 'La date doit être dans le futur',
  pastDate: 'La date doit être dans le passé',
  positiveNumber: 'Le nombre doit être positif',
  url: 'URL invalide',
};

// Validation d'un champ individuel
export const validateField = (value: string, rules: ValidationRule): ValidationResult => {
  // Validation required
  if (rules.required && (!value || value.trim().length === 0)) {
    return { isValid: false, message: DEFAULT_MESSAGES.required };
  }

  // Si le champ n'est pas requis et vide, c'est valide
  if (!rules.required && (!value || value.trim().length === 0)) {
    return { isValid: true, message: '' };
  }

  const trimmedValue = value.trim();

  // Validation minLength
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return { isValid: false, message: DEFAULT_MESSAGES.minLength(rules.minLength) };
  }

  // Validation maxLength
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return { isValid: false, message: DEFAULT_MESSAGES.maxLength(rules.maxLength) };
  }

  // Validation pattern
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return { isValid: false, message: DEFAULT_MESSAGES.pattern };
  }

  // Validation custom
  if (rules.custom) {
    const customResult = rules.custom(trimmedValue);
    if (typeof customResult === 'string') {
      return { isValid: false, message: customResult };
    }
    if (!customResult) {
      return { isValid: false, message: 'Valeur invalide' };
    }
  }

  return { isValid: true, message: '' };
};

// Validation d'un formulaire complet
export const validateForm = (data: Record<string, string>, rules: FieldValidation): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = data[fieldName] || '';
    const validation = validateField(value, fieldRules);
    
    if (!validation.isValid) {
      errors[fieldName] = validation.message;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Règles de validation prédéfinies
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
  },
  phone: {
    pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/,
  },
  url: {
    pattern: /^https?:\/\/.+/,
  },
  date: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
  },
  futureDate: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      return date > new Date();
    },
  },
  positiveNumber: {
    required: true,
    custom: (value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    },
  },
};

// Fonction utilitaire pour afficher les erreurs de validation
export const showValidationErrors = (errors: Record<string, string>) => {
  const errorMessages = Object.values(errors);
  if (errorMessages.length > 0) {
    Alert.alert(
      'Erreurs de validation',
      errorMessages.join('\n'),
      [{ text: 'OK', style: 'default' }]
    );
  }
};

// Validation spécifique pour les formulaires d'authentification
export const validateAuthForm = (data: {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}) => {
  const rules: FieldValidation = {};
  
  if (data.email !== undefined) {
    rules.email = VALIDATION_RULES.email;
  }
  
  if (data.password !== undefined) {
    rules.password = VALIDATION_RULES.password;
  }
  
  if (data.username !== undefined) {
    rules.username = VALIDATION_RULES.username;
  }
  
  if (data.firstName !== undefined) {
    rules.firstName = VALIDATION_RULES.name;
  }
  
  if (data.lastName !== undefined) {
    rules.lastName = VALIDATION_RULES.name;
  }

  const result = validateForm(data as Record<string, string>, rules);

  // Validation spéciale pour la confirmation de mot de passe
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    result.isValid = false;
    result.errors.confirmPassword = DEFAULT_MESSAGES.passwordMatch;
  }

  return result;
};

// Validation pour les formulaires de voyage
export const validateTripForm = (data: {
  title?: string;
  destination?: string;
  description?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const rules: FieldValidation = {
    title: { required: true, minLength: 3, maxLength: 100 },
    destination: { required: true, minLength: 2, maxLength: 100 },
    description: { maxLength: 500 },
    budget: { custom: (value) => {
      if (!value) return true; // Optionnel
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    }},
  };

  const result = validateForm(data as Record<string, string>, rules);

  // Validation des dates
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      result.isValid = false;
      result.errors.dateRange = 'Dates invalides';
    } else if (endDate <= startDate) {
      result.isValid = false;
      result.errors.dateRange = 'La date de fin doit être après la date de début';
    }
  }

  return result;
};
