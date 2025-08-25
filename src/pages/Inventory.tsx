import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Grid, List, Plus, AlertTriangle, Box, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ProductList from '@/components/ProductList';
import ProductForm from '@/components/ProductForm';
import { PermissionGuard } from '@/components/PermissionGuard';
import { inventoryService, Product, InventoryStats } from '@/services/inventoryService';

const Inventory = () => {
  // Estado para productos y estadísticas
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    availableProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [productsData, statsData, categoriesData] = await Promise.all([
          inventoryService.getProducts(),
          inventoryService.getInventoryStats(),
          inventoryService.getCategories()
        ]);
        
        setProducts(productsData);
        setStats(statsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Función para buscar productos
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await inventoryService.searchProducts(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchProducts(query);
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Filtrar productos (solo para mostrar resultados)
  const filteredProducts = showResults ? searchResults : [];

  // Obtener estados únicos
  const statuses = ['all', 'disponible', 'fuera_servicio'];

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

  // Función para obtener el color del stock según el nivel
  const getStockColor = (stock: number, maxStock: number) => {
    const percentage = (stock / maxStock) * 100;
    if (percentage === 0) return 'text-red-600';
    if (percentage < 10) return 'text-red-500';
    if (percentage < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <PermissionGuard 
      requiredModule="INVENTORY"
      requiredPermissions={['inventory:read']}
    >
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventario</h1>
        <p className="text-gray-600">Gestiona y monitorea el inventario de equipos médicos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">En inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Renta</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.availableProducts}</div>
            <p className="text-xs text-muted-foreground">Productos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Necesitan reabastecimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* ÚNICA BARRA DE BÚSQUEDA CON FILTROS Y LIMPIAR */}
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-4xl bg-white border rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        searchProducts(searchQuery);
                      }
                    }}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                searchProducts(searchQuery);
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Todas' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value);
                searchProducts(searchQuery);
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'Todos' : 
                        status === 'en_renta' ? 'En Renta' :
                        status === 'fuera_servicio' ? 'Fuera de Servicio' : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={clearSearch}>
                Limpiar
              </Button>
            </div>
            {/* Info de resultados y paginación */}
            {showResults && (
              <div className="w-full max-w-4xl flex justify-between items-center mt-2 px-2 text-sm text-gray-600">
                <span>Mostrando {filteredProducts.length > 0 ? '1-' + Math.min(12, filteredProducts.length) : '0'} de {filteredProducts.length} productos</span>
                <span>Página 1 de {Math.ceil(filteredProducts.length / 12) || 1}</span>
              </div>
            )}
          </div>

          {/* Autocompletado */}
          {searchQuery && !showResults && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-2xl mx-auto max-h-60 overflow-y-auto">
              <Command>
                <CommandList>
                  <CommandEmpty>No se encontraron sugerencias</CommandEmpty>
                  <CommandGroup>
                    {products
                      .filter(product => 
                        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((product, index) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => handleSearch(product.name)}
                          className="cursor-pointer"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          {product.name} ({product.category})
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}

          {/* Lista de Productos con Paginación */}
          {showResults && (
            <ProductList
              products={filteredProducts}
              loading={isSearching}
              showActions={true}
              viewMode={viewMode}
              onViewProduct={(product) => {
                console.log('Ver producto:', product);
                // Aquí se abriría el modal de detalles
              }}
              onEditProduct={(product) => {
                console.log('Editar producto:', product);
                // Aquí se abriría el formulario de edición
              }}
              onDeleteProduct={(product) => {
                console.log('Eliminar producto:', product);
                // Aquí se abriría el modal de confirmación
              }}
            />
          )}

          {/* Estado inicial - sin búsqueda */}
          {!showResults && !searchQuery && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Busca productos en el inventario</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Escribe el nombre, marca o categoría del producto que buscas. 
                El sistema te mostrará sugerencias automáticas mientras escribes.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="text-center py-8">
            <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Gestión de categorías próximamente...</p>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Sistema de alertas próximamente...</p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Reportes y analytics próximamente...</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botón Flotante para Agregar Producto */}
      <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg" onClick={() => setShowProductForm(true)}>
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modal ProductForm */}
      <ProductForm
        open={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSubmit={(values) => {
          console.log('Nuevo producto:', values);
          setShowProductForm(false);
        }}
      />
        </div>
      </PermissionGuard>
    );
  };

export default Inventory; 