// Simple test to verify seller role filter functionality
const { mockAdminOrders, mockAdminUsers } = require('./data/adminMock.ts');

// Mock the getUserRoleById function
const getUserRoleById = (userId) => {
  const user = mockAdminUsers.find(u => u.id === userId);
  return user?.role || 'unknown';
};

// Test the filter logic
const testSellerRoleFilter = (selectedSellerRole) => {
  const filteredOrders = mockAdminOrders.filter(order => {
    const sellerRole = getUserRoleById(order.seller.id);
    const matchesSellerRole = selectedSellerRole === 'all' || sellerRole === selectedSellerRole;
    return matchesSellerRole;
  });
  
  console.log(`\n=== Testing Seller Role Filter: ${selectedSellerRole} ===`);
  console.log(`Found ${filteredOrders.length} orders:`);
  
  filteredOrders.forEach(order => {
    const sellerRole = getUserRoleById(order.seller.id);
    console.log(`- Order ${order.id}: Seller ${order.seller.name} (${sellerRole}) - ${order.listingTitle}`);
  });
  
  return filteredOrders;
};

// Run tests
console.log('=== Seller Role Filter Test ===');
console.log('Available users and their roles:');
mockAdminUsers.forEach(user => {
  console.log(`- ${user.name} (${user.id}): ${user.role}`);
});

testSellerRoleFilter('all');
testSellerRoleFilter('farmer');
testSellerRoleFilter('warehouse');
testSellerRoleFilter('transporter');

console.log('\n=== Test Complete ===');
