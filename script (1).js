/* =====================================================
   PUSTAKA HIJAU - Perpustakaan Digital & Toko Buku Online
   script.js : Fungsionalitas & Interaktivitas (Vanilla JS)
   ===================================================== */

"use strict";

/* ---------- 1. KONFIGURASI ---------- */
const CONFIG = {
  // GANTI dengan nomor WhatsApp admin/penjual (format internasional tanpa + atau 0 di depan)
  whatsappNumber: "6281234567890",
  storeName: "Pustaka Hijau",
  rentDays: 7, // lama sewa buku digital (hari)
  maxCoverSize: 3 * 1024 * 1024, // batas ukuran upload cover: 3 MB
};

// Kunci penyimpanan localStorage
const KEYS = {
  books: "ph_user_books",
  cart: "ph_cart",
  users: "ph_users",
  session: "ph_session",
  theme: "ph_theme",
};

/* ---------- 2. DATA AWAL (BUKU CONTOH) ---------- */
const SEED_BOOKS = [
  { id: "s1", title: "Laskar Pelangi Digital", author: "Andrea H.", price: 15000, category: "Fiksi", type: "sewa", rating: 4.8, reviews: 214, desc: "Kisah persahabatan sepuluh anak di sebuah sekolah sederhana yang berjuang meraih mimpi di tengah keterbatasan. Tersedia untuk disewa secara digital.", cover: "", seller: "Admin" },
  { id: "s2", title: "Filosofi Hidup Tenang", author: "Henry Manampiring", price: 89000, category: "Pengembangan Diri", type: "beli", rating: 4.7, reviews: 530, desc: "Pengantar filsafat Stoa yang ringan dan praktis untuk mengatasi emosi negatif dalam kehidupan sehari-hari. Edisi cetak, kondisi baru.", cover: "", seller: "Admin" },
  { id: "s3", title: "Atomic Habits Indonesia", author: "James Clear", price: 25000, category: "Pengembangan Diri", type: "ebook", rating: 4.9, reviews: 890, desc: "Cara mudah dan terbukti untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang konsisten.", cover: "", seller: "Admin" },
  { id: "s4", title: "Sapiens: Sejarah Singkat Umat Manusia", author: "Yuval Noah Harari", price: 129000, category: "Sejarah", type: "beli", rating: 4.8, reviews: 402, desc: "Perjalanan panjang umat manusia dari zaman batu hingga era teknologi modern, ditulis dengan sudut pandang yang segar dan menantang.", cover: "", seller: "Admin" },
  { id: "s5", title: "Dasar Pemrograman Web", author: "Rina Kusuma", price: 12000, category: "Sains & Teknologi", type: "sewa", rating: 4.5, reviews: 98, desc: "Panduan langkah demi langkah belajar HTML, CSS, dan JavaScript untuk pemula dengan banyak contoh proyek nyata.", cover: "", seller: "Admin" },
  { id: "s6", title: "Rich Mindset untuk Pemula", author: "Budi Santoso", price: 45000, category: "Bisnis", type: "ebook", rating: 4.4, reviews: 156, desc: "Strategi mengelola uang, membangun bisnis kecil, dan berpikir seperti pengusaha sukses mulai dari nol.", cover: "", seller: "Admin" },
  { id: "s7", title: "Petualangan Si Kancil", author: "Dewi Lestari", price: 55000, category: "Anak & Remaja", type: "beli", rating: 4.6, reviews: 77, desc: "Kumpulan cerita bergambar penuh pesan moral untuk anak-anak, dengan ilustrasi berwarna yang menarik.", cover: "", seller: "Admin" },
  { id: "s8", title: "Pelajaran dari Para Bijak", author: "Ahmad Fauzi", price: 18000, category: "Agama & Filsafat", type: "sewa", rating: 4.3, reviews: 64, desc: "Renungan dan kutipan hikmah dari para pemikir besar yang relevan untuk kehidupan modern.", cover: "", seller: "Admin" },
];

/* ---------- 3. STATE APLIKASI ---------- */
const state = {
  books: [],          // gabungan buku contoh + buku buatan user
  cart: [],           // [{ id, qty }]
  currentUser: null,  // { name, email }
  filter: { query: "", category: "semua", type: "semua" },
  coverData: "",      // data base64 cover yang sedang diupload
  modalBookId: null,  // buku yang sedang dibuka pada modal detail
  readerFont: 1,      // ukuran huruf pembaca (rem)
};

