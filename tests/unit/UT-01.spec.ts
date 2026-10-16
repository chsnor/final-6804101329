import { test, expect } from '@playwright/test';

test.describe('UT-01: Login Form Validation', () => {
  test('UT-01.1: empty username and password', {
    annotation: { type: 'description', description: 'ตรวจสอบการ Login เมื่อไม่กรอก Username และ Password' }
  }, async ({ page }) => {
    await test.step('เปิดหน้า Login', async () => {
      // เปิดเว็บไซต์ SauceDemo (จำกัดเวลาครั้งแรก 10 วิ และลองใหม่ 1 ครั้งหากการเชื่อมต่อขัดข้องชั่วคราว)
      await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'));
      await expect(page).toHaveURL(/saucedemo\.com\/?$/);
      await expect(page.locator('#user-name')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
    });
    await test.step('ส่งฟอร์มโดยไม่กรอกข้อมูล', async () => {
      // กดปุ่ม Login
      await page.click('#login-button');
    });
    await test.step('ตรวจสอบ Error และ URL', async () => {
      // ตรวจสอบ Username is required และไม่เข้าสู่ Inventory
      await expect(page.locator('.error-message-container')).toContainText('Username is required');
      await expect(page.locator('#login-button')).toBeVisible();
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });

  test('UT-01.2: missing password', {
    annotation: { type: 'description', description: 'ตรวจสอบการ Login เมื่อกรอก Username แต่ไม่กรอก Password' }
  }, async ({ page }) => {
    await test.step('เปิดหน้า Login และกรอก Username', async () => {
      // กรอก standard_user
      await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'));
      await page.fill('#user-name', 'standard_user');
    });
    await test.step('กด Login โดยไม่กรอก Password', async () => {
      // ส่งฟอร์ม
      await page.click('#login-button');
    });
    await test.step('ตรวจสอบ Error และ URL', async () => {
      // ตรวจสอบ Password is required และไม่เข้าสู่ Inventory
      await expect(page.locator('.error-message-container')).toContainText('Password is required');
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });

  test('UT-01.3: invalid login details', {
    annotation: { type: 'description', description: 'ตรวจสอบการ Login เมื่อ Username และ Password ไม่ถูกต้อง' }
  }, async ({ page }) => {
    await test.step('เปิดหน้า Login และกรอกข้อมูลผิด', async () => {
      // กรอก invalid_user / wrong_password
      await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'));
      await page.fill('#user-name', 'invalid_user');
      await page.fill('#password', 'wrong_password');
    });
    await test.step('กด Login', async () => {
      // ส่งฟอร์ม
      await page.click('#login-button');
    });
    await test.step('ตรวจสอบ Error และ URL', async () => {
      // ตรวจสอบข้อความแจ้งข้อมูลไม่ถูกต้อง และไม่เข้าสู่ Inventory
      await expect(page.locator('.error-message-container')).toContainText(
        'Username and password do not match any user in this service'
      );
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });
});
