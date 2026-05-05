import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, GraduationCap, Calendar, Hash } from 'lucide-react';
import { LoginResponse } from '../types';

interface LoginProps {
  onLoginSuccess: (student: any) => void;
}

import NotificationModal from './NotificationModal';
import logo from './logo.png';

export default function Login({ onLoginSuccess }: LoginProps) {
  const [nisn, setNisn] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: 'success' | 'error' | 'info', title: string, message: string }>({
    type: 'error',
    title: 'Gagal Masuk',
    message: ''
  });

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Ambil hanya angka
    const digits = input.replace(/\D/g, '');
    
    let formatted = '';
    if (digits.length > 0) {
      // Hari (DD)
      formatted = digits.substring(0, 2);
      if (digits.length > 2) {
        // Bulan (MM)
        formatted += '/' + digits.substring(2, 4);
        if (digits.length > 4) {
          // Tahun (YYYY)
          formatted += '/' + digits.substring(4, 8);
        }
      }
    }
    
    // Simpan hasil format (max 10 karakter: DD/MM/YYYY)
    setDob(formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nisn, tgl_lahir: dob }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();

      if (data.success && data.student) {
        onLoginSuccess(data.student);
      } else {
        setModalConfig({
          type: 'error',
          title: 'Akses Ditolak',
          message: data.message || 'Data tidak ditemukan. Silakan periksa kembali NISN dan Tanggal Lahir Anda.'
        });
        setShowModal(true);
      }
    } catch (err: any) {
      setModalConfig({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: `Gagal terhubung ke server: ${err.message}. Pastikan koneksi internet Anda stabil.`
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <NotificationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        {...modalConfig}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl overflow-hidden"
      >
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="mb-6">
              <img 
                src={logo} 
                alt="Logo" 
                className="w-20 h-20 object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center leading-tight">Login</h1>
            <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-widest text-center">Verifikasi & Unggah Foto Ijazah</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2 px-1">
                <Hash size={12} /> NISN
              </label>
              <input
                type="text"
                required
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Masukkan 10 digit NISN"
                className="w-full px-5 py-4 glass-input rounded-2xl outline-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2 px-1">
                <Calendar size={12} /> Tanggal Lahir
              </label>
              <input
                type="text"
                required
                value={dob}
                onChange={handleDobChange}
                maxLength={10}
                placeholder="DD/MM/YYYY (Contoh: 18/01/2005)"
                className="w-full px-5 py-4 glass-input rounded-2xl outline-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span className="uppercase tracking-wider">Lanjutkan</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-white/30 p-8 border-t border-white/40 text-center backdrop-blur-sm">
          <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
            App By Zulfitrah &bull; Versi 1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
