// import { test, expect } from '@playwright/test';

// test.describe('E2E Flow - Administrasi Sistem SiakadChain', () => {

//   // test('Alur lengkap: Login, Tambah Data Universitas Kompleks, dan Logout', async ({ page }) => {
//   //   // 1. Akses halaman otentikasi
//   //   await page.goto('http://localhost:8001/auth');

//   //   // 2. Proses Login Admin
//   //   await page.fill('input[placeholder="Email Address"]', 'admin@gmail.com');
//   //   await page.fill('input[placeholder="Password"]', 'password');
//   //   await page.click('button[type="submit"]:has-text("Sign In")');

//   //   // 3. Verifikasi perpindahan ke halaman dashboard admin
//   //   await expect(page).toHaveURL('http://localhost:8001/dashboard/admin');

//   //   // 4. Navigasi langsung menuju manajemen universitas
//   //   await page.goto('http://localhost:8001/dashboard/admin/universities');
//   //   await expect(page).toHaveURL('http://localhost:8001/dashboard/admin/universities');

//   //   // 5. Data dummy array untuk proses penambahan massal
//   //   const dummyUniversities = [
//   //     { name: 'Politeknik Negeri Padang Dummy A', accreditation: 'A' },
//   //     { name: 'Universitas Andalas Dummy B', accreditation: 'B' }
//   //   ];

//   //   // Loop untuk mengeksekusi penambahan setiap data dummy ke dalam komponen form modal
//   //   for (const univ of dummyUniversities) {
//   //     // Klik tombol pemicu munculnya modal form sesuai page.tsx
//   //     await page.click('button:has-text("Add University")');

//   //     // Mengisi field input nama institusi dan pilihan akreditasi
//   //     await page.fill('input[placeholder="Enter full university name"]', univ.name);
//   //     await page.selectOption('select', univ.accreditation);

//   //     // Submit form modal untuk menyimpan data ke backend
//   //     await page.click('button:has-text("Save Changes")');
      
//   //     // Memastikan nama universitas yang baru disimpan berhasil masuk ke baris tabel web
//   //     await expect(page.locator('table')).toContainText(univ.name);
//   //   }

//   //   // 6. Alur Keluar Sistem melalui tombol Logout pada area sidebar
//   //   await page.click('button:has-text("Logout")');

//   //   // 7. Memastikan alur kembali ke halaman awal login setelah session berakhir
//   //   await expect(page).toHaveURL('http://localhost:8001/auth');
//   // });
// });