/* ---------- 4. SELEKTOR DOM ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const dom = {
  navbar: $("#navbar"), navMenu: $("#navMenu"), hamburger: $("#hamburger"),
  themeToggle: $("#themeToggle"),
  cartToggle: $("#cartToggle"), cartBadge: $("#cartBadge"), navCartLink: $("#navCartLink"),
  cartPanel: $("#cartPanel"), cartBody: $("#cartBody"), cartTotal: $("#cartTotal"),
  cartClose: $("#cartClose"), checkoutBtn: $("#checkoutBtn"), clearCartBtn: $("#clearCartBtn"),
  overlay: $("#overlay"),
  authButtons: $("#authButtons"), userChip: $("#userChip"), userName: $("#userName"), userAvatar: $("#userAvatar"),
  openLogin: $("#openLogin"), openRegister: $("#openRegister"), logoutBtn: $("#logoutBtn"),
  authModal: $("#authModal"), tabLogin: $("#tabLogin"), tabRegister: $("#tabRegister"),
  loginForm: $("#loginForm"), registerForm: $("#registerForm"), authTitle: $("#authTitle"),
  loginError: $("#loginError"), registerError: $("#registerError"),
  bookGrid: $("#bookGrid"), emptyState: $("#emptyState"), resultInfo: $("#resultInfo"),
  searchInput: $("#searchInput"), categorySelect: $("#categorySelect"), typeChips: $("#typeChips"),
  sellForm: $("#sellForm"), bookCover: $("#bookCover"), coverPreview: $("#coverPreview"), uploadText: $("#uploadText"),
  bookModal: $("#bookModal"), bmCover: $("#bmCover"), bmBadge: $("#bmBadge"), bmTitle: $("#bmTitle"),
  bmAuthor: $("#bmAuthor"), bmStars: $("#bmStars"), bmPrice: $("#bmPrice"), bmDesc: $("#bmDesc"),
  bmReader: $("#bmReader"), bmReaderText: $("#bmReaderText"), bmAddBtn: $("#bmAddBtn"),
  fontMinus: $("#fontMinus"), fontPlus: $("#fontPlus"),
  toastWrap: $("#toastWrap"), statBooks: $("#statBooks"), typingText: $("#typingText"),
};

/* ---------- 5. UTILITAS ---------- */

/** Membaca data JSON dari localStorage dengan aman. */
function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn("Gagal membaca localStorage:", key, err);
    return fallback;
  }
}

/** Menyimpan data JSON ke localStorage. Mengembalikan false jika gagal (mis. penyimpanan penuh). */
function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn("Gagal menyimpan localStorage:", key, err);
    return false;
  }
}

/** Memformat angka menjadi Rupiah, contoh: 75000 -> "Rp 75.000". */
function formatRupiah(num) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(num).replace(/\s/g, " ");
}

/** Mengamankan teks dari HTML berbahaya (mencegah XSS pada data buatan user). */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

/** Mencari buku berdasarkan id. */
function getBook(id) {
  return state.books.find((b) => b.id === id);
}

/** Label teks untuk jenis buku. */
function typeLabel(type) {
  return { beli: "Beli Fisik", sewa: "Sewa Digital", ebook: "E-Book" }[type] || type;
}

/** Ikon FontAwesome untuk jenis buku. */
function typeIcon(type) {
  return { beli: "fa-box", sewa: "fa-clock", ebook: "fa-file-lines" }[type] || "fa-book";
}

