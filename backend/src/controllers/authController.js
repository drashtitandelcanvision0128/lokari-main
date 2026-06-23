import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import { authCookieOptions } from '../middleware/authMiddleware.js';
import { mapDbUserToFrontendUser, toDbRole } from '../utils/userMapper.js';
import { buildProfileCreateData, userWithProfileInclude } from '../utils/profileFields.js';
import { verifyOtp, consumeRegistrationVerified, createAndSendOtp } from '../services/otpService.js';

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
      street,
      city,
      state,
      pincode,
      country,
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
        addresses: {
          create: [
            {
              street: street?.trim() || 'Not Provided',
              city: city?.trim() || 'Not Provided',
              state: state?.trim() || 'Not Provided',
              pincode: pincode?.trim() || 'Not Provided',
              country: country?.trim() || 'Not Provided',
              is_default: true,
            },
          ],
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

const authenticateWithPassword = async (email, password) => {
  if (!email?.trim() || !password) {
    const error = new Error('Please provide both email and password');
    error.statusCode = 400;
    throw error;
  }

  const user = await findActiveUserByIdentifier(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error('Account suspended. Contact support.');
    error.statusCode = 403;
    throw error;
  }

  return user;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateWithPassword(email, password);

    if (user.role === 'ADMIN') {
      return res.status(403).json({
        error: 'Admin accounts must sign in at the admin login page.',
      });
    }

    return sendAuthSuccess(res, 200, user);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateWithPassword(email, password);

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin account required.' });
    }

    return sendAuthSuccess(res, 200, user);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Admin login error:', error);
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findActiveUserByIdentifier(email);

    if (user) {
      await createAndSendOtp(email, 'reset_password');
    }

    return res.status(200).json({
      status: 'success',
      message:
        "If an account exists with that email, we've sent a verification code to reset your password.",
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to process password reset request.',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email?.trim() || !otp?.trim() || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const user = await findActiveUserByIdentifier(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset request.' });
    }

    try {
      await verifyOtp(email, otp, 'reset_password');
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error while resetting password.' });
  }
};

export { register, login, adminLogin, logout, changePassword, forgotPassword, resetPassword };
