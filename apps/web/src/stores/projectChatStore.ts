import { create } from 'zustand';
import {
  ProjectChatMessage,
  ChatUser,
  ProjectTaskRef,
  ProjectSummaryOption,
  ChatAttachment,
  fetchProjectMessagesApi,
  sendProjectMessageApi,
  uploadChatAttachmentApi,
  pinProjectMessageApi,
  deleteProjectMessageApi,
  sendTypingSignalApi,
  fetchAccessibleProjectsApi,
} from '@/features/chat/api/projectChatApi';
import { getEcho, subscribeSocketStatus, SocketConnectionStatus } from '@/lib/echoService';
import { useAuthStore } from './authStore';

interface TypingUser {
  id: number | string;
  name: string;
}

interface ProjectChatState {
  isOpen: boolean;
  isExpanded: boolean;
  currentProjectId: string | null;
  currentProjectKey: string | null;
  messages: ProjectChatMessage[];
  members: ChatUser[];
  availableTasks: ProjectTaskRef[];
  pinnedMessage: ProjectChatMessage | null;
  accessibleProjects: ProjectSummaryOption[];
  typingUsers: TypingUser[];
  replyingTo: ProjectChatMessage | null;
  selectedAttachments: ChatAttachment[];
  isLoading: boolean;
  isSending: boolean;
  isUploadingAttachment: boolean;
  subscribedChannelNames: string[];
  socketStatus: SocketConnectionStatus;

  // Typing throttling state
  lastTypingSentAt: number;
  typingStopTimer: NodeJS.Timeout | null;

