import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-primary-600 hover:bg-primary-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 rounded-full p-3 ${
              type === 'danger' ? 'bg-red-100' : type === 'warning' ? 'bg-yellow-100' : 'bg-primary-100'
            }`}>
              <ExclamationTriangleIcon className={`h-6 w-6 ${
                type === 'danger' ? 'text-red-600' : type === 'warning' ? 'text-yellow-600' : 'text-primary-600'
              }`} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg ${typeStyles[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
