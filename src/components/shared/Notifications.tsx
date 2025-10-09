import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, X, Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateLeaveRequest } from '@/api/attendance.api';
import { useAuth } from '@/contexts/AuthContext';
import { getNotificationList, markAsRead, markAllAsRead } from '@/api/notification.api';
import { toast } from 'sonner';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'read' | 'unread' | string;
  priority: 'low' | 'medium' | 'high' | string;
  staffName?: string;
  leaveDate?: string;
  reason?: string;
  views?: string[];
  createdAt?: string;
  restaurantId?: string;
  approved?: boolean;
  leaveId?: any;
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const mapItem = useCallback((item: any): NotificationItem => {
    const id = String(item._id ?? item.id);
    const createdAt = item.createdAt ?? item.timestamp ?? new Date().toISOString();
    const userId = user?._id;

    // Extract sender and restaurant names from the new payload structure
    const senderName = item.sender?.name || item.staffName || 'Unknown';
    const restaurantName = item.leaveId?.restaurantId?.name || 'Unknown Restaurant';

    // Check if notification is read based on view array
    const isRead = Array.isArray(item.view) && userId ? item.view.includes(userId) : false;

    const format = (d: any) => {
      try {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return String(d ?? '');
        return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      } catch {
        return String(d ?? '');
      }
    };

    return {
      ...item,
      id,
      type: item.type ?? 'leave_request',
      title: item.sender?.name || senderName,
      message: item.message ?? `${senderName} has applied for leave`,
      timestamp: format(createdAt),
      status: isRead ? 'read' : 'unread',
      priority: (item.priority ?? 'medium') as NotificationItem['priority'],
      staffName: senderName,
      leaveDate: item.leaveId?.fromDate ? format(item.leaveId.fromDate) : '',
      reason: item.leaveId?.reason || '',
      views: item.view || [],
      createdAt: format(createdAt),
      restaurantId: item.leaveId?.restaurantId || null,
      approved : item.leaveId.status
    };
  }, [user]);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNotificationList();

      // Transform each notification item using mapItem
      const transformedNotifications = res.payload.map((item: any) => mapItem(item));
      setNotifications(transformedNotifications);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [mapItem]);


  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = filter === 'all' || notification.status === filter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const computedUnread = useMemo(() => notifications.filter(n => n.status === 'unread').length, [notifications]);
  const unreadCount = computedUnread;

  const handleMarkAsRead =async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'read' }
          : notification
      )
    );
    const res=await markAsRead(notificationId);
    if(res.success) {
      fetchList();
      toast.success('Marked as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, status: 'read' }))
    );
    const res=await markAllAsRead();
    if(res.success) {
      fetchList();
      toast.success('All Messages are Marked as Read');
    }
  };

  const handleApproveLeave = async (notificationId: string) => {

    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    try {
      setProcessingId(notificationId);
      setError(null);
      console.log(notification,'notification');
      const rid = notification.leaveId?.restaurantId?._id;
      if (!rid) throw new Error('Missing restaurant id');
      console.log(notificationId,'-----------------------------------');

      const leaveId = notification.leaveId?._id;
      const startDate = notification.leaveId?.fromDate;
      const endDate = notification.leaveId?.toDate;

      await updateLeaveRequest({
        id: String(leaveId),
        restaurantId: String(rid),
        fromDate: String(startDate),
        toDate: String(endDate),
        reason: String(notification.reason ?? ''),
        status: 'approved',
      });

      handleMarkAsRead(notificationId);
      // Optionally refresh full list from server to sync
      // await fetchList();
    } catch (e: any) {
      setError(e.message || 'Failed to approve leave request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectLeave = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    try {
      setProcessingId(notificationId);
      setError(null);
      const rid = (user as any)?.restaurantId?._id || (user as any)?.restaurantId?.id;
      if (!rid) throw new Error('Missing restaurant id');

      const leaveId = notification.leaveId?._id;
      const startDate = notification.leaveId?.fromDate;
      const endDate = notification.leaveId?.toDate;

      await updateLeaveRequest({
        id: String(leaveId),
        restaurantId: String(rid),
        fromDate: String(startDate),
        toDate: String(endDate),
        reason: String(notification.reason ?? ''),
        status: 'rejected',
      });

      handleMarkAsRead(notificationId);
      // Optionally refresh full list from server to sync
      // await fetchList();
    } catch (e: any) {
      setError(e.message || 'Failed to reject leave request');
    } finally {
      setProcessingId(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'leave_request':
      case 'leave request':
        return <Calendar className="h-4 w-4" />;
      case 'expense_alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'payment_due':
        return <Clock className="h-4 w-4" />;
      case 'system':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const renderNotificationContent = (notification: any) => {
    const typeLower = String(notification.type ?? '').toLowerCase();
    const isRead = notification.status === 'read' &&
                  Array.isArray(notification.views) &&
                  notification.views.length > 0 &&
                  user &&
                  notification.views.includes(user._id);

    return (
      <div className={`space-y-3 ${!isRead ? 'bg-muted/20 p-3 rounded-lg' : ''}`}>
        <div>
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isRead ? 'bg-muted' : 'bg-primary text-primary-foreground'
            }`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{notification.title}</h3>
                <Badge className="text-sm mt-1">{notification.restaurantId?.name}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
             
            </div>
          </div>
         
        </div>
        
        {notification.approved === 'pending' && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={() => handleApproveLeave(notification.id)}
              disabled={processingId === notification.id}
              className="gap-2"
            >
              <Check className="h-3 w-3" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRejectLeave(notification.id)}
              disabled={processingId === notification.id}
              className="gap-2"
            >
              <X className="h-3 w-3" />
              Reject
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Manage system notifications and alerts ({unreadCount} unread)
          </p>
        </div>
        <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-destructive">{unreadCount}</p>
              </div>
              <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leave Requests</p>
                <p className="text-2xl font-bold text-amber-600">
                  {notifications.filter(n => n.type === 'leave_request').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.filter(n => n.priority === 'high').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Notifications</CardTitle>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${notification.status === 'unread' ? 'border-primary bg-primary/5' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {renderNotificationContent(notification)}
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Date: {new Date(notification.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.status === 'unread' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;