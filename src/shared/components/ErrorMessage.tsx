import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  suggestion,
  onRetry,
  retryLabel = 'Try Again',
  className = ''
}) => {
  return (
    <div 
      className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-red-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-800 mb-2">
            {message}
          </p>
          {suggestion && (
            <p className="text-sm text-red-700 mb-4">
              <strong>Suggestion:</strong> {suggestion}
            </p>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              icon={<RefreshCw className="w-4 h-4" />}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 text-red-600 text-sm ${className}`} role="alert">
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
