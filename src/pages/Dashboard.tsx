import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';
import AdministrativeDashboard from '@/components/AdministrativeDashboard';
import CommercialDashboard from '@/components/CommercialDashboard';
import OperationalDashboard from '@/components/OperationalDashboard';
import FinanceDashboard from '@/components/FinanceDashboard';
import WarehouseDashboard from '@/components/WarehouseDashboard';
import TechnicianPortal from '@/pages/TechnicianPortal';
import GeneralDashboard from '@/components/GeneralDashboard';

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  // Mostrar loading mientras se determina el usuario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tumex-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar mensaje de error
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600">No se pudo determinar el rol del usuario</p>
        </div>
      </div>
    );
  }

  // Renderizar dashboard específico según el rol del usuario
  switch (user.role) {
    case UserRole.ADMINISTRADOR_GENERAL:
      return <GeneralDashboard />;
    
    case UserRole.GERENTE_COMERCIAL:
      return <CommercialDashboard />;
    
    case UserRole.GERENTE_OPERATIVO:
      return <OperationalDashboard />;
    
    case UserRole.GERENTE_ADMINISTRATIVO:
      return <AdministrativeDashboard />;
    
    case UserRole.FINANZAS:
      return <FinanceDashboard />;
    
    case UserRole.JEFE_ALMACEN:
      return <WarehouseDashboard />;
    
    case UserRole.TECNICO:
      return <TechnicianPortal />;
    
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Rol No Soportado</h2>
            <p className="text-gray-600">
              El rol "{user.role}" no tiene un dashboard específico configurado
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Contacta al administrador del sistema
            </p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
