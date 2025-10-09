import Link from 'next/link'

// Hapus semua import Supabase, cookies, dan redirect.
// Gunakan data dummy agar komponen bisa langsung render.

// Data Dummy
const DUMMY_PROFILE = {
  full_name: 'Pegawai Contoh',
  userEmail: 'contoh@perusahaan.com',
  role: 'pegawai',
}

// Komponen Icon SVG menggunakan Tailwind CSS
const Icon = ({ path, label }: { path: string, label: string }) => (
  <div className="flex flex-col items-center justify-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7 mb-1 text-[#003366]">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
    <span className="text-sm font-semibold text-gray-700">{label}</span>
  </div>
);

// Komponen Dashboard (ASYNC diperlukan karena ini adalah Server Component)
export default async function Dashboard() {
  // Semua logika autentikasi dan database dihapus.
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Biru Tua - Profil Pegawai */}
      <header className="bg-[#003366] text-white p-4 shadow-md flex items-center">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
          <span className="text-xl font-bold text-[#003366]">
            {DUMMY_PROFILE.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-lg font-semibold">{DUMMY_PROFILE.full_name}</h1>
          <p className="text-sm opacity-80">{DUMMY_PROFILE.userEmail}</p>
        </div>
      </header>
      
      <main className="p-4">
        
        {/* Status Absensi Hari Ini */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-700 font-medium">Status Absensi Hari Ini</p>
          <p className="text-xl font-bold text-red-600 mt-1">
            Belum Absen
          </p>
        </div>
        
        {/* Tombol Absen */}
        <div className="flex gap-4 mb-8">
          <button className="flex-1 bg-[#003366] text-white font-medium py-3 rounded-xl shadow-lg hover:bg-opacity-95 transition-all flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
            Absen Masuk
          </button>
          <button disabled className="flex-1 bg-gray-300 text-gray-500 font-medium py-3 rounded-xl shadow-md cursor-not-allowed flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg>
            Absen Pulang
          </button>
        </div>
        
        {/* Menu Utama (Logbook, Cuti, Rekap) */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Link ke Logbook */}
          <Link href="/logbook" className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:border-[#003366] transition-all flex items-center">
                <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" label="Logbook" />
                <div className="ml-4">
                    <h3 className="font-bold text-gray-800">Logbook Harian</h3>
                    <p className="text-sm text-gray-500">Catat aktivitas dan pekerjaan Anda</p>
                </div>
          </Link>
          {/* Link ke Cuti */}
          <Link href="/cuti" className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:border-[#003366] transition-all flex items-center">
                <Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 14.25h.008v.008H12v-.008z" label="Pengajuan Cuti" />
                <div className="ml-4">
                    <h3 className="font-bold text-gray-800">Cuti & Izin</h3>
                    <p className="text-sm text-gray-500">Ajukan permohonan cuti atau izin</p>
                </div>
          </Link>
          {/* Link ke Rekap Absensi */}
          <Link href="/rekap-absen" className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:border-[#003366] transition-all flex items-center">
                <Icon path="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" label="Rekap Absensi" />
                <div className="ml-4">
                    <h3 className="font-bold text-gray-800">Riwayat Kehadiran</h3>
                    <p className="text-sm text-gray-500">Lihat rekapitulasi absensi bulanan</p>
                </div>
          </Link>
        </div>
        
        {/* Pesan Kaki */}
        <p className="text-center text-sm text-blue-700 font-medium p-3 bg-blue-100/50 rounded-xl border border-blue-200">
            Jangan lupa, isi Logbook sebelum melakukan Absen Pulang.
        </p>

      </main>
    </div>
  )
}
