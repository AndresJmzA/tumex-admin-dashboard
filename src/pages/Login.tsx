import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Heart, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, devLoginAsAdmin } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // Validación de email
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El email no es válido';
    }
    return undefined;
  };

  // Validación de contraseña
  const validatePassword = (password: string): string | undefined => {
    if (!password.trim()) {
      return 'La contraseña es requerida';
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return undefined;
  };

  // Validación del formulario completo
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de cambios en los campos
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      // Usar el contexto de autenticación
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Redirigir a la página desde donde vino o al dashboard por defecto
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setErrors({
          general: 'Credenciales incorrectas. Verifica el email y usa contraseña: 123456'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Error al iniciar sesión. Intente nuevamente.'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tumex-primary-500 text-white shadow-lg">
              <Heart className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">TUMex</h1>
          <p className="text-gray-600">Panel de Administración y Operaciones</p>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 h-12 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Error general */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full h-12 bg-tumex-primary-500 hover:bg-tumex-primary-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Botón de desarrollo: Ingresar como Admin */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                disabled={isLoading}
                onClick={async () => {
                  const ok = await devLoginAsAdmin();
                  if (ok) {
                    const from = location.state?.from?.pathname || '/';
                    navigate(from, { replace: true });
                  }
                }}
              >
                Ingresar como Admin (dev)
              </Button>
            </form>

            {/* Información de credenciales de prueba */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">
                💡 Credenciales de prueba (Supabase):
              </p>
              <div className="space-y-1">
                <p className="text-xs text-blue-700">
                  <strong>Admin:</strong> <code className="bg-blue-100 px-1 rounded">admin@tumex.com</code>
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Gerente Comercial:</strong> <code className="bg-blue-100 px-1 rounded">gerente.comercial@tumex.com</code>
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Gerente Operaciones:</strong> <code className="bg-blue-100 px-1 rounded">gerente.operaciones@tumex.com</code>
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Gerente Cobranza:</strong> <code className="bg-blue-100 px-1 rounded">gerente.cobranza@tumex.com</code>
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Gerente General:</strong> <code className="bg-blue-100 px-1 rounded">gerente.general@tumex.com</code>
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Jefe de Almacén:</strong> <code className="bg-blue-100 px-1 rounded">jefe.almacen@tumex.com</code>
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Técnico:</strong> <code className="bg-blue-100 px-1 rounded">tecnico1@tumex.com</code>
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Médico:</strong> <code className="bg-blue-100 px-1 rounded">dr.garcia@hospitalgeneral.com</code>
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Contraseña para todos:</strong> <code className="bg-blue-100 px-1 rounded">123456</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 TUMex. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 