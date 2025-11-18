import { useEffect } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { APIError } from '../api/client';

export function useQueryError(query: UseQueryResult, onError?: (error: APIError) => void) {
  useEffect(() => {
    if (query.error) {
      const error = query.error as APIError;

      // Log error
      console.error('Query error:', {
        message: error.message,
        status: error.status,
        data: error.data,
      });

      // Call custom handler
      if (onError) {
        onError(error);
      }

      // Could also show toast notification here
    }
  }, [query.error, onError]);
}
