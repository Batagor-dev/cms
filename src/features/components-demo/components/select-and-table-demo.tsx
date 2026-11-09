'use client'

import * as React from 'react'
import { Eye, Layers, Loader2, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Select2, type Select2Option } from '@/components/ui/select2'
import { MultiSelect2 } from '@/components/ui/multi-select2'
import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/data-table'
import {
  FileUpload,
  type FileUploadEntry,
  type FileUploadHelpers,
} from '@/components/ui/file-upload'

interface DemoArticleRow extends Record<string, unknown> {
  id: string
  title: string
  author: string
  category: string
  status: 'Published' | 'Review' | 'Draft'
  views: number
  updatedAt: string
}

const ROLE_OPTIONS: Select2Option[] = [
  {
    value: 'super-admin',
    label: 'Super Admin',
    description: 'Akses penuh ke seluruh pengaturan dan manajemen CMS',
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Meninjau, menyunting, dan menerbitkan seluruh artikel',
  },
  {
    value: 'author',
    label: 'Author',
    description: 'Membuat dan mengelola artikel milik sendiri',
  },
  {
    value: 'moderator',
    label: 'Moderator',
    description: 'Mengawasi komentar serta laporan pengguna',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Akses baca-saja untuk statistik dan pratinjau konten',
  },
]

const TAG_OPTIONS: Select2Option[] = [
  { value: 'nextjs', label: 'Next.js 16', description: 'App Router & RSC' },
  { value: 'supabase', label: 'Supabase', description: 'Auth & PostgreSQL RLS' },
  { value: 'tailwind', label: 'Tailwind CSS', description: 'Design system & utility' },
  { value: 'typescript', label: 'TypeScript', description: 'Strict static typing' },
  { value: 'seo', label: 'SEO & OpenGraph', description: 'Indeksasi & metadata' },
  { value: 'security', label: 'Keamanan OWASP', description: 'Proteksi & audit log' },
  { value: 'performance', label: 'Core Web Vitals', description: 'LCP, INP & caching' },
]

const INITIAL_ARTICLES: DemoArticleRow[] = [
  {
    id: 'ART-101',
    title: 'Arsitektur Konten Techarea Production CMS',
    author: 'Staff Author',
    category: 'Arsitektur',
    status: 'Published',
    views: 1840,
    updatedAt: '9 Nov 2026',
  },
  {
    id: 'ART-102',
    title: 'Panduan Implementasi Row Level Security di Supabase',
    author: 'Farel Hasdika',
    category: 'Keamanan',
    status: 'Published',
    views: 1425,
    updatedAt: '8 Nov 2026',
  },
  {
    id: 'ART-103',
    title: 'Optimasi Core Web Vitals untuk Blog Next.js 16',
    author: 'Editor Utama',
    category: 'Performa',
    status: 'Review',
    views: 960,
    updatedAt: '8 Nov 2026',
  },
  {
    id: 'ART-104',
    title: 'Standar Komponen UI Monokrom dan Aksesibilitas',
    author: 'Tim Desain',
    category: 'Desain UI',
    status: 'Published',
    views: 2110,
    updatedAt: '7 Nov 2026',
  },
  {
    id: 'ART-105',
    title: 'Konfigurasi Sitemap XML & Robots.txt Otomatis',
    author: 'Editor Utama',
    category: 'SEO',
    status: 'Published',
    views: 875,
    updatedAt: '6 Nov 2026',
  },
  {
    id: 'ART-106',
    title: 'Manajemen Hak Akses Berbasis Role (RBAC)',
    author: 'Super Admin',
    category: 'Keamanan',
    status: 'Published',
    views: 1630,
    updatedAt: '5 Nov 2026',
  },
  {
    id: 'ART-107',
    title: 'Pipeline Unggah Media Library Terkompresi',
    author: 'Staff Author',
    category: 'Media',
    status: 'Draft',
    views: 310,
    updatedAt: '5 Nov 2026',
  },
  {
    id: 'ART-108',
    title: 'Audit Trail & Pencatatan Aktivitas Pengguna',
    author: 'Super Admin',
    category: 'Keamanan',
    status: 'Published',
    views: 1190,
    updatedAt: '4 Nov 2026',
  },
  {
    id: 'ART-109',
    title: 'Strategi Caching Halaman Publik dengan Suspense',
    author: 'Farel Hasdika',
    category: 'Performa',
    status: 'Review',
    views: 740,
    updatedAt: '3 Nov 2026',
  },
  {
    id: 'ART-110',
    title: 'Alur Verifikasi OTP Email untuk Registrasi Akun',
    author: 'Tim Keamanan',
    category: 'Keamanan',
    status: 'Published',
    views: 1520,
    updatedAt: '2 Nov 2026',
  },
  {
    id: 'ART-111',
    title: 'Menyusun Struktur Taksonomi Kategori & Tag Artikel',
    author: 'Editor Utama',
    category: 'Editorial',
    status: 'Draft',
    views: 420,
    updatedAt: '1 Nov 2026',
  },
  {
    id: 'ART-112',
    title: 'Checklist Sebelum Rilis Artikel Produksi',
    author: 'Staff Author',
    category: 'Editorial',
    status: 'Published',
    views: 1295,
    updatedAt: '30 Okt 2026',
  },
]

