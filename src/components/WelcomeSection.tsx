import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';

const WelcomeSection = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    if (!user) {
      return {
        greeting: '¡Buenos días!',
        message: 'Bienvenido de vuelta a tu plataforma de equipos médicos TUMex'
      };
    }

    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) {
      greeting = '¡Buenos días!';
    } else if (hour < 18) {
      greeting = '¡Buenas tardes!';
    } else {
      greeting = '¡Buenas noches!';
    }

    const roleMessages: Record<UserRole, { greeting: string; message: string }> = {
      [UserRole.ADMINISTRADOR_GENERAL]: {
        greeting: `${greeting}, ${user.name}`,
        message: 'Vista general del sistema TUMex - Monitoreo completo de todas las áreas operativas'
      },
      [UserRole.GERENTE_COMERCIAL]: {
        greeting: `${greeting}, ${user.name}`,
        message: 'Dashboard Comercial - Gestión de órdenes, ventas y seguimiento de conversiones'
      },
      [UserRole.GERENTE_OPERATIVO]: {
        greeting: `${greeting}, ${user.name}`,
        message: 'Dashboard Operativo - Coordinación central de operaciones y gestión de recursos'
      },
      [UserRole.GERENTE_ADMINISTRATIVO]: {
        greeting: `${greeting}, ${user.name}`,
        message: 'Dashboard Administrativo - Gestión de remisiones, documentación y procesos administrativos'
      },
      [UserRole.FINANZAS]: {
        greeting: `${greeting}, ${user.name}`,
        message: 'Dashboard Finanzas - Control de facturación, cobranza y reportes financieros'
      },
      [UserRole.JEFE_ALMACEN]: {
        greeting: `${greeting}, ${user.name}`,
        message: 'Dashboard Almacén - Gestión de inventario, preparación de equipos y control de stock'
      },
      [UserRole.TECNICO]: {
        greeting: `${greeting}, ${user.name}`,
        message: 'Portal Técnico - Gestión de tareas, equipos y evidencia de trabajo'
      }
    };

    return roleMessages[user.role] || {
      greeting: `${greeting}, ${user.name}`,
      message: 'Bienvenido de vuelta a tu plataforma de equipos médicos TUMex'
    };
  };

  const { greeting, message } = getWelcomeMessage();

  return (
    <div className="px-1">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{greeting}</h1>
      <p className="text-sm sm:text-base text-gray-600">{message}</p>
    </div>
  );
};

export default WelcomeSection;