/** Membuat gradasi cover dari id/judul buku agar tiap buku punya warna berbeda tapi tetap bernuansa hijau. */
function coverGradient(seedText) {
  const palettes = [
    ["#34d399", "#047857"], ["#2dd4bf", "#0f766e"], ["#6ee7b7", "#0d9488"],
    ["#4ade80", "#15803d"], ["#5eead4", "#0e7490"], ["#86efac", "#059669"],
    ["#22c55e", "#115e59"], ["#14b8a6", "#065f46"],
  ];
  let hash = 0;
  for (const ch of String(seedText)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = palettes[hash % palettes.length];
  return `linear-gradient(145deg, ${a}, ${b})`;
}

/** Menghasilkan HTML bintang rating (penuh, setengah, kosong). */
function starsHTML(rating) {
  if (!rating) return `<span style="margin-left:0">Baru</span>`;
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += '<i class="fa-solid fa-star"></i>';
    else if (rating >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

/** Menampilkan notifikasi toast singkat. */
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = "toast" + (isError ? " error" : "");
  toast.innerHTML = `<i class="fa-solid ${isError ? "fa-circle-exclamation" : "fa-circle-check"}"></i><span>${escapeHTML(message)}</span>`;
  dom.toastWrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

/** Hash sederhana untuk password (SIMULASI saja, bukan keamanan sungguhan). */
function simpleHash(text) {
  let h = 5381;
  for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return String(h);
}

/* ---------- 6. TEMA TERANG / GELAP ---------- */

/** Menerapkan tema dan menyimpan pilihan user. */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  dom.themeToggle.innerHTML = `<i class="fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}"></i>`;
  try { localStorage.setItem(KEYS.theme, theme); } catch (e) { /* abaikan */ }
}

/** Mengganti tema saat tombol ditekan. */
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

/* ---------- 7. RENDER KATALOG BUKU ---------- */

/** Membuat HTML cover buku (gambar upload atau cover gradasi otomatis). */
function coverHTML(book, withBadge = true) {
  const badge = withBadge ? `<span class="badge ${book.type}">${typeLabel(book.type)}</span>` : "";
  if (book.cover) {
    return `<div class="cover has-image">${badge}<img src="${book.cover}" alt="Cover ${escapeHTML(book.title)}" loading="lazy" /></div>`;
  }
  return `
    <div class="cover" style="background:${coverGradient(book.id + book.title)}">
      ${badge}
      <i class="fa-solid ${typeIcon(book.type)} cover-icon"></i>
      <div class="cover-title">${escapeHTML(book.title)}</div>
      <div class="cover-author">${escapeHTML(book.author)}</div>
    </div>`;
}

/** Mengambil daftar buku yang sudah difilter (pencarian + kategori + jenis). */
function getFilteredBooks() {
  const { query, category, type } = state.filter;
  const q = query.trim().toLowerCase();
  return state.books.filter((b) => {
    const matchQuery = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchCategory = category === "semua" || b.category === category;
    let matchType = true;
    if (type === "digital") matchType = b.type === "sewa" || b.type === "ebook";
    else if (type !== "semua") matchType = b.type === type;
    return matchQuery && matchCategory && matchType;
  });
}

/** Menampilkan kartu-kartu buku ke dalam grid katalog. */
function renderBooks() {
  const list = getFilteredBooks();
  dom.bookGrid.innerHTML = list.map((b, i) => `
    <article class="book-card" style="animation-delay:${Math.min(i, 12) * 0.04}s" data-id="${b.id}">
      ${coverHTML(b)}
      <div class="book-info">
        <span class="book-category">${escapeHTML(b.category)}</span>
        <h3>${escapeHTML(b.title)}</h3>
        <p class="book-author">oleh ${escapeHTML(b.author)}</p>
        <div class="stars">${starsHTML(b.rating)}${b.rating ? `<span>${b.rating.toFixed(1)} (${b.reviews})</span>` : ""}</div>
        <p class="book-price">${formatRupiah(b.price)} ${b.type === "sewa" ? `<small>/ ${CONFIG.rentDays} hari</small>` : ""}</p>
        <div class="book-actions">
          <button class="btn btn-primary" data-action="add" data-id="${b.id}" type="button">
            <i class="fa-solid fa-cart-plus"></i> Tambah ke Keranjang
          </button>
          <button class="btn btn-outline" data-action="open" data-id="${b.id}" type="button">
            <i class="fa-solid ${b.type === "beli" ? "fa-eye" : "fa-book-open"}"></i> ${b.type === "beli" ? "Detail" : "Baca / Pinjam"}
          </button>
        </div>
      </div>
    </article>`).join("");

  dom.emptyState.classList.toggle("hidden", list.length > 0);
  dom.resultInfo.textContent = `Menampilkan ${list.length} dari ${state.books.length} buku`;
  dom.statBooks.textContent = state.books.length;
}

/** Mengisi dropdown kategori berdasarkan kategori yang ada di data buku. */
function renderCategoryOptions() {
  const cats = [...new Set(state.books.map((b) => b.category))].sort();
  const selected = state.filter.category;
  dom.categorySelect.innerHTML =
    `<option value="semua">Semua Kategori</option>` +
    cats.map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
  dom.categorySelect.value = cats.includes(selected) ? selected : "semua";
}

/** Menandai chip jenis yang aktif. */
function syncTypeChips() {
  $$(".chip", dom.typeChips).forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.type === state.filter.type);
  });
}

