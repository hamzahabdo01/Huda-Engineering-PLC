import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, UseFormReturn, FieldValues, Path, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UseOptimizedFormOptions<T extends FieldValues> {
  schema?: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  debounceMs?: number;
}

export function useOptimizedForm<T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onBlur',
  reValidateMode = 'onChange',
  debounceMs = 300,
}: UseOptimizedFormOptions<T> = {}) {
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode,
    reValidateMode,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Debounced field update
  const debouncedSetValue = useCallback(
    (name: Path<T>, value: any) => {
      // Clear existing timer
      if (debounceTimers.current.has(name)) {
        clearTimeout(debounceTimers.current.get(name)!);
      }

      // Set new timer
      const timer = setTimeout(() => {
        form.setValue(name, value, { shouldValidate: true });
        debounceTimers.current.delete(name);
      }, debounceMs);

      debounceTimers.current.set(name, timer);
    },
    [form, debounceMs]
  );

  // Optimized submit handler
  const handleSubmit = useCallback(
    async (onSubmit: (data: T) => Promise<void> | void) => {
      return form.handleSubmit(async (data) => {
        try {
          setIsSubmitting(true);
          setSubmitError(null);
          await onSubmit(data);
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : 'An error occurred');
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      });
    },
    [form]
  );

  // Batch field updates
  const setMultipleValues = useCallback(
    (values: Partial<T>) => {
      Object.entries(values).forEach(([key, value]) => {
        form.setValue(key as Path<T>, value, { shouldValidate: false });
      });
      // Validate all fields at once
      form.trigger();
    },
    [form]
  );

  // Clear all debounce timers
  const clearDebounceTimers = useCallback(() => {
    debounceTimers.current.forEach((timer) => clearTimeout(timer));
    debounceTimers.current.clear();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearDebounceTimers();
    };
  }, [clearDebounceTimers]);

  // Get field error with memoization
  const getFieldError = useCallback(
    (name: Path<T>): FieldError | undefined => {
      return form.formState.errors[name];
    },
    [form.formState.errors]
  );

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return form.formState.isValid && Object.keys(form.formState.errors).length === 0;
  }, [form.formState.isValid, form.formState.errors]);

  // Reset form with optimization
  const resetForm = useCallback(
    (values?: Partial<T>) => {
      clearDebounceTimers();
      form.reset(values);
      setSubmitError(null);
    },
    [form, clearDebounceTimers]
  );

  return {
    ...form,
    debouncedSetValue,
    handleSubmit,
    setMultipleValues,
    clearDebounceTimers,
    getFieldError,
    isFormValid,
    resetForm,
    isSubmitting,
    submitError,
    clearSubmitError: () => setSubmitError(null),
  };
}

export default useOptimizedForm;