import { useState, useCallback } from 'react';

export type ValidationRule<T = any> = {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: T) => string | boolean;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      // Required validation
      if (rules.required) {
        const isEmpty = value === '' || value === null || value === undefined;
        if (isEmpty) {
          return typeof rules.required === 'string'
            ? rules.required
            : 'This field is required';
        }
      }

      // Skip other validations if value is empty and not required
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      // MinLength validation
      if (rules.minLength && typeof value === 'string') {
        if (value.length < rules.minLength.value) {
          return rules.minLength.message;
        }
      }

      // MaxLength validation
      if (rules.maxLength && typeof value === 'string') {
        if (value.length > rules.maxLength.value) {
          return rules.maxLength.message;
        }
      }

      // Min validation
      if (rules.min && typeof value === 'number') {
        if (value < rules.min.value) {
          return rules.min.message;
        }
      }

      // Max validation
      if (rules.max && typeof value === 'number') {
        if (value > rules.max.value) {
          return rules.max.message;
        }
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string') {
        if (!rules.pattern.value.test(value)) {
          return rules.pattern.message;
        }
      }

      // Custom validation
      if (rules.validate) {
        const result = rules.validate(value);
        if (typeof result === 'string') {
          return result;
        }
        if (result === false) {
          return 'Validation failed';
        }
      }

      return undefined;
    },
    [validationRules]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if field has been touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error
        }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate on blur
      const error = validateField(name, values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    },
    [values, validateField]
  );

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => void | Promise<void>) => {
      setIsSubmitting(true);

      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate form
      const isValid = validateForm();

      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [values, validationRules, validateForm]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateForm
  };
};
