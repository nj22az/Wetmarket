/**
 * Traditional Retro Hong Kong Market Shopping Basket Drawer.
 * Shows selected fruits, weight calculations, and checkout receipt.
 */
import React from 'react';
import { FruitData } from '../three/fruitAssets';
import { X, Trash2, ShoppingBag, Receipt, Sparkles } from 'lucide-react';
import { marketAudio } from '../utils/audio';

export interface BasketItem {
  fruit: FruitData;
  quantity: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: BasketItem[];
  onRemoveItem: (id: string) => void;
  onClearBasket: () => void;
}

export const BasketDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearBasket,
}) => {
  if (!isOpen) return null;

  const totalHkd = items.reduce((acc, item) => acc + item.fruit.priceHkd * item.quantity, 0);
  const totalWeightGrams = items.reduce((acc, item) => acc + item.fruit.weightGrams * item.quantity, 0);
  const totalCatties = (totalWeightGrams / 600).toFixed(2);

  const handleCheckout = () => {
    marketAudio.playCoinDrop();
    alert(`Thank you for shopping at Kowloon Wet Market!\nTotal: HK$ ${totalHkd} (${totalCatties} 斤 produce bagged)`);
    onClearBasket();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col justify-between shadow-2xl p-6 text-neutral-100">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-lg font-serif">紅藍街市手提籃 (Market Basket)</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 mb-3 text-neutral-600" />
              <p className="text-sm">Your market basket is currently empty.</p>
              <p className="text-xs text-neutral-600 mt-1">Click on any fruit in the stall or use the fruit bar below to inspect and bag produce!</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[55vh] pr-1">
              {items.map(item => (
                <div
                  key={item.fruit.id}
                  className="flex items-center justify-between p-3.5 bg-neutral-800/60 rounded-xl border border-neutral-700/60"
                >
                  <div>
                    <div className="font-semibold text-sm text-neutral-200">
                      {item.fruit.nameChinese}
                      <span className="text-xs text-neutral-400 font-normal ml-1.5">
                        ({item.fruit.nameEnglish})
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {item.quantity} × HK${item.fruit.priceHkd} ·{' '}
                      <span className="text-neutral-500 font-mono">
                        {((item.fruit.weightGrams * item.quantity) / 600).toFixed(2)} 斤
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      HK${item.fruit.priceHkd * item.quantity}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.fruit.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Receipt & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-neutral-800 pt-4 space-y-4">
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Total Wet Produce Weight:</span>
                <span className="text-neutral-200 font-semibold">{totalWeightGrams}g ({totalCatties} 斤)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Subtotal (HKD):</span>
                <span className="text-amber-400 font-bold text-base">HK$ {totalHkd}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                <span>USD Equivalent:</span>
                <span>~${(totalHkd * 0.13).toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-[0.99]"
            >
              <Receipt className="w-4 h-4" />
              Complete Stall Purchase (HK$ {totalHkd})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
