/**
 * BodyTag - Muscle Tracker & Anatomy Heatmap Frontend App
 * Supports GitHub Pages, Passcode Authentication ('narunai141214'), Supabase Cloud DB + LocalStorage Dual-Sync, and Weekly/Daily Scopes
 */

const AUTH_PASSCODE = 'narunai141214';
const SUPABASE_URL = 'https://vyajillnaxlbkzkbbznq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NoVKvs7RVPjP3sqLyNDsGw_15pineww';

// Initialize Supabase JS Client safely
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.warn('Supabase client initialization note:', e);
    }
}

// Built-in Exercises & Muscle Metadata (Runs standalone on GitHub Pages)
const INITIAL_EXERCISES = [
    { id: "bench_press", name: "Barbell Bench Press", name_th: "เบนช์เพรส บาร์เบล", category: "Chest", primary: ["chest"], secondary: ["triceps", "front-deltoids"] },
    { id: "incline_dumbbell_press", name: "Incline Dumbbell Press", name_th: "ดัมเบลเพรส อกบน", category: "Chest", primary: ["chest", "front-deltoids"], secondary: ["triceps"] },
    { id: "chest_fly", name: "Cable / Dumbbell Fly", name_th: "เคเบิล / ดัมเบล ฟลาย", category: "Chest", primary: ["chest"], secondary: ["front-deltoids"] },
    { id: "dips", name: "Chest Dips", name_th: "ดิปส์ (อก/หลังแขน)", category: "Chest", primary: ["chest", "triceps"], secondary: ["front-deltoids"] },
    { id: "pushups", name: "Push Ups", name_th: "วิดพื้น", category: "Chest", primary: ["chest"], secondary: ["triceps", "front-deltoids", "abs"] },
    { id: "pullup", name: "Pull Up / Chin Up", name_th: "ดึงข้อ (Pull Up)", category: "Back", primary: ["upper-back"], secondary: ["biceps", "forearms", "trapezius"] },
    { id: "lat_pulldown", name: "Lat Pulldown", name_th: "ดึงปีกหลัง (Lat Pulldown)", category: "Back", primary: ["upper-back"], secondary: ["biceps", "forearms"] },
    { id: "barbell_row", name: "Barbell Bent-Over Row", name_th: "ก้มดึงบาร์เบล (Barbell Row)", category: "Back", primary: ["upper-back", "trapezius"], secondary: ["biceps", "lower-back", "forearms"] },
    { id: "deadlift", name: "Conventional Deadlift", name_th: "เดดลิฟต์ (Deadlift)", category: "Back", primary: ["lower-back", "gluteal", "hamstrings"], secondary: ["trapezius", "upper-back", "forearms", "quadriceps"] },
    { id: "seated_cable_row", name: "Seated Cable Row", name_th: "ดึงเคเบิลท่านั่ง (Seated Row)", category: "Back", primary: ["upper-back", "trapezius"], secondary: ["biceps", "forearms"] },
    { id: "face_pull", name: "Cable Face Pull", name_th: "เฟสพูล เคเบิล (Face Pull)", category: "Back", primary: ["back-deltoids", "trapezius"], secondary: ["upper-back"] },
    { id: "overhead_press", name: "Overhead Shoulder Press", name_th: "โอเวอร์เฮดเพรส บาร์เบล", category: "Shoulders", primary: ["front-deltoids"], secondary: ["triceps", "trapezius", "abs"] },
    { id: "lateral_raise", name: "Dumbbell Lateral Raise", name_th: "กางแขนข้างดัมเบล (ไหล่ข้าง)", category: "Shoulders", primary: ["front-deltoids"], secondary: ["trapezius"] },
    { id: "arnold_press", name: "Arnold Press", name_th: "อาร์โนลด์ เพรส", category: "Shoulders", primary: ["front-deltoids"], secondary: ["triceps", "trapezius"] },
    { id: "rear_delt_fly", name: "Rear Delt Fly", name_th: "กางแขนหลัง (ไหล่หลัง)", category: "Shoulders", primary: ["back-deltoids"], secondary: ["trapezius", "upper-back"] },
    { id: "shrugs", name: "Barbell / Dumbbell Shrugs", name_th: "ยักไหล่ (Shrugs)", category: "Shoulders", primary: ["trapezius"], secondary: ["forearms"] },
    { id: "squat", name: "Barbell Back Squat", name_th: "สควอท บาร์เบล", category: "Legs", primary: ["quadriceps", "gluteal"], secondary: ["hamstrings", "calves", "lower-back", "abs"] },
    { id: "front_squat", name: "Front Squat", name_th: "ฟรอนต์ สควอท", category: "Legs", primary: ["quadriceps"], secondary: ["gluteal", "abs", "calves"] },
    { id: "romanian_deadlift", name: "Romanian Deadlift (RDL)", name_th: "โรมาเนียน เดดลิฟต์ (RDL)", category: "Legs", primary: ["hamstrings", "gluteal"], secondary: ["lower-back", "forearms"] },
    { id: "leg_press", name: "Leg Press", name_th: "เลกเพรส (Leg Press)", category: "Legs", primary: ["quadriceps", "gluteal"], secondary: ["hamstrings", "calves"] },
    { id: "lunges", name: "Walking Lunges", name_th: "ลันจ์ ดัมเบล (Lunges)", category: "Legs", primary: ["quadriceps", "gluteal"], secondary: ["hamstrings", "calves"] },
    { id: "leg_extension", name: "Leg Extension", name_th: "เตะขาหน้า (Leg Extension)", category: "Legs", primary: ["quadriceps"], secondary: [] },
    { id: "hamstring_curl", name: "Lying / Seated Leg Curl", name_th: "พับขาหลัง (Leg Curl)", category: "Legs", primary: ["hamstrings"], secondary: ["calves"] },
    { id: "calf_raise", name: "Standing Calf Raise", name_th: "เขย่งน่อง (Calf Raise)", category: "Legs", primary: ["calves"], secondary: ["tibialis"] },
    { id: "hip_thrust", name: "Barbell Hip Thrust", name_th: "ฮิปทรัสต์ (Hip Thrust)", category: "Legs", primary: ["gluteal"], secondary: ["hamstrings", "quadriceps"] },
    { id: "bicep_curl", name: "Barbell Bicep Curl", name_th: "ยกหน้าแขน บาร์เบล", category: "Arms", primary: ["biceps"], secondary: ["forearms"] },
    { id: "hammer_curl", name: "Dumbbell Hammer Curl", name_th: "แฮมเมอร์ เคิร์ล ดัมเบล", category: "Arms", primary: ["biceps", "forearms"], secondary: [] },
    { id: "tricep_pushdown", name: "Cable Tricep Pushdown", name_th: "กดหลังแขน เคเบิล", category: "Arms", primary: ["triceps"], secondary: [] },
    { id: "skull_crushers", name: "Skull Crushers (EZ Bar)", name_th: "สคัล ครัชเชอร์ (หลังแขน)", category: "Arms", primary: ["triceps"], secondary: ["forearms"] },
    { id: "preacher_curl", name: "Preacher Curl", name_th: "พรีเชอร์ เคิร์ล", category: "Arms", primary: ["biceps"], secondary: ["forearms"] },
    { id: "plank", name: "Standard Plank", name_th: "แพลงก์ (Plank)", category: "Core", primary: ["abs"], secondary: ["obliques", "lower-back", "front-deltoids"] },
    { id: "hanging_leg_raise", name: "Hanging Leg Raise", name_th: "โหนบาร์ยกขา (ท้องล่าง)", category: "Core", primary: ["abs"], secondary: ["obliques", "forearms"] },
    { id: "cable_woodchopper", name: "Cable Woodchopper / Russian Twist", name_th: "วูดชอปเปอร์ / รัสเซียนทวิสต์", category: "Core", primary: ["obliques"], secondary: ["abs"] },
    { id: "ab_crunch", name: "Cable / Floor Crunch", name_th: "ครันช์ หน้าท้อง", category: "Core", primary: ["abs"], secondary: [] }
];

