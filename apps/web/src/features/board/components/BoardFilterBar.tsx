'use client';

import * as React from 'react';
import { Input, Select, Button, Tag } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  BranchesOutlined,
  ClearOutlined,
  FilterOutlined,
} from '@ant-design/icons';

interface BoardFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
  selectedStatus?: string | null;
  onStatusChange?: (status: string | null) => void;
  selectedAssignee?: string | null;
  onAssigneeChange?: (assignee: string | null) => void;
  selectedTester?: string | null;
  onTesterChange?: (tester: string | null) => void;
  selectedSprint?: string | null;
  onSprintChange?: (sprint: string | null) => void;
  onClear: () => void;
}

export function BoardFilterBar({
  search,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  selectedAssignee,
  onAssigneeChange,
  selectedTester,
  onTesterChange,
  selectedSprint,
  onSprintChange,
  onClear,
}: BoardFilterBarProps) {
  const hasFilter =
    search.trim().length > 0 ||
    selectedPriority !== null ||
    (selectedStatus && selectedStatus !== 'all') ||
    (selectedAssignee && selectedAssignee !== 'all') ||
    (selectedTester && selectedTester !== 'all') ||
    (selectedSprint && selectedSprint !== 'all');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search by Key or Title */}
        <Input
          prefix={<SearchOutlined className="text-zinc-400" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm mã task (PROJ-101) hoặc tên..."
          className="w-full sm:w-56"
          size="middle"
          allowClear
        />

        {/* Status Filter */}
        {onStatusChange && (
          <Select
            value={selectedStatus || 'all'}
            onChange={(val) => onStatusChange(val === 'all' ? null : val)}
            className="w-36"
            size="middle"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'todo', label: 'Cần làm (To Do)' },
              { value: 'in_progress', label: 'Đang làm' },
              { value: 'review', label: 'Đang kiểm thử' },
              { value: 'done', label: 'Hoàn thành' },
            ]}
          />
        )}

        {/* Priority Filter */}
        <Select
          value={selectedPriority || 'all'}
          onChange={(val) => onPriorityChange(val === 'all' ? null : val)}
          className="w-32"
          size="middle"
          options={[
            { value: 'all', label: 'Độ ưu tiên' },
            { value: 'urgent', label: <Tag color="red">Khẩn cấp</Tag> },
            { value: 'high', label: <Tag color="orange">Cao</Tag> },
            { value: 'medium', label: <Tag color="cyan">Trung bình</Tag> },
            { value: 'low', label: <Tag color="blue">Thấp</Tag> },
          ]}
        />

        {/* Assignee Filter */}
        {onAssigneeChange && (
          <Select
            value={selectedAssignee || 'all'}
            onChange={(val) => onAssigneeChange(val === 'all' ? null : val)}
            className="w-40"
            size="middle"
            options={[
              { value: 'all', label: 'Người thực hiện' },
              { value: 'Alex', label: 'Alex Rivera' },
              { value: 'Nguyen', label: 'Nguyễn Văn A' },
              { value: 'Tran', label: 'Trần Thị B' },
              { value: 'David', label: 'David Le' },
            ]}
          />
        )}

        {/* QA / Tester Filter */}
        {onTesterChange && (
          <Select
            value={selectedTester || 'all'}
            onChange={(val) => onTesterChange(val === 'all' ? null : val)}
            className="w-40"
            size="middle"
            options={[
              { value: 'all', label: 'Người kiểm thử (QA)' },
              { value: 'Sarah', label: 'Sarah Connor' },
              { value: 'Le', label: 'Lê Văn C' },
              { value: 'Pham', label: 'Phạm Thị D' },
            ]}
          />
        )}

        {/* Sprint Filter */}
        {onSprintChange && (
          <Select
            value={selectedSprint || 'all'}
            onChange={(val) => onSprintChange(val === 'all' ? null : val)}
            className="w-36"
            size="middle"
            options={[
              { value: 'all', label: 'Tất cả Sprint' },
              { value: 'sprint-24', label: 'Sprint 24 (Active)' },
              { value: 'sprint-25', label: 'Sprint 25' },
              { value: 'backlog', label: 'Backlog' },
            ]}
          />
        )}
      </div>

      {hasFilter && (
        <Button
          type="text"
          danger
          icon={<ClearOutlined />}
          size="small"
          onClick={onClear}
          className="text-xs"
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
