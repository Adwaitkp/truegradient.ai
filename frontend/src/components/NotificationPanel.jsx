import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePanel, loadNotifications, markAllRead } from '../features/notifications/notificationSlice';

export default function NotificationPanel() {
  const dispatch = useDispatch();
  const { open, items } = useSelector((s) => s.notifications);

  // Load notifications when panel opens
  useEffect(() => {
    if (open) dispatch(loadNotifications());
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={() => dispatch(togglePanel())}
      />

      {/* Panel */}
      <aside className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            <button
              className="text-xs text-gray-600 hover:text-gray-900"
              onClick={() => dispatch(markAllRead())}
              type="button"
            >
              Mark all read
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-100"
              onClick={() => dispatch(togglePanel())}
              aria-label="Close"
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              You're all caught up!
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((n) => (
                <li key={n.id} className="p-4">
                  <p className="text-sm text-gray-800">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
