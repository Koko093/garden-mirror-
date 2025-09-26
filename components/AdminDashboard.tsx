import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar } from './ui/calendar';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  DollarSign, 
  Calendar as CalendarIcon, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Star,
  FileText,
  Mail,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Settings,
  BarChart3,
  Package,
  Home,
  MessageSquare,
  CreditCard,
  RefreshCw,
  LogOut,
  Menu,
  UserCheck,
  Send
} from 'lucide-react';
import { api } from '../lib/api';
import { Room, Package as PackageType, Reservation, Feedback } from '../types';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { InvoiceGenerator } from './InvoiceGenerator';
import { InvoiceService } from '../lib/invoiceService';

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  
  // Modal states
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
  const [isReservationDetailsOpen, setIsReservationDetailsOpen] = useState(false);
  const [isRebookingOpen, setIsRebookingOpen] = useState(false);
  const [isManualReservationOpen, setIsManualReservationOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Selected items
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  
  // System settings
  const [systemSettings, setSystemSettings] = useState({
    businessName: 'Garden Mirror',
    logo: '/logo.png',
    downpaymentPercentage: 30,
    currency: 'PHP',
    timezone: 'Asia/Manila',
    emailNotifications: true,
    smsNotifications: false,
    autoConfirmReservations: false,
    allowCancellations: true,
    cancellationDeadlineHours: 24,
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    taxRate: 12
  });

  // Form states
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    capacity: '',
    price: '',
    hourlyRate: '',
    dailyRate: '',
    features: '',
    images: '',
    amenities: ''
  });

  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    maxGuests: '',
    inclusions: '',
    addOns: ''
  });

  const [rebookingForm, setRebookingForm] = useState({
    eventDate: '',
    startTime: '',
    endTime: '',
    roomId: '',
    packageId: '',
    guestCount: '',
    reason: ''
  });

  const [manualReservationForm, setManualReservationForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventTitle: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    roomId: '',
    packageId: '',
    guestCount: '',
    specialRequests: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const [paymentConfirmation, setPaymentConfirmation] = useState({
    confirmPayment: false,
    paymentReceived: false,
    amount: 0,
    method: 'cash'
  });

  // Navigation menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
    { id: 'reservations', label: 'Reservations', icon: CalendarIcon, path: '/admin/reservations' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, path: '/admin/calendar' },
    { id: 'manual-reservation', label: 'Walk-in Booking', icon: UserCheck, path: '/admin/manual-reservation' },
    { id: 'rooms', label: 'Rooms', icon: MapPin, path: '/admin/rooms' },
    { id: 'packages', label: 'Packages', icon: Package, path: '/admin/packages' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, path: '/admin/transactions' },
    { id: 'invoices', label: 'Invoices', icon: FileText, path: '/admin/invoices' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  const getCurrentMenuItem = () => {
    const path = location.pathname;
    return menuItems.find(item => item.path === path) || menuItems[0];
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roomsData, packagesData, reservationsData, feedbackData, analyticsData, paymentsData, usersData, settingsData] = await Promise.all([
        api.getRooms().catch(() => []),
        api.getPackages().catch(() => []), 
        api.getReservations().catch(() => []),
        api.getFeedback().catch(() => []),
        api.getAnalytics().catch(() => ({
          totalRevenue: 0,
          totalBookings: 0,
          pendingPayments: 0,
          activeUsers: 0,
          monthlyBookings: [],
          roomUtilization: []
        })),
        api.getPayments().catch(() => []),
        api.getUsers().catch(() => []),
        api.getSystemSettings().catch(() => systemSettings)
      ]);
      
      setRooms(roomsData);
      setPackages(packagesData);
      setReservations(reservationsData);
      setFeedback(feedbackData);
      setAnalytics(analyticsData);
      setPayments(paymentsData);
      setUsers(usersData);
      setSystemSettings(settingsData);
      
      // Show info message if running in offline mode (only if no data loaded)
      if (roomsData.length === 0 && packagesData.length === 0 && reservationsData.length === 0) {
        toast.info('Demo mode: Using sample data for demonstration');
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load dashboard data - using offline mode');
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      await api.updateReservationStatus(reservationId, newStatus);
      await loadData();
      toast.success('Reservation status updated successfully');
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Failed to update reservation status');
    }
  };

  const openInvoiceDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsInvoiceOpen(true);
  };

  const closeInvoiceDialog = () => {
    setIsInvoiceOpen(false);
    setSelectedReservation(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const customerName = reservation.customerInfo?.name || reservation.contact_person;
    const matchesSearch = !searchTerm || 
      customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    const eventDate = reservation.eventDate || reservation.event_date;
    const matchesDate = !dateFilter || 
      new Date(eventDate).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Helper function to format reservation data for InvoiceGenerator
  const formatReservationForInvoice = (reservation: Reservation) => {
    const room = rooms.find(r => r.id === (reservation.roomId || reservation.room_id));
    const pkg = packages.find(p => p.id === (reservation.packageId || reservation.package_id));

    return {
      id: reservation.id,
      reservationId: reservation.id,
      eventTitle: reservation.eventTitle || reservation.event_title || 'Event Booking',
      eventDate: reservation.eventDate || reservation.event_date,
      startTime: reservation.start_time || '10:00 AM',
      endTime: reservation.end_time || '6:00 PM',
      guestCount: reservation.guestCount || reservation.guest_count || 0,
      totalAmount: reservation.totalAmount || reservation.total_amount || 0,
      downpaymentAmount: reservation.downpaymentAmount || reservation.downpayment_amount || 0,
      balanceAmount: reservation.balanceAmount || reservation.balance_amount || 0,
      status: reservation.status,
      contactPerson: reservation.customerInfo?.name || reservation.contact_person || '',
      contactEmail: reservation.customerInfo?.email || reservation.contact_email || '',
      contactPhone: reservation.customerInfo?.phone || reservation.contact_phone || '',
      room: room ? {
        name: room.name,
        capacity: room.capacity
      } : undefined,
      package: pkg ? {
        name: pkg.name,
        price: pkg.price,
        inclusions: pkg.inclusions || pkg.included_services || []
      } : undefined,
      createdAt: reservation.createdAt || reservation.created_at || new Date().toISOString()
    };
  };

  // Statistics calculation
  const stats = analytics ? [
    {
      title: 'Total Revenue',
      value: `₱${analytics.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      trend: analytics.revenueTrend || '+0%',
      color: 'text-green-600'
    },
    {
      title: 'Total Bookings',
      value: analytics.totalBookings?.toString() || reservations.length.toString(),
      icon: CalendarIcon,
      trend: analytics.bookingsTrend || '+0%',
      color: 'text-blue-600'
    },
    {
      title: 'Pending Payments',
      value: `₱${analytics.pendingPayments?.toLocaleString() || '0'}`,
      icon: Clock,
      trend: analytics.pendingTrend || '0%',
      color: 'text-orange-600'
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers?.toString() || users.length.toString(),
      icon: Users,
      trend: analytics.usersTrend || '+0%',
      color: 'text-purple-600'
    }
  ] : [];

  // Component render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.color}`}>
                    {stat.trend} from last month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-muted">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthlyBookings || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Utilization</CardTitle>
            <CardDescription>Booking rates by room type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.roomUtilization || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="room" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => navigate('/admin/manual-reservation')} className="w-full justify-start">
              <UserCheck className="w-4 h-4 mr-2" />
              New Walk-in Booking
            </Button>
            <Button onClick={() => navigate('/admin/invoices')} variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
            <Button onClick={() => navigate('/admin/calendar')} variant="outline" className="w-full justify-start">
              <CalendarIcon className="w-4 h-4 mr-2" />
              View Calendar
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>Latest bookings and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {reservation.customerInfo?.name || reservation.contact_person}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.eventTitle || reservation.event_title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reservation.eventDate || reservation.event_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInvoiceDialog(reservation)}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reservations</h2>
        <Button onClick={() => setIsManualReservationOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Walk-in
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search reservations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {reservation.customerInfo?.name || reservation.contact_person}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.customerInfo?.email || reservation.contact_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {reservation.eventTitle || reservation.event_title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.guestCount || reservation.guest_count} guests
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(reservation.eventDate || reservation.event_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ₱{(reservation.totalAmount || reservation.total_amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openInvoiceDialog(reservation)}
                        title="Generate Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReservation(reservation)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Admin Panel</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">{getCurrentMenuItem().label}</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container py-6">
              <Routes>
                <Route path="/" element={renderDashboard()} />
                <Route path="/reservations" element={renderReservations()} />
                <Route path="/calendar" element={<div>Calendar View</div>} />
                <Route path="/manual-reservation" element={<div>Manual Reservation</div>} />
                <Route path="/rooms" element={<div>Rooms Management</div>} />
                <Route path="/packages" element={<div>Packages Management</div>} />
                <Route path="/transactions" element={<div>Transactions</div>} />
                <Route path="/invoices" element={<div>Invoices Management</div>} />
                <Route path="/feedback" element={<div>Feedback Management</div>} />
                <Route path="/users" element={<div>Users Management</div>} />
                <Route path="/analytics" element={<div>Analytics</div>} />
                <Route path="/settings" element={<div>Settings</div>} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Invoice Dialog */}
        <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Invoice Generator</DialogTitle>
              <DialogDescription>
                Generate and manage invoice for reservation #{selectedReservation?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {selectedReservation && (
                <InvoiceGenerator
                  reservation={formatReservationForInvoice(selectedReservation)}
                  businessInfo={{
                    name: systemSettings.businessName,
                    address: systemSettings.businessAddress,
                    phone: systemSettings.businessPhone,
                    email: systemSettings.businessEmail,
                    logo: systemSettings.logo
                  }}
                  onClose={closeInvoiceDialog}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}