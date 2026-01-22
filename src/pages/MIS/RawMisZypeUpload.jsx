// import React, { useState, useEffect } from 'react';
// import { Upload, FileText, X, CheckCircle2, Loader2, Database, Zap, Clock } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import ToastNotification from "@components/Notification/ToastNotification";
// import { useUpload } from '../../context/UploadContext';

// const RawMisZypeUpload = () => {
//     const [file, setFile] = useState(null);
//     const [status, setStatus] = useState('idle'); // idle | processing | completed
//     const [progress, setProgress] = useState(0);
//     const [stats, setStats] = useState({ rows: 0, speed: 0 });
//     const BASE_URL = import.meta.env.VITE_API_URL;
//     const navigate = useNavigate();
//     const {
//         uploadStatus,
//         setUploadStatus,
//         globalProgress,
//         globalStats,
//         resetUpload
//     } = useUpload();

//     useEffect(() => {
//         let interval;

//         // Polling tabhi shuru hogi jab status 'processing' ho
//         if (status === 'processing') {
//             interval = setInterval(async () => {
//                 try {
//                     const res = await fetch(`${BASE_URL}/public/admin/upload-status`);
//                     if (!res.ok) throw new Error("Server error");

//                     const data = await res.json();

//                     // 1. Stats Update (Rows aur Speed)
//                     setStats({
//                         rows: data.total,
//                         speed: data.speed || 0
//                     });

//                     // 2. Smart Percentage Calculation
//                     // Hum backend se total file size ya expected rows bhi bhej sakte hain
//                     // Filhaal 1 Crore ka estimate hai, lekin success aate hi 100% kar denge
//                     const estimatedTotal = 10000000;
//                     let percentage = Math.min(Math.round((data.total / estimatedTotal) * 100), 99);

//                     // 3. Status Handling
//                     if (data.status === 'success') {
//                         setProgress(100); // Force 100% on success
//                         setStatus('completed');
//                         clearInterval(interval);
//                         ToastNotification.success("All records synced successfully!");
//                     } else if (data.status === 'error') {
//                         setStatus('idle');
//                         clearInterval(interval);
//                         ToastNotification.error("Backend processing failed.");
//                     } else {
//                         setProgress(percentage);
//                     }

//                 } catch (e) {
//                     console.error("Polling Error:", e);
//                     // Interval clear nahi karenge, shayad network momentary down ho
//                 }
//             }, 2000); // 2-3 seconds is perfect for polling
//         }

//         return () => {
//             if (interval) clearInterval(interval);
//         };
//     }, [status]); // dependency array mein values add karna zaroori hai

//     useEffect(() => {
//         if (uploadStatus === 'completed') {
//             // Agar pehle hi khatam ho chuka hai toh user ko reset option dikhao ya success
//         }
//     }, [uploadStatus]);

//     const handleUpload = async () => {
//         if (!file) return;
//         const formData = new FormData();
//         formData.append('file', file);
//         setStatus('processing');
//         setUploadStatus('processing');

//         try {
//             const response = await fetch(`${BASE_URL}/public/admin/upload-rawmiszype`, {
//                 method: 'POST',
//                 body: formData,
//             });
//             if (!response.ok) throw new Error('Upload failed');
//             ToastNotification.success("Stream Started! Processing 10M rows...");

//         } catch (err) {
//             setStatus('idle');
//             setUploadStatus('idle');
//             ToastNotification.error(err.message);
//         }
//     };

//     console.log(uploadStatus, "uploadStatus")
    

//     return (
//         <div className=" bg-gray-50 p-6 flex items-center justify-center">
//             <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
//             >
//                 {/* Header */}
//                 <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <Database size={24} />
//                         <h2 className="text-xl font-bold uppercase tracking-wider">Data Engine v2</h2>
//                     </div>
//                     {uploadStatus == 'processing' && <Loader2 className="animate-spin" />}
//                 </div>

//                 <div className="p-8">
//                     {uploadStatus == 'idle' ? (
//                         <div className="space-y-6">
//                             <div className={`border-3 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}>
//                                 <input type="file" id="csv-upload" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".csv" />
//                                 <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
//                                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
//                                         <Upload size={32} />
//                                     </div>
//                                     <p className="text-lg font-semibold text-gray-700">Drop your CSV File</p>
//                                     <p className="text-sm text-gray-400 mt-2 italic text-center">Engine is ready for massive data streaming</p>
//                                 </label>
//                             </div>

//                             {file && (
//                                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
//                                     <FileText className="text-blue-600" size={30} />
//                                     <div className="flex-1 truncate">
//                                         <p className="font-bold text-gray-800 truncate">{file.name}</p>
//                                         <p className="text-xs text-gray-500 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
//                                     </div>
//                                     <X size={20} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setFile(null)} />
//                                 </motion.div>
//                             )}

