import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  FileCheck, 
  Upload, 
  LogOut, 
  ArrowRight, 
  CheckCircle2, 
  Image as ImageIcon,
  Loader2,
  Trash2,
  IdCard,
  School,
  HelpCircle
} from 'lucide-react';
import { Student, UpdateResponse } from '../types';

interface DashboardProps {
  student: Student;
  onLogout: () => void;
}

const InfoItem = ({ 
  label, 
  value, 
  readOnly = true,
  onChange,
  placeholder
}: { 
  label: string, 
  value: string, 
  icon: any, 
  readOnly?: boolean,
  onChange?: (val: string) => void,
  placeholder?: string
}) => (
  <div className="flex flex-col space-y-1">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    {readOnly ? (
      <p className="text-sm font-semibold text-slate-700">{value || '-'}</p>
    ) : (
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
        placeholder={placeholder || `Masukkan ${label}`}
      />
    )}
  </div>
);

import NotificationModal from './NotificationModal';
import ImageModal from './ImageModal';
import guidePhoto from './panduan_foto.png';

// Helper untuk mengubah link Drive menjadi Direct Link yang lebih stabil (lh3)
const getDirectLink = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    let fileId = '';
    if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    } else if (url.includes('/d/')) {
      fileId = url.split('/d/')[1].split('/')[0];
    }
    // Format lh3 biasanya lebih stabil untuk embedding di web dibanding uc?export=view
    return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
  }
  return url;
};

