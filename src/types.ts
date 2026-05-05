export interface Student {
  no: string;
  rombel: string;
  nipd: string;
  nisn: string;
  nama: string;
  tgl_lahir: string;
  jurusan: string;
  no_ijazah: string;
  link_foto: string;
  sekolah_asal: string;
  rowNumber?: number; // Added to easily update the correct row
}

export type LoginResponse = {
  success: boolean;
  message: string;
  student?: Student;
};

export type UpdateResponse = {
  success: boolean;
  message: string;
};
