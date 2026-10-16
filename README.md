# final-6804101329 — ข้อสอบปลายภาค Software Testing ด้วย Playwright

รายงานและ Source Code สำหรับการทดสอบระบบ **SauceDemo** (<https://www.saucedemo.com/>)
ด้วย **Playwright Test (TypeScript)** จำนวน 6 ข้อ (3 บท บทละ 2 ข้อ ข้อละ 20 คะแนน รวม 120 คะแนน)

## โครงสร้าง Repository

```text
final-6804101329/
├── README.md
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tests/
│   ├── unit/
│   │   ├── UT-01.spec.ts
│   │   └── UT-02.spec.ts
│   ├── integration/
│   │   ├── IT-01.spec.ts
│   │   └── IT-02.spec.ts
│   └── system/
│       ├── ST-01.spec.ts
│       └── ST-02.spec.ts
├── playwright-report/
│   ├── index.html
│   └── data/
└── reports/
    ├── results.json
    └── test-summary.md
```

## วิธีรันการทดสอบ

```bash
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report
```

ค่าที่ตั้งไว้ใน `playwright.config.ts`

- `baseURL`: `https://www.saucedemo.com`
- `workers: 1`, `retries: 0`, `timeout: 30000`
- Reporter: `list`, `html` (ที่ `playwright-report/`) และ `json` (ที่ `reports/results.json`)
- `screenshot: only-on-failure`, `trace: retain-on-failure`, `video: retain-on-failure`

 Username / Password สำหรับการเข้าสู่ระบบปกติ: `standard_user` / `secret_sauce`

## สรุป Test Cases

| บท | รหัส | ชื่อ Test | ไฟล์ |
|---|---|---|---|
| 1 | UT-01.1 | empty username and password | `tests/unit/UT-01.spec.ts` |
| 1 | UT-01.2 | missing password | `tests/unit/UT-01.spec.ts` |
| 1 | UT-01.3 | invalid login details | `tests/unit/UT-01.spec.ts` |
| 1 | UT-02 | product button state Add to cart -> Remove -> Add to cart | `tests/unit/UT-02.spec.ts` |
| 2 | IT-01 | top-down REAL Login -> browser-level Inventory STUB | `tests/integration/IT-01.spec.ts` |
| 2 | IT-02 | DRIVER login state -> REAL Inventory and Cart | `tests/integration/IT-02.spec.ts` |
| 3 | ST-01 | complete purchase of two products | `tests/system/ST-01.spec.ts` |
| 3 | ST-02 | checkout validation and recovery | `tests/system/ST-02.spec.ts` |

## บทที่ 1: Unit / UI Component Testing

- **UT-01** ตรวจสอบ Login Form 3 กรณี (ไม่กรอกข้อมูล / ไม่กรอก Password / ข้อมูลผิด)
  โดยยืนยันข้อความ Error และยืนยันว่าไม่มีกรณีใดเข้าสู่หน้า Inventory
- **UT-02** ตรวจสอบสถานะปุ่มของ Sauce Labs Backpack: `Add to cart` → `Remove` → `Add to cart`
  พร้อม Cart Badge `1` ตอนเพิ่มสินค้า และ Badge หายไปหลังลบสินค้า

> หมายเหตุเชิงวิชาการ: บทที่ 1 เป็น UI Component / Functional Testing ผ่าน Black-box Browser
> ไม่ใช่ Unit Testing ของฟังก์ชันภายใน เนื่องจากไม่สามารถเข้าถึง Source Code ของ SauceDemo

## บทที่ 2: Integration Testing

### IT-01 — Top-Down Integration Testing ด้วย Stub ส่วนใด Real และส่วนใด Stub

| ส่วน | ชนิด | รายละเอียด |
|---|---|---|
| การเปิดเว็บไซต์และ Login ด้วย `standard_user` / `secret_sauce` | **REAL** | ใช้ Browser จริงเรียก `https://www.saucedemo.com/` และกดปุ่ม Login จริง |
| การตรวจสอบ URL `inventory.html` และหัวข้อ `Products` | **REAL** | ตรวจจากหน้าเว็บจริงหลัง Login สำเร็จ |
| เนื้อหาหน้า Inventory ที่แสดงในขั้นถัดไป | **STUB** | ใช้ `page.setContent()` สร้าง DOM จำลองขึ้นมาแทนหน้า Inventory จริง |
| ข้อความ `Mock Inventory Ready` และสินค้า `Mock Backpack` / `Mock Bike Light` | **STUB** | ข้อมูลจำลองทั้งหมด ไม่ได้มาจากเซิร์ฟเวอร์จริง |

Stub ข้อนี้เป็นการจำลอง DOM ระดับ Browser หลัง Login จริง ไม่ใช่การแทน Internal Module ของ SauceDemo
โดยตรง — ส่วนที่เป็น Real คือระบบ Login จริง ส่วนที่เป็น Stub คือหน้า Inventory ที่จำลองขึ้นมาใหม่

### IT-02 — Bottom-Up Integration Testing ด้วย Driver บทบาทของ Driver และส่วนที่เป็น Real

- **Driver** คือฟังก์ชัน `driverOpenInventory(context)` ที่ทำหน้าที่ "จำลองการเรียกใช้โมดูลล่างสุด"
  ในแนวทาง Bottom-Up โดย:
  1. ใช้ `BrowserContext.addCookies()` ตั้ง Cookie `session-username = standard_user`
     บนโดเมน `www.saucedemo.com` เพื่อ**เตรียมสถานะ Login ให้เสร็จแล้ว**
  2. เปิด `https://www.saucedemo.com/inventory.html` โดยตรง**ไม่ผ่าน Login Form**
  3. คืน Page ที่พร้อมใช้งานกลับไปให้ Test
- **ส่วนที่เป็น REAL ทั้งหมด:** หน้า Inventory จริง, สินค้า 6 รายการจริง, ปุ่ม Add to cart / Remove จริง,
  Cart Badge จริง และหน้า Shopping Cart จริง — ไม่มีส่วนใดถูกจำลอง
- ผลคือ Test ที่เหลือสามารถทดสอบ Interaction ของ Inventory และ Cart ได้โดยไม่ต้องพึ่งพาขั้นตอน Login
  ซึ่งเป็นจุดประสงค์ของ Bottom-Up ที่เติมส่วนล่างก่อนแล้วค่อยต่อส่วนบน

## บทที่ 3: System Testing

- **ST-01** ทดสอบกระบวนการซื้อสินค้าสองรายการครบทุกขั้นตอนตั้งแต่ Login → เพิ่มสินค้า →
  Cart → Checkout Information → Checkout Overview → Finish → `Thank you for your order!`
- **ST-02** ทดสอบ Checkout Validation ครบทั้ง `First Name is required`, `Last Name is required`,
  `Postal Code is required` รวมถึงการแก้ไขข้อมูลจนสั่งซื้อสำเร็จ (Recovery)

## รายงานผลการทดสอบ

- **HTML Report:** `playwright-report/index.html` (merges ทั้งหมดอยู่ใน `playwright-report/data/`)
- **JSON Report:** `reports/results.json`
- **สรุปผล Passed/Failed และข้อผิดพลาด:** `reports/test-summary.md`

ผลลัพธ์ในรายงานทั้งหมดมาจากการรัน `npx playwright test` จริง ไม่ได้แก้ไขด้วยมือ
ผู้ตรวจสามารถ Clone แล้วใช้ `npx playwright show-report` เพื่อดูรายงานแบบ Interactive ที่บันทึกไว้
