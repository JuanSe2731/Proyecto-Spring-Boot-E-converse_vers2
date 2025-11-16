import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { pedidoService } from '../../services';
import AdminLayout from '../../components/AdminLayout';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const data = await pedidoService.getAll();
      // Ordenar por fecha más reciente primero
      const pedidosOrdenados = data.sort((a, b) => 
        new Date(b.fechaPedido) - new Date(a.fechaPedido)
      );
      setPedidos(pedidosOrdenados);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchSearch = 
      pedido.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.idPedido?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchEstado = filterEstado === 'all' || pedido.estado === filterEstado;
    
    return matchSearch && matchEstado;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Completado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return <ClockIcon className="h-5 w-5" />;
      case 'Completado':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'Cancelado':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5" />;
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const verDetalle = (pedido) => {
    setSelectedPedido(pedido);
    setShowModal(true);
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    if (!confirm(`¿Cambiar estado del pedido a "${nuevoEstado}"?`)) return;

    try {
      const pedido = pedidos.find(p => p.idPedido === pedidoId);
      const pedidoActualizado = { ...pedido, estado: nuevoEstado };
      await pedidoService.update(pedidoActualizado);
      alert('Estado actualizado exitosamente');
      cargarPedidos();
      setShowModal(false);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  return (
    <AdminLayout title="Gestión de Pedidos">
      {/* Barra de acciones */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Búsqueda */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar por cliente, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Filtro por estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="input-field md:w-64"
          >
            <option value="all">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Completado">Completado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No hay pedidos registrados
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.idPedido} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {pedido.idPedido?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {pedido.usuario?.nombre || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.usuario?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatFecha(pedido.fechaPedido)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-primary-600">
                        ${pedido.total?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoIcon(pedido.estado)}
                        <span>{pedido.estado}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => verDetalle(pedido)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles */}
      {showModal && selectedPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold">Detalles del Pedido</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Pedido</p>
                  <p className="font-mono text-sm">{selectedPedido.idPedido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="text-sm">{formatFecha(selectedPedido.fechaPedido)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{selectedPedido.usuario?.nombre}</p>
                  <p className="text-sm text-gray-500">{selectedPedido.usuario?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(selectedPedido.estado)}`}>
                    {getEstadoIcon(selectedPedido.estado)}
                    <span>{selectedPedido.estado}</span>
                  </span>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Productos</h4>
                <div className="space-y-2">
                  {selectedPedido.productos?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.nombreProducto}</p>
                        <p className="text-sm text-gray-600">
                          ${item.precioUnitario?.toLocaleString()} x {item.cantidad}
                        </p>
                      </div>
                      <p className="font-bold text-primary-600">
                        ${item.subtotal?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ${selectedPedido.total?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Cambiar estado */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Cambiar Estado:</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => cambiarEstado(selectedPedido.idPedido, 'Pendiente')}
                    className="btn-secondary flex-1"
                    disabled={selectedPedido.estado === 'Pendiente'}
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => cambiarEstado(selectedPedido.idPedido, 'Completado')}
                    className="btn-primary flex-1"
                    disabled={selectedPedido.estado === 'Completado'}
                  >
                    Completado
                  </button>
                  <button
                    onClick={() => cambiarEstado(selectedPedido.idPedido, 'Cancelado')}
                    className="btn-danger flex-1"
                    disabled={selectedPedido.estado === 'Cancelado'}
                  >
                    Cancelado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPedidos;
