export const isEmailValid = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isPasswordValid = (password: string): boolean => {
  return password.length >= 8;
};

export const isPhoneValid = (phone: string): boolean => {
  return /^\+?[\d\s-]{8,}$/.test(phone);
};

export const isNameValid = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateForm = (form: {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (form.email && !isEmailValid(form.email)) {
    errors.push('Email invalide');
  }

  if (form.password && !isPasswordValid(form.password)) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
    errors.push('Les mots de passe ne correspondent pas');
  }

  if (form.firstName && !isNameValid(form.firstName)) {
    errors.push('Le prénom doit contenir au moins 2 caractères');
  }

  if (form.lastName && !isNameValid(form.lastName)) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (form.phone && !isPhoneValid(form.phone)) {
    errors.push('Numéro de téléphone invalide');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 