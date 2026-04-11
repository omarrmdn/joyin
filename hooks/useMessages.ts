import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export interface DBMessage {
    id: string;
    event_id: string | null;
    sender_id: string;
    recipient_id: string;
    message_type: 'event_published' | 'event_update' | 'general' | 'event_link';
    subject: string | null;
    body: string;
    event_link: string | null;
    read: boolean;
    created_at: string;
    read_at: string | null;
    sender?: {
        name: string | null;
        image_url: string | null;
    };
    recipient?: {
        name: string | null;
        image_url: string | null;
    };
    event?: {
        title: string;
        organizer_id?: string | null;
    };
}

export function useMessages() {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<DBMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isFetchingRef = useRef(false);

    const fetchMessages = useCallback(async (isInitial = true) => {
        if (!user || isFetchingRef.current) {
            console.log('[useMessages] Skipping fetch: No user or already fetching');
            if (!user) {
                setMessages([]);
                setLoading(false);
            }
            return;
        }

        try {
            isFetchingRef.current = true;
            if (isInitial) setLoading(true);
            setError(null);
            console.log(`[useMessages] Fetching for user: ${user.id}`);

            // Fetch messages where user is sender or recipient
            const [msgSender, msgRecipient, qUser, qOrganizer] = await Promise.all([
                supabase
                    .from('messages')
                    .select('*, sender:users!messages_sender_id_fkey (name, image_url), recipient:users!messages_recipient_id_fkey (name, image_url), event:events (title, organizer_id)')
                    .eq('sender_id', user.id),
                supabase
                    .from('messages')
                    .select('*, sender:users!messages_sender_id_fkey (name, image_url), recipient:users!messages_recipient_id_fkey (name, image_url), event:events (title, organizer_id)')
                    .eq('recipient_id', user.id),
                supabase
                    .from('event_questions')
                    .select('*, user:users!event_questions_user_id_fkey (name, image_url), organizer:users!event_questions_organizer_id_fkey (name, image_url), event:events (title, organizer_id)')
                    .eq('user_id', user.id),
                supabase
                    .from('event_questions')
                    .select('*, user:users!event_questions_user_id_fkey (name, image_url), organizer:users!event_questions_organizer_id_fkey (name, image_url), event:events (title, organizer_id)')
                    .eq('organizer_id', user.id)
            ]);

            if (msgSender.error) throw new Error(`MSG_S: ${msgSender.error.message}`);
            if (msgRecipient.error) throw new Error(`MSG_R: ${msgRecipient.error.message}`);
            if (qUser.error) throw new Error(`QUEST_U: ${qUser.error.message}`);
            if (qOrganizer.error) throw new Error(`QUEST_O: ${qOrganizer.error.message}`);

            const allMsgData = [...(msgSender.data || []), ...(msgRecipient.data || [])];
            const allQData = [...(qUser.data || []), ...(qOrganizer.data || [])];

            const uniqueMsgData = Array.from(new Map(allMsgData.map(m => [m.id, m])).values());
            const uniqueQData = Array.from(new Map(allQData.map(q => [q.id, q])).values());

            const normalizedQuestions: DBMessage[] = (uniqueQData || []).flatMap(q => {
                const msgs: DBMessage[] = [];

                msgs.push({
                    id: `q-${q.id}`,
                    event_id: q.event_id,
                    sender_id: q.user_id,
                    recipient_id: q.organizer_id,
                    message_type: 'general',
                    subject: 'Question',
                    body: q.question,
                    event_link: null,
                    read: !!q.answer,
                    created_at: q.created_at || new Date().toISOString(),
                    read_at: q.answered_at,
                    sender: q.user as any,
                    recipient: q.organizer as any,
                    event: q.event as any
                });

                if (q.answer) {
                    msgs.push({
                        id: `a-${q.id}`,
                        event_id: q.event_id,
                        sender_id: q.organizer_id,
                        recipient_id: q.user_id,
                        message_type: 'general',
                        subject: 'Answer',
                        body: q.answer,
                        event_link: null,
                        read: true,
                        created_at: q.answered_at || q.created_at || new Date().toISOString(),
                        read_at: q.answered_at,
                        sender: q.organizer as any,
                        recipient: q.user as any,
                        event: q.event as any
                    });
                }

                return msgs;
            });

            const combined: DBMessage[] = [
                ...(uniqueMsgData as any[]),
                ...normalizedQuestions
            ].map(m => ({
                ...m,
                created_at: m.created_at || new Date().toISOString()
            }));

            const finalDeduped: DBMessage[] = [];
            combined.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).forEach(msg => {
                const isDuplicate = finalDeduped.some(existing =>
                    existing.sender_id === msg.sender_id &&
                    existing.recipient_id === msg.recipient_id &&
                    existing.body === msg.body &&
                    existing.event_id === msg.event_id &&
                    Math.abs(new Date(existing.created_at || 0).getTime() - new Date(msg.created_at || 0).getTime()) < 120000
                );
                if (!isDuplicate) {
                    finalDeduped.push(msg);
                }
            });

            setMessages(finalDeduped);
        } catch (err) {
            console.error('[useMessages] error fetching messages:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            if (isInitial) setLoading(false);
            isFetchingRef.current = false;
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchMessages();
        }

        if (!user) return;

        const messagesChannel = supabase
            .channel('messages_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    fetchMessages(false);
                }
            )
            .subscribe();

        const questionsChannel = supabase
            .channel('questions_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'event_questions',
                },
                () => {
                    fetchMessages(false);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(questionsChannel);
        };
    }, [authLoading, fetchMessages, user]);

    const sendMessage = async (message: Partial<DBMessage>) => {
        if (!user) throw new Error("User must be logged in to send messages");
        try {
            const { data, error: sendError } = await supabase
                .from('messages')
                .insert({
                    body: message.body || '',
                    event_id: message.event_id || '',
                    message_type: message.message_type || 'general',
                    recipient_id: message.recipient_id || '',
                    subject: message.subject || null,
                    sender_id: user.id,
                    created_at: new Date().toISOString(),
                } as any)
                .select(`
                    *,
                    sender:users!messages_sender_id_fkey (name, image_url),
                    recipient:users!messages_recipient_id_fkey (name, image_url),
                    event:events (title)
                `)
                .single();

            if (sendError) throw sendError;

            setMessages(prev => {
                const newData = {
                    ...data,
                    created_at: data.created_at || new Date().toISOString()
                } as any as DBMessage;
                if (prev.some(m => m.id === newData.id)) return prev;
                return [newData, ...prev];
            });
            return data;
        } catch (err) {
            console.error('Error sending message:', err);
            throw err;
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('messages')
                .update({ read: true, read_at: new Date().toISOString() })
                .eq('id', messageId)
                .eq('recipient_id', user?.id || '');

            if (updateError) throw updateError;
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error: updateError } = await supabase
                .from('messages')
                .update({ read: true, read_at: new Date().toISOString() })
                .eq('recipient_id', user.id)
                .eq('read', false);

            if (updateError) throw updateError;
            setMessages(prev => prev.map(m => m.recipient_id === user.id ? { ...m, read: true } : m));
        } catch (err) {
            console.error('Error marking all messages as read:', err);
        }
    };

    return {
        messages,
        loading,
        error,
        refetch: fetchMessages,
        sendMessage,
        markAsRead,
        markAllAsRead
    };
}
