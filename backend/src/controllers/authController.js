import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';

// Helper to map DB user and profile to frontend user interface format
const mapDbUserToFrontendUser = (user, profile) => {
  const roleMappingReverse = {
    FARMER: 'farmer',
    TRADER: 'trader',
    WAREHOUSE_OWNER: 'warehouse',
    TRANSPORTER: 'transporter',
  };

  let location = undefined;
  if (user.role === 'FARMER') location = profile?.farm_location;
  else if (user.role === 'WAREHOUSE_OWNER') location = profile?.warehouse_location;
  else if (user.role === 'TRANSPORTER') location = profile?.service_area;

  return {
    id: user.user_id,
    fullName: user.name,
    email: user.email,
    phone: user.phone || undefined,
    role: roleMappingReverse[user.role] || 'farmer',
    status: user.is_verified ? 'active' : 'pending_kyc',
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
    location,
    farmName: profile?.farm_name || undefined,
    companyName: profile?.company_name || undefined,
    warehouseName: profile?.warehouse_name || undefined,
    vehicleType: profile?.vehicle_type || undefined,
  };
};

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      farmName,
      companyName,
      warehouseName,
      vehicleType,
      location,
      capacity,
      businessType,
    } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists by email
    const userExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if user already exists by phone
    if (phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone: phone.trim() },
      });
      if (phoneExists) {
        return res.status(400).json({ error: 'User already exists with this phone number' });
      }
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine db role
    const roleMapping = {
      farmer: 'FARMER',
      trader: 'TRADER',
      warehouse: 'WAREHOUSE_OWNER',
      transporter: 'TRANSPORTER',
    };
    const dbRole = roleMapping[role?.toLowerCase()] || 'FARMER';

    // Create User and Profile
    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: dbRole,
        profile: {
          create: {
            farm_name: farmName || null,
            farm_location: dbRole === 'FARMER' ? location : null,
            company_name: companyName || null,
            business_type: dbRole === 'TRADER' ? businessType : null,
            warehouse_name: warehouseName || null,
            warehouse_location: dbRole === 'WAREHOUSE_OWNER' ? location : null,
            capacity: dbRole === 'WAREHOUSE_OWNER' ? capacity : null,
            vehicle_type: dbRole === 'TRANSPORTER' ? vehicleType : null,
            service_area: dbRole === 'TRANSPORTER' ? location : null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate JWT Token
    const token = generateToken(user.user_id, res);

    res.status(201).json({
      status: 'success',
      data: {
        user: mapDbUserToFrontendUser(user, user.profile),
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    // Check if user exists by email or phone
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: email.trim() }],
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = generateToken(user.user_id, res);

    res.status(200).json({
      status: 'success',
      data: {
        user: mapDbUserToFrontendUser(user, user.profile),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({
      status: 'success',
      message: 'Logout successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout.' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Please provide current and new password." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ status: "success", message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Server error while changing password." });
  }
};

export { register, login, logout, changePassword };
