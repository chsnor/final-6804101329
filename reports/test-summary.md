# สรุปผลการทดสอบ (Test Summary)

**ระบบเป้าหมาย:** <https://www.saucedemo.com/>
**เครื่องมือ:** Playwright Test 1.64.1 (TypeScript) — Browser: Chromium (Desktop Chrome)
**คำสั่งที่ใช้รัน:** `npx playwright test` (จากโฟลเดอร์ `final-exam`)
**ผลรายงานอิเล็กทรอนิกส์:** `playwright-report/index.html` และ `reports/results.json`

> สรุปนี้สร้างจากผลการรันทดสอบจริง ไม่ได้แก้ไขผลรายงานด้วยมือ — ไฟล์ `reports/results.json` และ
> `playwright-report/index.html` ที่แนบมาในการส่งงาน มาจากรันล่าสุดล่าสุดหลังแก้ไขโค้ดครบทุกครั้ง

## ผลการรันอย่างเป็นทางการ (รายงานที่ส่งมอบ)

- **สถานะรวม: Passed 8 / 8 — Failed 0 — Skipped 0 — Flaky 0**
- **ตั้งค่า:** workers = 1, retries = 0, timeout = 30 วินาทีต่อ Test
- รันยืนยันซ้ำหลายรอบหลังแก้ไขโค้ดครั้งสุดท้าย: **8 passed ทุกครั้ง** (ประมาณ 9–18 วินาทีต่อรอบ) — ผล stable ไม่ใช่โชค

| # | บท | ชื่อ Test | ไฟล์ | สถานะ |
|---|---|---|---|---|
| 1 | 2 | IT-01: top-down REAL Login -> browser-level Inventory STUB | `tests/integration/IT-01.spec.ts` | ✅ Passed |
| 2 | 2 | IT-02: DRIVER login state -> REAL Inventory and Cart | `tests/integration/IT-02.spec.ts` | ✅ Passed |
| 3 | 3 | ST-01: complete purchase of two products | `tests/system/ST-01.spec.ts` | ✅ Passed |
| 4 | 3 | ST-02: checkout validation and recovery | `tests/system/ST-02.spec.ts` | ✅ Passed |
| 5 | 1 | UT-01.1: empty username and password | `tests/unit/UT-01.spec.ts` | ✅ Passed |
| 6 | 1 | UT-01.2: missing password | `tests/unit/UT-01.spec.ts` | ✅ Passed |
| 7 | 1 | UT-01.3: invalid login details | `tests/unit/UT-01.spec.ts` | ✅ Passed |
| 8 | 1 | UT-02: product button state Add to cart -> Remove -> Add to cart | `tests/unit/UT-02.spec.ts` | ✅ Passed |

## ข้อผิดพลาดที่พบระหว่างการรันจริง และการแก้ไข

### 1. ST-01 และ ST-02 — ค่า URL ที่ใช้ตรวจสอบไม่ตรงกับ URL จริง (การรันครั้งแรก: 3 failed / 5 passed)

- ข้อผิดพลาด: `expect(page).toHaveURL(/checkout-step1\.html/)` ได้ URL จริงเป็น
  `https://www.saucedemo.com/checkout-step-one.html` — SauceDemo ใช้ชื่อ
  `checkout-step-one.html` และ `checkout-step-two.html` ไม่ใช่ `checkout-step1.html`
- วิธีแก้: แก้ pattern ตรวจสอบ URL ใน `tests/system/ST-01.spec.ts` และ `tests/system/ST-02.spec.ts`
  ให้ตรงกับ URL จริง (`checkout-step-one.html` / `checkout-step-two.html`)

### 2. IT-01 — Test timeout 30000ms ที่ขั้นตอน Login (พบ 2 ครั้งจากการรันหลายรอบ)

- ข้อผิดพลาด: `Test timeout of 30000ms exceeded` ที่ขั้นตอน Login และอีกครั้งได้
  `page.goto: net::ERR_ABORTED; maybe frame was detached?` — สาเหตุคือ **การเชื่อมต่อเครือข่าย
  ครั้งแรกของเบราว์เซอร์ค้างเป็นครั้งคราว** (วัดซ้ำ 5 รอบหลังจากนั้น: ทุกครั้ง ~0.5 วินาที)
  ทำให้ Test ที่รันเป็นไฟล์แรกหมดเวลา 30 วินาทีโดยไม่เกี่ยวกับ Assertions
- วิธีแก้: เพิ่มการ์ดป้องกันทุกจุด `page.goto` — จำกัดความพยายามครั้งแรกที่ 10 วินาที
  และลองใหม่อีก 1 ครั้ง (`await page.goto('/', { timeout: 10_000 }).catch(() => page.goto('/'))`)
  ซึ่งรับมือกับเครือข่ายชั่วคราว **ไม่ได้ลดทอน Assertions และไม่ได้ใช้ retries**
  (ตั้ง `retries: 0` ตามข้อกำหนด) — หากเครือข่ายล่มจริงทั้งสองครั้ง Test จะ Fail ตามผลจริง

หลังแก้ไขทั้งสองข้อ ได้รัน `npx playwright test` ซ้ำหลายรอบ ได้ผล **8/8 Passed ทุกครั้ง**

## หมายเหตุเกี่ยวกับรายงาน

- Playwright 1.64 สร้าง HTML Report แบบ self-contained (ฝังข้อมูลรายงานไว้ในไฟล์
  `playwright-report/index.html`) จึงไม่มีโฟลเดอร์ `playwright-report/data/` เสมอไป
  ซึ่งตามข้อกำหนดระบุว่าไฟล์ประกอบอาจแตกต่างกันตามผลการทดสอบ — ให้เก็บไฟล์ที่ Playwright สร้างจริง
- วิธีดูรายงาน: `npx playwright show-report` ภายในโปรเจกต์
  (การเปิด `index.html` ตรง ๆ บน GitHub ไม่เปิด Interactive Report)
- Trace/Screenshot/Video ตั้งค่าให้เก็บเฉพาะตอน Fail (`only-on-failure` / `retain-on-failure`)
  ดังนั้นรันที่ผ่านทั้งหมดจะไม่มีไฟล์ attachments ค้างใน `test-results/`
- หากมีการรัน `npx playwright test` ซ้ำ `playwright-report/` และ `reports/results.json`
  จะถูกเขียนทับด้วยผลของรันใหม่เสมอ (พฤติกรรมปกติของ Playwright)
