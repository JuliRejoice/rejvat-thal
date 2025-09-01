import React, { useState } from 'react';
import { Calendar, Users, Utensils, Clock, MapPin, Phone, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockSummary = {
  date: '2024-01-15',
  breakfast: { count: 45, items: ['Poha', 'Tea', 'Samosa'] },
  lunch: { count: 120, items: ['Punjabi Thali', 'Gujarati Thali', 'South Indian Meal'] },
  dinner: { count: 98, items: ['Dal Rice', 'Roti Sabji', 'Biryani'] }
};

const mockCustomers = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    address: '123 MG Road, Mumbai',
    breakfast: { meal: 'Poha', quantity: 1, deliveryTime: '08:00' },
    lunch: { meal: 'Punjabi Thali', quantity: 2, deliveryTime: '12:30' },
    dinner: { meal: 'Dal Rice', quantity: 1, deliveryTime: '19:00' },
    status: 'delivered'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    phone: '+91 9876543211',
    address: '456 Park Avenue, Mumbai',
    breakfast: null,
    lunch: { meal: 'Gujarati Thali', quantity: 1, deliveryTime: '13:00' },
    dinner: { meal: 'Roti Sabji', quantity: 1, deliveryTime: '19:30' },
    status: 'pending'
  },
  {
    id: '3',
    name: 'Amit Patel',
    phone: '+91 9876543212',
    address: '789 Station Road, Mumbai',
    breakfast: { meal: 'Tea Samosa', quantity: 1, deliveryTime: '08:30' },
    lunch: { meal: 'South Indian Meal', quantity: 1, deliveryTime: '12:00' },
    dinner: { meal: 'Biryani', quantity: 1, deliveryTime: '20:00' },
    status: 'out-for-delivery'
  }
];

const DailyTiffinSummary = () => {
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [selectedMealType, setSelectedMealType] = useState('all');

  const filteredCustomers = mockCustomers.filter(customer => {
    if (selectedMealType === 'all') return true;
    return customer[selectedMealType as keyof typeof customer] !== null;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'pending': return 'secondary';
      case 'out-for-delivery': return 'outline';
      default: return 'secondary';
    }
  };

  const getTotalMeals = () => {
    return mockSummary.breakfast.count + mockSummary.lunch.count + mockSummary.dinner.count;
  };

  const exportToPDF = () => {
    console.log('Exporting daily summary to PDF...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Tiffin Summary</h1>
          <p className="text-muted-foreground">Track daily meal deliveries and customer orders</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Meals</p>
                <p className="text-2xl font-bold text-foreground">{getTotalMeals()}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Utensils className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Breakfast</p>
                <p className="text-2xl font-bold text-amber-600">{mockSummary.breakfast.count}</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lunch</p>
                <p className="text-2xl font-bold text-green-600">{mockSummary.lunch.count}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Dinner</p>
                <p className="text-2xl font-bold text-purple-600">{mockSummary.dinner.count}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meal Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meal Summary for {selectedDate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakfast" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakfast">Breakfast ({mockSummary.breakfast.count})</TabsTrigger>
              <TabsTrigger value="lunch">Lunch ({mockSummary.lunch.count})</TabsTrigger>
              <TabsTrigger value="dinner">Dinner ({mockSummary.dinner.count})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakfast" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockSummary.breakfast.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-medium">{item}</h3>
                        <p className="text-sm text-muted-foreground">15 orders</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="lunch" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockSummary.lunch.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-medium">{item}</h3>
                        <p className="text-sm text-muted-foreground">{40 - index * 5} orders</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="dinner" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockSummary.dinner.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-medium">{item}</h3>
                        <p className="text-sm text-muted-foreground">{33 - index * 5} orders</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Customer Delivery List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Deliveries ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={selectedMealType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMealType('all')}
              >
                All Meals
              </Button>
              <Button
                variant={selectedMealType === 'breakfast' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMealType('breakfast')}
              >
                Breakfast
              </Button>
              <Button
                variant={selectedMealType === 'lunch' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMealType('lunch')}
              >
                Lunch
              </Button>
              <Button
                variant={selectedMealType === 'dinner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMealType('dinner')}
              >
                Dinner
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-32">{customer.address}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.breakfast ? (
                        <div className="text-sm">
                          <div className="font-medium">{customer.breakfast.meal}</div>
                          <div className="text-muted-foreground">
                            Qty: {customer.breakfast.quantity} | {customer.breakfast.deliveryTime}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.lunch ? (
                        <div className="text-sm">
                          <div className="font-medium">{customer.lunch.meal}</div>
                          <div className="text-muted-foreground">
                            Qty: {customer.lunch.quantity} | {customer.lunch.deliveryTime}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.dinner ? (
                        <div className="text-sm">
                          <div className="font-medium">{customer.dinner.meal}</div>
                          <div className="text-muted-foreground">
                            Qty: {customer.dinner.quantity} | {customer.dinner.deliveryTime}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(customer.status)}>
                        {customer.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTiffinSummary;