import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ProductModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const getImageUrl = (imagen) => {
    if (!imagen) {
      return 'https://via.placeholder.com/500x300/4CAF50/ffffff?text=Sin+Imagen';
    }
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    if (imagen.startsWith('/')) {
      return imagen;
    }
    return `/static/${imagen}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Contenido del modal */}
          <div className="grid md:grid-cols-2 gap-6 p-8">
            {/* Imagen */}
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={getImageUrl(product.imagenUrl)}
                alt={product.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x300/4CAF50/ffffff?text=Sin+Imagen';
                }}
              />
            </div>

            {/* Detalles */}
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {product.nombre}
              </h2>
              
              <div className="mb-4">
                <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.categoria ? product.categoria.nombre : 'Sin categoría'}
                </span>
              </div>

              <p className="text-gray-600 mb-6 flex-grow">
                {product.descripcion || 'Sin descripción disponible'}
              </p>

              <div className="mb-6">
                <p className="text-4xl font-bold text-primary-600">
                  ${product.precio?.toLocaleString() || '0'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="btn-primary w-full py-3 text-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
