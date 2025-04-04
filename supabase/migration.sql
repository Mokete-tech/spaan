
-- Create stored procedures for getting payments
CREATE OR REPLACE FUNCTION public.get_payment_by_transaction_id(transaction_id_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'payment_id', payment_id,
      'transaction_id', transaction_id,
      'amount', amount,
      'currency', currency,
      'status', status,
      'service_id', service_id
    )
    FROM payments
    WHERE transaction_id = transaction_id_param
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_payment_by_payment_id(payment_id_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'payment_id', payment_id,
      'transaction_id', transaction_id,
      'amount', amount,
      'currency', currency,
      'status', status,
      'service_id', service_id
    )
    FROM payments
    WHERE payment_id = payment_id_param
    LIMIT 1
  );
END;
$$;
