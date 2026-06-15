export const mapDbUserToFrontendUser = (user) => {
  const profile = user.profile;

  let location;
  if (user.role === 'FARMER') location = profile?.farm_location;
  else if (user.role === 'WAREHOUSE_OWNER') location = profile?.warehouse_location;
  else if (user.role === 'TRANSPORTER') location = profile?.service_area;

  return {
    id: user.user_id,
    fullName: user.name,
    email: user.email,
    phone: user.phone || undefined,
    role: toFrontendRole(user.role),
    status: user.is_verified ? 'active' : 'pending_kyc',
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
    location: location || undefined,
    farmName: profile?.farm_name || undefined,
    companyName: profile?.company_name || undefined,
    warehouseName: profile?.warehouse_name || undefined,
    vehicleType: profile?.vehicle_type || undefined,
  };
};

const FRONTEND_TO_DB_ROLE = {
  farmer: 'FARMER',
  trader: 'TRADER',
  warehouse: 'WAREHOUSE_OWNER',
  transporter: 'TRANSPORTER',
  admin: 'ADMIN',
};

const DB_TO_FRONTEND_ROLE = {
  FARMER: 'farmer',
  TRADER: 'trader',
  WAREHOUSE_OWNER: 'warehouse',
  TRANSPORTER: 'transporter',
  ADMIN: 'admin',
};

export const toDbRole = (role) =>
  FRONTEND_TO_DB_ROLE[role?.toLowerCase()] ?? 'FARMER';

export const toFrontendRole = (role) =>
  DB_TO_FRONTEND_ROLE[role] ?? 'farmer';
