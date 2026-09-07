const API="https://novacart-backend-7lgx.onrender.com/api";

const fallbackProducts = [
  {id:"p1",name:"Everyday Walking Shoes",category:"Fashion",price:2499,rating:4.7,description:"Cushioned everyday shoes designed for comfortable walking.",image:"assets/shoes.svg"},
  {id:"p2",name:"Travel Wireless Headphones",category:"Electronics",price:3299,rating:4.6,description:"Comfortable wireless audio with long battery life for travel.",image:"assets/headphones.svg"},
  {id:"p3",name:"Minimal Desk Lamp",category:"Home",price:1599,rating:4.5,description:"A compact warm-light desk lamp for focused workspaces.",image:"assets/lamp.svg"},
  {id:"p4",name:"Everyday Backpack",category:"Fashion",price:1899,rating:4.4,description:"Lightweight backpack with practical storage for daily use.",image:"assets/backpack.svg"},
  {id:"p5",name:"Mechanical Keyboard",category:"Electronics",price:4499,rating:4.8,description:"Tactile mechanical keyboard with a clean compact layout.",image:"assets/keyboard.svg"},
  {id:"p6",name:"Ceramic Coffee Set",category:"Home",price:1299,rating:4.3,description:"Simple ceramic cups for relaxed coffee and tea moments.",image:"assets/cups.svg"},
  {id:"p7",name:"Running Performance Tee",category:"Fashion",price:999,rating:4.2,description:"Breathable performance fabric for running and training.",image:"assets/shirt.svg"},
  {id:"p8",name:"Portable Bluetooth Speaker",category:"Electronics",price:2199,rating:4.6,description:"Compact speaker with clear sound for home and travel.",image:"assets/speaker.svg"}
];

let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("novacart-cart") || "[]");
let activeCategory = "All";
let authMode = "login";

const productGrid = document.getElementById("productGrid");
const categoryRow = document.getElementById("categoryRow");
const statusEl = document.getElementById("status");
const resultSummary = document.getElementById("resultSummary");
const cartCount = document.getElementById("cartCount");

async function loadProducts() {
  try {
    const response = await fetch(`${API}/products`);
    if (!response.ok) throw new Error("API error");
    products = await response.json();
  } catch {
    products = fallbackProducts;
    showToast("Using local catalogue while the API is offline.");
  }
  filteredProducts = [...products];
  renderCategories();
  renderProducts();
  updateCart();
}

