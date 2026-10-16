import { test, expect } from '@playwright/test';

test('ST-01: complete purchase of two products', {
  annotation: {
    type: 'description',
    description: 'ทดสอบการซื้อ Backpack และ Bike Light ตั้งแต่ Login จนสั่งซื้อสำเร็จ'
  }
}, async ({ page }) => {
  await test.step('Login และตรวจสอบ Inventory', async () => {
    // Login จริงผ่าน SauceDemo (จำกัดเวลาครั้งแรก 10 วิ และลองใหม่ 1 ครั้งหากการเชื่อมต่อขัดข้องชั่วคราว)
    await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'));
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  await test.step('เพิ่มสินค้าสองรายการ', async () => {
    // เพิ่ม Backpack และ Bike Light ตรวจสอบ Badge = 2
    await page.click('#add-to-cart-sauce-labs-backpack');
    await page.click('#add-to-cart-sauce-labs-bike-light');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  await test.step('ตรวจสอบ Cart', async () => {
    // ตรวจสอบชื่อสินค้าทั้งสองรายการ
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(2);
    await expect(page.locator('.inventory_item_name')).toContainText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
    ]);
  });

  await test.step('กรอก Checkout Information', async () => {
    // กรอกข้อมูลลูกค้าและกด Continue
    await page.click('#checkout');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await page.fill('#first-name', 'John');
    await page.fill('#last-name', 'Doe');
    await page.fill('#postal-code', '50000');
    await page.click('#continue');
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  await test.step('ตรวจสอบ Overview และสั่งซื้อ', async () => {
    // ตรวจสอบรายการสินค้าแล้วกด Finish
    await expect(page.locator('.inventory_item_name')).toHaveCount(2);
    await expect(page.locator('.inventory_item_name')).toContainText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
    ]);
    await expect(page.locator('.summary_subtotal_label')).toHaveText(/Item total: \$39\.98/);
    await page.click('#finish');
    await expect(page).toHaveURL(/checkout-complete\.html/);
  });

  await test.step('ตรวจสอบ Order Complete', async () => {
    // ตรวจสอบข้อความ Thank you for your order!
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});
