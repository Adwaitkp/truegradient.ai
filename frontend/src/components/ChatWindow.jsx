import { useDispatch, useSelector } from 'react-redux';
import { loadMessages, sendMessage, createRoom } from '../features/chat/chatSlice';
import { useEffect, useRef, useState } from 'react';

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { activeRoomId, messages } = useSelector((s) => s.chat);
  const [text, setText] = useState('');

  useEffect(() => {
    if (activeRoomId) dispatch(loadMessages(activeRoomId));
  }, [activeRoomId, dispatch]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Ensure there is an active room; create one on the fly if needed
    let roomId = activeRoomId;
    if (!roomId) {
      const action = await dispatch(createRoom('New Chat'));
      roomId = action.payload?.id;
      if (!roomId) return; // safety guard
    }

    await dispatch(sendMessage({ roomId, text }));
    setText('');
  };

  // Scroll to bottom when messages change
  const listRef = useRef(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Scrollable Messages Area */}
      <div ref={listRef} className="flex-1 overflow-y-auto scroll-smooth px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            {/* Welcome Message */}
            <div className="text-center max-w-2xl mx-auto py-8">
              {/* AI Icon */}
              <div className="w-16 h-16 mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles h-16 w-16 mx-auto text-blue-500 mb-4" aria-hidden="true">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                  <path d="M20 2v4"></path>
                  <path d="M22 4h-4"></path>
                  <circle cx="4" cy="20" r="2"></circle>
                </svg>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to AI Chat</h2>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed max-w-md mx-auto">
                Start a conversation with our AI assistant. Ask questions, get help with tasks, or explore ideas together.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-w-2xl">
                {[
                  'Explain quantum computing in simple terms',
                  'Write a Python function to sort a list',
                  'What are the benefits of meditation?',
                  'Help me plan a weekend trip to Paris'
                ].map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setText(t)}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background border border-border bg-background text-foreground shadow-sm hover:shadow-md hover:bg-accent hover:text-accent-foreground active:scale-[0.98] p-4 h-auto text-left justify-start"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-gray-600 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
                        strokeLinejoin="round" className="lucide lucide-message-square h-4 w-4 mr-2 flex-shrink-0"
                        aria-hidden="true">
                        <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path>
                      </svg>

                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((m) => (
              <div key={m.id} className={`mb-4 p-4 rounded-lg ${m.role === 'ai' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${m.role === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {m.role === 'ai' ? 'AI' : 'U'}
                  </div>
                  <p className="text-gray-900 flex-1">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-6 bg-white">
        <form onSubmit={onSend} className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-600 disabled:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          </div>
        </form>
      </div>
    </div>
  );
}
