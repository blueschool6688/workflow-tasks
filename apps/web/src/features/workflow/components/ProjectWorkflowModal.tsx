'use client';

import * as React from 'react';
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Tag,
  Space,
  App,
  Card,
  Popconfirm,
  Tooltip,
  Divider,
  Alert,
} from 'antd';
import {
  ApartmentOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  BranchesOutlined,
  InfoCircleOutlined,
  SlidersOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import {
  getProjectWorkflowApi,
  createProjectStatusApi,
  updateProjectStatusApi,
  deleteProjectStatusApi,
  createProjectTransitionApi,
  deleteProjectTransitionApi,
  ProjectWorkflowData,
  WorkflowStatusItem,
  WorkflowTransitionItem,
} from '../api/workflowApi';

const COLOR_PRESETS = [
  { label: 'Xám Slate', value: '#64748b' },
  { label: 'Xanh Lam', value: '#3b82f6' },
  { label: 'Tím Indigo', value: '#6366f1' },
  { label: 'Tím Violet', value: '#8b5cf6' },
  { label: 'Hồng Fuchsia', value: '#d946ef' },
  { label: 'Xanh Lá', value: '#10b981' },
  { label: 'Vàng Hổ Phách', value: '#f59e0b' },
  { label: 'Cam Đỏ', value: '#f97316' },
  { label: 'Đỏ Ruby', value: '#ef4444' },
];

const CATEGORY_MAP = {
  todo: { label: 'To Do (Chờ làm)', color: 'default', icon: <ClockCircleOutlined /> },
  in_progress: { label: 'In Progress (Đang thực hiện)', color: 'processing', icon: <BranchesOutlined /> },
  done: { label: 'Done (Hoàn thành)', color: 'success', icon: <CheckCircleOutlined /> },
  cancelled: { label: 'Cancelled (Đã hủy)', color: 'error', icon: <StopOutlined /> },
};

interface ProjectWorkflowModalProps {
  open: boolean;
  projectKey: string;
  onClose: () => void;
  onWorkflowUpdated?: () => void;
}

export function ProjectWorkflowModal({
  open,
  projectKey,
  onClose,
  onWorkflowUpdated,
}: ProjectWorkflowModalProps) {
  const { message } = App.useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const [workflow, setWorkflow] = React.useState<ProjectWorkflowData | null>(null);
  const [canManage, setCanManage] = React.useState(true);

  // Status Form Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [editingStatus, setEditingStatus] = React.useState<WorkflowStatusItem | null>(null);
  const [statusForm] = Form.useForm();
  const [isSubmittingStatus, setIsSubmittingStatus] = React.useState(false);

  // Transition Form Modal
  const [isTransitionModalOpen, setIsTransitionModalOpen] = React.useState(false);
  const [transitionForm] = Form.useForm();
  const [isSubmittingTransition, setIsSubmittingTransition] = React.useState(false);

  const fetchWorkflow = React.useCallback(async () => {
    if (!open) return;
    setIsLoading(true);
    try {
      const res = await getProjectWorkflowApi(projectKey);
      setWorkflow(res.data);
      setCanManage(res.can_manage_workflow);
    } catch {
      message.error('Không thể tải thông tin quy trình của dự án');
    } finally {
      setIsLoading(false);
    }
  }, [open, projectKey, message]);

  React.useEffect(() => {
    if (open) {
      fetchWorkflow();
    }
  }, [open, fetchWorkflow]);

  // Open Status modal for Create or Edit
  const handleOpenStatusModal = (status?: WorkflowStatusItem) => {
    if (status) {
      setEditingStatus(status);
      statusForm.setFieldsValue({
        name: status.name,
        color: status.color,
        category: status.category,
        order: status.order,
      });
    } else {
      setEditingStatus(null);
      statusForm.resetFields();
      statusForm.setFieldsValue({
        color: '#6366f1',
        category: 'in_progress',
        order: (workflow?.statuses.length || 0) + 1,
      });
    }
    setIsStatusModalOpen(true);
  };

  // Submit Status Form
  const handleSubmitStatus = async (values: any) => {
    setIsSubmittingStatus(true);
    try {
      if (editingStatus) {
        await updateProjectStatusApi(projectKey, editingStatus.id, values);
        message.success(`Đã cập nhật trạng thái "${values.name}"`);
      } else {
        await createProjectStatusApi(projectKey, values);
        message.success(`Đã thêm trạng thái "${values.name}" vào quy trình`);
      }
      setIsStatusModalOpen(false);
      await fetchWorkflow();
      onWorkflowUpdated?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Thao tác không thành công');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Delete Status
  const handleDeleteStatus = async (statusId: string, statusName: string) => {
    try {
      await deleteProjectStatusApi(projectKey, statusId);
      message.success(`Đã xóa trạng thái "${statusName}"`);
      await fetchWorkflow();
      onWorkflowUpdated?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể xóa trạng thái');
    }
  };

  // Submit Transition Form
  const handleSubmitTransition = async (values: any) => {
    setIsSubmittingTransition(true);
    try {
      await createProjectTransitionApi(projectKey, values);
      message.success('Đã thêm quy tắc chuyển trạng thái');
      setIsTransitionModalOpen(false);
      transitionForm.resetFields();
      await fetchWorkflow();
      onWorkflowUpdated?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tạo quy tắc chuyển trạng thái');
    } finally {
      setIsSubmittingTransition(false);
    }
  };

  // Delete Transition
  const handleDeleteTransition = async (transitionId: string) => {
    try {
      await deleteProjectTransitionApi(projectKey, transitionId);
      message.success('Đã xóa quy tắc chuyển trạng thái');
      await fetchWorkflow();
      onWorkflowUpdated?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể xóa quy tắc');
    }
  };

  const statuses = workflow?.statuses || [];
  const transitions = workflow?.transitions || [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={850}
      title={
        <div className="flex items-center gap-2.5 text-base font-bold">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
            <ApartmentOutlined />
          </div>
          <div>
            <span className="text-zinc-900 dark:text-zinc-100">Thiết lập Quy trình (Workflow)</span>
            <div className="text-xs text-zinc-500 font-normal">
              Dự án: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{projectKey.toUpperCase()}</span> — {workflow?.name || 'Tùy chỉnh luồng công việc'}
            </div>
          </div>
        </div>
      }
      destroyOnClose
    >
      {!canManage && (
        <Alert
          type="warning"
          showIcon
          message="Chế độ chỉ xem (Read-only)"
          description="Chỉ Quản trị viên, Trưởng dự án (Project Lead) hoặc Người quản lý Sprint mới có quyền chỉnh sửa cấu hình quy trình."
          className="mb-4"
        />
      )}

      <Tabs
        defaultActiveKey="statuses"
        items={[
          {
            key: 'statuses',
            label: (
              <span className="flex items-center gap-1.5 font-semibold">
                <SlidersOutlined />
                <span>Cột trạng thái ({statuses.length})</span>
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    Cấu hình các cột hiển thị trên bảng Kanban và tiến độ của các nhiệm vụ trong dự án.
                  </div>
                  {canManage && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="bg-indigo-600 font-medium"
                      onClick={() => handleOpenStatusModal()}
                    >
                      Thêm trạng thái
                    </Button>
                  )}
                </div>

                {/* Statuses List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {statuses.map((status, index) => {
                    const catInfo = CATEGORY_MAP[status.category] || CATEGORY_MAP.in_progress;
                    return (
                      <div
                        key={status.id}
                        className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-bold flex items-center justify-center text-zinc-500 shrink-0">
                            {index + 1}
                          </span>
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: status.color }}
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {status.name}
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <Tag color={catInfo.color} className="text-[11px] m-0 py-0 flex items-center gap-1">
                                {catInfo.icon}
                                <span>{catInfo.label}</span>
                              </Tag>
                            </div>
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Tooltip title="Chỉnh sửa trạng thái">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleOpenStatusModal(status)}
                              />
                            </Tooltip>
                            {statuses.length > 2 && (
                              <Popconfirm
                                title="Xóa trạng thái này?"
                                description="Các nhiệm vụ thuộc cột này sẽ được tự động chuyển sang cột đầu tiên."
                                onConfirm={() => handleDeleteStatus(status.id, status.name)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Tooltip title="Xóa trạng thái">
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          },
          {
            key: 'transitions',
            label: (
              <span className="flex items-center gap-1.5 font-semibold">
                <NodeIndexOutlined />
                <span>Quy tắc chuyển đổi ({transitions.length})</span>
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    Định nghĩa các đường chuyển trạng thái hợp lệ khi kéo thả task (ví dụ: In Progress ➔ Code Review).
                  </div>
                  {canManage && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="bg-indigo-600 font-medium"
                      onClick={() => {
                        transitionForm.resetFields();
                        setIsTransitionModalOpen(true);
                      }}
                    >
                      Thêm quy tắc
                    </Button>
                  )}
                </div>

                {transitions.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                    <BranchesOutlined className="text-3xl text-zinc-400" />
                    <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Chưa cấu hình quy tắc giới hạn chuyển đổi
                    </div>
                    <div className="text-xs text-zinc-500 max-w-md mx-auto">
                      Hiện tại các task được phép kéo thả tự do giữa tất cả các cột trạng thái. Bạn có thể thêm các quy tắc để kiểm soát quy trình chặt chẽ hơn.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {transitions.map((t) => {
                      const fromStatus = statuses.find((s) => s.id === t.from_status_id);
                      const toStatus = statuses.find((s) => s.id === t.to_status_id);
                      return (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-semibold text-xs">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: fromStatus?.color || '#94a3b8' }}
                              />
                              <span>{fromStatus?.name || 'Trạng thái nguồn'}</span>
                            </div>

                            <ArrowRightOutlined className="text-indigo-500 text-xs" />

                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-semibold text-xs">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: toStatus?.color || '#94a3b8' }}
                              />
                              <span>{toStatus?.name || 'Trạng thái đích'}</span>
                            </div>

                            {t.name && (
                              <Tag color="blue" className="text-xs font-mono">
                                {t.name}
                              </Tag>
                            )}
                          </div>

                          {canManage && (
                            <Popconfirm
                              title="Xóa quy tắc chuyển đổi này?"
                              onConfirm={() => handleDeleteTransition(t.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'visualizer',
            label: (
              <span className="flex items-center gap-1.5 font-semibold">
                <ApartmentOutlined />
                <span>Sơ đồ luồng (Visualizer)</span>
              </span>
            ),
            children: (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="text-xs font-medium text-zinc-500 flex items-center gap-2">
                  <InfoCircleOutlined className="text-indigo-500" />
                  <span>Sơ đồ tuần tự các bước trong quy trình xử lý task của dự án:</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-4 px-2">
                  {statuses.map((s, idx) => (
                    <React.Fragment key={s.id}>
                      <div
                        className="px-4 py-3 rounded-xl border bg-white dark:bg-zinc-900 shadow-xs flex flex-col items-center min-w-[140px] text-center gap-1.5"
                        style={{ borderTop: `4px solid ${s.color}` }}
                      >
                        <span className="text-[11px] font-mono text-zinc-400">Bước {idx + 1}</span>
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{s.name}</span>
                        <Tag color={CATEGORY_MAP[s.category]?.color || 'default'} className="m-0 text-[10px]">
                          {CATEGORY_MAP[s.category]?.label.split(' ')[0] || s.category}
                        </Tag>
                      </div>

                      {idx < statuses.length - 1 && (
                        <div className="flex items-center justify-center px-1 text-indigo-500 font-bold text-sm shrink-0">
                          ➔
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* Modal Add / Edit Status */}
      <Modal
        open={isStatusModalOpen}
        onCancel={() => setIsStatusModalOpen(false)}
        title={editingStatus ? 'Chỉnh sửa Trạng thái' : 'Thêm Trạng thái mới'}
        onOk={() => statusForm.submit()}
        confirmLoading={isSubmittingStatus}
        okText={editingStatus ? 'Lưu thay đổi' : 'Thêm trạng thái'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={statusForm} layout="vertical" onFinish={handleSubmitStatus} className="pt-2">
          <Form.Item
            name="name"
            label="Tên trạng thái (Cột Kanban)"
            rules={[{ required: true, message: 'Vui lòng nhập tên trạng thái' }]}
          >
            <Input placeholder="Ví dụ: Code Review, QA Testing, Staging..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục (Tiến độ)"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select
              options={[
                { value: 'todo', label: 'To Do (Chờ thực hiện)' },
                { value: 'in_progress', label: 'In Progress (Đang thực hiện)' },
                { value: 'done', label: 'Done (Đã hoàn thành)' },
                { value: 'cancelled', label: 'Cancelled (Đã hủy / Bỏ qua)' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc đại diện"
            rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}
          >
            <Select
              options={COLOR_PRESETS.map((p) => ({
                value: p.value,
                label: (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: p.value }} />
                    <span>{p.label}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item name="order" label="Thứ tự hiển thị">
            <Input type="number" min={1} placeholder="1" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Add Transition */}
      <Modal
        open={isTransitionModalOpen}
        onCancel={() => setIsTransitionModalOpen(false)}
        title="Thêm Quy tắc Chuyển trạng thái"
        onOk={() => transitionForm.submit()}
        confirmLoading={isSubmittingTransition}
        okText="Tạo quy tắc"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={transitionForm} layout="vertical" onFinish={handleSubmitTransition} className="pt-2">
          <Form.Item
            name="from_status_id"
            label="Trạng thái nguồn (Bắt đầu)"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái nguồn' }]}
          >
            <Select
              placeholder="Chọn trạng thái nguồn"
              options={statuses.map((s) => ({
                value: s.id,
                label: (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.name}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="to_status_id"
            label="Trạng thái đích (Chuyển sang)"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái đích' }]}
          >
            <Select
              placeholder="Chọn trạng thái đích"
              options={statuses.map((s) => ({
                value: s.id,
                label: (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span>{s.name}</span>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item name="name" label="Tên quy tắc / Hành động (Tùy chọn)">
            <Input placeholder="Ví dụ: Gửi duyệt Code, Chuyển sang QA..." />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
}
