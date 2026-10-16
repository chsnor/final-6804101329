import { test, expect } from '@playwright/test';

test('UT-02: product button state Add to cart -> Remove -> Add to cart', {
  annotation: {
    type: 'description',
    description: 'ตรวจสอบสถานะปุ่ม Add to cart และ Remove รวมถึง Cart Badge'
  }
}, async ({ page }) => {
  await test.step('Login เข้าสู่ระบบ', async () => {
    // Login และตรวจสอบหน้า Inventory (จำกัดเวลาครั้งแรก 10 วิ และลองใหม่ 1 ครั้งหากการเชื่อมต่อขัดข้องชั่วคราว)
    await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'));
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  await test.step('ตรวจสอบปุ่มก่อนเพิ่มสินค้า', async () => {
    // ตรวจสอบปุ่ม Add to cart ของ Backpack
    const backpack = page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' });
    await expect(backpack).toHaveCount(1);
    await expect(backpack.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  await test.step('เพิ่มสินค้าเข้า Cart', async () => {
    // เพิ่มสินค้าและตรวจสอบปุ่ม Remove และ Cart Badge = 1
    await page.click('#add-to-cart-sauce-labs-backpack');
    const backpack = page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' });
    await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  await test.step('ลบสินค้าออกจาก Cart', async () => {
    // ลบสินค้า ตรวจสอบปุ่ม Add to cart และ Cart Badge หายไป
    await page.click('#remove-sauce-labs-backpack');
    const backpack = page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' });
    await expect(backpack.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });
});
