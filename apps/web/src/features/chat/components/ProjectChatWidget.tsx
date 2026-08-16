'use client';

import * as React from 'react';
import { usePathname, useParams } from 'next/navigation';
import {
  ChatCircleDots,
  PaperPlaneTilt,
  X,
  ArrowsOutSimple,
  ArrowsInSimple,
  Smiley,
  Image as ImageIcon,
  Paperclip,
  Trash,
  PushPin,
  ArrowBendUpLeft,
  Users,
  Circle,
  Hash,
  At,
  CheckCircle,
  FileText,
  MagnifyingGlass,
  CaretDown,
} from '@phosphor-icons/react';
import {
  Avatar,
  Tooltip,
  Badge,
  Popover,
  Button,
  Dropdown,
  Select,
  Image as AntdImage,
  Spin,
} from 'antd';
import { useProjectChatStore } from '@/stores/projectChatStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { ProjectTaskRef, ChatUser } from '../api/projectChatApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const QUICK_EMOJIS = ['👍', '❤️', '🚀', '🎉', '🔥', '👀', '✅', '🙏', '👏', '💡', '⚠️', '💯'];

export function ProjectChatWidget() {
  const pathname = usePathname();
  const params = useParams();
  const projectKeyParam = params?.projectKey as string | undefined;

  const { user } = useAuthStore();
  const { openTaskDetailModal } = useNotificationStore();
  const {
    isOpen,
    isExpanded,
    currentProjectId,
    currentProjectKey,
    messages,
    members,
    availableTasks,
    pinnedMessage,
    accessibleProjects,
    typingUsers,
    replyingTo,
    selectedAttachments,
    isSending,
    isUploadingAttachment,
    socketStatus,
    toggleChat,
    toggleExpand,
    closeChat,
    openChat,
    switchProject,
    setReplyingTo,
    sendMessage,
    uploadAndAddAttachment,
    removeAttachment,
    pinMessage,
    deleteMessage,
    sendTypingThrottled,
    stopTypingImmediately,
  } = useProjectChatStore();

  const [inputContent, setInputContent] = React.useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const [mentionMenuOpen, setMentionMenuOpen] = React.useState(false);
  const [mentionType, setMentionType] = React.useState<'all' | 'task' | 'member'>('all');
  const [mentionFilter, setMentionFilter] = React.useState('');
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Determine current active project
  const activeProjectKey = projectKeyParam || currentProjectKey;

  // Auto-scroll to bottom when messages update
  React.useEffect(() => {
    if (isOpen && !highlightedMessageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, typingUsers, highlightedMessageId]);

  // Handle typing with throttling
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputContent(value);

    sendTypingThrottled();

    // Check for @ or # triggers for autocomplete
    const cursor = e.target.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    const lastHash = textBeforeCursor.lastIndexOf('#');

    if (lastAt !== -1 && lastAt >= textBeforeCursor.length - 15 && !textBeforeCursor.slice(lastAt).includes(' ')) {
      setMentionType('all');
      setMentionFilter(textBeforeCursor.slice(lastAt + 1).toLowerCase());
      setMentionMenuOpen(true);
    } else if (lastHash !== -1 && lastHash >= textBeforeCursor.length - 15 && !textBeforeCursor.slice(lastHash).includes(' ')) {
      setMentionType('task');
      setMentionFilter(textBeforeCursor.slice(lastHash + 1).toLowerCase());
      setMentionMenuOpen(true);
    } else {
      setMentionMenuOpen(false);
    }
  };

  const handleSend = async () => {
    if ((!inputContent.trim() && selectedAttachments.length === 0) || isSending) return;
    const content = inputContent;
    setInputContent('');
    setMentionMenuOpen(false);
    stopTypingImmediately();
    await sendMessage(content);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputContent((prev) => prev + emoji);
    setEmojiPickerOpen(false);
    textareaRef.current?.focus();
  };

  const handleInsertTask = (task: ProjectTaskRef) => {
    const taskTag = `[${task.task_number}: ${task.title}] `;
    if (mentionMenuOpen) {
      // Replace partial @ or # query
      const lastIndex = Math.max(inputContent.lastIndexOf('@'), inputContent.lastIndexOf('#'));
      if (lastIndex !== -1) {
        setInputContent(inputContent.slice(0, lastIndex) + taskTag);
      } else {
        setInputContent((prev) => prev + taskTag);
      }
    } else {
      setInputContent((prev) => prev + taskTag);
    }
    setMentionMenuOpen(false);
    textareaRef.current?.focus();
  };

  const handleInsertMember = (member: ChatUser) => {
    const memberTag = `@${member.name} `;
    if (mentionMenuOpen) {
      const lastIndex = inputContent.lastIndexOf('@');
      if (lastIndex !== -1) {
        setInputContent(inputContent.slice(0, lastIndex) + memberTag);
      } else {
        setInputContent((prev) => prev + memberTag);
      }
    } else {
      setInputContent((prev) => prev + memberTag);
    }
    setMentionMenuOpen(false);
    textareaRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndAddAttachment(file);
      e.target.value = '';
    }
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 3000);
    }
  };

  // Helper to render task pill or member mention inside message content
  const renderFormattedMessage = (content: string) => {
    // Regex for task pattern: [CORE-ENG-101: title] or CORE-ENG-101 or #CORE-ENG-101
    const taskPattern = /\[([A-Za-z0-9_-]+)(?::\s*([^\]]+))?\]|#?([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*-\d+)/g;
    const memberPattern = /@([A-Za-zÀ-ỹ0-9_.\s]+?)(?=\s|[.,!?]|$)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Tokenize text
    const text = content;
    const matches: { index: number; length: number; node: React.ReactNode }[] = [];

    let match: RegExpExecArray | null;

    // Match Tasks
    while ((match = taskPattern.exec(text)) !== null) {
      const taskNumber = (match[1] || match[3] || '').toUpperCase();
      const taskTitle = match[2] || '';
      const matchedText = match[0];
      const matchIndex = match.index;

      // Find task object if available
      const taskObj = availableTasks.find((t) => t.task_number.toUpperCase() === taskNumber);

      matches.push({
        index: matchIndex,
        length: matchedText.length,
        node: (
          <button
            key={`task-${matchIndex}`}
            onClick={(e) => {
              e.stopPropagation();
              if (taskObj) {
                openTaskDetailModal(taskObj.id);
              } else {
                openTaskDetailModal(taskNumber);
              }
            }}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-indigo-100/90 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-all border border-indigo-200 dark:border-indigo-800 shadow-2xs cursor-pointer"
          >
            <Hash size={12} className="text-indigo-500" />
            <span>{taskNumber}</span>
            {taskTitle && <span className="font-normal truncate max-w-[120px]">{taskTitle}</span>}
          </button>
        ),
      });
    }

    // Match Members
    while ((match = memberPattern.exec(text)) !== null) {
      const memberName = match[1].trim();
      const matchedText = match[0];
      const matchIndex = match.index;

      // Check if matches a member or general @
      const isKnownMember = members.some(
        (m) => m.name.toLowerCase().includes(memberName.toLowerCase())
      );

      if (isKnownMember) {
        matches.push({
          index: matchIndex,
          length: matchedText.length,
          node: (
            <span
              key={`member-${matchIndex}`}
              className="inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.2 rounded font-semibold text-[11px] bg-violet-100/90 dark:bg-violet-950/90 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
            >
              <At size={11} className="text-violet-500" />
              <span>{memberName}</span>
            </span>
          ),
        });
      }
    }

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    let currentIndex = 0;
    for (const item of matches) {
      if (item.index >= currentIndex) {
        if (item.index > currentIndex) {
          parts.push(text.slice(currentIndex, item.index));
        }
        parts.push(item.node);
        currentIndex = item.index + item.length;
      }
    }

    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  // Filter tasks & members for autocomplete
  const filteredTasks = availableTasks.filter(
    (t) =>
      t.task_number.toLowerCase().includes(mentionFilter) ||
      t.title.toLowerCase().includes(mentionFilter)
  );

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(mentionFilter)
  );

  // If user is not in a project route and no project is loaded in chat, don't show widget
  const isInProjectRoute = pathname.includes('/projects/');
  if (!isInProjectRoute && !isOpen && accessibleProjects.length === 0) {
    return null;
  }

  // Floating trigger button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in-75 duration-200">
        <Tooltip
          title={`Kênh chat dự án ${activeProjectKey ? `[${activeProjectKey.toUpperCase()}]` : ''}`}
          placement="left"
        >
          <button
            onClick={() => {
              if (activeProjectKey) {
                openChat(activeProjectKey, activeProjectKey);
              } else {
                toggleChat();
              }
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <ChatCircleDots size={20} weight="fill" className="animate-pulse" />
            <span className="font-semibold tracking-wide">Team Chat</span>
            {activeProjectKey && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono uppercase">
                {activeProjectKey}
              </span>
            )}
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-white/95 dark:bg-[#111115]/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden ${
        isExpanded
          ? 'bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[680px] h-[calc(100vh-32px)] sm:h-[720px]'
          : 'bottom-6 right-6 w-[calc(100vw-48px)] sm:w-[420px] h-[580px]'
      }`}
    >
      {/* Hidden file upload input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Chat Header with Project Switcher */}
      <div className="p-3 px-4 bg-gradient-to-r from-indigo-600/10 via-violet-600/5 to-transparent border-b border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            <ChatCircleDots size={18} weight="fill" />
          </div>

          {/* Project Switcher Dropdown */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Select
                value={currentProjectId || (accessibleProjects[0]?.id ?? undefined)}
                onChange={(val) => {
                  const proj = accessibleProjects.find((p) => p.id === val || p.key === val);
                  if (proj) {
                    switchProject(proj.id, proj.key);
                  }
                }}
                size="small"
                variant="borderless"
                className="font-bold text-xs max-w-[200px]"
                popupMatchSelectWidth={false}
                options={accessibleProjects.map((p) => ({
                  value: p.id,
                  label: (
                    <div className="flex items-center gap-2 py-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-semibold">
                        {p.key}
                      </span>
                      <span className="text-xs truncate">{p.name}</span>
                    </div>
                  ),
                }))}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 pl-2">
              <span className="flex items-center gap-1">
                <Circle
                  size={7}
                  weight="fill"
                  className={socketStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-emerald-400'}
                />
                <span>{socketStatus === 'connected' ? 'Realtime' : 'Trực tuyến'}</span>
              </span>
              <span>•</span>
              <span>{members.length > 0 ? `${members.length} thành viên` : 'Nhóm'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-zinc-500 shrink-0">
          <Tooltip title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}>
            <button
              onClick={toggleExpand}
              className="p-1.5 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {isExpanded ? <ArrowsInSimple size={16} /> : <ArrowsOutSimple size={16} />}
            </button>
          </Tooltip>
          <Tooltip title="Đóng">
            <button
              onClick={closeChat}
              className="p-1.5 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-600 transition-colors"
            >
              <X size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div
          onClick={() => scrollToMessage(pinnedMessage.id)}
          className="px-3.5 py-2 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-900/50 flex items-center justify-between gap-2 cursor-pointer hover:bg-amber-100/90 dark:hover:bg-amber-950/60 transition-colors shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <PushPin size={15} weight="fill" className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="min-w-0 flex-1 text-xs">
              <span className="font-semibold text-amber-900 dark:text-amber-200 mr-1.5">
                {pinnedMessage.user?.name}:
              </span>
              <span className="text-amber-800 dark:text-amber-300 truncate">
                {pinnedMessage.content}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              pinMessage(pinnedMessage.id);
            }}
            className="p-1 rounded hover:bg-amber-200/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-400 text-[10px] font-medium"
            title="Bỏ ghim"
          >
            Bỏ ghim
          </button>
        </div>
      )}

      {/* Online Member Avatar Bar */}
      {members.length > 0 && (
        <div className="px-3.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 shrink-0 mr-1">
            Thành viên:
          </span>
          <Avatar.Group max={{ count: 6 }} size={22}>
            {members.map((m) => (
              <Tooltip key={m.id} title={m.name}>
                <Avatar
                  size={22}
                  onClick={() => handleInsertMember(m)}
                  className="bg-indigo-600 text-white font-semibold text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {m.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-2">
              <ChatCircleDots size={24} weight="duotone" />
            </div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 m-0">
              Chưa có tin nhắn nào
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Hãy gửi tin nhắn đầu tiên để bắt đầu trao đổi cùng nhóm!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = String(msg.user_id) === String(user?.id);
            const showAvatar =
              index === 0 || String(messages[index - 1].user_id) !== String(msg.user_id);
            const timeAgo = dayjs(msg.created_at).format('HH:mm');
            const isHighlighted = highlightedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`group flex items-end gap-2 transition-all duration-300 rounded-xl p-1 ${
                  isHighlighted ? 'bg-indigo-500/15 ring-2 ring-indigo-500' : ''
                } ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-6 shrink-0">
                    {showAvatar && (
                      <Avatar
                        size={24}
                        className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-[10px]"
                      >
                        {msg.user?.name ? msg.user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    )}
                  </div>
                )}

                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Sender Name & Pinned Badge */}
                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                    {!isMe && showAvatar && (
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                        {msg.user?.name}
                      </span>
                    )}
                    {msg.is_pinned && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <PushPin size={10} weight="fill" />
                        Đã ghim
                      </span>
                    )}
                  </div>

                  {/* Quoted Reply */}
                  {msg.reply_to && (
                    <div
                      className={`text-[10px] px-2.5 py-1 mb-1 rounded-lg border-l-2 bg-zinc-100/80 dark:bg-zinc-800/80 border-indigo-500 truncate max-w-full text-zinc-500 dark:text-zinc-400`}
                    >
                      <span className="font-semibold">{msg.reply_to.user?.name}: </span>
                      {msg.reply_to.content}
                    </div>
                  )}

                  {/* Bubble Container with Actions on Hover */}
                  <div className="relative group/bubble flex items-center gap-1.5">
                    {/* Action buttons (Left for own messages) */}
                    {isMe && (
                      <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-lg p-0.5 shadow-2xs border border-zinc-200/50 dark:border-zinc-800/50">
                        <Tooltip title={msg.is_pinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}>
                          <button
                            onClick={() => pinMessage(msg.id)}
                            className={`p-1 rounded transition-colors ${
                              msg.is_pinned
                                ? 'text-amber-500'
                                : 'text-zinc-400 hover:text-amber-500'
                            }`}
                          >
                            <PushPin size={12} weight={msg.is_pinned ? 'fill' : 'regular'} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash size={12} />
                          </button>
                        </Tooltip>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`p-2.5 px-3 rounded-2xl text-xs leading-relaxed transition-all shadow-2xs break-words space-y-2 ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 rounded-bl-xs border border-zinc-200/50 dark:border-zinc-700/50'
                      }`}
                    >
                      {/* Text content with task links and mentions */}
                      {msg.content && (
                        <p className="m-0 whitespace-pre-wrap">
                          {renderFormattedMessage(msg.content)}
                        </p>
                      )}

                      {/* Image / File Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <AntdImage.PreviewGroup>
                            {msg.attachments.map((att, attIdx) => {
                              const isImg =
                                att.type === 'image' ||
                                att.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

                              return isImg ? (
                                <div
                                  key={attIdx}
                                  className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10 max-w-[240px]"
                                >
                                  <AntdImage
                                    src={att.url}
                                    alt={att.name}
                                    className="object-cover rounded-lg"
                                  />
                                </div>
                              ) : (
                                <a
                                  key={attIdx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-[11px] font-medium hover:underline"
                                >
                                  <FileText size={14} />
                                  <span className="truncate max-w-[180px]">{att.name}</span>
                                </a>
                              );
                            })}
                          </AntdImage.PreviewGroup>
                        </div>
                      )}
                    </div>

                    {/* Action buttons (Right for other messages) */}
                    {!isMe && (
                      <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-lg p-0.5 shadow-2xs border border-zinc-200/50 dark:border-zinc-800/50">
                        <Tooltip title={msg.is_pinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}>
                          <button
                            onClick={() => pinMessage(msg.id)}
                            className={`p-1 rounded transition-colors ${
                              msg.is_pinned
                                ? 'text-amber-500'
                                : 'text-zinc-400 hover:text-amber-500'
                            }`}
                          >
                            <PushPin size={12} weight={msg.is_pinned ? 'fill' : 'regular'} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Trả lời">
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="p-1 rounded text-zinc-400 hover:text-indigo-600 transition-colors"
                          >
                            <ArrowBendUpLeft size={12} />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 px-1 font-mono">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 italic p-1 animate-in fade-in">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>
              {typingUsers.map((u) => u.name).join(', ')} đang soạn tin nhắn...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Autocomplete Mention Menu (@ and #) */}
      {mentionMenuOpen && (
        <div className="mx-3 mb-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 z-10 animate-in fade-in slide-in-from-bottom-2">
          {/* Members section */}
          {mentionType !== 'task' && filteredMembers.length > 0 && (
            <div className="p-1">
              <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 px-2 py-0.5 block">
                Thành viên
              </span>
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleInsertMember(m)}
                  className="w-full px-2 py-1.5 rounded-lg flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                >
                  <Avatar size={18} className="bg-indigo-600 text-white text-[9px]">
                    {m.name.charAt(0)}
                  </Avatar>
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {m.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Tasks section */}
          {filteredTasks.length > 0 && (
            <div className="p-1">
              <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 px-2 py-0.5 block">
                Nhiệm vụ
              </span>
              {filteredTasks.slice(0, 10).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleInsertTask(t)}
                  className="w-full px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                      {t.task_number}
                    </span>
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                      {t.title}
                    </span>
                  </div>
                  {t.status && (
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] font-semibold shrink-0"
                      style={{
                        backgroundColor: (t.status.color || '#6366f1') + '20',
                        color: t.status.color || '#6366f1',
                      }}
                    >
                      {t.status.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {filteredMembers.length === 0 && filteredTasks.length === 0 && (
            <div className="p-2 text-center text-xs text-zinc-400">
              Không tìm thấy kết quả phù hợp
            </div>
          )}
        </div>
      )}

      {/* Reply bar */}
      {replyingTo && (
        <div className="px-3.5 py-1.5 bg-indigo-50/80 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
          <div className="flex items-center gap-1.5 truncate">
            <ArrowBendUpLeft size={13} className="shrink-0 text-indigo-500" />
            <span className="truncate">
              Trả lời <strong>{replyingTo.user?.name}</strong>: {replyingTo.content}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-500"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Attachment Previews in Composer */}
      {selectedAttachments.length > 0 && (
        <div className="px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {selectedAttachments.map((att, index) => (
            <div
              key={index}
              className="relative group/att rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1 shrink-0 flex items-center gap-1.5"
            >
              {att.type === 'image' ? (
                <img src={att.url} alt={att.name} className="w-10 h-10 object-cover rounded" />
              ) : (
                <FileText size={20} className="text-zinc-500" />
              )}
              <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 max-w-[80px] truncate">
                {att.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Composer */}
      <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/60 dark:bg-zinc-900/40 shrink-0">
        <div className="relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            ref={textareaRef}
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Nhắn tin tới nhóm... Gõ @ hoặc # để gắn task/người"
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none outline-none max-h-24 px-1 py-1.5 scrollbar-none"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/50 mt-1">
            <div className="flex items-center gap-1">
              {/* Emoji Picker */}
              <Popover
                content={
                  <div className="grid grid-cols-6 gap-1 p-1">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="p-1.5 text-base hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                }
                trigger="click"
                open={emojiPickerOpen}
                onOpenChange={setEmojiPickerOpen}
                placement="topLeft"
              >
                <button
                  type="button"
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Chèn biểu tượng cảm xúc"
                >
                  <Smiley size={16} />
                </button>
              </Popover>

              {/* Upload Image / Attachment */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAttachment}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center"
                title="Đính kèm hình ảnh / tệp"
              >
                {isUploadingAttachment ? (
                  <Spin size="small" />
                ) : (
                  <ImageIcon size={16} />
                )}
              </button>

              {/* Task Insert Quick Button */}
              <button
                type="button"
                onClick={() => {
                  setMentionType('task');
                  setMentionFilter('');
                  setMentionMenuOpen(true);
                }}
                className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors flex items-center gap-0.5 text-[11px] font-semibold"
                title="Gắn mã nhiệm vụ (#)"
              >
                <Hash size={14} />
                <span>Task</span>
              </button>

              {/* Member Mention Quick Button */}
              <button
                type="button"
                onClick={() => {
                  setMentionType('member');
                  setMentionFilter('');
                  setMentionMenuOpen(true);
                }}
                className="p-1.5 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 rounded-lg transition-colors flex items-center gap-0.5 text-[11px] font-semibold"
                title="Tag thành viên (@)"
              >
                <At size={14} />
                <span>Người</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={(!inputContent.trim() && selectedAttachments.length === 0) || isSending}
              className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-all ${
                inputContent.trim() || selectedAttachments.length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs'
                  : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <span className="text-[11px] font-semibold">Gửi</span>
              <PaperPlaneTilt size={13} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
