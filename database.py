import sqlite3
import json
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from exercises_data import INITIAL_EXERCISES, MUSCLE_METADATA

# Load environment variables
load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), "bodytag.db")

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase_client = None
_supabase_ready = False

if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[BodyTag] Supabase client init note: {e}")

def check_supabase_ready():
    """Check if Supabase cloud tables are ready and accessible."""
    global _supabase_ready, supabase_client
    if not supabase_client:
        return False
    try:
        res = supabase_client.table("exercises").select("id").limit(1).execute()
        _supabase_ready = True
        return True
    except Exception:
        _supabase_ready = False
        return False

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    # 1. Initialize local SQLite database
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_th TEXT,
        category TEXT NOT NULL,
        primary_muscles TEXT NOT NULL,
        secondary_muscles TEXT NOT NULL,
        is_custom INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workout_weeks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workout_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_id INTEGER NOT NULL,
        day_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        real_date TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (week_id) REFERENCES workout_weeks (id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workout_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER,
        exercise_id TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER DEFAULT 10,
        weight REAL DEFAULT 0,
        rpe REAL DEFAULT 8.0,
        notes TEXT DEFAULT '',
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id),
        FOREIGN KEY (day_id) REFERENCES workout_days (id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("PRAGMA table_info(workout_logs)")
    columns = [col[1] for col in cursor.fetchall()]
    if "day_id" not in columns:
        cursor.execute("ALTER TABLE workout_logs ADD COLUMN day_id INTEGER REFERENCES workout_days(id) ON DELETE CASCADE")

    conn.commit()
    
    # Populate initial exercises if empty in SQLite
    cursor.execute("SELECT COUNT(*) FROM exercises")
    if cursor.fetchone()[0] == 0:
        for ex in INITIAL_EXERCISES:
            cursor.execute("""
            INSERT INTO exercises (id, name, name_th, category, primary_muscles, secondary_muscles, is_custom)
            VALUES (?, ?, ?, ?, ?, ?, 0)
            """, (
                ex["id"],
                ex["name"],
                ex.get("name_th", ""),
                ex["category"],
                json.dumps(ex["primary"]),
                json.dumps(ex["secondary"])
            ))
        conn.commit()

    # Ensure at least Week 1 and Day 1 exist in SQLite
    cursor.execute("SELECT COUNT(*) FROM workout_weeks")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO workout_weeks (week_number, title)
        VALUES (1, 'สัปดาห์ที่ 1')
        """)
        week_1_id = cursor.lastrowid
        
        today_str = datetime.now().strftime("%Y-%m-%d")
        cursor.execute("""
        INSERT INTO workout_days (week_id, day_number, title, real_date, notes)
        VALUES (?, 1, 'วันที่ 1', ?, 'วันฝึกแรก')
        """, (week_1_id, today_str))
        day_1_id = cursor.lastrowid
        
        cursor.execute("UPDATE workout_logs SET day_id = ? WHERE day_id IS NULL", (day_1_id,))
        conn.commit()
    else:
        cursor.execute("SELECT id FROM workout_days ORDER BY id ASC LIMIT 1")
        first_day = cursor.fetchone()
        if first_day:
            cursor.execute("UPDATE workout_logs SET day_id = ? WHERE day_id IS NULL", (first_day[0],))
            conn.commit()

    conn.close()

    # 2. Check Supabase Cloud status and seed initial data if Supabase tables exist
    if check_supabase_ready():
        print("[BodyTag] ⚡ Connected to Supabase Cloud Database successfully!")
        try:
            ex_res = supabase_client.table("exercises").select("id").limit(1).execute()
            if not ex_res.data:
                print("[BodyTag] Seeding initial exercises into Supabase...")
                for ex in INITIAL_EXERCISES:
                    supabase_client.table("exercises").insert({
                        "id": ex["id"],
                        "name": ex["name"],
                        "name_th": ex.get("name_th", ""),
                        "category": ex["category"],
                        "primary_muscles": json.dumps(ex["primary"]),
                        "secondary_muscles": json.dumps(ex["secondary"]),
                        "is_custom": 0
                    }).execute()
                    
            w_res = supabase_client.table("workout_weeks").select("id").limit(1).execute()
            if not w_res.data:
                w_ins = supabase_client.table("workout_weeks").insert({
                    "week_number": 1,
                    "title": "สัปดาห์ที่ 1"
                }).execute()
                if w_ins.data:
                    w1_id = w_ins.data[0]["id"]
                    supabase_client.table("workout_days").insert({
                        "week_id": w1_id,
                        "day_number": 1,
                        "title": "วันที่ 1",
                        "real_date": datetime.now().strftime("%Y-%m-%d"),
                        "notes": "วันฝึกแรก"
                    }).execute()
        except Exception as e:
            print(f"[BodyTag] Supabase seed notice: {e}")
    else:
        print("[BodyTag] 💾 Running on Local Database (SQLite). To activate Supabase Cloud, run the SQL policies in your Supabase SQL Editor.")

def get_all_exercises():
    if check_supabase_ready():
        try:
            res = supabase_client.table("exercises").select("*").order("category").order("name").execute()
            if res.data:
                return [{
                    "id": r["id"],
                    "name": r["name"],
                    "name_th": r.get("name_th", ""),
                    "category": r["category"],
                    "primary": json.loads(r["primary_muscles"]) if isinstance(r["primary_muscles"], str) else r["primary_muscles"],
                    "secondary": json.loads(r["secondary_muscles"]) if isinstance(r["secondary_muscles"], str) else r["secondary_muscles"],
                    "is_custom": bool(r.get("is_custom", 0))
                } for r in res.data]
        except Exception as e:
            print(f"[BodyTag] Supabase get_all_exercises fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM exercises ORDER BY category, name")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "name": r["name"],
            "name_th": r["name_th"],
            "category": r["category"],
            "primary": json.loads(r["primary_muscles"]),
            "secondary": json.loads(r["secondary_muscles"]),
            "is_custom": bool(r["is_custom"])
        })
    return results

def add_exercise(ex_dict):
    if check_supabase_ready():
        try:
            supabase_client.table("exercises").insert({
                "id": ex_dict["id"],
                "name": ex_dict["name"],
                "name_th": ex_dict.get("name_th", ex_dict["name"]),
                "category": ex_dict.get("category", "Custom"),
                "primary_muscles": json.dumps(ex_dict.get("primary", [])),
                "secondary_muscles": json.dumps(ex_dict.get("secondary", [])),
                "is_custom": 1
            }).execute()
        except Exception as e:
            print(f"[BodyTag] Supabase add_exercise fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO exercises (id, name, name_th, category, primary_muscles, secondary_muscles, is_custom)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (
        ex_dict["id"],
        ex_dict["name"],
        ex_dict.get("name_th", ex_dict["name"]),
        ex_dict.get("category", "Custom"),
        json.dumps(ex_dict.get("primary", [])),
        json.dumps(ex_dict.get("secondary", []))
    ))
    conn.commit()
    conn.close()
    return ex_dict

# --- Week & Day Management ---

def get_all_weeks_with_days():
    if check_supabase_ready():
        try:
            w_res = supabase_client.table("workout_weeks").select("*").order("week_number").execute()
            d_res = supabase_client.table("workout_days").select("*").order("day_number").execute()
            l_res = supabase_client.table("workout_logs").select("*, exercises(*)").execute()
            
            if w_res.data is not None:
                logs_by_day = {}
                for l in (l_res.data or []):
                    d_id = l.get("day_id")
                    if not d_id:
                        continue
                    if d_id not in logs_by_day:
                        logs_by_day[d_id] = []
                    ex = l.get("exercises") or {}
                    pri = json.loads(ex.get("primary_muscles", "[]")) if isinstance(ex.get("primary_muscles"), str) else ex.get("primary_muscles", [])
                    sec = json.loads(ex.get("secondary_muscles", "[]")) if isinstance(ex.get("secondary_muscles"), str) else ex.get("secondary_muscles", [])
                    logs_by_day[d_id].append({
                        "sets": l["sets"],
                        "reps": l.get("reps", 10),
                        "weight": l.get("weight", 0),
                        "primary": pri,
                        "secondary": sec,
                        "ex_name": ex.get("name", ""),
                        "ex_name_th": ex.get("name_th", "") or ex.get("name", "")
                    })
                
                days_by_week = {}
                for dr in (d_res.data or []):
                    w_id = dr["week_id"]
                    d_id = dr["id"]
                    day_logs = logs_by_day.get(d_id, [])
                    
                    muscle_counts = {}
                    day_sets = 0
                    day_volume = 0.0
                    
                    for dl in day_logs:
                        s = dl["sets"]
                        day_sets += s
                        day_volume += s * dl["reps"] * dl["weight"]
                        for m in dl["primary"]:
                            muscle_counts[m] = muscle_counts.get(m, 0) + s
                        for m in dl["secondary"]:
                            muscle_counts[m] = muscle_counts.get(m, 0) + (s * 0.5)
                            
                    muscles_trained = []
                    for m_key, count in sorted(muscle_counts.items(), key=lambda x: x[1], reverse=True):
                        meta = MUSCLE_METADATA.get(m_key, {})
                        muscles_trained.append({
                            "key": m_key,
                            "name_th": meta.get("name_th", m_key),
                            "name_en": meta.get("name_en", m_key),
                            "sets": round(count, 1)
                        })
                        
                    day_item = {
                        "id": d_id,
                        "week_id": w_id,
                        "day_number": dr["day_number"],
                        "title": dr["title"],
                        "real_date": dr.get("real_date") or "",
                        "notes": dr.get("notes") or "",
                        "created_at": dr.get("created_at", ""),
                        "total_sets": day_sets,
                        "total_volume_kg": round(day_volume, 1),
                        "exercises_count": len(day_logs),
                        "muscles_trained": muscles_trained
                    }
                    if w_id not in days_by_week:
                        days_by_week[w_id] = []
                    days_by_week[w_id].append(day_item)
                    
                weeks = []
                for wr in w_res.data:
                    w_id = wr["id"]
                    days = days_by_week.get(w_id, [])
                    week_sets = sum(d["total_sets"] for d in days)
                    week_volume = sum(d["total_volume_kg"] for d in days)
                    weeks.append({
                        "id": w_id,
                        "week_number": wr["week_number"],
                        "title": wr["title"],
                        "created_at": wr.get("created_at", ""),
                        "total_days": len(days),
                        "total_sets": week_sets,
                        "total_volume_kg": round(week_volume, 1),
                        "days": days
                    })
                return weeks
        except Exception as e:
            print(f"[BodyTag] Supabase get_all_weeks_with_days fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workout_weeks ORDER BY week_number ASC, id ASC")
    week_rows = cursor.fetchall()
    
    cursor.execute("SELECT * FROM workout_days ORDER BY week_id ASC, day_number ASC, id ASC")
    day_rows = cursor.fetchall()
    
    cursor.execute("""
    SELECT l.id, l.day_id, l.sets, l.reps, l.weight, l.logged_at,
           e.primary_muscles, e.secondary_muscles, e.name as ex_name, e.name_th as ex_name_th
    FROM workout_logs l
    JOIN exercises e ON l.exercise_id = e.id
    """)
    log_rows = cursor.fetchall()
    conn.close()
    
    logs_by_day = {}
    for lr in log_rows:
        d_id = lr["day_id"]
        if d_id not in logs_by_day:
            logs_by_day[d_id] = []
        logs_by_day[d_id].append({
            "sets": lr["sets"],
            "reps": lr["reps"],
            "weight": lr["weight"],
            "primary": json.loads(lr["primary_muscles"]),
            "secondary": json.loads(lr["secondary_muscles"]),
            "ex_name": lr["ex_name"],
            "ex_name_th": lr["ex_name_th"] or lr["ex_name"]
        })
        
    days_by_week = {}
    for dr in day_rows:
        w_id = dr["week_id"]
        d_id = dr["id"]
        day_logs = logs_by_day.get(d_id, [])
        
        muscle_counts = {}
        day_sets = 0
        day_volume = 0.0
        
        for dl in day_logs:
            s = dl["sets"]
            day_sets += s
            day_volume += s * dl["reps"] * dl["weight"]
            
            for m in dl["primary"]:
                muscle_counts[m] = muscle_counts.get(m, 0) + s
            for m in dl["secondary"]:
                muscle_counts[m] = muscle_counts.get(m, 0) + (s * 0.5)
                
        muscles_trained = []
        for m_key, count in sorted(muscle_counts.items(), key=lambda x: x[1], reverse=True):
            meta = MUSCLE_METADATA.get(m_key, {})
            muscles_trained.append({
                "key": m_key,
                "name_th": meta.get("name_th", m_key),
                "name_en": meta.get("name_en", m_key),
                "sets": round(count, 1)
            })
            
        day_item = {
            "id": d_id,
            "week_id": w_id,
            "day_number": dr["day_number"],
            "title": dr["title"],
            "real_date": dr["real_date"] or "",
            "notes": dr["notes"] or "",
            "created_at": dr["created_at"],
            "total_sets": day_sets,
            "total_volume_kg": round(day_volume, 1),
            "exercises_count": len(day_logs),
            "muscles_trained": muscles_trained
        }
        
        if w_id not in days_by_week:
            days_by_week[w_id] = []
        days_by_week[w_id].append(day_item)
        
    weeks = []
    for wr in week_rows:
        w_id = wr["id"]
        days = days_by_week.get(w_id, [])
        week_sets = sum(d["total_sets"] for d in days)
        week_volume = sum(d["total_volume_kg"] for d in days)
        
        weeks.append({
            "id": w_id,
            "week_number": wr["week_number"],
            "title": wr["title"],
            "created_at": wr["created_at"],
            "total_days": len(days),
            "total_sets": week_sets,
            "total_volume_kg": round(week_volume, 1),
            "days": days
        })
        
    return weeks

def add_week(title=None):
    if check_supabase_ready():
        try:
            w_res = supabase_client.table("workout_weeks").select("week_number").order("week_number", desc=True).limit(1).execute()
            next_num = (w_res.data[0]["week_number"] + 1) if w_res.data else 1
            week_title = title.strip() if title and title.strip() else f"สัปดาห์ที่ {next_num}"
            ins = supabase_client.table("workout_weeks").insert({
                "week_number": next_num,
                "title": week_title
            }).execute()
            if ins.data:
                new_w_id = ins.data[0]["id"]
                supabase_client.table("workout_days").insert({
                    "week_id": new_w_id,
                    "day_number": 1,
                    "title": "วันที่ 1",
                    "real_date": datetime.now().strftime("%Y-%m-%d"),
                    "notes": ""
                }).execute()
                return {"id": new_w_id, "week_number": next_num, "title": week_title}
        except Exception as e:
            print(f"[BodyTag] Supabase add_week fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COALESCE(MAX(week_number), 0) + 1 FROM workout_weeks")
    next_num = cursor.fetchone()[0]
    
    week_title = title.strip() if title and title.strip() else f"สัปดาห์ที่ {next_num}"
    cursor.execute("""
    INSERT INTO workout_weeks (week_number, title)
    VALUES (?, ?)
    """, (next_num, week_title))
    new_week_id = cursor.lastrowid
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("""
    INSERT INTO workout_days (week_id, day_number, title, real_date, notes)
    VALUES (?, 1, 'วันที่ 1', ?, '')
    """, (new_week_id, today_str))
    
    conn.commit()
    conn.close()
    return {"id": new_week_id, "week_number": next_num, "title": week_title}

def delete_week(week_id):
    if check_supabase_ready():
        try:
            supabase_client.table("workout_weeks").delete().eq("id", week_id).execute()
        except Exception as e:
            print(f"[BodyTag] Supabase delete_week note: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    DELETE FROM workout_logs WHERE day_id IN (
        SELECT id FROM workout_days WHERE week_id = ?
    )
    """, (week_id,))
    cursor.execute("DELETE FROM workout_days WHERE week_id = ?", (week_id,))
    cursor.execute("DELETE FROM workout_weeks WHERE id = ?", (week_id,))
    conn.commit()
    conn.close()
    return True

