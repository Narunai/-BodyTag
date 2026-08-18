/**
 * BodyTag - Muscle Tracker & Anatomy Heatmap Frontend App
 * Supports Weekly Tracking, Custom Dynamic Days, Real-Date Reference, and Scope Isolation
 */

const AppState = {
    weeks: [],
    selectedWeekId: null,
    selectedDayId: null,     // null = Full Week scope; number = Specific Day scope
    logTargetDayId: null,    // The day where newly logged workouts go
    exercises: [],
    logs: [],
    stats: { muscles: {}, summary: {} },
    currentView: 'anterior', // 'anterior' | 'posterior' | 'dual'
    colorMode: 'heatmap',    // 'heatmap' | 'recovery' | 'landmarks'
    selectedCategory: 'all',
    selectedExerciseId: '',
    selectedMuscleKey: null,
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    initViewControls();
    initFormControls();
    initModalControls();
    initWeekAndDayControls();
    
    // Load initial exercises and weeks hierarchy
    await loadExercises();
    await loadWeeksAndInit();
});

// --- Weeks & Days Data Loading & Setup ---

async function loadWeeksAndInit() {
    try {
        const res = await fetch('/api/weeks');
        AppState.weeks = await res.json();
        
        if (AppState.weeks.length > 0) {
            // Default to latest week or existing selected
            if (!AppState.selectedWeekId || !AppState.weeks.some(w => w.id === AppState.selectedWeekId)) {
                AppState.selectedWeekId = AppState.weeks[AppState.weeks.length - 1].id;
            }
            
            const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
            if (currentWeek && currentWeek.days.length > 0) {
                // If previously selected day isn't in this week, reset or set target
                if (AppState.selectedDayId && !currentWeek.days.some(d => d.id === AppState.selectedDayId)) {
                    AppState.selectedDayId = null;
                }
                AppState.logTargetDayId = currentWeek.days[currentWeek.days.length - 1].id;
            } else {
                AppState.selectedDayId = null;
                AppState.logTargetDayId = null;
            }
        } else {
            AppState.selectedWeekId = null;
            AppState.selectedDayId = null;
            AppState.logTargetDayId = null;
        }

        renderWeekSelector();
        renderTargetDaySelector();
        renderWeeklySidebar();
        await refreshScopedData();
    } catch (err) {
        console.error('Failed to load weeks hierarchy:', err);
    }
}

// Refresh scoped logs, statistics, and UI components
async function refreshScopedData() {
    try {
        const weekParam = AppState.selectedWeekId ? `week_id=${AppState.selectedWeekId}` : '';
        const dayParam = AppState.selectedDayId ? `day_id=${AppState.selectedDayId}` : '';
        const query = [weekParam, dayParam].filter(Boolean).join('&');
        const urlSuffix = query ? `?${query}` : '';

        const [statsRes, logsRes] = await Promise.all([
            fetch(`/api/stats${urlSuffix}`),
            fetch(`/api/logs${urlSuffix}`)
        ]);
        
        AppState.stats = await statsRes.json();
        AppState.logs = await logsRes.json();
        
        renderScopeHeaders();
        renderBodyModel();
        renderSummaryStats();
        renderMuscleCards();
        renderLogsHistory();
    } catch (err) {
        console.error('Failed to refresh scoped data:', err);
    }
}

// Load exercises from API
async function loadExercises() {
    try {
        const res = await fetch('/api/exercises');
        AppState.exercises = await res.json();
        renderExerciseSelect();
    } catch (err) {
        console.error('Failed to load exercises:', err);
    }
}

// --- Week & Day Controls & Handlers ---

