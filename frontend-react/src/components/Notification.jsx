import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const Notification = () => {
  const { successMessage, error, clearError } = useAuthStore();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        useAuthStore.setState({ successMessage: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!successMessage && !error) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-start space-x-3 min-w-[300px] max-w-md">
          <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">¡Éxito!</p>
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-start space-x-3 min-w-[300px] max-w-md">
          <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
