'use client';
import { FileText, User, Calendar, Clock, Plus, Trash2, Send, ChevronLeft, RefreshCw, AlertTriangle, Briefcase, LucideProps } from 'lucide-react';
import React, { useState, useEffect, RefAttributes } from 'react';
import { useRouter } from 'next/navigation';
// Pastikan path ini benar
import { supabase } from '@/lib/supabaseClient'; 

// --- 1. Definisi Tipe Data (Interfaces) ---

interface UserData {
    fullName: string;
    position: string;
}

interface FormData {
    date: string;
    startTime: string;
    endTime: string;
    keterangan: string;
}

interface InputFieldProps {
    label: string;
    name?: keyof FormData; // Opsional jika readOnly
    type?: 'text' | 'date' | 'time';
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    readOnly?: boolean;
}

interface TextareaFieldProps {
    label: string;
    name: keyof FormData;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Perbaikan: HTMLTextAreaAreaElement diubah menjadi HTMLTextAreaElement
}

interface TaskInputSectionProps {
    tasks: string[];
    currentTaskInput: string;
    handleTaskInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autocompleteSuggestions: string[];
    addTask: (taskToAdd?: string) => void;
    removeTask: (index: number) => void;
}

// --- 2. Data Standard ---

const standardTasks: string[] = [
    "Pelaksanaan rekonsiliasi laporan keuangan",
    "Verifikasi Surat Perintah Membayar (SPM)",
    "Penyusunan Laporan Pertanggungjawaban (LPJ)",
    "Input data transaksi ke sistem SAKTI",
    "Pelayanan konsultasi anggaran",
    "Monitoring dan evaluasi kinerja PPNPN",
    "Administrasi persuratan dan kearsipan",
    "Rapat koordinasi internal",
    "Pengarsipan dokumen dinas",
    "Penyelesaian naskah dinas",
];

// --- 3. Komponen Utama ---

