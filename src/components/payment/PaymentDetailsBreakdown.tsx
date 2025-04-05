
import { Separator } from "@/components/ui/separator";

interface PaymentBreakdownProps {
  currency: string;
  grossAmount: number;
  payfastFee: number;
  netAfterFees: number;
  commission: number;
  providerAmount: number;
}

const PaymentDetailsBreakdown = ({
  currency,
  grossAmount,
  payfastFee,
  netAfterFees,
  commission,
  providerAmount,
}: PaymentBreakdownProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2 text-center">Payment Details</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Gross Amount:</span>
          <span>{currency} {grossAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>PayFast Fee:</span>
          <span>- {currency} {payfastFee?.toFixed(2) || '0.00'}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Net After PayFast:</span>
          <span>{currency} {netAfterFees?.toFixed(2) || grossAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Spaan Commission (5%):</span>
          <span>- {currency} {commission.toFixed(2)}</span>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex justify-between font-semibold pt-1">
          <span>Provider Receives:</span>
          <span>{currency} {providerAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsBreakdown;
