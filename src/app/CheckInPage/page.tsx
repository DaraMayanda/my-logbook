
'use client';
import { Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const OFFICE_LOCATION = {
    latitude: 5.178826865127689,
    longitude:97.1493055704793 ,
    RADIUS_M: 100, 
};


const DUMMY_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef0123456789"; 


const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
};


export default function CheckInForm() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>("Mencari lokasi...");
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus("Geolocation tidak didukung oleh browser ini.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                setLocation({ lat: userLat, lon: userLon });

                const dist = haversineDistance(userLat, userLon, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude);
                setDistance(dist);
                
                if (dist > OFFICE_LOCATION.RADIUS_M) {
                    setLocationStatus(`Lokasi di luar radius kantor.`);
                } else {
                    setLocationStatus("Lokasi Valid."); 
                }
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                     setLocationStatus("Akses lokasi ditolak. Mohon izinkan.");
                } else {
                     setLocationStatus(`Gagal mendapatkan lokasi.`);
                }
                console.error("Geolocation Error:", error);
            }
        );
    }, []);


    const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
  
    const isLocationValid = location !== null && distance !== null && distance <= OFFICE_LOCATION.RADIUS_M;
    const isReadyToSubmit = isLocationValid && !isSubmitting;

  
    
    const handleSubmit = async () => {
        if (!isReadyToSubmit) return;

        setIsSubmitting(true);

        
        const checkInPayload = {
            user_id: DUMMY_USER_ID,
            attendance_date: new Date().toISOString().split('T')[0], // date
            check_in_time: currentTime.toLocaleTimeString('en-US', { hour12: false }), // time with time zone
            check_in_latitude: location?.lat, // double precision - LOKASI DISIMPAN DI SINI
            check_in_longitude: location?.lon, // double precision - LOKASI DISIMPAN DI SINI
            status: "Masuk", // text
        };
        
        console.log("Payload Absen (siap kirim ke Supabase):", checkInPayload);

       
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        

       
        localStorage.setItem('absensi_status', 'Masuk');
        
        setIsSubmitting(false);

        
        router.replace('/Dashboard'); 
    };

    let confirmationMessage;
    if (isSubmitting) {
        confirmationMessage = "Sedang memproses absen, mohon tunggu...";
    } else if (isLocationValid) {
        confirmationMessage = `Jam masuk akan tercatat pada ${formattedTime}`;
    } else {
       
        confirmationMessage = `Lokasi tidak valid: ${locationStatus}.`;
    }
    
    
    const StatusIcon = isLocationValid ? (
        <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
    ) : (
        <div className="text-xl text-red-600 flex-shrink-0">⚠️</div> 
    );
    
    const confirmationTitle = isLocationValid ? 'Konfirmasi Absen Masuk' : 'Validasi Lokasi';

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header Biru Tua Sesuai Mockup */}
            <header className="bg-blue-900 text-white p-4 shadow-lg flex items-center">
                <button 
                    onClick={() => router.back()} 
                    className="p-1 mr-4 text-white hover:text-gray-300 transition"
                    aria-label="Kembali"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Absen Masuk</h1>
            </header>

            <main className="p-6">
                
                {/* Kotak Waktu Sesuai Mockup (Putih, rounded, shadow-md lebih tebal) */}
                <div className="bg-white p-8 rounded-xl shadow-lg mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <Clock size={48} className="text-gray-700" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Waktu saat ini</p>
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-1">
                        {isSubmitting ? '...' : formattedTime}
                    </h2>
                    <p className="text-md text-gray-500">
                        {formattedDate}
                    </p>
                </div>

                {/* Konfirmasi Absen Masuk Sesuai Mockup (Putih, rounded, shadow tipis) */}
                <div 
                    className={`flex items-start p-4 rounded-xl shadow-sm mb-8 bg-white border border-gray-200 
                        ${isLocationValid ? '' : 'border-red-400'}`} // Tambah border merah jika tidak valid
                >
                    {StatusIcon}
                    <div className="ml-4 -mt-0.5">
                        <p className={`font-bold text-gray-800`}>
                            {confirmationTitle}
                        </p>
                        <p className={`text-sm ${isLocationValid ? 'text-gray-600' : 'text-red-600'}`}>
                            {isLocationValid ? confirmationMessage : locationStatus}
                        </p>
                    </div>
                </div>

                {/* Tombol Submit Absen Masuk Sesuai Mockup (Biru Tua, shadow lebih tebal) */}
                <button
                    onClick={handleSubmit}
                    disabled={!isReadyToSubmit}
                    className={`w-full py-4 text-white font-extrabold rounded-xl transition duration-300 shadow-xl ${
                        isReadyToSubmit
                            ? 'bg-blue-900 hover:bg-blue-800 shadow-blue-500/50' 
                            : 'bg-gray-400 cursor-not-allowed shadow-gray-500/50'
                    }`}
                >
                    {isSubmitting ? 'Memproses Absen...' : 'SUBMIT ABSEN MASUK'}
                </button>
                
                {/* Catatan Kaki Sesuai Mockup (Kotak biru muda dengan teks biru) */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 text-center">
                    <p className="font-semibold text-blue-900 mb-1">Catatan:</p>
                    <p>Setelah absen masuk, jangan lupa untuk mengisi logbook harian anda.</p>
                </div>

            </main>
        </div>
    );
}