
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Calendar, AlertCircle } from "lucide-react";

interface CardPaymentProps {
  formData: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  };
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CardPayment: React.FC<CardPaymentProps> = ({
  formData,
  errors,
  handleInputChange,
}) => {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="cardName">Name on card</Label>
        <Input
          id="cardName"
          name="cardName"
          value={formData.cardName}
          onChange={handleInputChange}
          placeholder="John Doe"
          className={errors.cardName ? "border-red-500" : ""}
        />
        {errors.cardName && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.cardName}
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="cardNumber">Card number</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            className={`pl-10 ${errors.cardNumber ? "border-red-500" : ""}`}
            maxLength={19}
          />
          <CreditCard className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
        </div>
        {errors.cardNumber && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.cardNumber}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry">Expiry date</Label>
          <div className="relative">
            <Input
              id="expiry"
              name="expiry"
              value={formData.expiry}
              onChange={handleInputChange}
              placeholder="MM/YY"
              className={`pl-10 ${errors.expiry ? "border-red-500" : ""}`}
              maxLength={5}
            />
            <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          </div>
          {errors.expiry && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.expiry}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            name="cvc"
            value={formData.cvc}
            onChange={handleInputChange}
            placeholder="123"
            className={errors.cvc ? "border-red-500" : ""}
            maxLength={4}
          />
          {errors.cvc && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.cvc}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default CardPayment;
