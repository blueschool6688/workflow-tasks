'use client';

import * as React from 'react';
import { getProjectsApi, Project } from '../api/projectApi';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { Plus, MagnifyingGlass, Folders, CircleNotch } from '@phosphor-icons/react';

export function ProjectListPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProjectsApi();
      setProjects(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Folders size={24} className="text-accent-500" />
            <span>Danh sách Dự án</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quản lý các dự án Agile Scrum và Bảng Kanban theo Workspace.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 rounded-lg focus-ring tactile-btn flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tạo dự án mới</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="relative w-full sm:w-72">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã dự án..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg focus-ring text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['all', 'scrum', 'kanban'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterType === t
                  ? 'bg-accent-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {t === 'all' ? 'Tất cả' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 animate-skeleton-pulse"
            >
              <div className="flex justify-between">
                <div className="w-12 h-5 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-16 h-5 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="w-3/4 h-6 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-full h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl space-y-3">
          <Folders size={40} className="mx-auto text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Chưa tìm thấy dự án nào
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc tạo dự án mới đầu tiên cho workspace này.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-accent-600 hover:bg-accent-700 rounded-lg focus-ring inline-flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Tạo dự án mới</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Modal Create */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
