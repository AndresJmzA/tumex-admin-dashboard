import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';

// Tipos de producto
const CATEGORIES = [
  'Consumible',
  'Accesorio',
  'Instrumental',
  'Equipo',
  'Endoscopio',
  'Cable/Conector',
];
const STATUSES = [
  'disponible',
  'en_renta',
  'mantenimiento',
  'fuera_servicio',
];

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ProductFormValues>;
  onSubmit?: (values: ProductFormValues) => void;
}

export interface ProductFormValues {
  name: string;
  brand: string;
  category: string;
  description: string;
  stock: number;
  status: string;
  images: File[];
}

const defaultValues: ProductFormValues = {
  name: '',
  brand: '',
  category: '',
  description: '',
  stock: 0,
  status: 'disponible',
  images: [],
};

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, initialData, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ProductFormValues>({ ...defaultValues, ...initialData });
  const [touched, setTouched] = useState<{ [K in keyof ProductFormValues]?: boolean }>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Validaciones por paso
  const validateStep = () => {
    if (step === 0) {
      return (
        values.name.trim() !== '' &&
        values.brand.trim() !== '' &&
        values.category.trim() !== '' &&
        values.description.trim() !== ''
      );
    }
    if (step === 1) {
      return (
        values.stock >= 0 &&
        STATUSES.includes(values.status)
      );
    }
    if (step === 2) {
      return values.images.every(img => img.size < 5 * 1024 * 1024);
    }
    return true;
  };

  // Manejo de cambios
  const handleChange = (field: keyof ProductFormValues, value: any) => {
    setValues(v => ({ ...v, [field]: value }));
    setTouched(t => ({ ...t, [field]: true }));
  };

  // Manejo de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setValues(v => ({ ...v, images: files }));
    setTouched(t => ({ ...t, images: true }));
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  // Enviar formulario
  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onSubmit) onSubmit(values);
      onClose();
      console.log('Producto guardado:', values);
    }, 1000);
  };

  // Pasos del formulario
  const steps = [
    {
      label: 'Datos Básicos',
      content: (
        <div className="space-y-4">
          <Input
            label="Nombre del producto"
            placeholder="Ej: Bisturí, Monitor, etc."
            value={values.name}
            onChange={e => handleChange('name', e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Marca"
            placeholder="Ej: Philips, Stryker, etc."
            value={values.brand}
            onChange={e => handleChange('brand', e.target.value)}
            required
          />
          <Select value={values.category} onValueChange={val => handleChange('category', val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Descripción detallada del producto"
            value={values.description}
            onChange={e => handleChange('description', e.target.value)}
            required
            rows={3}
          />
        </div>
      )
    },
    {
      label: 'Stock y Estado',
      content: (
        <div className="space-y-4">
          <Input
            type="number"
            label="Stock actual"
            min={0}
            value={values.stock}
            onChange={e => handleChange('stock', Number(e.target.value))}
            required
            placeholder="Cantidad disponible actualmente"
            helperText="Ingresa la cantidad disponible en inventario."
          />
          <Select value={values.status} onValueChange={val => handleChange('status', val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona estado" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(st => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      label: 'Imágenes',
      content: (
        <div className="space-y-4">
          <label className="block font-medium mb-1">Imágenes del producto (opcional, máx 5MB c/u)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <div className="flex gap-2 flex-wrap mt-2">
            {imagePreviews.map((src, i) => (
              <img key={i} src={src} alt="preview" className="w-20 h-20 object-cover rounded border" />
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          {steps.map((s, i) => (
            <div key={i} className={`flex-1 h-2 rounded ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          ))}
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">{steps[step].label}</h3>
          {steps[step].content}
        </div>
        <div className="flex justify-between items-center gap-2">
          <Button variant="ghost" onClick={onClose} size="icon"><X /></Button>
          <div className="flex gap-2 flex-1 justify-end">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={submitting}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
            )}
            {step < steps.length - 1 && (
              <Button onClick={() => setStep(step + 1)} disabled={!validateStep() || submitting}>
                Siguiente <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {step === steps.length - 1 && (
              <Button onClick={handleSubmit} disabled={!validateStep() || submitting}>
                {submitting ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear producto'}
                {submitting && <CheckCircle className="ml-2 animate-spin" />}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm; 