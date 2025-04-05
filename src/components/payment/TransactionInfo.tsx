
interface TransactionInfoProps {
  transactionId?: string;
  status?: string;
}

const TransactionInfo = ({ transactionId, status }: TransactionInfoProps) => {
  return (
    <div className="space-y-4">
      {transactionId && (
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">Transaction Reference</p>
          <p className="font-medium break-all">{transactionId}</p>
        </div>
      )}
      
      {status && (
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">Status</p>
          <p className="font-medium">
            <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800">
              {status}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionInfo;
