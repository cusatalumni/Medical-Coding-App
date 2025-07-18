
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { mockTestResults } from '../services/googleSheetsService';
import type { TestResult } from '../types';
import Spinner from './Spinner';
import { Check, X, FileDown } from 'lucide-react';

const Results: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<TestResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!testId) {
            toast.error("Test ID is missing.");
            navigate('/dashboard');
            return;
        }

        // This is a simplification. In a real app, you'd fetch results by ID.
        // Here we just grab the latest result from the mock service's memory.
        const fetchResult = async () => {
            setIsLoading(true);
            // Simulating a fetch. In a real app, you'd call a getResultById(testId)
            // But our mock service stores results in an array, so we find it.
            const foundResult = mockTestResults.find(r => r.testId === testId);
            
            await new Promise(res => setTimeout(res, 500)); // simulate delay
            
            if (foundResult) {
                setResult(foundResult);
            } else {
                toast.error("Could not find your test results.");
                navigate('/dashboard');
            }
            setIsLoading(false);
        };
        fetchResult();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testId, navigate]);

    if (isLoading) {
        return <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md"><Spinner /><p className="mt-4 text-slate-600">Calculating your results...</p></div>;
    }
    
    if (!result) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-md"><p>Could not load results.</p></div>
    }
    
    const isPass = result.score >= 60;
    const scoreColor = isPass ? 'text-green-600' : 'text-red-600';

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Test Results</h1>
            
            <div className={`text-center border-2 ${isPass ? 'border-green-200' : 'border-red-200'} bg-slate-50 rounded-lg p-6 mb-8`}>
                <p className="text-lg text-slate-600">Your Score</p>
                <p className={`text-7xl font-bold ${scoreColor}`}>{result.score}%</p>
                <p className="text-slate-500 mt-2">({result.correctCount} out of {result.totalQuestions} correct)</p>
                {result.testType === 'paid' && (
                    <p className={`mt-4 text-xl font-semibold ${scoreColor}`}>{isPass ? 'Congratulations, you passed!' : 'Unfortunately, you did not pass.'}</p>
                )}
            </div>

            {result.testType === 'paid' && isPass && (
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate(`/certificate/${result.testId}`)}
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                    >
                        <FileDown size={20} />
                        <span>Download Your Certificate</span>
                    </button>
                </div>
            )}
            
            {result.testType === 'free' && (
                <div>
                    <h2 className="text-2xl font-semibold text-slate-700 mb-4">Answer Review</h2>
                    <div className="space-y-6">
                        {result.review.map((item, index) => (
                            <div key={item.questionId} className="border border-slate-200 rounded-lg p-4">
                                <p className="font-semibold text-slate-800 mb-3">{index + 1}. {item.question}</p>
                                <div className="space-y-2">
                                    {item.options.map((option, optionIndex) => {
                                        const isUserAnswer = item.userAnswer === optionIndex;
                                        const isCorrectAnswer = item.correctAnswer === optionIndex;
                                        let bgClass = 'bg-slate-50';
                                        if (isCorrectAnswer) bgClass = 'bg-green-100 border-green-400';
                                        else if (isUserAnswer && !isCorrectAnswer) bgClass = 'bg-red-100 border-red-400';

                                        return (
                                            <div key={optionIndex} className={`flex items-center p-3 rounded ${bgClass}`}>
                                                {isUserAnswer && !isCorrectAnswer && <X size={18} className="text-red-600 mr-2 shrink-0" />}
                                                {isCorrectAnswer && <Check size={18} className="text-green-600 mr-2 shrink-0" />}
                                                <span className="text-slate-700">{option}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="text-center mt-8">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Results;
