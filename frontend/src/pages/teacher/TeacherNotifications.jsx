import React, {
  useState,
  useEffect,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  CheckCircle2,
  Repeat2,
  Users,
  Bell,
  Check,
  X,
} from 'lucide-react';

import { api } from '../../services/api';

import { useTeacherNotifications } from '../../hooks/useTeacherData';

// ─── Notification Icons ───────────────────────────────────────────────────────

const ICON_MAP = {
  leave_approved: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
  },

  relief_assigned: {
    icon: Repeat2,
    bg: 'bg-orange-50',
    color: 'text-orange-500',
  },

  announcement: {
    icon: Users,
    bg: 'bg-blue-50',
    color: 'text-blue-500',
  },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  'All',
  'Unread',
  'Alerts',
  'Announcements',
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function TeacherNotifications() {
  // ─── Real API Notifications ───────────────────────────────────────────────

  const {
    data: fetchedNotifs = [],
    loading,
  } =
    useTeacherNotifications();

  const [notifs, setNotifs] =
    useState([]);

  const [tab, setTab] =
    useState(0);

  const [
    selectedNotif,
    setSelectedNotif,
  ] = useState(null);

  // Sync API → local state for optimistic updates
  useEffect(() => {
    if (
      Array.isArray(
        fetchedNotifs
      )
    ) {
      setNotifs(
        fetchedNotifs
      );
    }
  }, [fetchedNotifs]);

  // ─── Mark Single Read ─────────────────────────────────────────────────────

  const markRead = async (
    id
  ) => {
    // optimistic update
    setNotifs((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n
      )
    );

    try {
      await api.put(
        `/leaves/notifications/${id}/read`,
        {}
      );
    } catch (err) {
      console.error(
        'Failed to mark notification read:',
        err
      );

      // rollback
      setNotifs((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                read: false,
              }
            : n
        )
      );
    }
  };

  // ─── Mark All Read ────────────────────────────────────────────────────────

  const markAll =
    async () => {
      // optimistic UI
      const previous =
        [...notifs];

      setNotifs((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        }))
      );

      // no backend bulk endpoint yet
      try {
        await Promise.all(
          notifs
            .filter(
              (n) =>
                !n.read
            )
            .map((n) =>
              api.put(
                `/leaves/notifications/${n.id}/read`,
                {}
              )
            )
        );
      } catch (err) {
        console.error(
          'Failed marking all notifications:',
          err
        );

        setNotifs(previous);
      }
    };

  // ─── Open Modal + Mark Read ───────────────────────────────────────────────

  const handleClick = (
    n
  ) => {
    if (!n.read) {
      markRead(n.id);
    }

    setSelectedNotif(n);
  };

  // ─── Filtering ────────────────────────────────────────────────────────────

  const displayed =
    tab === 1
      ? notifs.filter(
          (n) => !n.read
        )
      : tab === 2
      ? notifs.filter((n) =>
          [
            'relief_assigned',
          ].includes(n.type)
        )
      : tab === 3
      ? notifs.filter(
          (n) =>
            n.type ===
            'announcement'
        )
      : notifs;

  const unreadCount =
    notifs.filter(
      (n) => !n.read
    ).length;

  return (
    <div className="max-w-[700px] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-gray-900">
          Notifications
        </h1>

        <button
          onClick={markAll}
          disabled={
            unreadCount === 0
          }
          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:underline disabled:text-gray-300 disabled:cursor-not-allowed disabled:no-underline"
        >
          <Check size={12} />
          Mark all read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() =>
              setTab(i)
            }
            className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
              tab === i
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}

            {t ===
              'Unread' &&
              unreadCount >
                0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 text-[9px] font-bold">
                  {
                    unreadCount
                  }
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-[12px]">
              Loading notifications…
            </p>
          </div>
        ) : displayed.length ===
          0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell
              size={28}
              className="mx-auto mb-3 opacity-30"
            />

            <p className="text-[12px] font-semibold">
              All caught up! No
              new notifications.
            </p>
          </div>
        ) : (
          displayed.map(
            (n, i) => {
              const cfg =
                ICON_MAP[
                  n.type
                ] ??
                ICON_MAP.announcement;

              const Icon =
                cfg.icon;

              return (
                <motion.div
                  key={n.id}
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      i * 0.04,
                  }}
                  onClick={() =>
                    handleClick(
                      n
                    )
                  }
                  className={`cursor-pointer flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-sm ${
                    n.read
                      ? 'bg-white border-gray-100'
                      : 'bg-blue-50/40 border-blue-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <Icon
                      size={
                        14
                      }
                      className={
                        cfg.color
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[12px] font-bold ${
                        n.read
                          ? 'text-gray-700'
                          : 'text-gray-900'
                      }`}
                    >
                      {n.title}
                    </p>

                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      {
                        n.message
                      }
                    </p>

                    <p className="text-[10px] text-gray-400 mt-1">
                      {n.time}
                    </p>
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </motion.div>
              );
            }
          )
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNotif && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() =>
              setSelectedNotif(
                null
              )
            }
          >
            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              transition={{
                duration: 0.15,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {(() => {
                    const cfg =
                      ICON_MAP[
                        selectedNotif
                          .type
                      ] ??
                      ICON_MAP.announcement;

                    const Icon =
                      cfg.icon;

                    return (
                      <div
                        className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon
                          size={18}
                          className={
                            cfg.color
                          }
                        />
                      </div>
                    );
                  })()}

                  <div>
                    <h2 className="text-[14px] font-bold text-gray-900">
                      {
                        selectedNotif.title
                      }
                    </h2>

                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {
                        selectedNotif.time
                      }
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedNotif(
                      null
                    )
                  }
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-[12px] text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3.5">
                {
                  selectedNotif.message
                }
              </p>

              <div className="flex justify-end mt-5">
                <button
                  onClick={() =>
                    setSelectedNotif(
                      null
                    )
                  }
                  className="px-4 py-2 text-[12px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeacherNotifications;