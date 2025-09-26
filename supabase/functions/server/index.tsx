import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client for server-side operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-714794f0/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default data if not exists
const initializeDefaultData = async () => {
  try {
    // Check if rooms exist
    const existingRooms = await kv.get("rooms");
    if (!existingRooms) {
      const defaultRooms = [
        {
          id: '1',
          name: 'Grand Ballroom',
          description: 'Elegant ballroom perfect for weddings and large celebrations',
          capacity: 200,
          price: 15000,
          images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'],
          amenities: ['Air Conditioning', 'Sound System', 'Stage', 'Dance Floor', 'Bridal Suite']
        },
        {
          id: '2',
          name: 'Garden Pavilion',
          description: 'Beautiful outdoor venue with garden views',
          capacity: 150,
          price: 12000,
          images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'],
          amenities: ['Garden Setting', 'Gazebo', 'Outdoor Lighting', 'Weather Protection']
        },
        {
          id: '3',
          name: 'Intimate Hall',
          description: 'Cozy space ideal for smaller gatherings',
          capacity: 80,
          price: 8000,
          images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
          amenities: ['Intimate Setting', 'Modern Decor', 'Audio Visual Equipment']
        }
      ];
      await kv.set("rooms", defaultRooms);
    }

    // Check if packages exist
    const existingPackages = await kv.get("packages");
    if (!existingPackages) {
      const defaultPackages = [
        {
          id: '1',
          name: 'Ultimate Wedding Package',
          description: 'Complete wedding celebration with all the essentials',
          price: 25000,
          duration: '8 hours',
          inclusions: [
            'Venue decoration', 'Bridal car', 'Photography (8 hours)',
            'Videography', 'Catering for 100 guests', 'Wedding cake',
            'Sound system', 'Lighting setup'
          ],
          images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800']
        },
        {
          id: '2',
          name: 'Birthday Celebration',
          description: 'Fun and memorable birthday party package',
          price: 15000,
          duration: '4 hours',
          inclusions: [
            'Themed decoration', 'Birthday cake', 'Photography (4 hours)',
            'Sound system', 'Party games', 'Catering for 50 guests'
          ],
          images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800']
        },
        {
          id: '3',
          name: 'Corporate Event',
          description: 'Professional package for business events',
          price: 20000,
          duration: '6 hours',
          inclusions: [
            'Professional setup', 'AV equipment', 'Stage setup',
            'Catering for 80 guests', 'Photography', 'Welcome refreshments'
          ],
          images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800']
        }
      ];
      await kv.set("packages", defaultPackages);
    }

    console.log("Default data initialized successfully");
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
};

// Initialize data on startup
initializeDefaultData();

// API Routes

// Get all rooms
app.get("/make-server-714794f0/rooms", async (c) => {
  try {
    const rooms = await kv.get("rooms") || [];
    return c.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return c.json({ error: "Failed to fetch rooms" }, 500);
  }
});

// Get all packages
app.get("/make-server-714794f0/packages", async (c) => {
  try {
    const packages = await kv.get("packages") || [];
    return c.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return c.json({ error: "Failed to fetch packages" }, 500);
  }
});

// Get all reservations
app.get("/make-server-714794f0/reservations", async (c) => {
  try {
    const reservations = await kv.get("reservations") || [];
    return c.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return c.json({ error: "Failed to fetch reservations" }, 500);
  }
});

// Create a new reservation
app.post("/make-server-714794f0/reservations", async (c) => {
  try {
    const body = await c.req.json();
    const { eventDate, roomId, packageId, guestCount, customerInfo, totalAmount, downpayment, balance } = body;

    // Validate required fields
    if (!eventDate || !roomId || !packageId || !guestCount || !customerInfo) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const reservationId = `RES${Date.now()}`;
    const reservation = {
      id: reservationId,
      eventDate,
      roomId,
      packageId,
      guestCount,
      customerInfo,
      totalAmount,
      downpayment,
      balance,
      status: 'pending',
      createdAt: new Date().toISOString(),
      specialRequests: customerInfo.specialRequests || ''
    };

    // Get existing reservations
    const existingReservations = await kv.get("reservations") || [];
    const updatedReservations = [...existingReservations, reservation];
    
    // Save to database
    await kv.set("reservations", updatedReservations);

    // Also save individual reservation for easy lookup
    await kv.set(`reservation:${reservationId}`, reservation);

    return c.json({ 
      success: true, 
      reservationId,
      message: "Reservation created successfully" 
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return c.json({ error: "Failed to create reservation" }, 500);
  }
});

// Update reservation status
app.put("/make-server-714794f0/reservations/:id", async (c) => {
  try {
    const reservationId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!status) {
      return c.json({ error: "Status is required" }, 400);
    }

    // Get existing reservations
    const reservations = await kv.get("reservations") || [];
    const reservationIndex = reservations.findIndex(r => r.id === reservationId);

    if (reservationIndex === -1) {
      return c.json({ error: "Reservation not found" }, 404);
    }

    // Update reservation
    reservations[reservationIndex].status = status;
    reservations[reservationIndex].updatedAt = new Date().toISOString();

    // Save back to database
    await kv.set("reservations", reservations);
    await kv.set(`reservation:${reservationId}`, reservations[reservationIndex]);

    return c.json({ 
      success: true, 
      message: "Reservation updated successfully" 
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return c.json({ error: "Failed to update reservation" }, 500);
  }
});

// Get feedback
app.get("/make-server-714794f0/feedback", async (c) => {
  try {
    const feedback = await kv.get("feedback") || [];
    return c.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return c.json({ error: "Failed to fetch feedback" }, 500);
  }
});

// Submit feedback
app.post("/make-server-714794f0/feedback", async (c) => {
  try {
    const body = await c.req.json();
    const { reservationId, customerInfo, rating, comment, isPublic } = body;

    if (!reservationId || !customerInfo || !rating || !comment) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const feedbackId = `FB${Date.now()}`;
    const feedbackItem = {
      id: feedbackId,
      reservationId,
      customerInfo,
      rating,
      comment,
      isPublic: isPublic !== undefined ? isPublic : false,
      createdAt: new Date().toISOString()
    };

    // Get existing feedback
    const existingFeedback = await kv.get("feedback") || [];
    const updatedFeedback = [...existingFeedback, feedbackItem];
    
    await kv.set("feedback", updatedFeedback);

    return c.json({ 
      success: true, 
      feedbackId,
      message: "Feedback submitted successfully" 
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// Get analytics data
app.get("/make-server-714794f0/analytics", async (c) => {
  try {
    const reservations = await kv.get("reservations") || [];
    
    // Calculate analytics
    const totalBookings = reservations.length;
    const totalRevenue = reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    
    const pendingPayments = reservations
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.balance || 0), 0);

    const activeUsers = new Set(reservations.map(r => r.customerInfo?.email)).size;

    // Monthly data (mock for now, could be calculated from actual dates)
    const monthlyBookings = [
      { month: 'Jan', bookings: 5, revenue: 125000 },
      { month: 'Feb', bookings: 8, revenue: 200000 },
      { month: 'Mar', bookings: 6, revenue: 150000 },
      { month: 'Apr', bookings: 10, revenue: 250000 },
      { month: 'May', bookings: 12, revenue: 300000 },
      { month: 'Jun', bookings: totalBookings, revenue: totalRevenue }
    ];

    const analytics = {
      totalBookings,
      totalRevenue,
      pendingPayments,
      activeUsers,
      revenueTrend: '+12.5%',
      bookingsTrend: '+8.2%',
      pendingTrend: '-5.1%',
      usersTrend: '+18.7%',
      monthlyBookings,
      roomUtilization: [
        { room: 'Grand Ballroom', utilization: 85 },
        { room: 'Garden Pavilion', utilization: 70 },
        { room: 'Intimate Hall', utilization: 60 }
      ]
    };

    return c.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

// ============================================
// ADMIN AUTHENTICATION ROUTES
// ============================================

// Admin login
app.post("/make-server-714794f0/auth/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    // Simple admin authentication (in production, use proper password hashing)
    const validAdmins = [
      { username: 'admin', password: 'admin123', role: 'admin', id: 'admin-1', email: 'admin@eventspace.com' },
      { username: 'manager', password: 'manager123', role: 'manager', id: 'manager-1', email: 'manager@eventspace.com' }
    ];

    const admin = validAdmins.find(a => a.username === username && a.password === password);
    
    if (!admin) {
      return c.json({ success: false, error: "Invalid credentials" }, 401);
    }

    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.role === 'admin' 
        ? ['manage_users', 'manage_rooms', 'manage_reservations', 'view_analytics', 'manage_packages', 'manage_feedback']
        : ['manage_reservations', 'view_analytics']
    };

    return c.json({
      success: true,
      admin: adminData,
      token: `admin-token-${Date.now()}`
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    return c.json({ success: false, error: "Authentication failed" }, 500);
  }
});

// ============================================
// ADMIN ROOM MANAGEMENT ROUTES
// ============================================

// Create room
app.post("/make-server-714794f0/rooms", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, capacity, hourlyRate, dailyRate, features, images } = body;

    if (!name || !description || !capacity) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const roomId = `ROOM${Date.now()}`;
    const newRoom = {
      id: roomId,
      name,
      description,
      capacity: parseInt(capacity),
      price: parseFloat(dailyRate) || parseFloat(hourlyRate) || 0,
      hourlyRate: parseFloat(hourlyRate) || 0,
      dailyRate: parseFloat(dailyRate) || 0,
      amenities: features || [],
      images: images || [],
      createdAt: new Date().toISOString()
    };

    // Get existing rooms
    const existingRooms = await kv.get("rooms") || [];
    const updatedRooms = [...existingRooms, newRoom];
    
    await kv.set("rooms", updatedRooms);

    return c.json({
      success: true,
      roomId,
      message: "Room created successfully"
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return c.json({ error: "Failed to create room" }, 500);
  }
});

// Update room
app.put("/make-server-714794f0/rooms/:id", async (c) => {
  try {
    const roomId = c.req.param("id");
    const body = await c.req.json();

    const rooms = await kv.get("rooms") || [];
    const roomIndex = rooms.findIndex(r => r.id === roomId);

    if (roomIndex === -1) {
      return c.json({ error: "Room not found" }, 404);
    }

    // Update room
    rooms[roomIndex] = { ...rooms[roomIndex], ...body, updatedAt: new Date().toISOString() };
    await kv.set("rooms", rooms);

    return c.json({
      success: true,
      message: "Room updated successfully"
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return c.json({ error: "Failed to update room" }, 500);
  }
});

// Delete room
app.delete("/make-server-714794f0/rooms/:id", async (c) => {
  try {
    const roomId = c.req.param("id");

    const rooms = await kv.get("rooms") || [];
    const filteredRooms = rooms.filter(r => r.id !== roomId);

    if (rooms.length === filteredRooms.length) {
      return c.json({ error: "Room not found" }, 404);
    }

    await kv.set("rooms", filteredRooms);

    return c.json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return c.json({ error: "Failed to delete room" }, 500);
  }
});

// ============================================
// ADMIN PACKAGE MANAGEMENT ROUTES
// ============================================

// Create package
app.post("/make-server-714794f0/packages", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, price, duration, maxGuests, inclusions, addOns } = body;

    if (!name || !description || !price) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const packageId = `PKG${Date.now()}`;
    const newPackage = {
      id: packageId,
      name,
      description,
      price: parseFloat(price),
      duration: duration || '',
      maxGuests: parseInt(maxGuests) || 100,
      inclusions: inclusions || [],
      addOns: addOns || [],
      images: [`https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800`],
      createdAt: new Date().toISOString()
    };

    // Get existing packages
    const existingPackages = await kv.get("packages") || [];
    const updatedPackages = [...existingPackages, newPackage];
    
    await kv.set("packages", updatedPackages);

    return c.json({
      success: true,
      packageId,
      message: "Package created successfully"
    });
  } catch (error) {
    console.error("Error creating package:", error);
    return c.json({ error: "Failed to create package" }, 500);
  }
});

// Update package
app.put("/make-server-714794f0/packages/:id", async (c) => {
  try {
    const packageId = c.req.param("id");
    const body = await c.req.json();

    const packages = await kv.get("packages") || [];
    const packageIndex = packages.findIndex(p => p.id === packageId);

    if (packageIndex === -1) {
      return c.json({ error: "Package not found" }, 404);
    }

    // Update package
    packages[packageIndex] = { ...packages[packageIndex], ...body, updatedAt: new Date().toISOString() };
    await kv.set("packages", packages);

    return c.json({
      success: true,
      message: "Package updated successfully"
    });
  } catch (error) {
    console.error("Error updating package:", error);
    return c.json({ error: "Failed to update package" }, 500);
  }
});

// Delete package
app.delete("/make-server-714794f0/packages/:id", async (c) => {
  try {
    const packageId = c.req.param("id");

    const packages = await kv.get("packages") || [];
    const filteredPackages = packages.filter(p => p.id !== packageId);

    if (packages.length === filteredPackages.length) {
      return c.json({ error: "Package not found" }, 404);
    }

    await kv.set("packages", filteredPackages);

    return c.json({
      success: true,
      message: "Package deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    return c.json({ error: "Failed to delete package" }, 500);
  }
});

// ============================================
// ADMIN FEEDBACK MANAGEMENT ROUTES
// ============================================

// Update feedback visibility
app.put("/make-server-714794f0/feedback/:id", async (c) => {
  try {
    const feedbackId = c.req.param("id");
    const body = await c.req.json();
    const { isPublic } = body;

    const feedback = await kv.get("feedback") || [];
    const feedbackIndex = feedback.findIndex(f => f.id === feedbackId);

    if (feedbackIndex === -1) {
      return c.json({ error: "Feedback not found" }, 404);
    }

    // Update feedback
    feedback[feedbackIndex].isPublic = isPublic;
    feedback[feedbackIndex].updatedAt = new Date().toISOString();
    
    await kv.set("feedback", feedback);

    return c.json({
      success: true,
      message: "Feedback visibility updated successfully"
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return c.json({ error: "Failed to update feedback" }, 500);
  }
});

// Delete feedback
app.delete("/make-server-714794f0/feedback/:id", async (c) => {
  try {
    const feedbackId = c.req.param("id");

    const feedback = await kv.get("feedback") || [];
    const filteredFeedback = feedback.filter(f => f.id !== feedbackId);

    if (feedback.length === filteredFeedback.length) {
      return c.json({ error: "Feedback not found" }, 404);
    }

    await kv.set("feedback", filteredFeedback);

    return c.json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return c.json({ error: "Failed to delete feedback" }, 500);
  }
});

// ============================================
// DATABASE-POWERED ROUTES
// ============================================

// Get rooms from database
app.get("/make-server-714794f0/db/rooms", async (c) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching rooms:', error);
      return c.json({ error: "Failed to fetch rooms from database" }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error("Error fetching rooms from database:", error);
    return c.json({ error: "Failed to fetch rooms" }, 500);
  }
});

// Get packages from database
app.get("/make-server-714794f0/db/packages", async (c) => {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching packages:', error);
      return c.json({ error: "Failed to fetch packages from database" }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error("Error fetching packages from database:", error);
    return c.json({ error: "Failed to fetch packages" }, 500);
  }
});

// Get reservations from database with relations
app.get("/make-server-714794f0/db/reservations", async (c) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        rooms(id, name, capacity),
        packages(id, name, price),
        events(id, title, category),
        users(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching reservations:', error);
      return c.json({ error: "Failed to fetch reservations from database" }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error("Error fetching reservations from database:", error);
    return c.json({ error: "Failed to fetch reservations" }, 500);
  }
});

// Create reservation in database
app.post("/make-server-714794f0/db/reservations", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      user_id,
      room_id, 
      package_id, 
      event_id,
      event_title,
      event_date,
      start_time,
      end_time,
      guest_count,
      base_amount,
      total_amount,
      downpayment_amount,
      balance_amount,
      contact_person,
      contact_phone,
      contact_email,
      special_requests,
      additional_services
    } = body;

    // Validate required fields
    if (!room_id || !event_title || !event_date || !start_time || !end_time || !guest_count || !contact_person || !contact_phone || !contact_email) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check room availability
    const { data: conflicts, error: conflictError } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_id', room_id)
      .eq('event_date', event_date)
      .in('status', ['confirmed', 'pending'])
      .or(`and(start_time.lt.${end_time},end_time.gt.${start_time})`);

    if (conflictError) {
      console.error('Error checking room availability:', conflictError);
      return c.json({ error: "Failed to check room availability" }, 500);
    }

    if (conflicts && conflicts.length > 0) {
      return c.json({ error: "Room is not available for the selected time slot" }, 409);
    }

    // Calculate payment amounts if not provided
    const calculatedTotal = total_amount || base_amount || 0;
    const calculatedDownpayment = downpayment_amount || (calculatedTotal * 0.30);
    const calculatedBalance = balance_amount || (calculatedTotal - calculatedDownpayment);

    const reservationData = {
      user_id,
      room_id,
      package_id,
      event_id,
      event_title,
      event_date,
      start_time,
      end_time,
      guest_count: parseInt(guest_count),
      base_amount: parseFloat(base_amount) || 0,
      total_amount: parseFloat(calculatedTotal),
      downpayment_amount: parseFloat(calculatedDownpayment),
      balance_amount: parseFloat(calculatedBalance),
      contact_person,
      contact_phone,
      contact_email,
      special_requests: special_requests || null,
      additional_services: additional_services || [],
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select(`
        *,
        rooms(name),
        packages(name)
      `)
      .single();

    if (error) {
      console.error('Database error creating reservation:', error);
      return c.json({ error: "Failed to create reservation in database" }, 500);
    }

    // Create initial downpayment record
    if (calculatedDownpayment > 0) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          reservation_id: data.id,
          amount: calculatedDownpayment,
          payment_type: 'downpayment',
          status: 'pending'
        }]);

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
      }
    }

    return c.json({
      success: true,
      reservation: data,
      reservationId: data.id,
      message: "Reservation created successfully"
    });
  } catch (error) {
    console.error("Error creating reservation in database:", error);
    return c.json({ error: "Failed to create reservation" }, 500);
  }
});

// Update reservation status in database
app.put("/make-server-714794f0/db/reservations/:id", async (c) => {
  try {
    const reservationId = c.req.param("id");
    const body = await c.req.json();
    const { status, cancellation_reason } = body;

    if (!status) {
      return c.json({ error: "Status is required" }, 400);
    }

    const updateData: any = { status };
    
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      if (cancellation_reason) {
        updateData.cancellation_reason = cancellation_reason;
      }
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating reservation:', error);
      return c.json({ error: "Failed to update reservation in database" }, 500);
    }

    return c.json({
      success: true,
      reservation: data,
      message: "Reservation updated successfully"
    });
  } catch (error) {
    console.error("Error updating reservation in database:", error);
    return c.json({ error: "Failed to update reservation" }, 500);
  }
});

// Get feedback from database
app.get("/make-server-714794f0/db/feedback", async (c) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        reservations(
          id,
          event_title,
          event_date,
          rooms(name)
        ),
        users(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching feedback:', error);
      return c.json({ error: "Failed to fetch feedback from database" }, 500);
    }

    return c.json(data || []);
  } catch (error) {
    console.error("Error fetching feedback from database:", error);
    return c.json({ error: "Failed to fetch feedback" }, 500);
  }
});

