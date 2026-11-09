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

### F. Sistem Checkbox, Select2, DataTables & Breadcrumb (`@/components/ui`)

1. **Checkbox (`@/components/ui/checkbox`)**:
   Selalu bungkus di dalam `<label htmlFor="...">` agar area klik nyaman di sentuhan maupun mouse:
   ```tsx
   import { Checkbox } from '@/components/ui/checkbox'

   <label htmlFor="agree" className="inline-flex items-center gap-2 cursor-pointer">
     <Checkbox id="agree" checked={checked} onCheckedChange={setChecked} />
     <span>Pilih item</span>
   </label>
   ```
2. **Select2 Single & Multiple (`@/components/ui/select2`, `@/components/ui/multi-select2`)**:
   Gunakan `<Select2>` untuk pilihan tunggal dengan pencarian langsung, dan `<MultiSelect2>` untuk pilihan ganda berbasis tag chip.
3. **DataTables (`@/components/ui/data-table`)**:
   Gunakan `<DataTable>` untuk tabel interaktif lengkap dengan dropdown jumlah data (berbasis `Select2`), paginasi, pencarian, pengurutan kolom, serta kolom checkbox seleksi per baris.
4. **Breadcrumb (`@/components/ui/breadcrumb`)**:
   Gunakan compound component `<Breadcrumb>`, `<BreadcrumbList>`, `<BreadcrumbItem>`, `<BreadcrumbLink>`, `<BreadcrumbPage>`, `<BreadcrumbSeparator>` untuk navigasi hierarki halaman di body.
5. **File Upload (`@/components/ui/file-upload`)**:
   Gunakan modul `FileUpload`, `FileUploadList`, `FileUploadItem`, dan `FileUploadPreview` untuk unggahan file/gambar berbasis Drag & Drop dan auto-paste clipboard (`Ctrl+V` / `Cmd+V`) dengan pratinjau lightbox dan validasi tipe/ukuran.
6. **Theme Toggle (`@/components/ui/theme-toggle`)**:
   Gunakan `<ThemeToggle variant="icon" />` pada bar navigasi/header atau `<ThemeToggle variant="segmented" />` untuk pemilih 3 mode (`Terang | Gelap | Sistem`) agar pengguna dapat mengganti tema kapan saja.
7. **Skeleton Loading Shimmer (`@/components/ui/skeleton`)**:
   **Dilarang menampilkan fallback teks polos** seperti `"Memuat..."` di `loading.tsx` atau `<Suspense fallback={...}>` untuk halaman penuh maupun blok konten. Gunakan primitif `<Skeleton />`, `<SkeletonText />`, dan preset anatomi halaman (`DashboardOverviewSkeleton`, `DataTableSkeleton`, `DataTablePageSkeleton`, `NotificationsSkeleton`, `MediaGridPageSkeleton`, `FormPageSkeleton`, `AuthFormSkeleton`, `PublicArticleSkeleton`, `PublicListSkeleton`) dengan efek kilau diagonal bergaya Gojek (`.cms-skeleton-shimmer`, `transform: translateX`, `delayMs` berjenjang, dan `role="status"` + `aria-busy="true"`). Pada `<DataTable>`, aktifkan prop `isLoading` saat mengambil data asinkron.

---

## 3. Standar Wajib Responsivitas (Desktop, Tablet, & Handphone)

Setiap halaman, layout, modal, dan komponen **wajib bekerja rapi di seluruh ukuran layar** tanpa potongan maupun *horizontal overflow*:

| Perangkat | Breakpoint Tailwind | Fokus Tata Letak |
|---|---|---|
| **Handphone** | Default (`< 640px`) | 1 kolom vertikal (`grid-cols-1`, `flex-col`), kontrol lebar penuh (`w-full`), modal/popover/toast memakai batas aman (`inset-x-4`, `max-w-full`). |
| **Tablet** | `sm:` / `md:` (`640px–1023px`) | Transisi ke 2 kolom (`md:grid-cols-2`), toolbar mulai sejajar (`sm:flex-row`), ukuran font & padding proporsional. |
| **Desktop** | `lg:` / `xl:` / `2xl:` (`≥ 1024px`) | Multi-kolom (`lg:grid-cols-12`, `xl:grid-cols-3`), toolbar inline penuh (`lg:flex-row lg:items-center`), kontainer terpusat (`max-w-7xl mx-auto w-full`). |

