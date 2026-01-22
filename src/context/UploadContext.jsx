// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// const UploadContext = createContext();

// export const UploadProvider = ({ children }) => {
//     const [uploadStatus, setUploadStatus] = useState('idle');
//     const [globalProgress, setGlobalProgress] = useState(0);
//     const [globalStats, setGlobalStats] = useState({ rows: 0, speed: 0 });
//     const BASE_URL = import.meta.env.VITE_API_URL;
//     const [isResetting, setIsResetting] = useState(false);

//     // UseCallback taaki har render par function naya na bane
//     const checkStatus = useCallback(async () => {
//         if (isResetting) return;
//         try {
//             const res = await fetch(`${BASE_URL}/public/admin/upload-status`);
//             if (!res.ok) return;
//             const data = await res.json();

//             // Backend se aayi state ko respect karein
//             if (data.status === 'processing') {
//                 setUploadStatus('processing');
//                 setGlobalStats({ rows: data.total, speed: data.speed });
//                 const percentage = Math.min(Math.round((data.total / 10000000) * 100), 99);
//                 setGlobalProgress(percentage);
//             } else if (data.status === 'success') {
//                 // Sirf tab complete karein jab pehle se kuch kaam ho raha ho
//                 setUploadStatus('completed');
//                 setGlobalProgress(100);
//             } else if (data.status === 'idle') {
//                 setUploadStatus('idle');
//                 setGlobalProgress(0);
//             }
//         } catch (e) {
//             console.error("Context Status Check Failed");
//         }
//     }, [BASE_URL]);

//     // Interval Management
//     // useEffect(() => {
//     //     // 1. App load hote hi turant status check karo (Reload support)
//     //     checkStatus();

//     //     // 2. Continuous Polling
//     //     const interval = setInterval(() => {

//     //         checkStatus();
//     //     }, 3000);

//     //     return () => clearInterval(interval);
//     // }, [checkStatus]); 

//     const resetUpload = () => {
//         setIsResetting(true); // Polling ko block karo
//         setUploadStatus('idle');
//         setGlobalProgress(0);
//         setGlobalStats({ rows: 0, speed: 0 });

//         // 5 second baad wapas polling allow karo taaki naya upload track ho sake
//         // setTimeout(() => setIsResetting(false), 50000);
//     };

//     console.log(isResetting, "isreset")
//     return (
//         <UploadContext.Provider value={{
//             uploadStatus, setUploadStatus,
//             globalProgress, globalStats,
//             checkStatus, resetUpload
//         }}>
//             {children}
//         </UploadContext.Provider>
//     );
// };

// export const useUpload = () => useContext(UploadContext);

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
    // const [uploadStatus, setUploadStatus] = useState('idle');
    const [globalProgress, setGlobalProgress] = useState(0);
    const [globalStats, setGlobalStats] = useState({ rows: 0, speed: 0 });
    const [isResetting, setIsResetting] = useState(false);
    const BASE_URL = import.meta.env.VITE_API_URL;

    const [uploadStatus, setUploadStatus] = useState(() => {
        return localStorage.getItem('upload_status') || 'idle';
    });
    
    // Interval ID ko store karne ke liye ref
    const intervalRef = useRef(null);

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log("🛑 Polling Stopped");
        }
    };

    const checkStatus = useCallback(async () => {
        // Agar user ne "New Upload" dabaya hai toh backend ki purani reports ignore karo
        if (isResetting) return;

        try {
            const res = await fetch(`${BASE_URL}/public/admin/upload-status`);
            if (!res.ok) return;
            const data = await res.json();

            if (data.status === 'processing') {
                setUploadStatus('processing');
                setGlobalStats({ rows: data.total, speed: data.speed });
                
                // Row Count Fix: 1,281,404 rows ke hisaab se calculation
                const totalExpected = 1281404; 
                const percentage = Math.min(Math.round((data.total / totalExpected) * 100), 99);
                setGlobalProgress(percentage);
            } 
            else if (data.status === 'success') {
                setUploadStatus('completed');
                setGlobalProgress(100);
                setGlobalStats(prev => ({ ...prev, rows: data.total }));
                stopPolling(); // ✅ API call ruk jayegi success milte hi
            }
            else if (data.status === 'idle') {
                // Agar backend idle hai toh hum bhi idle
                setUploadStatus('idle');
                stopPolling();
            }
        } catch (e) {
            console.error("Polling Error:", e);
        }
    }, [BASE_URL, isResetting]);

    // Polling Controller
    useEffect(() => {
        // Sirf tab poll karo jab status processing ho
        if (uploadStatus === 'processing' && !isResetting) {
            if (!intervalRef.current) {
                console.log("🚀 Polling Started");
                intervalRef.current = setInterval(checkStatus, 3000);
            }
        } else if (uploadStatus === 'completed' || uploadStatus === 'idle') {
            stopPolling();
        }

        return () => stopPolling();
    }, [uploadStatus, isResetting, checkStatus]);

    const resetUpload = () => {
        stopPolling(); 
        setIsResetting(true); // Flag on
        setUploadStatus('idle');
        setGlobalProgress(0);
        setGlobalStats({ rows: 0, speed: 0 });

        // 3 second baad resetting flag off kar do taaki naya upload poll ho sake
        setTimeout(() => {
            setIsResetting(false);
            console.log("🔄 Reset Complete, Ready for New File");
        }, 3000);
    };

    useEffect(() => {
        localStorage.setItem('upload_status', uploadStatus);
    }, [uploadStatus]);

    useEffect(() => {
        const recoverSession = async () => {
            // Agar reload se pehle status processing ya completed tha
            const savedStatus = localStorage.getItem('upload_status');
            if (savedStatus === 'processing' || savedStatus === 'completed') {
                await checkStatus(sessionRef.current);
            }
        };
        recoverSession();
    }, []);

    return (
        <UploadContext.Provider value={{
            uploadStatus, setUploadStatus,
            globalProgress, globalStats,
            checkStatus, resetUpload
        }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => useContext(UploadContext);