"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, TrendingDown, ArrowUpDown, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { AlertType, Provider } from "@/types/priceAlert";
import { Smartphone } from "@/types/smartphone";
import { AlertTriangle } from "lucide-react";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  smartphone: Smartphone;
  provider: Provider;
  upfrontPrice: number;
}

export function PriceAlertModal({ isOpen, onClose, smartphone, provider, upfrontPrice }: PriceAlertModalProps) {
  const [email, setEmail] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("price-drop");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialiser les états quand la modal est fermée ou quand le smartphone change
  useEffect(() => {
    setError(null);
    setSuccess(false);
    setEmail("");
    setAlertType("price-drop");
  }, [isOpen, smartphone.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/price-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          smartphoneId: smartphone.id,
          provider: provider.toLowerCase(),
          email,
          alertType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || "Une erreur est survenue lors de la création de l'alerte");
      }
    } catch (error) {
      console.error("Error creating price alert:", error);
      setError("Une erreur est survenue lors de la création de l'alerte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] sm:max-w-[425px] bg-white rounded-lg p-6 shadow-lg">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <Dialog.Title className="text-xl font-semibold">
                  Créer une alerte de prix
                </Dialog.Title>
              </div>
              <Dialog.Description className="text-gray-600">
                Recevez une notification par email lorsque le prix du {smartphone.brand} {smartphone.model} change chez {provider}.
              </Dialog.Description>
            </div>

            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-900 rounded-lg p-4 flex items-center gap-3">
                <div className="p-1 rounded-full bg-green-200">
                  <Bell className="h-4 w-4 text-green-700" />
                </div>
                <p>Alerte créée avec succès ! Vous recevrez un email lorsque le prix changera.</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-900 rounded-lg p-4 flex items-center gap-3">
                <div className="p-1 rounded-full bg-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                </div>
                <p>{error}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                  <Label className="text-gray-600">Prix initial actuel</Label>
                  <div className="text-3xl font-bold text-gray-900">{upfrontPrice}€</div>
                  <p className="text-sm text-gray-500">Chez {provider}</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700">Type d'alerte</Label>
                  <RadioGroup
                    value={alertType}
                    onValueChange={(value) => setAlertType(value as AlertType)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="price-drop" id="price-drop" className="mt-1" />
                      <div className="space-y-1.5">
                        <Label htmlFor="price-drop" className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <TrendingDown className="h-4 w-4 text-green-600" />
                          Baisses de prix uniquement
                        </Label>
                        <p className="text-sm text-gray-500">
                          Soyez notifié lorsque le prix baisse
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="any-change" id="any-change" className="mt-1" />
                      <div className="space-y-1.5">
                        <Label htmlFor="any-change" className="flex items-center gap-2 cursor-pointer text-gray-900">
                          <ArrowUpDown className="h-4 w-4 text-blue-600" />
                          Toute modification de prix
                        </Label>
                        <p className="text-sm text-gray-500">
                          Soyez notifié de tout changement de prix
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-colors ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Création..." : "Créer l'alerte"}
                </button>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
