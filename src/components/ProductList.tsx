import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List, ChevronDown, ChevronUp, Eye, Edit, Trash2, Box } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Tipos para el componente
interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Consumible' | 'Accesorio' | 'Instrumental' | 'Equipo' | 'Endoscopio' | 'Cable/Conector';
  price: number;
  stock: number;
  maxStock: number;
  status: 'disponible' | 'en_renta' | 'mantenimiento' | 'fuera_servicio';
  image?: string;
  description: string;
  createdAt: string;
}

interface ProductListProps {
  products: Product[];
  onViewProduct?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  loading?: boolean;
  showActions?: boolean;
  viewMode?: 'grid' | 'list';
}

type SortField = 'name' | 'brand' | 'category' | 'price' | 'stock' | 'status';
type SortDirection = 'asc' | 'desc';

const ProductList: React.FC<ProductListProps> = ({
  products,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  loading = false,
  showActions = true,
  viewMode = 'grid',
}) => {
  const isMobile = useIsMobile();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Ordenar productos
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    sorted.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      if (sortField === 'price' || sortField === 'stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    return sorted;
  }, [products, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'en_renta': return 'bg-blue-100 text-blue-800';
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-800';
      case 'fuera_servicio': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock < 7) return 'text-red-600';
    if (stock < 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Componente de encabezado de tabla para ordenamiento
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Vista de Lista */}
      {!loading && viewMode === 'list' && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <SortableHeader field="name">Producto</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <SortableHeader field="brand">Marca</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <SortableHeader field="category">Categoría</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <SortableHeader field="price">Precio</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <SortableHeader field="stock">Stock</SortableHeader>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <SortableHeader field="status">Estado</SortableHeader>
                  </th>
                  {showActions && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.brand}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">${product.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${getStockColor(product.stock)}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status === 'en_renta' ? 'En Renta' :
                         product.status === 'fuera_servicio' ? 'Fuera de Servicio' : product.status}
                      </Badge>
                    </td>
                    {showActions && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {onViewProduct && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEditProduct && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteProduct && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteProduct(product)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Grid */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentProducts.map(product => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                  <Badge className={getStatusColor(product.status)}>
                    {product.status === 'en_renta' ? 'En Renta' :
                     product.status === 'fuera_servicio' ? 'Fuera de Servicio' : product.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Categoría:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Precio:</span>
                    <span className="font-medium">${product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Stock:</span>
                    <span className={`font-medium ${getStockColor(product.stock)}`}>{product.stock}</span>
                  </div>
                </div>
                
                {showActions && (
                  <div className="mt-4 flex gap-2">
                    {onViewProduct && (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => onViewProduct(product)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    )}
                    {onEditProduct && (
                      <Button size="sm" className="flex-1" onClick={() => onEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && currentProducts.length === 0 && (
        <div className="text-center py-8">
          <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron productos con los filtros aplicados</p>
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, validCurrentPage - 1))}
            disabled={validCurrentPage === 1}
          >
            Anterior
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={validCurrentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, validCurrentPage + 1))}
            disabled={validCurrentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductList; 