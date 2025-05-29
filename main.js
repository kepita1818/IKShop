// --- CONSTANTES Y DATOS ---

const ADMIN_USER = {
  username: 'kepita1818',
  password: 'Kepita9361@',
  role: 'admin'
};

const products = [
  { id: 1, name: "Perfume Louis Vuitton Ombre Nomade", price: 50, image: "https://perfume-malaysia.com/wp-content/uploads/2015/09/LV-OMBRE-NOMADE-462x404.jpg" },
  { id: 2, name: "Airpods Pro2 USB-C ANC", price: 30, image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-pro-2-202409-gallery-1?wid=2824&hei=2400&fmt=jpeg&qlt=90&.v=V3lwSGNUa3E5M1VnNVZBT1RDR3Y2NS9rS3dwK1hySWg2QW9tQ1lqaSsxQXFlellpcE56OWNsOHBzVkJLWjdrYWJGcXNRQnFCV0w3WVRjTExvdm1ic1EvTVdVZ0JiQWtXQjFVOE5MY25KUnVIaWV5SG1KWWRSb1RMSkNqUDJYZHY" },
  { id: 3, name: "Vapers", price: 20-22, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf-6rPKpfYpvnU7Cyjzs3b-H99UrOfmxONzw&s" }
  ]

// --- SESIÓN ---

function getLoggedUser() {
  const userStr = sessionStorage.getItem('loggedUser');
  if (!userStr) return null;
  try { return JSON.parse(userStr); }
  catch { return null; }
}

function setLoggedUser(user) {
  sessionStorage.setItem('loggedUser', JSON.stringify(user));
}

function logout() {
  sessionStorage.removeItem('loggedUser');
  window.location.href = 'login.html';
}

// --- AUTORIZACIÓN ---

function protectPageForRoles(allowedRoles = []) {
  const user = getLoggedUser();
  if (!user || !allowedRoles.includes(user.role)) {
    alert('No tienes permiso para acceder a esta página.');
    window.location.href = 'login.html';
  }
}

// --- REGISTRO ---

function registerUser(username, password) {
  if (!username || !password) {
    alert('Por favor, rellena todos los campos.');
    return;
  }
  username = username.toLowerCase();

  let users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.find(u => u.username === username)) {
    alert('El usuario ya existe. Elige otro.');
    return;
  }

  users.push({ username, password, role: 'cliente' });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registro correcto. Ahora puedes iniciar sesión.');
  window.location.href = 'login.html';
}

// --- LOGIN ---

function loginUser(username, password) {
  if (!username || !password) {
    alert('Por favor, rellena todos los campos.');
    return;
  }
  username = username.toLowerCase();

  let users = JSON.parse(localStorage.getItem('users')) || [];

  const allUsers = [...users, ADMIN_USER];

  const user = allUsers.find(u => u.username === username && u.password === password);

  if (!user) {
    alert('Usuario o contraseña incorrectos.');
    return;
  }

  setLoggedUser(user);

  if (user.role === 'admin') window.location.href = 'admin_panel.html';
  else window.location.href = 'cliente_panel.html';
}

// --- PRODUCTOS ---

function loadProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  productList.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'col-md-4 mb-3';
    div.innerHTML = `
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">€${product.price.toFixed(2)}</p>
          <button class="btn btn-primary mt-auto" onclick="addToCart(${product.id})">Agregar al Carrito</button>
        </div>
      </div>
    `;
    productList.appendChild(div);
  });
}

// --- CARRITO ---

function addToCart(productId) {
  const user = getLoggedUser();
  if (!user) {
    alert('Debes iniciar sesión para añadir productos al carrito.');
    window.location.href = 'login.html';
    return;
  }

  const product = products.find(p => p.id === productId);
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem('cart_' + user.username)) || [];
  cart.push(product);
  localStorage.setItem('cart_' + user.username, JSON.stringify(cart));
  updateCartCount();
  alert('Producto añadido al carrito');
}

