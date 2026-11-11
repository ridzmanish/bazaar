import { createClient } from '@supabase/supabase-js';
import './style.css';

const demoProducts = [
  { id: 'p1', name: 'Studio wireless headphones', category: 'Electronics', price: 2499, original_price: 3999, rating: 4.8, reviews: 1240, badge: 'BESTSELLER', emoji: '🎧', color: '#ebe8ff' },
  { id: 'p2', name: 'Everyday crossbody bag', category: 'Fashion', price: 1299, original_price: 1999, rating: 4.6, reviews: 862, badge: 'TRENDING', emoji: '👜', color: '#fce8df' },
  { id: 'p3', name: 'Cloud-soft everyday sneakers', category: 'Fashion', price: 1899, original_price: 2999, rating: 4.7, reviews: 2104, badge: 'TOP RATED', emoji: '👟', color: '#e1f1e9' },
  { id: 'p4', name: 'Ceramic coffee ritual set', category: 'Home & Living', price: 899, original_price: 1499, rating: 4.5, reviews: 432, badge: '', emoji: '☕', color: '#faeddb' },
  { id: 'p5', name: 'The daily glow skincare kit', category: 'Beauty', price: 1499, original_price: 2199, rating: 4.9, reviews: 986, badge: 'LOVED', emoji: '🧴', color: '#f9e3ed' },
  { id: 'p6', name: 'Pocket-size smart speaker', category: 'Electronics', price: 1799, original_price: 2499, rating: 4.4, reviews: 671, badge: '', emoji: '🔊', color: '#e3eafa' },
  { id: 'p7', name: 'Weekend getaway backpack', category: 'Fashion', price: 1599, original_price: 2399, rating: 4.6, reviews: 519, badge: 'JUST IN', emoji: '🎒', color: '#f4e9dc' },
  { id: 'p8', name: 'Little moments desk lamp', category: 'Home & Living', price: 1099, original_price: 1699, rating: 4.7, reviews: 308, badge: '', emoji: '💡', color: '#f7f0d7' },
];

const categoryDetails = [
  { name: 'All finds', emoji: '✳', color: '#eae6ff' },
  { name: 'Electronics', emoji: '🎧', color: '#e4e9ff' },
  { name: 'Fashion', emoji: '👟', color: '#fce8df' },
  { name: 'Home & Living', emoji: '🪴', color: '#e1f1e9' },
  { name: 'Beauty', emoji: '✨', color: '#f9e3ed' },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

let products = [...demoProducts];
let activeCategory = 'All finds';
let searchTerm = '';
let sortMode = 'featured';
let cart = loadCart();
let toastTimer;

const productGrid = document.querySelector('#product-grid');
const categoriesEl = document.querySelector('#categories');
const cartDrawer = document.querySelector('#cart-drawer');
const overlay = document.querySelector('#cart-overlay');
const toastEl = document.querySelector('#toast');

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('bazaar-cart') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn('Could not read the saved cart; starting with an empty cart.', error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem('bazaar-cart', JSON.stringify(cart));
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('visible'), 2600);
}

function renderCategories() {
  categoriesEl.innerHTML = categoryDetails.map((category) => `
    <button class="category-card ${activeCategory === category.name ? 'active' : ''}" type="button" data-category="${category.name}">
      <span class="category-art" style="--category-color:${category.color}">${category.emoji}</span>
      <span>${category.name}</span><span class="category-arrow">↗</span>
    </button>
  `).join('');
}

