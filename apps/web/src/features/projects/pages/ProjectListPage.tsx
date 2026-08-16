'use client';

import * as React from 'react';
import { getProjectsApi, Project } from '../api/projectApi';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { Input, Select, Button, Spin, Empty, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, FolderOutlined } from '@ant-design/icons';

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
    } catch {
      // Fallback mock data if API is unseeded
      setProjects([
        {
          id: '1',
          key: 'CORE-ENG',
          name: 'Core Product Engineering',
          description: 'Nền tảng quản lý công việc và quy trình doanh nghiệp tập trung.',
          type: 'scrum',
          members_count: 6,
          updated_at: 'Hôm nay',
        },
        {
          id: '2',
          key: 'DESIGN',
          name: 'Product Design & System',
          description: 'Hệ thống thiết kế Ant Design UI và trải nghiệm người dùng.',
          type: 'kanban',
          members_count: 3,
          updated_at: 'Hôm qua',
        },
      ]);
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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 m-0">
            <FolderOutlined className="text-indigo-500" />
            <span>Danh sách Dự án</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Quản lý các dự án Agile Scrum và Bảng Kanban theo Workspace.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-indigo-600"
          onClick={() => setIsModalOpen(true)}
        >
          Tạo dự án mới
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <Input
          prefix={<SearchOutlined className="text-zinc-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc mã dự án (Key)..."
          className="w-full sm:w-80"
          size="middle"
        />

        <Select
          value={filterType}
          onChange={(val) => setFilterType(val)}
          className="w-full sm:w-48"
          size="middle"
          options={[
            { value: 'all', label: 'Tất cả loại dự án' },
            { value: 'scrum', label: 'Agile Scrum' },
            { value: 'kanban', label: 'Kanban Board' },
          ]}
        />
      </div>

      {/* Grid or Loading Skeleton */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-xs text-zinc-500 font-medium">Đang tải danh sách dự án...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Empty
            description="Chưa tìm thấy dự án nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-indigo-600"
              onClick={() => setIsModalOpen(true)}
            >
              Tạo dự án mới
            </Button>
          </Empty>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map((project) => (
            <Col xs={24} md={12} lg={8} key={project.id}>
              <ProjectCard project={project} />
            </Col>
          ))}
        </Row>
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