### Aturan Teknis Responsivitas
1. **Mobile-First & Anti Horizontal Scroll**:
   - Selalu tulis class untuk handphone terlebih dahulu, baru tambahkan override untuk `sm:`, `md:`, `lg:`, `xl:`.
   - Wajib pasang `min-w-0` pada child container di dalam `flex` atau `grid` agar teks panjang (`truncate`) atau tabel tidak mendorong layar melebar ke samping.
   - Tabel data lebar wajib dibungkus kontainer `w-full overflow-x-auto` — jangan pernah membiarkan tabel memaksa halaman scrolling horizontal.
2. **Fleksibel & Tanpa Lebar Kaku Berbahaya**:
   - Hindari lebar piksel statis tanpa batas aman (misal `w-[480px]` mentah). Gunakan `w-full sm:w-[390px]` atau `max-w-... w-full`.
   - Untuk daftar pill/tab/chip/tombol aksi di toolbar, gunakan `flex-wrap` atau gulir horizontal halus (`.no-scrollbar`).
3. **Ramah Layar Sentuh (Touch Ergonomics)**:
   - Pastikan tombol interaktif memiliki tinggi/area sentuh memadai (`h-8`/`h-9`/`h-10` atau padding tambahan `p-2`), serta beri jarak antar tombol agar tidak salah ketuk di handphone/tablet.
   - **Jangan pernah menyembunyikan tombol aksi penting hanya saat `:hover`** (`opacity-0 group-hover:opacity-100`). Seluruh aksi utama harus langsung terlihat dan dapat disentuh di mobile/tablet.
4. **Hati-hati Kliping Popover (`overflow-hidden`)**:
   - Jangan pasang `overflow-hidden` pada pembungkus `<Card>` yang memuat `Select2` atau `MultiSelect2` agar daftar dropdown tidak terpotong di dalam kartu.

---

## 4. Animation & Transition Rules (Next.js)

Animasi UI wajib berjalan **60fps tanpa jank/patah-patah**, interruptible, aksesibel, dan ramah perangkat mobile/low-end:

### A. Prinsip Utama
1. **Hanya Properti GPU Compositor**:
   - Semua animasi harus berjalan **60fps**. Hanya animasikan properti yang dijalankan di GPU compositor: **`transform` (`translate`, `scale`, `rotate`) dan `opacity`** (serta transisi warna UI ringan seperti `background-color`, `color`, `border-color`).
   - **DILARANG menganimasikan** `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow` besar, atau `filter: blur` berat secara langsung karena memicu *layout reflow* / *repaint* mahal.
   - Untuk expand/collapse container atau accordion, gunakan `transform: scale()` atau teknik CSS **`grid-template-rows: 0fr → 1fr`** (bukan animasi `height`). Untuk progress bar, gunakan **`transform: scaleX()`** dengan `origin-left` (bukan animasi `width`).
2. **Aturan Kritis Tailwind CSS v4**:
   - Utilitas `translate-*`, `scale-*`, dan `rotate-*` pada Tailwind v4 mengompilasi ke properti CSS mandiri (`translate`, `scale`, `rotate`), **BUKAN `transform`**.
     - ✅ Benar: `transition-[opacity,translate,scale]`, `transition-[rotate,color]`, `transition-[transform,opacity]` (saat memakai `transform`)
     - ❌ Salah: memasang `transition-[opacity,transform]` untuk class `scale-*` / `translate-*`
   - Pada komponen `motion` (`m.div` dll.), properti `x`, `y`, `scale`, `rotate` langsung diakselerasi GPU oleh runtime Motion.