  // Actions
  openChat: (projectId: string, projectKey?: string) => void;
  closeChat: () => void;
  toggleChat: (projectId?: string, projectKey?: string) => void;
  toggleExpand: () => void;
  switchProject: (projectId: string, projectKey: string) => void;
  loadAccessibleProjects: () => Promise<void>;
  setReplyingTo: (message: ProjectChatMessage | null) => void;
  loadMessages: (projectId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  uploadAndAddAttachment: (file: File) => Promise<void>;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  pinMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  receiveMessage: (message: ProjectChatMessage) => void;
  handlePinEvent: (data: { is_pinned: boolean; message: ProjectChatMessage | null }) => void;
  handleTypingEvent: (user: TypingUser, isTyping: boolean) => void;
  sendTypingThrottled: () => void;
  stopTypingImmediately: () => void;
  subscribeToProjectChannel: (projectId: string, projectKey?: string) => void;
  unsubscribeFromProjectChannel: () => void;
}

export const useProjectChatStore = create<ProjectChatState>((set, get) => ({
  isOpen: false,
  isExpanded: false,
  currentProjectId: null,
  currentProjectKey: null,
  messages: [],
  members: [],
  availableTasks: [],
  pinnedMessage: null,
  accessibleProjects: [],
  typingUsers: [],
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
    get().subscribeToProjectChannel(projectId, projectKey);
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
    });
    get().loadMessages(projectId);
    get().subscribeToProjectChannel(projectId, projectKey);
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
      const res = await fetchProjectMessagesApi(projectId);
      set({
        messages: res.data || [],
        members: res.members || [],
        availableTasks: res.tasks || [],
        pinnedMessage: res.pinned_message || null,
      });

      // If backend gave messages with a concrete UUID project_id, also ensure channel is bound to that UUID
      if (res.data && res.data.length > 0 && res.data[0].project_id) {
        const realUuid = res.data[0].project_id;
        if (realUuid !== projectId) {
          get().subscribeToProjectChannel(realUuid, projectId);
        }
      }
    } catch {
      // Ignore
    } finally {
      set({ isLoading: false });
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
    if (!currentProjectId || (!content.trim() && selectedAttachments.length === 0)) return;

    get().stopTypingImmediately();

    const currentUser = useAuthStore.getState().user;
    const tempId = 'temp-' + Date.now();
    const attachmentsToSend = selectedAttachments.length > 0 ? [...selectedAttachments] : null;

    // Optimistic message
    const optimisticMessage: ProjectChatMessage = {
      id: tempId,
      project_id: currentProjectId,
      user_id: currentUser?.id || 'me',
      content: content.trim(),
      attachments: attachmentsToSend,
      reply_to_id: replyingTo?.id || null,
      is_pinned: false,
      reply_to: replyingTo
        ? {
            id: replyingTo.id,
            content: replyingTo.content,
            user: {
              id: replyingTo.user.id,
              name: replyingTo.user.name,
            },
          }
        : null,
      user: {
        id: currentUser?.id || 'me',
        name: currentUser?.name || 'Tôi',
        avatar: (currentUser as unknown as { avatar_url?: string; avatar?: string })?.avatar_url || (currentUser as unknown as { avatar_url?: string; avatar?: string })?.avatar || null,
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
    } catch {
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

  receiveMessage: (message: ProjectChatMessage) => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (String(message.user_id) === String(currentUserId)) {
      return;
    }

    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) {
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

  subscribeToProjectChannel: (projectId: string, projectKey?: string) => {
    const echo = getEcho();
    if (!echo) return;

    subscribeSocketStatus((status) => {
      set({ socketStatus: status });
    });

    const channelNamesToSubscribe = new Set<string>();
    channelNamesToSubscribe.add(`project.${projectId}`);
    if (projectKey && projectKey !== projectId) {
      channelNamesToSubscribe.add(`project.${projectKey}`);
      channelNamesToSubscribe.add(`project.${projectKey.toLowerCase()}`);
      channelNamesToSubscribe.add(`project.${projectKey.toUpperCase()}`);
    }

    const currentSubscribed = get().subscribedChannelNames;
    const newChannelNames = Array.from(channelNamesToSubscribe);

    // Bind listeners to all variations
    newChannelNames.forEach((chName) => {
      if (currentSubscribed.includes(chName)) return;

      const channel = echo.private(chName);

      // Listen for message events
      channel
        .listen('.ProjectMessageSent', (e: unknown) => {
          get().receiveMessage(e as ProjectChatMessage);
        })
        .listen('ProjectMessageSent', (e: unknown) => {
          get().receiveMessage(e as ProjectChatMessage);
        })
        .listen('.App\\Events\\ProjectMessageSent', (e: unknown) => {
          get().receiveMessage(e as ProjectChatMessage);
        })
        .listen('App\\Events\\ProjectMessageSent', (e: unknown) => {
          get().receiveMessage(e as ProjectChatMessage);
        });

      // Listen for pin events
      channel
        .listen('.ProjectMessagePinned', (e: { is_pinned: boolean; message: ProjectChatMessage | null }) => {
          get().handlePinEvent(e);
        })
        .listen('ProjectMessagePinned', (e: { is_pinned: boolean; message: ProjectChatMessage | null }) => {
          get().handlePinEvent(e);
        })
        .listen('.App\\Events\\ProjectMessagePinned', (e: { is_pinned: boolean; message: ProjectChatMessage | null }) => {
          get().handlePinEvent(e);
        })
        .listen('App\\Events\\ProjectMessagePinned', (e: { is_pinned: boolean; message: ProjectChatMessage | null }) => {
          get().handlePinEvent(e);
        });

      // Listen for typing events
      channel
        .listen('.TypingIndicator', (e: { user: TypingUser; is_typing: boolean }) => {
          get().handleTypingEvent(e.user, e.is_typing);
        })
        .listen('TypingIndicator', (e: { user: TypingUser; is_typing: boolean }) => {
          get().handleTypingEvent(e.user, e.is_typing);
        })
        .listen('.App\\Events\\TypingIndicator', (e: { user: TypingUser; is_typing: boolean }) => {
          get().handleTypingEvent(e.user, e.is_typing);
        })
        .listen('App\\Events\\TypingIndicator', (e: { user: TypingUser; is_typing: boolean }) => {
          get().handleTypingEvent(e.user, e.is_typing);
        });
    });

    set({ subscribedChannelNames: Array.from(new Set([...currentSubscribed, ...newChannelNames])) });
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
