# Frontend Component & Architecture Rules

Dokumen ini mengatur standar wajib pembuatan dan penggunaan komponen antarmuka pengguna (UI) di seluruh aplikasi My CMS. **Semua agent dan developer wajib mematuhi aturan ini.**

---

## 1. Prinsip Utama: Single Source of Truth Primitives

1. **Dilarang Menulis Tag Input / Card Mentah**:
   - Jangan menulis `<input className="..." />` atau `<div className="border rounded shadow...">` secara manual di dalam halaman atau fitur.
   - Selalu gunakan komponen primitif standar dari `@/components/ui`.
2. **React 19 Direct Ref**:
   - Proyek ini menggunakan React 19. Jangan gunakan `forwardRef`. Gunakan `ref` langsung sebagai prop pada antarmuka komponen.
3. **Compound Components Over Boolean Props**:
   - Hindari prop boolean berlebihan seperti `isModal`, `hasHeader`, dll. Gunakan komposisi compound component (misal: `<Card>`, `<CardHeader>`, `<CardContent>`).
4. **Suspense Boundary untuk Client SearchParams**:
   - Komponen client yang membaca query params melalui `useSearchParams()` wajib dibungkus dalam `<Suspense>` di level Server Component.

---

## 2. Katalog Komponen Primitif Standar (`@/components/ui`)

### A. Sistem Card (`@/components/ui/card`)
Gunakan untuk membungkus form, widget statistik, daftar konten, dan panel informasi.
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Judul Kartu</CardTitle>
    <CardDescription>Deskripsi singkat kartu</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Isi Konten */}
  </CardContent>
  <CardFooter>
    {/* Aksi / Tombol */}
  </CardFooter>
</Card>
```

---

### B. Sistem Form & Input (`@/components/ui`)

#### 1. Label (`@/components/ui/label`)
Selalu sandingkan dengan input menggunakan `htmlFor`:
```tsx
import { Label } from '@/components/ui/label'

<Label htmlFor="user-email" required>
  Alamat Email
</Label>
```

#### 2. Input Dasar (`@/components/ui/input`)
Mendukung `leftIcon`, `rightIcon`, dan `isError`:
```tsx
import { Input } from '@/components/ui/input'
import { Mail } from 'lucide-react'

<Input
  id="user-email"
  type="email"
  placeholder="nama@domain.com"
  leftIcon={<Mail className="size-4" />}
  isError={Boolean(errorMessage)}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

#### 3. Password Input (`@/components/ui/password-input`)
Otomatis memiliki tombol toggle show/hide kata sandi yang aman dan aksesibel:
```tsx
import { PasswordInput } from '@/components/ui/password-input'

<PasswordInput
  id="user-password"
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

#### 4. OTP / Token Digit Input (`@/components/ui/otp-input`)
Mendukung paste otomatis 6 digit, navigasi tombol panah keyboard, dan auto-focus:
```tsx
import { OtpInput } from '@/components/ui/otp-input'

<OtpInput
  length={6}
  value={otp}
  onChange={(val) => setOtp(val)}
  isError={Boolean(error)}
/>
```

---

### C. Sistem Tombol / Button (`@/components/ui/button`)
Mendukung varian warna, ukuran, state loading dengan animasi spinner:
```tsx
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

<Button
  variant="default" // "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size="default"    // "default" | "sm" | "lg" | "icon"
  isLoading={isSubmitting}
  loadingText="Menyimpan..."
  leftIcon={<Plus className="size-4" />}
>
  Tambah Data
</Button>
```

---

### D. Sistem Alert Feedback (`@/components/ui/alert`)
Gunakan untuk menampilkan error sistem, konfirmasi sukses, dan peringatan:
```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

<Alert variant="destructive"> {/* "default" | "destructive" | "success" | "warning" | "info" */}
  <AlertTitle>Kesalahan</AlertTitle>
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>
```

---

### E. Sistem Notifikasi Toast Pojok Kanan (`@/components/ui/toast`)
Gunakan helper `toast` untuk menampilkan notifikasi mengambang di pojok kanan atas:
```tsx
import { toast } from '@/components/ui'

// Notifikasi Sukses
toast.success('Berhasil Masuk', 'Selamat datang kembali!')

// Notifikasi Error
toast.error('Gagal Masuk', 'Periksa kembali email atau kata sandi Anda')

// Notifikasi Info & Warning
toast.info('Info', 'Sesi Anda akan segera berakhir')
toast.warning('Peringatan', 'Harap simpan perubahan sebelum keluar')
```

---

## 3. Checklist Aksesibilitas & Keamanan Form
- [ ] Setiap form input memiliki `<Label>` dengan atribut `htmlFor` yang cocok dengan `id` input.
- [ ] Atribut `autoComplete` disematkan dengan benar (`email`, `current-password`, `new-password`, `one-time-code`).
- [ ] Input yang memiliki error menyematkan `isError={true}` yang otomatis mengaktifkan `aria-invalid="true"`.
- [ ] Tombol aksi utama memiliki feedback loading (`isLoading={true}`) dan mencegah multiple submission.

