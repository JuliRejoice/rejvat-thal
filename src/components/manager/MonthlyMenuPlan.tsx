import React, { useState } from 'react';
import { Calendar, Plus, FileText, Download, Edit2, Coffee, Utensils, Moon, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createMonthlyMenu, getMonthlyMenu, updateMonthlyMenu } from '@/api/monthlyMenu.api';
import { DailyMenu, MenuMap } from '@/types/menu.types';

// Mock data for menu plans
const mockMenuData: MenuMap = {
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
  const [menuData, setMenuData] = useState<MenuMap>(mockMenuData);
  const [editingMenu, setEditingMenu] = useState<DailyMenu>({
    breakfast: '',
    lunch: '',
    dinner: ''
  });
  const [saving, setSaving] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleSaveMenu = async () => {
    if (!selectedDate) return;
    const restaurantId = (user as any)?.restaurantId?._id || (user as any)?.restaurantId?.id;
    if (!restaurantId) {
      toast({ title: 'Missing restaurant', description: 'No restaurant linked to your account.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      if (menuData[selectedDate]) {
        const existing = menuData[selectedDate] as any;
        const existingId = existing?._id;
        await updateMonthlyMenu({
          breakfastPlans: editingMenu.breakfast,
          lunchPlans: editingMenu.lunch,
          dinnerPlans: editingMenu.dinner,
          restaurantId,
          date: selectedDate,
        }, String(existingId || ''));
      } else {
        await createMonthlyMenu({
          breakfastPlans: editingMenu.breakfast,
          lunchPlans: editingMenu.lunch,
          dinnerPlans: editingMenu.dinner,
          restaurantId,
          date: selectedDate,
        });
      }

      // Update local state for immediate UI feedback
      setMenuData(prev => ({
        ...prev,
        [selectedDate]: { ...(prev[selectedDate] || {} as any), ...editingMenu },
      }));

      toast({ title: 'Menu saved', description: `Menu for ${selectedDate} has been saved.` });
      setIsMenuModalOpen(false);
    } catch (err: any) {
      toast({ title: 'Failed to save', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Fetch monthly menus for the viewed month
  React.useEffect(() => {
    const fetchMonth = async () => {
      const rid = (user as any)?.restaurantId?._id || (user as any)?.restaurantId?.id;
      if (!rid) return;
      const startDate = `${viewingYear}-${String(viewingMonth + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(viewingYear, viewingMonth + 1, 0).getDate();
      const endDate = `${viewingYear}-${String(viewingMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      try {
        setLoadingMonth(true);
        const res = await getMonthlyMenu(rid, startDate, endDate);
        // Normalize response into { [date]: {breakfast, lunch, dinner} }
        const map: Record<string, { _id?: string; breakfast: string; lunch: string; dinner: string }> = {};
        const items = (res?.payload?.data)
          ?? (Array.isArray(res?.data) ? res.data : res?.data?.items)
          ?? res;
        if (Array.isArray(items)) {
          for (const it of items) {
            const rawDate: string | undefined = it.date || it.menuDate || it?.createdAt;
            const dateKey = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : undefined;
            if (!dateKey) continue;
            map[dateKey] = {
              _id: it._id,
              breakfast: it.breakfastPlans || it.breakfast || '',
              lunch: it.lunchPlans || it.lunch || '',
              dinner: it.dinnerPlans || it.dinner || '',
            };
          }
        }
        setMenuData(map);
      } catch (e: any) {
        toast({ title: 'Failed to load monthly menus', description: e.message || 'Something went wrong', variant: 'destructive' });
      } finally {
        setLoadingMonth(false);
      }
    };
    fetchMonth();
  }, [viewingMonth, viewingYear, user]);

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

  const hasExistingForSelected = selectedDate ? !!menuData[selectedDate] : false;

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

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentMonth} {currentYear} Menu Calendar
            {loadingMonth && <span className="ml-2 text-xs text-muted-foreground">Loading...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {loadingMonth && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Loading month...</span>
            </div>
          )}
          <div className={`grid grid-cols-7 gap-2 ${loadingMonth ? 'pointer-events-none opacity-50' : ''}`}>
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
              <Button onClick={handleSaveMenu} className="flex-1 gap-2" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? (hasExistingForSelected ? 'Updating...' : 'Saving...') : (hasExistingForSelected ? 'Update Menu Plan' : 'Save Menu Plan')}
              </Button>
              <Button variant="outline" onClick={() => setIsMenuModalOpen(false)} disabled={saving}>
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