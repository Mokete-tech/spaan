
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

-- Create function to add a reaction
CREATE OR REPLACE FUNCTION public.add_reaction(
  content_id_param UUID,
  content_type_param TEXT,
  user_id_param UUID,
  reaction_type_param TEXT DEFAULT 'tick'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO reactions (content_id, content_type, user_id, reaction_type)
  VALUES (content_id_param, content_type_param, user_id_param, reaction_type_param)
  ON CONFLICT (content_id, content_type, user_id) DO NOTHING;
END;
$$;

-- Create function to delete a reaction
CREATE OR REPLACE FUNCTION public.delete_reaction(
  content_id_param UUID,
  content_type_param TEXT,
  user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM reactions
  WHERE content_id = content_id_param
  AND content_type = content_type_param
  AND user_id = user_id_param;
END;
$$;