function loadCart() {
  const user = getLoggedUser();
  if (!user) {
    alert('Debes iniciar sesión para ver el carrito.');
    window.location.href = 'login.html';
    return;
  }

  const cartItems = document.getElementById('cart-items');
  const totalPrice = document.getElementById('total-price');
  if (!cartItems || !totalPrice) return;

  let cart = JSON.parse(localStorage.getItem('cart_' + user.username)) || [];
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      ${item.name} - €${item.price.toFixed(2)}
      <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Eliminar</button>
    `;
    cartItems.appendChild(li);
    total += item.price;
  });

  totalPrice.textContent = total.toFixed(2);
}

function removeFromCart(index) {
  const user = getLoggedUser();
  if (!user) return;

  let cart = JSON.parse(localStorage.getItem('cart_' + user.username)) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart_' + user.username, JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function updateCartCount() {
  const user = getLoggedUser();
  const cartCount = document.getElementById('cart-count');
  if (!cartCount) return;

  if (!user) {
    cartCount.textContent = '0';
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart_' + user.username)) || [];
  cartCount.textContent = cart.length;
}

// --- PEDIDOS ---

function createOrder() {
  const user = getLoggedUser();
  if (!user) {
    alert('Debes iniciar sesión para hacer un pedido.');
    window.location.href = 'login.html';
    return null;
  }

  let cart = JSON.parse(localStorage.getItem('cart_' + user.username)) || [];
  if (cart.length === 0) {
    alert('El carrito está vacío.');
    return null;
  }

  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  const newOrder = {
    id: orders.length + 1,
    user: user.username,
    items: cart,
    total: cart.reduce((sum, p) => sum + p.price, 0),
    status: 'creado',
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  // Vaciar carrito
  localStorage.setItem('cart_' + user.username, JSON.stringify([]));
  updateCartCount();
  alert('Pedido realizado correctamente. Código pedido: ' + newOrder.id);
  return newOrder;
}

function loadUserOrders() {
  const user = getLoggedUser();
  if (!user) {
    alert('Debes iniciar sesión para ver tus pedidos.');
    window.location.href = 'login.html';
    return;
  }

  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const userOrders = orders.filter(o => o.user === user.username);

  ordersList.innerHTML = '';

  if(userOrders.length === 0){
    ordersList.innerHTML = '<p>No tienes pedidos realizados.</p>';
    return;
  }

  userOrders.forEach(order => {
    const div = document.createElement('div');
    div.className = 'card mb-3';
    div.innerHTML = `
      <div class="card-header">Pedido #${order.id} - Estado: ${order.status}</div>
      <ul class="list-group list-group-flush">
        ${order.items.map(i => `<li class="list-group-item">${i.name} - €${i.price.toFixed(2)}</li>`).join('')}
      </ul>
      <div class="card-footer">
        <strong>Total: €${order.total.toFixed(2)}</strong> <br/>
        Fecha: ${new Date(order.date).toLocaleString()}
      </div>
    `;
    ordersList.appendChild(div);
  });
}

// --- PANEL ADMIN ---

function loadAllOrdersAdmin() {
  protectPageForRoles(['admin']);

  const ordersList = document.getElementById('admin-orders-list');
  if (!ordersList) return;

  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  if (orders.length === 0) {
    ordersList.innerHTML = '<p>No hay pedidos realizados aún.</p>';
    return;
  }

  ordersList.innerHTML = '';

  orders.forEach(order => {
    const div = document.createElement('div');
    div.className = 'card mb-3';
    div.innerHTML = `
      <div class="card-header">
        Pedido #${order.id} - Usuario: ${order.user} - Estado:
        <select onchange="changeOrderStatus(${order.id}, this.value)">
          <option value="creado" ${order.status === 'creado' ? 'selected' : ''}>Creado</option>
          <option value="procesando" ${order.status === 'procesando' ? 'selected' : ''}>Procesando</option>
          <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
          <option value="recibido" ${order.status === 'recibido' ? 'selected' : ''}>Recibido</option>
        </select>
      </div>
      <ul class="list-group list-group-flush">
        ${order.items.map(i => `<li class="list-group-item">${i.name} - €${i.price.toFixed(2)}</li>`).join('')}
      </ul>
      <div class="card-footer">
        <strong>Total: €${order.total.toFixed(2)}</strong> <br/>
        Fecha: ${new Date(order.date).toLocaleString()}
      </div>
    `;
    ordersList.appendChild(div);
  });
}

function changeOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return;

  orders[index].status = newStatus;
  localStorage.setItem('orders', JSON.stringify(orders));
  loadAllOrdersAdmin();
}

// --- INTERFAZ GENERAL ---

function showUserMenu() {
  const user = getLoggedUser();
  const userMenu = document.getElementById('user-menu');
  if (!userMenu) return;

  if (!user) {
    userMenu.innerHTML = `<a href="login.html" class="btn btn-outline-primary me-2">Iniciar sesión</a>
                          <a href="register.html" class="btn btn-primary">Registrarse</a>`;
  } else {
    let extraBtn = '';
    if (user.role === 'admin') {
      extraBtn = `<a href="admin_panel.html" class="btn btn-warning me-2">Panel Admin</a>`;
    } else {
      extraBtn = `<a href="cliente_panel.html" class="btn btn-success me-2">Mi Panel</a>`;
    }
    userMenu.innerHTML = `
      ${extraBtn}
      <button onclick="logout()" class="btn btn-danger">Cerrar sesión (${user.username})</button>
      <a href="carrito.html" class="btn btn-info ms-2">Carrito <span id="cart-count" class="badge bg-secondary">0</span></a>
    `;
    updateCartCount();
  }
}

// --- AL CARGAR ---

document.addEventListener('DOMContentLoaded', () => {
  showUserMenu();

  // Si hay un contenedor de productos, cargar productos
  if(document.getElementById('product-list')) loadProducts();

  // Si hay contenedor carrito, cargar carrito
  if(document.getElementById('cart-items')) loadCart();

  // Si hay contenedor pedidos de cliente
  if(document.getElementById('orders-list')) loadUserOrders();

  // Si hay contenedor pedidos admin
  if(document.getElementById('admin-orders-list')) loadAllOrdersAdmin();

  // Si hay botón procesar pago (carrito.html), añadir listener
  const payBtn = document.getElementById('pay-button');
  if(payBtn) {
    payBtn.addEventListener('click', () => {
      const order = createOrder();
      if(order) {
        window.location.href = 'cliente_panel.html';
      }
    });
  }
});