function renderCategories() {
  const categories = ["All", ...new Set(products.map(p => p.category))];
  categoryRow.innerHTML = categories.map(category =>
    `<button class="category ${category === activeCategory ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
  ).join("");
}

function renderProducts() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  let list = products.filter(product => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return categoryMatch && (!query || text.includes(query));
  });

  const sort = document.getElementById("sortSelect").value;
  if (sort === "price-low") list.sort((a,b) => a.price - b.price);
  if (sort === "price-high") list.sort((a,b) => b.price - a.price);
  if (sort === "rating") list.sort((a,b) => b.rating - a.rating);

  filteredProducts = list;
  resultSummary.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
  statusEl.textContent = list.length ? "" : "No products matched your search.";

  productGrid.innerHTML = list.map(product => `
    <article class="product-card">
      <img class="product-image" src="${product.image}" alt="${escapeHtml(product.name)}">
      <div class="product-body">
        <div class="product-category">${escapeHtml(product.category)}</div>
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-description">${escapeHtml(product.description)}</div>
        <div class="product-meta">
          <span class="price">₹${product.price.toLocaleString("en-IN")}</span>
          <span class="rating">★ ${product.rating}</span>
        </div>
        <div class="card-actions">
          <button data-view="${product.id}">Details</button>
          <button class="add" data-add="${product.id}">Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

function openProduct(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-product">
      <img src="${product.image}" alt="${escapeHtml(product.name)}">
      <div>
        <div class="product-category">${escapeHtml(product.category)}</div>
        <h2>${escapeHtml(product.name)}</h2>
        <p>${escapeHtml(product.description)}</p>
        <div class="price">₹${product.price.toLocaleString("en-IN")}</div>
        <p>Customer rating: ★ ${product.rating}</p>
        <button class="primary" data-modal-add="${product.id}">Add to cart</button>
      </div>
    </div>`;
  document.getElementById("productModal").classList.remove("hidden");
}

function addToCart(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;
  const existing = cart.find(item => String(item.id) === String(id));
  if (existing) existing.quantity += 1;
  else cart.push({id: product.id, quantity: 1});
  saveCart();
  updateCart();
  showToast(`${product.name} added to cart.`);
}

function updateCart() {
  localStorage.setItem("novacart-cart", JSON.stringify(cart));
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;

  const items = cart.map(item => {
    const product = products.find(p => String(p.id) === String(item.id));
    return product ? { ...item, product } : null;
  }).filter(Boolean);

  document.getElementById("cartItems").innerHTML = items.length ? items.map(item => `
    <div class="cart-item">
      <img src="${item.product.image}" alt="">
      <div>
        <strong>${escapeHtml(item.product.name)}</strong>
        <small>₹${item.product.price.toLocaleString("en-IN")}</small>
        <div class="qty">
          <button data-minus="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button data-plus="${item.id}">+</button>
        </div>
      </div>
      <strong>₹${(item.product.price * item.quantity).toLocaleString("en-IN")}</strong>
    </div>
  `).join("") : `<p class="form-message">Your cart is empty.</p>`;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  document.getElementById("cartTotal").textContent = `₹${total.toLocaleString("en-IN")}`;
}

function saveCart() {
  localStorage.setItem("novacart-cart", JSON.stringify(cart));
}

function changeQuantity(id, delta) {
  const item = cart.find(x => String(x.id) === String(id));
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(x => String(x.id) !== String(id));
  updateCart();
}

function openAuth(mode) {
  authMode = mode;
  const register = mode === "register";
  document.getElementById("authTitle").textContent = register ? "Create account" : "Sign in";
  document.getElementById("authEyebrow").textContent = register ? "CREATE ACCOUNT" : "ACCOUNT";
  document.getElementById("authName").classList.toggle("hidden", !register);
  document.getElementById("authName").required = register;
  document.getElementById("authMessage").textContent = "";
  document.getElementById("authModal").classList.remove("hidden");
}

async function submitAuth(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById("authName").value,
    email: document.getElementById("authEmail").value,
    password: document.getElementById("authPassword").value
  };
  const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
  const message = document.getElementById("authMessage");
  try {
    const response = await fetch(`${API}${endpoint}`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    localStorage.setItem("novacart-token", data.token);
    message.textContent = "Account action successful.";
    showToast("Account updated.");
  } catch (error) {
    message.textContent = error.message;
  }
}

async function checkout() {
  const token = localStorage.getItem("novacart-token");
  if (!token) {
    openAuth("login");
    document.getElementById("checkoutMessage").textContent = "Sign in before placing an order.";
    return;
  }
  if (!cart.length) {
    document.getElementById("checkoutMessage").textContent = "Add at least one product first.";
    return;
  }

  const items = cart.map(item => ({productId:item.id, quantity:item.quantity}));
  const message = document.getElementById("checkoutMessage");
  try {
    const response = await fetch(`${API}/orders`, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
      body:JSON.stringify({items})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not place order");
    cart = [];
    updateCart();
    message.textContent = `Order ${data.order.id} placed successfully.`;
  } catch (error) {
    message.textContent = error.message;
  }
}

document.addEventListener("click", event => {
  const category = event.target.closest("[data-category]");
  if (category) {
    activeCategory = category.dataset.category;
    renderCategories();
    renderProducts();
  }

  const add = event.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const view = event.target.closest("[data-view]");
  if (view) openProduct(view.dataset.view);

  const modalAdd = event.target.closest("[data-modal-add]");
  if (modalAdd) addToCart(modalAdd.dataset.modalAdd);

  const plus = event.target.closest("[data-plus]");
  if (plus) changeQuantity(plus.dataset.plus, 1);

  const minus = event.target.closest("[data-minus]");
  if (minus) changeQuantity(minus.dataset.minus, -1);

  const close = event.target.closest("[data-close]");
  if (close) document.getElementById(close.dataset.close).classList.add("hidden");

  const hint = event.target.closest(".hint");
  if (hint) {
    document.getElementById("searchInput").value = hint.dataset.query;
    renderProducts();
    document.getElementById("products").scrollIntoView({behavior:"smooth"});
  }
});

document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  renderProducts();
  document.getElementById("products").scrollIntoView({behavior:"smooth"});
});

document.getElementById("sortSelect").addEventListener("change", renderProducts);
document.getElementById("cartButton").addEventListener("click", () => document.getElementById("cartDrawer").classList.add("open"));
document.getElementById("closeCart").addEventListener("click", () => document.getElementById("cartDrawer").classList.remove("open"));
document.getElementById("checkoutButton").addEventListener("click", checkout);
document.getElementById("loginButton").addEventListener("click", () => openAuth("login"));
document.getElementById("registerButton").addEventListener("click", () => openAuth("register"));
document.getElementById("authForm").addEventListener("submit", submitAuth);

document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("mainNav").classList.toggle("open"));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

loadProducts();