def add_day(week_id, title=None, real_date=None, notes=""):
    date_val = real_date if real_date else datetime.now().strftime("%Y-%m-%d")
    if check_supabase_ready():
        try:
            d_res = supabase_client.table("workout_days").select("day_number").eq("week_id", week_id).order("day_number", desc=True).limit(1).execute()
            next_num = (d_res.data[0]["day_number"] + 1) if d_res.data else 1
            day_title = title.strip() if title and title.strip() else f"วันที่ {next_num}"
            ins = supabase_client.table("workout_days").insert({
                "week_id": week_id,
                "day_number": next_num,
                "title": day_title,
                "real_date": date_val,
                "notes": notes or ""
            }).execute()
            if ins.data:
                return ins.data[0]
        except Exception as e:
            print(f"[BodyTag] Supabase add_day fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COALESCE(MAX(day_number), 0) + 1 FROM workout_days WHERE week_id = ?", (week_id,))
    next_num = cursor.fetchone()[0]
    
    day_title = title.strip() if title and title.strip() else f"วันที่ {next_num}"
    cursor.execute("""
    INSERT INTO workout_days (week_id, day_number, title, real_date, notes)
    VALUES (?, ?, ?, ?, ?)
    """, (week_id, next_num, day_title, date_val, notes or ""))
    
    new_day_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "id": new_day_id,
        "week_id": week_id,
        "day_number": next_num,
        "title": day_title,
        "real_date": date_val,
        "notes": notes
    }

