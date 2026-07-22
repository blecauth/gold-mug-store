import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  models: string[];
  colors: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(product.models[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  const handleBuy = () => {
    // Função de compra ainda inativa para implementação futura
    console.log('Compra iniciada:', {
      product: product.name,
      model: selectedModel,
      color: selectedColor,
      price: product.price
    });
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer overflow-hidden border border-border"
      >
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
            <DialogDescription className="text-base">
              {product.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Imagem do produto */}
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Seleção de modelo */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Escolha o Modelo
              </Label>
              <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                <div className="space-y-2">
                  {product.models.map((model) => (
                    <div key={model} className="flex items-center space-x-2">
                      <RadioGroupItem value={model} id={`model-${model}`} />
                      <Label htmlFor={`model-${model}`} className="cursor-pointer">
                        {model}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Seleção de cor */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Escolha a Cor
              </Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                <div className="space-y-2">
                  {product.colors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <RadioGroupItem value={color} id={`color-${color}`} />
                      <Label htmlFor={`color-${color}`} className="cursor-pointer">
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Preço e botão */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-foreground">
                  Preço:
                </span>
                <span className="text-3xl font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleBuy}
                className="w-full bg-primary text-primary-foreground hover:bg-opacity-90 py-3 text-lg font-semibold"
                disabled
              >
                Comprar (Em breve)
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full mt-2"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
