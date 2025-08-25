import { useState } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Importar lista completa desde JSON y filtrar médicos
import usersData from '../../usuarios-tumex.json';
const availableUsers = (usersData as any[]).filter(u => u.role !== 'Médico');

// Mapa de IDs reales por email (proporcionados)
const userIdByEmail: Record<string, string> = {
  // Admin y gerencias
  'admin@tumex.com': 'admin_tqg6ip5sc2dziqm3znfkj',
  'gerente.cobranza@tumex.com': 'gerente_cobranza_14bjzfj6yusnoz5ypks063',
  'gerente.comercial@tumex.com': 'gerente_comercial_nn08g2u0o4w76fjiq3o8h',
  'gerente.general@tumex.com': 'gerente_general_40uov9puvbrf1g17a5wktt',
  'gerente.operaciones@tumex.com': 'gerente_operaciones_bvjysd5p2mqesr7iilkv9s',
  'jefe.almacen@tumex.com': 'jefe_almacen_90sklow6z9o8ekx9wscxh',
  // Técnicos
  'tecnico1@tumex.com': 'tecnico1_o7bsaler2kww35spbrr5i',
  'tecnico2@tumex.com': 'tecnico2_mlgxg9gi7k8e7l1fisvt2',
  'tecnico3@tumex.com': 'tecnico3_p2i3n9lcsao8ivtx8b4gy',
  'tecnico4@tumex.com': 'tecnico4_vek4mtrw9li4888bckm6kx',
  'tecnico5@tumex.com': 'tecnico5_fwl3i3xy4vvl175tc6vgee',
  'tecnico6@tumex.com': 'tecnico6_c45vw48g09gxy0gag2twe',
  'tecnico7@tumex.com': 'tecnico7_khsqj2n41kdihexmxbhuj',
  'tecnico8@tumex.com': 'tecnico8_vexsaa40w8irjzg4jqzf7',
  'tecnico9@tumex.com': 'tecnico9_reo5kbisuhq53hbvlnin4j',
  'tecnico10@tumex.com': 'tecnico10_fm17ujotab9rbcpi2oad0k',
  // Médicos (por si se usan en algún flujo, aunque se filtran fuera del switcher)
  'dr.garcia@hospitalgeneral.com': 'dr_garcia_ip83wkymkfoyl733ujhhj',
  'dr.martinez@hospitalgeneral.com': 'dr_martinez_qmh8qqojpjneme6bubswno',
  'dr.lopez@clinicasantamaria.com': 'dr_lopez_oboboxg23hawzec8nsbng',
  'dr.hernandez@clinicasantamaria.com': 'dr_hernandez_i9x66en9hp7pgvkvgavkn',
  'dr.torres@centromedicoabc.com': 'dr_torres_lkkfkey9zqze0jj2en4ss',
  'dr.flores@centromedicoabc.com': 'dr_flores_dk3uvranl9zrxnhnenw38',
  'dr.morales@hospitalangeles.com': 'dr_morales_xn16aeu84hod6njwm4q',
  'dr.vargas@hospitalangeles.com': 'dr_vargas_83brc54of3h27copo475gw',
};

interface UserSwitcherProps {
  className?: string;
}

export function UserSwitcher({ className }: UserSwitcherProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleUserSwitch = (newUser: any) => {
    // Actualizar el usuario actual con los datos del nuevo usuario
    updateUser({
      id: userIdByEmail[newUser.email] || newUser.email,
      email: newUser.email,
      display_name: newUser.display_name,
      last_name: newUser.last_name,
      role: newUser.role,
      phone_number: newUser.phone_number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Mostrar notificación
    toast({
      title: 'Usuario cambiado',
      description: `Ahora estás usando la cuenta de ${newUser.display_name} ${newUser.last_name} (${newUser.role})`,
      variant: 'default',
    });

    setIsOpen(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'text-purple-600 bg-purple-50';
      case 'Gerente Comercial':
        return 'text-blue-600 bg-blue-50';
      case 'Gerente Operaciones':
        return 'text-green-600 bg-green-50';
      case 'Gerente Cobranza':
        return 'text-orange-600 bg-orange-50';
      case 'Gerente General':
        return 'text-indigo-600 bg-indigo-50';
      case 'Jefe de Almacén':
        return 'text-yellow-600 bg-yellow-50';
      case 'Técnico':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Cambiar Usuario</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-[80vh]">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Cambiar de Usuario</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Usuario actual */}
        {user && (
          <>
            <DropdownMenuLabel className="text-xs text-gray-500">
              Usuario Actual
            </DropdownMenuLabel>
            <DropdownMenuItem disabled className="cursor-default">
              <div className="flex items-center gap-3 w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tumex-primary-100 text-tumex-primary-600">
                  {user.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {user.display_name} {user.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                    {user.role}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Lista de usuarios disponibles (scrollable) */}
        <DropdownMenuLabel className="text-xs text-gray-500">
          Usuarios Disponibles
        </DropdownMenuLabel>
        <div className="max-h-64 overflow-y-auto pr-1">
          {availableUsers.map((availableUser) => (
            <DropdownMenuItem
              key={availableUser.email}
              onClick={() => handleUserSwitch(availableUser)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  {availableUser.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {availableUser.display_name} {availableUser.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{availableUser.email}</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(availableUser.role)}`}>
                    {availableUser.role}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            // Aquí podrías agregar lógica adicional si es necesario
            setIsOpen(false);
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 