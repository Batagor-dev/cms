import {
  TimeTrackedCard,
  ProjectProgressCard,
  KpiPerformanceCard,
  TaskOverviewCard,
  WorkActivityCard,
} from '@/features/dashboard/components'

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight leading-tight text-zinc-950 dark:text-zinc-50">
          Dashboard Overview
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal max-w-prose">
          Ringkasan performa konten, progres proyek, tugas aktif, dan aktivitas tim di Techarea Production CMS.
        </p>
      </div>

      {/* Top Grid: Time Tracked + Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <TimeTrackedCard />
        </div>
        <div className="min-w-0 lg:col-span-5 xl:col-span-4">
          <ProjectProgressCard />
        </div>
      </div>

      {/* Bottom Grid: KPI Performance + Task Overview + Work Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <div className="min-w-0">
          <KpiPerformanceCard />
        </div>
        <div className="min-w-0">
          <TaskOverviewCard />
        </div>
        <div className="min-w-0 md:col-span-2 lg:col-span-1">
          <WorkActivityCard />
        </div>
      </div>
    </div>
  )
}
