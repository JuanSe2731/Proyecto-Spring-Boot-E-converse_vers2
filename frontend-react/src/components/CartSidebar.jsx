import { useEffect } from 'react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    isOpen,
    closeCart,
    fetchCartItems,
    updateItemQuantity,
    removeItem,
    itemCount,
    subtotal,
    tax,
    total,
  } = useCartStore();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchCartItems();
    }
  }, [isOpen, isAuthenticated, fetchCartItems]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    if (confirm('¿Eliminar este producto del carrito?')) {
      await removeItem(itemId);
    }
  };

  const handleCheckout = () => {
    // TODO: Implementar proceso de checkout
    alert('Función de checkout en desarrollo');
    closeCart();
  };

  const cartItemCount = itemCount();
  const cartSubtotal = subtotal();
  const cartTax = tax();
  const cartTotal = total();

  const getImageUrl = (imagen) => {
    if (!imagen) {
      return 'https://via.placeholder.com/80x80/4CAF50/ffffff?text=Sin+Imagen';
    }
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    if (imagen.startsWith('/')) {
      return imagen;
    }
    return `/static/${imagen}`;
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Carrito ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
          </h2>
          <button
            onClick={closeCart}
            className="hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="btn-primary mt-4"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.idItemCarrito}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <img
                      src={getImageUrl(item.producto.imagenUrl)}
                      alt={item.producto.nombre}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/4CAF50/ffffff?text=Sin+Imagen';
                      }}
                    />

                    {/* Detalles */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.producto.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ${item.producto.precio?.toLocaleString() || '0'}
                      </p>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.idItemCarrito, item.cantidad - 1)}
                            className="p-1 hover:bg-gray-100 rounded-l-lg"
                          >
                            <MinusIcon className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.idItemCarrito, item.cantidad + 1)}
                            className="p-1 hover:bg-gray-100 rounded-r-lg"
                          >
                            <PlusIcon className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.idItemCarrito)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Subtotal del item */}
                      <p className="text-sm font-semibold text-primary-600 mt-2">
                        Subtotal: ${((item.producto.precio || 0) * item.cantidad).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con totales */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (19%):</span>
                <span className="font-medium">${cartTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary-600">${cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-primary py-3 text-lg"
            >
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
