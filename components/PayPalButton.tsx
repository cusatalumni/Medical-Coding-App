
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import Spinner from './Spinner';

interface PayPalButtonProps {
  onSuccess: () => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  // This function simulates the entire PayPal checkout flow.
  // In a real application, you would integrate the PayPal SDK here.
  const handleSimulatePayment = () => {
    setIsLoading(true);
    toast.loading('Redirecting to payment gateway...');

    setTimeout(() => {
      setIsLoading(false);
      toast.dismiss();
      toast.success('Payment successful! The paid test is now unlocked.');
      onSuccess();
    }, 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="font-bold text-blue-800 text-lg mb-2">One-Time Payment: $49.99</p>
        <p className="text-blue-700 text-sm mb-4">Click below to simulate a secure payment.</p>
        <button
            onClick={handleSimulatePayment}
            disabled={isLoading}
            className="w-full bg-yellow-400 text-blue-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-500 transition flex items-center justify-center space-x-2 disabled:bg-yellow-200"
        >
            {isLoading ? <Spinner/> : (
                <>
                    <CreditCard size={20} />
                    <span>Pay with Demo PayPal</span>
                </>
            )}
        </button>
        <p className="text-xs text-gray-500 mt-2">This is a demo. No real payment will be processed.</p>
    </div>
  );
};

export default PayPalButton;
