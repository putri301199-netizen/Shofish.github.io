"use strict";

const cards = document.querySelectorAll('.card');
const searchInput = document.querySelector('.search-box input');

let cart = [];

// 1. LOGIKA KERANJANG (CART)

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('cart-hidden');}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });}
    updateCartUI();
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);}
    }
    updateCartUI();
}

function updateCartUI() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');

    if (!cartItemsElement || !cartCountElement || !cartTotalElement) {
        localStorage.setItem('shofish_cart', JSON.stringify(cart));
        return;}

    cartItemsElement.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        cartItemsElement.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong><br>
                    <span>Rp ${item.price.toLocaleString('id-ID')}</span>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
            </div>
        `;
    });

    cartCountElement.innerText = count;
    cartTotalElement.innerText = `Rp ${total.toLocaleString('id-ID')}`;

    // SIMPAN KE LOCAL STORAGE
    localStorage.setItem('shofish_cart', JSON.stringify(cart));
}

function checkout() {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    // Simpan data untuk halaman order
    localStorage.setItem('shofish_cart', JSON.stringify(cart));
    // Pindah ke halaman order
    window.location.href = 'order.html'; }

// 2. LOGIKA FILTER (TOMBOL PILL)
let activeJenis = "";

function filterIkan() {
    const searchKunci = searchInput ? searchInput.value.toLowerCase() : "";

    cards.forEach(card => {
        const namaIkan = card.querySelector('h3').innerText.toLowerCase();
        const jenisIkan = card.getAttribute('data-jenis') || "";
        const cocokNama = namaIkan.includes(searchKunci);
        const cocokJenis = (activeJenis === "" || activeJenis === jenisIkan);
        card.style.display = (cocokNama && cocokJenis) ? "block" : "none";
    });
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const type = btn.dataset.type;
    const value = btn.dataset.value;

    // Toggle: klik tombol aktif = reset ke Semua
    if (type === 'jenis') {
        if (activeJenis === value && value !== "") {
            activeJenis = "";
        } else {
            activeJenis = value;
        }
        document.querySelectorAll('.filter-btn[data-type="jenis"]').forEach(b => {
            b.classList.toggle('active', b.dataset.value === activeJenis);
        });
    }

    filterIkan();
});

if (searchInput) {
    searchInput.addEventListener('input', filterIkan);
}

function tampilkanRingkasanOrder() {
    const daftarItemElement = document.getElementById('daftar-item');
    const totalHargaElement = document.getElementById('total-harga-ringkasan');

    let savedCart = JSON.parse(localStorage.getItem('shofish_cart')) || [];

    if (savedCart.length === 0) {
        if (daftarItemElement) daftarItemElement.innerHTML = `
            <p class="empty-cart">
                🛒 Keranjang kosong.
            </p>`;
        if (totalHargaElement) totalHargaElement.innerText = 'Rp 0';
        return;
    }

    let html = "";
    let total = 0;

    savedCart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <div class="order-item-row">
                <span class="order-item-name">${item.name}</span>
                <div class="order-item-controls">
                    <button onclick="orderUpdateQty(${index}, -1)" class="btn-qty-order">−</button>
                    <span style="min-width:20px; text-align:center; font-weight:bold;">${item.quantity}</span>
                    <button onclick="orderUpdateQty(${index}, 1)" class="btn-qty-order">+</button>
                    <span class="order-subtotal">Rp ${subtotal.toLocaleString('id-ID')}</span>
                    <button onclick="orderHapusItem(${index})" class="btn-qty-order btn-delete-order" title="Hapus">🗑</button>
                </div>
            </div>
        `;
    });

    if (daftarItemElement) daftarItemElement.innerHTML = html;
    if (totalHargaElement) totalHargaElement.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function orderUpdateQty(index, change) {
    let savedCart = JSON.parse(localStorage.getItem('shofish_cart')) || [];
    if (!savedCart[index]) return;

    savedCart[index].quantity += change;

    if (savedCart[index].quantity <= 0) {
        savedCart.splice(index, 1);
    }

    localStorage.setItem('shofish_cart', JSON.stringify(savedCart));
    tampilkanRingkasanOrder();
}

function orderHapusItem(index) {
    let savedCart = JSON.parse(localStorage.getItem('shofish_cart')) || [];
    savedCart.splice(index, 1);
    localStorage.setItem('shofish_cart', JSON.stringify(savedCart));
    tampilkanRingkasanOrder();
}

// INFO PEMBAYARAN SHOFISH
const infoPembayaran = {
    "Dana": {
        label: "Dana",
        nomor: "0851-7248-8973",
        atasnama: "PUTRI CHESYL AULIA"
    },
    "Bank Mandiri": {
        label: "Bank Mandiri",
        nomor: "1130021032887",
        atasnama: "PUTRI CHESYL AULIA"
    }
};