function initWeekAndDayControls() {
    // Week Select Dropdown Change
    const weekSelect = document.getElementById('week-select');
    if (weekSelect) {
        weekSelect.addEventListener('change', async (e) => {
            AppState.selectedWeekId = parseInt(e.target.value);
            AppState.selectedDayId = null; // Reset to all-week view
            
            const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
            if (currentWeek && currentWeek.days.length > 0) {
                AppState.logTargetDayId = currentWeek.days[currentWeek.days.length - 1].id;
            } else {
                AppState.logTargetDayId = null;
            }

            renderWeeklySidebar();
            renderTargetDaySelector();
            await refreshScopedData();
        });
    }

    // "View All Week" Button
    const allWeekBtn = document.getElementById('btn-scope-all-week');
    if (allWeekBtn) {
        allWeekBtn.addEventListener('click', async () => {
            AppState.selectedDayId = null;
            renderWeeklySidebar();
            await refreshScopedData();
        });
    }

    // Delete Current Week Button
    const delWeekBtn = document.getElementById('btn-delete-current-week');
    if (delWeekBtn) {
        delWeekBtn.addEventListener('click', async () => {
            if (!AppState.selectedWeekId) return;
            const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
            const title = currentWeek ? currentWeek.title : 'สัปดาห์นี้';
            
            if (confirm(`คุณต้องการลบ "${title}" และวันฝึกทั้งหมดในสัปดาห์นี้หรือไม่?`)) {
                await fetch(`/api/weeks/${AppState.selectedWeekId}`, { method: 'DELETE' });
                showToast(`ลบ ${title} เรียบร้อยแล้ว`);
                AppState.selectedWeekId = null;
                AppState.selectedDayId = null;
                await loadWeeksAndInit();
            }
        });
    }

    // Target Day Select in Logger Form
    const targetDaySelect = document.getElementById('log-target-day-select');
    if (targetDaySelect) {
        targetDaySelect.addEventListener('change', (e) => {
            AppState.logTargetDayId = parseInt(e.target.value);
        });
    }
}

// Render Week Dropdown
function renderWeekSelector() {
    const select = document.getElementById('week-select');
    if (!select) return;

    select.innerHTML = '';
    AppState.weeks.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${w.title} (${w.days.length} วันฝึก • ${w.total_sets} เซ็ต)`;
        if (w.id === AppState.selectedWeekId) opt.selected = true;
        select.appendChild(opt);
    });
}

// Render Target Day Selector in Logger form
function renderTargetDaySelector() {
    const select = document.getElementById('log-target-day-select');
    if (!select) return;

    select.innerHTML = '';
    AppState.weeks.forEach(w => {
        const optGroup = document.createElement('optgroup');
        optGroup.label = w.title;

        w.days.forEach(d => {
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
        if (firstWeek && firstWeek.days.length > 0) {
            AppState.logTargetDayId = firstWeek.days[0].id;
            select.value = AppState.logTargetDayId;
        }
    }
}

// Render Left Sidebar (Selected Week Info & Days List)
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

    // Update Week summary card
    if (weekTitleEl) weekTitleEl.textContent = currentWeek.title;
    if (weekDaysCountEl) weekDaysCountEl.textContent = `${currentWeek.days.length} วันฝึก`;
    if (weekTotalSetsEl) weekTotalSetsEl.textContent = `${currentWeek.total_sets} เซ็ต`;
    if (weekTotalVolumeEl) weekTotalVolumeEl.textContent = `${currentWeek.total_volume_kg.toLocaleString()} kg`;
    if (daysBadgeEl) daysBadgeEl.textContent = `${currentWeek.days.length} วัน`;

    // Highlight All Week Button if active
    if (allWeekBtn) {
        if (AppState.selectedDayId === null) {
            allWeekBtn.className = 'py-2 px-3 text-xs font-semibold rounded-xl bg-sky-500 text-white transition text-center shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5 ring-2 ring-sky-300/40';
        } else {
            allWeekBtn.className = 'py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-center flex items-center justify-center gap-1.5';
        }
    }

    if (!currentWeek.days || currentWeek.days.length === 0) {
        if (daysListContainer) daysListContainer.innerHTML = '';
        if (daysEmptyState) daysEmptyState.classList.remove('hidden');
        return;
    }

    if (daysEmptyState) daysEmptyState.classList.add('hidden');

    // Render list of day cards
    if (daysListContainer) {
        daysListContainer.innerHTML = currentWeek.days.map(day => {
            const isActive = (AppState.selectedDayId === day.id);
            const activeClass = isActive ? 'active-day ring-2 ring-sky-400' : '';
            
            // Render muscle badges trained on this day
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
                            <!-- Real date reference badge -->
                            <div class="flex items-center gap-1 text-[11px] text-sky-400/90 font-mono mt-0.5">
                                <span>📅</span>
                                <span>${day.real_date ? formatRealDate(day.real_date) : 'ไม่ได้ระบุวันที่'}</span>
                            </div>
                        </div>

                        <!-- Day Action Buttons -->
                        <div class="flex items-center gap-1" onclick="event.stopPropagation()">
                            <button onclick="openEditDayModal(${day.id})" title="แก้ไขวัน" class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs">
                                ✏️
                            </button>
                            <button onclick="deleteDay(${day.id})" title="ลบวัน" class="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-xs">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <!-- Muscle Summary Pills -->
                    ${musclesHtml}

                    <!-- Metrics Line -->
                    <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>${day.exercises_count} ท่าฝึก • ${day.total_sets} เซ็ต</span>
                        <span class="text-sky-300 font-bold">${day.total_volume_kg > 0 ? day.total_volume_kg.toLocaleString() + ' kg' : '-'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Scope select handlers
window.selectDayScope = async function(dayId) {
    AppState.selectedDayId = dayId;
    AppState.logTargetDayId = dayId;
    renderWeeklySidebar();
    renderTargetDaySelector();
    await refreshScopedData();
};

// Render Scope Headers across the UI
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
        const currentDay = currentWeek.days.find(d => d.id === AppState.selectedDayId);
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
    // View Switchers (Front / Back / Dual)
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

    // Color Mode Switcher (Heatmap / Recovery / Landmarks)
    const modeSelect = document.getElementById('color-mode-select');
    if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
            AppState.colorMode = e.target.value;
            updateMuscleColors();
            updateLegendDisplay();
        });
    }

    // Reset Logs Button
    const resetBtn = document.getElementById('btn-reset-logs');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
            const scopeName = AppState.selectedDayId 
                ? 'วันฝึกนี้' 
                : (currentWeek ? currentWeek.title : 'ทั้งหมด');
                
            if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการฝึกของ "${scopeName}"?`)) {
                await fetch(`/api/logs/reset?week_id=${AppState.selectedWeekId || ''}&day_id=${AppState.selectedDayId || ''}`, { method: 'POST' });
                await loadWeeksAndInit();
                showToast(`ล้างข้อมูล ${scopeName} เรียบร้อยแล้ว`);
            }
        });
    }
}