const MUSCLE_METADATA = {
    "chest": { name_en: "Chest (Pectorals)", name_th: "กล้ามเนื้อหน้าอก", view: "anterior", mev: 8, mav: 14, mrv: 22 },
    "front-deltoids": { name_en: "Front Shoulders", name_th: "กล้ามเนื้อหัวไหล่หน้า/ข้าง", view: "anterior", mev: 6, mav: 12, mrv: 20 },
    "back-deltoids": { name_en: "Rear Shoulders", name_th: "กล้ามเนื้อหัวไหล่หลัง", view: "posterior", mev: 6, mav: 12, mrv: 20 },
    "biceps": { name_en: "Biceps", name_th: "กล้ามเนื้อต้นแขนด้านหน้า", view: "anterior", mev: 8, mav: 14, mrv: 20 },
    "triceps": { name_en: "Triceps", name_th: "กล้ามเนื้อต้นแขนด้านหลัง", view: "both", mev: 6, mav: 12, mrv: 18 },
    "forearms": { name_en: "Forearms", name_th: "กล้ามเนื้อปลายแขน", view: "both", mev: 4, mav: 10, mrv: 16 },
    "abs": { name_en: "Abdominals", name_th: "กล้ามเนื้อหน้าท้อง", view: "anterior", mev: 6, mav: 12, mrv: 20 },
    "obliques": { name_en: "Obliques", name_th: "กล้ามเนื้อหน้าท้องด้านข้าง", view: "anterior", mev: 4, mav: 8, mrv: 14 },
    "trapezius": { name_en: "Trapezius (Traps)", name_th: "กล้ามเนื้อสะบัก / หนอกคอ", view: "posterior", mev: 4, mav: 10, mrv: 18 },
    "upper-back": { name_en: "Upper Back / Lats", name_th: "กล้ามเนื้อหลังส่วนบน / ปีก", view: "posterior", mev: 8, mav: 14, mrv: 22 },
    "lower-back": { name_en: "Lower Back (Erectors)", name_th: "กล้ามเนื้อหลังส่วนล่าง", view: "posterior", mev: 4, mav: 8, mrv: 14 },
    "gluteal": { name_en: "Glutes", name_th: "กล้ามเนื้อก้น / สะโพก", view: "posterior", mev: 4, mav: 12, mrv: 18 },
    "quadriceps": { name_en: "Quadriceps (Quads)", name_th: "กล้ามเนื้อต้นขาด้านหน้า", view: "anterior", mev: 8, mav: 14, mrv: 22 },
    "hamstrings": { name_en: "Hamstrings", name_th: "กล้ามเนื้อต้นขาด้านหลัง", view: "posterior", mev: 6, mav: 12, mrv: 18 },
    "calves": { name_en: "Calves", name_th: "กล้ามเนื้อน่อง", view: "both", mev: 6, mav: 12, mrv: 20 },
    "tibialis": { name_en: "Tibialis", name_th: "กล้ามเนื้อหน้าแข้ง", view: "anterior", mev: 2, mav: 6, mrv: 10 }
};

const LS_KEYS = {
    WEEKS: 'bodytag_weeks_v2',
    DAYS: 'bodytag_days_v2',
    LOGS: 'bodytag_logs_v2',
    CUSTOM_EXERCISES: 'bodytag_custom_exercises_v2'
};

const AppState = {
    weeks: [],
    selectedWeekId: null,
    selectedDayId: null,
    logTargetDayId: null,
    exercises: [],
    logs: [],
    stats: { muscles: {}, summary: {} },
    currentView: 'anterior',
    colorMode: 'heatmap',
    selectedCategory: 'all',
    selectedExerciseId: '',
    selectedMuscleKey: null,
    isInitialized: false
};

// Document Ready & Auth Check
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    const authGate = document.getElementById('auth-gate');
    const authForm = document.getElementById('auth-form');
    const authPasscode = document.getElementById('auth-passcode');
    const authError = document.getElementById('auth-error-msg');
    const lockBtn = document.getElementById('btn-lock-app');
    const togglePwdBtn = document.getElementById('btn-toggle-pwd');

    if (togglePwdBtn && authPasscode) {
        togglePwdBtn.addEventListener('click', () => {
            if (authPasscode.type === 'password') {
                authPasscode.type = 'text';
                togglePwdBtn.textContent = '🙈';
            } else {
                authPasscode.type = 'password';
                togglePwdBtn.textContent = '👁️';
            }
        });
    }

    function unlockGate() {
        if (authGate) {
            authGate.style.setProperty('display', 'none', 'important');
            authGate.classList.add('hidden');
            authGate.classList.remove('flex');
        }
        if (authError) authError.classList.add('hidden');
        initializeApp();
    }

    function lockGate() {
        localStorage.removeItem('bodytag_auth_token');
        if (authPasscode) {
            authPasscode.value = '';
            authPasscode.focus();
        }
        if (authError) authError.classList.add('hidden');
        if (authGate) {
            authGate.style.setProperty('display', 'flex', 'important');
            authGate.classList.remove('hidden');
            authGate.classList.add('flex');
        }
    }

    const savedToken = localStorage.getItem('bodytag_auth_token');
    if (savedToken && savedToken.trim().toLowerCase() === AUTH_PASSCODE.toLowerCase()) {
        unlockGate();
    } else {
        lockGate();
    }

    window.handleAuthSubmit = function() {
        const val = (authPasscode ? authPasscode.value : '').trim().toLowerCase();
        if (val === AUTH_PASSCODE.toLowerCase()) {
            localStorage.setItem('bodytag_auth_token', AUTH_PASSCODE);
            unlockGate();
        } else {
            if (authError) authError.classList.remove('hidden');
            if (authPasscode) {
                authPasscode.classList.add('animate-shake');
                setTimeout(() => authPasscode.classList.remove('animate-shake'), 400);
            }
        }
    };

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.handleAuthSubmit();
        });
    }

    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            lockGate();
        });
    }
}

async function initializeApp() {
    if (AppState.isInitialized) return;
    AppState.isInitialized = true;

    initViewControls();
    initFormControls();
    initModalControls();
    initWeekAndDayControls();

    await loadExercises();
    await loadWeeksAndInit();
}
window.initializeApp = initializeApp;

// --- LocalStorage Helpers ---

function getLS(key, fallback) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
    } catch (_) {
        return fallback;
    }
}

function setLS(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
}

// --- Data Operations (Supabase Cloud + LocalStorage Dual-Sync) ---

async function dbGetExercises() {
    let customEx = getLS(LS_KEYS.CUSTOM_EXERCISES, []);

    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.from('exercises').select('*').order('category').order('name');
            if (!error && data && data.length > 0) {
                const cloudCustom = data.filter(r => r.is_custom).map(r => ({
                    id: r.id,
                    name: r.name,
                    name_th: r.name_th || r.name,
                    category: r.category,
                    primary: typeof r.primary_muscles === 'string' ? JSON.parse(r.primary_muscles) : r.primary_muscles,
                    secondary: typeof r.secondary_muscles === 'string' ? JSON.parse(r.secondary_muscles) : r.secondary_muscles,
                    is_custom: true
                }));
                if (cloudCustom.length > 0) {
                    customEx = cloudCustom;
                    setLS(LS_KEYS.CUSTOM_EXERCISES, customEx);
                }
            }
        } catch (e) {
            console.warn('Supabase get exercises note:', e);
        }
    }

    const all = [...INITIAL_EXERCISES];
    customEx.forEach(ce => {
        if (!all.some(e => e.id === ce.id)) all.push(ce);
    });
    return all;
}

async function dbAddExercise(exDict) {
    const customEx = getLS(LS_KEYS.CUSTOM_EXERCISES, []);
    customEx.push(exDict);
    setLS(LS_KEYS.CUSTOM_EXERCISES, customEx);

    if (supabaseClient) {
        try {
            await supabaseClient.from('exercises').insert({
                id: exDict.id,
                name: exDict.name,
                name_th: exDict.name_th || exDict.name,
                category: exDict.category || 'Custom',
                primary_muscles: JSON.stringify(exDict.primary || []),
                secondary_muscles: JSON.stringify(exDict.secondary || []),
                is_custom: 1
            });
        } catch (e) {
            console.warn('Supabase add exercise note:', e);
        }
    }
    return exDict;
}

