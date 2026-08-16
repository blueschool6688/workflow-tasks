'use client';

import * as React from 'react';
import { Bell, Check, Trash } from '@phosphor-icons/react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, text: 'Alex K. đã nhắc đến bạn trong PROJ-101', time: '5 phút trước', unread: true },
    { id: 2, text: 'Nhiệm vụ PROJ-102 vừa chuyển sang In Progress', time: '1 giờ trước', unread: true },
    { id: 3, text: 'Sprint 1 đã được bắt đầu bởi Sarah T.', time: '1 ngày trước', unread: false },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
        title="Thông báo"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 animate-ping" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 space-y-2">
            <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Thông báo ({unreadCount})
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1"
                >
                  <Check size={12} />
                  <span>Đọc tất cả</span>
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                    n.unread
                      ? 'bg-accent-50/50 dark:bg-accent-950/40 border border-accent-100 dark:border-accent-900/40'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {n.text}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
