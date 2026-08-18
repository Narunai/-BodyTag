# Standard Strength Training Exercises Database
# Includes primary and secondary muscle mappings

INITIAL_EXERCISES = [
    # --- CHEST (อก) ---
    {
        "id": "bench_press",
        "name": "Barbell Bench Press",
        "name_th": "เบนช์เพรส บาร์เบล",
        "category": "Chest",
        "primary": ["chest"],
        "secondary": ["triceps", "front-deltoids"]
    },
    {
        "id": "incline_dumbbell_press",
        "name": "Incline Dumbbell Press",
        "name_th": "ดัมเบลเพรส อกบน",
        "category": "Chest",
        "primary": ["chest", "front-deltoids"],
        "secondary": ["triceps"]
    },
    {
        "id": "chest_fly",
        "name": "Cable / Dumbbell Fly",
        "name_th": "เคเบิล / ดัมเบล ฟลาย",
        "category": "Chest",
        "primary": ["chest"],
        "secondary": ["front-deltoids"]
    },
    {
        "id": "dips",
        "name": "Chest Dips",
        "name_th": "ดิปส์ (อก/หลังแขน)",
        "category": "Chest",
        "primary": ["chest", "triceps"],
        "secondary": ["front-deltoids"]
    },
    {
        "id": "pushups",
        "name": "Push Ups",
        "name_th": "วิดพื้น",
        "category": "Chest",
        "primary": ["chest"],
        "secondary": ["triceps", "front-deltoids", "abs"]
    },

    # --- BACK (หลัง) ---
    {
        "id": "pullup",
        "name": "Pull Up / Chin Up",
        "name_th": "ดึงข้อ (Pull Up)",
        "category": "Back",
        "primary": ["upper-back"],
        "secondary": ["biceps", "forearms", "trapezius"]
    },
    {
        "id": "lat_pulldown",
        "name": "Lat Pulldown",
        "name_th": "ดึงปีกหลัง (Lat Pulldown)",
        "category": "Back",
        "primary": ["upper-back"],
        "secondary": ["biceps", "forearms"]
    },
    {
        "id": "barbell_row",
        "name": "Barbell Bent-Over Row",
        "name_th": "ก้มดึงบาร์เบล (Barbell Row)",
        "category": "Back",
        "primary": ["upper-back", "trapezius"],
        "secondary": ["biceps", "lower-back", "forearms"]
    },
    {
        "id": "deadlift",
        "name": "Conventional Deadlift",
        "name_th": "เดดลิฟต์ (Deadlift)",
        "category": "Back",
        "primary": ["lower-back", "gluteal", "hamstrings"],
        "secondary": ["trapezius", "upper-back", "forearms", "quadriceps"]
    },
    {
        "id": "seated_cable_row",
        "name": "Seated Cable Row",
        "name_th": "ดึงเคเบิลท่านั่ง (Seated Row)",
        "category": "Back",
        "primary": ["upper-back", "trapezius"],
        "secondary": ["biceps", "forearms"]
    },
    {
        "id": "face_pull",
        "name": "Cable Face Pull",
        "name_th": "เฟสพูล เคเบิล (Face Pull)",
        "category": "Back",
        "primary": ["back-deltoids", "trapezius"],
        "secondary": ["upper-back"]
    },

    # --- SHOULDERS (ไหล่) ---
    {
        "id": "overhead_press",
        "name": "Overhead Shoulder Press",
        "name_th": "โอเวอร์เฮดเพรส บาร์เบล",
        "category": "Shoulders",
        "primary": ["front-deltoids"],
        "secondary": ["triceps", "trapezius", "abs"]
    },
    {
        "id": "lateral_raise",
        "name": "Dumbbell Lateral Raise",
        "name_th": "กางแขนข้างดัมเบล (ไหล่ข้าง)",
        "category": "Shoulders",
        "primary": ["front-deltoids"],
        "secondary": ["trapezius"]
    },
    {
        "id": "arnold_press",
        "name": "Arnold Press",
        "name_th": "อาร์โนลด์ เพรส",
        "category": "Shoulders",
        "primary": ["front-deltoids"],
        "secondary": ["triceps", "trapezius"]
    },
    {
        "id": "rear_delt_fly",
        "name": "Rear Delt Fly",
        "name_th": "กางแขนหลัง (ไหล่หลัง)",
        "category": "Shoulders",
        "primary": ["back-deltoids"],
        "secondary": ["trapezius", "upper-back"]
    },
    {
        "id": "shrugs",
        "name": "Barbell / Dumbbell Shrugs",
        "name_th": "ยักไหล่ (Shrugs)",
        "category": "Shoulders",
        "primary": ["trapezius"],
        "secondary": ["forearms"]
    },

    # --- LEGS (ขา & ก้น) ---
    {
        "id": "squat",
        "name": "Barbell Back Squat",
        "name_th": "สควอท บาร์เบล",
        "category": "Legs",
        "primary": ["quadriceps", "gluteal"],
        "secondary": ["hamstrings", "calves", "lower-back", "abs"]
    },
    {
        "id": "front_squat",
        "name": "Front Squat",
        "name_th": "ฟรอนต์ สควอท",
        "category": "Legs",
        "primary": ["quadriceps"],
        "secondary": ["gluteal", "abs", "calves"]
    },
    {
        "id": "romanian_deadlift",
        "name": "Romanian Deadlift (RDL)",
        "name_th": "โรมาเนียน เดดลิฟต์ (RDL)",
        "category": "Legs",
        "primary": ["hamstrings", "gluteal"],
        "secondary": ["lower-back", "forearms"]
    },
    {
        "id": "leg_press",
        "name": "Leg Press",
        "name_th": "เลกเพรส (Leg Press)",
        "category": "Legs",
        "primary": ["quadriceps", "gluteal"],
        "secondary": ["hamstrings", "calves"]
    },
    {
        "id": "lunges",
        "name": "Walking Lunges",
        "name_th": "ลันจ์ ดัมเบล (Lunges)",
        "category": "Legs",
        "primary": ["quadriceps", "gluteal"],
        "secondary": ["hamstrings", "calves"]
    },
    {
        "id": "leg_extension",
        "name": "Leg Extension",
        "name_th": "เตะขาหน้า (Leg Extension)",
        "category": "Legs",
        "primary": ["quadriceps"],
        "secondary": []
    },
    {
        "id": "hamstring_curl",
        "name": "Lying / Seated Leg Curl",
        "name_th": "พับขาหลัง (Leg Curl)",
        "category": "Legs",
        "primary": ["hamstrings"],
        "secondary": ["calves"]
    },
    {
        "id": "calf_raise",
        "name": "Standing Calf Raise",
        "name_th": "เขย่งน่อง (Calf Raise)",
        "category": "Legs",
        "primary": ["calves"],
        "secondary": ["tibialis"]
    },
    {
        "id": "hip_thrust",
        "name": "Barbell Hip Thrust",
        "name_th": "ฮิปทรัสต์ (Hip Thrust)",
        "category": "Legs",
        "primary": ["gluteal"],
        "secondary": ["hamstrings", "quadriceps"]
    },

    # --- ARMS (แขน) ---
    {
        "id": "bicep_curl",
        "name": "Barbell Bicep Curl",
        "name_th": "ยกหน้าแขน บาร์เบล",
        "category": "Arms",
        "primary": ["biceps"],
        "secondary": ["forearms"]
    },
    {
        "id": "hammer_curl",
        "name": "Dumbbell Hammer Curl",
        "name_th": "แฮมเมอร์ เคิร์ล ดัมเบล",
        "category": "Arms",
        "primary": ["biceps", "forearms"],
        "secondary": []
    },
    {
        "id": "tricep_pushdown",
        "name": "Cable Tricep Pushdown",
        "name_th": "กดหลังแขน เคเบิล",
        "category": "Arms",
        "primary": ["triceps"],
        "secondary": []
    },
    {
        "id": "skull_crushers",
        "name": "Skull Crushers (EZ Bar)",
        "name_th": "สคัล ครัชเชอร์ (หลังแขน)",
        "category": "Arms",
        "primary": ["triceps"],
        "secondary": ["forearms"]
    },
    {
        "id": "preacher_curl",
        "name": "Preacher Curl",
        "name_th": "พรีเชอร์ เคิร์ล",
        "category": "Arms",
        "primary": ["biceps"],
        "secondary": ["forearms"]
    },

    # --- CORE (แกนกลางลำตัว) ---
    {
        "id": "plank",
        "name": "Standard Plank",
        "name_th": "แพลงก์ (Plank)",
        "category": "Core",
        "primary": ["abs"],
        "secondary": ["obliques", "lower-back", "front-deltoids"]
    },
    {
        "id": "hanging_leg_raise",
        "name": "Hanging Leg Raise",
        "name_th": "โหนบาร์ยกขา (ท้องล่าง)",
        "category": "Core",
        "primary": ["abs"],
        "secondary": ["obliques", "forearms"]
    },
    {
        "id": "cable_woodchopper",
        "name": "Cable Woodchopper / Russian Twist",
        "name_th": "วูดชอปเปอร์ / รัสเซียนทวิสต์",
        "category": "Core",
        "primary": ["obliques"],
        "secondary": ["abs"]
    },
    {
        "id": "ab_crunch",
        "name": "Cable / Floor Crunch",
        "name_th": "ครันช์ หน้าท้อง",
        "category": "Core",
        "primary": ["abs"],
        "secondary": []
    }
]

