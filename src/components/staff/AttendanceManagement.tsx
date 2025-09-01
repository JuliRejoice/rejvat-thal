import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  MapPin,
  Smartphone,
  AlertCircle
} from 'lucide-react';

const AttendanceManagement = () => {
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const todayInfo = {
    date: new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    shift: 'Morning Shift (9:00 AM - 6:00 PM)',
    isMarked: false,
    checkInTime: null,
    location: 'Spice Garden Restaurant'
  };

  // Mock attendance data for calendar view
  const attendanceData = {
    '2024-11': {
      totalDays: 30,
      presentDays: 22,
      absentDays: 3,
      leaveDays: 2,
      pendingDays: 3,
      attendanceRecords: [
        { date: '2024-11-01', status: 'present', checkIn: '9:15 AM', checkOut: '6:05 PM' },
        { date: '2024-11-02', status: 'present', checkIn: '9:00 AM', checkOut: '6:00 PM' },
        { date: '2024-11-03', status: 'leave', reason: 'Medical appointment' },
        { date: '2024-11-04', status: 'present', checkIn: '9:20 AM', checkOut: '6:10 PM' },
        { date: '2024-11-05', status: 'absent', reason: 'No show' },
        // ... more records
      ]
    }
  };

  const AttendanceMarkModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Mark Your Attendance
        </DialogTitle>
        <DialogDescription>
          Take a selfie to mark your attendance for today
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Camera Preview Area */}
        <div className="aspect-square bg-muted/20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Camera will open here</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
          </div>
        </div>
        
        {/* Attendance Info */}
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Current Time: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Location: {todayInfo.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Shift: {todayInfo.shift}</span>
          </div>
        </div>
        
        {/* Guidelines */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-primary font-medium mb-2">Guidelines:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Ensure good lighting for clear photo</li>
            <li>• Face should be clearly visible</li>
            <li>• Remove any face coverings</li>
            <li>• Be at your workplace location</li>
          </ul>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsMarkingAttendance(false)}>
          Cancel
        </Button>
        <Button onClick={() => setIsMarkingAttendance(false)} className="bg-gradient-primary">
          <CheckCircle className="mr-2 h-4 w-4" />
          Submit Attendance
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  const LeaveApplicationModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Apply for Leave
        </DialogTitle>
        <DialogDescription>
          Submit your leave request with required details
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="leave-date">Leave Date</Label>
          <input
            id="leave-date"
            type="date"
            className="w-full p-2 border rounded-md"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div>
          <Label htmlFor="leave-type">Leave Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="personal">Personal Leave</SelectItem>
              <SelectItem value="emergency">Emergency Leave</SelectItem>
              <SelectItem value="family">Family Function</SelectItem>
              <SelectItem value="medical">Medical Appointment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="leave-reason">Reason for Leave</Label>
          <Textarea
            id="leave-reason"
            placeholder="Please provide detailed reason for your leave request..."
            rows={3}
          />
        </div>
        
        {/* Selfie Upload */}
        <div>
          <Label>Upload Selfie (Optional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Take a selfie or upload photo</p>
            <Button variant="outline" size="sm">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>
        </div>
        
        {/* Emergency Contact */}
        <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Emergency Contact</span>
          </div>
          <p className="text-xs text-muted-foreground">
            For urgent leaves, contact: Manager (+91 9876543210)
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsApplyingLeave(false)}>
          Cancel
        </Button>
        <Button onClick={() => setIsApplyingLeave(false)}>
          <FileText className="mr-2 h-4 w-4" />
          Submit Request
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  const currentMonthData = attendanceData[selectedMonth] || attendanceData['2024-11'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">Mark your attendance and manage leave requests</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-medium">{todayInfo.date}</p>
        </div>
      </div>

      {/* Today's Attendance Card */}
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
            <div className="flex items-center space-x-4">
              {!todayInfo.isMarked ? (
                <>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Attendance Not Marked</p>
                    <p className="text-sm text-muted-foreground">Please mark your attendance to start your shift</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Attendance Marked</p>
                    <p className="text-sm text-muted-foreground">Checked in at {todayInfo.checkInTime}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <Dialog open={isMarkingAttendance} onOpenChange={setIsMarkingAttendance}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-primary" 
                    disabled={todayInfo.isMarked}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {todayInfo.isMarked ? 'Marked' : 'Mark Attendance'}
                  </Button>
                </DialogTrigger>
                <AttendanceMarkModal />
              </Dialog>
              
              <Dialog open={isApplyingLeave} onOpenChange={setIsApplyingLeave}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Apply Leave
                  </Button>
                </DialogTrigger>
                <LeaveApplicationModal />
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Attendance Summary
              </CardTitle>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-11">November 2024</SelectItem>
                  <SelectItem value="2024-10">October 2024</SelectItem>
                  <SelectItem value="2024-09">September 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-success/5 border border-success/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-success">{currentMonthData.presentDays}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
              <div className="text-center p-4 bg-danger/5 border border-danger/20 rounded-lg">
                <XCircle className="h-8 w-8 text-danger mx-auto mb-2" />
                <p className="text-2xl font-bold text-danger">{currentMonthData.absentDays}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
              <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <Calendar className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-warning">{currentMonthData.leaveDays}</p>
                <p className="text-sm text-muted-foreground">Leave</p>
              </div>
              <div className="text-center p-4 bg-muted/30 border border-border rounded-lg">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold text-muted-foreground">{currentMonthData.pendingDays}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance Rate</span>
                <span className="font-medium">
                  {((currentMonthData.presentDays / currentMonthData.totalDays) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-success h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(currentMonthData.presentDays / currentMonthData.totalDays) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={isMarkingAttendance} onOpenChange={setIsMarkingAttendance}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start bg-gradient-primary" size="lg">
                  <Camera className="mr-3 h-4 w-4" />
                  Mark Today's Attendance
                </Button>
              </DialogTrigger>
              <AttendanceMarkModal />
            </Dialog>
            
            <Dialog open={isApplyingLeave} onOpenChange={setIsApplyingLeave}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="mr-3 h-4 w-4" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <LeaveApplicationModal />
            </Dialog>
            
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Calendar className="mr-3 h-4 w-4" />
              View Full Calendar
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Smartphone className="mr-3 h-4 w-4" />
              Contact Manager
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentMonthData.attendanceRecords.slice(0, 5).map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    record.status === 'present' ? 'bg-success/10 text-success' :
                    record.status === 'leave' ? 'bg-warning/10 text-warning' :
                    'bg-danger/10 text-danger'
                  }`}>
                    {record.status === 'present' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : record.status === 'leave' ? (
                      <Calendar className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        weekday: 'short' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.status === 'present' && record.checkIn && (
                        `${record.checkIn} - ${record.checkOut}`
                      )}
                      {record.status !== 'present' && record.reason}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={
                    record.status === 'present' ? 'default' :
                    record.status === 'leave' ? 'secondary' : 'destructive'
                  }
                >
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;