// --- Form and Input Handlers ---

function initFormControls() {
    // Category Filter
    const catSelect = document.getElementById('category-filter');
    if (catSelect) {
        catSelect.addEventListener('change', (e) => {
            AppState.selectedCategory = e.target.value;
            renderExerciseSelect();
        });
    }

    // Exercise Select Change
    const exSelect = document.getElementById('exercise-select');
    if (exSelect) {
        exSelect.addEventListener('change', (e) => {
            AppState.selectedExerciseId = e.target.value;
            updateExercisePreview();
        });
    }

    // Quick Set Buttons (+1, +3, +4, +5)
    document.querySelectorAll('[data-quick-sets]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('input-sets');
            if (input) {
                input.value = btn.dataset.quickSets;
            }
        });
    });

    // Form Submit (Log Exercise)
    const workoutForm = document.getElementById('workout-log-form');
    if (workoutForm) {
        workoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitWorkoutLog();
        });
    }
}

// Render Exercise Dropdown
function renderExerciseSelect() {
    const exSelect = document.getElementById('exercise-select');
    if (!exSelect) return;

    const filtered = AppState.selectedCategory === 'all'
        ? AppState.exercises
        : AppState.exercises.filter(e => e.category === AppState.selectedCategory);

    exSelect.innerHTML = '';
    filtered.forEach(ex => {
        const opt = document.createElement('option');
        opt.value = ex.id;
        opt.textContent = `${ex.name_th ? ex.name_th + ' (' + ex.name + ')' : ex.name} [${ex.category}]`;
        exSelect.appendChild(opt);
    });

    if (filtered.length > 0) {
        AppState.selectedExerciseId = filtered[0].id;
        exSelect.value = filtered[0].id;
    } else {
        AppState.selectedExerciseId = '';
    }

    updateExercisePreview();
}

