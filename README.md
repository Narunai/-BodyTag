# ⚡ BodyTag - Workout Muscle Tracker & Heatmap Pro

ระบบติดตามและวิเคราะห์การออกกำลังกายรายมัดกล้ามเนื้อ (Workout Muscle Tracker) พร้อมแสดงผลแบบ **Interactive Human Anatomy Heatmap** พัฒนาด้วย **Python (FastAPI + SQLite / Supabase Cloud PostgreSQL)** และ **Modern Web UI (Tailwind CSS + SVG Anatomy Vector)**

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **บันทึกรายสัปดาห์ & วันฝึกแบบยืดหยุ่น (Weekly & Custom Dynamic Days Log):**
   - แยกระบบติดตามเป็นรายสัปดาห์ (สัปดาห์ที่ 1, สัปดาห์ที่ 2, ...) คำนวณสถิติและ Heatmap แยกเฉพาะสัปดาห์นั้นๆ
   - สร้างวันฝึกได้เองแบบไม่ Fix วัน (เช่น สัปดาห์หนึ่งอาจมี 1 หรือ 2-3 วันฝึก) พร้อมแนบวันเวลาจริงอ้างอิง (📅 Real Date Reference)
   - สรุปกลุ่มกล้ามเนื้อที่ถูกฝึกในแต่ละวันพร้อมจำนวนเซ็ต

2. **Interactive Muscle Heatmap (SVG Body Map):**
   - แสดงผลแบบเวกเตอร์ทั้งมุมมอง **ด้านหน้า (Anterior)**, **ด้านหลัง (Posterior)** และ **มุมมองคู่ (Dual View)**
   - เปลี่ยนสีตามระดับความเข้มข้น (Heatmap: เขียว $\rightarrow$ ส้ม $\rightarrow$ แดง)
   - แยกระดับมัดกล้ามเนื้อหลัก (**Primary Load 100%**) และมัดกล้ามเนื้อรอง (**Secondary Load 50%**)

3. **ระบบวิเคราะห์การฟื้นตัว (Muscle Recovery Decay):**
   - คำนวณเปอร์เซ็นต์การฟื้นตัวของกล้ามเนื้อแต่ละมัดตามเวลาจริง ($0-100\%$)
   - แสดงระยะเวลาคงเหลือโดยประมาณ (Hours Remaining) ก่อนที่กล้ามเนื้อจะพร้อมรับการฝึกหนักอีกครั้ง

4. **เกณฑ์ปริมาณการฝึก Hypertrophy Volume Landmarks:**
   - ติดตามปริมาณเซ็ตเทียบกับเกณฑ์ **MEV** (Minimum Effective Volume), **MAV** (Maximum Adaptive Volume), และ **MRV** (Maximum Recoverable Volume)

5. **ฐานข้อมูลท่าฝึกมาตรฐาน & Custom Exercises:**
   - ท่าฝึกเพาะกายและเวทเทรนนิ่งมาตรฐานกว่า 30 ท่า แยกตามหมวดหมู่ (Chest, Back, Shoulders, Legs, Arms, Core)
   - สามารถกดเพิ่มท่าออกกำลังกายของตนเอง (Custom Exercise) พร้อมเลือกมัดกล้ามเนื้อหลัก-รองได้อย่างอิสระ

6. **ระบบฐานข้อมูลแบบ Hybrid (Local SQLite & Supabase Cloud PostgreSQL):**
   - รองรับทั้ง Local SQLite ใช้งานได้ทันทีแบบ Offline
   - รองรับการเชื่อมต่อกับ **Supabase Cloud Database** เพื่อจัดเก็บข้อมูลบนคลาวด์

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (How to Run)

### 1. ติดตั้ง Dependencies
```bash
pip install -r requirements.txt
```

### 2. รันโปรเจกต์
* **วิธีที่ 1:** ดับเบิลคลิกไฟล์ `run.bat`
* **วิธีที่ 2:** รันผ่านคำสั่ง Terminal:
  ```bash
  python main.py
  ```

เปิดเว็บบราวเซอร์ไปที่:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## ☁️ การเชื่อมต่อกับ Supabase Cloud Database

1. นำโค้ด SQL จากไฟล์ `supabase_schema.sql` ไปวางและกด **Run** ในเมนู **SQL Editor** บน [Supabase Dashboard](https://supabase.com/dashboard)
2. สร้างไฟล์ `.env` (คัดลอกตัวอย่างจาก `.env.example`) และใส่ค่า Project URL และ Anon Key ของคุณ:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-publishable-key
   ```
3. รัน `python main.py` ระบบจะเชื่อมต่อกับ Supabase Cloud อัตโนมัติทันที

