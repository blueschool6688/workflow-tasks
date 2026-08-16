'use client';

import * as React from 'react';
import {
  Kanban,
  ListBullets,
  CalendarBlank,
  ChartLineUp,
  Gear,
  Plus,
  MagnifyingGlass,
  Bell,
  CheckCircle,
  Clock,
  WarningCircle,
  Moon,
  Sun,
  Folders,
  Lightning,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { Button } from '@tasks/ui';
import { Badge } from '@tasks/ui';

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<'board' | 'list' | 'calendar' | 'analytics'>('board');

  const stats = [
    { label: 'Active Projects', value: '8', icon: Folders, change: '+2 this month' },
    { label: 'In Progress Tasks', value: '24', icon: Clock, change: '6 due this week' },
    { label: 'Completed Sprints', value: '14', icon: CheckCircle, change: '98% velocity' },
    { label: 'Automation Rules', value: '12', icon: Lightning, change: 'Active' },
  ];

  const sampleColumns = [
    {
      id: 'todo',
      title: 'To Do',
      count: 3,
      tasks: [
        { id: 'PROJ-101', title: 'Design Multi-tenant Organization Schema', priority: 'high', estimate: '4h', assignee: 'Alex K.' },
        { id: 'PROJ-102', title: 'Implement RBAC Policies & Gates in Laravel', priority: 'urgent', estimate: '6h', assignee: 'Sarah T.' },
        { id: 'PROJ-103', title: 'Setup Reverb WebSocket Broadcasting', priority: 'medium', estimate: '3h', assignee: 'Alex K.' },
      ],
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      count: 2,
      tasks: [
        { id: 'PROJ-98', title: 'Build Dynamic Workflow Transition Engine', priority: 'urgent', estimate: '8h', assignee: 'David L.' },
        { id: 'PROJ-99', title: 'Kanban Drag-and-Drop with dnd-kit', priority: 'high', estimate: '5h', assignee: 'Elena R.' },
      ],
    },
    {
      id: 'review',
      title: 'In Review',
      count: 1,
      tasks: [
        { id: 'PROJ-95', title: 'Scramble OpenAPI & TypeScript Sync Pipeline', priority: 'medium', estimate: '2h', assignee: 'Alex K.' },
      ],
    },
    {
      id: 'done',
      title: 'Completed',
      count: 4,
      tasks: [
        { id: 'PROJ-90', title: 'Monorepo Workspace & Turborepo Configuration', priority: 'medium', estimate: '3h', assignee: 'David L.' },
        { id: 'PROJ-91', title: 'Laravel 11 Backend & Docker PostgreSQL Setup', priority: 'high', estimate: '4h', assignee: 'Sarah T.' },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Workspace Switcher */}
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
            <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              T
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">Tasks HQ</h2>
              <p className="text-xs text-zinc-500 truncate">Core Engineering</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {[
              { id: 'board', label: 'Kanban Board', icon: Kanban },
              { id: 'list', label: 'Task List', icon: ListBullets },
              { id: 'calendar', label: 'Timeline & Calendar', icon: CalendarBlank },
              { id: 'analytics', label: 'Dashboard & Reports', icon: ChartLineUp },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Settings */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-zinc-500 font-medium">Theme</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">Alex K.</p>
              <p className="text-[11px] text-zinc-500 truncate">Lead Architect</p>
            </div>
            <Gear size={16} className="text-zinc-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Platform Architecture & Core V1
            </h1>
            <Badge variant="neutral">PROJ-V1</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlass size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tasks, issues... (Press /)"
                className="h-8 pl-8 pr-3 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56 transition"
              />
            </div>
            <button className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600" />
            </button>
            <Button size="sm" className="gap-1.5">
              <Plus size={14} weight="bold" />
              New Task
            </Button>
          </div>
        </header>

        {/* Dashboard / Board View Content */}
        <div className="flex-1 p-6 overflow-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-xs font-medium">{stat.label}</span>
                    <Icon size={18} className="text-zinc-400" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {stat.value}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {stat.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kanban Columns */}
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {sampleColumns.map((col) => (
              <div
                key={col.id}
                className="w-72 shrink-0 rounded-lg bg-zinc-100/70 dark:bg-zinc-900/40 p-3 border border-zinc-200/50 dark:border-zinc-800/50 space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      {col.title}
                    </h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {col.count}
                    </span>
                  </div>
                  <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition">
                    <Plus size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  {col.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition font-medium">
                          {task.id}
                        </span>
                        <Badge
                          variant={
                            task.priority === 'urgent'
                              ? 'danger'
                              : task.priority === 'high'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.estimate}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                          {task.assignee.slice(0, 1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
