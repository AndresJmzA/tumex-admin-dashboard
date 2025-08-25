import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number; // Porcentaje del elemento visible para cargar
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface LazyComponentProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Componente de carga perezosa con Intersection Observer
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  threshold = 0.1,
  placeholder,
  fallback,
  className = '',
  onLoad,
  onError
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px' // Cargar 50px antes de que sea visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (err: Error) => {
    setHasError(true);
    setError(err);
    onError?.(err);
  };

  if (hasError) {
    return (
      <div className={className}>
        {fallback || (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-red-600">Error al cargar el contenido</p>
              {error && <p className="text-sm text-gray-500">{error.message}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div ref={ref} className={className}>
        {placeholder || <Skeleton className="h-32 w-full" />}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <Suspense
        fallback={
          placeholder || (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )
        }
      >
        <ErrorBoundary onError={handleError}>
          <div onLoad={handleLoad}>
            {children}
          </div>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

// Componente para cargar componentes lazy de manera optimizada
export const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  props = {},
  fallback,
  onLoad,
  onError
}) => {
  return (
    <LazyLoad
      placeholder={fallback}
      onLoad={onLoad}
      onError={onError}
    >
      <Component {...props} />
    </LazyLoad>
  );
};

// Error Boundary para manejar errores en componentes lazy
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error en componente lazy:', error, errorInfo);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-600">Error al cargar el componente</p>
          {this.state.error && (
            <p className="text-sm text-gray-500">{this.state.error.message}</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para crear componentes lazy con optimización
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const [Component, setComponent] = useState<React.LazyExoticComponent<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const module = await importFn();
        const LazyComponent = React.lazy(() => Promise.resolve(module));
        
        setComponent(LazyComponent);
        options.onLoad?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error al cargar componente');
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [importFn, options]);

  const renderComponent = (props: React.ComponentProps<T>) => {
    if (isLoading) {
      return options.fallback || <Skeleton className="h-32 w-full" />;
    }

    if (error || !Component) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-600">Error al cargar el componente</p>
          {error && <p className="text-sm text-gray-500">{error.message}</p>}
        </div>
      );
    }

    return (
      <Suspense fallback={options.fallback || <Skeleton className="h-32 w-full" />}>
        <ErrorBoundary onError={options.onError || (() => {})}>
          <Component {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };

  return { renderComponent, isLoading, error };
};

// Componente de carga progresiva para listas grandes
export const ProgressiveList: React.FC<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  batchSize?: number;
  delay?: number;
  className?: string;
}> = ({
  items,
  renderItem,
  batchSize = 10,
  delay = 100,
  className = ''
}) => {
  const [visibleItems, setVisibleItems] = useState<number>(batchSize);

  useEffect(() => {
    if (visibleItems >= items.length) return;

    const timer = setTimeout(() => {
      setVisibleItems(prev => Math.min(prev + batchSize, items.length));
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleItems, items.length, batchSize, delay]);

  return (
    <div className={className}>
      {items.slice(0, visibleItems).map((item, index) => (
        <LazyLoad key={index} threshold={0.1}>
          {renderItem(item, index)}
        </LazyLoad>
      ))}
      
      {visibleItems < items.length && (
        <div className="flex justify-center p-4">
          <Skeleton className="h-4 w-32" />
        </div>
      )}
    </div>
  );
};

// Hook para optimizar imágenes
export const useLazyImage = (
  src: string,
  options: {
    placeholder?: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(options.placeholder || src);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setCurrentSrc(src);
      options.onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      options.onError?.(new Error('Error al cargar la imagen'));
    };
    
    img.src = src;
  }, [src, options]);

  return {
    src: currentSrc,
    isLoaded,
    hasError,
    style: {
      opacity: isLoaded ? 1 : 0.5,
      transition: 'opacity 0.3s ease-in-out'
    }
  };
};

export default LazyLoad; 