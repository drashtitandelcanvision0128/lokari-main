import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../config/db.js';
import { mapDbUserToFrontendUser } from '../utils/userMapper.js';
import { userWithProfileInclude } from '../utils/profileFields.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src/controllers/ → ../../ → backend/uploads/avatars
const AVATAR_DIR = path.resolve(__dirname, '../../uploads/avatars');

/** Build the public URL for an avatar path stored in DB */
const avatarPublicUrl = (req, avatarPath) => {
  if (!avatarPath) return null;
  // Already a full URL (e.g. legacy base64 or external)
  if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) return avatarPath;
  const origin = `${req.protocol}://${req.get('host')}`;
  return `${origin}${avatarPath}`;
};

/** GET /api/profile/me */
export const getMyProfile = async (req, res) => {
  try {
    const [user, defaultAddress] = await Promise.all([
      prisma.user.findUnique({
        where: { user_id: req.user.user_id },
        include: userWithProfileInclude,
      }),
      prisma.address.findFirst({
        where: { user_id: req.user.user_id, is_default: true },
      }),
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({
      success: true,
      data: {
        ...mapDbUserToFrontendUser(user),
        avatarUrl: avatarPublicUrl(req, user.profile?.avatar_url ?? null),
        bio: user.profile?.bio ?? null,
        address: defaultAddress
          ? {
              street:  defaultAddress.street,
              city:    defaultAddress.city,
              state:   defaultAddress.state,
              pincode: defaultAddress.pincode,
              country: defaultAddress.country,
            }
          : null,
      },
    });
  } catch (err) {
    console.error('getMyProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** PUT /api/profile/me — update name, phone, bio, address */
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, bio, address } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    const errors = {};

    if (name !== undefined) {
      const trimmed = (name || '').trim();
      if (!trimmed) {
        errors.name = 'Full name is required.';
      } else if (trimmed.length < 2) {
        errors.name = 'Name must be at least 2 characters.';
      } else if (trimmed.length > 80) {
        errors.name = 'Name must be 80 characters or fewer.';
      } else if (!/^[\p{L}\s'.,-]+$/u.test(trimmed)) {
        errors.name = 'Name contains invalid characters.';
      }
    }

    if (phone !== undefined && phone !== null && phone !== '') {
      const digits = (phone || '').replace(/^\+91\s?/, '').trim();
      if (!/^\d{10}$/.test(digits)) {
        errors.phone = 'Enter a valid 10-digit mobile number.';
      }
    }

    if (address) {
      const { street, city, state, pincode } = address;
      const streetTrim  = (street  || '').trim();
      const cityTrim    = (city    || '').trim();
      const stateTrim   = (state   || '').trim();
      const pincodeTrim = (pincode || '').trim();

      if (!streetTrim)               errors['address.street']  = 'Street address is required.';
      else if (streetTrim.length < 5) errors['address.street']  = 'Enter a more complete street address.';
      else if (streetTrim.length > 200) errors['address.street'] = 'Street address is too long.';

      if (!cityTrim)                 errors['address.city']    = 'City is required.';
      else if (cityTrim.length < 2)  errors['address.city']    = 'Enter a valid city name.';

      if (!stateTrim)                errors['address.state']   = 'Please select a state.';

      if (!pincodeTrim)              errors['address.pincode'] = 'Pincode is required.';
      else if (!/^\d{6}$/.test(pincodeTrim)) errors['address.pincode'] = 'Pincode must be exactly 6 digits.';
    }

    if (Object.keys(errors).length) {
      return res.status(422).json({ success: false, message: Object.values(errors)[0], errors });
    }
    // ── End validation ───────────────────────────────────────────────────────

    const updatedUser = await prisma.user.update({
      where: { user_id: req.user.user_id },
      data: {
        ...(name  !== undefined && { name:  name.trim()  }),
        ...(phone !== undefined && { phone: phone.trim() }),
      },
      include: userWithProfileInclude,
    });

    if (bio !== undefined) {
      await prisma.userProfile.upsert({
        where:  { user_id: req.user.user_id },
        update: { bio },
        create: { user_id: req.user.user_id, bio },
      });
    }

    // Upsert default address
    if (address) {
      const { street, city, state, pincode, country = 'India' } = address;
      const existing = await prisma.address.findFirst({
        where: { user_id: req.user.user_id, is_default: true },
      });

      if (existing) {
        await prisma.address.update({
          where: { address_id: existing.address_id },
          data: { street, city, state, pincode, country },
        });
      } else {
        await prisma.address.create({
          data: {
            user_id: req.user.user_id,
            street, city, state, pincode, country,
            is_default: true,
          },
        });
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated',
      data: mapDbUserToFrontendUser(updatedUser),
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Phone number already in use' });
    }
    console.error('updateMyProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** PUT /api/profile/me/avatar — multer writes file to disk, we store the path */
export const updateAvatarHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Delete old avatar file if it exists and differs from the new one
    const existing = await prisma.userProfile.findUnique({
      where: { user_id: req.user.user_id },
      select: { avatar_url: true },
    });

    if (existing?.avatar_url && !existing.avatar_url.startsWith('data:')) {
      const oldFile = path.join(AVATAR_DIR, path.basename(existing.avatar_url));
      if (fs.existsSync(oldFile) && oldFile !== req.file.path) {
        fs.unlinkSync(oldFile);
      }
    }

    // Store relative URL path (e.g. /uploads/avatars/uuid.jpg)
    const relPath = `/uploads/avatars/${req.file.filename}`;

    await prisma.userProfile.upsert({
      where:  { user_id: req.user.user_id },
      update: { avatar_url: relPath },
      create: { user_id: req.user.user_id, avatar_url: relPath },
    });

    const publicUrl = avatarPublicUrl(req, relPath);
    return res.json({ success: true, message: 'Avatar updated', avatarUrl: publicUrl });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('updateAvatarHandler error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** DELETE /api/profile/me/avatar */
export const deleteAvatarHandler = async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { user_id: req.user.user_id },
      select: { avatar_url: true },
    });

    // Remove file from disk
    if (profile?.avatar_url && !profile.avatar_url.startsWith('data:')) {
      const filePath = path.join(AVATAR_DIR, path.basename(profile.avatar_url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.userProfile.upsert({
      where:  { user_id: req.user.user_id },
      update: { avatar_url: null },
      create: { user_id: req.user.user_id },
    });

    return res.json({ success: true, message: 'Avatar removed' });
  } catch (err) {
    console.error('deleteAvatarHandler error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
