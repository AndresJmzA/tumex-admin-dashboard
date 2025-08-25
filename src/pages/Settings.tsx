import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff,
  Building,
  Lock,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Download,
  Upload,
  LogOut
} from 'lucide-react';

// Tipos para la configuración
interface UserSettings {
  name: string;
  email: string;
  role: string;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  orders: boolean;
  finances: boolean;
  inventory: boolean;
  system: boolean;
  marketing: boolean;
}

interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  maintenanceMode: boolean;
  autoBackup: boolean;
  backupFrequency: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  auditLog: boolean;
  encryptionLevel: string;
}

const Settings = () => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@tumex.com',
    role: 'Administrador',
    language: 'es',
    timezone: 'America/Mexico_City',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      orders: true,
      finances: true,
      inventory: true,
      system: true,
      marketing: false
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: 'TUMex - Plataforma Médica',
    companyEmail: 'info@tumex.com',
    companyPhone: '+52 55 1234 5678',
    companyAddress: 'Av. Reforma 123, Col. Centro, CDMX',
    currency: 'MXN',
    timezone: 'America/Mexico_City',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    auditLog: true,
    encryptionLevel: 'AES-256'
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    console.log(`Guardando configuración de ${section}:`, {
      userSettings,
      systemSettings,
      securitySettings
    });
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleResetSettings = (section: string) => {
    console.log(`Reseteando configuración de ${section}`);
  };

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
  ];

  const timezones = [
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
  ];

  const currencies = [
    { value: 'MXN', label: 'Peso Mexicano (MXN)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'Libra Esterlina (GBP)' }
  ];

  const backupFrequencies = [
    { value: 'hourly', label: 'Cada hora' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  const encryptionLevels = [
    { value: 'AES-128', label: 'AES-128 (Básico)' },
    { value: 'AES-256', label: 'AES-256 (Recomendado)' },
    { value: 'AES-512', label: 'AES-512 (Alto)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">Gestiona la configuración del sistema y tu cuenta</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleResetSettings('all')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Valores
          </Button>
          <Button onClick={() => handleSaveSettings('all')} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Todo'}
          </Button>
        </div>
      </div>

      {/* Tabs de Configuración */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Apariencia</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Respaldo</span>
          </TabsTrigger>
        </TabsList>

        {/* Perfil de Usuario */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={userSettings.name}
                    onChange={(e) => setUserSettings({...userSettings, name: e.target.value})}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Input
                    id="role"
                    value={userSettings.role}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <div
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 rounded-r-md transition-colors cursor-pointer flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }
                      }}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Preferencias Regionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={userSettings.language} onValueChange={(value) => setUserSettings({...userSettings, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select value={userSettings.timezone} onValueChange={(value) => setUserSettings({...userSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={userSettings.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => setUserSettings({...userSettings, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Canales de Notificación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-gray-500">Recibe notificaciones en tu correo electrónico</p>
                  </div>
                  <Switch
                    checked={userSettings.notifications.email}
                    onCheckedChange={(checked) => setUserSettings({
                      ...userSettings,
                      notifications: {...userSettings.notifications, email: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-gray-500">Notificaciones en tiempo real en el navegador</p>
                  </div>
                  <Switch
                    checked={userSettings.notifications.push}
                    onCheckedChange={(checked) => setUserSettings({
                      ...userSettings,
                      notifications: {...userSettings.notifications, push: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones SMS</Label>
                    <p className="text-sm text-gray-500">Mensajes de texto a tu teléfono</p>
                  </div>
                  <Switch
                    checked={userSettings.notifications.sms}
                    onCheckedChange={(checked) => setUserSettings({
                      ...userSettings,
                      notifications: {...userSettings.notifications, sms: checked}
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Tipos de Notificación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Órdenes</Label>
                    <p className="text-sm text-gray-500">Actualizaciones de órdenes y pedidos</p>
                  </div>
                  <Switch
                    checked={userSettings.notifications.orders}
                    onCheckedChange={(checked) => setUserSettings({
                      ...userSettings,
                      notifications: {...userSettings.notifications, orders: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Finanzas</Label>
                    <p className="text-sm text-gray-500">Reportes financieros y facturación</p>
                  </div>
                  <Switch
                    checked={userSettings.notifications.finances}
                    onCheckedChange={(checked) => setUserSettings({
                      ...userSettings,
                      notifications: {...userSettings.notifications, finances: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Inventario</Label>
                    <p className="text-sm text-gray-500">Alertas de stock y equipos</p>
                  </div>
                  <Switch
                    checked={userSettings.notifications.inventory}
                    onCheckedChange={(checked) => setUserSettings({
                      ...userSettings,
                      notifications: {...userSettings.notifications, inventory: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sistema</Label>
                    <p className="text-sm text-gray-500">Mantenimiento y actualizaciones</p>
                  </div>
                  <Switch
                    checked={userSettings.notifications.system}
                    onCheckedChange={(checked) => setUserSettings({
                      ...userSettings,
                      notifications: {...userSettings.notifications, system: checked}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuración del Sistema */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings({...systemSettings, companyName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email de la Empresa</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={systemSettings.companyEmail}
                    onChange={(e) => setSystemSettings({...systemSettings, companyEmail: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Teléfono</Label>
                  <Input
                    id="companyPhone"
                    value={systemSettings.companyPhone}
                    onChange={(e) => setSystemSettings({...systemSettings, companyPhone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Dirección</Label>
                  <Input
                    id="companyAddress"
                    value={systemSettings.companyAddress}
                    onChange={(e) => setSystemSettings({...systemSettings, companyAddress: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuración Regional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({...systemSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemTimezone">Zona Horaria del Sistema</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de Fecha</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings({...systemSettings, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Formato de Hora</Label>
                  <Select value={systemSettings.timeFormat} onValueChange={(value) => setSystemSettings({...systemSettings, timeFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configuración Avanzada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Mantenimiento</Label>
                  <p className="text-sm text-gray-500">Bloquea el acceso al sistema para mantenimiento</p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Respaldo Automático</Label>
                  <p className="text-sm text-gray-500">Realiza respaldos automáticos de la base de datos</p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                />
              </div>

              {systemSettings.autoBackup && (
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                  <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backupFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Autenticación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-gray-500">Requiere un código adicional para iniciar sesión</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    min="5"
                    max="480"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Expiración de Contraseña (días)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                    min="30"
                    max="365"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Intentos Máximos de Login</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                    min="3"
                    max="10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Encriptación y Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="encryptionLevel">Nivel de Encriptación</Label>
                  <Select value={securitySettings.encryptionLevel} onValueChange={(value) => setSecuritySettings({...securitySettings, encryptionLevel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {encryptionLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registro de Auditoría</Label>
                    <p className="text-sm text-gray-500">Registra todas las acciones de los usuarios</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLog}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLog: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">Lista Blanca de IPs</Label>
                  <textarea
                    id="ipWhitelist"
                    value={securitySettings.ipWhitelist.join('\n')}
                    onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim())})}
                    placeholder="Una IP por línea&#10;Ejemplo: 192.168.1.0/24"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Apariencia */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Tema y Colores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Modo de Tema</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer ${userSettings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setUserSettings({...userSettings, theme: 'light'})}
                    >
                      <Sun className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm text-center">Claro</p>
                    </div>
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer ${userSettings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setUserSettings({...userSettings, theme: 'dark'})}
                    >
                      <Moon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm text-center">Oscuro</p>
                    </div>
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer ${userSettings.theme === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setUserSettings({...userSettings, theme: 'auto'})}
                    >
                      <Monitor className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm text-center">Automático</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color Principal</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                      <div
                        key={color}
                        className={`w-10 h-10 rounded-full cursor-pointer border-2 ${
                          color === 'blue' ? 'border-blue-500 bg-blue-500' :
                          color === 'green' ? 'border-green-500 bg-green-500' :
                          color === 'purple' ? 'border-purple-500 bg-purple-500' :
                          color === 'orange' ? 'border-orange-500 bg-orange-500' :
                          'border-red-500 bg-red-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sesiones Activas</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Windows - Chrome</p>
                          <p className="text-xs text-gray-500">192.168.1.100 • Activo ahora</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">iPhone - Safari</p>
                          <p className="text-xs text-gray-500">192.168.1.101 • Hace 2 horas</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Respaldo */}
        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Respaldo Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Último Respaldo</Label>
                  <p className="text-sm text-gray-600">Hace 2 horas • 1.2 GB</p>
                </div>

                <div className="space-y-2">
                  <Label>Próximo Respaldo Automático</Label>
                  <p className="text-sm text-gray-600">En 22 horas</p>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Crear Respaldo
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Historial de Respaldos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    { date: '2024-01-15 14:30', size: '1.2 GB', type: 'Automático' },
                    { date: '2024-01-14 14:30', size: '1.1 GB', type: 'Automático' },
                    { date: '2024-01-13 14:30', size: '1.2 GB', type: 'Automático' },
                    { date: '2024-01-12 10:15', size: '1.0 GB', type: 'Manual' }
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{backup.date}</p>
                        <p className="text-xs text-gray-500">{backup.size} • {backup.type}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 