export default function LogbookPage() {
    const router = useRouter(); 
    const today = new Date().toISOString().substring(0, 10);
    // userId disetel ke string atau null
    const [userId, setUserId] = useState<string | null>(null); 
    const [userData, setUserData] = useState<UserData>({ fullName: '', position: 'Staf Pelaksana' });
    // tasks disetel ke array of string
    const [tasks, setTasks] = useState<string[]>([]); 
    const [currentTaskInput, setCurrentTaskInput] = useState<string>('');
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState<FormData>({
        date: today,
        startTime: '08:00',
        endTime: new Date().toTimeString().substring(0, 5),
        keterangan: '',
    });

    /**
     * Efek 1: Ambil Data Pengguna dan Set ID
     */
    useEffect(() => {
        const fetchUserData = async () => {
            if (!supabase) {
                setError("Koneksi Supabase Gagal. Pastikan '@/lib/supabaseClient' terkonfigurasi.");
                setIsLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Perlu ada halaman login agar redirect ini berhasil
                // router.replace('/login');
                setIsLoading(false);
                setError("Pengguna belum terautentikasi.");
                return;
            }
            
            // Perbaikan 1: setUserId sekarang menerima string
            setUserId(user.id);

            // Tentukan nama default dari email jika ada
            // Misalnya: 'nama.lengkap@email.com' menjadi 'nama.lengkap'
            const defaultFullNameFromEmail = user.email ? user.email.split('@')[0] : 'Pegawai'; 

            // Fetch Data Profil (full_name dan position)
            const { data: profileData, error: profileError } = await supabase // Menangkap error di sini
                .from('profiles')
                .select('full_name, position')
                .eq('id', user.id)
                .single();
            
            // Logika baru untuk menentukan full_name:
            let finalFullName = defaultFullNameFromEmail; // Default menggunakan nama dari email
            let finalPosition = 'Staf Pelaksana';

            if (profileError) {
                // Tambahkan penanganan error spesifik untuk profiles
                console.error("Gagal mengambil data profil:", profileError.message);
                setError(`Gagal mengambil data profil: ${profileError.message}. Silakan periksa konfigurasi RLS Supabase Anda.`);
                // Lanjutkan dengan nilai default jika gagal mengambil profil
            }

            if (profileData) {
                // PRIORITAS: Gunakan full_name dari profil HANYA JIKA ADA dan BUKAN STRING KOSONG
                if (profileData.full_name && profileData.full_name.trim().length > 0) {
                    finalFullName = profileData.full_name;
                }
                // Jika full_name di profil kosong/null, finalFullName tetap nama dari email.
                
                finalPosition = profileData.position || 'Staf Pelaksana';
            }

            setUserData({
                fullName: finalFullName, 
                position: finalPosition,
            });


            // Cek Logbook
            const { data: existingLog, error: logbookError } = await supabase // Menangkap error di sini
                .from('logbooks')
                .select('id')
                .eq('user_id', user.id)
                .eq('log_date', today);
            
            if (logbookError) {
                // Error ini kemungkinan yang Anda lihat dari Dashboard
                console.error("Gagal cek logbook:", logbookError.message);
                setError(`Gagal cek status Logbook: ${logbookError.message}.`);
            } else if (existingLog && existingLog.length > 0) {
                setError('Anda sudah mengisi Logbook Harian untuk tanggal ini.');
                // setTimeout(() => router.replace('/'), 3000); 
            }

            setIsLoading(false);
        };

        fetchUserData();
    }, [today]); // Hapus 'router' dari dependencies karena tidak selalu tersedia

    // --- Task Handlers ---
    // Perbaikan 2: Menambahkan tipe data untuk event (React.ChangeEvent<HTMLInputElement>)
    const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setCurrentTaskInput(input);
        
        if (input.length > 2) {
            const filtered = standardTasks.filter((task: string) =>
                task.toLowerCase().includes(input.toLowerCase())
            );
            // Perbaikan 3: setAutocompleteSuggestions sekarang menerima string[]
            setAutocompleteSuggestions(filtered); 
        } else {
            setAutocompleteSuggestions([]);
        }
    };

    const addTask = (taskToAdd: string = currentTaskInput) => {
        const trimmedTask = taskToAdd.trim();
        if (trimmedTask && !tasks.includes(trimmedTask)) {
            // Perbaikan 4: spread operator sekarang aman karena tasks tipenya string[]
            setTasks([...tasks, trimmedTask]); 
            setCurrentTaskInput('');
            setAutocompleteSuggestions([]);
        }
    };

    // Perbaikan 5: Menambahkan tipe data untuk index (number)
    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    // --- Form Handlers ---
    // Perbaikan 6: Menambahkan tipe data untuk event
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Pengecekan aman untuk nama kolom form
        if (name === 'date' || name === 'startTime' || name === 'endTime' || name === 'keterangan') {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Perbaikan 7: Menambahkan tipe data untuk event (React.FormEvent)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tasks.length === 0) {
            setError('Mohon tambahkan minimal satu Tugas/Pekerjaan.');
            return;
        }
        if (!userId) {
            setError('Error: User ID tidak ditemukan. Mohon coba login ulang.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        
        // Mapping tasks menjadi array of objects untuk di-insert ke Supabase
        const logbookEntries = tasks.map(task => {
            const combinedDescription = `${task} ${formData.keterangan ? `(Keterangan Tambahan: ${formData.keterangan})` : ''}`;

            return {
                user_id: userId,
                position_at_time: userData.position, 
                log_date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                // task_id disetel null
               
            };
        });

        // Simpan data ke Supabase
        const { error: insertError } = await supabase
            .from('logbooks')
            .insert(logbookEntries);

        if (insertError) {
            console.error("Gagal menyimpan Logbook:", insertError);
            setError(`Gagal menyimpan data: ${insertError.message}`);
            setIsSubmitting(false);
        } else {
            console.log("Logbook berhasil disimpan. Mengarahkan ke Dashboard.");
            router.replace('/'); 
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-700" />
                <p className="ml-4 text-gray-600 font-semibold">Memuat data pengguna...</p>
            </div>
        );
    }
    
    // Tampilan Utama Logbook Form
    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6">
            <header className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-blue-700 hover:text-blue-900 transition font-medium"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Kembali
                </button>
                <h1 className="text-2xl font-extrabold text-gray-800 flex items-center">
                    <FileText size={24} className="mr-2 text-blue-600" />
                    Logbook Harian
                </h1>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
                
                {/* Bagian Profil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4">
                    <InputField 
                        label="Nama Pegawai" 
                        value={userData.fullName} 
                        icon={User} 
                        readOnly={true}
                        // Menambahkan prop yang hilang
                        name="date"
                        onChange={() => {}} 
                    />
                    <InputField 
                        label="Jabatan" 
                        value={userData.position} 
                        icon={Briefcase} 
                        readOnly={true}
                        // Menambahkan prop yang hilang
                        name="date" 
                        onChange={() => {}}
                    />
                </div>

                {/* Bagian Waktu */}
                <div className="grid grid-cols-3 gap-4">
                    <InputField 
                        label="Tanggal" 
                        name="date" 
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        icon={Calendar}
                    />
                    <InputField 
                        label="Jam Mulai" 
                        name="startTime" 
                        type="time"
                        value={formData.startTime}
                        onChange={handleChange}
                        icon={Clock}
                    />
                    <InputField 
                        label="Jam Selesai" 
                        name="endTime" 
                        type="time"
                        value={formData.endTime}
                        onChange={handleChange}
                        icon={Clock}
                    />
                </div>

                {/* Bagian Tugas/Pekerjaan */}
                <TaskInputSection 
                    tasks={tasks}
                    currentTaskInput={currentTaskInput}
                    handleTaskInputChange={handleTaskInputChange}
                    autocompleteSuggestions={autocompleteSuggestions}
                    addTask={addTask}
                    removeTask={removeTask}
                />

                {/* Keterangan */}
                <TextareaField
                    label="Keterangan Tambahan (Opsional)"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
                />

                {/* Pesan Error */}
                {error && (
                    <div className="flex items-center p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <AlertTriangle size={20} className="mr-2" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
                
                {/* Tombol Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || tasks.length === 0}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 mt-8 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <RefreshCw size={20} className="animate-spin" />
                    ) : (
                        <Send size={20} />
                    )}
                    <span>{isSubmitting ? "Menyimpan..." : "Submit Logbook"}</span>
                </button>
            </form>
        </div>
    );
}

// --- 4. Komponen Pembantu dengan Tipe Data yang Jelas ---

const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", value, onChange, icon: Icon, readOnly = false }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className={`flex items-center border ${readOnly ? 'border-gray-200 bg-gray-100' : 'border-gray-300 focus-within:ring-2 focus-within:ring-blue-500'} rounded-lg overflow-hidden transition`}>
            {Icon && <Icon size={20} className={`ml-3 ${readOnly ? 'text-gray-500' : 'text-blue-500'}`} />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                required={!readOnly}
                className={`w-full p-3 ${readOnly ? 'text-gray-600' : 'text-gray-800'} focus:outline-none bg-transparent`}
            />
        </div>
    </div>
);

const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, value, onChange }) => (
    <div className="space-y-1">
        <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none text-gray-800"
            placeholder="Jelaskan detail singkat terkait pekerjaan di atas..."
        ></textarea>
    </div>
);

const TaskInputSection: React.FC<TaskInputSectionProps> = ({ tasks, currentTaskInput, handleTaskInputChange, autocompleteSuggestions, addTask, removeTask }) => (
    <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700 block">Daftar Tugas/Pekerjaan Harian</label>
        <div className="relative">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={currentTaskInput}
                    onChange={handleTaskInputChange}
                    placeholder="Masukkan nama tugas..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                />
                <button
                    type="button"
                    onClick={() => addTask()}
                    disabled={currentTaskInput.trim().length === 0}
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                    <Plus size={20} />
                </button>
            </div>
            
            {/* Autocomplete Dropdown */}
            {autocompleteSuggestions.length > 0 && currentTaskInput.length > 2 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {autocompleteSuggestions.map((task: string, index: number) => (
                        <li 
                            key={index} 
                            onClick={() => addTask(task)}
                            className="p-3 cursor-pointer hover:bg-blue-50 text-gray-800"
                        >
                            {task}
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* Daftar Tugas yang Sudah Ditambahkan */}
        {tasks.length > 0 && (
            <div className="space-y-2 pt-2">
                {tasks.map((task: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-blue-800 truncate pr-2">{task}</span>
                        <button
                            type="button"
                            onClick={() => removeTask(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);
