import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Camera, 
  Video, 
  Mic, 
  FileText, 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Image,
  Play,
  Pause,
  Trash2,
  Edit,
  Send,
  Plus,
  Minus
} from 'lucide-react';

// Tipos para el modal de subida de evidencias
interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'text';
  file?: File;
  url?: string;
  description: string;
  timestamp: string;
  size?: number;
  duration?: number;
  uploaded: boolean;
  uploading: boolean;
  progress: number;
}

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onUpload: (payload: { title: string; note?: string; items: Evidence[] }) => void;
}

const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  taskId,
  onUpload
}) => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<'photo'>('photo');
  const [title, setTitle] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generar ID único
  const generateId = () => `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const items: Evidence[] = Array.from(files).map((file) => ({
      id: generateId(),
      type: 'photo',
      file,
      description: file.name,
      timestamp: new Date().toISOString(),
      size: file.size,
      uploaded: false,
      uploading: false,
      progress: 0,
    }));

    setEvidenceList((prev) => [...prev, ...items]);
    items.forEach((it) => simulateUpload(it.id));
  };

  // Simular proceso de subida
  const simulateUpload = async (evidenceId: string) => {
    setEvidenceList(prev => prev.map(ev => 
      ev.id === evidenceId ? { ...ev, uploading: true } : ev
    ));

    // Simular progreso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setEvidenceList(prev => prev.map(ev => 
        ev.id === evidenceId ? { ...ev, progress: i } : ev
      ));
    }

    // Marcar como subido
    setEvidenceList(prev => prev.map(ev => 
      ev.id === evidenceId ? { 
        ...ev, 
        uploading: false, 
        uploaded: true,
        url: '/placeholder.svg' // Mock URL
      } : ev
    ));

    toast({
      title: "Evidencia subida",
      description: "La evidencia ha sido subida exitosamente.",
    });
  };

  // Se removió evidencia de texto; se usa Nota general

  // Eliminar evidencia
  const removeEvidence = (evidenceId: string) => {
    setEvidenceList(prev => prev.filter(ev => ev.id !== evidenceId));
  };

  // Obtener icono por tipo
  const getTypeIcon = () => <Image className="h-4 w-4" />;

  // Obtener color por tipo
  const getTypeColor = () => 'bg-blue-100 text-blue-800';

  // Obtener texto por tipo
  const getTypeText = () => 'Foto';

  // Formatear tamaño de archivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Guardar todas las evidencias
  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: 'Título requerido', description: 'Agrega un título a la evidencia.', variant: 'destructive' });
      return;
    }
    if (evidenceList.length === 0) {
      toast({
        title: "Sin evidencias",
        description: "Debe agregar al menos una evidencia.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Simular delay de guardado
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onUpload({ title: title.trim(), note: generalNote.trim() || undefined, items: evidenceList });
    
    setIsUploading(false);
    onClose();
    
    toast({
      title: "Evidencias guardadas",
      description: `${evidenceList.length} evidencia(s) han sido guardadas exitosamente.`,
    });
  };

  // Resetear estado al cerrar
  const handleClose = () => {
    setEvidenceList([]);
    setSelectedType('photo');
    setTitle('');
    setGeneralNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>Subir Evidencias</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título y Nota */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Montaje inicial" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generalNote">Nota</Label>
              <Textarea id="generalNote" value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} placeholder="Notas generales..." rows={2} />
            </div>
          </div>

          {/* Adjuntar fotos */}
          <div className="space-y-3">
            <Label>Subir medios</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={'image/*,video/*'}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full h-12"
            >
              <Camera className="h-5 w-5 mr-2" />
              Tomar o seleccionar medios
            </Button>
          </div>

          {/* Se eliminó descripción/selector tipo; se usa Nota general más arriba */}

          {/* Lista de evidencias */}
          {evidenceList.length > 0 && (
            <div className="space-y-3">
              <Label>Evidencias Agregadas</Label>
              <div className="space-y-2">
                {evidenceList.map(evidence => (
                  <Card key={evidence.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor()}`}>
                             {getTypeIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                               {evidence.description || 'Foto'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                               <span>{getTypeText()}</span>
                              {evidence.size && (
                                <span>• {formatFileSize(evidence.size)}</span>
                              )}
                              <span>• {new Date(evidence.timestamp).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {evidence.uploading ? (
                            <div className="flex items-center gap-2">
                              <Progress value={evidence.progress} className="w-16 h-2" />
                              <span className="text-xs">{evidence.progress}%</span>
                            </div>
                          ) : evidence.uploaded ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEvidence(evidence.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas */}
          {evidenceList.length > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-bold text-blue-600">
                  {evidenceList.filter(e => e.type === 'photo').length}
                </div>
                <div className="text-gray-600">Fotos</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-bold text-purple-600">
                  {evidenceList.filter(e => e.type === 'video').length}
                </div>
                <div className="text-gray-600">Videos</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-bold text-green-600">
                  {evidenceList.filter(e => e.type === 'text').length}
                </div>
                <div className="text-gray-600">Notas</div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUploading || evidenceList.length === 0 || !title.trim()}
          >
            {isUploading ? 'Guardando...' : 'Guardar Evidencias'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceUploadModal; 