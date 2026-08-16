'use client';

import * as React from 'react';
import {
  Modal,
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
  Popconfirm,
  Progress,
  App,
  Checkbox,
  Row,
  Col,
  Space,
  Table,
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
  BranchesOutlined,
  ThunderboltOutlined,
  PlusOutlined,
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
  getTaskWorkLogsApi,
  postTaskWorkLogApi,
  deleteTaskWorkLogApi,
  TaskDetail,
  TaskCommentItem,
  TaskAttachmentItem,
  TaskWorkLogItem,
} from '../api/taskApi';
import { KanbanTask } from '../../board/api/boardApi';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface TaskDetailModalProps {
  task: KanbanTask | null;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Partial<TaskDetail>) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export function TaskDetailModal({
  task,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailModalProps) {
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

  // Work Logs
  const [workLogs, setWorkLogs] = React.useState<TaskWorkLogItem[]>([]);
  const [logMinutes, setLogMinutes] = React.useState<number>(60);
  const [logDescription, setLogDescription] = React.useState<string>('');
  const [isSubmittingWorkLog, setIsSubmittingWorkLog] = React.useState<boolean>(false);

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
        task_number: task?.task_number || task?.id || 'CORE-ENG-101',
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

  const loadWorkLogs = React.useCallback(async (taskId: string) => {
    try {
      const data = await getTaskWorkLogsApi(taskId);
      if (data && data.length > 0) {
        setWorkLogs(data);
      } else {
        setWorkLogs([
          {
            id: 'wl-1',
            task_id: taskId,
            user_id: 1,
            user: { id: 1, name: 'Alex Rivera' },
            minutes_logged: 60,
            description: 'Thiết kế Schema và viết migration ban đầu',
            logged_at: new Date(Date.now() - 7200000).toISOString(),
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
      loadWorkLogs(task.id);
      loadActivities(task.id);
    }
  }, [task, fetchDetails, loadComments, loadWorkLogs, loadActivities]);

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
      setActivities((prevAct) => [
        {
          id: Date.now(),
          description: `Đã cập nhật trường ${String(field)}`,
          causer: { name: 'Tôi' },
          created_at: 'Vừa xong',
        },
        ...prevAct,
      ]);
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
      message.success('Đã xóa nhiệm vụ thành công');
      if (onTaskDeleted) {
        onTaskDeleted(detail.id);
      }
      onClose();
    } catch {
      message.error('Không thể xóa nhiệm vụ');
    }
  };

  // Comments
  const handleAddComment = async () => {
    if (!commentText.trim() || !detail) return;
    try {
      setIsSubmittingComment(true);
      const newComment = await postTaskCommentApi(detail.id, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      message.success('Đã gửi bình luận');
      setActivities((prevAct) => [
        {
          id: Date.now(),
          description: `Đã thêm bình luận: "${commentText.trim().substring(0, 40)}..."`,
          causer: { name: 'Tôi' },
          created_at: 'Vừa xong',
        },
        ...prevAct,
      ]);
    } catch {
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

  // Checklists with Worklogs & Activity Tracing
  const toggleChecklist = (id: string) => {
    const item = checklists.find((c) => c.id === id);
    const newDoneState = item ? !item.done : false;

    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: newDoneState } : c))
    );

    if (item) {
      const actionText = newDoneState
        ? `Đã hoàn thành mục checklist: "${item.text}"`
        : `Đã mở lại mục checklist: "${item.text}"`;

      message.success(actionText);

      // Add to activities
      setActivities((prevAct) => [
        {
          id: Date.now(),
          description: actionText,
          causer: { name: 'Tôi' },
          created_at: 'Vừa xong',
        },
        ...prevAct,
      ]);
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem = { id: `chk-${Date.now()}`, text: newChecklistText.trim(), done: false };
    setChecklists((prev) => [...prev, newItem]);
    setNewChecklistText('');
    message.success(`Đã thêm checklist: "${newItem.text}"`);

    // Add to activities
    setActivities((prevAct) => [
      {
        id: Date.now(),
        description: `Đã thêm mục checklist: "${newItem.text}"`,
        causer: { name: 'Tôi' },
        created_at: 'Vừa xong',
      },
      ...prevAct,
    ]);
  };

  const deleteChecklistItem = (id: string) => {
    const item = checklists.find((c) => c.id === id);
    setChecklists((prev) => prev.filter((c) => c.id !== id));
    if (item) {
      message.info(`Đã xóa mục checklist: "${item.text}"`);
      setActivities((prevAct) => [
        {
          id: Date.now(),
          description: `Đã xóa mục checklist: "${item.text}"`,
          causer: { name: 'Tôi' },
          created_at: 'Vừa xong',
        },
        ...prevAct,
      ]);
    }
  };

  // Work Logs
  const handleAddWorkLog = async () => {
    if (!detail || !logMinutes || logMinutes <= 0) {
      message.warning('Vui lòng nhập số phút làm việc hợp lệ');
      return;
    }

    try {
      setIsSubmittingWorkLog(true);
      const newLog = await postTaskWorkLogApi(
        detail.id,
        logMinutes,
        logDescription.trim() || undefined,
        new Date().toISOString()
      );

      setWorkLogs((prev) => [newLog, ...prev]);
      const newTotalMinutes = (detail.time_spent_minutes || 0) + logMinutes;
      setDetail((prev) => prev ? { ...prev, time_spent_minutes: newTotalMinutes } : null);
      if (onTaskUpdated) {
        onTaskUpdated({ time_spent_minutes: newTotalMinutes });
      }

      setLogDescription('');
      message.success(`Đã ghi nhận ${logMinutes} phút (${Math.round((logMinutes / 60) * 10) / 10}h) làm việc!`);

      // Add to activities
      setActivities((prevAct) => [
        {
          id: Date.now(),
          description: `Đã ghi nhận ${logMinutes} phút làm việc${logDescription ? `: "${logDescription}"` : ''}`,
          causer: { name: 'Tôi' },
          created_at: 'Vừa xong',
        },
        ...prevAct,
      ]);
    } catch {
      const mockLog: TaskWorkLogItem = {
        id: `wl-${Date.now()}`,
        task_id: detail.id,
        user_id: 1,
        user: { id: 1, name: 'Tôi (Hiện tại)' },
        minutes_logged: logMinutes,
        description: logDescription.trim() || 'Thực hiện nhiệm vụ',
        logged_at: new Date().toISOString(),
      };
      setWorkLogs((prev) => [mockLog, ...prev]);
      const newTotalMinutes = (detail.time_spent_minutes || 0) + logMinutes;
      setDetail((prev) => prev ? { ...prev, time_spent_minutes: newTotalMinutes } : null);
      setLogDescription('');
      message.success(`Đã ghi nhận ${logMinutes} phút làm việc`);
    } finally {
      setIsSubmittingWorkLog(false);
    }
  };

  const handleDeleteWorkLog = async (logId: string, minutes: number) => {
    if (!detail) return;
    try {
      await deleteTaskWorkLogApi(detail.id, logId);
      setWorkLogs((prev) => prev.filter((w) => w.id !== logId));
      const newTotalMinutes = Math.max(0, (detail.time_spent_minutes || 0) - minutes);
      setDetail((prev) => prev ? { ...prev, time_spent_minutes: newTotalMinutes } : null);
      message.success('Đã xóa lượt ghi log thời gian');
    } catch {
      setWorkLogs((prev) => prev.filter((w) => w.id !== logId));
      const newTotalMinutes = Math.max(0, (detail.time_spent_minutes || 0) - minutes);
      setDetail((prev) => prev ? { ...prev, time_spent_minutes: newTotalMinutes } : null);
    }
  };

  const checklistCompleted = checklists.filter((c) => c.done).length;
  const checklistPercent = Math.round((checklistCompleted / (checklists.length || 1)) * 100);

  const totalTimeSpentHours = Math.round(((detail?.time_spent_minutes || 0) / 60) * 10) / 10;
  const estimateHours = Math.round(((detail?.estimate_minutes || 240) / 60) * 10) / 10;
  const timeProgressPercent = Math.min(100, Math.round(((detail?.time_spent_minutes || 0) / (detail?.estimate_minutes || 240)) * 100));

  const priorityColors: Record<string, string> = {
    low: 'blue',
    medium: 'cyan',
    high: 'orange',
    urgent: 'red',
  };

  return (
    <Modal
      open={Boolean(task)}
      onCancel={onClose}
      footer={null}
      centered
      width={1000}
      destroyOnHidden
      title={
        <div className="flex items-center justify-between w-full pr-6 py-1">
          <div className="flex items-center gap-2">
            <Tag color="indigo" className="font-mono font-bold text-xs m-0">
              {detail?.task_number || task.id}
            </Tag>
            <Tag color="purple" className="text-xs uppercase m-0">
              {detail?.type || 'TASK'}
            </Tag>
            <span className="text-xs text-zinc-400 font-normal">
              Chi tiết nhiệm vụ dự án
            </span>
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
              Xóa nhiệm vụ
            </Button>
          </Popconfirm>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spin size="large" />
          <span className="text-xs text-zinc-500 font-medium">Đang tải thông tin chi tiết nhiệm vụ...</span>
        </div>
      ) : (
        <Row gutter={[24, 24]} className="pt-2">
          {/* Left Column: Title, Description, Checklists, Tabs (62% width) */}
          <Col xs={24} lg={15} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onPressEnter={handleSaveTitle}
                    size="large"
                    className="font-bold text-base"
                    autoFocus
                  />
                  <Button type="primary" icon={<CheckOutlined />} onClick={handleSaveTitle} className="bg-indigo-600">
                    Lưu
                  </Button>
                </div>
              ) : (
                <div
                  className="group flex items-start justify-between cursor-pointer p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 m-0 leading-snug">
                    {detail?.title || title}
                  </h2>
                  <EditOutlined className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                </div>
              )}
            </div>

            {/* Main Tabs */}
            <Tabs
              defaultActiveKey="content"
              items={[
                {
                  key: 'content',
                  label: (
                    <span>
                      <EditOutlined /> Mô tả & Checklist
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 pt-1">
                      {/* Description Rich Text Editor */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Mô tả công việc (Description)
                          </label>
                          {!isEditingDesc ? (
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => setIsEditingDesc(true)}
                              className="p-0 text-xs text-indigo-500"
                            >
                              Chỉnh sửa mô tả
                            </Button>
                          ) : (
                            <div className="flex gap-1">
                              <Button
                                size="small"
                                onClick={() => {
                                  setDescription(detail?.description || '');
                                  setIsEditingDesc(false);
                                }}
                              >
                                Hủy
                              </Button>
                              <Button
                                type="primary"
                                size="small"
                                onClick={handleSaveDescription}
                                loading={isSaving}
                                className="bg-indigo-600"
                              >
                                Lưu mô tả
                              </Button>
                            </div>
                          )}
                        </div>

                        {isEditingDesc ? (
                          <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Nhập nội dung mô tả chi tiết, checklists, code blocks, bảng biểu..."
                            minRows={6}
                          />
                        ) : (
                          <div
                            onClick={() => setIsEditingDesc(true)}
                            className="cursor-pointer"
                          >
                            <RichTextEditor
                              value={description || 'Chưa có mô tả chi tiết. Nhấn vào đây để mở trình soạn thảo nội dung.'}
                              readOnly={true}
                            />
                          </div>
                        )}
                      </div>

                      {/* Checklist Section */}
                      <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-600 dark:text-zinc-400 uppercase flex items-center gap-1">
                            <CheckSquareOutlined className="text-indigo-500" />
                            <span>Checklist kiểm tra ({checklistCompleted}/{checklists.length})</span>
                          </span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{checklistPercent}%</span>
                        </div>
                        <Progress percent={checklistPercent} size="small" strokeColor="#6366f1" />

                        <div className="space-y-1.5">
                          {checklists.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs transition-colors group"
                            >
                              <Checkbox checked={item.done} onChange={() => toggleChecklist(item.id)}>
                                <span className={item.done ? 'line-through text-zinc-400 font-medium' : 'text-zinc-700 dark:text-zinc-200 font-medium'}>
                                  {item.text}
                                </span>
                              </Checkbox>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  onClick={() => deleteChecklistItem(item.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Input
                            size="middle"
                            placeholder="Thêm đầu việc nhỏ..."
                            value={newChecklistText}
                            onChange={(e) => setNewChecklistText(e.target.value)}
                            onPressEnter={addChecklistItem}
                          />
                          <Button size="middle" icon={<PlusOutlined />} onClick={addChecklistItem}>
                            Thêm
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'worklogs',
                  label: (
                    <span>
                      <ClockCircleOutlined /> Ghi nhận giờ làm ({workLogs.length})
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 pt-1">
                      {/* Worklog Quick Form */}
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <ClockCircleOutlined className="text-amber-500" />
                            <span>Ghi nhận thời gian làm việc mới</span>
                          </span>
                          <span className="text-xs text-zinc-500">
                            Đã log: <strong className="text-zinc-900 dark:text-zinc-100">{totalTimeSpentHours}h</strong> / {estimateHours}h ({timeProgressPercent}%)
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Space.Compact className="w-full sm:w-44">
                            <InputNumber
                              min={5}
                              max={1440}
                              step={15}
                              value={logMinutes}
                              onChange={(v) => setLogMinutes(v || 60)}
                              className="w-full"
                            />
                            <Button disabled className="!text-zinc-500 !bg-zinc-100 dark:!bg-zinc-800 pointer-events-none">
                              phút
                            </Button>
                          </Space.Compact>
                          <Input
                            placeholder="Mô tả công việc đã hoàn thành..."
                            value={logDescription}
                            onChange={(e) => setLogDescription(e.target.value)}
                            onPressEnter={handleAddWorkLog}
                            className="flex-1"
                          />
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            loading={isSubmittingWorkLog}
                            onClick={handleAddWorkLog}
                            className="bg-indigo-600 shrink-0"
                          >
                            Ghi log
                          </Button>
                        </div>
                      </div>

                      {/* Work Logs List */}
                      <div className="space-y-2">
                        <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">
                          Lịch sử ghi nhận thời gian ({workLogs.length})
                        </span>
                        {workLogs.length === 0 ? (
                          <p className="text-xs text-zinc-400 italic">Chưa có lượt ghi log thời gian nào.</p>
                        ) : (
                          workLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <Avatar size="small" className="bg-amber-600 font-bold shrink-0">
                                  {(log.user?.name || 'U').substring(0, 1)}
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                      {log.user?.name || 'Thành viên'}
                                    </span>
                                    <Tag color="orange" className="m-0 font-bold">
                                      {log.minutes_logged} phút ({Math.round((log.minutes_logged / 60) * 10) / 10}h)
                                    </Tag>
                                  </div>
                                  <p className="text-zinc-600 dark:text-zinc-400 m-0 mt-0.5">
                                    {log.description || 'Thực hiện nhiệm vụ'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {dayjs(log.logged_at).format('HH:mm DD/MM')}
                                </span>
                                <Popconfirm
                                  title="Xóa lượt ghi log này?"
                                  onConfirm={() => handleDeleteWorkLog(log.id, log.minutes_logged)}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                >
                                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                              </div>
                            </div>
                          ))
                        )}
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
                            Gửi bình luận
                          </Button>
                        </div>
                      </div>

                      {/* Comments Feed */}
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5"
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
                      <HistoryOutlined /> Lịch sử hoạt động
                    </span>
                  ),
                  children: (
                    <div className="space-y-3 pt-1">
                      {activities.map((act, i) => (
                        <div key={i} className="flex gap-2.5 items-start text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
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
          </Col>

          {/* Right Column: Properties Metadata (38% width) */}
          <Col xs={24} lg={9} className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-3.5 text-xs">
              <div className="font-bold text-zinc-500 uppercase tracking-wider text-[11px] pb-1 border-b border-zinc-200 dark:border-zinc-800">
                Thông tin & Thuộc tính
              </div>

              {/* Sprint Selector (Workflow: Project -> Sprint -> Task) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
                  <BranchesOutlined className="text-indigo-500" />
                  <span>Sprint (Chu kỳ làm việc)</span>
                </label>
                <Select
                  value={detail?.sprint_id || 'sprint-24'}
                  onChange={(val) => handleUpdateField('sprint_id', val === 'none' ? null : val)}
                  className="w-full"
                  options={[
                    { value: 'sprint-24', label: '🚀 Sprint 24 (Đang diễn ra)' },
                    { value: 'sprint-25', label: '📅 Sprint 25 (Kế hoạch tới)' },
                    { value: 'none', label: '📦 Backlog (Chưa phân Sprint)' },
                  ]}
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Trạng thái công việc</label>
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
                <label className="text-[11px] font-bold text-zinc-500">Độ ưu tiên</label>
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

              {/* Assignee (Developer) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
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

              {/* Tester / QA (Consignee) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
                  <SafetyCertificateOutlined className="text-emerald-500" />
                  <span>Người kiểm thử (QA / Consignee)</span>
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
                <label className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
                  <CalendarOutlined />
                  <span>Hạn hoàn thành</span>
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

              {/* Estimate & Time Logged */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined />
                    <span>Tiến độ thời gian làm việc</span>
                  </span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {totalTimeSpentHours}h / {estimateHours}h
                  </span>
                </div>
                <Progress percent={timeProgressPercent} size="small" strokeColor="#f59e0b" />
                <Space.Compact className="w-full mt-1">
                  <InputNumber
                    min={0}
                    max={500}
                    value={estimateHours}
                    onChange={(val) => handleUpdateField('estimate_minutes', (val || 0) * 60)}
                    className="w-full"
                    placeholder="Thời gian ước tính (giờ)"
                  />
                  <Button disabled className="!text-zinc-500 !bg-zinc-100 dark:!bg-zinc-800 pointer-events-none">
                    giờ estimate
                  </Button>
                </Space.Compact>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Modal>
  );
}
