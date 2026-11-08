const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 Menjalankan Database Fresh & Seed di Supabase...');

try {
  // 1. Eksekusi Migrate Fresh + Seed (full_schema_and_seed.sql)
  console.log('📦 1/2 Mereset database, membuat ulang seluruh tabel & RLS, serta seeding data awal...');
  execSync('npx supabase db query --linked -f supabase/full_schema_and_seed.sql', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
  console.log('✅ Skema database & seed data berhasil dipasang!');

  // 2. Generate TypeScript types otomatis
  console.log('🔄 2/2 Memperbarui file src/types/database.types.ts...');
  const typesOutput = execSync('npx supabase gen types typescript --linked', {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });
  fs.writeFileSync(
    path.resolve(__dirname, '../src/types/database.types.ts'),
    typesOutput,
    'utf8'
  );
  console.log('✅ TypeScript types berhasil diperbarui!');

  console.log('\n🎉 Selesai! Database Supabase Anda sudah fresh dan terisi data awal (mirip php artisan migrate:fresh --seed).\n');
} catch (error) {
  console.error('\n❌ Terjadi kesalahan saat menjalankan db:fresh:', error.message);
  process.exit(1);
}
