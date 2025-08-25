import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { technicianService, type TechnicianSummary } from '@/services/technicianService';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
// ScrollArea removido; usamos overflow del contenedor
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderService } from '@/services/orderService';
import { useToast } from '@/components/ui/use-toast';

interface TechnicianAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onAssigned?: (orderId: string) => void;
}

// Modal mejorado: lista real desde BD, filtros y verificación de conflicto (solo lectura)
const TechnicianAssignmentModal: React.FC<TechnicianAssignmentModalProps> = ({ isOpen, onClose, orderId, onAssigned }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [surgeryAt, setSurgeryAt] = useState<string | null>(null);
  const [techs, setTechs] = useState<Array<TechnicianSummary & { conflict?: boolean }>>([]);
  const [expanded, setExpanded] = useState<Record<string, { loading: boolean; order: any | null }>>({});
  const [selected, setSelected] = useState<Record<string, 'principal' | 'asistente'>>({});
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Cargar surgery_at de la orden y lista de técnicos
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const at = orderId ? await technicianService.getOrderSurgeryAt(orderId) : null;
        console.log('🔍 DEBUG - surgeryAt obtenido:', at, 'para orden:', orderId);
        if (!cancelled) setSurgeryAt(at);

        const list = await technicianService.getTechnicians({ search, onlyAvailable });

        // Calcular conflictos en paralelo si tenemos surgeryAt
        const withConflicts = await Promise.all(
          list.map(async (t) => {
            let conflict = false;
            if (at) {
              try {
                conflict = await technicianService.checkConflict(t.id, at);
              } catch {
                conflict = false;
              }
            }
            return { ...t, conflict };
          })
        );

        if (!cancelled) setTechs(withConflicts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, orderId, debouncedSearch, onlyAvailable]);

  // Debounce búsqueda (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggleExpand = async (tech: TechnicianSummary) => {
    const prev = expanded[tech.id];
    const alreadyLoaded = prev && prev.order !== undefined;
    const nextState = { ...expanded } as Record<string, { loading: boolean; order: any | null }>;
    if (!alreadyLoaded) {
      nextState[tech.id] = { loading: true, order: null };
      setExpanded(nextState);
      const order = await technicianService.getTechnicianCurrentOrder(tech.id);
      nextState[tech.id] = { loading: false, order };
      setExpanded({ ...nextState });
    } else {
      // Alternar colapsable (si ya está cargado, ocultar/eliminar)
      if (prev && prev.order !== null) {
        // Ocultar
        const copy = { ...expanded };
        delete copy[tech.id];
        setExpanded(copy);
      } else {
        // Mostrar forzando recarga
        nextState[tech.id] = { loading: true, order: null };
        setExpanded(nextState);
        const order = await technicianService.getTechnicianCurrentOrder(tech.id);
        nextState[tech.id] = { loading: false, order };
        setExpanded({ ...nextState });
      }
    }
  };

  const handleToggleSelect = (techId: string) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[techId]) {
        delete copy[techId];
      } else {
        copy[techId] = 'asistente';
      }
      return copy;
    });
  };

  const handleChangeRole = (techId: string, role: 'principal' | 'asistente') => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (role === 'principal') {
        Object.keys(copy).forEach((id) => {
          if (copy[id] === 'principal') copy[id] = 'asistente';
        });
      }
      copy[techId] = role;
      return copy;
    });
  };

  const selectedCount = Object.keys(selected).length;
  const selectedList = useMemo(() => Object.entries(selected).map(([id, role]) => ({ id, role, conflict: techs.find(t => t.id === id)?.conflict })), [selected, techs]);
  const [saving, setSaving] = useState(false);
  const canAssign = selectedList.length > 0 && !!surgeryAt;
  console.log('🔍 DEBUG - canAssign:', {
    selectedListLength: selectedList.length,
    surgeryAt,
    canAssign
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const assignSelected = async () => {
    if (!orderId) return;
    setSaving(true);
    const payload = selectedList.map((s) => ({ technicianId: s.id, role: s.role as 'principal' | 'asistente' }));
    const res = await technicianService.assignTechnicians(orderId, payload, surgeryAt);
    if (res.success) {
      try {
        await orderService.updateOrderStatus(orderId, 'technicians_assigned' as any);
        // Actualizar JSON de técnicos asignados en Orders
        const techsToSave = selectedList.map((s) => ({
          id: s.id,
          name: techs.find((t) => t.id === s.id)?.name || s.id,
          role: s.role,
        }));
        await orderService.updateAssignedTechnicians(orderId, techsToSave as any);
      } catch {}
      toast({ title: 'Técnicos asignados', description: `Se asignaron ${res.count} técnico(s) a la orden.` });
      setSaving(false);
      setConfirmOpen(false);
      if (onAssigned && orderId) {
        try { onAssigned(orderId); } catch {}
      }
      onClose();
    } else {
      setSaving(false);
      toast({ title: 'Error', description: 'No se pudo completar la asignación', variant: 'destructive' });
    }
  };

  const ConfirmDialog = (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirmar asignación</DialogTitle>
          <DialogDescription>
            Se asignarán {selectedCount} técnico(s) a la orden {orderId || '-'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-auto pr-2">
          {selectedList.length === 0 ? (
            <div className="text-sm text-gray-500">No hay técnicos seleccionados.</div>
          ) : (
            selectedList.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{techs.find((t) => t.id === s.id)?.name || s.id}</span>
                <div className="flex items-center gap-2">
                  {s.conflict && (
                    <Badge className="bg-orange-50 text-orange-700 border border-orange-200">Conflicto</Badge>
                  )}
                  <Badge variant="outline">{s.role}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={saving}>Cancelar</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={assignSelected} disabled={saving || !canAssign}>
            {saving ? 'Asignando...' : `Confirmar asignación (${selectedCount})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const Filters = (
    <div className="w-full">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar técnico por nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <label className="inline-flex items-center gap-2 text-sm whitespace-nowrap">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          Solo disponibles
        </label>
      </div>
      {(search || onlyAvailable) && (
        <div className="mt-2">
          <Button variant="outline" onClick={() => { setSearch(''); setOnlyAvailable(false); }}>Limpiar filtros</Button>
        </div>
      )}
    </div>
  );

  const List = (
    <div className="w-full">
      <div className="space-y-3 mt-3">
        {loading ? (
          <div className="text-sm text-gray-600">Cargando técnicos...</div>
        ) : techs.length === 0 ? (
          <div className="text-sm text-gray-600">No se encontraron técnicos con los criterios seleccionados.</div>
        ) : (
          techs.map((t) => {
            const checked = !!selected[t.id];
            const role = selected[t.id] || 'asistente';
  return (
              <div key={t.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" checked={checked} onChange={() => handleToggleSelect(t.id)} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{t.name}</p>
                      <p className="text-xs text-gray-600 truncate">{t.email}</p>
              </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.conflict && (
                      <Badge className="bg-orange-50 text-orange-700 border border-orange-200">Posible conflicto</Badge>
                    )}
                    <Badge className={t.isAvailableNow ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border'}>
                      {t.isAvailableNow ? 'Disponible' : 'No disponible'}
                            </Badge>
                    <Button variant="outline" onClick={() => handleToggleExpand(t)}>Detalles</Button>
                          </div>
                            </div>
                {checked && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Rol:</span>
                    <Select value={role} onValueChange={(v) => handleChangeRole(t.id, v as 'principal' | 'asistente')}>
                      <SelectTrigger className="h-8 w-40">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="asistente">Asistente</SelectItem>
                      </SelectContent>
                    </Select>
                              </div>
                            )}
                {expanded[t.id] && (
                  <div className="mt-3 bg-gray-50 rounded p-3 text-sm">
                    {expanded[t.id].loading ? (
                      <div className="text-gray-600">Cargando detalles...</div>
                    ) : expanded[t.id].order ? (
                      <div className="space-y-1">
                        <div><span className="font-medium">Orden actual:</span> {expanded[t.id].order.id}</div>
                        <div><span className="font-medium">Procedimiento:</span> {expanded[t.id].order.Procedures?.name || '—'}</div>
                        <div><span className="font-medium">Doctor:</span> {expanded[t.id].order.Users ? `${expanded[t.id].order.Users.display_name} ${expanded[t.id].order.Users.last_name}` : '—'}</div>
                        <div><span className="font-medium">Desde:</span> {t.currentSince ? new Date(t.currentSince).toLocaleString() : '—'}</div>
                              </div>
                    ) : (
                      <div className="text-gray-600">No se encontró información de orden actual.</div>
                    )}
                                  </div>
                                )}
                                  </div>
            );
          })
                            )}
                          </div>
    </div>
  );

  const Summary = (
    <div className="p-4 md:p-3 border rounded-lg md:sticky md:top-2">
      <h3 className="font-semibold mb-2">Resumen</h3>
      <div className="text-sm text-gray-700 mb-2">Seleccionados: {selectedCount}</div>
      <div className="space-y-2 max-h-64 overflow-auto pr-2">
        {selectedList.length === 0 ? (
          <div className="text-sm text-gray-500">Aún no has seleccionado técnicos.</div>
        ) : selectedList.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-sm">
            <span className="truncate">{techs.find(t => t.id === s.id)?.name || s.id}</span>
            <div className="flex items-center gap-2">
              {s.conflict && (
                <Badge className="bg-orange-50 text-orange-700 border border-orange-200">Conflicto</Badge>
              )}
              <Badge variant="outline">{s.role}</Badge>
            </div>
          </div>
                                ))}
                              </div>
                            </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Asignar Técnicos</DrawerTitle>
              <DrawerDescription>Orden: {orderId || '-'} • Selección (sin asignación)</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2 flex flex-col max-h-[85vh]">
              <Accordion type="single" collapsible>
                <AccordionItem value="filters">
                  <AccordionTrigger>Filtros</AccordionTrigger>
                  <AccordionContent>{Filters}</AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="flex-1 overflow-y-auto mt-2">{List}</div>
              <div className="mt-3">{Summary}</div>
            </div>
            <DrawerFooter>
              <Button className="bg-blue-600 hover:bg-blue-700" disabled={!canAssign || saving} onClick={() => setConfirmOpen(true)}>Asignar ({selectedCount})</Button>
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        {ConfirmDialog}
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden">
          <div className="flex flex-col max-h-[90vh]">
            <div className="border-b p-4">
              <DialogHeader>
                <DialogTitle>Asignar Técnicos</DialogTitle>
                <DialogDescription>Orden: {orderId || '-'} • Selección (sin asignación)</DialogDescription>
              </DialogHeader>
              <div className="hidden md:block mt-2">{Filters}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid md:grid-cols-[2fr_1fr] gap-4">
              <div>
                <div className="md:hidden mb-2">{Filters}</div>
                {List}
              </div>
              <div>{Summary}</div>
            </div>
            <div className="border-t p-3 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" disabled={!canAssign || saving} onClick={() => setConfirmOpen(true)}>Asignar ({selectedCount})</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {ConfirmDialog}
    </>
  );

  
};

export default TechnicianAssignmentModal; 


