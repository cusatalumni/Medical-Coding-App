import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, CheckCircle } from 'lucide-react';
import PayPalButton from './PayPalButton';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, paymentSuccess, setPaymentSuccess } = useAuth();

    const handlePaymentSuccess = () => {
        // This would be called by the PayPal button on successful payment
        setPaymentSuccess(true);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome, {user?.name}!</h1>
            <p className="text-slate-600 mb-8">Ready to test your medical coding knowledge? Choose an option below to get started.</p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Free Training Module */}
                <div className="border border-slate-200 rounded-lg p-6 flex flex-col">
                    <div className="flex items-center text-cyan-600 mb-4">
                        <BookOpen size={24} className="mr-3" />
                        <h2 className="text-2xl font-semibold">Free Training</h2>
                    </div>
                    <p className="text-slate-600 flex-grow mb-6">Hone your skills with a quick test. No strings attached.</p>
                    <ul className="text-slate-600 space-y-2 mb-6">
                        <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>10 randomly selected questions.</span></li>
                        <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>Instant score and detailed answer review.</span></li>
                    </ul>
                    <button 
                        onClick={() => navigate('/test/free')}
                        className="w-full mt-auto bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-transform transform hover:scale-105"
                    >
                        Start Free Test
                    </button>
                </div>

                {/* Paid Original Test */}
                <div className="border border-slate-200 rounded-lg p-6 flex flex-col bg-slate-50">
                    <div className="flex items-center text-teal-600 mb-4">
                        <Award size={24} className="mr-3" />
                        <h2 className="text-2xl font-semibold">Paid Original Test</h2>
                    </div>
                    <p className="text-slate-600 flex-grow mb-6">The full exam experience, designed to mimic official certification tests.</p>
                    <ul className="text-slate-600 space-y-2 mb-6">
                        <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>100 questions covering all major topics.</span></li>
                        <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>Receive a score upon completion.</span></li>
                        <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>Earn a downloadable PDF certificate for scores of 60% or higher.</span></li>
                    </ul>

                    {paymentSuccess ? (
                        <button 
                            onClick={() => navigate('/test/paid')}
                            className="w-full mt-auto bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-transform transform hover:scale-105"
                        >
                            Start Paid Test
                        </button>
                    ) : (
                        <div className="mt-auto">
                            <p className="text-center text-sm text-slate-600 mb-3 font-semibold">Complete payment to unlock the original test.</p>
                            <PayPalButton onSuccess={handlePaymentSuccess} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;