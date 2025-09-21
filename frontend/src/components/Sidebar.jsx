import { useDispatch, useSelector } from 'react-redux';
import { createRoom, loadRooms, setActiveRoom } from '../features/chat/chatSlice';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const { rooms, activeRoomId } = useSelector((s) => s.chat);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    dispatch(loadRooms());
  }, [dispatch]);

  const handleNewChat = () => {
    dispatch(createRoom('New Chat'));
  };

  const toggleSidebar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle clicked, current state:', isCollapsed);
    setIsCollapsed(!isCollapsed);
  };

  console.log('Sidebar render - isCollapsed:', isCollapsed);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white flex flex-col h-full transition-all duration-300 border-r border-gray-200`}>
      {!isCollapsed ? (
        <>
          {/* Expanded Sidebar */}
          <div className="p-6 border-b border-gray-200">
            {/* Conversations Header with Toggle Button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-gray-900">Conversations</h2>
              <button 
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98] text-xs h-8 w-8 p-0 rounded-lg"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:shadow-lg hover:shadow-blue/20 hover:bg-primary/90 active:scale-[0.98] h-10 px-6 py-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md rounded-xl text-xs"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-4 w-4 mr-2" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="m5 12 14 0" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No conversations yet</p>
              </div>
            ) : (
              <div className="p-3 space-y-1">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => dispatch(setActiveRoom(room.id))}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all duration-200 flex items-center gap-3 ${
                      activeRoomId === room.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    type="button"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activeRoomId === room.id ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <span className="truncate">{room.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Collapsed Sidebar */}
          <div className="flex flex-col items-center p-3 border-gray-200">
            {/* Expand Button */}
            <button 
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98] text-xs h-8 w-8 p-0 rounded-lg mb-3"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            
            {/* Collapsed New Chat Button */}
            <button
              onClick={handleNewChat}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:shadow-lg hover:shadow-blue/20 hover:bg-primary/90 active:scale-[0.98] h-10 w-10 p-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md rounded-xl"
              title="New Chat"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-4 w-4" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="m5 12 14 0" />
              </svg>
            </button>
          </div>

          {/* Collapsed Chat List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => dispatch(setActiveRoom(room.id))}
                className={`w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition-all duration-200 ${
                  activeRoomId === room.id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                title={room.title}
                type="button"
              >
                <div className={`w-3 h-3 rounded-full ${
                  activeRoomId === room.id ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
