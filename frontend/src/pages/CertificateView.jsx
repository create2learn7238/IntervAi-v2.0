import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Download, Printer, ArrowLeft, Award, CheckCircle } from 'lucide-react';
import { getCertificate, generateCertificate } from '../services/certificateService';
import html2pdf from 'html2pdf.js';

export default function CertificateView() {
  const { certId, interviewId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef(null);

  useEffect(() => {
    if (interviewId === 'new') {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchOrCreateCert();
  }, [certId, interviewId, navigate]);

  const fetchOrCreateCert = async () => {
    try {
      setLoading(true);
      let res;
      if (certId) {
        res = await getCertificate(certId);
      } else if (interviewId) {
        res = await generateCertificate(interviewId);
      }
      setCert(res?.data?.data);
    } catch (err) {
      toast.error('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!certRef.current) return;
    const opt = {
      margin: 0,
      filename: `Certificate_${cert?.candidateName}_${cert?.certificateId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(certRef.current).save();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">Generating Certificate...</div>;
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Certificate not found or you failed the interview requirements.</p>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Certificate Container */}
      <div 
        ref={certRef} 
        className="w-[1056px] h-[816px] bg-white shadow-2xl relative overflow-hidden border-8 border-double border-slate-200"
        style={{ transform: 'scale(min(1, calc(100vw / 1100)))', transformOrigin: 'top center' }}
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-indigo-600" />
        
        <div className="p-20 text-center h-full flex flex-col justify-between">
          <div>
            <Award className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
            <h1 className="text-6xl font-serif font-bold text-slate-900 tracking-wider mb-2">CERTIFICATE</h1>
            <h2 className="text-2xl font-serif text-slate-500 tracking-widest uppercase">Of Completion</h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-slate-500 italic">This is to certify that</p>
            <p className="text-5xl font-serif font-bold text-slate-900 border-b-2 border-slate-200 pb-4 max-w-2xl mx-auto">
              {cert.candidateName}
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Has successfully completed the AI-driven mock interview assessment for the position of 
              <span className="font-bold text-slate-900"> {cert.interviewTitle}</span> 
              with an overall performance score of <span className="font-bold text-indigo-600">{cert.score}/100</span>.
            </p>
          </div>

          <div className="flex justify-between items-end mt-12 pt-8 border-t border-slate-200">
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Certificate ID: {cert.certificateId}</p>
              <p className="text-sm text-slate-500">Issued Date: {new Date(cert.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle className="w-8 h-8" />
              <div className="text-left">
                <p className="font-bold uppercase tracking-wider text-sm">Verified By</p>
                <p className="font-serif text-lg">InterviewAI Engine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
