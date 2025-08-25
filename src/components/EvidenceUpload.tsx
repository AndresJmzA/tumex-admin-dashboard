import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Camera, 
  Image, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  MapPin, 
  Clock, 
  User, 
  Download, 
  Share, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Settings, 
  Info, 
  HelpCircle, 
  ExternalLink, 
  Link, 
  Copy, 
  Scissors, 
  Bookmark, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Frown, 
  Meh,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  BatteryCharging,
  Navigation,
  Locate,
  Timer,
  CheckSquare,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Flag,
  AlertTriangle,
  LogOut,
  Menu,
  Home,
  List,
  Grid,
  BarChart3,
  UserCheck,
  Clipboard,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Truck,
  Package,
  Wrench,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Tipos para el sistema de evidencias
export interface Evidence {
  id: string;
  taskId: string;
  type: 'photo' | 'video' | 'document' | 'audio';
  url: string;
  timestamp: string;
  notes: string;
  stage: 'arrival' | 'setup' | 'procedure' | 'cleanup' | 'departure';
  location?: string;
  technician: string;
  fileSize?: number;
  duration?: number; // para videos
  thumbnail?: string;
  tags?: string[];
  approved?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  coordinates?: { lat: number; lng: number };
  deviceInfo?: {
    model: string;
    os: string;
    appVersion: string;
  };
}

