import { create } from 'zustand';
import {
  ProjectChatMessage,
  ProjectTaskRef,
  ChatUser,
  ChatAttachment,
  fetchProjectMessagesApi,
  sendProjectMessageApi,
  uploadChatAttachmentApi,
  pinProjectMessageApi,
  deleteProjectMessageApi,
  sendTypingSignalApi,
  fetchAccessibleProjectsApi,
  ProjectSummaryOption,
} from '@/features/chat/api/projectChatApi';
import { useAuthStore } from '@/stores/authStore';
import { getEcho, subscribeSocketStatus, SocketConnectionStatus } from '@/lib/echoService';

export interface TypingUser {
  id: number | string;
  name: string;
}

interface ProjectChatState {
  // Widget Visibility & Active Context
  isOpen: boolean;
  isExpanded: boolean;
  currentProjectId: string | null;
  currentProjectKey: string | null;

  // Data
  messages: ProjectChatMessage[];
  pinnedMessage: ProjectChatMessage | null;
  members: ChatUser[];
  availableTasks: ProjectTaskRef[];
  accessibleProjects: ProjectSummaryOption[];
  typingUsers: TypingUser[];

  // Cursor Pagination State
  hasMore: boolean;
  nextCursor: number | string | null;
  isLoadingMore: boolean;

  // Composer State
  replyingTo: ProjectChatMessage | null;
  selectedAttachments: ChatAttachment[];
  isLoading: boolean;
  isSending: boolean;
  isUploadingAttachment: boolean;

  // Real-time State
  subscribedChannelNames: string[];
  socketStatus: SocketConnectionStatus;
  lastTypingSentAt: number;
  typingStopTimer: NodeJS.Timeout | null;

  // Actions
  openChat: (projectId: string, projectKey?: string) => void;
  closeChat: () => void;
  toggleChat: (projectId?: string, projectKey?: string) => void;
  toggleExpand: () => void;
  switchProject: (projectId: string, projectKey: string) => void;
  loadAccessibleProjects: () => Promise<void>;
  loadMessages: (projectId: string) => Promise<void>;
  loadOlderMessages: () => Promise<void>;

  // Composer Actions
  setReplyingTo: (message: ProjectChatMessage | null) => void;
  uploadAndAddAttachment: (file: File) => Promise<void>;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  sendMessage: (content: string) => Promise<void>;
  pinMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Real-time Event Handlers
  receiveMessage: (rawEvent: unknown) => void;
  handlePinEvent: (data: { is_pinned: boolean; message: ProjectChatMessage | null }) => void;
  handleTypingEvent: (user: TypingUser, isTyping: boolean) => void;
  sendTypingThrottled: () => void;
  stopTypingImmediately: () => void;
  subscribeToProjectChannel: (channelIdentifier: string) => void;
  unsubscribeFromProjectChannel: () => void;
}

