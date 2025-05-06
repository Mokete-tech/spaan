
export interface PaymentData {
  id: string;
  service_id: string;
  buyer_id: string;
  provider_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  escrow_transaction_id?: string;
  payment_details?: any;
  created_at: string;
  updated_at: string;
  payfast_fee?: number;
  net_after_payfast?: number;
  commission?: number;
  provider_amount?: number;
  conversion_fee?: number;
  escrow_fee?: number;
  service?: {
    title: string;
    description?: string;
  };
  buyer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  provider?: {
    email?: string;
    business_name?: string;
  } | null;
}
