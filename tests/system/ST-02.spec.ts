import { test, expect } from '@playwright/test';

test('ST-02: checkout validation and recovery', {
  annotation: {
    type: 'description',
    description: 'ตรวจสอบ Checkout Validation และการแก้ไขข้อมูลจนสั่งซื้อสำเร็จ'
  }
}, async ({ page }) => {
  await test.step('Login เพิ่มสินค้า และเปิด Checkout', async () => {
    // เตรียมขั้นตอน Checkout ด้วยระบบจริง (จำกัดเวลาครั้งแรก 10 วิ และลองใหม่ 1 ครั้งหากการเชื่อมต่อขัดข้องชั่วคราว)
    await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'));
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/inventory\.html/);

    await page.click('#add-to-cart-sauce-labs-backpack');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);

    await page.click('#checkout');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  await test.step('ตรวจสอบ First Name is required', async () => {
    // ส่งฟอร์มว่างและตรวจสอบ Error
    await page.click('#continue');
    await expect(page.locator('.error-message-container')).toContainText('First Name is required');
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);
  });

  await test.step('ตรวจสอบ Last Name is required', async () => {
    // กรอก First Name และตรวจสอบ Error
    await page.fill('#first-name', 'John');
    await page.fill('#last-name', '');
    await page.click('#continue');
    await expect(page.locator('.error-message-container')).toContainText('Last Name is required');
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);
  });

  await test.step('ตรวจสอบ Postal Code is required', async () => {
    // กรอก Last Name และตรวจสอบ Error
    await page.fill('#first-name', 'John');
    await page.fill('#last-name', 'Doe');
    await page.fill('#postal-code', '');
    await page.click('#continue');
    await expect(page.locator('.error-message-container')).toContainText('Postal Code is required');
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);
  });

  await test.step('แก้ไขข้อมูลและสั่งซื้อสำเร็จ', async () => {
    // กรอก Postal Code, ตรวจสอบ Overview, กด Finish และตรวจสอบข้อความสำเร็จ
    await page.fill('#first-name', 'John');
    await page.fill('#last-name', 'Doe');
    await page.fill('#postal-code', '50000');
    await page.click('#continue');

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');

    await page.click('#finish');
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});
