// Clear old orders since we switched to completely new sports products
if (localStorage.getItem('orders')) {
    const oldOrders = JSON.parse(localStorage.getItem('orders'));
    // Check if orders contain old product IDs (UUID format)
    const hasOldProducts = oldOrders.some(order => 
        order.products && order.products.some(product => 
            product.productId && product.productId.includes('-') && product.productId.length > 20
        )
    );
    
    if (hasOldProducts) {
        console.log('Clearing old orders with incompatible product IDs...');
        localStorage.removeItem('orders');
    }
}

export const orders = JSON.parse(localStorage.getItem('orders')) || [];

export function addOrder(order) {
  orders.unshift(order);
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

export function getOrder(orderId) {
  let matchingOrder;

  orders.forEach((order) => {
    if (order.id === orderId) {
      matchingOrder = order;
    }
  });

  return matchingOrder;
}