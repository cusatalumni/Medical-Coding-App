import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import type { CertificateData } from '../types';
import Spinner from './Spinner';
import { Download, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Certificate: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [certData, setCertData] = useState<CertificateData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCertificateData = async () => {
            if (!testId || !user) {
                toast.error("Invalid data. Cannot generate certificate.");
                navigate('/dashboard');
                return;
            }
            setIsLoading(true);
            try {
                const data = await googleSheetsService.getCertificateData(testId, user);
                if (data) {
                    setCertData(data);
                } else {
                    toast.error("Certificate not earned for this test.");
                    navigate('/dashboard');
                }
            } catch (error) {
                toast.error("Failed to load certificate data.");
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCertificateData();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testId, user, navigate]);

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        setIsDownloading(true);
        toast.loading('Generating PDF...');

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 3, // Higher scale for better quality
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');

            // A4 dimensions in mm: 297 x 210 for landscape
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-Medical-Coding-Proficiency.pdf`);
            toast.dismiss();
            toast.success("Certificate downloaded!");
        } catch(error) {
            toast.dismiss();
            toast.error("Could not download PDF. Please try again.");
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return <div className="flex flex-col items-center justify-center h-64"><Spinner /><p className="mt-4 text-slate-600">Loading your certificate...</p></div>;
    }

    if (!certData) {
        return <div className="text-center p-8"><p>No certificate data available.</p></div>;
    }

    return (
        <div className="max-w-5xl mx-auto bg-slate-100 p-4 sm:p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                 <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
                </button>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-green-400"
                >
                    {isDownloading ? <Spinner/> : <Download size={20} />}
                    <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                </button>
            </div>
            
            <div ref={certificateRef} className="w-full aspect-[1.414/1] bg-white p-4 font-serif-display shadow-lg border-8 border-teal-900">
                <div className="w-full h-full border-2 border-teal-700 flex flex-col items-center justify-start text-center p-8 relative">
                    
                    {/* Branding Section */}
<div className="flex items-center space-x-4 mb-8">
  <img
    src="https://www.coding-online.net/wp-content/uploads/2019/01/cropped-coding-logo-vectorised-150x150-1.png"
    alt="Medical Coding Online Logo"     width={50}     height={50}   />
  <div className="flex flex-col">
    <span className="text-3xl font-bold text-slate-800 font-serif">
      Medical Coding Online
    </span>
    <span className="text-md text-slate-500 font-serif">
      www.coding-online.net
    </span>
  </div>
</div>
                    
                    <div className="text-center">
                        <p className="text-xl text-slate-600 tracking-wider">Certificate of Achievement in</p>
                        <p className="text-4xl font-bold text-teal-800 tracking-wide mt-1">Medical Coding Proficiency</p>
                    </div>

                    <div className="w-1/3 mx-auto my-6 border-b border-slate-400"></div>

                    <p className="text-lg text-slate-600">This certificate is proudly presented to</p>
                    
                    <p className="text-6xl font-script text-teal-800 my-6">
                        {certData.candidateName}
                    </p>
                    
                    <p className="text-base text-slate-700 max-w-3xl leading-relaxed">
                        For successfully demonstrating proficiency in medical coding, including mastery of ICD-10-CM, CPT, HCPCS Level II, and coding guidelines through the completion of a comprehensive Examination with a score of <span className="font-bold text-slate-800">{certData.finalScore}%</span>. This achievement reflects dedication to excellence in medical coding and preparedness for professional certification.
                    </p>

                    <div className="flex justify-around items-center w-full mt-auto pt-10">
                        <div className="text-center">
                            <p className="text-3xl font-script text-slate-700">Dr. Amelia Reed</p>
                            <p className="text-sm text-slate-700 border-t border-slate-400 mt-2 pt-2 tracking-wider">Program Director</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-script text-slate-700">B. Manoj</p>
                            <p className="text-sm text-slate-700 border-t border-slate-400 mt-2 pt-2 tracking-wider">Chief Instructor</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;