def update_day(day_id, title=None, real_date=None, notes=None):
    if check_supabase_ready():
        try:
            payload = {}
            if title is not None: payload["title"] = title
            if real_date is not None: payload["real_date"] = real_date
            if notes is not None: payload["notes"] = notes
            if payload:
                supabase_client.table("workout_days").update(payload).eq("id", day_id).execute()
        except Exception as e:
            print(f"[BodyTag] Supabase update_day fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    updates = []
    params = []
    if title is not None:
        updates.append("title = ?")
        params.append(title)
    if real_date is not None:
        updates.append("real_date = ?")
        params.append(real_date)
    if notes is not None:
        updates.append("notes = ?")
        params.append(notes)
        
    if updates:
        params.append(day_id)
        cursor.execute(f"UPDATE workout_days SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    conn.close()
    return True

def delete_day(day_id):
    if check_supabase_ready():
        try:
            supabase_client.table("workout_days").delete().eq("id", day_id).execute()
        except Exception as e:
            print(f"[BodyTag] Supabase delete_day fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM workout_logs WHERE day_id = ?", (day_id,))
    cursor.execute("DELETE FROM workout_days WHERE id = ?", (day_id,))
    conn.commit()
    conn.close()
    return True

# --- Logs Operations ---

def get_logs(week_id=None, day_id=None, limit=200):
    if check_supabase_ready():
        try:
            query = supabase_client.table("workout_logs").select("*, exercises(*), workout_days(*, workout_weeks(*))")
            if day_id is not None:
                query = query.eq("day_id", day_id)
            elif week_id is not None:
                query = query.eq("workout_days.week_id", week_id)
            res = query.order("logged_at", desc=True).limit(limit).execute()
            if res.data is not None:
                results = []
                for r in res.data:
                    ex = r.get("exercises") or {}
                    d = r.get("workout_days") or {}
                    w = d.get("workout_weeks") or {}
                    if week_id is not None and d.get("week_id") != week_id:
                        continue
                    pri = json.loads(ex.get("primary_muscles", "[]")) if isinstance(ex.get("primary_muscles"), str) else ex.get("primary_muscles", [])
                    sec = json.loads(ex.get("secondary_muscles", "[]")) if isinstance(ex.get("secondary_muscles"), str) else ex.get("secondary_muscles", [])
                    results.append({
                        "id": r["id"],
                        "day_id": r.get("day_id"),
                        "week_id": d.get("week_id"),
                        "day_title": d.get("title") or "ไม่ระบุวัน",
                        "day_real_date": d.get("real_date") or "",
                        "week_title": w.get("title") or "",
                        "week_number": w.get("week_number"),
                        "exercise_id": r["exercise_id"],
                        "exercise_name": ex.get("name", ""),
                        "exercise_name_th": ex.get("name_th", "") or ex.get("name", ""),
                        "category": ex.get("category", "General"),
                        "sets": r["sets"],
                        "reps": r.get("reps", 10),
                        "weight": r.get("weight", 0),
                        "rpe": r.get("rpe", 8.0),
                        "notes": r.get("notes", ""),
                        "logged_at": r.get("logged_at", ""),
                        "primary": pri,
                        "secondary": sec
                    })
                return results
        except Exception as e:
            print(f"[BodyTag] Supabase get_logs fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    query = """
    SELECT l.id, l.day_id, l.exercise_id, l.sets, l.reps, l.weight, l.rpe, l.notes, l.logged_at,
           e.name as exercise_name, e.name_th as exercise_name_th, e.category,
           e.primary_muscles, e.secondary_muscles,
           d.title as day_title, d.real_date as day_real_date, d.week_id,
           w.title as week_title, w.week_number
    FROM workout_logs l
    JOIN exercises e ON l.exercise_id = e.id
    LEFT JOIN workout_days d ON l.day_id = d.id
    LEFT JOIN workout_weeks w ON d.week_id = w.id
    """
    params = []
    if day_id is not None:
        query += " WHERE l.day_id = ?"
        params.append(day_id)
    elif week_id is not None:
        query += " WHERE d.week_id = ?"
        params.append(week_id)
        
    query += " ORDER BY l.logged_at DESC, l.id DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "day_id": r["day_id"],
            "week_id": r["week_id"],
            "day_title": r["day_title"] or "ไม่ระบุวัน",
            "day_real_date": r["day_real_date"] or "",
            "week_title": r["week_title"] or "",
            "week_number": r["week_number"],
            "exercise_id": r["exercise_id"],
            "exercise_name": r["exercise_name"],
            "exercise_name_th": r["exercise_name_th"],
            "category": r["category"],
            "sets": r["sets"],
            "reps": r["reps"],
            "weight": r["weight"],
            "rpe": r["rpe"],
            "notes": r["notes"],
            "logged_at": r["logged_at"],
            "primary": json.loads(r["primary_muscles"]),
            "secondary": json.loads(r["secondary_muscles"])
        })
    return results

def add_log(exercise_id, sets, reps=10, weight=0.0, rpe=8.0, notes="", custom_time=None, day_id=None):
    logged_time = custom_time if custom_time else datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    
    if check_supabase_ready():
        try:
            ins = supabase_client.table("workout_logs").insert({
                "day_id": day_id,
                "exercise_id": exercise_id,
                "sets": sets,
                "reps": reps,
                "weight": weight,
                "rpe": rpe,
                "notes": notes or "",
                "logged_at": logged_time
            }).execute()
            if ins.data:
                return ins.data[0]["id"]
        except Exception as e:
            print(f"[BodyTag] Supabase add_log fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    if not day_id:
        cursor.execute("SELECT id FROM workout_days ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        if row:
            day_id = row[0]
        else:
            cursor.execute("INSERT INTO workout_weeks (week_number, title) VALUES (1, 'สัปดาห์ที่ 1')")
            w_id = cursor.lastrowid
            cursor.execute("INSERT INTO workout_days (week_id, day_number, title, real_date) VALUES (?, 1, 'วันที่ 1', ?)",
                           (w_id, datetime.now().strftime("%Y-%m-%d")))
            day_id = cursor.lastrowid
            
    cursor.execute("""
    INSERT INTO workout_logs (day_id, exercise_id, sets, reps, weight, rpe, notes, logged_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (day_id, exercise_id, sets, reps, weight, rpe, notes, logged_time))
    
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return log_id

def delete_log(log_id):
    if check_supabase_ready():
        try:
            supabase_client.table("workout_logs").delete().eq("id", log_id).execute()
        except Exception as e:
            print(f"[BodyTag] Supabase delete_log fallback: {e}")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM workout_logs WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()
    return True

def reset_logs(week_id=None, day_id=None):
    if check_supabase_ready():
        try:
            if day_id is not None:
                supabase_client.table("workout_logs").delete().eq("day_id", day_id).execute()
            else:
                supabase_client.table("workout_logs").delete().neq("id", 0).execute()
        except Exception as e:
            print(f"[BodyTag] Supabase reset_logs note: {e}")

    conn = get_db()
    cursor = conn.cursor()
    if day_id is not None:
        cursor.execute("DELETE FROM workout_logs WHERE day_id = ?", (day_id,))
    elif week_id is not None:
        cursor.execute("""
        DELETE FROM workout_logs WHERE day_id IN (
            SELECT id FROM workout_days WHERE week_id = ?
        )
        """, (week_id,))
    else:
        cursor.execute("DELETE FROM workout_logs")
    conn.commit()
    conn.close()
    return True

# --- Statistics & Heatmap Calculation ---

def calculate_stats(week_id=None, day_id=None):
    logs = get_logs(week_id=week_id, day_id=day_id, limit=1000)
    now = datetime.now(timezone.utc)
    
    muscle_stats = {}
    for muscle_key, meta in MUSCLE_METADATA.items():
        muscle_stats[muscle_key] = {
            "key": muscle_key,
            "name_en": meta["name_en"],
            "name_th": meta["name_th"],
            "view": meta["view"],
            "mev": meta["mev"],
            "mav": meta["mav"],
            "mrv": meta["mrv"],
            "raw_sets": 0,
            "effective_volume": 0.0,
            "total_reps": 0,
            "total_tonnage_kg": 0.0,
            "last_worked_at": None,
            "hours_since_workout": None,
            "recovery_percent": 100,
            "recent_exercises": [],
            "heatmap_level": 0,
            "volume_status": "Resting",
            "volume_status_th": "ยังไม่ได้เล่น"
        }
    
    for log in logs:
        try:
            log_dt = datetime.fromisoformat(log["logged_at"].replace("Z", "+00:00"))
            if log_dt.tzinfo is None:
                log_dt = log_dt.replace(tzinfo=timezone.utc)
        except Exception:
            log_dt = now

        hours_diff = max(0, (now - log_dt).total_seconds() / 3600.0)
        
        sets = log["sets"]
        reps = log["reps"]
        weight = log["weight"]
        ex_name = log["exercise_name_th"] or log["exercise_name"]
        
        for m in log["primary"]:
            if m in muscle_stats:
                st = muscle_stats[m]
                st["raw_sets"] += sets
                st["effective_volume"] += sets * 1.0
                st["total_reps"] += sets * reps
                st["total_tonnage_kg"] += sets * reps * weight
                if st["last_worked_at"] is None or log_dt > st.get("last_workout_dt", log_dt):
                    st["last_worked_at"] = log["logged_at"]
                    st["last_workout_dt"] = log_dt
                    st["hours_since_workout"] = round(hours_diff, 1)
                if ex_name not in st["recent_exercises"]:
                    st["recent_exercises"].append(ex_name)
                    
        for m in log["secondary"]:
            if m in muscle_stats:
                st = muscle_stats[m]
                st["raw_sets"] += sets
                st["effective_volume"] += sets * 0.5
                st["total_reps"] += int(sets * reps * 0.5)
                st["total_tonnage_kg"] += (sets * reps * weight) * 0.5
                if st["last_worked_at"] is None or log_dt > st.get("last_workout_dt", log_dt):
                    st["last_worked_at"] = log["logged_at"]
                    st["last_workout_dt"] = log_dt
                    st["hours_since_workout"] = round(hours_diff, 1)
                if f"{ex_name} (มัดรอง)" not in st["recent_exercises"]:
                    st["recent_exercises"].append(f"{ex_name} (มัดรอง)")

    for m, st in muscle_stats.items():
        st.pop("last_workout_dt", None)
        eff_vol = st["effective_volume"]
        
        if eff_vol <= 0:
            st["heatmap_level"] = 0
            st["heatmap_color"] = "#334155"
        elif eff_vol <= 3:
            st["heatmap_level"] = 1
            st["heatmap_color"] = "#22c55e"
        elif eff_vol <= 7:
            st["heatmap_level"] = 2
            st["heatmap_color"] = "#f59e0b"
        elif eff_vol <= 12:
            st["heatmap_level"] = 3
            st["heatmap_color"] = "#f97316"
        else:
            st["heatmap_level"] = 4
            st["heatmap_color"] = "#ef4444"
            
        if st["hours_since_workout"] is not None and eff_vol > 0:
            full_recovery_hours = min(96.0, 36.0 + eff_vol * 3.0)
            hours_passed = st["hours_since_workout"]
            rec_pct = min(100, int((hours_passed / full_recovery_hours) * 100))
            st["recovery_percent"] = rec_pct
            st["recovery_hours_total"] = round(full_recovery_hours, 1)
            st["hours_remaining"] = max(0, round(full_recovery_hours - hours_passed, 1))
        else:
            st["recovery_percent"] = 100
            st["recovery_hours_total"] = 0
            st["hours_remaining"] = 0
            
        if eff_vol == 0:
            st["volume_status"] = "Resting"
            st["volume_status_th"] = "ยังไม่ได้เล่น"
        elif eff_vol < st["mev"]:
            st["volume_status"] = "Light / Maintenance"
            st["volume_status_th"] = "คงสภาพ (< MEV)"
        elif eff_vol <= st["mav"]:
            st["volume_status"] = "Optimal Growth (MAV)"
            st["volume_status_th"] = "จุดโตสูงสุด (MEV-MAV)"
        elif eff_vol <= st["mrv"]:
            st["volume_status"] = "High Volume (MAV-MRV)"
            st["volume_status_th"] = "ปริมาณสูง (MAV-MRV)"
        else:
            st["volume_status"] = "Overreaching (MRV+)"
            st["volume_status_th"] = "เกินขีดจำกัด (> MRV)"
            
        st["effective_volume"] = round(st["effective_volume"], 1)
        st["total_tonnage_kg"] = round(st["total_tonnage_kg"], 1)

    total_logs = len(logs)
    total_sets = sum(l["sets"] for l in logs)
    total_volume_kg = sum(l["sets"] * l["reps"] * l["weight"] for l in logs)
    
    return {
        "muscles": muscle_stats,
        "summary": {
            "total_logs": total_logs,
            "total_sets": total_sets,
            "total_volume_kg": round(total_volume_kg, 1),
            "active_muscle_count": sum(1 for m in muscle_stats.values() if m["effective_volume"] > 0),
            "scope": {
                "week_id": week_id,
                "day_id": day_id
            }
        }
    }