/* ---------- 8. DETAIL BUKU / PEMBACA ---------- */

/** Membuat teks pratinjau bacaan (contoh) dari deskripsi buku. */
function buildReaderText(book) {
  return `
    <p><strong>Bab 1 - Awal Perjalanan</strong></p>
    <p>${escapeHTML(book.desc)}</p>
    <p>Pagi itu, udara terasa lebih segar dari biasanya. Halaman demi halaman terbuka, membawa pembaca masuk ke dunia yang tak terduga, tempat setiap kata menjadi jembatan menuju pemahaman baru.</p>
    <p><em>(Ini adalah pratinjau contoh. Sewa atau beli buku ini untuk membaca versi lengkap.)</em></p>`;
}

/** Membuka modal detail buku; buku digital menampilkan panel pembaca. */
function openBookModal(id) {
  const book = getBook(id);
  if (!book) return;
  state.modalBookId = id;

  dom.bmCover.innerHTML = coverHTML(book, false);
  dom.bmBadge.className = `badge ${book.type}`;
  dom.bmBadge.textContent = typeLabel(book.type);
  dom.bmTitle.textContent = book.title;
  dom.bmAuthor.textContent = `oleh ${book.author} • ${book.category}`;
  dom.bmStars.innerHTML = starsHTML(book.rating) + (book.rating ? `<span>${book.rating.toFixed(1)} (${book.reviews} ulasan)</span>` : "");
  dom.bmPrice.textContent = formatRupiah(book.price) + (book.type === "sewa" ? ` / ${CONFIG.rentDays} hari` : "");
  dom.bmDesc.textContent = book.desc;

  const isDigital = book.type !== "beli";
  dom.bmReader.classList.toggle("hidden", !isDigital);
  if (isDigital) {
    dom.bmReaderText.innerHTML = buildReaderText(book);
    dom.bmReaderText.style.fontSize = state.readerFont + "rem";
  }
  dom.bmAddBtn.innerHTML = `<i class="fa-solid fa-cart-plus"></i> ${book.type === "sewa" ? "Sewa Sekarang" : "Tambah ke Keranjang"}`;
  dom.bookModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/** Mengubah ukuran huruf pada panel pembaca. */
function changeReaderFont(delta) {
  state.readerFont = Math.min(1.6, Math.max(0.8, +(state.readerFont + delta).toFixed(2)));
  dom.bmReaderText.style.fontSize = state.readerFont + "rem";
}

/* ---------- 9. KERANJANG BELANJA ---------- */

/** Menyimpan keranjang ke localStorage. */
function saveCart() { saveStorage(KEYS.cart, state.cart); }

/** Menambahkan buku ke keranjang. Buku digital hanya boleh 1 per item. */
function addToCart(id) {
  const book = getBook(id);
  if (!book) return;
  const existing = state.cart.find((c) => c.id === id);
  if (existing) {
    if (book.type === "beli") existing.qty += 1;
    else { showToast("Buku digital ini sudah ada di keranjang.", true); return; }
  } else {
    state.cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`"${book.title}" ditambahkan ke keranjang`);
}

/** Mengubah jumlah item (hanya buku fisik). */
function changeQty(id, delta) {
  const item = state.cart.find((c) => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter((c) => c.id !== id);
  saveCart();
  renderCart();
}

/** Menghapus satu item dari keranjang. */
function removeFromCart(id) {
  state.cart = state.cart.filter((c) => c.id !== id);
  saveCart();
  renderCart();
}

/** Mengosongkan seluruh keranjang. */
function clearCart() {
  state.cart = [];
  saveCart();
  renderCart();
}

/** Menghitung total harga dan jumlah item keranjang. */
function getCartSummary() {
  let total = 0, count = 0;
  state.cart.forEach((c) => {
    const b = getBook(c.id);
    if (b) { total += b.price * c.qty; count += c.qty; }
  });
  return { total, count };
}

/** Menampilkan isi keranjang di slide-over dan memperbarui badge. */
function renderCart() {
  // Bersihkan item yang bukunya sudah tidak ada
  state.cart = state.cart.filter((c) => getBook(c.id));

  if (state.cart.length === 0) {
    dom.cartBody.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-basket-shopping"></i>
        <h4>Keranjang masih kosong</h4>
        <p>Yuk, pilih buku favoritmu dari katalog.</p>
      </div>`;
  } else {
    dom.cartBody.innerHTML = state.cart.map((c) => {
      const b = getBook(c.id);
      const thumb = b.cover
        ? `<img src="${b.cover}" alt="" />`
        : `<i class="fa-solid ${typeIcon(b.type)}"></i>`;
      const thumbStyle = b.cover ? "" : `style="background:${coverGradient(b.id + b.title)}"`;
      const qtyControl = b.type === "beli"
        ? `<div class="qty">
             <button type="button" data-cart="dec" data-id="${b.id}" aria-label="Kurangi">−</button>
             <span>${c.qty}</span>
             <button type="button" data-cart="inc" data-id="${b.id}" aria-label="Tambah">+</button>
           </div>`
        : `<span class="meta">1 item</span>`;
      return `
        <div class="cart-item">
          <div class="cart-thumb" ${thumbStyle}>${thumb}</div>
          <div>
            <h4>${escapeHTML(b.title)}</h4>
            <p class="meta">${typeLabel(b.type)}${b.type === "sewa" ? ` • ${CONFIG.rentDays} hari` : ""}</p>
            <p class="price">${formatRupiah(b.price * c.qty)}</p>
          </div>
          <div class="cart-side">
            <button class="remove-btn" type="button" data-cart="remove" data-id="${b.id}" aria-label="Hapus ${escapeHTML(b.title)}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
            ${qtyControl}
          </div>
        </div>`;
    }).join("");
  }

  const { total, count } = getCartSummary();
  dom.cartTotal.textContent = formatRupiah(total);
  dom.cartBadge.textContent = count;
  dom.cartBadge.classList.remove("bump");
  void dom.cartBadge.offsetWidth; // memicu ulang animasi
  dom.cartBadge.classList.add("bump");
  dom.checkoutBtn.disabled = count === 0;
  dom.checkoutBtn.style.opacity = count === 0 ? 0.55 : 1;
}

/** Membuka / menutup panel keranjang. */
function openCart() {
  dom.cartPanel.classList.add("open");
  dom.overlay.classList.add("show");
  dom.cartPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  dom.cartPanel.classList.remove("open");
  dom.overlay.classList.remove("show");
  dom.cartPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/** Membuat pesan WhatsApp dari isi keranjang lalu membukanya di tab baru. */
function checkout() {
  if (state.cart.length === 0) {
    showToast("Keranjang masih kosong.", true);
    return;
  }
  const { total } = getCartSummary();
  const buyer = state.currentUser ? state.currentUser.name : "Pelanggan (belum login)";

  let message = `Halo ${CONFIG.storeName}, saya ingin memesan:\n\n`;
  state.cart.forEach((c, i) => {
    const b = getBook(c.id);
    message += `${i + 1}. ${b.title} - ${b.author}\n`;
    message += `   Jenis: ${typeLabel(b.type)}${b.type === "sewa" ? ` (${CONFIG.rentDays} hari)` : ""}\n`;
    message += `   ${c.qty} x ${formatRupiah(b.price)} = ${formatRupiah(b.price * c.qty)}\n`;
    message += `   Penjual: ${b.seller || "Admin"}\n`;
  });
  message += `\nTotal: ${formatRupiah(total)}\n`;
  message += `Nama pemesan: ${buyer}\n\nMohon info ketersediaan dan cara pembayarannya. Terima kasih!`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
  showToast("Mengarahkan ke WhatsApp...");
}

/* ---------- 10. LOGIN & REGISTER (SIMULASI) ---------- */

/** Menyimpan sesi user dan memperbarui tampilan navbar. */
function setCurrentUser(user) {
  state.currentUser = user;
  if (user) saveStorage(KEYS.session, user);
  else localStorage.removeItem(KEYS.session);
  renderAuthUI();
}

/** Menampilkan tombol Login/Register atau profil user sesuai status login. */
function renderAuthUI() {
  const user = state.currentUser;
  dom.authButtons.classList.toggle("hidden", !!user);
  dom.userChip.classList.toggle("hidden", !user);
  if (user) {
    dom.userName.textContent = user.name;
    dom.userAvatar.textContent = user.name.trim().charAt(0).toUpperCase() || "U";
  }
}

/** Membuka modal auth pada tab tertentu ("login" atau "register"). */
function openAuthModal(tab = "login") {
  switchAuthTab(tab);
  dom.authModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/** Berpindah antara tab Login dan Daftar. */
function switchAuthTab(tab) {
  const isLogin = tab === "login";
  dom.tabLogin.classList.toggle("active", isLogin);
  dom.tabRegister.classList.toggle("active", !isLogin);
  dom.loginForm.classList.toggle("hidden", !isLogin);
  dom.registerForm.classList.toggle("hidden", isLogin);
  dom.authTitle.textContent = isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru";
  dom.loginError.textContent = "";
  dom.registerError.textContent = "";
}

/** Memproses form pendaftaran akun. */
function handleRegister(e) {
  e.preventDefault();
  const name = $("#regName").value.trim();
  const email = $("#regEmail").value.trim().toLowerCase();
  const pass = $("#regPass").value;

  if (name.length < 2) return (dom.registerError.textContent = "Nama minimal 2 karakter.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return (dom.registerError.textContent = "Format email tidak valid.");
  if (pass.length < 6) return (dom.registerError.textContent = "Password minimal 6 karakter.");

  const users = loadStorage(KEYS.users, []);
  if (users.some((u) => u.email === email)) return (dom.registerError.textContent = "Email sudah terdaftar.");

  users.push({ name, email, pass: simpleHash(pass) });
  saveStorage(KEYS.users, users);
  setCurrentUser({ name, email });
  closeModals();
  dom.registerForm.reset();
  showToast(`Akun dibuat. Selamat datang, ${name}!`);
}

/** Memproses form login. */
function handleLogin(e) {
  e.preventDefault();
  const email = $("#loginEmail").value.trim().toLowerCase();
  const pass = $("#loginPass").value;
  const users = loadStorage(KEYS.users, []);
  const found = users.find((u) => u.email === email && u.pass === simpleHash(pass));

  if (!found) return (dom.loginError.textContent = "Email atau password salah.");

  setCurrentUser({ name: found.name, email: found.email });
  closeModals();
  dom.loginForm.reset();
  showToast(`Halo lagi, ${found.name}!`);
}

/** Keluar dari akun. */
function handleLogout() {
  setCurrentUser(null);
  showToast("Anda telah keluar.");
}

/* ---------- 11. FORM JUAL / UPLOAD BUKU ---------- */

/** Menampilkan pesan error pada field form. */
function setFieldError(id, message) {
  const el = $(`[data-error-for="${id}"]`);
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.closest(".field").classList.toggle("invalid", !!message);
}

/** Memvalidasi form jual buku. Mengembalikan true jika semua data benar. */
function validateSellForm() {
  const title = $("#bookTitle").value.trim();
  const author = $("#bookAuthor").value.trim();
  const price = Number($("#bookPrice").value);
  const category = $("#bookCategory").value;
  const desc = $("#bookDesc").value.trim();
  let valid = true;

  const check = (id, condition, msg) => {
    setFieldError(id, condition ? "" : msg);
    if (!condition) valid = false;
  };

  check("bookTitle", title.length >= 3, "Judul minimal 3 karakter.");
  check("bookAuthor", author.length >= 3, "Nama penulis minimal 3 karakter.");
  check("bookPrice", $("#bookPrice").value !== "" && price > 0, "Masukkan harga yang valid (lebih dari 0).");
  check("bookCategory", category !== "", "Pilih salah satu kategori.");
  check("bookDesc", desc.length >= 20, "Deskripsi minimal 20 karakter.");
  return valid;
}

/** Memproses gambar cover: dikecilkan lewat canvas agar hemat ruang localStorage. */
function handleCoverUpload(e) {
  const file = e.target.files[0];
  setFieldError("bookCover", "");
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setFieldError("bookCover", "File harus berupa gambar.");
    e.target.value = "";
    return;
  }
  if (file.size > CONFIG.maxCoverSize) {
    setFieldError("bookCover", "Ukuran gambar maksimal 3 MB.");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 360;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      state.coverData = canvas.toDataURL("image/jpeg", 0.8);
      dom.coverPreview.src = state.coverData;
      dom.coverPreview.classList.remove("hidden");
      dom.uploadText.textContent = file.name;
    };
    img.onerror = () => setFieldError("bookCover", "Gambar tidak dapat dibaca.");
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

/** Menyimpan hanya buku buatan user (id berawalan "u") ke localStorage. */
function saveUserBooks() {
  const userBooks = state.books.filter((b) => b.id.startsWith("u"));
  return saveStorage(KEYS.books, userBooks);
}

/** Memproses pengiriman form: validasi, tambah ke state, simpan, lalu render ulang katalog. */
function handleSellSubmit(e) {
  e.preventDefault();

  if (!state.currentUser) {
    showToast("Silakan login terlebih dahulu untuk menjual buku.", true);
    openAuthModal("login");
    return;
  }
  if (!validateSellForm()) {
    showToast("Periksa kembali data yang diisi.", true);
    return;
  }

  const newBook = {
    id: "u" + Date.now(),
    title: $("#bookTitle").value.trim(),
    author: $("#bookAuthor").value.trim(),
    price: Number($("#bookPrice").value),
    category: $("#bookCategory").value,
    type: $('input[name="bookType"]:checked').value,
    rating: 0,
    reviews: 0,
    desc: $("#bookDesc").value.trim(),
    cover: state.coverData,
    seller: state.currentUser.name,
  };

  state.books.unshift(newBook);
  if (!saveUserBooks()) {
    // Penyimpanan penuh: coba simpan tanpa gambar cover
    newBook.cover = "";
    saveUserBooks();
    showToast("Penyimpanan penuh, buku disimpan tanpa cover.", true);
  }

  // Reset form & filter agar buku baru langsung terlihat
  dom.sellForm.reset();
  state.coverData = "";
  dom.coverPreview.classList.add("hidden");
  dom.uploadText.textContent = "Klik untuk memilih gambar (JPG/PNG, maks 3 MB)";
  $$(".field.invalid").forEach((f) => f.classList.remove("invalid"));
  state.filter = { query: "", category: "semua", type: "semua" };
  dom.searchInput.value = "";
  renderCategoryOptions();
  syncTypeChips();
  renderBooks();

  showToast(`"${newBook.title}" berhasil ditambahkan ke katalog!`);
  document.getElementById("katalog").scrollIntoView({ behavior: "smooth" });
}

/* ---------- 12. MODAL, NAVIGASI & EFEK ---------- */

/** Menutup semua modal. */
function closeModals() {
  dom.authModal.classList.add("hidden");
  dom.bookModal.classList.add("hidden");
  if (!dom.cartPanel.classList.contains("open")) document.body.style.overflow = "";
}

/** Menerapkan filter jenis dari menu navigasi (mis. "Sewa/Pinjam Digital"). */
function applyNavFilter(filter) {
  state.filter.type = filter;
  state.filter.query = "";
  state.filter.category = "semua";
  dom.searchInput.value = "";
  renderCategoryOptions();
  syncTypeChips();
  renderBooks();
}

/** Menandai link navbar yang aktif sesuai bagian halaman yang terlihat. */
function setupScrollSpy() {
  const sections = ["beranda", "katalog", "jual"].map((id) => document.getElementById(id));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $$(".nav-link[data-nav]").forEach((l) => l.classList.toggle("active", l.dataset.nav === entry.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && observer.observe(s));
}

/** Efek mengetik pada judul hero. */
function startTypingEffect() {
  const words = ["Halaman Buku", "Cerita Baru", "Ilmu Baru", "Petualangan"];
  let wordIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    dom.typingText.textContent = word.slice(0, charIndex);

    let delay = deleting ? 55 : 110;
    if (!deleting && charIndex === word.length) { deleting = true; delay = 1600; }
    else if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 400; }
    setTimeout(tick, delay);
  }
  tick();
}

/* ---------- 13. EVENT LISTENER ---------- */

/** Memasang semua event listener aplikasi. */
function bindEvents() {
  // Tema
  dom.themeToggle.addEventListener("click", toggleTheme);

  // Navbar: bayangan saat scroll & menu mobile
  window.addEventListener("scroll", () => dom.navbar.classList.toggle("scrolled", window.scrollY > 10), { passive: true });
  dom.hamburger.addEventListener("click", () => dom.navMenu.classList.toggle("open"));
  $$(".nav-link[href]").forEach((link) => {
    link.addEventListener("click", () => {
      if (link.dataset.filter) applyNavFilter(link.dataset.filter);
      dom.navMenu.classList.remove("open");
    });
  });
  dom.navCartLink.addEventListener("click", () => { dom.navMenu.classList.remove("open"); openCart(); });

  // Pencarian real-time, kategori, dan jenis
  dom.searchInput.addEventListener("input", (e) => { state.filter.query = e.target.value; renderBooks(); });
  dom.categorySelect.addEventListener("change", (e) => { state.filter.category = e.target.value; renderBooks(); });
  dom.typeChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.filter.type = chip.dataset.type;
    syncTypeChips();
    renderBooks();
  });

  // Aksi pada kartu buku (delegasi event)
  dom.bookGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "add") addToCart(btn.dataset.id);
    if (btn.dataset.action === "open") openBookModal(btn.dataset.id);
  });

  // Modal detail buku
  dom.bmAddBtn.addEventListener("click", () => {
    if (state.modalBookId) { addToCart(state.modalBookId); closeModals(); openCart(); }
  });
  dom.fontMinus.addEventListener("click", () => changeReaderFont(-0.1));
  dom.fontPlus.addEventListener("click", () => changeReaderFont(0.1));

  // Keranjang
  dom.cartToggle.addEventListener("click", openCart);
  dom.cartClose.addEventListener("click", closeCart);
  dom.overlay.addEventListener("click", closeCart);
  dom.checkoutBtn.addEventListener("click", checkout);
  dom.clearCartBtn.addEventListener("click", () => {
    if (state.cart.length && confirm("Kosongkan seluruh isi keranjang?")) clearCart();
  });
  dom.cartBody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cart]");
    if (!btn) return;
    const { cart: action, id } = btn.dataset;
    if (action === "inc") changeQty(id, 1);
    if (action === "dec") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  // Auth
  dom.openLogin.addEventListener("click", () => openAuthModal("login"));
  dom.openRegister.addEventListener("click", () => openAuthModal("register"));
  dom.tabLogin.addEventListener("click", () => switchAuthTab("login"));
  dom.tabRegister.addEventListener("click", () => switchAuthTab("register"));
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.registerForm.addEventListener("submit", handleRegister);
  dom.logoutBtn.addEventListener("click", handleLogout);

  // Form jual buku
  dom.sellForm.addEventListener("submit", handleSellSubmit);
  dom.bookCover.addEventListener("change", handleCoverUpload);
  $$("#sellForm input, #sellForm select, #sellForm textarea").forEach((el) => {
    el.addEventListener("input", () => { const f = el.closest(".field"); if (f) f.classList.remove("invalid"); });
  });

  // Tutup modal: tombol X, klik di luar kartu, dan tombol Escape
  $$("[data-close]").forEach((b) => b.addEventListener("click", closeModals));
  [dom.authModal, dom.bookModal].forEach((modal) => {
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModals(); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModals(); closeCart(); }
  });

  // Sinkronisasi antar tab browser
  window.addEventListener("storage", (e) => {
    if (e.key === KEYS.cart) { state.cart = loadStorage(KEYS.cart, []); renderCart(); }
    if (e.key === KEYS.books) { loadBooks(); renderCategoryOptions(); renderBooks(); renderCart(); }
  });
}

/* ---------- 14. INISIALISASI ---------- */

/** Memuat buku contoh + buku buatan user dari localStorage. */
function loadBooks() {
  const userBooks = loadStorage(KEYS.books, []);
  state.books = [...userBooks, ...SEED_BOOKS];
}

/** Fungsi utama yang dijalankan saat halaman siap. */
function init() {
  document.getElementById("year").textContent = new Date().getFullYear();

  // Tema tersimpan atau mengikuti preferensi sistem
  const savedTheme = localStorage.getItem(KEYS.theme);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  // Muat data
  loadBooks();
  state.cart = loadStorage(KEYS.cart, []);
  state.currentUser = loadStorage(KEYS.session, null);

  // Render awal
  renderAuthUI();
  renderCategoryOptions();
  renderBooks();
  renderCart();

  bindEvents();
  setupScrollSpy();
  startTypingEffect();
}

document.addEventListener("DOMContentLoaded", init);
