import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onDetailsClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    const result = await addItem(product.idProducto, 1);
    if (result.success) {
      alert('Producto agregado al carrito');
    } else {
      alert(result.error || 'Error al agregar el producto');
    }
  };

  const getImageUrl = (imagen) => {
    if (!imagen) {
      return 'https://via.placeholder.com/300x220/4CAF50/ffffff?text=Sin+Imagen';
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
    <div
      onClick={onDetailsClick}
      className="card cursor-pointer overflow-hidden group transform hover:scale-105 transition-transform duration-300"
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={getImageUrl(product.imagenUrl)}
          alt={product.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x220/4CAF50/ffffff?text=Sin+Imagen';
          }}
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {product.nombre}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {product.categoria ? product.categoria.nombre : 'Sin categoría'}
        </p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-2xl font-bold text-primary-600">
            ${product.precio?.toLocaleString() || '0'}
          </p>
          <button
            onClick={handleAddToCart}
            className="btn-primary flex items-center space-x-1 px-3 py-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="text-sm">Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
