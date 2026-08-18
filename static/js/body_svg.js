/**
 * BodyTag - SVG Human Anatomy Vector Models
 * Generates Anterior (Front) and Posterior (Back) SVG body maps with interactive muscle segments.
 */

const BodySVG = {
    // Generate Anterior (Front) Body SVG
    getAnteriorSVG: function() {
        return `
        <svg viewBox="0 0 320 620" class="w-full h-auto body-svg-canvas select-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="bodyBaseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#0f172a" />
                </linearGradient>
            </defs>

            <!-- Base Body Outline / Non-target areas (Head, Hands, Feet, Joints) -->
            <g class="body-base fill-slate-800/80 stroke-slate-700/60" stroke-width="1.5">
                <!-- Head & Neck Base -->
                <ellipse cx="160" cy="45" rx="26" ry="32" class="fill-slate-800 stroke-slate-700" />
                <path d="M148 76 L146 95 L174 95 L172 76 Z" class="fill-slate-800" />
                
                <!-- Collarbone reference -->
                <path d="M115 102 Q160 112 205 102" fill="none" stroke="#475569" stroke-width="1.5" />

                <!-- Hands -->
                <!-- Left Hand (anatomical right) -->
                <path d="M66 345 C64 360 62 375 66 385 C69 392 73 392 75 385 C77 375 76 360 74 345 Z" class="fill-slate-800 stroke-slate-700" />
                <!-- Right Hand (anatomical left) -->
                <path d="M254 345 C256 360 258 375 254 385 C251 392 247 392 245 385 C243 375 244 360 246 345 Z" class="fill-slate-800 stroke-slate-700" />

                <!-- Feet -->
                <path d="M120 580 L115 605 Q125 612 135 605 L132 580 Z" class="fill-slate-800 stroke-slate-700" />
                <path d="M200 580 L205 605 Q195 612 185 605 L188 580 Z" class="fill-slate-800 stroke-slate-700" />
                
                <!-- Knees Base -->
                <circle cx="128" cy="460" r="10" class="fill-slate-800/90 stroke-slate-700/80" />
                <circle cx="192" cy="460" r="10" class="fill-slate-800/90 stroke-slate-700/80" />
            </g>

            <!-- Interactive Muscle Segments -->
            <g class="muscle-segments">
                <!-- 1. FRONT DELTOIDS (ไหล่หน้า/ข้าง) -->
                <!-- Left Deltoid -->
                <path id="front-left-deltoid" data-muscle="front-deltoids" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M110 102 C95 106 82 120 80 138 C78 152 84 165 92 170 C96 155 102 135 116 122 C116 112 114 105 110 102 Z" />
                <!-- Right Deltoid -->
                <path id="front-right-deltoid" data-muscle="front-deltoids" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M210 102 C225 106 238 120 240 138 C242 152 236 165 228 170 C224 155 218 135 204 122 C204 112 206 105 210 102 Z" />

                <!-- 2. CHEST (กล้ามเนื้อหน้าอก) -->
                <!-- Left Pec -->
                <path id="front-left-chest" data-muscle="chest" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M157 114 C140 114 118 122 116 130 C114 148 118 172 135 180 C146 183 156 178 157 175 Z" />
                <!-- Right Pec -->
                <path id="front-right-chest" data-muscle="chest" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M163 114 C180 114 202 122 204 130 C206 148 202 172 185 180 C174 183 164 178 163 175 Z" />

                <!-- 3. BICEPS (กล้ามเนื้อต้นแขนด้านหน้า) -->
                <!-- Left Bicep -->
                <path id="front-left-bicep" data-muscle="biceps" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M90 172 C80 178 72 196 74 216 C76 230 84 242 90 245 C94 235 98 215 97 195 C97 182 94 175 90 172 Z" />
                <!-- Right Bicep -->
                <path id="front-right-bicep" data-muscle="biceps" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M230 172 C240 178 248 196 246 216 C244 230 236 242 230 245 C226 235 222 215 223 195 C223 182 226 175 230 172 Z" />

                <!-- 4. FOREARMS (ปลายแขน) -->
                <!-- Left Forearm -->
                <path id="front-left-forearm" data-muscle="forearms" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M87 252 C78 260 68 285 66 312 C65 328 68 340 73 344 C76 342 80 326 84 305 C88 285 92 268 91 254 Z" />
                <!-- Right Forearm -->
                <path id="front-right-forearm" data-muscle="forearms" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M233 252 C242 260 252 285 254 312 C255 328 252 340 247 344 C244 342 240 326 236 305 C232 285 228 268 229 254 Z" />

                <!-- 5. ABDOMINALS (หน้าท้อง 6-pack) -->
                <g id="front-abs-group" data-muscle="abs" class="muscle-part cursor-pointer transition-all duration-200">
                    <!-- Upper Abs -->
                    <path d="M140 188 C140 185 156 185 157 188 L157 206 C150 208 142 208 140 206 Z" />
                    <path d="M180 188 C180 185 164 185 163 188 L163 206 C170 208 178 208 180 206 Z" />
                    <!-- Mid Abs -->
                    <path d="M139 212 C142 210 156 210 157 212 L157 232 C150 234 141 234 139 232 Z" />
                    <path d="M181 212 C178 210 164 210 163 212 L163 232 C170 234 179 234 181 232 Z" />
                    <!-- Lower Abs -->
                    <path d="M140 238 C144 236 156 236 157 238 L157 262 C148 264 142 258 140 238 Z" />
                    <path d="M180 238 C176 236 164 236 163 238 L163 262 C172 264 178 258 180 238 Z" />
                </g>

                <!-- 6. OBLIQUES (หน้าท้องด้านข้าง) -->
                <!-- Left Oblique -->
                <path id="front-left-oblique" data-muscle="obliques" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M134 186 C124 200 120 225 122 250 C125 264 132 272 136 270 C134 252 135 220 137 192 Z" />
                <!-- Right Oblique -->
                <path id="front-right-oblique" data-muscle="obliques" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M186 186 C196 200 200 225 198 250 C195 264 188 272 184 270 C186 252 185 220 183 192 Z" />

                <!-- 7. QUADRICEPS (ต้นขาด้านหน้า) -->
                <!-- Left Quad -->
                <g id="front-left-quad" data-muscle="quadriceps" class="muscle-part cursor-pointer transition-all duration-200">
                    <path d="M125 285 C110 305 104 350 108 395 C111 425 116 445 125 448 C135 448 145 425 147 385 C149 350 148 310 138 285 Z" />
                </g>
                <!-- Right Quad -->
                <g id="front-right-quad" data-muscle="quadriceps" class="muscle-part cursor-pointer transition-all duration-200">
                    <path d="M195 285 C210 305 216 350 212 395 C209 425 204 445 195 448 C185 448 175 425 173 385 C171 350 172 310 182 285 Z" />
                </g>

                <!-- 8. TIBIALIS (หน้าแข้ง) -->
                <!-- Left Tibialis -->
                <path id="front-left-tibialis" data-muscle="tibialis" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M121 474 C116 492 115 525 118 558 C122 568 126 568 128 558 C132 530 134 498 132 474 Z" />
                <!-- Right Tibialis -->
                <path id="front-right-tibialis" data-muscle="tibialis" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M199 474 C204 492 205 525 202 558 C198 568 194 568 192 558 C188 530 186 498 188 474 Z" />
            </g>
        </svg>
        `;
    },

    // Generate Posterior (Back) Body SVG
    getPosteriorSVG: function() {
        return `
        <svg viewBox="0 0 320 620" class="w-full h-auto body-svg-canvas select-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="glow-back" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            <!-- Base Body Outline (Back) -->
            <g class="body-base fill-slate-800/80 stroke-slate-700/60" stroke-width="1.5">
                <!-- Head & Neck Back -->
                <ellipse cx="160" cy="45" rx="26" ry="32" class="fill-slate-800 stroke-slate-700" />
                
                <!-- Hands Back -->
                <path d="M66 345 C64 360 62 375 66 385 C69 392 73 392 75 385 C77 375 76 360 74 345 Z" class="fill-slate-800 stroke-slate-700" />
                <path d="M254 345 C256 360 258 375 254 385 C251 392 247 392 245 385 C243 375 244 360 246 345 Z" class="fill-slate-800 stroke-slate-700" />

                <!-- Feet Back -->
                <path d="M120 580 L115 605 Q125 612 135 605 L132 580 Z" class="fill-slate-800 stroke-slate-700" />
                <path d="M200 580 L205 605 Q195 612 185 605 L188 580 Z" class="fill-slate-800 stroke-slate-700" />

                <!-- Knee Backs -->
                <circle cx="128" cy="460" r="8" class="fill-slate-800/90 stroke-slate-700/80" />
                <circle cx="192" cy="460" r="8" class="fill-slate-800/90 stroke-slate-700/80" />
            </g>

            <!-- Interactive Muscle Segments (Back) -->
            <g class="muscle-segments">
                <!-- 1. TRAPEZIUS (สะบัก / หนอกคอ) -->
                <path id="back-traps" data-muscle="trapezius" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M148 76 C155 76 165 76 172 76 C176 92 195 104 212 108 C198 122 180 142 160 178 C140 142 122 122 108 108 C125 104 144 92 148 76 Z" />

                <!-- 2. REAR DELTOIDS (ไหล่หลัง) -->
                <!-- Left Rear Delt -->
                <path id="back-left-reardelt" data-muscle="back-deltoids" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M106 109 C92 114 80 126 78 142 C76 156 82 168 90 172 C93 160 100 142 114 130 C112 120 109 113 106 109 Z" />
                <!-- Right Rear Delt -->
                <path id="back-right-reardelt" data-muscle="back-deltoids" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M214 109 C228 114 240 126 242 142 C244 156 238 168 230 172 C227 160 220 142 206 130 C208 120 211 113 214 109 Z" />

                <!-- 3. TRICEPS (หลังแขน) -->
                <!-- Left Tricep -->
                <path id="back-left-tricep" data-muscle="triceps" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M89 174 C78 180 72 198 74 218 C76 234 83 245 89 248 C93 238 98 218 97 196 C96 184 93 177 89 174 Z" />
                <!-- Right Tricep -->
                <path id="back-right-tricep" data-muscle="triceps" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M231 174 C242 180 248 198 246 218 C244 234 237 245 231 248 C227 238 222 218 223 196 C224 184 227 177 231 174 Z" />

                <!-- 4. UPPER BACK / LATS (หลังส่วนบน / ปีก) -->
                <!-- Left Lat -->
                <path id="back-left-lat" data-muscle="upper-back" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M120 134 C108 152 106 185 116 220 C124 238 135 248 144 248 C144 225 146 195 158 178 C142 155 130 142 120 134 Z" />
                <!-- Right Lat -->
                <path id="back-right-lat" data-muscle="upper-back" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M200 134 C212 152 214 185 204 220 C196 238 185 248 176 248 C176 225 174 195 162 178 C178 155 190 142 200 134 Z" />

                <!-- 5. LOWER BACK (หลังส่วนล่าง / สันหลัง) -->
                <path id="back-lower" data-muscle="lower-back" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M146 215 C146 245 143 270 145 285 L175 285 C177 270 174 245 174 215 C169 220 151 220 146 215 Z" />

                <!-- 6. GLUTEAL (ก้น / สะโพก) -->
                <!-- Left Glute -->
                <path id="back-left-glute" data-muscle="gluteal" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M158 288 C140 286 118 295 115 320 C112 342 126 360 145 362 C154 362 157 340 158 315 Z" />
                <!-- Right Glute -->
                <path id="back-right-glute" data-muscle="gluteal" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M162 288 C180 286 202 295 205 320 C208 342 194 360 175 362 C166 362 163 340 162 315 Z" />

                <!-- 7. HAMSTRINGS (ต้นขาด้านหลัง) -->
                <!-- Left Hamstring -->
                <path id="back-left-hamstring" data-muscle="hamstrings" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M120 365 C112 385 110 415 114 445 C122 452 136 452 144 445 C150 415 152 385 148 365 C138 368 128 368 120 365 Z" />
                <!-- Right Hamstring -->
                <path id="back-right-hamstring" data-muscle="hamstrings" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M200 365 C208 385 210 415 206 445 C198 452 184 452 176 445 C170 415 168 385 172 365 C182 368 192 368 200 365 Z" />

                <!-- 8. CALVES (น่อง) -->
                <!-- Left Calf -->
                <path id="back-left-calf" data-muscle="calves" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M116 470 C108 495 108 530 114 555 C120 562 134 562 140 555 C144 530 144 495 138 470 C130 466 124 466 116 470 Z" />
                <!-- Right Calf -->
                <path id="back-right-calf" data-muscle="calves" class="muscle-part cursor-pointer transition-all duration-200"
                    d="M204 470 C212 495 212 530 206 555 C200 562 186 562 180 555 C176 530 176 495 182 470 C190 466 196 466 204 470 Z" />
            </g>
    }
};

BodySVG.getAnteriorView = function() { return this.getAnteriorSVG(); };
BodySVG.getPosteriorView = function() { return this.getPosteriorSVG(); };

window.BodySVG = BodySVG;
window.BodyAnatomySVG = BodySVG;
