import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Calculator, DollarSign, Send, X, Info } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

interface OrderCardProps {
  orderId: string;
  patientName: string;
  typeOfCoverage: string;
  insuranceName?: string;
  products?: Product[];
  clientInfo?: {
    clientId: string;
    clientName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
}

interface PriceCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderCardProps | null;
  onSendPrice: (price: number, notes: string) => void;
}

// Tabulador de precios mock
const priceTabulator = {
  private: {
    'Monitor Multiparamétrico': 2500,
    'Bomba de Infusión': 1200,
    'Desfibrilador': 3500,
    'Ventilador Mecánico': 4500,
    'Electrocardiógrafo': 1800,
    'Oxímetro de Pulso': 300,
    'Lámpara Quirúrgica': 2200,
    'Máquina de Anestesia': 8000,
    'Monitor de Presión Arterial': 1500,
    'Aspirador Quirúrgico': 1200,
    'Cauterio': 3500,
    'Mesa Quirúrgica': 12000,
    'Monitor de Signos Vitales': 2800,
    'Bomba de Succión': 1800,
    'Endoscopio': 15000,
    'Monitor de Video': 3500,
    'Fuente de Luz': 2800,
    'Ultrasonido': 25000,
    'Monitor de Presión': 1800
  },
  insurance: {
    'Monitor Multiparamétrico': 2200,
    'Bomba de Infusión': 1000,
    'Desfibrilador': 3200,
    'Ventilador Mecánico': 4000,
    'Electrocardiógrafo': 1600,
    'Oxímetro de Pulso': 250,
    'Lámpara Quirúrgica': 2000,
    'Máquina de Anestesia': 7200,
    'Monitor de Presión Arterial': 1300,
    'Aspirador Quirúrgico': 1000,
    'Cauterio': 3200,
    'Mesa Quirúrgica': 10800,
    'Monitor de Signos Vitales': 2500,
    'Bomba de Succión': 1600,
    'Endoscopio': 13500,
    'Monitor de Video': 3200,
    'Fuente de Luz': 2500,
    'Ultrasonido': 22500,
    'Monitor de Presión': 1600
  }
};

const PriceCalculatorModal: React.FC<PriceCalculatorModalProps> = ({
  isOpen,
  onClose,
  order,
  onSendPrice
}) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [priceNotes, setPriceNotes] = useState<string>('');
  const [useCustomPrice, setUseCustomPrice] = useState<boolean>(false);
  const [priceBreakdown, setPriceBreakdown] = useState<Array<{
    product: Product;
    basePrice: number;
    quantity: number;
    subtotal: number;
  }>>([]);

  useEffect(() => {
    if (order && order.products) {
      const coverageType = order.typeOfCoverage === 'Seguro' ? 'insurance' : 'private';
      const breakdown = order.products.map(product => {
        const basePrice = priceTabulator[coverageType][product.name] || product.price;
        return {
          product,
          basePrice,
          quantity: product.quantity,
          subtotal: basePrice * product.quantity
        };
      });
      
      setPriceBreakdown(breakdown);
      const total = breakdown.reduce((sum, item) => sum + item.subtotal, 0);
      setCalculatedPrice(total);
      setCustomPrice(total);
    }
  }, [order]);

  const handleSendPrice = () => {
    const finalPrice = useCustomPrice ? customPrice : calculatedPrice;
    onSendPrice(finalPrice, priceNotes);
  };

  const handleClose = () => {
    setUseCustomPrice(false);
    setPriceNotes('');
    onClose();
  };

  if (!order) return null;

  const finalPrice = useCustomPrice ? customPrice : calculatedPrice;
  const priceDifference = customPrice - calculatedPrice;
  const isPriceModified = useCustomPrice && customPrice !== calculatedPrice;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Precios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la orden */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Orden ID</Label>
                  <p className="text-sm">{order.orderId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Paciente</Label>
                  <p className="text-sm">{order.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo de Cobertura</Label>
                  <Badge variant={order.typeOfCoverage === 'Seguro' ? 'default' : 'secondary'}>
                    {order.typeOfCoverage}
                  </Badge>
                </div>
                {order.insuranceName && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Aseguradora</Label>
                    <p className="text-sm">{order.insuranceName}</p>
                  </div>
                )}
              </div>
              {order.clientInfo && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p className="text-sm">{order.clientInfo.clientName}</p>
                  {order.clientInfo.contactPerson && (
                    <p className="text-xs text-gray-500">{order.clientInfo.contactPerson}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desglose de productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Desglose de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priceBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        ${item.basePrice.toLocaleString()} × {item.quantity}
                      </p>
                      <p className="font-medium text-sm">
                        ${item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cálculo de precio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cálculo de Precio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Precio Calculado</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  ${calculatedPrice.toLocaleString()}
                </span>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useCustomPrice"
                    checked={useCustomPrice}
                    onChange={(e) => setUseCustomPrice(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="useCustomPrice" className="text-sm font-medium">
                    Usar precio personalizado
                  </Label>
                </div>

                {useCustomPrice && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customPrice" className="text-sm font-medium">
                        Precio Personalizado
                      </Label>
                      <Input
                        id="customPrice"
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="mt-1"
                        placeholder="Ingrese el precio personalizado"
                      />
                    </div>

                    {isPriceModified && (
                      <div className={`p-3 rounded-lg ${
                        priceDifference > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Info className={`h-4 w-4 ${
                            priceDifference > 0 ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            priceDifference > 0 ? 'text-yellow-800' : 'text-green-800'
                          }`}>
                            {priceDifference > 0 ? 'Incremento' : 'Descuento'} de ${Math.abs(priceDifference).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Precio Final</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ${finalPrice.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notas adicionales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={priceNotes}
                onChange={(e) => setPriceNotes(e.target.value)}
                placeholder="Agregue notas sobre el precio, condiciones especiales, descuentos aplicados, etc."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSendPrice} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Enviar Precio al Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceCalculatorModal; 