async function dbGetWeeksWithDays() {
    let localWeeks = getLS(LS_KEYS.WEEKS, null);
    let localDays = getLS(LS_KEYS.DAYS, null);
    let localLogs = getLS(LS_KEYS.LOGS, []);

    // Initial default seed if fresh
    if (!localWeeks || localWeeks.length === 0) {
        localWeeks = [{ id: 1, week_number: 1, title: "สัปดาห์ที่ 1", created_at: new Date().toISOString() }];
        setLS(LS_KEYS.WEEKS, localWeeks);
    }
    if (!localDays || localDays.length === 0) {
        localDays = [{
            id: 1,
            week_id: 1,
            day_number: 1,
            title: "วันที่ 1",
            real_date: new Date().toISOString().split('T')[0],
            notes: "วันฝึกแรก",
            created_at: new Date().toISOString()
        }];
        setLS(LS_KEYS.DAYS, localDays);
    }

    if (supabaseClient) {
        try {
            const [wRes, dRes, lRes] = await Promise.all([
                supabaseClient.from('workout_weeks').select('*').order('week_number', { ascending: true }),
                supabaseClient.from('workout_days').select('*').order('day_number', { ascending: true }),
                supabaseClient.from('workout_logs').select('*, exercises(*)')
            ]);

            if (!wRes.error && wRes.data && wRes.data.length > 0) {
                localWeeks = wRes.data;
                setLS(LS_KEYS.WEEKS, localWeeks);
            }
            if (!dRes.error && dRes.data && dRes.data.length > 0) {
                localDays = dRes.data;
                setLS(LS_KEYS.DAYS, localDays);
            }
            if (!lRes.error && lRes.data) {
                localLogs = lRes.data.map(r => {
                    const ex = r.exercises || {};
                    return {
                        id: r.id,
                        day_id: r.day_id,
                        exercise_id: r.exercise_id,
                        exercise_name: ex.name || '',
                        exercise_name_th: ex.name_th || ex.name || '',
                        category: ex.category || 'General',
                        sets: r.sets,
                        reps: r.reps || 10,
                        weight: r.weight || 0,
                        rpe: r.rpe || 8.0,
                        notes: r.notes || '',
                        logged_at: r.logged_at || '',
                        primary: typeof ex.primary_muscles === 'string' ? JSON.parse(ex.primary_muscles || '[]') : (ex.primary_muscles || []),
                        secondary: typeof ex.secondary_muscles === 'string' ? JSON.parse(ex.secondary_muscles || '[]') : (ex.secondary_muscles || [])
                    };
                });
                setLS(LS_KEYS.LOGS, localLogs);
            }
        } catch (e) {
            console.warn('Supabase get weeks note:', e);
        }
    }

    // Build hierarchy
    const logsByDay = {};
    localLogs.forEach(l => {
        const dId = l.day_id;
        if (!dId) return;
        if (!logsByDay[dId]) logsByDay[dId] = [];
        logsByDay[dId].push(l);
    });

    const daysByWeek = {};
    localDays.forEach(dr => {
        const wId = dr.week_id;
        const dId = dr.id;
        const dayLogs = logsByDay[dId] || [];

        const muscleCounts = {};
        let daySets = 0;
        let dayVolume = 0.0;

        dayLogs.forEach(dl => {
            const s = dl.sets || 0;
            daySets += s;
            dayVolume += s * (dl.reps || 0) * (dl.weight || 0);
            (dl.primary || []).forEach(m => { muscleCounts[m] = (muscleCounts[m] || 0) + s; });
            (dl.secondary || []).forEach(m => { muscleCounts[m] = (muscleCounts[m] || 0) + (s * 0.5); });
        });

        const musclesTrained = Object.entries(muscleCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([mKey, count]) => {
                const meta = MUSCLE_METADATA[mKey] || {};
                return {
                    key: mKey,
                    name_th: meta.name_th || mKey,
                    name_en: meta.name_en || mKey,
                    sets: Math.round(count * 10) / 10
                };
            });

        if (!daysByWeek[wId]) daysByWeek[wId] = [];
        daysByWeek[wId].push({
            id: dId,
            week_id: wId,
            day_number: dr.day_number || 1,
            title: dr.title || `วันที่ ${dr.day_number || 1}`,
            real_date: dr.real_date || '',
            notes: dr.notes || '',
            created_at: dr.created_at || '',
            total_sets: daySets,
            total_volume_kg: Math.round(dayVolume * 10) / 10,
            exercises_count: dayLogs.length,
            muscles_trained: musclesTrained
        });
    });

    return localWeeks.map(wr => {
        const days = daysByWeek[wr.id] || [];
        const weekSets = days.reduce((sum, d) => sum + d.total_sets, 0);
        const weekVolume = days.reduce((sum, d) => sum + d.total_volume_kg, 0);
        return {
            id: wr.id,
            week_number: wr.week_number || 1,
            title: wr.title || `สัปดาห์ที่ ${wr.week_number || 1}`,
            created_at: wr.created_at || '',
            total_days: days.length,
            total_sets: weekSets,
            total_volume_kg: Math.round(weekVolume * 10) / 10,
            days: days
        };
    });
}

async function dbAddWeek(title) {
    const localWeeks = getLS(LS_KEYS.WEEKS, []);
    const localDays = getLS(LS_KEYS.DAYS, []);

    let maxWeekNum = 0;
    let maxId = 0;
    localWeeks.forEach(w => {
        if (w.week_number > maxWeekNum) maxWeekNum = w.week_number;
        if (w.id > maxId) maxId = w.id;
    });

    const nextNum = maxWeekNum + 1;
    const newWeekId = maxId + 1;
    const weekTitle = title && title.trim() ? title.trim() : `สัปดาห์ที่ ${nextNum}`;

    const newWeek = {
        id: newWeekId,
        week_number: nextNum,
        title: weekTitle,
        created_at: new Date().toISOString()
    };
    localWeeks.push(newWeek);
    setLS(LS_KEYS.WEEKS, localWeeks);

    // Auto-create Day 1 for the new week
    let maxDayId = 0;
    localDays.forEach(d => { if (d.id > maxDayId) maxDayId = d.id; });
    const newDay = {
        id: maxDayId + 1,
        week_id: newWeekId,
        day_number: 1,
        title: 'วันที่ 1',
        real_date: new Date().toISOString().split('T')[0],
        notes: '',
        created_at: new Date().toISOString()
    };
    localDays.push(newDay);
    setLS(LS_KEYS.DAYS, localDays);

    if (supabaseClient) {
        try {
            const { data: cloudW } = await supabaseClient.from('workout_weeks').insert({ week_number: nextNum, title: weekTitle }).select();
            if (cloudW && cloudW.length > 0) {
                await supabaseClient.from('workout_days').insert({
                    week_id: cloudW[0].id,
                    day_number: 1,
                    title: 'วันที่ 1',
                    real_date: new Date().toISOString().split('T')[0],
                    notes: ''
                });
            }
        } catch (e) {
            console.warn('Supabase add week note:', e);
        }
    }
    return newWeek;
}

async function dbDeleteWeek(weekId) {
    let localWeeks = getLS(LS_KEYS.WEEKS, []);
    let localDays = getLS(LS_KEYS.DAYS, []);
    let localLogs = getLS(LS_KEYS.LOGS, []);

    const deletedDayIds = localDays.filter(d => d.week_id === weekId).map(d => d.id);
    localWeeks = localWeeks.filter(w => w.id !== weekId);
    localDays = localDays.filter(d => d.week_id !== weekId);
    localLogs = localLogs.filter(l => !deletedDayIds.includes(l.day_id));

    setLS(LS_KEYS.WEEKS, localWeeks);
    setLS(LS_KEYS.DAYS, localDays);
    setLS(LS_KEYS.LOGS, localLogs);

    if (supabaseClient) {
        try {
            await supabaseClient.from('workout_weeks').delete().eq('id', weekId);
        } catch (e) {
            console.warn('Supabase delete week note:', e);
        }
    }
}

async function dbAddDay(weekId, title, realDate, notes) {
    const localDays = getLS(LS_KEYS.DAYS, []);
    const weekDays = localDays.filter(d => d.week_id === weekId);

    let maxDayNum = 0;
    let maxId = 0;
    localDays.forEach(d => { if (d.id > maxId) maxId = d.id; });
    weekDays.forEach(d => { if (d.day_number > maxDayNum) maxDayNum = d.day_number; });

    const nextNum = maxDayNum + 1;
    const dateVal = realDate || new Date().toISOString().split('T')[0];
    const dayTitle = title && title.trim() ? title.trim() : `วันที่ ${nextNum}`;

    const newDay = {
        id: maxId + 1,
        week_id: weekId,
        day_number: nextNum,
        title: dayTitle,
        real_date: dateVal,
        notes: notes || '',
        created_at: new Date().toISOString()
    };
    localDays.push(newDay);
    setLS(LS_KEYS.DAYS, localDays);

    if (supabaseClient) {
        try {
            await supabaseClient.from('workout_days').insert({
                week_id: weekId,
                day_number: nextNum,
                title: dayTitle,
                real_date: dateVal,
                notes: notes || ''
            });
        } catch (e) {
            console.warn('Supabase add day note:', e);
        }
    }
    return newDay;
}

async function dbUpdateDay(dayId, title, realDate, notes) {
    const localDays = getLS(LS_KEYS.DAYS, []);
    const target = localDays.find(d => d.id === dayId);
    if (target) {
        if (title) target.title = title;
        if (realDate) target.real_date = realDate;
        if (notes !== undefined) target.notes = notes;
        setLS(LS_KEYS.DAYS, localDays);
    }

    if (supabaseClient) {
        try {
            await supabaseClient.from('workout_days').update({ title, real_date: realDate, notes }).eq('id', dayId);
        } catch (e) {
            console.warn('Supabase update day note:', e);
        }
    }
}

async function dbDeleteDay(dayId) {
    let localDays = getLS(LS_KEYS.DAYS, []);
    let localLogs = getLS(LS_KEYS.LOGS, []);

    localDays = localDays.filter(d => d.id !== dayId);
    localLogs = localLogs.filter(l => l.day_id !== dayId);

    setLS(LS_KEYS.DAYS, localDays);
    setLS(LS_KEYS.LOGS, localLogs);

    if (supabaseClient) {
        try {
            await supabaseClient.from('workout_days').delete().eq('id', dayId);
        } catch (e) {
            console.warn('Supabase delete day note:', e);
        }
    }
}

