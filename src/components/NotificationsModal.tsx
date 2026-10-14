import React from 'react';
import { AppNotification } from '../types';
import { X, Bell, School, ArrowRight, CheckCheck } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onSelectNotification: (notif: AppNotification) => void;
  onClearNotifications: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectNotification,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Bildirishnomalar</h2>
              <p className="text-[11px] text-slate-400">Maktabingizdan muhim xabarlar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearNotifications}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Tozalash
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Yangi bildirishnomalar yo'q</p>
              <p className="text-xs text-slate-400">
                Maktab ma'muriyati muhim yangilik e'lon qilganda bu yerda ko'rinadi.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onSelectNotification(n);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] text-blue-700 font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5" />
                    {n.schoolName}
                  </span>
                  <span className="text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {n.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <div className="mt-2 flex items-center justify-end text-[11px] font-semibold text-blue-600 gap-1">
                  <span>Yangilikni ochish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
