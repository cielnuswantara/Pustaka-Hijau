# 📚 Pustaka Hijau — Perpustakaan Digital & Toko Buku Online (All-in-One)

Website all-in-one untuk **membaca, menyewa, membeli, dan menjual buku** dalam satu platform. Dibangun dengan HTML5, CSS3 modern, dan Vanilla JavaScript (tanpa framework dan tanpa backend), dengan tema gradasi hijau Emerald, Mint, dan Teal yang lembut serta mendukung mode terang dan gelap.

---

## ✨ Fitur Utama

### Tampilan (UI/UX)
- Tema gradasi hijau elegan dengan efek glassmorphism dan bayangan halus.
- **Mode terang / gelap** (tersimpan otomatis, mengikuti preferensi sistem pada kunjungan pertama).
- Responsif untuk HP, tablet, dan desktop (menu hamburger di layar kecil).
- Navbar: logo, menu navigasi, tombol Login/Register, dan badge jumlah keranjang.
- Hero section dengan judul animasi mengetik, tombol CTA, dan mockup buku animasi.
- Kartu fitur unggulan: Perpustakaan Digital, Jual Beli Cepat, Keamanan Transaksi, Komunitas Pembaca.
- Footer lengkap: navigasi cepat, media sosial, kontak, dan hak cipta.

### Fungsionalitas (JavaScript)
- **Katalog buku dinamis** dengan cover, judul, penulis, status (Sewa Digital / Beli Fisik / E-Book), harga, dan rating bintang.
- **Pencarian real-time** berdasarkan judul atau penulis, plus filter kategori dan jenis buku.
- **Login & Register (simulasi)** lewat modal; nama profil tampil di navbar setelah login.
- **Form Jual / Upload Buku** dengan validasi dan upload cover (otomatis dikecilkan). Buku baru langsung muncul di katalog.
- **Keranjang slide-over**: tambah, ubah jumlah (buku fisik), hapus item, total harga otomatis.
- **Checkout / Hubungi Penjual**: membuat pesan WhatsApp otomatis berisi rincian item dan total, lalu membuka WhatsApp.
- **Pembaca / Pinjam Digital**: modal detail dengan pratinjau bacaan dan pengatur ukuran huruf untuk buku sewa dan e-book.
- **Penyimpanan `localStorage`**: buku baru, keranjang, akun, sesi login, dan tema tidak hilang saat halaman di-refresh.

---

## 📁 Struktur File

```
pustaka-hijau/
├── index.html   # Struktur halaman (HTML5 semantik)
├── style.css    # Desain, tema warna, layout, dan responsivitas
├── script.js    # Logika aplikasi, interaktivitas, dan penyimpanan data
└── README.md    # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan / Instalasi

Tidak perlu instalasi apa pun (tanpa Node.js atau server khusus).

1. Simpan keempat file dalam **satu folder yang sama**.
2. Buka `index.html` dengan dua kali klik, atau klik kanan lalu *Open with* browser (Chrome, Edge, Firefox, Safari).
3. Pastikan perangkat **terhubung internet** agar Google Fonts dan ikon FontAwesome (CDN) termuat.

**Opsional: jalankan lewat server lokal**
```bash
# Python 3
python -m http.server 8000
# lalu buka http://localhost:8000
```
Atau gunakan ekstensi **Live Server** di VS Code.

### Deploy via GitHub Pages
1. Buat repository baru di GitHub, lalu unggah keempat file.
2. Buka **Settings → Pages**.
3. Pada *Source*, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
4. Situs aktif di `https://username.github.io/nama-repo/` setelah beberapa menit.

---

## ⚙️ Konfigurasi Penting

Buka `script.js` dan ubah bagian `CONFIG` di bagian atas file:

```js
const CONFIG = {
  whatsappNumber: "6281234567890", // GANTI dengan nomor WhatsApp admin/penjual
  storeName: "Pustaka Hijau",      // nama toko pada pesan WhatsApp
  rentDays: 7,                     // lama masa sewa buku digital
  maxCoverSize: 3 * 1024 * 1024,   // batas ukuran upload cover
};
```

> Format nomor WhatsApp: kode negara tanpa tanda `+` dan tanpa angka `0` di depan. Contoh: `08123456789` menjadi `628123456789`.

Untuk mengganti data buku contoh, edit array `SEED_BOOKS` di `script.js`.

---

## 📖 Panduan Penggunaan

### 1. Mencari & Menjelajah Buku
- Ketik judul atau nama penulis di kolom pencarian, hasil langsung menyesuaikan.
- Gunakan dropdown **kategori** dan tombol filter **Beli Fisik / Sewa Digital / E-Book**.
- Menu **Sewa/Pinjam Digital** di navbar otomatis menampilkan buku digital (sewa dan e-book).

### 2. Membaca / Meminjam Buku Digital
- Klik **Baca / Pinjam** pada kartu buku untuk membuka detail dan pratinjau bacaan.
- Klik **Sewa Sekarang / Tambah ke Keranjang** untuk memesan.

### 3. Berbelanja
1. Klik **Tambah ke Keranjang** pada buku pilihan.
2. Klik ikon keranjang 🛒 untuk membuka panel keranjang.
3. Atur jumlah (khusus buku fisik) atau hapus item bila perlu.
4. Klik **Checkout / Hubungi Penjual** dan pesan WhatsApp berisi rincian pesanan akan terbuka otomatis.

### 4. Menjual / Mengunggah Buku
1. Klik **Register** untuk membuat akun, atau **Login** jika sudah punya.
2. Buka bagian **Jual Buku** dan isi formulir (judul, penulis, harga, kategori, jenis, deskripsi, dan cover opsional).
3. Klik **Tambahkan ke Katalog**; buku langsung tampil di katalog dan tersimpan di browser.

### 5. Mengatur Ulang Data
Untuk menghapus data tersimpan: buka *Developer Tools → Application → Local Storage*, lalu hapus kunci berawalan `ph_` (`ph_user_books`, `ph_cart`, `ph_users`, `ph_session`, `ph_theme`).

---

## 🛠️ Teknologi
- **HTML5** semantik
- **CSS3**: variabel `:root`, Flexbox, CSS Grid, glassmorphism, animasi
- **JavaScript (ES6+)** Vanilla
- **Font Awesome 6** dan **Google Fonts** (Poppins, Playfair Display)
- **localStorage** untuk penyimpanan data di sisi klien

---

## ⚠️ Catatan Penting
- Sistem login/register hanyalah **simulasi sisi klien**. Data akun disimpan di browser dan **tidak aman** untuk produksi. Untuk situs sungguhan, gunakan backend dengan autentikasi dan database yang aman.
- Buku yang diunggah hanya tersimpan di browser pengguna yang bersangkutan, bukan dibagikan ke pengunjung lain. Agar katalog bersama, hubungkan ke backend/database (misalnya Firebase atau Supabase).
- `localStorage` memiliki batas sekitar 5 MB, jadi gambar cover otomatis dikecilkan sebelum disimpan.
- Isi bacaan pada fitur pembaca hanyalah **pratinjau contoh**. Pastikan Anda memiliki hak untuk mendistribusikan konten buku yang dijual atau disewakan.

---

## 📄 Lisensi
Bebas digunakan dan dimodifikasi untuk keperluan pribadi maupun komersial. Selamat berkarya! 🌿