export const useProjectChatStore = create<ProjectChatState>((set, get) => ({
  isOpen: false,
  isExpanded: false,
  currentProjectId: null,
  currentProjectKey: null,
  messages: [],
  pinnedMessage: null,
  members: [],
  availableTasks: [],
  accessibleProjects: [],
  typingUsers: [],
  hasMore: false,
  nextCursor: null,
  isLoadingMore: false,
  replyingTo: null,
  selectedAttachments: [],
  isLoading: false,
  isSending: false,
  isUploadingAttachment: false,
  subscribedChannelNames: [],
  socketStatus: 'disconnected',
  lastTypingSentAt: 0,
  typingStopTimer: null,

  openChat: (projectId: string, projectKey?: string) => {
    set({
      isOpen: true,
      currentProjectId: projectId,
      currentProjectKey: projectKey || get().currentProjectKey || projectId,
    });
    get().loadAccessibleProjects();
    get().loadMessages(projectId);
    get().subscribeToProjectChannel(projectId);
  },

  closeChat: () => {
    get().stopTypingImmediately();
    get().unsubscribeFromProjectChannel();
    set({ isOpen: false, replyingTo: null, selectedAttachments: [] });
  },

  toggleChat: (projectId?: string, projectKey?: string) => {
    const { isOpen, currentProjectId, accessibleProjects } = get();
    if (isOpen) {
      get().closeChat();
    } else if (projectId) {
      get().openChat(projectId, projectKey);
    } else if (currentProjectId) {
      get().openChat(currentProjectId);
    } else if (accessibleProjects.length > 0) {
      get().openChat(accessibleProjects[0].id, accessibleProjects[0].key);
    } else {
      get().loadAccessibleProjects().then(() => {
        const projs = get().accessibleProjects;
        if (projs.length > 0) {
          get().openChat(projs[0].id, projs[0].key);
        }
      });
    }
  },

  toggleExpand: () => {
    set((state) => ({ isExpanded: !state.isExpanded }));
  },

  switchProject: (projectId: string, projectKey: string) => {
    get().stopTypingImmediately();
    get().unsubscribeFromProjectChannel();
    set({
      currentProjectId: projectId,
      currentProjectKey: projectKey,
      messages: [],
      members: [],
      availableTasks: [],
      pinnedMessage: null,
      replyingTo: null,
      selectedAttachments: [],
      typingUsers: [],
      hasMore: false,
      nextCursor: null,
      isLoadingMore: false,
    });
    get().loadMessages(projectId);
    get().subscribeToProjectChannel(projectId);
  },

  loadAccessibleProjects: async () => {
    try {
      const projects = await fetchAccessibleProjectsApi();
      set({ accessibleProjects: projects });
    } catch {
      // Fallback
    }
  },

  setReplyingTo: (message: ProjectChatMessage | null) => {
    set({ replyingTo: message });
  },

  loadMessages: async (projectId: string) => {
    try {
      set({ isLoading: true });
      const res = await fetchProjectMessagesApi(projectId, null, 50);
      set({
        messages: res.data || [],
        members: res.members || [],
        availableTasks: res.tasks || [],
        pinnedMessage: res.pinned_message || null,
        hasMore: res.pagination?.has_more ?? false,
        nextCursor: res.pagination?.next_cursor ?? null,
      });

      // Bind channel to canonical project UUID once received
      const canonicalId = res.project?.id || (res.data && res.data.length > 0 ? res.data[0].project_id : null);
      if (canonicalId) {
        get().subscribeToProjectChannel(canonicalId);
      }
    } catch {
      // Ignore
    } finally {
      set({ isLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const { currentProjectId, nextCursor, hasMore, isLoadingMore, messages } = get();
    if (!currentProjectId || !hasMore || !nextCursor || isLoadingMore) return;

    try {
      set({ isLoadingMore: true });
      const res = await fetchProjectMessagesApi(currentProjectId, nextCursor, 50);
      const olderMessages = res.data || [];

      // Prepend older messages while strictly deduplicating by ID
      const existingIds = new Set(messages.map((m) => String(m.id)));
      const filteredOlder = olderMessages.filter((m) => !existingIds.has(String(m.id)));

      set({
        messages: [...filteredOlder, ...messages],
        hasMore: res.pagination?.has_more ?? false,
        nextCursor: res.pagination?.next_cursor ?? null,
      });
    } catch (e) {
      console.error('[Chat] Failed to load older messages:', e);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  uploadAndAddAttachment: async (file: File) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    try {
      set({ isUploadingAttachment: true });
      const attachment = await uploadChatAttachmentApi(currentProjectId, file);
      set((state) => ({
        selectedAttachments: [...state.selectedAttachments, attachment],
      }));
    } catch (e) {
      console.error('Failed to upload attachment', e);
    } finally {
      set({ isUploadingAttachment: false });
    }
  },

  removeAttachment: (index: number) => {
    set((state) => ({
      selectedAttachments: state.selectedAttachments.filter((_, i) => i !== index),
    }));
  },

  clearAttachments: () => {
    set({ selectedAttachments: [] });
  },

  sendMessage: async (content: string) => {
    const { currentProjectId, replyingTo, selectedAttachments } = get();
    if (!currentProjectId) return;
    if (!content.trim() && selectedAttachments.length === 0) return;

    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const attachmentsToSend = selectedAttachments.length > 0 ? [...selectedAttachments] : undefined;

    const optimisticMessage: ProjectChatMessage = {
      id: tempId,
      project_id: currentProjectId,
      user_id: currentUser.id,
      content: content.trim(),
      attachments: attachmentsToSend || null,
      reply_to_id: replyingTo?.id || null,
      reply_to: replyingTo
        ? {
            id: replyingTo.id,
            content: replyingTo.content,
            user: {
              id: replyingTo.user?.id || 0,
              name: replyingTo.user?.name || '',
            },
          }
        : null,
      user: {
        id: currentUser.id,
        name: currentUser.name || 'User',
        avatar: currentUser.avatar_url || null,
      },
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
      replyingTo: null,
      selectedAttachments: [],
      isSending: true,
    }));

    try {
      const realMessage = await sendProjectMessageApi(
        currentProjectId,
        content.trim(),
        replyingTo?.id,
        attachmentsToSend || undefined
      );

      set((state) => ({
        messages: state.messages.map((m) => (m.id === tempId ? realMessage : m)),
        isSending: false,
      }));
    } catch (err: unknown) {
      console.error('[Chat] Failed to send message:', err);
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
        isSending: false,
      }));
    }
  },

  pinMessage: async (messageId: string) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    try {
      const res = await pinProjectMessageApi(currentProjectId, messageId);
      set((state) => {
        const updatedMessages = state.messages.map((m) => ({
          ...m,
          is_pinned: m.id === messageId ? res.is_pinned : false,
        }));
        return {
          messages: updatedMessages,
          pinnedMessage: res.is_pinned ? res.data : null,
        };
      });
    } catch {
      // Ignore
    }
  },

  deleteMessage: async (messageId: string) => {
    const { currentProjectId, pinnedMessage } = get();
    if (!currentProjectId) return;

    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
      pinnedMessage: pinnedMessage?.id === messageId ? null : pinnedMessage,
    }));

    try {
      await deleteProjectMessageApi(currentProjectId, messageId);
    } catch {
      // Ignore
    }
  },

  receiveMessage: (rawEvent: unknown) => {
    if (!rawEvent) return;
    const raw = rawEvent as Record<string, unknown>;
    const message = (raw.messageData || raw.data || raw.message || raw) as ProjectChatMessage;

    if (!message || !message.id) return;

    const currentUserId = useAuthStore.getState().user?.id;
    if (String(message.user_id) === String(currentUserId)) {
      return;
    }

    set((state) => {
      // Prevent duplicate messages by ID
      if (state.messages.some((m) => String(m.id) === String(message.id))) {
        return state;
      }
      return {
        messages: [...state.messages, message],
      };
    });
  },

  handlePinEvent: (data: { is_pinned: boolean; message: ProjectChatMessage | null }) => {
    set((state) => {
      const updatedMessages = state.messages.map((m) => ({
        ...m,
        is_pinned: data.is_pinned && data.message?.id === m.id,
      }));
      return {
        messages: updatedMessages,
        pinnedMessage: data.is_pinned ? data.message : null,
      };
    });
  },

  handleTypingEvent: (user: TypingUser, isTyping: boolean) => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (String(user.id) === String(currentUserId)) {
      return;
    }

    set((state) => {
      if (isTyping) {
        if (state.typingUsers.some((u) => String(u.id) === String(user.id))) {
          return state;
        }
        return { typingUsers: [...state.typingUsers, user] };
      } else {
        return {
          typingUsers: state.typingUsers.filter((u) => String(u.id) !== String(user.id)),
        };
      }
    });
  },

  sendTypingThrottled: () => {
    const { currentProjectId, lastTypingSentAt, typingStopTimer } = get();
    if (!currentProjectId) return;

    const now = Date.now();
    if (now - lastTypingSentAt > 2500) {
      sendTypingSignalApi(currentProjectId, true);
      set({ lastTypingSentAt: now });
    }

    if (typingStopTimer) {
      clearTimeout(typingStopTimer);
    }
    const newTimer = setTimeout(() => {
      get().stopTypingImmediately();
    }, 2500);

    set({ typingStopTimer: newTimer });
  },

  stopTypingImmediately: () => {
    const { currentProjectId, typingStopTimer } = get();
    if (typingStopTimer) {
      clearTimeout(typingStopTimer);
      set({ typingStopTimer: null });
    }
    if (currentProjectId) {
      sendTypingSignalApi(currentProjectId, false);
      set({ lastTypingSentAt: 0 });
    }
  },

  subscribeToProjectChannel: (channelIdentifier: string) => {
    const echo = getEcho();
    if (!echo) return;

    subscribeSocketStatus((status) => {
      set({ socketStatus: status });
    });

    const targetChannel = `project.${channelIdentifier}`;
    const currentSubscribed = get().subscribedChannelNames;

    // Already subscribed to this exact channel
    if (currentSubscribed.includes(targetChannel)) return;

    // Unsubscribe from any previous project channel first
    get().unsubscribeFromProjectChannel();

    const channel = echo.private(targetChannel);

    // Single listener per event name
    channel
      .listen('.ProjectMessageSent', (e: unknown) => {
        get().receiveMessage(e);
      })
      .listen('.ProjectMessagePinned', (e: { is_pinned: boolean; message: ProjectChatMessage | null }) => {
        get().handlePinEvent(e);
      })
      .listen('.TypingIndicator', (e: { user: TypingUser; is_typing: boolean }) => {
        if (e?.user) {
          get().handleTypingEvent(e.user, e.is_typing);
        }
      });

    set({ subscribedChannelNames: [targetChannel] });
  },

  unsubscribeFromProjectChannel: () => {
    const { subscribedChannelNames } = get();
    if (subscribedChannelNames.length === 0) return;

    const echo = getEcho();
    if (echo) {
      subscribedChannelNames.forEach((chName) => {
        echo.leave(`private-${chName}`);
        echo.leave(chName);
      });
    }

    set({ subscribedChannelNames: [], typingUsers: [] });
  },
}));
