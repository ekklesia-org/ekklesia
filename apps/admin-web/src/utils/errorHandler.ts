import { useI18n } from 'vue-i18n';
import { useToast } from '@ekklesia/ui';
import axios from 'axios';

export interface ApiError {
  message: string;
  translationKey?: string;
}

export const useErrorHandler = () => {
  const { t } = useI18n();
  const toast = useToast();

  const extractErrorMessage = (error: unknown, fallbackMessage?: string): string => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      // Check if the response has a translationKey
      if (responseData?.translationKey) {
        try {
          return t(responseData.translationKey);
        } catch {
          console.warn(`Translation key "${responseData.translationKey}" not found.`);
          // If translation fails, fall back to the message
          return fallbackMessage || 'An error occurred';
        }
      }

      // Check if the response has a message
      if (responseData?.message) {
        return responseData.message;
      }

      // Fall back to default error message
      return t('errors.generic.server_error');
    }

    // Handle non-axios errors
    if (error instanceof Error) {
      return error.message;
    }

    return fallbackMessage || t('errors.generic.unknown_error');
  };

  const handleError = (error: unknown, fallbackMessage?: string) => {
    const errorMessage = extractErrorMessage(error, fallbackMessage);
    toast.error(errorMessage);
    console.error('Error occurred:', error);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  return {
    extractErrorMessage,
    handleError,
    handleSuccess
  };
};
