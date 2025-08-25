import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
  showItemsInfo?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showPageInfo = true,
  showItemsInfo = true,
  className = ''
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Información de elementos */}
        {showItemsInfo && (
          <div className="text-sm text-muted-foreground">
            Mostrando {startItem} a {endItem} de {totalItems} elementos
          </div>
        )}

        {/* Información de página */}
        {showPageInfo && (
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Botón Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="hidden h-8 w-8 p-0 lg:flex"
        >
          <span className="sr-only">Ir a página anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Números de página */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-sm font-medium text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page as number)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="hidden h-8 w-8 p-0 lg:flex"
        >
          <span className="sr-only">Ir a página siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Componente de paginación simplificado para móviles
export const MobilePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ''
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      {/* Información de elementos */}
      <div className="text-sm text-muted-foreground">
        {startItem}-{endItem} de {totalItems}
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Hook para manejar paginación
export const usePagination = (
  totalItems: number,
  itemsPerPage: number = 20,
  initialPage: number = 1
) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = React.useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToNextPage = React.useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = React.useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToFirstPage = React.useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = React.useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

export default Pagination;