interface EvidenceUploadProps {
  taskId: string;
  taskNumber: string;
  currentStage: 'arrival' | 'setup' | 'procedure' | 'cleanup' | 'departure';
  onEvidenceUploaded?: (evidence: Evidence) => void;
  onClose?: () => void;
  existingEvidence?: Evidence[];
  maxFiles?: number;
  allowedTypes?: ('photo' | 'video' | 'document' | 'audio')[];
  isMobile?: boolean;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  taskId,
  taskNumber,
  currentStage,
  onEvidenceUploaded,
  onClose,
  existingEvidence = [],
  maxFiles = 10,
  allowedTypes = ['photo', 'video', 'document', 'audio'],
  isMobile = true
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentEvidence, setCurrentEvidence] = useState<Evidence[]>(existingEvidence);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedStage, setSelectedStage] = useState(currentStage);
  const [isDragOver, setIsDragOver] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const stageLabels: Record<string, string> = {
    arrival: 'Llegada al Sitio',
    setup: 'Preparación',
    procedure: 'Durante el Procedimiento',
    cleanup: 'Limpieza',
    departure: 'Salida del Sitio'
  };

  const stageIcons: Record<string, React.ReactNode> = {
    arrival: <MapPin className="h-4 w-4" />,
    setup: <Settings className="h-4 w-4" />,
    procedure: <Play className="h-4 w-4" />,
    cleanup: <RotateCcw className="h-4 w-4" />,
    departure: <X className="h-4 w-4" />
  };

  const stageColors: Record<string, string> = {
    arrival: 'bg-blue-100 text-blue-800',
    setup: 'bg-green-100 text-green-800',
    procedure: 'bg-purple-100 text-purple-800',
    cleanup: 'bg-orange-100 text-orange-800',
    departure: 'bg-red-100 text-red-800'
  };

  // Obtener información del dispositivo
  useEffect(() => {
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      setDeviceInfo({
        isMobile,
        userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    };

    getDeviceInfo();
  }, []);

  // Obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationEnabled(true);
          toast({
            title: "Ubicación obtenida",
            description: "Se ha capturado tu ubicación actual.",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Error de ubicación",
            description: "No se pudo obtener tu ubicación. Verifica los permisos.",
            variant: "destructive"
          });
        }
      );
    }
  }, [toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Límite de archivos",
        description: `Máximo ${maxFiles} archivos permitidos`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    
    // Generar previsualizaciones
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => [...prev, '']);
      }
    });
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const uploadEvidence = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Sin archivos",
        description: "Selecciona al menos un archivo",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular proceso de carga
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Simular carga progresiva
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);

        // Crear objeto de evidencia
        const evidence: Evidence = {
          id: `ev_${Date.now()}_${i}`,
          taskId,
          type: file.type.startsWith('image/') ? 'photo' : 
                file.type.startsWith('video/') ? 'video' : 
                file.type.startsWith('audio/') ? 'audio' : 'document',
          url: URL.createObjectURL(file),
          timestamp: new Date().toISOString(),
          notes: notes || `Evidencia de ${stageLabels[selectedStage]}`,
          stage: selectedStage,
          location: currentLocation ? `${currentLocation.lat}, ${currentLocation.lng}` : 'Ubicación no disponible',
          technician: 'Técnico actual', // TODO: Obtener usuario actual
          fileSize: file.size,
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          tags: [selectedStage, file.type.split('/')[0]],
          approved: false,
          coordinates: currentLocation || undefined,
          deviceInfo: deviceInfo
        };

        setCurrentEvidence(prev => [...prev, evidence]);
        
        if (onEvidenceUploaded) {
          onEvidenceUploaded(evidence);
        }
      }

      // Limpiar formulario
      setSelectedFiles([]);
      setPreviews([]);
      setNotes('');
      
      toast({
        title: "Evidencia subida",
        description: `${selectedFiles.length} archivo(s) subido(s) exitosamente.`,
      });
      
    } catch (error) {
      console.error('Error al subir evidencia:', error);
      toast({
        title: "Error al subir",
        description: "Error al subir la evidencia. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="h-6 w-6" />;
      case 'video': return <Play className="h-6 w-6" />;
      case 'audio': return <Volume2 className="h-6 w-6" />;
      case 'document': return <FileText className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <Card className="w-full max-w-md max-h-[95vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">Subir Evidencia</CardTitle>
                <p className="text-sm opacity-90">
                  {taskNumber} • {stageLabels[currentStage]}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 max-h-[calc(95vh-120px)] overflow-y-auto">
          {/* Etapa actual */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            {stageIcons[currentStage]}
            <div>
              <p className="font-medium text-blue-900">{stageLabels[currentStage]}</p>
              <p className="text-sm text-blue-700">Captura evidencia de esta etapa</p>
            </div>
          </div>

          {/* Selector de etapa */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Etapa de evidencia</label>
            <Select value={selectedStage} onValueChange={(value: 'arrival' | 'setup' | 'procedure' | 'cleanup' | 'departure') => setSelectedStage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(stageLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {stageIcons[key]}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ubicación</label>
              <Button
                size="sm"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={locationEnabled}
              >
                <Locate className="h-4 w-4 mr-1" />
                {locationEnabled ? 'Obtenida' : 'Obtener'}
              </Button>
            </div>
            {currentLocation && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Opciones de captura */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={handleCameraCapture}
              disabled={isUploading}
            >
              <Camera className="h-6 w-6 mb-1" />
              <span className="text-xs">Cámara</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={handleGallerySelect}
              disabled={isUploading}
            >
              <Image className="h-6 w-6 mb-1" />
              <span className="text-xs">Galería</span>
            </Button>
          </div>

          {/* Zona de drag & drop */}
          <div
            ref={dropZoneRef}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Arrastra archivos aquí o
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={handleGallerySelect}
              className="text-blue-600 p-0 h-auto"
            >
              selecciona archivos
            </Button>
          </div>

          {/* Inputs ocultos */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Archivos seleccionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Archivos seleccionados ({selectedFiles.length})</h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {previews[index] ? (
                        <img 
                          src={previews[index]} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {getFileIcon(file.type.startsWith('image/') ? 'photo' : 
                                     file.type.startsWith('video/') ? 'video' : 
                                     file.type.startsWith('audio/') ? 'audio' : 'document')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campo de notas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas de la evidencia</label>
            <Textarea
              placeholder="Describe lo que se muestra en la evidencia, observaciones importantes, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isUploading}
            />
          </div>

          {/* Evidencias existentes */}
          {currentEvidence.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Evidencias de esta tarea ({currentEvidence.length})</h3>
              <div className="space-y-2">
                {currentEvidence.map((evidence) => (
                  <div 
                    key={evidence.id} 
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedEvidence(evidence)}
                  >
                    <div className="flex-shrink-0">
                      {evidence.thumbnail ? (
                        <img 
                          src={evidence.thumbnail} 
                          alt="Evidence" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {getFileIcon(evidence.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {evidence.type}
                        </Badge>
                        <Badge className={`text-xs ${stageColors[evidence.stage]}`}>
                          {stageLabels[evidence.stage]}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {evidence.notes.length > 30 ? evidence.notes.substring(0, 30) + '...' : evidence.notes}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(evidence.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progreso de carga */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Subiendo evidencia...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={uploadEvidence}
              disabled={selectedFiles.length === 0 || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Evidencia
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de previsualización */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
            <CardHeader className="bg-gray-900 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Evidencia</CardTitle>
                  <p className="text-sm opacity-90">
                    {formatTimestamp(selectedEvidence.timestamp)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedEvidence(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  {selectedEvidence.thumbnail && (
                    <img 
                      src={selectedEvidence.thumbnail} 
                      alt="Evidence" 
                      className="w-full rounded-lg"
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium mb-2">Notas</h3>
                    <p className="text-gray-700 text-sm">{selectedEvidence.notes}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="font-medium">{selectedEvidence.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Etapa</p>
                      <p className="font-medium">{stageLabels[selectedEvidence.stage]}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Técnico</p>
                      <p className="font-medium">{selectedEvidence.technician}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tamaño</p>
                      <p className="font-medium">
                        {selectedEvidence.fileSize ? formatFileSize(selectedEvidence.fileSize) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EvidenceUpload; 