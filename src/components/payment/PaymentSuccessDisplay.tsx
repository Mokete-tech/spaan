
import { CheckCircle } from "lucide-react";
import PaymentDetailsBreakdown from "./PaymentDetailsBreakdown";
import TransactionInfo from "./TransactionInfo";
import ActionButtons from "./ActionButtons";

interface PaymentData {
  payment_id?: string;
  transaction_id?: string;
  amount?: number;
  status?: string;
  service_id?: string;
  currency?: string;
  payment_details?: {
    amount_fee?: number;
    amount_net?: number;
    custom_str1?: string;
    [key: string]: any;
  };
}

interface PaymentSuccessDisplayProps {
  paymentData: PaymentData;
}

const PaymentSuccessDisplay = ({ paymentData }: PaymentSuccessDisplayProps) => {
  // Calculate commission and provider amounts
  const commissionRate = 0.05; // 5% platform fee
  const grossAmount = paymentData?.amount || 0;
  const payfastFee = paymentData?.payment_details?.amount_fee || 0;
  const netAfterFees = paymentData?.payment_details?.amount_net || (grossAmount - payfastFee);
  const commission = netAfterFees * commissionRate;
  const providerAmount = netAfterFees - commission;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <PaymentDetailsBreakdown
        currency={paymentData.currency || 'ZAR'}
        grossAmount={grossAmount}
        payfastFee={payfastFee}
        netAfterFees={netAfterFees}
        commission={commission}
        providerAmount={providerAmount}
      />
      
      <TransactionInfo 
        transactionId={paymentData.transaction_id} 
        status={paymentData.status} 
      />
      
      <div className="mt-8">
        <ActionButtons serviceId={paymentData.service_id} />
      </div>
    </div>
  );
};

export default PaymentSuccessDisplay;
