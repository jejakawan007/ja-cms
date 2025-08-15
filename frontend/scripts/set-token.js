// Script untuk menyimpan token ke localStorage
// Jalankan di browser console

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU4d2xta3EwMDAwZXhpa3FuZzNoejZnIiwiZW1haWwiOiJhZG1pbkBqYS1jbXMuY29tIiwicm9sZSI6IkFETUlOIiwicGVybWlzc2lvbnMiOlsibWFuYWdlX3VzZXJzIiwibWFuYWdlX3Bvc3RzIiwicHVibGlzaF9wb3N0cyIsIm1hbmFnZV9jYXRlZ29yaWVzIiwibWFuYWdlX3RhZ3MiLCJtYW5hZ2VfbWVkaWEiLCJtYW5hZ2Vfc2V0dGluZ3MiLCJ2aWV3X2FuYWx5dGljcyIsIm1hbmFnZV9tZW51cyJdLCJpYXQiOjE3NTUwMjUwNTcsImV4cCI6MTc1NTYyOTg1N30.PEmnnFJDrohYq8NRWEoB6ZeN8IkqmSst7x1ejF-uHxY";

const refreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU4d2xta3EwMDAwZXhpa3FuZzNoejZnIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTUwMjUwNTcsImV4cCI6MTc1NzYxNzA1N30.Ah95oczGul04ZHUe5eUxlmsEHB0o1nSZ7v-s0tommsM";

// Simpan token ke localStorage
localStorage.setItem('ja-cms-token', token);
localStorage.setItem('refreshToken', refreshToken);

console.log('✅ Token berhasil disimpan ke localStorage');
console.log('Token:', token.substring(0, 50) + '...');
console.log('Refresh Token:', refreshToken.substring(0, 50) + '...');
