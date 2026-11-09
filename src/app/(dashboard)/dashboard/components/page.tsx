import type { Metadata } from 'next'
import { SelectAndTableDemo } from '@/features/components-demo/components/select-and-table-demo'

export const metadata: Metadata = {
  title: 'UI Components | Techarea Production CMS',
  description:
    'Demonstrasi komponen reusable Select2, Multiple Select2, File Upload (Drag & Auto-Paste), dan DataTables di Techarea Production CMS.',
}

export default function ComponentsDemoPage() {
  return <SelectAndTableDemo />
}