async function dbGetLogs(weekId, dayId) {
    const localWeeks = getLS(LS_KEYS.WEEKS, []);
    const localDays = getLS(LS_KEYS.DAYS, []);
    const localLogs = getLS(LS_KEYS.LOGS, []);

    let filtered = localLogs;
    if (dayId !== null && dayId !== undefined) {
        filtered = filtered.filter(l => l.day_id === dayId);
    } else if (weekId !== null && weekId !== undefined) {
        const weekDayIds = localDays.filter(d => d.week_id === weekId).map(d => d.id);
        filtered = filtered.filter(l => weekDayIds.includes(l.day_id));
    }

    return filtered.map(l => {
        const day = localDays.find(d => d.id === l.day_id) || {};
        const week = localWeeks.find(w => w.id === day.week_id) || {};
        return {
            ...l,
            day_title: day.title || 'วันฝึก',
            day_real_date: day.real_date || '',
            week_title: week.title || '',
            week_number: week.week_number || 1
        };
    }).sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at));
}

async function dbAddLog(logData) {
    const localLogs = getLS(LS_KEYS.LOGS, []);
    let maxId = 0;
    localLogs.forEach(l => { if (l.id > maxId) maxId = l.id; });

    const allExercises = await dbGetExercises();
    const ex = allExercises.find(e => e.id === logData.exercise_id) || {};

    const newLog = {
        id: maxId + 1,
        day_id: logData.day_id,
        exercise_id: logData.exercise_id,
        exercise_name: ex.name || '',
        exercise_name_th: ex.name_th || ex.name || '',
        category: ex.category || 'General',
        sets: logData.sets,
        reps: logData.reps,
        weight: logData.weight,
        rpe: logData.rpe,
        notes: logData.notes || '',
        logged_at: new Date().toISOString(),
        primary: ex.primary || [],
        secondary: ex.secondary || []
    };

    localLogs.unshift(newLog);
    setLS(LS_KEYS.LOGS, localLogs);

    if (supabaseClient) {
        try {
            await supabaseClient.from('workout_logs').insert({
                day_id: logData.day_id,
                exercise_id: logData.exercise_id,
                sets: logData.sets,
                reps: logData.reps,
                weight: logData.weight,
                rpe: logData.rpe,
                notes: logData.notes || '',
                logged_at: newLog.logged_at
            });
        } catch (e) {
            console.warn('Supabase add log note:', e);
        }
    }
    return newLog;
}

async function dbDeleteLog(logId) {
    let localLogs = getLS(LS_KEYS.LOGS, []);
    localLogs = localLogs.filter(l => l.id !== logId);
    setLS(LS_KEYS.LOGS, localLogs);

    if (supabaseClient) {
        try {
            await supabaseClient.from('workout_logs').delete().eq('id', logId);
        } catch (e) {
            console.warn('Supabase delete log note:', e);
        }
    }
}

// Client-Side Calculation for Statistics, Volume Landmarks & Recovery
function calculateScopedStats(logs, weekId, dayId) {
    const now = new Date();
    const muscleStats = {};

    Object.entries(MUSCLE_METADATA).forEach(([muscleKey, meta]) => {
        muscleStats[muscleKey] = {
            key: muscleKey,
            name_en: meta.name_en,
            name_th: meta.name_th,
            view: meta.view,
            mev: meta.mev,
            mav: meta.mav,
            mrv: meta.mrv,
            raw_sets: 0,
            effective_volume: 0.0,
            total_reps: 0,
            total_tonnage_kg: 0.0,
            last_worked_at: null,
            hours_since_workout: null,
            recovery_percent: 100,
            recent_exercises: [],
            heatmap_level: 0,
            volume_status: "Resting",
            volume_status_th: "ยังไม่ได้เล่น"
        };
    });

    logs.forEach(log => {
        let logDt;
        try {
            logDt = new Date(log.logged_at);
            if (isNaN(logDt.getTime())) logDt = now;
        } catch (_) {
            logDt = now;
        }

        const hoursDiff = Math.max(0, (now.getTime() - logDt.getTime()) / 3600000);
        const sets = log.sets || 0;
        const reps = log.reps || 0;
        const weight = log.weight || 0;
        const exName = log.exercise_name_th || log.exercise_name || '';

        (log.primary || []).forEach(m => {
            if (muscleStats[m]) {
                const st = muscleStats[m];
                st.raw_sets += sets;
                st.effective_volume += sets * 1.0;
                st.total_reps += sets * reps;
                st.total_tonnage_kg += sets * reps * weight;
                if (!st.last_worked_at || logDt > new Date(st.last_worked_at)) {
                    st.last_worked_at = log.logged_at;
                    st.hours_since_workout = Math.round(hoursDiff * 10) / 10;
                }
                if (exName && !st.recent_exercises.includes(exName)) {
                    st.recent_exercises.push(exName);
                }
            }
        });

        (log.secondary || []).forEach(m => {
            if (muscleStats[m]) {
                const st = muscleStats[m];
                st.raw_sets += sets;
                st.effective_volume += sets * 0.5;
                st.total_reps += Math.floor(sets * reps * 0.5);
                st.total_tonnage_kg += (sets * reps * weight) * 0.5;
                if (!st.last_worked_at || logDt > new Date(st.last_worked_at)) {
                    st.last_worked_at = log.logged_at;
                    st.hours_since_workout = Math.round(hoursDiff * 10) / 10;
                }
                const secTag = `${exName} (มัดรอง)`;
                if (exName && !st.recent_exercises.includes(secTag)) {
                    st.recent_exercises.push(secTag);
                }
            }
        });
    });

    Object.values(muscleStats).forEach(st => {
        const effVol = st.effective_volume;

        if (effVol <= 0) {
            st.heatmap_level = 0;
            st.heatmap_color = "#334155";
        } else if (effVol <= 3) {
            st.heatmap_level = 1;
            st.heatmap_color = "#22c55e";
        } else if (effVol <= 7) {
            st.heatmap_level = 2;
            st.heatmap_color = "#f59e0b";
        } else if (effVol <= 12) {
            st.heatmap_level = 3;
            st.heatmap_color = "#f97316";
        } else {
            st.heatmap_level = 4;
            st.heatmap_color = "#ef4444";
        }

        if (st.hours_since_workout !== null && effVol > 0) {
            const fullRecoveryHours = Math.min(96.0, 36.0 + effVol * 3.0);
            const hoursPassed = st.hours_since_workout;
            const recPct = Math.min(100, Math.floor((hoursPassed / fullRecoveryHours) * 100));
            st.recovery_percent = recPct;
            st.recovery_hours_total = Math.round(fullRecoveryHours * 10) / 10;
            st.hours_remaining = Math.max(0, Math.round((fullRecoveryHours - hoursPassed) * 10) / 10);
        } else {
            st.recovery_percent = 100;
            st.recovery_hours_total = 0;
            st.hours_remaining = 0;
        }

        if (effVol === 0) {
            st.volume_status = "Resting";
            st.volume_status_th = "ยังไม่ได้เล่น";
        } else if (effVol < st.mev) {
            st.volume_status = "Light / Maintenance";
            st.volume_status_th = "คงสภาพ (< MEV)";
        } else if (effVol <= st.mav) {
            st.volume_status = "Optimal Growth (MAV)";
            st.volume_status_th = "จุดโตสูงสุด (MEV-MAV)";
        } else if (effVol <= st.mrv) {
            st.volume_status = "High Volume (MAV-MRV)";
            st.volume_status_th = "ปริมาณสูง (MAV-MRV)";
        } else {
            st.volume_status = "Overreaching (MRV+)";
            st.volume_status_th = "เกินขีดจำกัด (> MRV)";
        }

        st.effective_volume = Math.round(st.effective_volume * 10) / 10;
        st.total_tonnage_kg = Math.round(st.total_tonnage_kg * 10) / 10;
    });

    const totalSets = logs.reduce((sum, l) => sum + (l.sets || 0), 0);
    const totalVolumeKg = logs.reduce((sum, l) => sum + ((l.sets || 0) * (l.reps || 0) * (l.weight || 0)), 0);

    return {
        muscles: muscleStats,
        summary: {
            total_logs: logs.length,
            total_sets: totalSets,
            total_volume_kg: Math.round(totalVolumeKg * 10) / 10,
            active_muscle_count: Object.values(muscleStats).filter(m => m.effective_volume > 0).length,
            scope: { week_id: weekId, day_id: dayId }
        }
    };
}

// --- Main App Logic & UI Rendering ---

async function loadExercises() {
    AppState.exercises = await dbGetExercises();
    if (!AppState.exercises || AppState.exercises.length === 0) {
        AppState.exercises = INITIAL_EXERCISES;
    }
    renderExerciseSelect();
}

