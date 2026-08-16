'use client';

import * as React from 'react';
import {
  Bell,
  Check,
  Trash,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkle,
  Tray,
} from '@phosphor-icons/react';
import { Badge, Tabs, Tooltip, Avatar, Button } from 'antd';
import { useNotificationStore } from '@/stores/notificationStore';
import { AppNotification } from '../api/notificationApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread' | 'tasks'>('all');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    deleteNotification,
    openTaskDetailModal,
    loadNotifications,
  } = useNotificationStore();

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.is_read);
    }
    if (activeTab === 'tasks') {
      return notifications.filter((n) => n.type.startsWith('task'));
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.is_read) {
      markRead(item.id);
    }
    if (item.task_id) {
      openTaskDetailModal(item.task_id);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip title="Thông báo hệ thống">
        <button
          onClick={() => {
            if (!isOpen) {
              loadNotifications();
            }
            setIsOpen(!isOpen);
          }}
          className={`p-2 rounded-xl transition-all relative flex items-center justify-center ${
            isOpen
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          aria-label="Thông báo"
        >
          <Bell size={19} weight={unreadCount > 0 ? 'fill' : 'regular'} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-white dark:border-[#09090b] animate-in zoom-in-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkle size={16} className="text-indigo-500" weight="fill" />
                Thông báo
              </span>
              {unreadCount > 0 && (
                <Badge
                  count={unreadCount}
                  className="site-badge-count-4"
                  style={{ backgroundColor: '#6366f1' }}
                />
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                type="text"
                size="small"
                onClick={markAllRead}
                icon={<Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg px-2 h-7"
              >
                Đã đọc tất cả
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-1.5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
            <Tabs
              activeKey={activeTab}
              onChange={(k) => setActiveTab(k as 'all' | 'unread' | 'tasks')}
              size="small"
              className="notification-tabs"
              items={[
                { key: 'all', label: `Tất cả (${notifications.length})` },
                { key: 'unread', label: `Chưa đọc (${unreadCount})` },
                {
                  key: 'tasks',
                  label: `Công việc (${notifications.filter((n) => n.type.startsWith('task')).length})`,
                },
              ]}
            />
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2 text-zinc-400">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center text-zinc-400">
                  <Tray size={24} weight="duotone" />
                </div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 m-0">
                  {activeTab === 'unread'
                    ? 'Bạn đã xem hết tất cả thông báo!'
                    : 'Không có thông báo nào'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const timeAgo = dayjs(item.created_at).fromNow();
                const isTask = !!item.task_id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group p-3 sm:p-3.5 transition-all cursor-pointer flex items-start gap-3 relative ${
                      !item.is_read
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!item.is_read && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}

                    {/* Sender Avatar or Icon */}
                    <div className="shrink-0 mt-0.5">
                      {item.sender?.avatar ? (
                        <Avatar src={item.sender.avatar} size={34} />
                      ) : (
                        <Avatar
                          size={34}
                          className="bg-gradient-to-tr from-indigo-600 to-violet-500 font-semibold text-xs text-white"
                        >
                          {item.sender?.name ? item.sender.name.charAt(0).toUpperCase() : 'T'}
                        </Avatar>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono whitespace-nowrap flex items-center gap-0.5">
                          <Clock size={11} />
                          {timeAgo}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed m-0">
                        {item.message}
                      </p>

                      {/* Task status transition visual badge */}
                      {item.data?.old_status && item.data?.new_status && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          <span className="text-zinc-400">{item.data.old_status as string}</span>
                          <ArrowRight size={10} className="text-zinc-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {item.data.new_status as string}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions on hover */}
                    <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!item.is_read && (
                        <Tooltip title="Đánh dấu đã đọc">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead(item.id);
                            }}
                            className="p-1 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <CheckCircle size={15} />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip title="Xóa">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item.id);
                          }}
                          className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <Trash size={15} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
