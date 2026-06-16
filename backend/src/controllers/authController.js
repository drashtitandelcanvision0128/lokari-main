import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import { authCookieOptions } from '../middleware/authMiddleware.js';
import { mapDbUserToFrontendUser, toDbRole } from '../utils/userMapper.js';
import { buildProfileCreateData, userWithProfileInclude } from '../utils/profileFields.js';
import { verifyOtp, consumeRegistrationVerified } from '../services/otpService.js';

const findActiveUserByIdentifier = async (identifier) => {
  const trimmed = identifier.trim();
  const normalizedEmail = trimmed.toLowerCase();

  return prisma.user.findFirst({
    where: {
      is_deleted: false,
      OR: [{ email: normalizedEmail }, { phone: trimmed }],
    },
    include: userWithProfileInclude,
  });
};

const sendAuthSuccess = (res, statusCode, user) => {
  const token = generateToken(user, res);
  return res.status(statusCode).json({
    status: 'success',
    data: {
      user: mapDbUserToFrontendUser(user),
      token,
    },
  });
};

const register = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Request body is empty',
        hint:
          'In Postman: Body → raw → JSON, and set header Content-Type: application/json. Do not use form-data.',
      });
    }

    const {
      fullName: fullNameField,
      name,
      email,
      phone,
      password,
      role,
      otp: otpField,
      otpCode,
      farmName,
      companyName,
      warehouseName,
      vehicleType,
      location,
      capacity,
      businessType,
    } = req.body;

    const fullName = fullNameField || name;
    const otp = otpField || otpCode;

    const missing = [];
    if (!fullName?.trim()) missing.push('fullName');
    if (!email?.trim()) missing.push('email');
    if (!password) missing.push('password');
    if (!role?.trim()) missing.push('role');

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (otp?.trim()) {
        await verifyOtp(normalizedEmail, otp, 'register');
      } else {
        await consumeRegistrationVerified(normalizedEmail);
      }
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }

    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    if (phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone: phone.trim() },
      });
      if (phoneExists) {
        return res.status(400).json({ error: 'User already exists with this phone number' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const dbRole = toDbRole(role);

    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: dbRole,
        profile: {
          create: buildProfileCreateData(dbRole, {
            farmName,
            companyName,
            warehouseName,
            vehicleType,
            location,
            capacity,
            businessType,
          }),
        },
      },
      include: userWithProfileInclude,
    });

    return sendAuthSuccess(res, 201, user);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const user = await findActiveUserByIdentifier(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    return sendAuthSuccess(res, 200, user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      ...authCookieOptions,
      expires: new Date(0),
    });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout.' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    // const userId = req.user.id;
    const userId = req.user.user_id;
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