### B. Durasi & Easing Standar
- **Micro-interaction** (hover, tap, toggle, chip): **`150–250ms`**.
- **Transisi elemen** (modal, dropdown, popover, drawer, toast): **`250–400ms`**.
- **Transisi halaman / animasi besar**: maksimal **`500–600ms`**.
- **Gunakan easing natural, BUKAN `linear` untuk gerakan UI**:
  - **Masuk (Enter)**: `cubic-bezier(0.16, 1, 0.3, 1)` (`ease-out`)
  - **Keluar (Exit)**: `cubic-bezier(0.7, 0, 0.84, 0)` (`ease-in`)
  - **Dua arah (Two-way / Toggle)**: `cubic-bezier(0.65, 0, 0.35, 1)` (`ease-in-out`)
- Untuk animasi berbasis interaksi (drag, reorder, active indicator, sidebar/drawer responsif), utamakan **spring physics**:
  `{ type: "spring", stiffness: 300, damping: 30 }`.
- **Jangan mulai dari `scale(0)`**: mulai dari `scale(0.95)`/`scale(0.96)` + `opacity: 0`.

### C. Pemilihan Library (`motion` vs CSS)
- Gunakan **`motion`** (`LazyMotion` + `domAnimation`, `m.*` dari `'motion/react-m'`, dan `AnimatePresence` dari `'motion/react'`) untuk animasi kompleks, exit animation (`AnimatePresence`), layout animation (`domMax` hanya di modul terisolasi yang membutuhkan `layout` / `layoutId` / `drag`), serta page transition (`template.tsx`).
- Gunakan **CSS transition / `@starting-style` / `@keyframes`** untuk animasi sederhana (hover, press, focus, fade, spinner, accordion `grid-template-rows`, skeleton).
- **Jangan mencampur banyak library animasi** di dalam satu komponen.
- **Import hanya yang dibutuhkan**: bungkus akar aplikasi dengan `<LazyMotion features={domAnimation} strict>` (melalui `MotionProvider`) untuk menekan ukuran bundle JavaScript.

### D. Performa, Touch Gating, & Scroll
- **`will-change` Hanya Sementara**: pasang `will-change: transform, opacity` hanya pada elemen yang sedang/akan dianimasikan, lalu hapus kembali (`auto`) setelah selesai (misalnya via `onAnimationStart` / `onAnimationComplete`). **Dilarang dipasang global atau permanen** (seperti `will-change-[width]`).
- **Hindari Layout Thrashing**: jangan membaca dan menulis properti geometrik DOM (`offsetHeight`, `getBoundingClientRect`) secara bergantian di dalam satu frame.
- **`requestAnimationFrame` untuk JS Manual**: gunakan `requestAnimationFrame` (bukan `setInterval`/`setTimeout`) untuk timing/fokus frame UI.
- **Scroll & Offscreen**: untuk animasi berbasis scroll atau elemen berulang/ambient, gunakan `IntersectionObserver` atau `useScroll` / `useInView` dari `'motion/react'` (bukan event listener `scroll` mentah). Hentikan animasi berulang saat elemen berada di luar viewport atau tab tidak aktif (`document.visibilityState`).
- Gunakan `transform: translateZ(0)` hanya jika benar-benar perlu memaksa compositor layer baru.
- **Batasi Stagger**: batasi jumlah elemen yang beranimasi bersamaan; untuk list panjang, gunakan stagger kecil **`30–60ms`** dan batasi maksimal **~10 item pertama** (`Math.min(index, 9)`).
- **Pointer Gating (Wajib untuk Mobile/Touch)**: bungkus efek `:hover` interaktif dengan `[@media(hover:hover)_and_(pointer:fine)]:hover:...` agar state hover tidak tersangkut setelah diketuk di layar sentuh.

### E. Aturan Khusus Next.js App Router
- Komponen dengan animasi interaktif atau hook Motion wajib memakai `'use client'`; pisahkan animasi menjadi *client island* kecil (`MotionProvider`, `PageTransition`) agar layout/halaman lain tetap menjadi **Server Component**.
- **Hindari Hydration Mismatch**: jangan membaca `window` atau nilai acak saat render awal; gunakan `useEffect` atau `initial={false}` pada render awal agar SSR & initial LCP tetap instan.
- **Page Transition App Router**: gunakan **`template.tsx`** (bukan `layout.tsx`) agar animasi ter-trigger setiap navigasi rute, atau gunakan React `<ViewTransition>` / View Transitions API bila didukung.
- Bungkus **exit animation** dengan `<AnimatePresence>` dan pastikan setiap child memiliki **`key` yang unik**.
- Gunakan `next/dynamic` untuk memuat komponen animasi berat (3D, Lottie, canvas) secara *lazy*.
- Gunakan `next/image` dengan prop `priority` untuk gambar *hero* guna mencegah *layout shift* (CLS) saat animasi masuk.

