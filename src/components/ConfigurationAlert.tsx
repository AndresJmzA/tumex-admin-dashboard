import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Settings, ExternalLink } from 'lucide-react';

interface ConfigurationAlertProps {
  type: 'supabase' | 'api' | 'database';
  onRetry?: () => void;
}

const ConfigurationAlert: React.FC<ConfigurationAlertProps> = ({ type, onRetry }) => {
  const getAlertContent = () => {
    switch (type) {
      case 'supabase':
        return {
          title: 'Configuración de Supabase Requerida',
          description: 'Las variables de entorno de Supabase no están configuradas. Esto puede causar errores en la aplicación.',
          action: 'Configurar Supabase',
          link: 'https://supabase.com/docs/guides/getting-started/environment-variables'
        };
      case 'api':
        return {
          title: 'Configuración de API Requerida',
          description: 'La URL de la API no está configurada correctamente.',
          action: 'Configurar API',
          link: '#'
        };
      case 'database':
        return {
          title: 'Configuración de Base de Datos Requerida',
          description: 'La conexión a la base de datos no está configurada correctamente.',
          action: 'Configurar Base de Datos',
          link: '#'
        };
      default:
        return {
          title: 'Configuración Requerida',
          description: 'Algunas configuraciones necesarias no están disponibles.',
          action: 'Configurar',
          link: '#'
        };
    }
  };

  const content = getAlertContent();

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Settings className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">{content.title}</AlertTitle>
      <AlertDescription className="text-orange-700">
        {content.description}
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Reintentar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(content.link, '_blank')}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {content.action}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConfigurationAlert; 