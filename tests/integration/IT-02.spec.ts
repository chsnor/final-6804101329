import { test, expect } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

/**
 * Driver สำหรับ Bottom-Up Integration Testing
 * ทำหน้าที่เตรียมสถานะ Login (Cookie session-username) แล้วเปิดหน้า Inventory
 * โดยไม่ผ่าน Login Form ของ SauceDemo
 */
async function driverOpenInventory(context: BrowserContext): Promise<Page> {
  await context.addCookies([
    {
      name: 'session-username',
      value: 'standard_user',
      domain: 'www.saucedemo.com',
      path: '/',
    },
  ]);

  const page = await context.newPage();
  // จำกัดเวลาครั้งแรก 10 วิ และลองใหม่ 1 ครั้งหากการเชื่อมต่อขัดข้องชั่วคราว
  await page.goto('https://www.saucedemo.com/inventory.html', { timeout: 10_000 })
    .catch(() => page.goto('https://www.saucedemo.com/inventory.html'));
  return page;
}

test('IT-02: DRIVER login state -> REAL Inventory and Cart', {
  annotation: {
    type: 'description',
    description: 'ใช้ Driver เตรียมสถานะ Login เพื่อทดสอบ Inventory และ Cart จริง'
  }
}, async ({ browser }) => {
  const context = await browser.newContext();
  try {
    await test.step('สร้าง Driver และเปิด Inventory', async () => {
      // สร้าง BrowserContext และใช้ driverOpenInventory() ตั้งค่า Cookie
      const page = await driverOpenInventory(context);
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator('.title')).toHaveText('Products');
    });

    await test.step('ตรวจสอบ Inventory จริง', async () => {
      // ตรวจสอบสินค้า 6 รายการ
      const page = context.pages()[0];
      await expect(page.locator('.inventory_item')).toHaveCount(6);
    });

    await test.step('เพิ่มสินค้า 2 รายการ', async () => {
      // เพิ่ม Backpack และ Bike Light แล้วตรวจสอบ Cart Badge = 2
      const page = context.pages()[0];
      await page.click('#add-to-cart-sauce-labs-backpack');
      await page.click('#add-to-cart-sauce-labs-bike-light');
      await expect(page.locator('#remove-sauce-labs-backpack')).toHaveText('Remove');
      await expect(page.locator('#remove-sauce-labs-bike-light')).toHaveText('Remove');
      await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
    });

    await test.step('ตรวจสอบสินค้าใน Cart', async () => {
      // เปิด Cart และตรวจสอบชื่อสินค้าทั้งสองรายการ
      const page = context.pages()[0];
      await page.click('.shopping_cart_link');
      await expect(page).toHaveURL(/cart\.html/);
      await expect(page.locator('.cart_item')).toHaveCount(2);
      await expect(page.locator('.inventory_item_name')).toContainText([
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light',
      ]);
      await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
      await expect(page.getByText('Sauce Labs Bike Light')).toBeVisible();
    });
  } finally {
    // ปิด BrowserContext ที่สร้างเองเมื่อสิ้นสุดการทดสอบ
    await context.close();
  }
});
