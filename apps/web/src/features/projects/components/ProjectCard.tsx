'use client';

import Link from 'next/link';
import { Project } from '../api/projectApi';
import { Kanban, ListChecks, Users, Clock } from '@phosphor-icons/react';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.key.toLowerCase()}/board`}
      className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-accent-500/50 dark:hover:border-accent-500/50 transition-all group flex flex-col justify-between space-y-4 shadow-2xs"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/60 px-2 py-0.5 rounded">
            {project.key}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
              project.type === 'scrum'
                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {project.type === 'scrum' ? <ListChecks size={12} /> : <Kanban size={12} />}
            <span>{project.type}</span>
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
          {project.name}
        </h3>

        {project.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users size={14} />
            <span>{project.members_count || 1} thành viên</span>
          </span>
        </div>
        <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
          <Clock size={13} />
          <span>{project.updated_at}</span>
        </span>
      </div>
    </Link>
  );
}
