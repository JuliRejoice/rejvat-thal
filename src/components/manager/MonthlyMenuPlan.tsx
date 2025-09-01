import React, { useState } from 'react';
import { Calendar, Plus, FileText, Download, Edit2, Coffee, Utensils, Moon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for menu plans
const mockMenuData = {
  '2024-01-15': {
    breakfast: 'Poha, Tea, Bread Butter',
    lunch: 'Dal Rice, Roti, Mixed Vegetable, Papad',
    dinner: 'Chapati, Paneer Curry, Dal, Rice'
  },
  '2024-01-16': {
    breakfast: 'Upma, Coffee, Banana',
    lunch: 'Rajma Rice, Roti, Aloo Gobi, Pickle',
    dinner: 'Rice, Dal Tadka, Bhindi Masala, Roti'
  },
  '2024-01-17': {
    breakfast: 'Paratha, Curd, Tea',
    lunch: 'Chole Rice, Naan, Cucumber Salad',
    dinner: 'Khichdi, Kadhi, Papad, Pickle'
  }
};

// Generate calendar days for specified month
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  return days;
};

const MonthlyMenuPlan = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuData, setMenuData] = useState(mockMenuData);
  const [editingMenu, setEditingMenu] = useState({
    breakfast: '',
    lunch: '',
    dinner: ''
  });

  const today = new Date();
  const [viewingMonth, setViewingMonth] = useState(today.getMonth());
  const [viewingYear, setViewingYear] = useState(today.getFullYear());
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentMonth = monthNames[viewingMonth];
  const currentYear = viewingYear;
  
  const calendarDays = generateCalendarDays(viewingYear, viewingMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(viewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    
    // Load existing menu data if available
    const existingMenu = menuData[dateStr];
    if (existingMenu) {
      setEditingMenu(existingMenu);
    } else {
      setEditingMenu({ breakfast: '', lunch: '', dinner: '' });
    }
    
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = () => {
    setMenuData(prev => ({
      ...prev,
      [selectedDate]: editingMenu
    }));
    setIsMenuModalOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Monthly Menu Plan - ${currentMonth} ${currentYear}`, 20, 30);
    
    // Prepare data for the table
    const tableData: any[] = [];
    const daysInMonth = new Date(currentYear, viewingMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(viewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const menu = menuData[dateStr];
      
      if (menu) {
        tableData.push([
          `${day}/${viewingMonth + 1}/${currentYear}`,
          menu.breakfast || 'Not planned',
          menu.lunch || 'Not planned',
          menu.dinner || 'Not planned'
        ]);
      }
    }
    
    // Add table
    autoTable(doc, {
      head: [['Date', 'Breakfast', 'Lunch', 'Dinner']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 50 }
      }
    });
    
    // Save the PDF
    doc.save(`menu-plan-${currentMonth}-${currentYear}.pdf`);
  };

  const getMenuForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(viewingMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return menuData[dateStr];
  };

  const handleMonthChange = (value: string) => {
    if (value === 'current') {
      const now = new Date();
      setViewingMonth(now.getMonth());
      setViewingYear(now.getFullYear());
    } else if (value === 'next') {
      if (viewingMonth === 11) {
        setViewingMonth(0);
        setViewingYear(viewingYear + 1);
      } else {
        setViewingMonth(viewingMonth + 1);
      }
    } else if (value === 'prev') {
      if (viewingMonth === 0) {
        setViewingMonth(11);
        setViewingYear(viewingYear - 1);
      } else {
        setViewingMonth(viewingMonth - 1);
      }
    }
  };

  const getTotalPlannedDays = () => {
    return Object.keys(menuData).length;
  };

  const getSelectValue = () => {
    const now = new Date();
    if (viewingMonth === now.getMonth() && viewingYear === now.getFullYear()) {
      return "current";
    }
    const currentDate = new Date(now.getFullYear(), now.getMonth());
    const viewingDate = new Date(viewingYear, viewingMonth);
    return viewingDate > currentDate ? "next" : "prev";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monthly Menu Plan</h1>
          <p className="text-muted-foreground">Plan and manage monthly menu for {currentMonth} {currentYear}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Select value={getSelectValue()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder={`${currentMonth} ${currentYear}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prev">Previous Month</SelectItem>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="next">Next Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planned Days</p>
                <p className="text-2xl font-bold text-foreground">{getTotalPlannedDays()}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Breakfast Plans</p>
                <p className="text-2xl font-bold text-amber-600">{getTotalPlannedDays()}</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Coffee className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lunch Plans</p>
                <p className="text-2xl font-bold text-green-600">{getTotalPlannedDays()}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Utensils className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dinner Plans</p>
                <p className="text-2xl font-bold text-purple-600">{getTotalPlannedDays()}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Moon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentMonth} {currentYear} Menu Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center font-medium text-muted-foreground border-b">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div key={index} className="min-h-24">
                {day && (
                  <Card 
                    className={`h-full cursor-pointer transition-colors hover:bg-muted/50 ${
                      getMenuForDate(day) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleDateClick(day)}
                  >
                    <CardContent className="p-2">
                      <div className="text-sm font-medium mb-1">{day}</div>
                      {getMenuForDate(day) && (
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            <Coffee className="h-2 w-2 mr-1" />
                            B
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Utensils className="h-2 w-2 mr-1" />
                            L
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Moon className="h-2 w-2 mr-1" />
                            D
                          </Badge>
                        </div>
                      )}
                      {!getMenuForDate(day) && (
                        <div className="text-xs text-muted-foreground">
                          Click to add menu
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu Planning Modal */}
      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Menu Plan for {selectedDate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Breakfast */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-600" />
                Breakfast Menu
              </Label>
              <Textarea
                placeholder="Enter breakfast menu items (e.g., Poha, Tea, Bread Butter)"
                value={editingMenu.breakfast}
                onChange={(e) => setEditingMenu(prev => ({ ...prev, breakfast: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Lunch */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-green-600" />
                Lunch Menu
              </Label>
              <Textarea
                placeholder="Enter lunch menu items (e.g., Dal Rice, Roti, Mixed Vegetable, Papad)"
                value={editingMenu.lunch}
                onChange={(e) => setEditingMenu(prev => ({ ...prev, lunch: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Dinner */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-purple-600" />
                Dinner Menu
              </Label>
              <Textarea
                placeholder="Enter dinner menu items (e.g., Chapati, Paneer Curry, Dal, Rice)"
                value={editingMenu.dinner}
                onChange={(e) => setEditingMenu(prev => ({ ...prev, dinner: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveMenu} className="flex-1">
                Save Menu Plan
              </Button>
              <Button variant="outline" onClick={() => setIsMenuModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyMenuPlan;