import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MetricsUpload = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [uploading, setUploading] = useState(false);
    const BASE_URL = import.meta.env.VITE_API_URL;

    const navigate = useNavigate()


    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
        } else {
            alert("Please upload a valid CSV file");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file); // 'file' matches csvUploader.single('file')

        setUploading(true);
        try {
            const response = await fetch(`${BASE_URL}/public/admin/upload-app-metrics`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            ToastNotification.success('CSV uploaded successfully!');
            setFile(null);
            navigate('/app-metrics')
        } catch (err) {
            ToastNotification.error(err.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Upload App Metrics</h2>

            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${file ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                {!file ? (
                    <>
                        <div className="p-3 bg-gray-100 rounded-full mb-3">
                            <Upload className="text-gray-500" size={24} />
                        </div>
                        <p className="text-sm text-gray-600">Drag and drop CSV or <label className="text-blue-600 cursor-pointer hover:underline">browse<input type="file" className="hidden" onChange={handleFileChange} accept=".csv" /></label></p>
                        <p className="text-xs text-gray-400 mt-1">Max file size: 5MB</p>
                    </>
                ) : (
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-blue-600 rounded-lg text-white">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || status === 'uploading'}
                className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
                {status === 'uploading' ? 'Uploading...' : 'Process Metrics'}
            </button>

            {status === 'success' && (
                <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                    <CheckCircle2 size={16} /> Data successfully synced to production.
                </div>
            )}
        </div>
    );
};


export default MetricsUpload