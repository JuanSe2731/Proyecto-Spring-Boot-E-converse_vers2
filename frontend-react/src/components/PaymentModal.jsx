import { useState } from 'react';
import { XMarkIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, total }) => {
  const [step, setStep] = useState(1); // 1: Formulario, 2: Procesando, 3: Éxito
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: '',
  });

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Formatear número de tarjeta
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    }

    // Formatear fecha de expiración
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      if (value.length > 5) return;
    }

    // Limitar CVV a 3 dígitos
    if (name === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      alert('Número de tarjeta inválido');
      return;
    }

    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      alert('Fecha de expiración inválida (MM/AA)');
      return;
    }

    if (!formData.cvv.match(/^\d{3}$/)) {
      alert('CVV inválido');
      return;
    }

    // Simular procesamiento de pago
    setStep(2);

    setTimeout(() => {
      setStep(3);
      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      email: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Pasarela de Pago</h2>
                <p className="text-white/80 text-sm">Pago seguro simulado</p>
              </div>
            </div>
            {step === 1 && (
              <button
                onClick={handleClose}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Formulario de pago */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total a pagar:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ${total?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Tarjeta *
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa: 4111 1111 1111 1111 (tarjeta de prueba)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre en la Tarjeta *
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="JUAN PÉREZ"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Exp. *
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/AA"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Confirmación *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  className="input-field"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Simulación de Pago:</strong> Esta es una pasarela de pago simulada. 
                  No se procesarán cargos reales.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Pagar Ahora
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Procesando */}
          {step === 2 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Procesando Pago...</h3>
              <p className="text-gray-600">Por favor espera mientras verificamos tu pago</p>
            </div>
          )}

          {/* Step 3: Éxito */}
          {step === 3 && (
            <div className="text-center py-12">
              <div className="mb-4">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h3>
              <p className="text-gray-600 mb-4">Tu pedido ha sido confirmado</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Recibirás un correo de confirmación en breve
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