const STATUS_BADGE_STYLES: Record<DemoArticleRow['status'], string> = {
  Published: 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950',
  Review: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100',
  Draft: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700',
}

const QUICK_FEED_ITEMS = [
  {
    id: 'FD-01',
    author: 'Nadia Pratama',
    role: 'Managing Editor',
    title: 'Sinkronisasi Pipeline Editorial Kuartal IV',
    summary: 'Seluruh naskah kategori Arsitektur dan Keamanan sudah tervalidasi otomatis sebelum jadwal rilis pagi.',
    time: '2 menit lalu',
    tag: 'Editorial',
  },
  {
    id: 'FD-02',
    author: 'Raka Wijaya',
    role: 'Security Engineer',
    title: 'Audit Token Sesi & Policy RLS Terbaru',
    summary: 'Pembaruan rotasi token dan pembatasan akses peran admin telah aktif di lingkungan produksi.',
    time: '14 menit lalu',
    tag: 'Keamanan',
  },
] as const

export function SelectAndTableDemo() {
  const [selectedRole, setSelectedRole] = React.useState('author')
  const [selectedTags, setSelectedTags] = React.useState<string[]>([
    'nextjs',
    'supabase',
  ])
  const [mediaFiles, setMediaFiles] = React.useState<FileUploadEntry[]>([])
  const [documentFiles, setDocumentFiles] = React.useState<FileUploadEntry[]>([])
  const [isSkeletonPreview, setIsSkeletonPreview] = React.useState(true)
  const [isTableLoading, setIsTableLoading] = React.useState(false)

  const simulateUpload = React.useCallback(
    async (_entry: FileUploadEntry, { setProgress }: FileUploadHelpers) => {
      const steps = [22, 48, 76, 94, 100]
      for (const percent of steps) {
        await new Promise((resolve) => window.setTimeout(resolve, 140))
        setProgress(percent)
      }
    },
    []
  )

  const columns = React.useMemo<DataTableColumn<DemoArticleRow>[]>(
    () => [
      {
        id: 'title',
        header: 'Judul Artikel',
        accessorKey: 'title',
        sortable: true,
        cell: (row) => (
          <div className="min-w-[200px]">
            <p className="font-semibold text-zinc-950 dark:text-zinc-50 leading-snug">{row.title}</p>
            <p className="font-mono text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">{row.id}</p>
          </div>
        ),
      },
      {
        id: 'author',
        header: 'Penulis',
        accessorKey: 'author',
        sortable: true,
      },
      {
        id: 'category',
        header: 'Kategori',
        accessorKey: 'category',
        sortable: true,
        cell: (row) => (
          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium whitespace-nowrap">
            {row.category}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        sortable: true,
        cell: (row) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_BADGE_STYLES[row.status]}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        id: 'views',
        header: 'Pembaca',
        accessorKey: 'views',
        sortable: true,
        align: 'right',
        cell: (row) => (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {row.views.toLocaleString('id-ID')}
          </span>
        ),
      },
      {
        id: 'updatedAt',
        header: 'Diperbarui',
        accessorKey: 'updatedAt',
        sortable: true,
        cell: (row) => (
          <span className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
            {row.updatedAt}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="size-12 rounded-2xl bg-black dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight leading-tight text-zinc-950 dark:text-zinc-50">
              UI Components
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal mt-1 max-w-prose">
              Komponen reusable ThemeToggle (Dark &amp; Light Mode), Skeleton Shimmer ala Gojek, Select2, Multiple Select2, File Upload (Drag &amp; Drop + Auto-Paste Clipboard), dan DataTables interaktif yang responsif di desktop, tablet, maupun handphone.
            </p>
          </div>
        </div>

        <ThemeToggle variant="segmented" className="self-start sm:self-center shrink-0" />
      </div>

      {/* Section 1: Dual Select2 Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Select2 */}
        <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold leading-tight text-zinc-950 dark:text-zinc-50">
              Select2 Standar (Single Select)
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Dropdown pilihan tunggal dengan pencarian langsung, deskripsi opsi, dan navigasi keyboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="demo-select2-single" className="text-zinc-700 dark:text-zinc-200">
                Pilih Role Pengguna
              </Label>
              <Select2
                id="demo-select2-single"
                options={ROLE_OPTIONS}
                value={selectedRole}
                onValueChange={setSelectedRole}
                placeholder="Pilih role..."
                searchPlaceholder="Cari role pengguna..."
              />
            </div>

            <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between gap-2">
              <span>Nilai terpilih:</span>
              <code className="font-mono text-[13px] font-semibold text-zinc-950 dark:text-zinc-50">
                {selectedRole || '(kosong)'}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Select2 */}
        <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold leading-tight text-zinc-950 dark:text-zinc-50">
              Select2 Multiple Select
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Pilihan ganda dengan tag chip yang bisa dihapus, ketik langsung untuk memfilter opsi, dan tombol pilih semua.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="demo-multiselect2" className="text-zinc-700 dark:text-zinc-200">
                Pilih Topik &amp; Tag Konten
              </Label>
              <MultiSelect2
                id="demo-multiselect2"
                options={TAG_OPTIONS}
                value={selectedTags}
                onValueChange={setSelectedTags}
                placeholder="Pilih satu atau lebih topik..."
                searchPlaceholder="Tambah atau cari topik..."
              />
            </div>

            <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between gap-2">
              <span>Jumlah pilihan:</span>
              <code className="font-mono text-[13px] font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">
                {selectedTags.length > 0 ? selectedTags.join(', ') : '(kosong)'}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: File Upload (Drag & Drop + Clipboard Auto-Paste) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold leading-tight text-zinc-950 dark:text-zinc-50">
              File Upload Gambar (Auto-Paste &amp; Grid Preview)
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Salin gambar atau screenshot lalu tekan Ctrl+V / Cmd+V, atau seret gambar langsung. Klik pratinjau untuk zoom lightbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              id="demo-file-upload-media"
              value={mediaFiles}
              onValueChange={setMediaFiles}
              onUpload={simulateUpload}
              accept="image/*"
              multiple
              maxFiles={6}
              maxSize={5 * 1024 * 1024}
              listLayout="grid"
              allowLayoutToggle
              title="Tarik atau tempel gambar di sini"
            />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold leading-tight text-zinc-950 dark:text-zinc-50">
              File Upload Dokumen &amp; Lampiran (List Preview)
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Mendukung Drag &amp; Drop dan tempel file dari Explorer/Finder (PDF, dokumen, arsip, maupun gambar).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              id="demo-file-upload-docs"
              value={documentFiles}
              onValueChange={setDocumentFiles}
              accept="image/*,.pdf,.doc,.docx,.xlsx,.csv,.zip"
              multiple
              maxFiles={8}
              maxSize={10 * 1024 * 1024}
              listLayout="list"
              title="Unggah atau seret lampiran dokumen"
            />
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Gojek-Style Shimmer Skeleton Loading */}
      <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold leading-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="size-5 text-zinc-800 dark:text-zinc-200" aria-hidden="true" />
              <span>Skeleton Loading (Silky Diagonal Shimmer)</span>
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal max-w-prose">
              Efek kilau diagonal 105° dengan jeda berjenjang seperti kartu Gojek, berjalan di GPU compositor (<code className="font-mono text-[13px]">transform: translateX</code>) tanpa layout shift dan mendukung Mode Terang &amp; Gelap.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant={isSkeletonPreview ? 'default' : 'outline'}
              onClick={() => setIsSkeletonPreview(true)}
              aria-pressed={isSkeletonPreview}
              className="rounded-xl"
            >
              <Loader2 className="size-4" aria-hidden="true" />
              <span>Mode Skeleton</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!isSkeletonPreview ? 'default' : 'outline'}
              onClick={() => setIsSkeletonPreview(false)}
              aria-pressed={!isSkeletonPreview}
              className="rounded-xl"
            >
              <Eye className="size-4" aria-hidden="true" />
              <span>Tampilkan Konten</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent
          aria-busy={isSkeletonPreview || undefined}
          role={isSkeletonPreview ? 'status' : undefined}
        >
          {isSkeletonPreview && (
            <span className="sr-only">Menampilkan pratinjau skeleton shimmer...</span>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_FEED_ITEMS.map((item, idx) => {
              const baseDelay = idx * 110
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 p-4 sm:p-5 flex flex-col justify-between gap-4 min-w-0"
                >
                  {isSkeletonPreview ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Skeleton shape="circle" delayMs={baseDelay} className="size-11" />
                          <div className="space-y-2 flex-1 min-w-0">
                            <Skeleton
                              shape="pill"
                              delayMs={baseDelay + 35}
                              className="h-4 w-32"
                            />
                            <Skeleton
                              shape="pill"
                              delayMs={baseDelay + 65}
                              className="h-3 w-24"
                            />
                          </div>
                        </div>
                        <Skeleton
                          shape="pill"
                          delayMs={baseDelay + 80}
                          className="h-6 w-20 shrink-0"
                        />
                      </div>

                      <div className="space-y-3">
                        <Skeleton
                          shape="pill"
                          delayMs={baseDelay + 100}
                          className="h-5 w-4/5"
                        />
                        <SkeletonText lines={2} delayMs={baseDelay + 130} />
                      </div>

                      <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <Skeleton
                          shape="pill"
                          delayMs={baseDelay + 165}
                          className="h-3.5 w-24"
                        />
                        <Skeleton
                          shape="rounded"
                          delayMs={baseDelay + 190}
                          className="h-8 w-24"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-11 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-sm font-semibold shrink-0">
                            {item.author
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                              {item.author}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {item.role}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium shrink-0">
                          {item.tag}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-base font-semibold leading-tight text-zinc-950 dark:text-zinc-50">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-normal max-w-prose">
                          {item.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                          {item.time}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setIsSkeletonPreview(true)}
                          className="h-8 rounded-xl text-xs"
                        >
                          Uji Shimmer Lagi
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Interactive DataTables */}
      <DataTable
        data={INITIAL_ARTICLES}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isTableLoading}
        loadingRows={5}
        pageSizeOptions={[5, 10, 25, 50]}
        defaultPageSize={5}
        searchPlaceholder="Cari judul, penulis, atau kategori..."
        headerActions={
          <Button
            type="button"
            size="sm"
            variant={isTableLoading ? 'default' : 'outline'}
            onClick={() => setIsTableLoading((prev) => !prev)}
            aria-pressed={isTableLoading}
            className="h-9 rounded-xl text-xs"
          >
            {isTableLoading ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            <span>{isTableLoading ? 'Tampilkan Data' : 'Simulasikan Loading'}</span>
          </Button>
        }
      />
    </div>
  )
}

