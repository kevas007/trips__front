export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
  }
  
  if (username.length > 20) {
    errors.push('Le nom d\'utilisateur ne peut pas dépasser 20 caractères');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRequired = (value: string, fieldName: string): { isValid: boolean; error?: string } => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} est requis`,
    };
  }
  
  return { isValid: true };
};