//                             <button onClick={handleUpload} disabled={!file} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-blue-700 transform transition active:scale-95 disabled:bg-gray-300">
//                                 INITIALIZE MASSIVE SYNC
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="space-y-8">
//                             {/* Progress Bar Area */}
//                             <div className="relative pt-1">
//                                 <div className="flex mb-2 items-center justify-between">
//                                     <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">Processing Stream</span></div>
//                                     <div className="text-right"><span className="text-sm font-bold inline-block text-blue-600">{progress}%</span></div>
//                                 </div>
//                                 <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200">
//                                     <motion.div
//                                         initial={{ width: 0 }}
//                                         animate={{ width: `${progress}%` }}
//                                         className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
//                                     ></motion.div>
//                                 </div>
//                             </div>

//                             {/* Stats Cards */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
//                                     <Zap className="text-yellow-500" size={20} />
//                                     <div>
//                                         <p className="text-[10px] text-gray-400 uppercase font-bold">Processed Rows</p>
//                                         <p className="text-lg font-black text-gray-800 font-mono">{stats.rows.toLocaleString()}</p>
//                                     </div>
//                                 </div>
//                                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
//                                     <Clock className="text-blue-500" size={20} />
//                                     <div>
//                                         <p className="text-[10px] text-gray-400 uppercase font-bold">Est. Time Remaining</p>
//                                         <p className="text-lg font-black text-gray-800 font-mono">Calculating...</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <p className="text-center text-xs text-gray-400 animate-pulse">
//                                 Transaction active. Closing this window won't stop the background process.
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default RawMisZypeUpload;


import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle2, Loader2, Database, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ToastNotification from "@components/Notification/ToastNotification";
import { useUpload } from '../../context/UploadContext';

const RawMisZypeUpload = () => {
    const [file, setFile] = useState(null);
    const BASE_URL = import.meta.env.VITE_API_URL;
    
    // Context se saari values li hain
    const {
        uploadStatus,
        setUploadStatus,
        globalProgress,
        globalStats,
        resetUpload // Ensure this is defined in your context
    } = useUpload();

    // Jab file upload start ho
    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        
        // Global status update karo
        setUploadStatus('processing');

        try {
            const response = await fetch(`${BASE_URL}/public/admin/upload-rawmiszype`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            ToastNotification.success("Stream Started! Processing 10M rows...");
        } catch (err) {
            setUploadStatus('idle');
            ToastNotification.error(err.message);
        }
    };

    const handleReset = () => {
        resetUpload();
        setFile(null);
    };

    console.log(uploadStatus, "uploadStatus")

    return (
        <div className="bg-gray-50 p-6 flex items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-wider">Data Engine v2</h2>
                    </div>
                    {uploadStatus === 'processing' && <Loader2 className="animate-spin" />}
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {/* CASE 1: IDLE - File Upload Screen */}
                        {uploadStatus == 'idle' && (
                            <motion.div 
                                key="idle"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}>
                                    <input type="file" id="csv-upload" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".csv" />
                                    <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-700">Drop your CSV File</p>
                                        <p className="text-sm text-gray-400 mt-2 italic">Ready for 10M+ rows stream</p>
                                    </label>
                                </div>

                                {file && (
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <FileText className="text-blue-600" size={30} />
                                        <div className="flex-1 truncate">
                                            <p className="font-bold text-gray-800 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                        <X size={20} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setFile(null)} />
                                    </div>
                                )}

                                <button onClick={handleUpload} disabled={!file} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all">
                                    INITIALIZE MASSIVE SYNC
                                </button>
                            </motion.div>
                        )}

                        {/* CASE 2: PROCESSING - Progress Screen */}
                        {uploadStatus === 'processing' && (
                            <motion.div 
                                key="processing"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="space-y-8"
                            >
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <span className="text-xs font-semibold py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">Streaming Data</span>
                                        <span className="text-sm font-bold text-blue-600">{globalProgress}%</span>
                                    </div>
                                    <div className="overflow-hidden h-3 flex rounded-full bg-gray-100">
                                        <motion.div
                                            animate={{ width: `${globalProgress}%` }}
                                            className="bg-blue-500 shadow-lg"
                                        ></motion.div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <Zap className="text-yellow-500 mb-1" size={18} />
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Processed</p>
                                        <p className="text-lg font-black text-gray-800 font-mono">{globalStats.rows.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <Clock className="text-blue-500 mb-1" size={18} />
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Speed</p>
                                        <p className="text-lg font-black text-gray-800 font-mono">{globalStats.speed} r/s</p>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-gray-400 animate-pulse font-medium">
                                    Safe to navigate away. Background sync active.
                                </p>
                            </motion.div>
                        )}

                        {/* CASE 3: COMPLETED - Success Screen */}
                        {uploadStatus == 'completed' && (
                            <motion.div 
                                key="completed"
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-800">SYNC COMPLETE</h3>
                                    <p className="text-gray-500 mt-2">All records have been successfully migrated.</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl inline-block px-8 border border-green-100">
                                    <p className="text-sm text-gray-500">Total Rows Processed</p>
                                    <p className="text-2xl font-black text-green-700">{globalStats.rows.toLocaleString()}</p>
                                </div>
                                <button onClick={handleReset} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl">
                                    NEW UPLOAD
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default RawMisZypeUpload;