// Create feedback in database
app.post("/make-server-714794f0/db/feedback", async (c) => {
  try {
    const body = await c.req.json();
    const { reservation_id, user_id, rating, title, comment, is_public } = body;

    if (!reservation_id || !rating || !comment) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const feedbackData = {
      reservation_id,
      user_id,
      rating: parseInt(rating),
      title: title || null,
      comment,
      is_public: is_public || false,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select(`
        *,
        reservations(event_title),
        users(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Database error creating feedback:', error);
      return c.json({ error: "Failed to create feedback in database" }, 500);
    }

    return c.json({
      success: true,
      feedback: data,
      feedbackId: data.id,
      message: "Feedback submitted successfully"
    });
  } catch (error) {
    console.error("Error creating feedback in database:", error);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// Get analytics from database
app.get("/make-server-714794f0/db/analytics", async (c) => {
  try {
    // Get reservations data
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, status, total_amount, created_at, event_date');

    if (reservationsError) {
      console.error('Error fetching reservations for analytics:', reservationsError);
      return c.json({ error: "Failed to fetch analytics data" }, 500);
    }

    // Get payments data
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status, created_at, payment_type');

    if (paymentsError) {
      console.error('Error fetching payments for analytics:', paymentsError);
      return c.json({ error: "Failed to fetch payments data" }, 500);
    }

    // Get users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    if (usersError) {
      console.error('Error fetching users count:', usersError);
    }

    // Get feedback data
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('rating');

    if (feedbackError) {
      console.error('Error fetching feedback for analytics:', feedbackError);
    }

    // Calculate metrics
    const totalBookings = reservations?.length || 0;
    const confirmedBookings = reservations?.filter(r => r.status === 'confirmed' || r.status === 'completed').length || 0;
    
    const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const pendingPayments = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    const activeUsers = usersCount || 0;
    const averageRating = feedback?.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0;

    // Generate monthly data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString();

      const monthReservations = reservations?.filter(r => {
        return r.created_at >= monthStart && r.created_at <= monthEnd;
      }) || [];

      const monthPayments = payments?.filter(p => {
        return p.created_at >= monthStart && p.created_at <= monthEnd && p.status === 'paid';
      }) || [];

      monthlyData.push({
        month: monthDate.toLocaleDateString('en', { month: 'short' }),
        bookings: monthReservations.length,
        revenue: monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      });
    }

    const analytics = {
      totalBookings,
      confirmedBookings,
      totalRevenue,
      pendingPayments,
      activeUsers,
      averageRating: Math.round(averageRating * 10) / 10,
      revenueTrend: '+12.5%',
      bookingsTrend: '+8.2%',
      pendingTrend: '-5.1%',
      usersTrend: '+18.7%',
      monthlyBookings: monthlyData,
      roomUtilization: [
        { room: 'Grand Ballroom', utilization: 85 },
        { room: 'Garden Pavilion', utilization: 70 },
        { room: 'Intimate Hall', utilization: 60 }
      ]
    };

    return c.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics from database:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

// Check room availability
app.post("/make-server-714794f0/db/check-availability", async (c) => {
  try {
    const body = await c.req.json();
    const { room_id, event_date, start_time, end_time } = body;

    if (!room_id || !event_date || !start_time || !end_time) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data: conflicts, error } = await supabase
      .from('reservations')
      .select('id, start_time, end_time')
      .eq('room_id', room_id)
      .eq('event_date', event_date)
      .in('status', ['confirmed', 'pending']);

    if (error) {
      console.error('Error checking room availability:', error);
      return c.json({ error: "Failed to check availability" }, 500);
    }

    // Check for time conflicts
    const hasConflict = conflicts?.some(reservation => {
      return (start_time < reservation.end_time && end_time > reservation.start_time);
    }) || false;

    return c.json({
      available: !hasConflict,
      conflicts: hasConflict ? conflicts : []
    });
  } catch (error) {
    console.error("Error checking room availability:", error);
    return c.json({ error: "Failed to check availability" }, 500);
  }
});

// ============================================
// ADDITIONAL ADMIN ROUTES
// ============================================

// Get users (mock data for now)
app.get("/make-server-714794f0/users", async (c) => {
  try {
    // Extract unique users from reservations
    const reservations = await kv.get("reservations") || [];
    const users = reservations.map(r => ({
      id: `user-${r.customerInfo?.email?.replace(/[^a-zA-Z0-9]/g, '')}`,
      name: r.customerInfo?.name,
      email: r.customerInfo?.email,
      phone: r.customerInfo?.phone,
      createdAt: r.createdAt
    }));

    // Remove duplicates
    const uniqueUsers = users.reduce((acc, user) => {
      if (!acc.find(u => u.email === user.email)) {
        acc.push(user);
      }
      return acc;
    }, []);

    return c.json(uniqueUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Get payments (mock data for now)
app.get("/make-server-714794f0/payments", async (c) => {
  try {
    const reservations = await kv.get("reservations") || [];
    const payments = [];

    reservations.forEach(reservation => {
      // Add downpayment
      if (reservation.downpayment > 0) {
        payments.push({
          id: `PAY${reservation.id}DOWN`,
          reservationId: reservation.id,
          amount: reservation.downpayment,
          type: 'downpayment',
          status: 'completed',
          method: 'credit_card',
          paidAt: reservation.createdAt
        });
      }

      // Add balance payment if completed
      if (reservation.status === 'completed' && reservation.balance > 0) {
        payments.push({
          id: `PAY${reservation.id}BAL`,
          reservationId: reservation.id,
          amount: reservation.balance,
          type: 'balance',
          status: 'completed',
          method: 'credit_card',
          paidAt: reservation.updatedAt || reservation.createdAt
        });
      }
    });

    return c.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return c.json({ error: "Failed to fetch payments" }, 500);
  }
});

// Export reservations
app.post("/make-server-714794f0/export/reservations", async (c) => {
  try {
    const body = await c.req.json();
    // In a real implementation, you would generate a CSV/Excel file
    // For now, just return success
    return c.json({
      success: true,
      downloadUrl: '#',
      message: 'Export completed successfully'
    });
  } catch (error) {
    console.error("Error exporting reservations:", error);
    return c.json({ error: "Failed to export reservations" }, 500);
  }
});

Deno.serve(app.fetch);