### F. Aksesibilitas Animasi (`prefers-reduced-motion`)
- `src/app/globals.css` wajib menyertakan aturan global:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- Di komponen `motion`, **wajib** memakai `useReducedMotion()` (serta `<MotionConfig reducedMotion="user">` pada `MotionProvider`), dan pada CSS tambahkan `motion-reduce:` fallback.
- Animasi tidak boleh menghalangi interaksi pengguna, menyembunyikan konten penting terlalu lama, atau berkedip lebih dari **3 kali per detik**.

### G. Pola Standar yang Harus Diikuti
- **Fade + slide masuk**:
  ```tsx
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
  ```
- **Hover & press button**:
  `transition-[transform,opacity,background-color,color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98]`
- **Accordion / expand-collapse**:
  `grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.65,0,0.35,1)]` (`grid-rows-[0fr]` → `grid-rows-[1fr]`) dengan pembungkus dalam `overflow-hidden`.
- **Skeleton / loading**:
  gunakan animasi `opacity` atau shimmer berbasis `transform: translateX(...)`, **bukan** mengubah `background-position`.
- **Perubahan layout (reorder / resize)**:
  gunakan prop `layout` / `layoutId` dari Motion bila memang membutuhkan transisi layout terisolasi.

### H. Larangan Keras
- ❌ **DILARANG memakai `transition: all` / `transition-all`** — selalu tulis properti transisi secara eksplisit.
- ❌ **DILARANG menganimasikan di dalam render loop React** (`setState` tiap frame); gunakan `useMotionValue` / `useTransform` atau CSS variable.
- ❌ **DILARANG menjalankan animasi infinite yang tidak perlu** tanpa jeda saat di luar viewport atau tab tidak aktif.
- ❌ **DILARANG menambahkan animasi dekoratif** jika memperburuk Core Web Vitals (**LCP, INP, CLS**).

---

## 5. Standar Wajib Mode Gelap & Terang (Dark & Light Mode)

Seluruh halaman, layout, modal, grafik SVG, dan komponen UI **wajib mendukung Mode Gelap (Dark Mode) dan Mode Terang (Light Mode) secara penuh** dengan kontras baca tinggi serta bebas kedipan awal (*zero-FOUC*):

1. **Mekanisme Tema Terpusat (`ThemeProvider` & `@custom-variant dark`)**:
   - Aplikasi menerapkan dark mode berbasis class (`.dark` pada `<html>` via `@custom-variant dark (&:where(.dark, .dark *));` di `src/app/globals.css`) yang dikelola oleh `ThemeProvider` (`@/components/theme/theme-provider`).
   - Selalu sinkronkan preferensi tema tanpa membaca `localStorage` langsung di body render komponen UI untuk mencegah *hydration mismatch*. Gunakan CSS class `dark:` (`dark:hidden` / `hidden dark:block`) atau *mounted guard* saat merender status spesifik klien.

