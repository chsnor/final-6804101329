import { test, expect } from '@playwright/test';

test('IT-01: top-down REAL Login -> browser-level Inventory STUB', {
  annotation: {
    type: 'description',
    description: 'ทดสอบ Login จริงร่วมกับ Inventory Stub ที่จำลองด้วย page.setContent()'
  }
}, async ({ page }) => {
  await test.step('Login ผ่านหน้าเว็บไซต์จริง', async () => {
    // Login และตรวจสอบ URL inventory.html (จำกัดเวลาครั้งแรก 10 วิ และลองใหม่ 1 ครั้งหากการเชื่อมต่อขัดข้องชั่วคราว)
    await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'));
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  await test.step('สร้าง Inventory Stub', async () => {
    // ใช้ page.setContent() แสดง Mock Inventory Ready และสินค้าจำลอง 2 รายการ
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="utf-8"><title>Inventory Stub</title></head>
        <body>
          <div id="page_wrapper">
            <div id="header"><div class="app_logo">Swag Labs</div></div>
            <div id="contents">
              <div class="inventory_container">
                <div class="title" data-test="title">Mock Inventory Ready</div>
                <div class="inventory_list" data-test="inventory-list">
                  <div class="inventory_item" data-test="inventory-item-name">
                    <div class="inventory_item_name" data-test="inventory-item-name-mock-backpack">Mock Backpack</div>
                  </div>
                  <div class="inventory_item" data-test="inventory-item">
                    <div class="inventory_item_name" data-test="inventory-item-name-mock-bike-light">Mock Bike Light</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  await test.step('ตรวจสอบผลจาก Stub', async () => {
    // ตรวจสอบข้อความ จำนวน และชื่อสินค้าจำลอง
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByText('Mock Inventory Ready')).toBeVisible();

    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(2);

    const names = page.locator('.inventory_item_name');
    await expect(names).toHaveCount(2);
    await expect(names.nth(0)).toHaveText('Mock Backpack');
    await expect(names.nth(1)).toHaveText('Mock Bike Light');
    await expect(page.getByText('Mock Backpack')).toBeVisible();
    await expect(page.getByText('Mock Bike Light')).toBeVisible();
  });
});