MUSCLE_METADATA = {
    "chest": {"name_en": "Chest (Pectorals)", "name_th": "กล้ามเนื้อหน้าอก", "view": "anterior", "mev": 8, "mav": 14, "mrv": 22},
    "front-deltoids": {"name_en": "Front Shoulders", "name_th": "กล้ามเนื้อหัวไหล่หน้า/ข้าง", "view": "anterior", "mev": 6, "mav": 12, "mrv": 20},
    "back-deltoids": {"name_en": "Rear Shoulders", "name_th": "กล้ามเนื้อหัวไหล่หลัง", "view": "posterior", "mev": 6, "mav": 12, "mrv": 20},
    "biceps": {"name_en": "Biceps", "name_th": "กล้ามเนื้อต้นแขนด้านหน้า", "view": "anterior", "mev": 8, "mav": 14, "mrv": 20},
    "triceps": {"name_en": "Triceps", "name_th": "กล้ามเนื้อต้นแขนด้านหลัง", "view": "both", "mev": 6, "mav": 12, "mrv": 18},
    "forearms": {"name_en": "Forearms", "name_th": "กล้ามเนื้อปลายแขน", "view": "both", "mev": 4, "mav": 10, "mrv": 16},
    "abs": {"name_en": "Abdominals", "name_th": "กล้ามเนื้อหน้าท้อง", "view": "anterior", "mev": 6, "mav": 12, "mrv": 20},
    "obliques": {"name_en": "Obliques", "name_th": "กล้ามเนื้อหน้าท้องด้านข้าง", "view": "anterior", "mev": 4, "mav": 8, "mrv": 14},
    "trapezius": {"name_en": "Trapezius (Traps)", "name_th": "กล้ามเนื้อสะบัก / หนอกคอ", "view": "posterior", "mev": 4, "mav": 10, "mrv": 18},
    "upper-back": {"name_en": "Upper Back / Lats", "name_th": "กล้ามเนื้อหลังส่วนบน / ปีก", "view": "posterior", "mev": 8, "mav": 14, "mrv": 22},
    "lower-back": {"name_en": "Lower Back (Erectors)", "name_th": "กล้ามเนื้อหลังส่วนล่าง", "view": "posterior", "mev": 4, "mav": 8, "mrv": 14},
    "gluteal": {"name_en": "Glutes", "name_th": "กล้ามเนื้อก้น / สะโพก", "view": "posterior", "mev": 4, "mav": 12, "mrv": 18},
    "quadriceps": {"name_en": "Quadriceps (Quads)", "name_th": "กล้ามเนื้อต้นขาด้านหน้า", "view": "anterior", "mev": 8, "mav": 14, "mrv": 22},
    "hamstrings": {"name_en": "Hamstrings", "name_th": "กล้ามเนื้อต้นขาด้านหลัง", "view": "posterior", "mev": 6, "mav": 12, "mrv": 18},
    "calves": {"name_en": "Calves", "name_th": "กล้ามเนื้อน่อง", "view": "both", "mev": 6, "mav": 12, "mrv": 20},
    "tibialis": {"name_en": "Tibialis", "name_th": "กล้ามเนื้อหน้าแข้ง", "view": "anterior", "mev": 2, "mav": 6, "mrv": 10}
}
