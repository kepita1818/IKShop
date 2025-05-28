const products = [
  {
    id: 1,
    name: "Perfume Louis Vuitton Ombre Nomade",
    price: 50,
    image: "https://perfume-malaysia.com/wp-content/uploads/2015/09/LV-OMBRE-NOMADE-462x404.jpg"
  },
  {
    id: 2,
    name: "Sudadera Gris",
    price: 29.99,
    image: "https://via.placeholder.com/200x200?text=Sudadera+Gris"
  },
  {
    id: 3,
    name: "Gorra Azul",
    price: 14.99,
    image: "https://via.placeholder.com/200x200?text=Gorra+Azul"
  }
];

function loadProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'col-md-4';
    div.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">€${product.price.toFixed(2)}</p>
          <button class="btn btn-primary" onclick="addToCart(${product.id})">Agregar al Carrito</button>
        </div>
      </div>
    `;
    productList.appendChild(div);
  });
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const product = products.find(p => p.id === id);
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.length;
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = count;
}

function loadCart() {
  const cartItems = document.getElementById('cart-items');
  const totalPrice = document.getElementById('total-price');
  if (!cartItems || !totalPrice) return;

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
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
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
  loadCart();
});
