import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Camera,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';

const StaffDashboard = () => {
  const attendanceStats = {
    currentMonth: 'November 2024',
    totalDays: 30,
    presentDays: 22,
    absentDays: 3,
    leaveDays: 2,
    pendingDays: 3
  };

  const recentLeaveRequests = [
    { date: '2024-11-25', reason: 'Medical appointment', status: 'approved', appliedOn: '2024-11-20' },
    { date: '2024-11-18', reason: 'Family function', status: 'approved', appliedOn: '2024-11-15' },
    { date: '2024-11-10', reason: 'Personal work', status: 'pending', appliedOn: '2024-11-08' }
  ];

  const todayInfo = {
    date: new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    shift: 'Morning Shift (9:00 AM - 6:00 PM)',
    isMarked: false,
    checkInTime: null
  };

  const attendancePercentage = (attendanceStats.presentDays / attendanceStats.totalDays) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Portal</h1>
          <p className="text-muted-foreground">Welcome back! Manage your attendance and leave requests</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-medium">{todayInfo.date}</p>
        </div>
      </div>

      {/* Attendance Action Card */}
      <Card className="shadow-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Attendance
          </CardTitle>
          <p className="text-sm text-muted-foreground">{todayInfo.shift}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button 
                className="bg-gradient-primary" 
                disabled={todayInfo.isMarked}
              >
                <Camera className="mr-2 h-4 w-4" />
                {todayInfo.isMarked ? 'Marked' : 'Mark Attendance'}
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Apply Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Attendance Summary - {attendanceStats.currentMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-success/5 border border-success/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-success">{attendanceStats.presentDays}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
              <div className="text-center p-4 bg-danger/5 border border-danger/20 rounded-lg">
                <XCircle className="h-8 w-8 text-danger mx-auto mb-2" />
                <p className="text-2xl font-bold text-danger">{attendanceStats.absentDays}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
              <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <Calendar className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-warning">{attendanceStats.leaveDays}</p>
                <p className="text-sm text-muted-foreground">Leave</p>
              </div>
              <div className="text-center p-4 bg-muted/30 border border-border rounded-lg">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold text-muted-foreground">{attendanceStats.pendingDays}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance Rate</span>
                <span className="font-medium">{attendancePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {attendancePercentage >= 90 ? 'Excellent attendance!' : 
                 attendancePercentage >= 80 ? 'Good attendance' : 
                 'Attendance needs improvement'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-gradient-primary" size="lg">
              <Camera className="mr-3 h-4 w-4" />
              Mark Today's Attendance
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <FileText className="mr-3 h-4 w-4" />
              Apply for Leave
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Calendar className="mr-3 h-4 w-4" />
              View Attendance History
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <User className="mr-3 h-4 w-4" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Leave Request History */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Leave Requests
            </CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeaveRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {new Date(request.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                    <p className="text-xs text-muted-foreground">Applied on {new Date(request.appliedOn).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <Badge 
                  variant={
                    request.status === 'approved' ? 'default' : 
                    request.status === 'rejected' ? 'destructive' : 'secondary'
                  }
                  className="capitalize"
                >
                  {request.status === 'approved' && <CheckCircle className="mr-1 h-3 w-3" />}
                  {request.status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                  {request.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;