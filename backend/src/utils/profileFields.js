/** Build nested profile.create data for registration / admin user create. */
export function buildProfileCreateData(
  dbRole,
  { farmName, companyName, warehouseName, vehicleType, location, capacity, businessType },
) {
  const base = {
    company_name: companyName?.trim() || null,
    business_type: dbRole === 'TRADER' ? businessType?.trim() || null : null,
  };

  if (dbRole === 'FARMER') {
    return {
      ...base,
      farm_name: farmName?.trim() || null,
      farm_location: location?.trim() || null,
    };
  }

  if (dbRole === 'WAREHOUSE_OWNER') {
    return {
      ...base,
      warehouse_name: warehouseName?.trim() || null,
      warehouse_location: location?.trim() || null,
      capacity: capacity?.trim() || null,
    };
  }

  if (dbRole === 'TRANSPORTER') {
    return {
      ...base,
      vehicle_type: vehicleType?.trim() || null,
      service_area: location?.trim() || null,
    };
  }

  return base;
}

export const userWithProfileInclude = {
  profile: true,
};
