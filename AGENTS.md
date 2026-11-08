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
4. **Cross-Check**: Verify against security (`owasp-security`) and accessibility (`web-design-guidelines`) before concluding the task.

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
