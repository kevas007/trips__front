import { useState, useCallback } from 'react';

interface UseErrorHandlerReturn {
  lastError: string;
  fieldErrors: { [key: string]: string };
  setLastError: (error: string) => void;
  setFieldErrors: (errors: { [key: string]: string }) => void;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  hasErrors: boolean;
  addFieldError: (field: string, message: string) => void;
  removeFieldError: (field: string) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [lastError, setLastError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const clearErrors = useCallback(() => {
    setLastError('');
    setFieldErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const addFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const removeFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const hasErrors = lastError !== '' || Object.keys(fieldErrors).length > 0;

  return {
    lastError,
    fieldErrors,
    setLastError,
    setFieldErrors,
    clearErrors,
    clearFieldError,
    hasErrors,
    addFieldError,
    removeFieldError,
  };
};