async function loadWeeksAndInit() {
    try {
        AppState.weeks = await dbGetWeeksWithDays();

        if (AppState.weeks && AppState.weeks.length > 0) {
            if (!AppState.selectedWeekId || !AppState.weeks.some(w => w.id === AppState.selectedWeekId)) {
                AppState.selectedWeekId = AppState.weeks[0].id;
            }

            const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
            if (currentWeek && currentWeek.days && currentWeek.days.length > 0) {
                if (AppState.selectedDayId && !currentWeek.days.some(d => d.id === AppState.selectedDayId)) {
                    AppState.selectedDayId = null;
                }
                AppState.logTargetDayId = currentWeek.days[0].id;
            }
        }

        renderWeekSelector();
        renderTargetDaySelector();
        renderWeeklySidebar();
        await refreshScopedData();
    } catch (err) {
        console.error('Failed to load weeks hierarchy:', err);
    }
}

async function refreshScopedData() {
    try {
        AppState.logs = await dbGetLogs(AppState.selectedWeekId, AppState.selectedDayId);
        AppState.stats = calculateScopedStats(AppState.logs, AppState.selectedWeekId, AppState.selectedDayId);

        renderScopeHeaders();
        renderBodyModel();
        renderSummaryStats();
        renderMuscleCards();
        renderLogsHistory();
    } catch (err) {
        console.error('Failed to refresh scoped data:', err);
    }
}

// --- Week & Day Controls ---

function initWeekAndDayControls() {
    const weekSelect = document.getElementById('week-select');
    if (weekSelect) {
        weekSelect.addEventListener('change', async (e) => {
            AppState.selectedWeekId = parseInt(e.target.value);
            AppState.selectedDayId = null;

            const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
            if (currentWeek && currentWeek.days && currentWeek.days.length > 0) {
                AppState.logTargetDayId = currentWeek.days[0].id;
            }

            renderWeeklySidebar();
            renderTargetDaySelector();
            await refreshScopedData();
        });
    }

    const allWeekBtn = document.getElementById('btn-scope-all-week');
    if (allWeekBtn) {
        allWeekBtn.addEventListener('click', async () => {
            AppState.selectedDayId = null;
            renderWeeklySidebar();
            await refreshScopedData();
        });
    }

    const delWeekBtn = document.getElementById('btn-delete-current-week');
    if (delWeekBtn) {
        delWeekBtn.addEventListener('click', async () => {
            if (!AppState.selectedWeekId) return;
            const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
            const title = currentWeek ? currentWeek.title : 'สัปดาห์นี้';

            if (confirm(`คุณต้องการลบ "${title}" และวันฝึกทั้งหมดในสัปดาห์นี้หรือไม่?`)) {
                await dbDeleteWeek(AppState.selectedWeekId);
                showToast(`ลบ ${title} เรียบร้อยแล้ว`);
                AppState.selectedWeekId = null;
                AppState.selectedDayId = null;
                await loadWeeksAndInit();
            }
        });
    }

    const targetDaySelect = document.getElementById('log-target-day-select');
    if (targetDaySelect) {
        targetDaySelect.addEventListener('change', (e) => {
            AppState.logTargetDayId = parseInt(e.target.value);
        });
    }
}

function renderWeekSelector() {
    const select = document.getElementById('week-select');
    if (!select) return;

    select.innerHTML = '';
    AppState.weeks.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${w.title} (${(w.days || []).length} วันฝึก • ${w.total_sets || 0} เซ็ต)`;
        if (w.id === AppState.selectedWeekId) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderTargetDaySelector() {
    const select = document.getElementById('log-target-day-select');
    if (!select) return;

    select.innerHTML = '';
    AppState.weeks.forEach(w => {
        const optGroup = document.createElement('optgroup');
        optGroup.label = w.title;

        (w.days || []).forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            const dateRef = d.real_date ? ` (${formatRealDate(d.real_date)})` : '';
            opt.textContent = `${w.title} > ${d.title}${dateRef}`;
            if (d.id === AppState.logTargetDayId) opt.selected = true;
            optGroup.appendChild(opt);
        });

        select.appendChild(optGroup);
    });

    if (!AppState.logTargetDayId && AppState.weeks.length > 0) {
        const firstWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId) || AppState.weeks[0];
        if (firstWeek && firstWeek.days && firstWeek.days.length > 0) {
            AppState.logTargetDayId = firstWeek.days[0].id;
            select.value = AppState.logTargetDayId;
        }
    }
}

function renderWeeklySidebar() {
    const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
    const weekTitleEl = document.getElementById('week-card-title');
    const weekDaysCountEl = document.getElementById('week-card-days-count');
    const weekTotalSetsEl = document.getElementById('week-card-total-sets');
    const weekTotalVolumeEl = document.getElementById('week-card-total-volume');
    const daysBadgeEl = document.getElementById('days-count-badge');
    const daysListContainer = document.getElementById('workout-days-list');
    const daysEmptyState = document.getElementById('days-empty-state');
    const allWeekBtn = document.getElementById('btn-scope-all-week');

    if (!currentWeek) {
        if (weekTitleEl) weekTitleEl.textContent = 'ไม่มีสัปดาห์';
        if (daysListContainer) daysListContainer.innerHTML = '';
        if (daysEmptyState) daysEmptyState.classList.remove('hidden');
        return;
    }

    const daysCount = (currentWeek.days || []).length;
    if (weekTitleEl) weekTitleEl.textContent = currentWeek.title;
    if (weekDaysCountEl) weekDaysCountEl.textContent = `${daysCount} วันฝึก`;
    if (weekTotalSetsEl) weekTotalSetsEl.textContent = `${currentWeek.total_sets || 0} เซ็ต`;
    if (weekTotalVolumeEl) weekTotalVolumeEl.textContent = `${(currentWeek.total_volume_kg || 0).toLocaleString()} kg`;
    if (daysBadgeEl) daysBadgeEl.textContent = `${daysCount} วัน`;

    if (allWeekBtn) {
        if (AppState.selectedDayId === null) {
            allWeekBtn.className = 'py-2 px-3 text-xs font-semibold rounded-xl bg-sky-500 text-white transition text-center shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5 ring-2 ring-sky-300/40 cursor-pointer';
        } else {
            allWeekBtn.className = 'py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-center flex items-center justify-center gap-1.5 cursor-pointer';
        }
    }

    if (!currentWeek.days || currentWeek.days.length === 0) {
        if (daysListContainer) daysListContainer.innerHTML = '';
        if (daysEmptyState) daysEmptyState.classList.remove('hidden');
        return;
    }

    if (daysEmptyState) daysEmptyState.classList.add('hidden');

    if (daysListContainer) {
        daysListContainer.innerHTML = currentWeek.days.map(day => {
            const isActive = (AppState.selectedDayId === day.id);
            const activeClass = isActive ? 'active-day ring-2 ring-sky-400' : '';

            let musclesHtml = '';
            if (day.muscles_trained && day.muscles_trained.length > 0) {
                musclesHtml = `
                    <div class="flex flex-wrap gap-1 mt-2">
                        ${day.muscles_trained.map(m => `
                            <span class="muscle-summary-pill">
                                <span>${m.name_th}</span>
                                <span class="text-[9px] opacity-75">(${m.sets}s)</span>
                            </span>
                        `).join('')}
                    </div>
                `;
            } else {
                musclesHtml = `<span class="text-[11px] text-slate-500 italic block mt-1.5">ยังไม่มีรายการฝึกในวันนี้</span>`;
            }

            return `
                <div class="day-card rounded-xl p-3.5 ${activeClass}" onclick="selectDayScope(${day.id})">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-slate-100 text-xs md:text-sm flex items-center gap-1.5">
                                    ${isActive ? '<span class="w-2 h-2 rounded-full bg-sky-400"></span>' : ''}
                                    ${day.title}
                                </h4>
                            </div>
                            <div class="flex items-center gap-1 text-[11px] text-sky-400/90 font-mono mt-0.5">
                                <span>📅</span>
                                <span>${day.real_date ? formatRealDate(day.real_date) : 'ไม่ได้ระบุวันที่'}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-1" onclick="event.stopPropagation()">
                            <button onclick="openEditDayModal(${day.id})" title="แก้ไขวัน" class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs">
                                ✏️
                            </button>
                            <button onclick="deleteDay(${day.id})" title="ลบวัน" class="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-xs">
                                🗑️
                            </button>
                        </div>
                    </div>

                    ${musclesHtml}

                    <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>${day.exercises_count || 0} ท่าฝึก • ${day.total_sets || 0} เซ็ต</span>
                        <span class="text-sky-300 font-bold">${day.total_volume_kg > 0 ? day.total_volume_kg.toLocaleString() + ' kg' : '-'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

window.selectDayScope = async function(dayId) {
    AppState.selectedDayId = dayId;
    AppState.logTargetDayId = dayId;
    renderWeeklySidebar();
    renderTargetDaySelector();
    await refreshScopedData();
};

function renderScopeHeaders() {
    const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
    const scopeLabel = document.getElementById('active-scope-label');
    const muscleScopeSubtitle = document.getElementById('muscle-cards-scope-subtitle');
    const historyScopeSubtitle = document.getElementById('history-scope-subtitle');
    const labelStatSets = document.getElementById('label-stat-sets');

    if (!currentWeek) {
        if (scopeLabel) scopeLabel.textContent = 'สถิติ: ไม่ได้เลือกสัปดาห์';
        return;
    }

    if (AppState.selectedDayId === null) {
        const text = `สถิติ: ${currentWeek.title} (ภาพรวมทั้งสัปดาห์)`;
        if (scopeLabel) scopeLabel.textContent = `📊 ${text}`;
        if (muscleScopeSubtitle) muscleScopeSubtitle.textContent = `คำนวณตามปริมาณฝึกรวมของ ${currentWeek.title}`;
        if (historyScopeSubtitle) historyScopeSubtitle.textContent = `แสดงประวัติทั้งหมดของ ${currentWeek.title}`;
        if (labelStatSets) labelStatSets.textContent = `เซ็ตใน${currentWeek.title}`;
    } else {
        const currentDay = (currentWeek.days || []).find(d => d.id === AppState.selectedDayId);
        const dayTitle = currentDay ? currentDay.title : `วันฝึกที่ ${AppState.selectedDayId}`;
        const dayDate = (currentDay && currentDay.real_date) ? ` (${formatRealDate(currentDay.real_date)})` : '';
        const text = `สถิติ: ${currentWeek.title} > ${dayTitle}${dayDate}`;
        if (scopeLabel) scopeLabel.textContent = `🎯 ${text}`;
        if (muscleScopeSubtitle) muscleScopeSubtitle.textContent = `คำนวณเฉพาะรายการฝึกใน ${dayTitle}${dayDate}`;
        if (historyScopeSubtitle) historyScopeSubtitle.textContent = `แสดงประวัติเฉพาะ ${dayTitle}${dayDate}`;
        if (labelStatSets) labelStatSets.textContent = `เซ็ตใน${dayTitle}`;
    }
}

// --- View & Mode Switchers ---

function initViewControls() {
    const viewBtns = document.querySelectorAll('[data-view-btn]');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => {
                b.classList.remove('bg-sky-500', 'text-white', 'shadow-lg');
                b.classList.add('bg-slate-800', 'text-slate-300');
            });
            btn.classList.remove('bg-slate-800', 'text-slate-300');
            btn.classList.add('bg-sky-500', 'text-white', 'shadow-lg');

            AppState.currentView = btn.dataset.viewBtn;
            renderBodyModel();
        });
    });

    const modeSelect = document.getElementById('color-mode-select');
    if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
            AppState.colorMode = e.target.value;
            updateMuscleColors();
            updateLegendDisplay();
        });
    }
}

