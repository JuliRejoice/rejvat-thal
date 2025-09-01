import React, { useState } from 'react';
import { Bell, Check, X, Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data
const mockNotifications = [
  {
    id: '1',
    type: 'leave_request',
    title: 'Leave Request from Alice Johnson',
    message: 'Alice Johnson has requested leave for medical appointment on 2024-01-20',
    timestamp: '2024-01-15 10:30',
    status: 'unread',
    priority: 'medium',
    staffName: 'Alice Johnson',
    leaveDate: '2024-01-20',
    reason: 'Medical appointment'
  },
  {
    id: '2',
    type: 'leave_request',
    title: 'Leave Request from Bob Smith',
    message: 'Bob Smith has requested leave for family function on 2024-01-22',
    timestamp: '2024-01-15 09:15',
    status: 'unread',
    priority: 'low',
    staffName: 'Bob Smith',
    leaveDate: '2024-01-22',
    reason: 'Family function'
  },
  {
    id: '3',
    type: 'expense_alert',
    title: 'High Expense Alert',
    message: 'Expense amount exceeds threshold - ₹5,000 on vegetables purchase',
    timestamp: '2024-01-14 16:45',
    status: 'read',
    priority: 'high',
    amount: 5000,
    category: 'Vegetables'
  },
  {
    id: '4',
    type: 'payment_due',
    title: 'Vendor Payment Due',
    message: 'Payment of ₹15,000 is due to Fresh Vegetables Co.',
    timestamp: '2024-01-14 14:20',
    status: 'unread',
    priority: 'high',
    vendorName: 'Fresh Vegetables Co.',
    amount: 15000
  },
  {
    id: '5',
    type: 'system',
    title: 'System Backup Completed',
    message: 'Daily backup completed successfully at 2:00 AM',
    timestamp: '2024-01-15 02:00',
    status: 'read',
    priority: 'low'
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = filter === 'all' || notification.status === filter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'read' }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, status: 'read' }))
    );
  };

  const handleApproveLeave = (notificationId: string) => {
    console.log('Approve leave request:', notificationId);
    handleMarkAsRead(notificationId);
  };

  const handleRejectLeave = (notificationId: string) => {
    console.log('Reject leave request:', notificationId);
    handleMarkAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'leave_request':
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
    switch (notification.type) {
      case 'leave_request':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {notification.staffName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>Date: {notification.leaveDate}</span>
                    <span>Reason: {notification.reason}</span>
                  </div>
                </div>
              </div>
              <Badge variant={getPriorityColor(notification.priority)}>
                {notification.priority}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApproveLeave(notification.id)}
                className="gap-2"
              >
                <Check className="h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectLeave(notification.id)}
                className="gap-2"
              >
                <X className="h-3 w-3" />
                Reject
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
              <div>
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
            </div>
            <Badge variant={getPriorityColor(notification.priority)}>
              {notification.priority}
            </Badge>
          </div>
        );
    }
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
            {filteredNotifications.length === 0 ? (
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
                          {notification.timestamp}
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