'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface ProcurementNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  read: boolean;
  route?: string;
  entityId?: string;
}

const INITIAL_NOTIFICATIONS: ProcurementNotification[] = [
  {
    id: 'NOTIF-01',
    title: 'High Risk Bidder Detected',
    message: 'TechCorp Solutions — Tender GEM/2026/B/1024: Local Content shortfall of 8% (42% vs 50%).',
    timestamp: '2026-08-27 10:14 IST',
    timeAgo: '10 min ago',
    severity: 'critical',
    read: false,
    route: '/client/bids/BID-1024/evidence',
    entityId: 'BID-1024',
  },
  {
    id: 'NOTIF-02',
    title: 'Document Verification Complete',
    message: 'OEM Authorization Certificate (MAF-OEM-99120) cryptographically verified via OEM Partner Ledger.',
    timestamp: '2026-08-27 10:00 IST',
    timeAgo: '24 min ago',
    severity: 'success',
    read: false,
    route: '/client/bids/BID-1024/evidence',
    entityId: 'DOC-OEM-01',
  },
  {
    id: 'NOTIF-03',
    title: 'Tender Deadline Approaching',
    message: 'Tender GEM/2026/B/1024 (Data Center Migration) bidding window closes tomorrow at 18:00 IST.',
    timestamp: '2026-08-27 09:20 IST',
    timeAgo: '1 hour ago',
    severity: 'warning',
    read: false,
    route: '/client/tenders',
    entityId: 'TND-1024',
  },
  {
    id: 'NOTIF-04',
    title: 'CVC Debarment Match Flagged',
    message: 'Bravo Heavy Engineering Corp identified on Central Debarment register for CPCL Tender 899120.',
    timestamp: '2026-08-27 08:30 IST',
    timeAgo: '2 hours ago',
    severity: 'critical',
    read: true,
    route: '/admin/audit',
    entityId: 'BID-8821',
  },
  {
    id: 'NOTIF-05',
    title: 'Statutory Clarification Submitted',
    message: 'Alpha Defense Logistics submitted chartered accountant turnover certification addendum.',
    timestamp: '2026-08-27 07:15 IST',
    timeAgo: '3 hours ago',
    severity: 'info',
    read: true,
    route: '/client/clarifications',
    entityId: 'CLR-2026-04',
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationCenter({ isOpen, onClose, onUnreadCountChange }: NotificationCenterProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ProcurementNotification[]>(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleNotificationClick = (n: ProcurementNotification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(item => (item.id === n.id ? { ...item, read: true } : item))
    );
    onClose();
    if (n.route) {
      router.push(n.route);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-96 max-w-[92vw] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant z-[250] flex flex-col overflow-hidden animate-slide-in"
    >
      {/* Header */}
      <div className="p-4 border-b border-outline-variant bg-surface-alt flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
          <h3 className="font-display font-bold text-sm text-primary">Notification Center</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-primary hover:text-info transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-muted text-xs">
            <span className="material-symbols-outlined text-3xl mb-1 text-outline">notifications_off</span>
            <p className="font-semibold">No notifications</p>
            <p className="text-[11px] mt-0.5">All procurement alerts and compliance events are clear.</p>
          </div>
        ) : (
          notifications.map(n => {
            const isCritical = n.severity === 'critical';
            const isWarning = n.severity === 'warning';
            const isSuccess = n.severity === 'success';

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 hover:bg-surface-alt/70 transition-colors cursor-pointer flex gap-3 relative group ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
              >
                {/* Severity Indicator Dot / Icon */}
                <div className="mt-0.5 shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full block mt-1.5 ${
                      isCritical
                        ? 'bg-danger animate-pulse'
                        : isWarning
                        ? 'bg-warning'
                        : isSuccess
                        ? 'bg-success'
                        : 'bg-info'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h4
                      className={`text-xs font-bold truncate ${
                        !n.read ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-neutral-muted shrink-0 font-mono">
                      {n.timeAgo}
                    </span>
                  </div>

                  <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                    {n.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-danger/10 text-danger border-danger/20'
                          : isWarning
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : isSuccess
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-info/10 text-info border-info/20'
                      }`}
                    >
                      {n.severity}
                    </span>

                    <button
                      onClick={e => handleToggleRead(n.id, e)}
                      className="text-[10px] text-neutral-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {n.read ? 'Mark unread' : 'Mark read'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-outline-variant bg-surface-alt/50 text-center">
        <span className="text-[10px] text-neutral-muted font-mono">
          BidShield AI Compliance Monitoring Engine
        </span>
      </div>
    </div>
  );
}