2. **Dilarang Menulis Warna Statis Tanpa Pasangan `dark:`**:
   - Jangan pernah menggunakan kelas warna terang statis secara tunggal. Gunakan token semantik (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `border-border`, `text-muted-foreground`) atau pasangkan utilitas terang dengan padanan `dark:` yang konsisten:
     - **Kanvas halaman**: `bg-[#f6f6f7] dark:bg-zinc-950` (dashboard) atau `bg-white dark:bg-zinc-950` (auth)
     - **Permukaan elevasi (Card, Header, Sidebar, Modal, Popover)**: `bg-white dark:bg-zinc-900`
     - **Permukaan bersarang / hover / track**: `bg-zinc-100 dark:bg-zinc-800` atau `bg-zinc-50 dark:bg-zinc-800/70`
     - **Garis tepi / divider**: `border-zinc-200/80 dark:border-zinc-800` atau `border-zinc-100 dark:border-zinc-800`
     - **Teks utama & judul**: `text-zinc-950 dark:text-zinc-50` (atau `text-zinc-900 dark:text-zinc-100`)
     - **Teks sekunder & keterangan (kontras minimal `≥ 4.5:1`)**: `text-zinc-500 dark:text-zinc-400` di atas permukaan `zinc-900` (hindari `dark:text-zinc-500` atau `dark:text-zinc-600` untuk teks konten penting)
     - **Tombol primer / badge aktif monokrom**: `bg-black dark:bg-white text-white dark:text-zinc-950`
     - **Badge & umpan balik semantik**: sertakan varian gelap seperti `text-emerald-700 dark:text-emerald-400`, `text-rose-600 dark:text-rose-400`, `bg-rose-50/70 dark:bg-rose-950/35 border-rose-200 dark:border-rose-900/70`.

3. **Elevasi, Border, & Ring di Mode Gelap**:
   - Bayangan luar (`shadow-xs`, `shadow-xl`) memudar di latar gelap. Pastikan setiap kartu, popover, modal, dan dropdown menyertakan tepi kontras halus pada mode gelap (contoh: `ring-1 ring-zinc-950/[0.06] dark:ring-white/10` atau `border-zinc-200/80 dark:border-zinc-800`).

4. **Grafik SVG, Pola Latar, & Kontrol Native**:
   - Hindari atribut `#hex` statis di dalam `<svg>`, `<path>`, `<circle>`, `<line>`, atau `<linearGradient>`. Gunakan `currentColor` atau class utilitas Tailwind (`stroke-zinc-100 dark:stroke-zinc-800`, `stroke-black dark:stroke-white`).
   - Pola radial atau grid latar belakang wajib menyediakan pasangan `dark:` yang lembut agar tidak menyilaukan mata di mode gelap.
   - Elemen native seperti `<dialog>`, input tanggal, dan scrollbar mengikuti `color-scheme: light dark` dari dokumen sehingga tetap serasi di kedua tema.

---

## 6. Typography Rules (Modern CMS / Dashboard)

Standar tipografi wajib di seluruh aplikasi My CMS untuk keterbacaan dashboard yang padat namun nyaman, hirarki semantik yang konsisten, serta performa optimal tanpa *layout shift* (CLS):

### A. Font Family
- **Font utama (UI Sans)**: **Inter** (`Inter` dari `next/font/google`, `subsets: ['latin']`, `display: 'swap'`).
- **Font monospace** (kode, ID, slug, JSON, API key): **JetBrains Mono** (`JetBrains_Mono` dari `next/font/google`, `subsets: ['latin']`, `display: 'swap'`).
- **Maksimal 2 font family** dalam satu proyek (1 sans + 1 mono). Dilarang menambahkan font dekoratif di area CMS.
- Wajib menggunakan **`next/font`** (bukan `<link>` Google Fonts eksternal atau `@import url()` CSS) agar font ter-self-host, bebas *layout shift*, dan lebih cepat.
- **Konfigurasi `app/layout.tsx` + Tailwind CSS v4 (`globals.css`)**:
  Gunakan nama variabel internal (`--font-inter`, `--font-jetbrains-mono`) pada `next/font` lalu petakan melalui `@theme inline` agar tidak terjadi siklus variabel CSS di Tailwind v4:
  ```tsx
  // src/app/layout.tsx
  import { Inter, JetBrains_Mono } from 'next/font/google';

  const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
  });
  const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
  });

  <html className={`${inter.variable} ${jetbrainsMono.variable}`}>
    <body className="font-sans text-sm leading-normal ...">
  ```
  ```css
  /* src/app/globals.css */
  @theme inline {
    --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
  ```
- **Font smoothing & fitur angka**:
  ```css
  @layer base {
    html {
      font-size: 100%;
    }
    body {
      font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: "cv11", "ss01";
      text-rendering: optimizeLegibility;
    }
  }
  .tabular {
    font-variant-numeric: tabular-nums;
  }
  ```

### B. Skala Font Size
Gunakan skala utilitas Tailwind berbasis `rem` (base **`14px` / `text-sm`** untuk dashboard/CMS, bukan `16px`, agar padat namun tetap sangat terbaca):

| Token | Size | Line height | Penggunaan |
|---|---|---|---|
| `text-xs` | `12px` | `16px` | Caption, badge, helper text, timestamp, header tabel (ukuran **minimum** teks) |
| `text-sm` | `14px` | `20px` | **Default** body, isi tabel, form label & input desktop, sidebar nav |
| `text-base` | `16px` | `24px` | Konten editor/artikel, paragraf panjang, serta **input form di mobile** |
| `text-lg` | `18px` | `28px` | Subjudul section, judul card (`CardTitle`) |
| `text-xl` | `20px` | `28px` | Judul halaman sekunder / section heading (`H2`) |
| `text-2xl` | `24px` | `32px` | Judul halaman utama (`H1` page title) |
| `text-3xl` | `30px` | `36px` | Heading besar / empty state / hero landing |

- **Ukuran minimum teks yang boleh tampil: `12px` (`text-xs`)**. Dilarang keras memakai `text-[9px]`, `text-[10px]`, atau `text-[11px]`.
- Jangan membuat ukuran custom di luar skala (misal `13px`, `15px`, `17px`) — **satu-satunya pengecualian** yang diizinkan adalah **`font-mono text-[13px]`** untuk kode/slug/ID.
- **Input form di mobile minimal `16px`** (`text-base sm:text-sm`) agar iOS Safari tidak melakukan *auto-zoom* saat fokus.
- Selalu gunakan unit `rem` melalui utility class Tailwind, bukan `px` hardcode atau `style` inline.

### C. Font Weight
- `400` (`font-normal`): body text, deskripsi
- `500` (`font-medium`): label, nav item, tombol, header tabel, badge/status
- `600` (`font-semibold`): judul card, heading (`H1`–`H4`), angka penting
- `700` (`font-bold`): hanya untuk penekanan metrik/heading utama
- **Dilarang memakai weight `300` ke bawah (`font-thin`, `font-extralight`, `font-light`) dan `800` ke atas (`font-extrabold`, `font-black`)** di UI CMS, serta jangan memakai bold untuk seluruh paragraf.

### D. Hierarki Heading, Line Height, & Lebar Teks
- **H1** (page title): `text-2xl font-semibold tracking-tight leading-tight` (wajib maksimal **satu H1 per halaman**, jangan melompati level heading `h1 -> h2 -> h3 -> h4`)
- **H2** (section): `text-xl font-semibold tracking-tight leading-tight`
- **H3** (card / subsection): `text-lg font-semibold leading-tight`
- **H4** (label group / alert title): `text-sm font-semibold`
- Heading besar (`≥ 24px`): gunakan `letter-spacing: -0.01em` hingga `-0.02em` (`tracking-tight`). Teks kecil (`≤ 12px`): gunakan tracking positif (`tracking-[0.01em]` atau `tracking-wide` pada label kecil uppercase).
- Body text menggunakan `leading-normal` (`1.5`). Heading menggunakan `leading-tight` (`1.25`). Teks UI singkat (label, tombol) menggunakan `leading-none` atau `leading-5`.
- Paragraf panjang / konten artikel wajib dibatasi lebar maksimal `65ch` (**`max-w-prose`**) dan rata kiri (dilarang meratakan tengah / `text-center` paragraf panjang).

### E. Warna Teks (Kontras WCAG AA+)
- Teks utama: `text-foreground` / `text-zinc-950 dark:text-zinc-50` (kontras minimal `7:1`).
- Teks sekunder / muted: `text-muted-foreground` / `text-zinc-500 dark:text-zinc-400` (kontras minimal `4.5:1`).
- Placeholder dan teks disabled harus tetap terbaca (minimal `3:1`, misal `placeholder:text-zinc-500 dark:placeholder:text-zinc-400`). Jangan gunakan abu-abu terlalu terang (`text-zinc-400` / `text-slate-400` di atas latar putih) untuk teks penting.

### F. Standar Tipografi Komponen CMS
- **Sidebar nav**: `text-sm font-medium` (aktif `font-semibold`)
- **Header tabel (`<th>`)**: `text-xs font-medium uppercase tracking-wide text-muted-foreground` (atau `text-zinc-500 dark:text-zinc-400`)
- **Sel tabel (`<td>`)**: `text-sm` + `tabular-nums` (`.tabular`) untuk angka/statistik/tanggal
- **Label form**: `text-sm font-medium`; **helper / error text**: `text-xs`
- **Tombol**: `text-sm font-medium` (atau `text-xs font-medium` pada tombol mini `size="sm"`)
- **Badge / status**: `text-xs font-medium`
- **Editor rich text / artikel**: `text-base leading-7`
- **Kode / slug / ID**: `font-mono text-[13px]`

### G. Larangan Keras Tipografi
- ❌ **DILARANG** mengimpor font lewat `@import url()` CSS atau tag `<link>` eksternal.
- ❌ **DILARANG** memakai lebih dari **4 ukuran font berbeda** dalam satu layar.
- ❌ **DILARANG** memakai `ALL CAPS` pada teks panjang (hanya diizinkan untuk label kecil / badge / `<th>`).
- ❌ **DILARANG** menggunakan font serif atau display di body UI dashboard.
- ❌ **DILARANG** membiarkan teks di bawah `12px` atau input mobile di bawah `16px`.

---

## 7. Checklist Kualitas Frontend (Tipografi, Responsivitas, Animasi, Tema, & Aksesibilitas)
- [ ] **Font & Scale**: Proyek memuat `Inter` (`sans`) dan `JetBrains Mono` (`mono`) via `next/font/google` dengan `display: "swap"` tanpa `<link>` / `@import url()`; seluruh teks memakai skala Tailwind `text-xs` (`12px` minimum) hingga `text-3xl`, tanpa ukuran di luar skala (kecuali `font-mono text-[13px]`) dan tanpa font weight `< 400` atau `≥ 800`.
- [ ] **Mobile Input & Numerik**: Semua `<input>` / kontrol teks memakai minimal `16px` di layar mobile (`text-base sm:text-sm`) untuk mencegah auto-zoom iOS Safari, dan angka pada tabel/KPI/grafik memakai `tabular-nums`.
- [ ] **Hierarki & Kontras**: Maksimal 1 `<h1>` per halaman tanpa melompati level heading, panjang paragraf konten dibatasi `max-w-prose`, serta kontras teks utama `≥ 7:1` dan teks sekunder `≥ 4.5:1` di **Light Mode** maupun **Dark Mode**.
- [ ] **Form & Aksesibilitas**: Setiap form input memiliki `<Label>` dengan atribut `htmlFor` yang cocok dengan `id` input, `autoComplete` tepat, `isError={true}` saat error, dan tombol aksi utama memakai `isLoading={true}` guna mencegah multiple submission.
- [ ] **Responsivitas**: Tampilan diuji rapi tanpa *horizontal overflow* di ukuran **Handphone (`375px`)**, **Tablet (`768px`)**, dan **Desktop (`1280px+`)**, serta seluruh aksi penting tetap dapat diklik/sentuh tanpa bergantung pada `:hover`.
- [ ] **Animasi 60fps & Motion Safety**: Tidak ada penggunaan `transition-all`; hanya `transform` (`translate`, `scale`, `rotate`) dan `opacity` (plus `color`/`background-color`/`border-color`/`grid-template-rows`) yang dianimasikan, menghormati `prefers-reduced-motion`, memakai `will-change` sementara, serta menerapkan `@media (hover: hover) and (pointer: fine)` pada hover micro-interaction.
- [ ] **Loading & Skeleton State**: Semua `loading.tsx`, `<Suspense fallback>`, dan state memuat tabel (`<DataTable isLoading />`) menggunakan komponen `@/components/ui/skeleton` bergaya Gojek shimmer (bukan teks polos `"Memuat..."` maupun `animate-pulse`) serta menyertakan `role="status"`, `aria-busy="true"`, dan teks `.sr-only` yang aksesibel.

