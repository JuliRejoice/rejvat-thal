import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Filter
} from 'lucide-react';

const RestaurantManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data
  const restaurants = [
    {
      id: 1,
      name: 'Spice Garden',
      manager: 'Rajesh Kumar',
      phone: '+91 9876543210',
      email: 'spicegarden@email.com',
      address: '123 MG Road, Bangalore',
      customers: 150,
      staff: 8,
      status: 'active',
      joinedDate: '2024-01-15',
      lastActivity: '2 hours ago',
      monthlyRevenue: 85000,
      todayOrders: 45
    },
    {
      id: 2,
      name: 'Curry Palace',
      manager: 'Priya Singh',
      phone: '+91 9876543211',
      email: 'currypalace@email.com',
      address: '456 Brigade Road, Bangalore',
      customers: 120,
      staff: 6,
      status: 'active',
      joinedDate: '2024-02-20',
      lastActivity: '1 hour ago',
      monthlyRevenue: 72000,
      todayOrders: 38
    },
    {
      id: 3,
      name: 'Tiffin Express',
      manager: 'Amit Patel',
      phone: '+91 9876543212',
      email: 'tiffinexpress@email.com',
      address: '789 Commercial Street, Bangalore',
      customers: 95,
      staff: 5,
      status: 'inactive',
      joinedDate: '2024-03-10',
      lastActivity: '2 days ago',
      monthlyRevenue: 0,
      todayOrders: 0
    }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || restaurant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const CreateRestaurantModal = () => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Add New Restaurant
        </DialogTitle>
        <DialogDescription>
          Register a new restaurant in the system
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          // Here you would typically save to backend
          console.log('Creating restaurant:', Object.fromEntries(formData));
          setIsCreateModalOpen(false);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input id="restaurantName" name="restaurantName" placeholder="Enter restaurant name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerName">Manager Name</Label>
            <Input id="managerName" name="managerName" placeholder="Manager full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" placeholder="+91 9876543210" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="restaurant@email.com" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Restaurant Address</Label>
            <Textarea id="address" name="address" placeholder="Complete restaurant address" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine Type</Label>
            <Select name="cuisine">
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north-indian">North Indian</SelectItem>
                <SelectItem value="south-indian">South Indian</SelectItem>
                <SelectItem value="gujarati">Gujarati</SelectItem>
                <SelectItem value="punjabi">Punjabi</SelectItem>
                <SelectItem value="multi-cuisine">Multi Cuisine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Daily Capacity</Label>
            <Input id="capacity" name="capacity" type="number" placeholder="100" required />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-primary">
            Create Restaurant
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  const RestaurantDetailModal = ({ restaurant }: { restaurant: any }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {restaurant.name} - Restaurant Details
        </DialogTitle>
        <DialogDescription>
          Complete restaurant information and staff attendance overview
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><span className="font-medium">Manager:</span> {restaurant.manager}</p>
              <p><span className="font-medium">Phone:</span> {restaurant.phone}</p>
              <p><span className="font-medium">Email:</span> {restaurant.email}</p>
              <p><span className="font-medium">Address:</span> {restaurant.address}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Customers:</span> {restaurant.customers}</p>
              <p><span className="font-medium">Staff Count:</span> {restaurant.staff}</p>
              <p><span className="font-medium">Joined Date:</span> {restaurant.joinedDate}</p>
              <p><span className="font-medium">Status:</span> 
                <Badge variant={restaurant.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                  {restaurant.status}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Staff Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff Attendance - Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Ramesh Kumar', role: 'Chef', status: 'present', checkIn: '9:00 AM' },
                { name: 'Sunita Devi', role: 'Assistant', status: 'present', checkIn: '9:15 AM' },
                { name: 'Vikram Singh', role: 'Delivery', status: 'late', checkIn: '9:45 AM' },
                { name: 'Meera Sharma', role: 'Helper', status: 'absent', checkIn: '-' }
              ].map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">{staff.checkIn}</span>
                    <Badge variant={
                      staff.status === 'present' ? 'default' :
                      staff.status === 'late' ? 'secondary' : 'destructive'
                    }>
                      {staff.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Restaurant Management</h1>
          <p className="text-muted-foreground">Manage all registered restaurants and their operations</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <CreateRestaurantModal />
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search restaurants or managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{restaurants.length}</p>
                <p className="text-sm text-muted-foreground">Total Restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{restaurants.filter(r => r.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{restaurants.reduce((sum, r) => sum + r.customers, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-metrics-customers" />
              <div>
                <p className="text-2xl font-bold">{restaurants.reduce((sum, r) => sum + r.staff, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Restaurants List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {restaurant.address.split(',')[0]}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{restaurant.manager}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.staff} staff members</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {restaurant.phone}
                      </p>
                      <p className="text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {restaurant.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="font-medium">{restaurant.customers}</p>
                      <p className="text-xs text-muted-foreground">active customers</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">₹{restaurant.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{restaurant.todayOrders} orders today</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={restaurant.status === 'active' ? 'default' : 'secondary'}>
                        {restaurant.status === 'active' ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {restaurant.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <RestaurantDetailModal restaurant={restaurant} />
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={restaurant.status === 'active' ? 'destructive' : 'success'} 
                        size="sm"
                      >
                        {restaurant.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantManagement;