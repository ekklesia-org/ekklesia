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

  const extractErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      
      // Check if the response has a translationKey
      if (responseData?.translationKey) {
        try {
          return t(responseData.translationKey);
        } catch (translationError) {
          // If translation fails, fall back to the message
          return responseData.message || 'An error occurred';
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
    
    return t('errors.generic.unknown_error');
  };

  const handleError = (error: unknown, fallbackMessage?: string) => {
    const errorMessage = extractErrorMessage(error);
    toast.error(fallbackMessage || errorMessage);
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
