# Agent Instructions & Guidelines

## 🚨 MANDATORY RULE: Skill-First Execution (Wajib Cek Agent Skills Terlebih Dahulu)

Whenever the agent is asked to build, modify, refactor, style, design, query, or secure anything in this codebase, **YOU MUST FIRST CONSULT AND STRICTLY FOLLOW THE RELEVANT SKILLS IN `.agents/skills/` BEFORE WRITING ANY CODE.**

Do NOT rely on default assumptions or generic patterns when a specialized skill exists. Always read the relevant skill's `SKILL.md` to adopt the exact architecture, conventions, security guidelines, and performance practices documented.

---

### Skill Routing Matrix

Map every task to its corresponding skill in `.agents/skills/`:

| Domain / Task | Skills to Consult | Skill Path | Key Focus |
|---|---|---|---|
| **Supabase / Database / Migrations** | `supabase`<br>`supabase-postgres-best-practices` | `.agents/skills/supabase/`<br>`.agents/skills/supabase-postgres-best-practices/` | Schema design, migrations, RLS policies, indexing, `@supabase/ssr` auth, client patterns, RPC/functions. |
| **React & Next.js Performance** | `vercel-react-best-practices` | `.agents/skills/vercel-react-best-practices/` | Server/Client component boundaries, data fetching, bundle optimization, hydration, Next.js 16 conventions. |
| **Component Architecture** | `vercel-composition-patterns` | `.agents/skills/vercel-composition-patterns/` | Compound components, render props, clean props design, reusable component primitives (React 19). |
| **UI/UX & Design Intelligence** | `ui-ux-pro-max`<br>`frontend-design` | `.agents/skills/ui-ux-pro-max/`<br>`.agents/skills/frontend-design/` | Intentional visual design, typography, color palettes, spacing, modern layouts, micro-interactions, avoiding bland default templates. |
| **Web Guidelines & Accessibility** | `web-design-guidelines` | `.agents/skills/web-design-guidelines/` | Web Interface Guidelines, semantic HTML, ARIA, keyboard navigation, contrast, tap targets. |
| **Animations & Motion** | `animate` | `.agents/skills/animate/` | Motion design, transitions, timing curves, micro-interactions, exit/interrupt animations. |
| **Security & Authentication** | `owasp-security` | `.agents/skills/owasp-security/` | OWASP Top 10, XSS prevention, CSRF, secure cookie handling, input validation, SQL injection prevention. |
| **SEO & Discoverability** | `seo-audit` | `.agents/skills/seo-audit/` | Metadata, OpenGraph, structured data, canonical tags, sitemap, Core Web Vitals. |

---

### Execution Protocol

1. **Identify the Scope**: Before writing code, identify which domain(s) the task touches.
2. **Read the Skill(s)**: Inspect the relevant `.agents/skills/<skill-name>/SKILL.md` (and its reference files if needed).
3. **Follow Patterns Faithfully**: Implement the code adhering strictly to the patterns, rules, and constraints found in the skill.
4. **Follow Frontend Rules**: Always check and strictly follow all standards in [FRONTEND_RULES.md](file:///c:/laragon/www/cms/FRONTEND_RULES.md) (reuse `@/components/ui` primitives such as `Card`, `Input`, `PasswordInput`, `OtpInput`, `Button`, `Label`, `Alert`, `Checkbox`, `Select2`, `MultiSelect2`, `DataTable`, `Breadcrumb`, `FileUpload`, `ThemeToggle`; enforce Dark & Light Mode parity; enforce desktop/tablet/mobile responsiveness; enforce 60fps GPU-composited Next.js animations via `motion` `LazyMotion`/`domAnimation` or CSS without `transition-all` or `width`/`height` animations; and enforce CMS typography rules with `Inter` + `JetBrains Mono` via `next/font/google`, strict `text-xs`–`text-3xl` scale with `12px` floor and `16px` mobile inputs, weights `400–700`, `tabular-nums`, semantic heading hierarchy, and WCAG AA contrast).
5. **Cross-Check**: Verify against security (`owasp-security`) and accessibility (`web-design-guidelines`) before concluding the task.

---

## 🗄️ MANDATORY RULE: Database & Migrations (Edit Existing Migrations Only)

**DILARANG MENAMBAH FILE MIGRATION BARU SAAT MEMPERBAIKI ATAU MENGUBAH SKEMA YANG SUDAH ADA.**

1. **Edit Existing Migrations**:
   - Ketika ada perubahan tabel, kolom, constraint, fungsi, trigger, atau RLS, **SELALU edit file migration yang sudah ada** di `supabase/migrations/` (misalnya `0001_profiles_and_roles.sql`, `0009_email_otp_verification.sql`, dsb).
   - **JANGAN** membuat file migrasi bertumpuk/inkremental baru (seperti `0010_...`, `0011_...`, dll.) kecuali secara eksplisit diminta untuk membuat modul fitur tabel baru dari nol.
2. **Jaga Kebersihan Schema**:
   - File migrasi harus tetap bersih, modular, dan menjadi *single source of truth*.
3. **Sinkronisasi**:
   - Setelah mengedit file migrasi yang bersangkutan, jalankan eksekusi query ke database Supabase dan perbarui tipe data TypeScript via `npm run db:types`.

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