// Update muscle previews below the form
function updateExercisePreview() {
    const previewContainer = document.getElementById('exercise-muscle-preview');
    if (!previewContainer) return;

    const ex = AppState.exercises.find(e => e.id === AppState.selectedExerciseId);
    if (!ex) {
        previewContainer.innerHTML = '<span class="text-xs text-slate-400">เลือกท่าเพื่อดูกล้ามเนื้อที่ทำงาน</span>';
        return;
    }

    let html = `
        <div class="flex flex-wrap gap-1.5 items-center">
            <span class="text-xs font-semibold text-slate-400 mr-1">กล้ามเนื้อหลัก (100%):</span>
            ${ex.primary.map(m => {
                const name = AppState.stats.muscles[m]?.name_th || m;
                return `<span class="px-2 py-0.5 text-xs rounded-full tag-primary font-medium">${name}</span>`;
            }).join('')}
        </div>
    `;

    if (ex.secondary && ex.secondary.length > 0) {
        html += `
            <div class="flex flex-wrap gap-1.5 items-center mt-1.5">
                <span class="text-xs font-semibold text-slate-400 mr-1">กล้ามเนื้อมัดรอง (50%):</span>
                ${ex.secondary.map(m => {
                    const name = AppState.stats.muscles[m]?.name_th || m;
                    return `<span class="px-2 py-0.5 text-xs rounded-full tag-secondary font-medium">${name}</span>`;
                }).join('')}
            </div>
        `;
    }

    previewContainer.innerHTML = html;
}

// Submit Workout Log
async function submitWorkoutLog() {
    const exerciseId = document.getElementById('exercise-select')?.value;
    const targetDayId = parseInt(document.getElementById('log-target-day-select')?.value || AppState.logTargetDayId);
    const sets = parseInt(document.getElementById('input-sets')?.value || 3);
    const reps = parseInt(document.getElementById('input-reps')?.value || 10);
    const weight = parseFloat(document.getElementById('input-weight')?.value || 0);
    const rpe = parseFloat(document.getElementById('input-rpe')?.value || 8.0);
    const notes = document.getElementById('input-notes')?.value || '';

    if (!exerciseId || sets <= 0) {
        alert('กรุณาเลือกท่าและระบุจำนวนเซ็ตที่ถูกต้อง');
        return;
    }

    if (!targetDayId) {
        alert('กรุณาสร้างวันฝึก (Day) ในสัปดาห์ก่อนบันทึก');
        return;
    }

    const payload = {
        exercise_id: exerciseId,
        day_id: targetDayId,
        sets,
        reps,
        weight,
        rpe,
        notes
    };

    try {
        const res = await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast(`บันทึก ${sets} เซ็ตสำเร็จ! 🔥`);
            await loadWeeksAndInit();
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึก');
        }
    } catch (err) {
        console.error('Failed to log workout:', err);
    }
}

// --- Body Anatomy Vector Rendering & SVG Events ---