export default function Dashboard({ student: initialStudent, onLogout }: DashboardProps) {
  const [student, setStudent] = useState(initialStudent);
  const [noIjazah, setNoIjazah] = useState(student.no_ijazah || '');
  const [sekolahAsal, setSekolahAsal] = useState(student.sekolah_asal || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: 'success' | 'error' | 'info', title: string, message: string }>({
    type: 'success',
    title: '',
    message: ''
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = async () => {
    // Validasi
    if (!noIjazah.trim() || !sekolahAsal.trim()) {
      setModalConfig({
        type: 'error',
        title: 'Formulir Tidak Lengkap',
        message: 'Nomor Ijazah dan Sekolah Asal wajib diisi sebelum menyimpan.'
      });
      setShowModal(true);
      return;
    }

    setIsUpdating(true);
    
    const formData = new FormData();
    formData.append('rowNumber', String(student.rowNumber));
    formData.append('nisn', student.nisn);
    formData.append('nama', student.nama);
    formData.append('no_ijazah', noIjazah);
    formData.append('sekolah_asal', sekolahAsal);
    formData.append('link_foto', student.link_foto || '');
    
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const response = await fetch('/api/save-all', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStudent({ 
          ...student, 
          no_ijazah: noIjazah, 
          sekolah_asal: sekolahAsal, 
          link_foto: data.url 
        });
        setModalConfig({
          type: 'success',
          title: 'Berhasil Disimpan',
          message: 'foto ijazah telah berhasil diperbarui di sistem.'
        });
        setShowModal(true);
        setPhoto(null);
        setPreview(null);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setModalConfig({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan sistem saat mencoba menyimpan data Anda.'
      });
      setShowModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-transparent">
      <NotificationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        {...modalConfig}
      />
      <ImageModal 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        imageSrc={guidePhoto}
        title="Panduan Unggah Foto Ijazah"
      />
      <div className="w-full max-w-6xl h-auto lg:h-[750px] glass-card rounded-[2.5rem] overflow-hidden flex flex-col">
        {/* Header */}
        <header className="px-8 py-6 border-b border-white/30 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">E - Ijazah</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Portal Unggah Foto Ijazah v1.0</p>
          </div>
          <div className="flex items-center gap-6 bg-white/30 p-2 pl-6 rounded-2xl border border-white/40 shadow-sm">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{student.nama}</p>
              <p className="text-[10px] text-slate-500 font-bold">NISN: {student.nisn}</p>
            </div>
            <button 
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white hover:bg-slate-900 transition-all hover:scale-110 shadow-lg active:scale-95"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* Left: Data Preview (Non-Editable) */}
          <aside className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/30 p-8 bg-white/20 space-y-8 overflow-y-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Informasi Siswa (Tetap)</h2>
            </div>
            
            <div className="grid gap-6">
              <InfoItem label="Rombongan Belajar" value={student.rombel} icon={User} />
              <InfoItem label="NIPD" value={student.nipd} icon={User} />
              <InfoItem label="NISN" value={student.nisn} icon={User} />
              <InfoItem label="Nama Lengkap" value={student.nama} icon={User} />
              <InfoItem label="Tanggal Lahir" value={student.tgl_lahir} icon={User} />
              <InfoItem label="Jurusan" value={student.jurusan} icon={User} />
            </div>

            <div className="p-5 bg-blue-50/50 border border-blue-100/50 rounded-2xl backdrop-blur-sm">
              <p className="text-[11px] text-blue-600 leading-relaxed font-semibold">
                Pastikan data di atas sesuai dengan Akta Kelahiran. Jika terdapat kesalahan, hubungi Operator Sekolah.
              </p>
            </div>
          </aside>

          {/* Right: Editing and Upload */}
          <section className="flex-1 p-8 bg-white/10 flex flex-col gap-8 overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-6">
              <InfoItem 
                label="Nomor Ijazah SMP/MTs" 
                value={noIjazah} 
                readOnly={false} 
                icon={FileCheck} 
                onChange={setNoIjazah}
                placeholder="Contoh: DN-19/D-SMP/K13/23/0100000"
              />
              <InfoItem 
                label="Sekolah Asal SMP/MTs" 
                value={sekolahAsal} 
                readOnly={false} 
                icon={School} 
                onChange={setSekolahAsal}
                placeholder="Contoh: SMP Negeri 1 Palopo"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Lengkapi Berkas (Foto Ijazah)</label>
                <button 
                  onClick={() => setShowGuide(true)}
                  className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm"
                >
                  <HelpCircle size={14} />
                  Panduan Foto
                </button>
              </div>
              
              {!student.link_foto && !preview ? (
                <div className="flex-1 border-2 border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center bg-white/30 relative group hover:border-blue-400 hover:bg-white/40 transition-all cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-slate-300 group-hover:text-blue-500">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Pilih Foto Ijazah</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row gap-8 items-center bg-white/20 p-6 rounded-[2rem] border border-white/40">
                  <div className="relative w-full sm:w-48 aspect-[4/5] rounded-2xl overflow-hidden bg-white border-4 border-white shadow-xl flex items-center justify-center shrink-0">
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow z-10">PREVIEW</div>
                    <img 
                      src={preview || getDirectLink(student.link_foto)} 
                      alt="Preview Ijazah" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=Gambar+Tidak+Tampil';
                      }}
                    />
                    {preview && (
                      <button 
                        onClick={() => { setPhoto(null); setPreview(null); }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-4 w-full">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penamaan Otomatis</p>
                       <p className="text-xs font-mono text-slate-600 truncate bg-white/40 p-3 rounded-xl border border-white/60">{student.nisn}_{student.nama}.jpg</p>
                    </div>

                    {student.link_foto && !preview && (
                      <div className="flex items-center gap-3 bg-green-50/50 p-3 rounded-xl border border-green-100">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Berkas Terarsip</span>
                      </div>
                    )}

                    <div className="relative">
                       <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <button className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                        {student.link_foto ? 'Ganti Foto' : 'Pilih File Lain'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/20">
              <button
                onClick={handleSaveAll}
                disabled={isUpdating}
                className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:bg-slate-400"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={22} /> : <FileCheck size={22} />}
                <span className="uppercase tracking-[0.15em] text-sm">Simpan Perubahan & Upload</span>
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 bg-white/60 border-t border-white/30 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Database Online</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Drive Shared</span>
          </div>
          <div className="opacity-60">Session ID: {student.nisn.slice(0, 4)}...{student.nisn.slice(-4)}</div>
        </footer>
      </div>
    </div>
  );
}
