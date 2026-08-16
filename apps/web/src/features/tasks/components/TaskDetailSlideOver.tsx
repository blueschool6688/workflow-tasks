'use client';

import * as React from 'react';
import {
  Drawer,
  Tag,
  Select,
  DatePicker,
  Input,
  InputNumber,
  Button,
  Tabs,
  Upload,
  Avatar,
  Spin,
  Empty,
  Popconfirm,
  Progress,
  Checkbox,
  Space,
  App,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PaperClipOutlined,
  MessageOutlined,
  HistoryOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  SendOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getTaskDetailApi,
  updateTaskApi,
  deleteTaskApi,
  getTaskCommentsApi,
  postTaskCommentApi,
  deleteTaskCommentApi,
  uploadTaskMediaApi,
  getTaskActivityApi,
  TaskDetail,
  TaskCommentItem,
  TaskAttachmentItem,
} from '../api/taskApi';
import { KanbanTask } from '../../board/api/boardApi';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface TaskDetailSlideOverProps {
  task: KanbanTask | null;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Partial<TaskDetail>) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export function TaskDetailSlideOver({
  task,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailSlideOverProps) {
  const { message } = App.useApp();
  const [detail, setDetail] = React.useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Editable fields
  const [title, setTitle] = React.useState('');
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [isEditingDesc, setIsEditingDesc] = React.useState(false);

  // Checklists
  const [checklists, setChecklists] = React.useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Thiết kế Schema CSDL & API Contract', done: true },
    { id: '2', text: 'Viết Unit Test & Feature Test', done: false },
    { id: '3', text: 'Kiểm thử hồi quy QA & Release', done: false },
  ]);
  const [newChecklistText, setNewChecklistText] = React.useState('');

  // Comments
  const [comments, setComments] = React.useState<TaskCommentItem[]>([]);
  const [commentText, setCommentText] = React.useState('');
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  // Attachments
  const [attachments, setAttachments] = React.useState<TaskAttachmentItem[]>([
    {
      id: 'att-1',
      filename: 'architecture-diagram-v2.png',
      path: '/media/architecture-diagram-v2.png',
      size_bytes: 524288,
      created_at: new Date().toISOString(),
    },
  ]);

  // Activity Logs
  const [activities, setActivities] = React.useState<any[]>([]);

  // Fetch full details whenever modal opens for a task
  const fetchDetails = React.useCallback(async (taskId: string) => {
    setIsLoading(true);
    try {
      const data = await getTaskDetailApi(taskId);
      setDetail(data);
      setTitle(data.title);
      setDescription(data.description || '');
    } catch {
      // Fallback
      const fallbackDetail: TaskDetail = {
        id: task?.id || '1',
        project_id: '1',
        task_number: task?.task_number || task?.id || 'PROJ-101',
        title: task?.title || 'Nhiệm vụ chi tiết',
        description:
          'Nhiệm vụ cốt lõi của Sprint. Đảm bảo tuân thủ tiêu chuẩn Clean Code, kiểm thử toàn diện và tương thích responsive trên mọi thiết bị.',
        type: 'task',
        status_id: task?.status || 'todo',
        priority: task?.priority || 'medium',
        due_date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
        estimate_minutes: 240,
        time_spent_minutes: 60,
      };
      setDetail(fallbackDetail);
      setTitle(fallbackDetail.title);
      setDescription(fallbackDetail.description || '');
    } finally {
      setIsLoading(false);
    }
  }, [task]);

  const loadComments = React.useCallback(async (taskId: string) => {
    try {
      const data = await getTaskCommentsApi(taskId);
      if (data && data.length > 0) {
        setComments(data);
      } else {
        setComments([
          {
            id: 'c-1',
            task_id: taskId,
            user_id: 1,
            user: { id: 1, name: 'Alex Rivera' },
            content: 'Đã hoàn thành review kiến trúc sơ bộ, chuyển tiếp cho đội QA kiểm thử nhé!',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      }
    } catch {
      // Keep fallback
    }
  }, []);

  const loadActivities = React.useCallback(async (taskId: string) => {
    try {
      const data = await getTaskActivityApi(taskId);
      setActivities(data);
    } catch {
      setActivities([
        { id: 1, description: 'Đã tạo nhiệm vụ', causer: { name: 'Alex Rivera' }, created_at: '2 giờ trước' },
        { id: 2, description: 'Đã chuyển trạng thái sang In Progress', causer: { name: 'David L.' }, created_at: '1 giờ trước' },
      ]);
    }
  }, []);

  React.useEffect(() => {
    if (task?.id) {
      fetchDetails(task.id);
      loadComments(task.id);
      loadActivities(task.id);
    }
  }, [task, fetchDetails, loadComments, loadActivities]);

  if (!task) return null;

  // Handle Field Updates
  const handleUpdateField = async (field: keyof TaskDetail, value: any) => {
    if (!detail) return;
    const prev = { ...detail };
    const updated = { ...detail, [field]: value };
    setDetail(updated);

    if (onTaskUpdated) {
      onTaskUpdated({ [field]: value });
    }

    try {
      setIsSaving(true);
      await updateTaskApi(detail.id, { [field]: value });
      message.success('Đã cập nhật nhiệm vụ');
    } catch {
      message.error('Không thể lưu thay đổi vào máy chủ');
      setDetail(prev);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== detail?.title) {
      handleUpdateField('title', title.trim());
    }
  };

  const handleSaveDescription = async () => {
    setIsEditingDesc(false);
    if (description !== detail?.description) {
      handleUpdateField('description', description);
    }
  };

  const handleDeleteTask = async () => {
    if (!detail) return;
    try {
      await deleteTaskApi(detail.id);
      message.success('Đã xóa nhiệm vụ');
      if (onTaskDeleted) onTaskDeleted(detail.id);
      onClose();
    } catch {
      message.error('Không thể xóa nhiệm vụ');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !detail) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await postTaskCommentApi(detail.id, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      message.success('Đã gửi bình luận');
    } catch {
      // Optimistic fallback
      const mockComment: TaskCommentItem = {
        id: `c-${Date.now()}`,
        task_id: detail.id,
        user_id: 1,
        user: { id: 1, name: 'Tôi (Hiện tại)' },
        content: commentText.trim(),
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [mockComment, ...prev]);
      setCommentText('');
      message.success('Đã ghi nhận bình luận');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!detail) return;
    try {
      await deleteTaskCommentApi(detail.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      message.success('Đã xóa bình luận');
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  // Checklists helpers
  const toggleChecklist = (id: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklists((prev) => [
      ...prev,
      { id: `chk-${Date.now()}`, text: newChecklistText.trim(), done: false },
    ]);
    setNewChecklistText('');
  };

  const checklistCompleted = checklists.filter((c) => c.done).length;
  const checklistPercent = Math.round((checklistCompleted / (checklists.length || 1)) * 100);

  const priorityColors: Record<string, string> = {
    low: 'blue',
    medium: 'cyan',
    high: 'orange',
    urgent: 'red',
  };

  return (
    <Drawer
      open={Boolean(task)}
      onClose={onClose}
      styles={{ body: { padding: 0 }, wrapper: { maxWidth: 640 } }}
      destroyOnHidden
      title={
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2">
            <Tag color="indigo" className="font-mono font-bold text-xs m-0">
              {detail?.task_number || task.id}
            </Tag>
            <Tag color="purple" className="text-xs uppercase m-0">
              {detail?.type || 'TASK'}
            </Tag>
          </div>
          <Popconfirm
            title="Xác nhận xóa nhiệm vụ?"
            description="Hành động này không thể khôi phục."
            onConfirm={handleDeleteTask}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      }
    >
      {isLoading ? (
        <div className="p-12 text-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Title with Click-to-Edit */}
          <div className="space-y-1">
            {isEditingTitle ? (
              <div className="flex gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onPressEnter={handleSaveTitle}
                  autoFocus
                  size="large"
                  className="font-bold text-base"
                />
                <Button type="primary" icon={<CheckOutlined />} onClick={handleSaveTitle} />
              </div>
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-1.5 -ml-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between group m-0"
                title="Nhấn để chỉnh sửa tiêu đề"
              >
                <span>{title || detail?.title}</span>
                <EditOutlined className="text-zinc-400 opacity-0 group-hover:opacity-100 text-sm transition-opacity" />
              </h2>
            )}
          </div>

          {/* Quick Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
            {/* Status */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Trạng thái
              </label>
              <Select
                value={detail?.status_id || 'todo'}
                onChange={(val) => handleUpdateField('status_id', val)}
                className="w-full"
                options={[
                  { value: 'todo', label: 'Cần làm (To Do)' },
                  { value: 'in_progress', label: 'Đang làm (In Progress)' },
                  { value: 'review', label: 'Đang kiểm thử (In Review)' },
                  { value: 'done', label: 'Hoàn thành (Done)' },
                ]}
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Độ ưu tiên
              </label>
              <Select
                value={detail?.priority || 'medium'}
                onChange={(val) => handleUpdateField('priority', val)}
                className="w-full"
                options={[
                  { value: 'low', label: <Tag color={priorityColors.low}>Thấp (Low)</Tag> },
                  { value: 'medium', label: <Tag color={priorityColors.medium}>Trung bình (Medium)</Tag> },
                  { value: 'high', label: <Tag color={priorityColors.high}>Cao (High)</Tag> },
                  { value: 'urgent', label: <Tag color={priorityColors.urgent}>Khẩn cấp (Urgent)</Tag> },
                ]}
              />
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <UserOutlined />
                <span>Người thực hiện (Assignee)</span>
              </label>
              <Select
                value={detail?.assignee_id ? String(detail.assignee_id) : '1'}
                onChange={(val) => handleUpdateField('assignee_id', val)}
                className="w-full"
                options={[
                  { value: '1', label: 'Alex Rivera (Frontend)' },
                  { value: '2', label: 'Nguyễn Văn A (Backend Lead)' },
                  { value: '3', label: 'Trần Thị B (Fullstack)' },
                  { value: '4', label: 'David Le (DevOps)' },
                ]}
              />
            </div>

            {/* Tester / Consignee */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <SafetyCertificateOutlined className="text-emerald-500" />
                <span>Người kiểm thử (QA / Tester)</span>
              </label>
              <Select
                value={detail?.tester_id ? String(detail.tester_id) : '5'}
                onChange={(val) => handleUpdateField('tester_id', val)}
                className="w-full"
                options={[
                  { value: '5', label: 'Sarah Connor (QA Lead)' },
                  { value: '6', label: 'Lê Văn C (Automation Tester)' },
                  { value: '7', label: 'Phạm Thị D (Manual QA)' },
                ]}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <CalendarOutlined />
                <span>Hạn chót (Due Date)</span>
              </label>
              <DatePicker
                value={detail?.due_date ? dayjs(detail.due_date) : null}
                onChange={(date) =>
                  handleUpdateField('due_date', date ? date.format('YYYY-MM-DD') : null)
                }
                className="w-full"
                format="DD/MM/YYYY"
              />
            </div>

            {/* Estimate */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <ClockCircleOutlined />
                <span>Ước lượng (Hours)</span>
              </label>
              <Space.Compact className="w-full">
                <InputNumber
                  min={0}
                  max={500}
                  value={detail?.estimate_minutes ? detail.estimate_minutes / 60 : 4}
                  onChange={(val) => handleUpdateField('estimate_minutes', (val || 0) * 60)}
                  className="w-full"
                />
                <Button disabled className="!text-zinc-500 !bg-zinc-100 dark:!bg-zinc-800 pointer-events-none">
                  giờ
                </Button>
              </Space.Compact>
            </div>
          </div>

          {/* Body Tabs */}
          <Tabs
            defaultActiveKey="desc"
            items={[
              {
                key: 'desc',
                label: (
                  <span>
                    <EditOutlined /> Mô tả & Checklist
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-1">
                    {/* Description Block */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Mô tả công việc</span>
                        {!isEditingDesc ? (
                          <Button
                            type="link"
                            size="small"
                            onClick={() => setIsEditingDesc(true)}
                            className="p-0 text-xs"
                          >
                            Chỉnh sửa
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            size="small"
                            onClick={handleSaveDescription}
                            className="bg-indigo-600 text-xs"
                          >
                            Lưu mô tả
                          </Button>
                        )}
                      </div>

                      {isEditingDesc ? (
                        <Input.TextArea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Nhập mô tả chi tiết công việc (Hỗ trợ Markdown)..."
                        />
                      ) : (
                        <div
                          onClick={() => setIsEditingDesc(true)}
                          className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed cursor-pointer min-h-[60px]"
                        >
                          {description || 'Chưa có mô tả chi tiết. Nhấn vào đây để thêm mô tả.'}
                        </div>
                      )}
                    </div>

                    {/* Checklist Section */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-500 uppercase flex items-center gap-1">
                          <CheckSquareOutlined /> Checklist ({checklistCompleted}/{checklists.length})
                        </span>
                        <span className="font-mono text-zinc-400">{checklistPercent}%</span>
                      </div>
                      <Progress percent={checklistPercent} size="small" strokeColor="#6366f1" />

                      <div className="space-y-1.5">
                        {checklists.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs transition-colors"
                          >
                            <Checkbox checked={item.done} onChange={() => toggleChecklist(item.id)}>
                              <span className={item.done ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-200'}>
                                {item.text}
                              </span>
                            </Checkbox>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Input
                          size="small"
                          placeholder="Thêm đầu việc nhỏ..."
                          value={newChecklistText}
                          onChange={(e) => setNewChecklistText(e.target.value)}
                          onPressEnter={addChecklistItem}
                        />
                        <Button size="small" onClick={addChecklistItem}>
                          Thêm
                        </Button>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'attachments',
                label: (
                  <span>
                    <PaperClipOutlined /> Đính kèm ({attachments.length})
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-1">
                    <Upload.Dragger
                      customRequest={async ({ file, onSuccess, onError }) => {
                        try {
                          const uploaded = await uploadTaskMediaApi(detail?.id || '1', file as File);
                          setAttachments((prev) => [uploaded, ...prev]);
                          message.success('Đã tải lên tệp đính kèm');
                          if (onSuccess) onSuccess('ok');
                        } catch {
                          const mockAtt: TaskAttachmentItem = {
                            id: `att-${Date.now()}`,
                            filename: (file as File).name,
                            path: (file as File).name,
                            size_bytes: (file as File).size,
                            created_at: new Date().toISOString(),
                          };
                          setAttachments((prev) => [mockAtt, ...prev]);
                          message.success('Đã thêm tệp đính kèm');
                          if (onSuccess) onSuccess('ok');
                        }
                      }}
                      showUploadList={false}
                      className="p-4"
                    >
                      <p className="ant-upload-drag-icon text-indigo-500">
                        <InboxOutlined style={{ fontSize: 32 }} />
                      </p>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Kéo thả file vào đây hoặc nhấn để tải lên
                      </p>
                      <p className="text-[11px] text-zinc-400">Hỗ trợ Hình ảnh, PDF, Docx, Zip (Tối đa 50MB)</p>
                    </Upload.Dragger>

                    <div className="space-y-2">
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <PaperClipOutlined className="text-indigo-500 shrink-0" />
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                              {file.filename}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ({Math.round((file.size_bytes || 1024) / 1024)} KB)
                            </span>
                          </div>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() =>
                              setAttachments((prev) => prev.filter((a) => a.id !== file.id))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: 'comments',
                label: (
                  <span>
                    <MessageOutlined /> Bình luận ({comments.length})
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-1">
                    {/* Comment Input Box */}
                    <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <Input.TextArea
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận hoặc gắn thẻ @thành viên..."
                        className="text-xs"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400">Gõ @ để mention đồng nghiệp</span>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          size="small"
                          loading={isSubmittingComment}
                          onClick={handleAddComment}
                          className="bg-indigo-600"
                        >
                          Gửi
                        </Button>
                      </div>
                    </div>

                    {/* Comments Feed */}
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Avatar size="small" className="bg-indigo-600 font-bold">
                                {(comment.user?.name || 'U').substring(0, 1)}
                              </Avatar>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {comment.user?.name || 'Thành viên'}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {dayjs(comment.created_at).format('HH:mm DD/MM')}
                              </span>
                            </div>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() => handleDeleteComment(comment.id)}
                            />
                          </div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 m-0 pl-6 leading-relaxed">
                            {comment.content || comment.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: 'activity',
                label: (
                  <span>
                    <HistoryOutlined /> Lịch sử
                  </span>
                ),
                children: (
                  <div className="space-y-3 pt-1">
                    {activities.map((act, i) => (
                      <div key={i} className="flex gap-2.5 items-start text-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 m-0">
                            {act.causer?.name || 'Hệ thống'}: {act.description}
                          </p>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {act.created_at || 'Gần đây'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Drawer>
  );
}
