import React, { useEffect, useState, useCallback } from 'react';
import { Send, CheckCheck, Search, Loader2 } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { messageApi, MessageThread, ThreadMessage } from '../../api/messages';
import { Button } from '../common/Button';

export const MessagingCenter: React.FC = () => {
  const { currentUser } = useMarketplace();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Messaging only exists once a booking exists -- there's no "negotiate
  // with the open marketplace" channel before an importer accepts a
  // quote, since the backend scopes every conversation to exactly one
  // importer company and one forwarder company on a specific booking.
  useEffect(() => {
    messageApi
      .listThreads()
      .then((data) => {
        setThreads(data);
        if (data.length > 0) setSelectedBookingId(data[0].bookingId);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load conversations'))
      .finally(() => setIsLoadingThreads(false));
  }, []);

  const loadMessages = useCallback((bookingId: string) => {
    setIsLoadingMessages(true);
    messageApi
      .getThreadMessages(bookingId)
      .then(setThreadMessages)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load messages'))
      .finally(() => setIsLoadingMessages(false));
  }, []);

  useEffect(() => {
    if (selectedBookingId) loadMessages(selectedBookingId);
  }, [selectedBookingId, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedBookingId) return;
    setIsSending(true);
    try {
      const sent = await messageApi.send(selectedBookingId, inputMsg.trim());
      setThreadMessages((prev) => [...prev, sent]);
      setInputMsg('');
      messageApi.listThreads().then(setThreads).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.importerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.forwarderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = threads.find((t) => t.bookingId === selectedBookingId);
  const counterpartyName =
    currentUser.role === 'importer' ? activeThread?.forwarderName : activeThread?.importerName;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col select-none animate-in fade-in duration-200">
      <div className="pb-4 border-b border-[#E5E7EB]">
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Messages</h2>
        <p className="text-xs text-[#6B7280] mt-1">
          Conversations with your confirmed booking counterparties
        </p>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 mt-6 grid grid-cols-1 md:grid-cols-12 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <div className="md:col-span-4 border-r border-[#E5E7EB] bg-[#F7F8FA]/50 flex flex-col">
          <div className="p-3 border-b border-[#E5E7EB]">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
            {isLoadingThreads ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B7280]">
                No conversations yet. Messaging opens up once a booking is confirmed.
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isActive = selectedBookingId === t.bookingId;
                const otherParty = currentUser.role === 'importer' ? t.forwarderName : t.importerName;
                return (
                  <div
                    key={t.bookingId}
                    onClick={() => setSelectedBookingId(t.bookingId)}
                    className={`p-4 transition-all cursor-pointer ${
                      isActive ? 'bg-white border-l-4 border-l-[#EB5D0B]' : 'hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#111827]">{t.bookingNumber}</span>
                      {t.unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-white bg-[#EB5D0B] rounded-full px-1.5 py-0.5">
                          {t.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#374151] mt-1 truncate">{otherParty}</p>
                    <p className="text-xs text-[#6B7280] mt-1 line-clamp-1 italic">
                      {t.lastMessage || 'No messages yet...'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col h-[500px] md:h-auto bg-white">
          {!selectedBookingId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[#6B7280]">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[#E5E7EB] bg-[#F7F8FA]">
                <h4 className="font-bold text-sm text-[#111827]">
                  {activeThread?.bookingNumber} - {counterpartyName}
                </h4>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFAFA]/50">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
                  </div>
                ) : threadMessages.length === 0 ? (
                  <p className="text-center text-xs text-[#6B7280] mt-8">
                    No messages yet. Say hello to get the conversation started.
                  </p>
                ) : (
                  threadMessages.map((msg) => {
                    const isMe = msg.senderUserId === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-[#111827] text-white rounded-br-none shadow-xs'
                              : 'bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-none shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className={`font-bold text-[10px] ${isMe ? 'text-[#EB5D0B]' : 'text-[#6B7280]'}`}>
                              {msg.senderName} ({msg.senderRole})
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed">{msg.body}</p>
                          {isMe && (
                            <div className="flex justify-end mt-1">
                              <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-[#EB5D0B]' : 'text-gray-500'}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-[#E5E7EB] bg-white flex items-center gap-3">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
                />
                <Button type="submit" variant="primary" disabled={isSending || !inputMsg.trim()} icon={<Send className="w-3.5 h-3.5" />}>
                  Send
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