function generateOrderId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SHF-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function formatTanggal() {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function buatStruk() {
    const user = document.getElementById('robloxUser').value.trim();
    const metode = document.getElementById('metodeBayar').value;
    const email = document.getElementById('emailUser').value.trim();
    const savedCart = JSON.parse(localStorage.getItem('shofish_cart')) || [];

    if (!user || !email || savedCart.length === 0) {
        alert("Lengkapi data form dan pastikan ada isi keranjang!");
        return;
    }

    const orderId = generateOrderId();
    const tanggal = formatTanggal();
    const bayar = infoPembayaran[metode];

    let itemStrukHTML = "";
    let itemStrukTeks = "";
    let total = 0;

    savedCart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        itemStrukHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>${item.name} x${item.quantity}</span>
                <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
            </div>`;
        itemStrukTeks += `${item.name} x${item.quantity} = Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });

    const infoTransfer = bayar
        ? `Transfer ke ${bayar.label}: <strong>${bayar.nomor}</strong> a/n ${bayar.atasnama}`
        : `Transfer ke ${metode}`;

    const infoTransferTeks = bayar
        ? `Transfer ke ${bayar.label}: ${bayar.nomor} a/n ${bayar.atasnama}`
        : `Transfer ke ${metode}`;

    // ---- Tampilan struk di modal ----
    const isiStruk = `
        <div class="receipt-header">
            <h3 style="margin:0;">SHOFISH ✨</h3>
            <small>Sparkling Blue Market</small>
        </div>
        <p class="receipt-meta">Order ID: <strong>${orderId}</strong></p>
        <p class="receipt-meta">Tanggal: ${tanggal}</p>
        <hr class="receipt-line">
        <p style="margin:5px 0;"><strong>User:</strong> ${user}</p>
        <p style="margin:5px 0;"><strong>Metode:</strong> ${metode}</p>
        <p style="margin:5px 0;"><strong>Email:</strong> ${email}</p>
        <hr class="receipt-line">
        ${itemStrukHTML}
        <hr class="receipt-line">
        <p style="display:flex; justify-content:space-between; font-weight:bold;">
            <span>TOTAL:</span> <span>Rp ${total.toLocaleString('id-ID')}</span>
        </p>
        <div class="receipt-transfer-box">
            💳 ${infoTransfer}
        </div>
    `;

    document.getElementById('isiStruk').innerHTML = isiStruk;
    document.getElementById('modalStruk').style.display = 'block';

    // ---- Kosongkan keranjang setelah order ----
    localStorage.removeItem('shofish_cart');
    cart = [];
    tampilkanRingkasanOrder(); 

    // ---- Kirim email via EmailJS ----
    kirimEmail({
        to_email: email,
        to_name: user,
        order_id: orderId,
        tanggal: tanggal,
        metode: metode,
        daftar_item: itemStrukTeks,
        total: `Rp ${total.toLocaleString('id-ID')}`,
        info_transfer: infoTransferTeks
    });
}

function kirimEmail(data) {
    const EMAILJS_SERVICE_ID  = "service_y59ngkt";
    const EMAILJS_TEMPLATE_ID = "template_5dcdbyd";
    const EMAILJS_PUBLIC_KEY  = "BYDX599wKh4BCXh6V";
    
    if (typeof emailjs === 'undefined') {
        console.warn();
        return;
    }

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data, EMAILJS_PUBLIC_KEY)
        .then(() => {
            console.log("Email berhasil dikirim ke " + data.to_email);
        })
        .catch((err) => {
            console.error("Gagal kirim email:", err);
        });
}

    function validasiEmail(input) {
    const hint = document.getElementById('emailHint');
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
 
    input.classList.remove('input-error', 'input-valid');
    if (!hint) return;
 
    if (input.value.trim() === '') {
        hint.textContent = '';
        hint.className = 'email-hint';
    } else if (valid) {
        input.classList.add('input-valid');
        hint.textContent = '✓ Format email valid';
        hint.className = 'email-hint valid';
    } else {
        input.classList.add('input-error');
        hint.textContent = '✗ Format tidak valid. Contoh: nama@gmail.com';
        hint.className = 'email-hint error';
    }
}

function tutupStruk() {
    document.getElementById('modalStruk').style.display = 'none';
}

// 3. LOAD DATA SAAT HALAMAN DIBUKA
window.onload = function() {
    const savedCart = localStorage.getItem('shofish_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    if (document.getElementById('daftar-item')) {
        tampilkanRingkasanOrder();
    }
};