import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Chained Scenario: Academic Record Management & SiakadChain Diploma Issuance', () => {

  const TOTAL_DATA_DUMMY = 100; 
  const dynamicTimeout = Math.max(10000, TOTAL_DATA_DUMMY * 1500);

  test('Dynamic Chained Flow: Academic Registration to Diploma Issuance', async ({ page }) => {
    
    test.setTimeout(Math.max(480000, TOTAL_DATA_DUMMY * 30000));
    
    const stats = {
      totalDuration: 0,
      studiesDuration: 0,
      diplomaDuration: 0,
      validationDuration: 0,
      approvedCount: 0,
    };

    const globalStart = performance.now();

    const pdfFilePath = path.join(__dirname, 'source/tesDiplomaFile.pdf');
    const keyFilePath = path.join(__dirname, 'source/Unit_Test_University_private_key.txt');

    await page.goto('http://localhost:8001/auth');
    await page.fill('input[placeholder="Email Address"]', 'unittest@gmail.com');
    await page.fill('input[placeholder="Password"]', 'password');
    await page.click('button[type="submit"]:has-text("Sign In")');

    await expect(page).toHaveURL('http://localhost:8001/dashboard/university');

    const studentRecords = Array.from({ length: TOTAL_DATA_DUMMY }, (_, index) => {
      const sequenceNumber = String(index + 1).padStart(10, '0'); 
      return {
        nik: '1302100909010000',
        nim: sequenceNumber,
        level: 'S1',
        major: `Informatics Engineering - Batch ${sequenceNumber}`,
        diplomaNumber: `DIP-NUM-${sequenceNumber}`,
        graduationYear: '2026'
      };
    });

    const studiesStart = performance.now();
    
    await page.goto('http://localhost:8001/dashboard/university/studies');
    await expect(page).toHaveURL('http://localhost:8001/dashboard/university/studies');

    for (const record of studentRecords) {
      await page.click('button:has-text("Add New Record")');

      await page.fill('input[placeholder="16-digit number"]', record.nik);
      await page.fill('input[placeholder="NIM"]', record.nim);
      await page.selectOption('select', record.level);
      await page.fill('input[placeholder="e.g. Information Technology"]', record.major);

      const confirmStudyButton = page.locator('button:has-text("Confirm")');
      await confirmStudyButton.click();

    //   await expect(confirmStudyButton).toBeHidden({ timeout: dynamicTimeout });
    }
    stats.studiesDuration = performance.now() - studiesStart;

    const diplomaStart = performance.now();
    
    await page.goto('http://localhost:8001/dashboard/university/diplomas');

    for (const record of studentRecords) {
      await expect(page).toHaveURL('http://localhost:8001/dashboard/university/diplomas');

      await page.click('button:has-text("Issue New Diploma")');

      const searchInput = page.locator('input[placeholder="Enter NIM..."]');
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill(record.nim);
      
      await page.click('button:has(.lucide-search), button:has-text("Search")');

      const selectedCandidatePanel = page.locator('text=Selected Candidate');
      await expect(selectedCandidatePanel).toBeVisible({ timeout: dynamicTimeout });

      await page.fill('input:below(label:has-text("Diploma Number"))', record.diplomaNumber);
      await page.fill('input[type="number"]', record.graduationYear);

      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.click('text=Upload PDF');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(pdfFilePath);

      const keyChooserPromise = page.waitForEvent('filechooser');
      await page.click('text=Upload Key (.txt/.pem)');
      const keyChooser = await keyChooserPromise;
      await keyChooser.setFiles(keyFilePath);

      const confirmButton = page.locator('button:has-text("Confirm Issuance")');
      await confirmButton.click();

      await expect(confirmButton).toBeHidden({ timeout: dynamicTimeout });
    }
    stats.diplomaDuration = performance.now() - diplomaStart;

    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('http://localhost:8001/auth');

    await page.fill('input[placeholder="Email Address"]', 'validator@gmail.com');
    await page.fill('input[placeholder="Password"]', 'password');
    await page.click('button[type="submit"]:has-text("Sign In")');

    await expect(page).toHaveURL('http://localhost:8001/dashboard/validator');

    const loadingIndicator = page.locator('.animate-spin');
    
    const validationStart = performance.now();
    console.log(`\n[Playwright] Starting validation of all available transactions sequentially on Dashboard...`);

    for (let i = 0; i < TOTAL_DATA_DUMMY; i++) {
      if (await loadingIndicator.first().isVisible()) {
        await expect(loadingIndicator.first()).toBeHidden({ timeout: dynamicTimeout });
      }

      const currentApproveButton = page.locator('#approve-btn').first();

      if (!(await currentApproveButton.isVisible())) {
        console.log(`[Playwright] No more #approve-btn buttons visible. Terminating process.`);
        break;
      }

      stats.approvedCount++;
      console.log(`[Playwright] Processing transaction validation #${stats.approvedCount}...`);

      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/transactions') && response.status() === 200
      );

      await currentApproveButton.click();

      await responsePromise;
      console.log(`[Success] Transaction #${stats.approvedCount} approval confirmed by network response.`);

      await expect(loadingIndicator.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      await expect(loadingIndicator.first()).toBeHidden({ timeout: dynamicTimeout });
    }

    stats.validationDuration = performance.now() - validationStart;
    console.log(`[Playwright] Finished! Total successfully validated transactions: ${stats.approvedCount}`);

    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('http://localhost:8001/auth');

    stats.totalDuration = performance.now() - globalStart;

    // --- PROSES SIMPAN KE FILE JSON (Mendukung Scalability) ---
    const logFilePath = path.join(__dirname, 'performance_results.json');
    let savedMetrics = [];

    if (fs.existsSync(logFilePath)) {
      try {
        const fileContent = fs.readFileSync(logFilePath, 'utf8');
        savedMetrics = JSON.parse(fileContent);
      } catch (e) {
        savedMetrics = [];
      }
    }

    // Buat data baru yang disesuaikan dalam hitungan detik (seconds)
    const newRecord = {
      total_data: TOTAL_DATA_DUMMY,
      timestamp: new Date().toISOString(),
      metrics: {
        total_duration_sec: parseFloat((stats.totalDuration / 1000).toFixed(2)),
        registration_duration_sec: parseFloat((stats.studiesDuration / 1000).toFixed(2)),
        diploma_issuance_duration_sec: parseFloat((stats.diplomaDuration / 1000).toFixed(2)),
        blockchain_validation_duration_sec: parseFloat((stats.validationDuration / 1000).toFixed(2))
      }
    };

    // Cari jika total_data yang sama sudah ada, timpa dengan data terbaru. Jika belum, masukkan data baru.
    const existingIndex = savedMetrics.findIndex((item: any) => item.total_data === TOTAL_DATA_DUMMY);
    
    if (existingIndex !== -1) {
    savedMetrics[existingIndex] = newRecord;
    } else {
    savedMetrics.push(newRecord);
    }

    // Urutkan berdasarkan jumlah data terkecil menggunakan parameter bertipe any
    savedMetrics.sort((a: any, b: any) => a.total_data - b.total_data);

    fs.writeFileSync(logFilePath, JSON.stringify(savedMetrics, null, 2), 'utf8');
    console.log(`[Success] Performance metric for ${TOTAL_DATA_DUMMY} records saved to performance_results.json`);
  });
});