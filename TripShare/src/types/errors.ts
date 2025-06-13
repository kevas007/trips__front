// types/errors.ts
export interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }
  
  export interface FormErrors {
    [key: string]: string;
  }