// --- Form & Logging Operations ---

function initFormControls() {
    const form = document.getElementById('workout-logger-form');
    const exerciseSelect = document.getElementById('exercise-select');
    const categoryTabs = document.querySelectorAll('[data-category]');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => {
                t.classList.remove('bg-sky-500/20', 'text-sky-400', 'border-sky-500/40');
                t.classList.add('bg-slate-800/60', 'text-slate-400', 'border-slate-700/50');
            });
            tab.classList.remove('bg-slate-800/60', 'text-slate-400', 'border-slate-700/50');
            tab.classList.add('bg-sky-500/20', 'text-sky-400', 'border-sky-500/40');

            AppState.selectedCategory = tab.dataset.category;
            renderExerciseSelect();
        });
    });

    if (exerciseSelect) {
        exerciseSelect.addEventListener('change', (e) => {
            AppState.selectedExerciseId = e.target.value;
            updateTargetMusclesPreview();
        });
    }

    document.querySelectorAll('[data-quick-set]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('input-sets');
            if (input) input.value = btn.dataset.quickSet;
        });
    });

    document.querySelectorAll('[data-quick-rpe]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('input-rpe');
            if (input) input.value = btn.dataset.quickRpe;
        });
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const exerciseId = document.getElementById('exercise-select').value;
            const sets = parseInt(document.getElementById('input-sets').value) || 3;
            const reps = parseInt(document.getElementById('input-reps').value) || 10;
            const weight = parseFloat(document.getElementById('input-weight').value) || 0;
            const rpe = parseFloat(document.getElementById('input-rpe').value) || 8.0;
            const notes = document.getElementById('input-notes').value.trim();
            const dayId = AppState.logTargetDayId || AppState.selectedDayId;

            if (!exerciseId) {
                showToast('กรุณาเลือกท่าออกกำลังกาย', 'error');
                return;
            }

            try {
                await dbAddLog({
                    exercise_id: exerciseId,
                    sets,
                    reps,
                    weight,
                    rpe,
                    notes,
                    day_id: dayId
                });

                showToast(`บันทึกสำเร็จ: ${sets} เซ็ต (${weight} kg) 🎉`);
                document.getElementById('input-notes').value = '';
                await loadWeeksAndInit();
            } catch (err) {
                console.error('Failed to add log:', err);
                showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
            }
        });
    }
}

function renderExerciseSelect() {
    const select = document.getElementById('exercise-select');
    if (!select) return;

    const filtered = AppState.selectedCategory === 'all'
        ? AppState.exercises
        : AppState.exercises.filter(ex => ex.category.toLowerCase() === AppState.selectedCategory.toLowerCase());

    select.innerHTML = '<option value="">-- เลือกท่าออกกำลังกาย --</option>';

    const grouped = {};
    filtered.forEach(ex => {
        if (!grouped[ex.category]) grouped[ex.category] = [];
        grouped[ex.category].push(ex);
    });

    Object.keys(grouped).forEach(cat => {
        const group = document.createElement('optgroup');
        group.label = `--- ${cat.toUpperCase()} ---`;
        grouped[cat].forEach(ex => {
            const opt = document.createElement('option');
            opt.value = ex.id;
            opt.textContent = `${ex.name_th || ex.name} (${ex.name})`;
            if (ex.id === AppState.selectedExerciseId) opt.selected = true;
            group.appendChild(opt);
        });
        select.appendChild(group);
    });

    if (filtered.length > 0 && !AppState.selectedExerciseId) {
        select.selectedIndex = 1;
        AppState.selectedExerciseId = select.value;
    }

    updateTargetMusclesPreview();
}

