# Troubleshooting Guide

## Authentication Issues

### Error: "Token diperlukan" or "Unauthorized"

Jika Anda mendapatkan error autentikasi saat mengakses halaman dashboard atau API, ikuti langkah-langkah berikut:

#### 1. Login dengan Kredensial Default

Gunakan kredensial default yang telah disediakan:

- **Email:** `admin@jacms.com`
- **Password:** `admin123`

#### 2. Periksa Status Backend

Pastikan backend server berjalan di port 3001:

```bash
# Cek apakah backend berjalan
curl -I http://localhost:3001/api/categories

# Jika tidak berjalan, start backend
cd backend
npm run dev
```

#### 3. Periksa Environment Variables

Pastikan file `.env.local` di frontend memiliki konfigurasi yang benar:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 4. Clear Browser Data

Jika masih mengalami masalah, coba clear browser data:

1. Buka Developer Tools (F12)
2. Buka tab Application/Storage
3. Clear localStorage dan cookies
4. Refresh halaman

#### 5. Restart Development Servers

Jika masalah masih berlanjut:

```bash
# Stop semua server
# Restart backend
cd backend
npm run dev

# Restart frontend (di terminal baru)
cd frontend
npm run dev
```

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Token diperlukan" | Login dengan kredensial default |
| "Email atau password salah" | Gunakan kredensial: admin@jacms.com / admin123 |
| "Your session has expired" | Login ulang |
| "Failed to fetch" | Periksa koneksi backend |

### Database Seeding

Jika database kosong atau tidak ada user, jalankan seeder:

```bash
cd backend
npm run db:seed
```

Ini akan membuat user default dengan kredensial yang disebutkan di atas.

### Development Tips

1. **Gunakan Browser Developer Tools** untuk memeriksa:
   - Network requests
   - Console errors
   - localStorage content

2. **Periksa Middleware Logs** di console browser untuk melihat redirects

3. **Gunakan Postman/curl** untuk test API endpoints secara langsung

4. **Periksa CORS settings** jika ada masalah cross-origin requests