function renderBodyModel() {
    const container = document.getElementById('body-model-container');
    if (!container) return;

    if (AppState.currentView === 'anterior') {
        container.innerHTML = `
            <div class="w-full max-w-[280px] mx-auto transition-opacity duration-300">
                ${BodySVG.getAnteriorSVG()}
            </div>
        `;
    } else if (AppState.currentView === 'posterior') {
        container.innerHTML = `
            <div class="w-full max-w-[280px] mx-auto transition-opacity duration-300">
                ${BodySVG.getPosteriorSVG()}
            </div>
        `;
    } else {
        // Dual view
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-3 max-w-[540px] mx-auto">
                <div>
                    <p class="text-[11px] text-center text-slate-400 font-semibold mb-1">ด้านหน้า (Front)</p>
                    ${BodySVG.getAnteriorSVG()}
                </div>
                <div>
                    <p class="text-[11px] text-center text-slate-400 font-semibold mb-1">ด้านหลัง (Back)</p>
                    ${BodySVG.getPosteriorSVG()}
                </div>
            </div>
        `;
    }

    bindMuscleEvents();
    updateMuscleColors();
}

function bindMuscleEvents() {
    const muscleElements = document.querySelectorAll('.muscle-part');

    muscleElements.forEach(el => {
        const muscleKey = el.dataset.muscle;

        el.addEventListener('mouseenter', (e) => {
            highlightMuscleGroup(muscleKey, true);
            showTooltip(e, muscleKey);
        });

        el.addEventListener('mousemove', (e) => {
            positionTooltip(e);
        });

        el.addEventListener('mouseleave', () => {
            highlightMuscleGroup(muscleKey, false);
            hideTooltip();
        });

        el.addEventListener('click', () => {
            selectMuscleDrilldown(muscleKey);
        });
    });
}

function highlightMuscleGroup(muscleKey, isActive) {
    const parts = document.querySelectorAll(`[data-muscle="${muscleKey}"]`);
    parts.forEach(p => {
        if (isActive) {
            p.classList.add('active-selected');
        } else {
            p.classList.remove('active-selected');
        }
    });
}

function updateMuscleColors() {
    const muscleElements = document.querySelectorAll('.muscle-part');
    const muscles = AppState.stats.muscles || {};

    muscleElements.forEach(el => {
        const key = el.dataset.muscle;
        const data = muscles[key];
        if (!data) return;

        let fillColor = '#334155'; // default inactive slate-700
        el.classList.remove('glow-high');

        if (AppState.colorMode === 'heatmap') {
            fillColor = data.heatmap_color || '#334155';
            if (data.heatmap_level >= 4) {
                el.classList.add('glow-high');
            }
        } else if (AppState.colorMode === 'recovery') {
            const rec = data.recovery_percent;
            if (data.effective_volume === 0) {
                fillColor = '#334155';
            } else if (rec < 35) {
                fillColor = '#ef4444'; // Red
            } else if (rec < 70) {
                fillColor = '#f59e0b'; // Amber
            } else if (rec < 95) {
                fillColor = '#0284c7'; // Sky/Blue
            } else {
                fillColor = '#10b981'; // Ready/Green
            }
        } else if (AppState.colorMode === 'landmarks') {
            const eff = data.effective_volume;
            if (eff === 0) {
                fillColor = '#334155';
            } else if (eff < data.mev) {
                fillColor = '#38bdf8'; // Light Blue (Under MEV)
            } else if (eff <= data.mav) {
                fillColor = '#10b981'; // Emerald (MAV - Optimal)
            } else if (eff <= data.mrv) {
                fillColor = '#f97316'; // Orange (High Volume)
            } else {
                fillColor = '#ef4444'; // Red (Overreaching)
            }
        }

        if (el.tagName.toLowerCase() === 'g') {
            el.querySelectorAll('path').forEach(p => p.style.fill = fillColor);
        } else {
            el.style.fill = fillColor;
        }
    });
}

function updateLegendDisplay() {
    const legendContainer = document.getElementById('model-legend');
    if (!legendContainer) return;

    if (AppState.colorMode === 'heatmap') {
        legendContainer.innerHTML = `
            <div class="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300">
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-slate-700 inline-block"></span> 0 เซ็ต</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> 1-3 เซ็ต (เบา)</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 4-7 เซ็ต (กลาง)</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> 8-12 เซ็ต (หนัก)</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> 13+ เซ็ต (สูงสุด)</div>
            </div>
        `;
    } else if (AppState.colorMode === 'recovery') {
        legendContainer.innerHTML = `
            <div class="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300">
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> &lt;35% ล้าหนัก</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 35-70% กำลังฟื้นตัว</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-sky-500 inline-block"></span> 70-95% เกือบพร้อม</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> 100% พร้อมฝึกเต็มที่</div>
            </div>
        `;
    } else if (AppState.colorMode === 'landmarks') {
        legendContainer.innerHTML = `
            <div class="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300">
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-sky-400 inline-block"></span> &lt; MEV (คงสภาพ)</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> MEV-MAV (เติบโตดีเยี่ยม)</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> MAV-MRV (หนักใกล้ลิมิต)</div>
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> &gt; MRV (เสี่ยงล้าสะสม)</div>
            </div>
        `;
    }
}

// Tooltip Logic
function showTooltip(e, muscleKey) {
    const tooltip = document.getElementById('muscle-tooltip');
    const data = AppState.stats.muscles?.[muscleKey];
    if (!tooltip || !data) return;

    document.getElementById('tooltip-title').textContent = `${data.name_th} (${data.name_en})`;
    document.getElementById('tooltip-sets').textContent = `${data.effective_volume} Effective Sets (${data.raw_sets} Raw)`;
    document.getElementById('tooltip-recovery').textContent = `การฟื้นตัว: ${data.recovery_percent}% ${data.hours_remaining > 0 ? `(เหลือ ~${data.hours_remaining} ชม.)` : '✨ พร้อมฝึก'}`;
    document.getElementById('tooltip-status').textContent = `สถานะ: ${data.volume_status_th}`;

    const exList = document.getElementById('tooltip-exercises');
    if (data.recent_exercises && data.recent_exercises.length > 0) {
        exList.innerHTML = data.recent_exercises.map(ex => `• ${ex}`).join('<br>');
        document.getElementById('tooltip-exercises-wrap').classList.remove('hidden');
    } else {
        document.getElementById('tooltip-exercises-wrap').classList.add('hidden');
    }

    positionTooltip(e);
    tooltip.classList.remove('opacity-0', 'pointer-events-none');
}

function positionTooltip(e) {
    const tooltip = document.getElementById('muscle-tooltip');
    if (!tooltip) return;
    const x = e.clientX + 15;
    const y = e.clientY + 15;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

function hideTooltip() {
    const tooltip = document.getElementById('muscle-tooltip');
    if (tooltip) {
        tooltip.classList.add('opacity-0', 'pointer-events-none');
    }
}

function selectMuscleDrilldown(muscleKey) {
    AppState.selectedMuscleKey = muscleKey;
    const targetCard = document.getElementById(`muscle-card-${muscleKey}`);
    if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('ring-2', 'ring-sky-400');
        setTimeout(() => targetCard.classList.remove('ring-2', 'ring-sky-400'), 2000);
    }
}

// Summary Metrics Bar
function renderSummaryStats() {
    const summary = AppState.stats.summary || {};
    document.getElementById('stat-total-sets').textContent = summary.total_sets || 0;
    document.getElementById('stat-active-muscles').textContent = summary.active_muscle_count || 0;
    document.getElementById('stat-total-volume').textContent = (summary.total_volume_kg || 0).toLocaleString() + ' kg';
    document.getElementById('stat-total-logs').textContent = `${summary.total_logs || 0} รายการ`;
}

// Render Muscle Detail Cards Grid
function renderMuscleCards() {
    const container = document.getElementById('muscle-cards-container');
    if (!container) return;

    const muscles = Object.values(AppState.stats.muscles || {});
    if (muscles.length === 0) return;

    muscles.sort((a, b) => b.effective_volume - a.effective_volume);

    container.innerHTML = muscles.map(m => {
        const pct = Math.min(100, Math.round((m.effective_volume / m.mrv) * 100));

        let badgeBg = 'bg-slate-800 text-slate-300';
        if (m.effective_volume > 0) {
            if (m.effective_volume >= m.mrv) badgeBg = 'bg-red-500/20 text-red-400 border border-red-500/40';
            else if (m.effective_volume >= m.mav) badgeBg = 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
            else if (m.effective_volume >= m.mev) badgeBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
            else badgeBg = 'bg-sky-500/20 text-sky-400 border border-sky-500/40';
        }

        return `
            <div id="muscle-card-${m.key}" class="glass-card glass-card-hover rounded-xl p-4 transition-all">
                <div class="flex items-start justify-between">
                    <div>
                        <h4 class="font-bold text-slate-100 text-sm md:text-base">${m.name_th}</h4>
                        <p class="text-xs text-slate-400 font-mono">${m.name_en}</p>
                    </div>
                    <span class="px-2 py-0.5 text-xs font-semibold rounded-md ${badgeBg}">
                        ${m.effective_volume} Sets
                    </span>
                </div>

                <!-- Progress Volume Landmark Bar -->
                <div class="mt-3">
                    <div class="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>เป้าหมาย MEV: ${m.mev} | MAV: ${m.mav} | MRV: ${m.mrv}</span>
                        <span class="font-bold text-slate-200">${m.volume_status_th}</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
                        <div class="h-full rounded-full transition-all duration-500" 
                             style="width: ${pct}%; background-color: ${m.heatmap_color || '#38bdf8'}"></div>
                    </div>
                </div>

                <!-- Recovery & Last Worked -->
                <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full ${m.recovery_percent === 100 ? 'bg-emerald-400' : m.recovery_percent >= 50 ? 'bg-amber-400' : 'bg-red-400'}"></span>
                        <span class="text-slate-300">ฟื้นตัว ${m.recovery_percent}%</span>
                    </div>
                    <span class="text-slate-400 text-[11px]">
                        ${m.hours_since_workout !== null ? `เล่นเมื่อ ${m.hours_since_workout} ชม.ที่แล้ว` : 'ยังไม่มีประวัติ'}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Render Workout History Log Table
function renderLogsHistory() {
    const tbody = document.getElementById('workout-logs-tbody');
    const emptyState = document.getElementById('workout-logs-empty');
    if (!tbody) return;

    if (!AppState.logs || AppState.logs.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = AppState.logs.map(log => {
        return `
            <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition text-xs">
                <td class="py-3 px-4 text-slate-400 whitespace-nowrap">
                    ${formatDate(log.logged_at)}
                </td>
                <td class="py-3 px-4 font-medium text-sky-400 whitespace-nowrap">
                    <div>${log.day_title}</div>
                    <span class="text-[10px] text-slate-400 font-mono">${log.day_real_date ? formatRealDate(log.day_real_date) : ''}</span>
                </td>
                <td class="py-3 px-4 font-semibold text-slate-200">
                    <div>${log.exercise_name_th || log.exercise_name}</div>
                    <span class="text-[11px] text-slate-400 font-normal">${log.exercise_name}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded font-medium">${log.category}</span>
                </td>
                <td class="py-3 px-4 text-center font-bold text-sky-400">
                    ${log.sets}
                </td>
                <td class="py-3 px-4 text-center text-slate-300 font-mono">
                    ${log.reps}
                </td>
                <td class="py-3 px-4 text-center text-slate-300 font-mono">
                    ${log.weight > 0 ? log.weight + ' kg' : '-'}
                </td>
                <td class="py-3 px-4 text-center text-amber-400 font-mono">
                    ${log.rpe || '-'}
                </td>
                <td class="py-3 px-4 text-right">
                    <button onclick="deleteWorkoutLog(${log.id})" class="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded transition">
                        <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Delete Log Function
window.deleteWorkoutLog = async function(id) {
    if (!confirm('ต้องการลบรายการฝึกนี้ใช่หรือไม่?')) return;
    try {
        const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('ลบรายการสำเร็จ');
            await loadWeeksAndInit();
        }
    } catch (err) {
        console.error('Failed to delete log:', err);
    }
};

// Delete Day Function
window.deleteDay = async function(dayId) {
    if (!confirm('คุณต้องการลบวันฝึกนี้และรายการฝึกทั้งหมดในวันนี้หรือไม่?')) return;
    try {
        const res = await fetch(`/api/days/${dayId}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('ลบวันฝึกเรียบร้อยแล้ว');
            if (AppState.selectedDayId === dayId) AppState.selectedDayId = null;
            await loadWeeksAndInit();
        }
    } catch (err) {
        console.error('Failed to delete day:', err);
    }
};

// Open Edit Day Modal
window.openEditDayModal = function(dayId) {
    const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
    if (!currentWeek) return;
    const day = currentWeek.days.find(d => d.id === dayId);
    if (!day) return;

    document.getElementById('input-day-id').value = day.id;
    document.getElementById('input-day-title').value = day.title;
    document.getElementById('input-day-realdate').value = day.real_date || new Date().toISOString().split('T')[0];
    document.getElementById('input-day-notes').value = day.notes || '';
    document.getElementById('day-modal-title').textContent = 'แก้ไขข้อมูลวันฝึก';
    document.getElementById('day-form-submit-btn').textContent = 'บันทึกการแก้ไข';
    
    document.getElementById('day-modal')?.classList.remove('hidden');
};

// --- Modals Management ---

function initModalControls() {
    // 1. Custom Exercise Modal
    const exModal = document.getElementById('custom-exercise-modal');
    const openExBtn = document.getElementById('btn-open-custom-modal');
    const closeExBtn = document.getElementById('btn-close-custom-modal');
    const exForm = document.getElementById('custom-exercise-form');

    if (openExBtn && exModal) openExBtn.addEventListener('click', () => exModal.classList.remove('hidden'));
    if (closeExBtn && exModal) closeExBtn.addEventListener('click', () => exModal.classList.add('hidden'));

    if (exForm) {
        exForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('custom-ex-name').value;
            const nameTh = document.getElementById('custom-ex-nameth').value;
            const category = document.getElementById('custom-ex-category').value;
            const primary = Array.from(document.querySelectorAll('input[name="custom-primary"]:checked')).map(cb => cb.value);
            const secondary = Array.from(document.querySelectorAll('input[name="custom-secondary"]:checked')).map(cb => cb.value);

            if (primary.length === 0) {
                alert('กรุณาเลือกกล้ามเนื้อมัดหลักอย่างน้อย 1 มัด');
                return;
            }

            const payload = {
                id: 'custom_' + Date.now(),
                name,
                name_th: nameTh || name,
                category,
                primary,
                secondary
            };

            const res = await fetch('/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast('เพิ่มท่าออกกำลังกายใหม่แล้ว!');
                exModal.classList.add('hidden');
                exForm.reset();
                await loadExercises();
            }
        });
    }

    // 2. Add Week Modal
    const weekModal = document.getElementById('add-week-modal');
    const openWeekBtn = document.getElementById('btn-add-week-modal');
    const closeWeekBtn = document.getElementById('btn-close-week-modal');
    const weekForm = document.getElementById('add-week-form');

    if (openWeekBtn && weekModal) openWeekBtn.addEventListener('click', () => weekModal.classList.remove('hidden'));
    if (closeWeekBtn && weekModal) closeWeekBtn.addEventListener('click', () => weekModal.classList.add('hidden'));

    if (weekForm) {
        weekForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('input-week-title').value;
            const res = await fetch('/api/weeks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });

            if (res.ok) {
                const newWeek = await res.json();
                showToast(`สร้าง "${newWeek.title}" เรียบร้อยแล้ว! ✨`);
                weekModal.classList.add('hidden');
                weekForm.reset();
                AppState.selectedWeekId = newWeek.id;
                AppState.selectedDayId = null;
                await loadWeeksAndInit();
            }
        });
    }

    // 3. Add / Edit Day Modal
    const dayModal = document.getElementById('day-modal');
    const openDayBtn = document.getElementById('btn-add-day-modal');
    const emptyAddDayBtn = document.getElementById('btn-empty-add-day');
    const closeDayBtn = document.getElementById('btn-close-day-modal');
    const dayForm = document.getElementById('day-form');

    const openNewDayModal = () => {
        if (!AppState.selectedWeekId) {
            alert('กรุณาสร้างสัปดาห์ก่อน');
            return;
        }
        document.getElementById('input-day-id').value = '';
        const currentWeek = AppState.weeks.find(w => w.id === AppState.selectedWeekId);
        const nextDayNum = (currentWeek?.days?.length || 0) + 1;
        document.getElementById('input-day-title').value = `วันที่ ${nextDayNum}`;
        document.getElementById('input-day-realdate').value = new Date().toISOString().split('T')[0];
        document.getElementById('input-day-notes').value = '';
        document.getElementById('day-modal-title').textContent = 'เพิ่มวันฝึกใหม่ (Add Workout Day)';
        document.getElementById('day-form-submit-btn').textContent = 'บันทึกวันฝึก';
        dayModal.classList.remove('hidden');
    };

    if (openDayBtn && dayModal) openDayBtn.addEventListener('click', openNewDayModal);
    if (emptyAddDayBtn && dayModal) emptyAddDayBtn.addEventListener('click', openNewDayModal);
    if (closeDayBtn && dayModal) closeDayBtn.addEventListener('click', () => dayModal.classList.add('hidden'));

    if (dayForm) {
        dayForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dayId = document.getElementById('input-day-id').value;
            const title = document.getElementById('input-day-title').value;
            const realDate = document.getElementById('input-day-realdate').value;
            const notes = document.getElementById('input-day-notes').value;

            if (dayId) {
                // Update existing day
                const res = await fetch(`/api/days/${dayId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, real_date: realDate, notes })
                });
                if (res.ok) {
                    showToast('อัปเดตวันฝึกสำเร็จ! ✨');
                    dayModal.classList.add('hidden');
                    await loadWeeksAndInit();
                }
            } else {
                // Create new day
                const res = await fetch('/api/days', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        week_id: AppState.selectedWeekId,
                        title,
                        real_date: realDate,
                        notes
                    })
                });
                if (res.ok) {
                    const newDay = await res.json();
                    showToast(`เพิ่ม "${newDay.title}" เรียบร้อยแล้ว! 🏋️`);
                    dayModal.classList.add('hidden');
                    AppState.selectedDayId = newDay.id;
                    AppState.logTargetDayId = newDay.id;
                    await loadWeeksAndInit();
                }
            }
        });
    }
}

// --- Helpers ---

function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'fixed bottom-6 right-6 z-50 bg-sky-600 text-white px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 font-medium text-sm flex items-center gap-2';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
    }, 2800);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr.replace(' ', 'T'));
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    } catch {
        return dateStr;
    }
}

function formatRealDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const day = parseInt(parts[2]);
            const monthIdx = parseInt(parts[1]) - 1;
            const year = parseInt(parts[0]) + 543; // Buddhist era or standard
            return `${day} ${months[monthIdx]} ${parts[0]}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