function updateTargetMusclesPreview() {
    const container = document.getElementById('target-muscles-preview');
    if (!container) return;

    const ex = AppState.exercises.find(e => e.id === AppState.selectedExerciseId);
    if (!ex) {
        container.innerHTML = '<span class="text-slate-500 italic text-xs">เลือกท่าฝึกเพื่อดูมัดกล้ามเนื้อ</span>';
        return;
    }

    let html = '<div class="flex flex-wrap gap-1.5 items-center">';
    (ex.primary || []).forEach(mKey => {
        const meta = MUSCLE_METADATA[mKey] || {};
        html += `
            <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                ⭐ มัดหลัก: ${meta.name_th || mKey}
            </span>
        `;
    });
    (ex.secondary || []).forEach(mKey => {
        const meta = MUSCLE_METADATA[mKey] || {};
        html += `
            <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                มัดรอง: ${meta.name_th || mKey}
            </span>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// --- Modals Controls (Week, Day, Custom Exercise) ---

function initModalControls() {
    // 1. Add Week Modal
    const openWeekModalBtn = document.getElementById('btn-open-add-week-modal');
    const weekModal = document.getElementById('add-week-modal');
    const closeWeekModalBtn = document.getElementById('btn-close-week-modal');
    const weekForm = document.getElementById('add-week-form');

    if (openWeekModalBtn && weekModal) {
        openWeekModalBtn.addEventListener('click', () => {
            document.getElementById('input-week-title').value = '';
            weekModal.classList.remove('hidden');
        });
    }
    if (closeWeekModalBtn && weekModal) {
        closeWeekModalBtn.addEventListener('click', () => weekModal.classList.add('hidden'));
    }
    if (weekForm && weekModal) {
        weekForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('input-week-title').value.trim();
            const newWeek = await dbAddWeek(title);
            weekModal.classList.add('hidden');
            showToast('สร้างสัปดาห์ใหม่เรียบร้อยแล้ว');
            if (newWeek && newWeek.id) {
                AppState.selectedWeekId = newWeek.id;
                AppState.selectedDayId = null;
            }
            await loadWeeksAndInit();
        });
    }

    // 2. Add / Edit Day Modal
    const openDayModalBtn = document.getElementById('btn-open-add-day-modal');
    const dayModal = document.getElementById('day-modal');
    const closeDayModalBtn = document.getElementById('btn-close-day-modal');
    const dayForm = document.getElementById('day-form');

    if (openDayModalBtn && dayModal) {
        openDayModalBtn.addEventListener('click', () => {
            if (!AppState.selectedWeekId) {
                showToast('กรุณาสร้างหรือเลือกสัปดาห์ก่อน', 'error');
                return;
            }
            document.getElementById('day-modal-title').textContent = 'เพิ่มวันฝึกใหม่ (Add Workout Day)';
            document.getElementById('input-day-id').value = '';
            document.getElementById('input-day-title').value = '';
            document.getElementById('input-day-realdate').value = new Date().toISOString().split('T')[0];
            document.getElementById('input-day-notes').value = '';
            document.getElementById('day-form-submit-btn').textContent = 'เพิ่มวันฝึก';
            dayModal.classList.remove('hidden');
        });
    }
    if (closeDayModalBtn && dayModal) {
        closeDayModalBtn.addEventListener('click', () => dayModal.classList.add('hidden'));
    }
    if (dayForm && dayModal) {
        dayForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dayId = document.getElementById('input-day-id').value;
            const title = document.getElementById('input-day-title').value.trim();
            const realDate = document.getElementById('input-day-realdate').value;
            const notes = document.getElementById('input-day-notes').value.trim();

            if (dayId) {
                await dbUpdateDay(parseInt(dayId), title, realDate, notes);
                showToast('อัปเดตข้อมูลวันฝึกเรียบร้อย');
            } else {
                const newDay = await dbAddDay(AppState.selectedWeekId, title, realDate, notes);
                showToast('เพิ่มวันฝึกใหม่เรียบร้อยแล้ว');
                if (newDay && newDay.id) {
                    AppState.selectedDayId = newDay.id;
                    AppState.logTargetDayId = newDay.id;
                }
            }
            dayModal.classList.add('hidden');
            await loadWeeksAndInit();
        });
    }

    // 3. Custom Exercise Modal
    const openCustomModalBtn = document.getElementById('btn-open-custom-modal');
    const customModal = document.getElementById('custom-exercise-modal');
    const closeCustomModalBtn = document.getElementById('btn-close-custom-modal');
    const customForm = document.getElementById('custom-exercise-form');

    if (openCustomModalBtn && customModal) {
        openCustomModalBtn.addEventListener('click', () => {
            renderMuscleCheckboxes();
            customModal.classList.remove('hidden');
        });
    }
    if (closeCustomModalBtn && customModal) {
        closeCustomModalBtn.addEventListener('click', () => customModal.classList.add('hidden'));
    }
    if (customForm && customModal) {
        customForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('custom-ex-name').value.trim();
            const nameTh = document.getElementById('custom-ex-name-th').value.trim() || name;
            const category = document.getElementById('custom-ex-category').value;

            const primary = Array.from(document.querySelectorAll('input[name="primary-muscle"]:checked')).map(cb => cb.value);
            const secondary = Array.from(document.querySelectorAll('input[name="secondary-muscle"]:checked')).map(cb => cb.value);

            if (primary.length === 0) {
                showToast('กรุณาเลือกกล้ามเนื้อหลักอย่างน้อย 1 มัด', 'error');
                return;
            }

            const exId = 'custom_' + Date.now();
            await dbAddExercise({
                id: exId,
                name,
                name_th: nameTh,
                category,
                primary,
                secondary
            });

            customModal.classList.add('hidden');
            showToast(`เพิ่มท่าฝึก "${nameTh}" สำเร็จ! 🎉`);
            await loadExercises();
            AppState.selectedExerciseId = exId;
            renderExerciseSelect();
        });
    }
}

window.openEditDayModal = function(dayId) {
    const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
    if (!currentWeek) return;
    const day = (currentWeek.days || []).find(d => d.id === dayId);
    if (!day) return;

    document.getElementById('day-modal-title').textContent = `แก้ไข ${day.title}`;
    document.getElementById('input-day-id').value = day.id;
    document.getElementById('input-day-title').value = day.title;
    document.getElementById('input-day-realdate').value = day.real_date || new Date().toISOString().split('T')[0];
    document.getElementById('input-day-notes').value = day.notes || '';
    document.getElementById('day-form-submit-btn').textContent = 'บันทึกการแก้ไข';

    document.getElementById('day-modal').classList.remove('hidden');
};

window.deleteDay = async function(dayId) {
    const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
    const day = currentWeek ? (currentWeek.days || []).find(d => d.id === dayId) : null;
    const title = day ? day.title : 'วันฝึกนี้';

    if (confirm(`คุณต้องการลบ "${title}" และประวัติการฝึกในวันนี้หรือไม่?`)) {
        await dbDeleteDay(dayId);
        showToast(`ลบ ${title} เรียบร้อยแล้ว`);
        if (AppState.selectedDayId === dayId) AppState.selectedDayId = null;
        await loadWeeksAndInit();
    }
};

function renderMuscleCheckboxes() {
    const priContainer = document.getElementById('checkboxes-primary-muscles');
    const secContainer = document.getElementById('checkboxes-secondary-muscles');
    if (!priContainer || !secContainer) return;

    let priHtml = '';
    let secHtml = '';

    Object.entries(MUSCLE_METADATA).forEach(([key, meta]) => {
        priHtml += `
            <label class="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                <input type="checkbox" name="primary-muscle" value="${key}" class="rounded text-sky-500 focus:ring-0">
                <span class="text-slate-300">${meta.name_th}</span>
            </label>
        `;
        secHtml += `
            <label class="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                <input type="checkbox" name="secondary-muscle" value="${key}" class="rounded text-amber-500 focus:ring-0">
                <span class="text-slate-300">${meta.name_th}</span>
            </label>
        `;
    });

    priContainer.innerHTML = priHtml;
    secContainer.innerHTML = secHtml;
}

// --- Body Model & SVG Heatmap Rendering ---

function renderBodyModel() {
    const container = document.getElementById('anatomy-container');
    if (!container) return;

    const svgProvider = window.BodySVG || window.BodyAnatomySVG;
    if (!svgProvider) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500">กำลังโหลด Anatomy SVG...</div>`;
        return;
    }

    const getFront = () => svgProvider.getAnteriorView ? svgProvider.getAnteriorView() : (svgProvider.getAnteriorSVG ? svgProvider.getAnteriorSVG() : '');
    const getBack = () => svgProvider.getPosteriorView ? svgProvider.getPosteriorView() : (svgProvider.getPosteriorSVG ? svgProvider.getPosteriorSVG() : '');

    if (AppState.currentView === 'dual') {
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full items-center">
                <div class="flex flex-col items-center">
                    <span class="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">ด้านหน้า (Anterior)</span>
                    <div class="w-full max-w-[280px]">${getFront()}</div>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">ด้านหลัง (Posterior)</span>
                    <div class="w-full max-w-[280px]">${getBack()}</div>
                </div>
            </div>
        `;
    } else if (AppState.currentView === 'posterior') {
        container.innerHTML = `
            <div class="flex flex-col items-center w-full max-w-[380px] mx-auto">
                <span class="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">ด้านหลัง (Posterior)</span>
                ${getBack()}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="flex flex-col items-center w-full max-w-[380px] mx-auto">
                <span class="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">ด้านหน้า (Anterior)</span>
                ${getFront()}
            </div>
        `;
    }

    attachMuscleInteractions();
    updateMuscleColors();
    updateLegendDisplay();
}

function attachMuscleInteractions() {
    const musclePaths = document.querySelectorAll('[data-muscle]');
    const tooltip = document.getElementById('muscle-tooltip');

    musclePaths.forEach(el => {
        const muscleKey = el.dataset.muscle;
        const stats = (AppState.stats.muscles || {})[muscleKey];

        el.addEventListener('mouseenter', (e) => {
            if (!stats || !tooltip) return;
            const meta = MUSCLE_METADATA[muscleKey] || {};

            tooltip.innerHTML = `
                <div class="font-bold text-sky-400 flex items-center justify-between gap-4">
                    <span>${meta.name_th || muscleKey}</span>
                    <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">${meta.name_en}</span>
                </div>
                <div class="mt-1 text-slate-300 flex items-center justify-between text-xs font-mono">
                    <span>Volume:</span>
                    <span class="font-bold text-amber-400">${stats.effective_volume} เซ็ต</span>
                </div>
                <div class="text-slate-300 flex items-center justify-between text-xs font-mono">
                    <span>สถานะ:</span>
                    <span class="font-semibold text-emerald-400">${stats.volume_status_th}</span>
                </div>
                <div class="text-slate-300 flex items-center justify-between text-xs font-mono">
                    <span>การฟื้นตัว:</span>
                    <span class="font-semibold ${stats.recovery_percent === 100 ? 'text-emerald-400' : 'text-amber-400'}">${stats.recovery_percent}%</span>
                </div>
                ${stats.hours_remaining > 0 ? `
                    <div class="text-slate-400 text-[10px] mt-0.5">⏱️ พักอีกประมาณ ${stats.hours_remaining} ชม.</div>
                ` : ''}
            `;

            tooltip.classList.remove('hidden');
            positionTooltip(e, tooltip);
        });

        el.addEventListener('mousemove', (e) => {
            if (tooltip) positionTooltip(e, tooltip);
        });

        el.addEventListener('mouseleave', () => {
            if (tooltip) tooltip.classList.add('hidden');
        });

        el.addEventListener('click', () => {
            selectMuscle(muscleKey);
        });
    });
}

function positionTooltip(e, tooltip) {
    const x = e.clientX + 12;
    const y = e.clientY + 12;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

function updateMuscleColors() {
    const musclePaths = document.querySelectorAll('[data-muscle]');
    const muscles = AppState.stats.muscles || {};

    musclePaths.forEach(el => {
        const muscleKey = el.dataset.muscle;
        const st = muscles[muscleKey];
        if (!st) return;

        let color = '#334155';

        if (AppState.colorMode === 'recovery') {
            const rec = st.recovery_percent || 100;
            if (st.effective_volume === 0) color = '#334155';
            else if (rec >= 100) color = '#10b981';
            else if (rec >= 70) color = '#22c55e';
            else if (rec >= 40) color = '#f59e0b';
            else color = '#ef4444';
        } else if (AppState.colorMode === 'landmarks') {
            const vol = st.effective_volume;
            if (vol === 0) color = '#334155';
            else if (vol < st.mev) color = '#3b82f6';
            else if (vol <= st.mav) color = '#10b981';
            else if (vol <= st.mrv) color = '#f59e0b';
            else color = '#ef4444';
        } else {
            color = st.heatmap_color || '#334155';
        }

        el.style.fill = color;
        el.style.transition = 'fill 0.3s ease, filter 0.2s ease';

        if (AppState.selectedMuscleKey === muscleKey) {
            el.style.filter = 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.8))';
            el.style.stroke = '#38bdf8';
            el.style.strokeWidth = '1.5';
        } else {
            el.style.filter = 'none';
            el.style.stroke = 'rgba(15, 23, 42, 0.5)';
            el.style.strokeWidth = '0.5';
        }
    });
}

function updateLegendDisplay() {
    const titleEl = document.getElementById('legend-title');
    const container = document.getElementById('legend-items-container');
    if (!container) return;

    if (AppState.colorMode === 'recovery') {
        if (titleEl) titleEl.textContent = 'คำอธิบายระดับการฟื้นตัว (Muscle Recovery Decay):';
        container.innerHTML = `
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#10b981]"></span><span>100% พร้อมเต็มที่</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#22c55e]"></span><span>70-99% ฟื้นเกือบสมบูรณ์</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#f59e0b]"></span><span>40-69% กำลังฟื้นฟู</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#ef4444]"></span><span>&lt;40% ล้าสะสมสูง</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#334155]"></span><span>ยังไม่ได้บริหาร</span></div>
        `;
    } else if (AppState.colorMode === 'landmarks') {
        if (titleEl) titleEl.textContent = 'คำอธิบายเกณฑ์ Hypertrophy Landmarks (MEV / MAV / MRV):';
        container.innerHTML = `
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#3b82f6]"></span><span>&lt; MEV คงสภาพ</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#10b981]"></span><span>MEV-MAV โตสูงสุด</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#f59e0b]"></span><span>MAV-MRV ปริมาณสูง</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#ef4444]"></span><span>&gt; MRV เกินขีดจำกัด</span></div>
        `;
    } else {
        if (titleEl) titleEl.textContent = 'คำอธิบายความถี่ / ปริมาณเซ็ต (Heatmap Volume):';
        container.innerHTML = `
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#334155]"></span><span>0 เซ็ต</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#22c55e]"></span><span>1-3 เซ็ต</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#f59e0b]"></span><span>4-7 เซ็ต</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#f97316]"></span><span>8-12 เซ็ต</span></div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-[#ef4444]"></span><span>13+ เซ็ต</span></div>
        `;
    }
}

// --- Summary & Cards Rendering ---

function renderSummaryStats() {
    const sum = AppState.stats.summary || {};
    const totalSetsEl = document.getElementById('stat-total-sets');
    const activeMusclesEl = document.getElementById('stat-active-muscles');
    const totalVolumeEl = document.getElementById('stat-total-volume');

    if (totalSetsEl) totalSetsEl.textContent = sum.total_sets || 0;
    if (activeMusclesEl) activeMusclesEl.textContent = sum.active_muscle_count || 0;
    if (totalVolumeEl) totalVolumeEl.textContent = (sum.total_volume_kg || 0).toLocaleString() + ' kg';
}

function renderMuscleCards() {
    const container = document.getElementById('muscle-cards-grid');
    if (!container) return;

    const muscles = Object.values(AppState.stats.muscles || {});
    if (muscles.length === 0) {
        container.innerHTML = '<div class="col-span-full p-4 text-center text-slate-500">ไม่มีข้อมูลกล้ามเนื้อ</div>';
        return;
    }

    muscles.sort((a, b) => b.effective_volume - a.effective_volume);

    container.innerHTML = muscles.map(m => {
        const progressMev = Math.min(100, Math.round((m.effective_volume / m.mav) * 100));
        const isSelected = AppState.selectedMuscleKey === m.key;

        return `
            <div class="glass-card rounded-xl p-3.5 border ${isSelected ? 'border-sky-500 ring-1 ring-sky-500/50' : 'border-slate-800'} hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
                 onclick="selectMuscle('${m.key}')">
                <div>
                    <div class="flex items-start justify-between gap-1">
                        <div>
                            <h4 class="font-bold text-slate-200 text-xs">${m.name_th}</h4>
                            <span class="text-[10px] text-slate-400 font-mono">${m.name_en}</span>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono" style="background-color: ${m.heatmap_color}25; color: ${m.heatmap_color};">
                            ${m.effective_volume}s
                        </span>
                    </div>

                    <div class="mt-2.5">
                        <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>ความคืบหน้า MAV</span>
                            <span class="font-mono">${m.effective_volume}/${m.mav}s</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-500" style="width: ${progressMev}%; background-color: ${m.heatmap_color};"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>${m.volume_status_th}</span>
                    <span class="${m.recovery_percent === 100 ? 'text-emerald-400' : 'text-amber-400'} font-semibold">
                        ⚡ ${m.recovery_percent}%
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function selectMuscle(muscleKey) {
    if (AppState.selectedMuscleKey === muscleKey) {
        AppState.selectedMuscleKey = null;
    } else {
        AppState.selectedMuscleKey = muscleKey;
    }
    updateMuscleColors();
    renderMuscleCards();
}

function renderLogsHistory() {
    const container = document.getElementById('logs-history-tbody');
    const emptyState = document.getElementById('logs-empty-state');
    if (!container) return;

    const logs = AppState.logs || [];
    if (logs.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = logs.map(l => {
        let timeStr = l.logged_at;
        try {
            const dt = new Date(l.logged_at);
            timeStr = dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        } catch (_) {}

        return `
            <tr class="border-b border-slate-800/60 hover:bg-slate-800/30 transition text-xs">
                <td class="py-2.5 px-3 font-mono text-slate-400">${timeStr}</td>
                <td class="py-2.5 px-3">
                    <span class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-mono text-[10px]">
                        ${l.day_title || 'วันฝึก'}
                    </span>
                </td>
                <td class="py-2.5 px-3">
                    <div class="font-semibold text-slate-200">${l.exercise_name_th || l.exercise_name}</div>
                    <div class="text-[10px] text-slate-500 font-mono">${l.category}</div>
                </td>
                <td class="py-2.5 px-3 font-mono text-slate-300 font-bold">${l.sets}</td>
                <td class="py-2.5 px-3 font-mono text-slate-300">${l.reps}</td>
                <td class="py-2.5 px-3 font-mono text-sky-400 font-semibold">${l.weight} kg</td>
                <td class="py-2.5 px-3 font-mono text-amber-400">${l.rpe}</td>
                <td class="py-2.5 px-3 text-right">
                    <button onclick="deleteWorkoutLog(${l.id})" class="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

window.deleteWorkoutLog = async function(logId) {
    if (confirm('คุณต้องการลบรายการฝึกนี้หรือไม่?')) {
        await dbDeleteLog(logId);
        showToast('ลบรายการสำเร็จ');
        await loadWeeksAndInit();
    }
};

// --- Utilities ---

function formatRealDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const monthsTh = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const yearTh = parseInt(parts[0]) + 543;
            const monthTh = monthsTh[parseInt(parts[1])] || parts[1];
            const day = parseInt(parts[2]);
            return `${day} ${monthTh} ${yearTh}`;
        }
    } catch (_) {}
    return dateStr;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 border ${
        type === 'error'
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            : 'bg-slate-900/90 border-sky-500/50 text-sky-200 shadow-sky-500/10'
    }`;
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '⚡'}</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}