function visibleProducts() {
  const filtered = products.filter((product) => {
    const matchesCategory = activeCategory === 'All finds' || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
  if (sortMode === 'price-low') filtered.sort((a, b) => a.price - b.price);
  if (sortMode === 'price-high') filtered.sort((a, b) => b.price - a.price);
  if (sortMode === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  return filtered;
}

function renderProducts() {
  const shown = visibleProducts();
  document.querySelector('#result-count').textContent = `${shown.length} ${shown.length === 1 ? 'product' : 'products'} to love`;
  document.querySelector('#product-title').innerHTML = `${searchTerm ? 'Search results' : activeCategory === 'All finds' ? 'Popular right now' : activeCategory}<span class="brand-dot">.</span>`;
  document.querySelector('#empty-state').hidden = shown.length > 0;
  productGrid.hidden = shown.length === 0;
  productGrid.innerHTML = shown.map((product) => {
    const discount = Math.round((1 - product.price / product.original_price) * 100);
    return `
      <article class="product-card">
        <div class="product-image" style="--product-color:${product.color || '#f0eff6'}">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <button class="favorite-button" type="button" aria-label="Save ${product.name}" data-favorite="${product.id}">♡</button>
          ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy" />` : `<span class="product-emoji" aria-hidden="true">${product.emoji || '✳'}</span>`}
          <button class="quick-add" type="button" data-add="${product.id}">+ Quick add</button>
        </div>
        <div class="product-info"><span class="product-category">${product.category}</span><h3>${product.name}</h3>
          <div class="rating-line"><span class="rating-star">★</span> ${Number(product.rating || 0).toFixed(1)} <span class="review-count">(${Number(product.reviews || 0).toLocaleString('en-IN')})</span></div>
          <div class="price-line"><b>${formatPrice(product.price)}</b><s>${formatPrice(product.original_price)}</s><span>${discount}% off</span></div>
        </div>
      </article>
    `;
  }).join('');
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id) || demoProducts.find((entry) => entry.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#cart-count').classList.toggle('has-items', count > 0);
  document.querySelector('#cart-empty').hidden = cart.length > 0;
  document.querySelector('#cart-footer').hidden = cart.length === 0;
  document.querySelector('#cart-subtotal').textContent = formatPrice(subtotal);
  document.querySelector('#cart-items').innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id) || demoProducts.find((entry) => entry.id === item.id);
    if (!product) return '';
    return `<article class="cart-item">
      <div class="cart-item-art" style="--product-color:${product.color || '#f0eff6'}">${product.image_url ? `<img src="${product.image_url}" alt="" />` : product.emoji || '✳'}</div>
      <div class="cart-item-details"><h3>${product.name}</h3><span>${formatPrice(product.price)}</span>
        <div class="quantity-control"><button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button></div>
      </div><button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name}">×</button>
    </article>`;
  }).join('');
}

function openCart() {
  overlay.hidden = false;
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
  document.querySelector('#cart-close').focus();
}

function closeCart() {
  overlay.hidden = true;
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}

async function loadSupabaseProducts() {
  if (!supabase) return;
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
  if (error) {
    console.error('Could not load products from Supabase:', error.message);
    showToast('Online catalog load nahi hua — demo products dikha rahe hain.');
    return;
  }
  if (data?.length) {
    products = data;
    renderProducts();
    renderCart();
  }
}

categoriesEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

productGrid.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  if (addButton) {
    const id = addButton.dataset.add;
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ id, quantity: 1 });
    saveCart();
    renderCart();
    showToast('Cart mein add ho gaya! ✨');
    return;
  }
  const favoriteButton = event.target.closest('[data-favorite]');
  if (favoriteButton) {
    favoriteButton.classList.toggle('favorite-active');
    favoriteButton.textContent = favoriteButton.classList.contains('favorite-active') ? '♥' : '♡';
    showToast(favoriteButton.classList.contains('favorite-active') ? 'Saved to your favourites' : 'Removed from favourites');
  }
});

document.querySelector('#cart-items').addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) cart = cart.filter((item) => item.id !== removeButton.dataset.remove);
  const quantityButton = event.target.closest('[data-quantity]');
  if (quantityButton) {
    const item = cart.find((entry) => entry.id === quantityButton.dataset.quantity);
    if (item) item.quantity += Number(quantityButton.dataset.change);
    cart = cart.filter((entry) => entry.quantity > 0);
  }
  saveCart();
  renderCart();
});

document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  searchTerm = document.querySelector('#search-input').value.trim().toLowerCase();
  renderProducts();
  document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
});
document.querySelector('#search-input').addEventListener('input', (event) => {
  if (!event.target.value) {
    searchTerm = '';
    renderProducts();
  }
});
document.querySelector('#sort-select').addEventListener('change', (event) => {
  sortMode = event.target.value;
  renderProducts();
});
document.querySelector('#clear-filters').addEventListener('click', () => {
  activeCategory = 'All finds';
  searchTerm = '';
  document.querySelector('#search-input').value = '';
  renderCategories();
  renderProducts();
});
document.querySelector('#cart-open').addEventListener('click', openCart);
document.querySelector('#cart-close').addEventListener('click', closeCart);
document.querySelector('#continue-shopping').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart();
});
document.querySelector('#checkout-button').addEventListener('click', () => showToast('Checkout setup ke liye Supabase/payment provider connect karein.'));
document.querySelector('#newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast('You’re on the list! Watch your inbox ✨');
});

renderCategories();
renderProducts();
renderCart();
loadSupabaseProducts();
