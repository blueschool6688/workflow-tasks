'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Tag, Avatar } from 'antd';
import { UserOutlined, ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Project } from '../api/projectApi';

export function ProjectCard({ project }: { project: Project }) {
  const isScrum = project.type === 'scrum';

  return (
    <Link href={`/projects/${project.key.toLowerCase()}/board`}>
      <Card
        hoverable
        className="shadow-2xs transition-all h-full flex flex-col justify-between"
        title={
          <div className="flex items-center justify-between py-1">
            <Tag color="indigo" className="font-mono font-bold m-0">
              {project.key}
            </Tag>
            <Tag color={isScrum ? 'purple' : 'cyan'} className="uppercase text-[10px] m-0">
              {project.type}
            </Tag>
          </div>
        }
      >
        <div className="space-y-2 mb-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 m-0">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-zinc-500 line-clamp-2 m-0 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className="flex items-center gap-1">
            <UserOutlined className="text-indigo-500" />
            <span>{project.members_count || 1} thành viên</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <ClockCircleOutlined />
            <span>{project.updated_at || 'Mới cập nhật'}</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
