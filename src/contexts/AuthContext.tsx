import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/supabaseClient';

// Tipos para el usuario autenticado
export interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: string[];
}

// Roles de usuario según el lineamiento
export enum UserRole {
  ADMINISTRADOR_GENERAL = 'Admin',
  GERENTE_COMERCIAL = 'Gerente Comercial',
  GERENTE_OPERATIVO = 'Gerente Operaciones',
  GERENTE_ADMINISTRATIVO = 'Gerente General',
  FINANZAS = 'Gerente Cobranza',
  JEFE_ALMACEN = 'Jefe de Almacén',
  TECNICO = 'Técnico',
  MEDICO = 'Médico'
}

// Estado del contexto de autenticación
interface AuthContextType {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<AuthenticatedUser>) => void;
  devLoginAsAdmin: () => Promise<boolean>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Props para el provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('tumex_user');
        const savedToken = localStorage.getItem('tumex_token');
        
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error al cargar datos de autenticación:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('tumex_user');
        localStorage.removeItem('tumex_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Función de login con Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Intentando autenticar con Supabase...');
      console.log('📧 Email:', email);
      
      // Buscar usuario en la tabla Users de Supabase
      const { data: users, error } = await supabase
        .from('Users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error('❌ Error al buscar usuario:', error);
        toast({
          title: 'Error de autenticación',
          description: 'No se pudo verificar las credenciales',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!users) {
        console.log('❌ Usuario no encontrado en Supabase');
        toast({
          title: 'Usuario no encontrado',
          description: 'El email no está registrado en el sistema',
          variant: 'destructive',
        });
        return false;
      }
      
      console.log('✅ Usuario encontrado:', users);
      
      // Para desarrollo, aceptar cualquier contraseña
      // En producción, aquí se implementaría la verificación real de contraseñas
      if (password === '123456') {
        // Generar token simulado
        const token = `tumex_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Actualizar último login
        const updatedUser = {
          ...users,
          lastLogin: new Date().toISOString()
        };
        
        // Guardar en localStorage
        localStorage.setItem('tumex_user', JSON.stringify(updatedUser));
        localStorage.setItem('tumex_token', token);
        
        // Actualizar estado
        setUser(updatedUser);
        
        // Mostrar notificación de éxito
        toast({
          title: 'Inicio de sesión exitoso',
          description: `Bienvenido, ${updatedUser.display_name} ${updatedUser.last_name}`,
          variant: 'default',
        });
        
        console.log('🎉 Login exitoso para:', updatedUser.email);
        return true;
      } else {
        console.log('❌ Contraseña incorrecta');
        toast({
          title: 'Contraseña incorrecta',
          description: 'La contraseña ingresada no es válida',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Error durante el login:', error);
      
      toast({
        title: 'Error del sistema',
        description: 'No se pudo iniciar sesión. Intente nuevamente.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('tumex_user');
    localStorage.removeItem('tumex_token');
    
    // Limpiar estado
    setUser(null);
    
    // Mostrar notificación
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente',
      variant: 'default',
    });
    
    // Redirigir al login
    navigate('/login');
  };

  // Login rápido de desarrollo como Admin (sin credenciales)
  const devLoginAsAdmin = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: adminUser, error } = await supabase
        .from('Users')
        .select('*')
        .eq('role', UserRole.ADMINISTRADOR_GENERAL)
        .limit(1)
        .single();

      if (error || !adminUser) {
        toast({
          title: 'Admin no encontrado',
          description: 'No se encontró un usuario con rol Admin en la tabla Users',
          variant: 'destructive',
        });
        return false;
      }

      const token = `tumex_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const updatedUser = { ...adminUser, lastLogin: new Date().toISOString() };
      localStorage.setItem('tumex_user', JSON.stringify(updatedUser));
      localStorage.setItem('tumex_token', token);
      setUser(updatedUser);

      toast({
        title: 'Ingreso de desarrollo',
        description: `Conectado como ${updatedUser.display_name} (${updatedUser.role})`,
      });
      return true;
    } catch (e) {
      console.error('❌ Error en devLoginAsAdmin:', e);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar sesión como Admin (dev)',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = (userData: Partial<AuthenticatedUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Actualizar en localStorage
      localStorage.setItem('tumex_user', JSON.stringify(updatedUser));
    }
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    devLoginAsAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 