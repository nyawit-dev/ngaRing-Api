import classnames from 'classnames';
import { relativeDate } from 'utils/common';

const NotificationList = ({ items, selectedId, onSelect }) => {
  return (
    <ul className="notif-list">
      {items.map((notification) => {
        const isActive = selectedId === notification.id;
        const isUnread = !notification.read;
        return (
          <li
            key={notification.id}
            className={classnames('notif-list-item', { active: isActive, unread: isUnread })}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(notification)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onSelect(notification);
              }
            }}
          >
            {(notification.source === 'NgaRingApi' || notification.pinned) && (
              <div className="flex items-center gap-1 mb-1">
                {notification.source === 'NgaRingApi' && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                    NgaRingApi
                  </span>
                )}
                {notification.pinned && (
                  <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    📌 Penting
                  </span>
                )}
              </div>
            )}
            <div className={classnames('notif-item-title', { unread: isUnread })}>{notification.title}</div>
            <div className="notif-item-date">{relativeDate(notification.date)}</div>
          </li>
        );
      })}
      {items.length === 0 && <li className="notif-list-empty">No notifications to show.</li>}
    </ul>
  );
};

export default NotificationList;
