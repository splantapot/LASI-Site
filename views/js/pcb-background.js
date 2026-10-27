class PcbBackground extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.seed = Date.now();
        this.resizeTimeout = null;
        this.animFrameId = null;

        // Métricas do FPS
        this.frameCount = 0;
        this.fps = 0;
        this.fpsLastUpdate = performance.now();

        // Canvas
        this.canvasStatic = document.createElement('canvas');
        this.canvasAnim = document.createElement('canvas');
        this.ctxStatic = this.canvasStatic.getContext('2d');
        this.ctxAnim = this.canvasAnim.getContext('2d');

        // Grid e Coleções
        this.gridSize = 20;
        this.connectionPoints = [];
        
        // Estruturas de Animação
        this.animatedTraces = [];
        this.animatedLeds = [];
        this.animatedIcs = [];
    }

    static get observedAttributes() {
        return ['color', 'devmode', 'seed'];
    }

    get devmode() {
        return this.hasAttribute('devmode');
    }

    set devmode(val) {
        if (val) this.setAttribute('devmode', '');
        else this.removeAttribute('devmode');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            if (name === 'seed') {
                this.seed = Number(newValue) || Date.now();
            }
            this.handleResize();
        }
    }

    connectedCallback() {
        this.setupShadowDom();

        this.resizeObserver = new ResizeObserver(() => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.handleResize(), 150);
        });
        this.resizeObserver.observe(document.documentElement);

        this.handleResize();
        this.startAnimationLoop();
    }

    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        this.stopAnimationLoop();
    }

    setupShadowDom() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: -9999 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                pointer-events: none !important;
                display: block !important;
                background-color: var(--pcb-bg, #0a0d14);
            }
            canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: block;
            }
        `;

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.canvasStatic);
        this.shadowRoot.appendChild(this.canvasAnim);
    }

    createRandomGenerator(seed) {
        return function() {
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            return seed / 4294967296;
        };
    }

    getResolvedColor() {
        const attrColor = this.getAttribute('color') || '#00f3ff';
        if (attrColor.startsWith('var(')) {
            const varName = attrColor.replace(/var\((--[^,\)]+).*\)/, '$1').trim();
            const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            return resolved || '#00f3ff';
        }
        return attrColor;
    }

    handleResize() {
        const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        const dpr = window.devicePixelRatio || 1;

        this.width = width;
        this.height = height;

        this.canvasStatic.width = width * dpr;
        this.canvasStatic.height = height * dpr;
        this.ctxStatic.scale(dpr, dpr);

        this.canvasAnim.width = width * dpr;
        this.canvasAnim.height = height * dpr;
        this.ctxAnim.scale(dpr, dpr);

        this.renderStaticLayer();
    }

    isAreaFree(grid, c, r, wSlots, hSlots, cols, rows) {
        for (let i = 0; i < wSlots; i++) {
            for (let j = 0; j < hSlots; j++) {
                if (c + i >= cols || r + j >= rows || grid[c + i][r + j]) {
                    return false;
                }
            }
        }
        return true;
    }

    occupyArea(grid, c, r, wSlots, hSlots) {
        for (let i = 0; i < wSlots; i++) {
            for (let j = 0; j < hSlots; j++) {
                grid[c + i][r + j] = true;
            }
        }
    }

    // -----------------------------------------------------------------
    // DESENHO ESTÁTICO
    // -----------------------------------------------------------------
    renderStaticLayer() {
        const ctx = this.ctxStatic;
        const width = this.width;
        const height = this.height;
        const random = this.createRandomGenerator(this.seed);
        const strokeColor = this.getResolvedColor();

        ctx.clearRect(0, 0, width, height);

        const gridSize = this.gridSize;
        const halfGrid = gridSize / 2;
        const cols = Math.floor(width / gridSize);
        const rows = Math.floor(height / gridSize);

        const grid = Array(cols).fill(null).map(() => Array(rows).fill(false));
        this.connectionPoints = [];
        this.animatedTraces = [];
        this.animatedLeds = [];
        this.animatedIcs = [];

        // 1. CIs
        for (let c = 2; c < cols - 4; c += 5) {
            for (let r = 2; r < rows - 4; r += 5) {
                if (grid[c][r]) continue;

                if (random() < 0.08) {
                    const icType = Math.floor(random() * 3);
                    let blockWidthSlots, blockHeightSlots;

                    if (icType === 0) {
                        blockWidthSlots = 2;
                        blockHeightSlots = Math.floor(random() * 3) + 3;
                    } else if (icType === 1) {
                        blockWidthSlots = 3;
                        blockHeightSlots = Math.floor(random() * 3) + 3;
                    } else {
                        const quadSize = Math.floor(random() * 2) + 3;
                        blockWidthSlots = quadSize;
                        blockHeightSlots = quadSize;
                    }

                    if (this.isAreaFree(grid, c, r, blockWidthSlots, blockHeightSlots, cols, rows)) {
                        this.occupyArea(grid, c, r, blockWidthSlots, blockHeightSlots);
                        this.drawIntegratedCircuit(ctx, c, r, blockWidthSlots, blockHeightSlots, icType, strokeColor, random);
                    }
                }
            }
        }

        // 2. HEADER PINS
        for (let c = 1; c < cols - 5; c += 6) {
            for (let r = 1; r < rows - 2; r += 5) {
                if (grid[c][r]) continue;

                if (random() < 0.05) {
                    const pinCount = Math.floor(random() * 3) + 3;
                    if (this.isAreaFree(grid, c, r, pinCount, 1, cols, rows)) {
                        this.occupyArea(grid, c, r, pinCount, 1);
                        this.drawHeaderPins(ctx, c, r, pinCount, strokeColor);
                    }
                }
            }
        }

        // 3. DIP SWITCH
        for (let c = 2; c < cols - 4; c += 6) {
            for (let r = 2; r < rows - 3; r += 6) {
                if (grid[c][r]) continue;

                if (random() < 0.04) {
                    const switchSlots = 3;
                    if (this.isAreaFree(grid, c, r, switchSlots, 2, cols, rows)) {
                        this.occupyArea(grid, c, r, switchSlots, 2);
                        this.drawDipSwitch(ctx, c, r, switchSlots, random, strokeColor);
                    }
                }
            }
        }

        // 4. TRANSISTOR SOT-23
        for (let c = 1; c < cols - 3; c += 4) {
            for (let r = 1; r < rows - 3; r += 4) {
                if (grid[c][r]) continue;

                if (random() < 0.06) {
                    if (this.isAreaFree(grid, c, r, 2, 2, cols, rows)) {
                        this.occupyArea(grid, c, r, 2, 2);
                        this.drawTransistorSot23(ctx, c, r, strokeColor);
                    }
                }
            }
        }

        // 5. LED SMD
        for (let c = 2; c < cols - 3; c += 4) {
            for (let r = 2; r < rows - 3; r += 4) {
                if (grid[c][r]) continue;

                if (random() < 0.08) {
                    const isHorizontal = random() > 0.5;
                    const wSlots = isHorizontal ? 2 : 1;
                    const hSlots = isHorizontal ? 1 : 2;

                    if (this.isAreaFree(grid, c, r, wSlots, hSlots, cols, rows)) {
                        this.occupyArea(grid, c, r, wSlots, hSlots);
                        this.drawLedSmd(ctx, c, r, isHorizontal, strokeColor, random);
                    }
                }
            }
        }

        // 6. CAPACITOR SMD
        for (let c = 1; c < cols - 3; c += 4) {
            for (let r = 1; r < rows - 3; r += 4) {
                if (grid[c][r]) continue;

                if (random() < 0.07) {
                    const isHorizontal = random() > 0.5;
                    const wSlots = isHorizontal ? 2 : 1;
                    const hSlots = isHorizontal ? 1 : 2;

                    if (this.isAreaFree(grid, c, r, wSlots, hSlots, cols, rows)) {
                        this.occupyArea(grid, c, r, wSlots, hSlots);
                        this.drawCapacitorSmd(ctx, c, r, isHorizontal, strokeColor);
                    }
                }
            }
        }

        // 7. CRISTAL OSCILADOR
        for (let c = 3; c < cols - 3; c += 6) {
            for (let r = 3; r < rows - 3; r += 6) {
                if (grid[c][r]) continue;

                if (random() < 0.04) {
                    if (this.isAreaFree(grid, c, r, 2, 1, cols, rows)) {
                        this.occupyArea(grid, c, r, 2, 1);
                        this.drawCrystalOscillator(ctx, c, r, strokeColor);
                    }
                }
            }
        }

        // 8. ROTEAMENTO DE TRILHAS
        this.connectionPoints.forEach(pt => {
            const dirX = random() > 0.5 ? (random() > 0.5 ? 1 : -1) : 0;
            const dirY = dirX === 0 ? (random() > 0.5 ? 1 : -1) : 0;
            this.drawTrilhaAt(ctx, pt.c, pt.r, dirX, dirY, gridSize, halfGrid, random, grid, cols, rows, strokeColor);
        });

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                if (!grid[c][r] && random() < 0.08) {
                    const dirX = random() > 0.5 ? (random() > 0.5 ? 1 : -1) : 0;
                    const dirY = dirX === 0 ? (random() > 0.5 ? 1 : -1) : 0;
                    this.drawTrilhaAt(ctx, c, r, dirX, dirY, gridSize, halfGrid, random, grid, cols, rows, strokeColor);
                }
            }
        }
    }

    drawIntegratedCircuit(ctx, c, r, wSlots, hSlots, icType, strokeColor, random) {
        const gridSize = this.gridSize;
        const halfGrid = gridSize / 2;
        const x = c * gridSize;
        const y = r * gridSize;
        const w = wSlots * gridSize;
        const h = hSlots * gridSize;

        const padMargin = 4;
        const bodyX = x + padMargin;
        const bodyY = y + padMargin;
        const bodyW = w - (padMargin * 2);
        const bodyH = h - (padMargin * 2);

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();

        const pins = [];

        for (let rowIdx = 0; rowIdx < hSlots; rowIdx++) {
            const pinY = y + (rowIdx * gridSize) + halfGrid;
            ctx.moveTo(x, pinY);
            ctx.lineTo(bodyX, pinY);
            ctx.moveTo(bodyX + bodyW, pinY);
            ctx.lineTo(x + w, pinY);

            pins.push({ x: bodyX, y: pinY });
            pins.push({ x: bodyX + bodyW, y: pinY });

            this.connectionPoints.push({ c: c, r: r + rowIdx });
            this.connectionPoints.push({ c: c + wSlots - 1, r: r + rowIdx });
        }

        if (icType !== 0) {
            for (let colIdx = 0; colIdx < wSlots; colIdx++) {
                const pinX = x + (colIdx * gridSize) + halfGrid;
                ctx.moveTo(pinX, y);
                ctx.lineTo(pinX, bodyY);
                ctx.moveTo(pinX, bodyY + bodyH);
                ctx.lineTo(pinX, y + h);

                pins.push({ x: pinX, y: bodyY });
                pins.push({ x: pinX, y: bodyY + bodyH });

                this.connectionPoints.push({ c: c + colIdx, r: r });
                this.connectionPoints.push({ c: c + colIdx, r: r + hSlots - 1 });
            }
        }
        ctx.stroke();

        ctx.fillStyle = '#161b22';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') ctx.roundRect(bodyX, bodyY, bodyW, bodyH, 2);
        else ctx.rect(bodyX, bodyY, bodyW, bodyH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(bodyX + 5, bodyY + 5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (icType === 0) {
            ctx.fillStyle = '#161b22';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bodyX + (bodyW / 2), bodyY, 3, 0, Math.PI, false);
            ctx.fill();
            ctx.stroke();
        }

        this.animatedIcs.push({
            pins: pins,
            pulseTime: random() * 100,
            pulseSpeed: 0.03 + random() * 0.05
        });

        ctx.restore();
    }

    drawHeaderPins(ctx, c, r, pinCount, strokeColor) {
        const gridSize = this.gridSize;
        const halfGrid = gridSize / 2;

        ctx.save();
        for (let p = 0; p < pinCount; p++) {
            const px = (c + p) * gridSize + halfGrid;
            const py = r * gridSize + halfGrid;

            ctx.fillStyle = '#161b22';
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.fillRect(px - 4, py - 4, 8, 8);
            ctx.strokeRect(px - 4, py - 4, 8, 8);

            ctx.fillStyle = strokeColor;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();

            this.connectionPoints.push({ c: c + p, r: r });
        }
        ctx.restore();
    }

    drawDipSwitch(ctx, c, r, switchSlots, random, strokeColor) {
        const gridSize = this.gridSize;
        const startX = c * gridSize;
        const startY = r * gridSize;
        const w = switchSlots * gridSize;
        const h = 2 * gridSize;

        ctx.save();
        ctx.fillStyle = '#161b22';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') ctx.roundRect(startX + 2, startY + 2, w - 4, h - 4, 2);
        else ctx.rect(startX + 2, startY + 2, w - 4, h - 4);
        ctx.fill();
        ctx.stroke();

        for (let s = 0; s < switchSlots; s++) {
            const swX = startX + (s * gridSize) + 5;
            const isOn = random() > 0.5;

            ctx.fillStyle = '#0b0f19';
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 0.8;
            ctx.fillRect(swX, startY + 6, 10, 28);
            ctx.strokeRect(swX, startY + 6, 10, 28);

            ctx.fillStyle = strokeColor;
            const knobY = isOn ? startY + 8 : startY + 20;
            ctx.fillRect(swX + 2, knobY, 6, 10);

            this.connectionPoints.push({ c: c + s, r: r });
            this.connectionPoints.push({ c: c + s, r: r + 1 });
        }
        ctx.restore();
    }

    drawTransistorSot23(ctx, c, r, strokeColor) {
        const gridSize = this.gridSize;
        const halfGrid = gridSize / 2;
        const startX = c * gridSize + halfGrid;
        const startY = r * gridSize + halfGrid;

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(startX, startY - 6);
        ctx.lineTo(startX, startY + 6);
        ctx.moveTo(startX + 12, startY);
        ctx.lineTo(startX + 20, startY);
        ctx.stroke();

        ctx.fillStyle = '#161b22';
        ctx.fillRect(startX - 3, startY - 8, 10, 16);
        ctx.strokeRect(startX - 3, startY - 8, 10, 16);

        ctx.fillStyle = strokeColor;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(startX + 7, startY - 5, 3, 10);

        this.connectionPoints.push({ c: c, r: r });
        this.connectionPoints.push({ c: c + 1, r: r });
        ctx.restore();
    }

    drawLedSmd(ctx, c, r, isHorizontal, strokeColor, random) {
        const gridSize = this.gridSize;
        const halfGrid = gridSize / 2;
        const startX = c * gridSize + halfGrid;
        const startY = r * gridSize + halfGrid;
        const wSlots = isHorizontal ? 2 : 1;
        const hSlots = isHorizontal ? 1 : 2;
        const endX = (c + wSlots - 1) * gridSize + halfGrid;
        const endY = (r + hSlots - 1) * gridSize + halfGrid;

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;

        let chipX, chipY;

        if (isHorizontal) {
            const midX = (startX + endX) / 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(midX - 7, startY);
            ctx.moveTo(midX + 7, startY);
            ctx.lineTo(endX, startY);
            ctx.stroke();

            ctx.fillStyle = '#161b22';
            ctx.fillRect(midX - 7, startY - 4, 14, 8);
            ctx.strokeRect(midX - 7, startY - 4, 14, 8);

            ctx.fillStyle = strokeColor;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(midX - 7, startY - 4, 3, 8);
            ctx.fillRect(midX + 4, startY - 4, 3, 8);

            chipX = midX - 2.5;
            chipY = startY - 2.5;
        } else {
            const midY = (startY + endY) / 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, midY - 7);
            ctx.moveTo(startX, midY + 7);
            ctx.lineTo(startX, endY);
            ctx.stroke();

            ctx.fillStyle = '#161b22';
            ctx.fillRect(startX - 4, midY - 7, 8, 14);
            ctx.strokeRect(startX - 4, midY - 7, 8, 14);

            ctx.fillStyle = strokeColor;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(startX - 4, midY - 7, 8, 3);
            ctx.fillRect(startX - 4, midY + 4, 8, 3);

            chipX = startX - 2.5;
            chipY = midY - 2.5;
        }

        this.animatedLeds.push({
            x: chipX,
            y: chipY,
            speed: 0.02 + random() * 0.04,
            phase: random() * Math.PI * 2
        });

        this.connectionPoints.push({ c: c, r: r });
        this.connectionPoints.push({ c: c + (isHorizontal ? 1 : 0), r: r + (isHorizontal ? 0 : 1) });
        ctx.restore();
    }

    drawCapacitorSmd(ctx, c, r, isHorizontal, strokeColor) {
        const gridSize = this.gridSize;
        const halfGrid = gridSize / 2;
        const startX = c * gridSize + halfGrid;
        const startY = r * gridSize + halfGrid;
        const wSlots = isHorizontal ? 2 : 1;
        const hSlots = isHorizontal ? 1 : 2;
        const endX = (c + wSlots - 1) * gridSize + halfGrid;
        const endY = (r + hSlots - 1) * gridSize + halfGrid;

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;

        if (isHorizontal) {
            const midX = (startX + endX) / 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, startY);
            ctx.stroke();

            ctx.fillStyle = '#161b22';
            ctx.fillRect(midX - 6, startY - 4, 12, 8);
            ctx.strokeRect(midX - 6, startY - 4, 12, 8);

            ctx.fillStyle = strokeColor;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(midX - 6, startY - 4, 3.5, 8);
            ctx.fillRect(midX + 2.5, startY - 4, 3.5, 8);
        } else {
            const midY = (startY + endY) / 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, endY);
            ctx.stroke();

            ctx.fillStyle = '#161b22';
            ctx.fillRect(startX - 4, midY - 6, 8, 12);
            ctx.strokeRect(startX - 4, midY - 6, 8, 12);

            ctx.fillStyle = strokeColor;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(startX - 4, midY - 6, 8, 3.5);
            ctx.fillRect(startX - 4, midY + 2.5, 8, 3.5);
        }

        this.connectionPoints.push({ c: c, r: r });
        this.connectionPoints.push({ c: c + (isHorizontal ? 1 : 0), r: r + (isHorizontal ? 0 : 1) });
        ctx.restore();
    }

    drawCrystalOscillator(ctx, c, r, strokeColor) {
        const gridSize = this.gridSize;
        const halfGrid = gridSize / 2;
        const startX = c * gridSize + halfGrid;
        const startY = r * gridSize + halfGrid;
        const endX = (c + 1) * gridSize + halfGrid;
        const midX = (startX + endX) / 2;

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, startY);
        ctx.stroke();

        ctx.fillStyle = '#161b22';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') ctx.roundRect(midX - 10, startY - 6, 20, 12, 5);
        else ctx.rect(midX - 10, startY - 6, 20, 12);
        ctx.fill();
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(midX - 6, startY - 3);
        ctx.lineTo(midX - 6, startY + 3);
        ctx.moveTo(midX + 6, startY - 3);
        ctx.lineTo(midX + 6, startY + 3);
        ctx.stroke();

        this.connectionPoints.push({ c: c, r: r });
        this.connectionPoints.push({ c: c + 1, r: r });
        ctx.restore();
    }

    drawTrilhaAt(ctx, startC, startR, dirX, dirY, gridSize, halfGrid, random, grid, cols, rows, strokeColor) {
        const totalSteps = Math.floor(random() * 6) + 3;
        let curC = startC;
        let curR = startR;

        const gridPath = [{ c: curC, r: curR }];
        let stepsWalked = 0;

        for (let i = 0; i < totalSteps; i++) {
            const nextC = curC + dirX;
            const nextR = curR + dirY;

            if (nextC >= 0 && nextC < cols && nextR >= 0 && nextR < rows && !grid[nextC][nextR]) {
                curC = nextC;
                curR = nextR;
                grid[curC][curR] = true;

                gridPath.push({ c: curC, r: curR });
                stepsWalked++;

                if (random() < 0.35) {
                    if (dirX !== 0) {
                        dirY = random() > 0.5 ? 1 : -1;
                        dirX = 0;
                    } else {
                        dirX = random() > 0.5 ? 1 : -1;
                        dirY = 0;
                    }
                }
            } else {
                break;
            }
        }

        if (stepsWalked === 0) return;

        const renderPoints = [];
        const chamfer = 5;

        for (let i = 0; i < gridPath.length; i++) {
            const px = gridPath[i].c * gridSize + halfGrid;
            const py = gridPath[i].r * gridSize + halfGrid;

            if (i === 0 || i === gridPath.length - 1) {
                renderPoints.push({ x: px, y: py });
            } else {
                const prevPx = gridPath[i - 1].c * gridSize + halfGrid;
                const prevPy = gridPath[i - 1].r * gridSize + halfGrid;
                const nextPx = gridPath[i + 1].c * gridSize + halfGrid;
                const nextPy = gridPath[i + 1].r * gridSize + halfGrid;

                const dirInX = Math.sign(px - prevPx);
                const dirInY = Math.sign(py - prevPy);
                const dirOutX = Math.sign(nextPx - px);
                const dirOutY = Math.sign(nextPy - py);

                if (dirInX !== dirOutX || dirInY !== dirOutY) {
                    renderPoints.push({
                        x: px - dirInX * chamfer,
                        y: py - dirInY * chamfer
                    });
                    renderPoints.push({
                        x: px + dirOutX * chamfer,
                        y: py + dirOutY * chamfer
                    });
                } else {
                    renderPoints.push({ x: px, y: py });
                }
            }
        }

        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.6;

        ctx.beginPath();
        ctx.moveTo(renderPoints[0].x, renderPoints[0].y);
        for (let p = 1; p < renderPoints.length; p++) {
            ctx.lineTo(renderPoints[p].x, renderPoints[p].y);
        }
        ctx.stroke();

        const finalPt = renderPoints[renderPoints.length - 1];
        ctx.fillStyle = strokeColor;

        if (random() < 0.3) {
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(finalPt.x, finalPt.y, 3, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.arc(finalPt.x, finalPt.y, 1, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.arc(finalPt.x, finalPt.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // -------------------------------------------------------------
        // PREPARAÇÃO PRECISA DO RASTRO PARA ANIMAÇÃO
        // -------------------------------------------------------------
        if (random() < 0.45 && renderPoints.length >= 2) {
            let totalLength = 0;
            const segments = [];

            for (let i = 1; i < renderPoints.length; i++) {
                const p1 = renderPoints[i - 1];
                const p2 = renderPoints[i];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const len = Math.hypot(dx, dy);

                if (len > 0) {
                    segments.push({ p1, p2, dx, dy, len, startDist: totalLength });
                    totalLength += len;
                }
            }

            if (totalLength > 10) {
                this.animatedTraces.push({
                    segments,
                    totalLength,
                    progress: random(),
                    speed: 0.8 + random() * 1.2, // Pixels por frame
                    isReverse: random() > 0.5
                });
            }
        }
    }

    // -----------------------------------------------------------------
    // LOOP DE ANIMAÇÃO DINÂMICA
    // -----------------------------------------------------------------
    startAnimationLoop() {
        const loop = (timestamp) => {
            this.updateFps(timestamp);
            this.renderDynamicLayer();
            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);
    }

    stopAnimationLoop() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    updateFps(now) {
        this.frameCount++;
        if (now - this.fpsLastUpdate >= 500) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.fpsLastUpdate));
            this.frameCount = 0;
            this.fpsLastUpdate = now;
        }
    }

    renderDynamicLayer() {
        const ctx = this.ctxAnim;
        const width = this.width;
        const height = this.height;
        const strokeColor = this.getResolvedColor();

        ctx.clearRect(0, 0, width, height);

        // 1. Pulso Elétrico Fluido nas Trilhas
        this.animateTraceFlows(ctx, strokeColor);

        // 2. Piscar de LEDs SMD
        this.animateLeds(ctx, strokeColor);

        // 3. Atividade nos CIs
        this.animateIcPulses(ctx, strokeColor);

        // 4. DevMode
        if (this.devmode) {
            this.renderDevGrid(ctx, width, height);
            this.renderDevFps(ctx, height);
        }
    }

    // -----------------------------------------------------------------
    // SISTEMA DE PARTÍCULAS / FLUXO DE ENERGIA CORRIGIDO
    // -----------------------------------------------------------------
    animateTraceFlows(ctx, strokeColor) {
        ctx.save();

        this.animatedTraces.forEach(trace => {
            // Avança a posição em pixels
            trace.progress += trace.speed;
            if (trace.progress > trace.totalLength) {
                trace.progress = 0;
            }

            const currentDist = trace.isReverse ? trace.totalLength - trace.progress : trace.progress;
            const head = this.getPointAtDistance(trace.segments, currentDist);

            if (!head) return;

            // Desenha a cabeça brilhante (Elétron/Sinal)
            ctx.fillStyle = strokeColor;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(head.x, head.y, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Desenha o rastro suave
            const tailLength = Math.min(18, trace.totalLength * 0.4);
            const numTailDots = 5;

            for (let i = 1; i <= numTailDots; i++) {
                const offset = (i / numTailDots) * tailLength;
                const tailDist = trace.isReverse ? currentDist + offset : currentDist - offset;

                if (tailDist >= 0 && tailDist <= trace.totalLength) {
                    const tailPt = this.getPointAtDistance(trace.segments, tailDist);
                    if (tailPt) {
                        ctx.globalAlpha = 0.8 * (1 - i / numTailDots);
                        ctx.beginPath();
                        ctx.arc(tailPt.x, tailPt.y, 1.4 * (1 - (i / numTailDots) * 0.4), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        });

        ctx.restore();
    }

    getPointAtDistance(segments, dist) {
        if (dist <= 0) return { x: segments[0].p1.x, y: segments[0].p1.y };

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (dist <= seg.startDist + seg.len) {
                const segRatio = (dist - seg.startDist) / seg.len;
                return {
                    x: seg.p1.x + seg.dx * segRatio,
                    y: seg.p1.y + seg.dy * segRatio
                };
            }
        }

        const lastSeg = segments[segments.length - 1];
        return { x: lastSeg.p2.x, y: lastSeg.p2.y };
    }

    animateLeds(ctx, strokeColor) {
        ctx.save();

        this.animatedLeds.forEach(led => {
            led.phase += led.speed;
            const opacity = (Math.sin(led.phase) + 1) / 2;

            if (opacity > 0.05) {
                ctx.fillStyle = strokeColor;
                ctx.globalAlpha = opacity;
                ctx.fillRect(led.x, led.y, 5, 5);

                if (opacity > 0.5) {
                    ctx.beginPath();
                    ctx.arc(led.x + 2.5, led.y + 2.5, 5, 0, Math.PI * 2);
                    ctx.globalAlpha = (opacity - 0.5) * 0.3;
                    ctx.fill();
                }
            }
        });

        ctx.restore();
    }

    animateIcPulses(ctx, strokeColor) {
        ctx.save();
        ctx.fillStyle = strokeColor;

        this.animatedIcs.forEach(ic => {
            ic.pulseTime += ic.pulseSpeed;
            const activePinIndex = Math.floor(ic.pulseTime) % ic.pins.length;

            if (Math.sin(ic.pulseTime * 5) > 0.2) {
                const pin = ic.pins[activePinIndex];
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(pin.x, pin.y, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.restore();
    }

    // -----------------------------------------------------------------
    // DEV MODE OVERLAY
    // -----------------------------------------------------------------
    renderDevGrid(ctx, width, height) {
        const gridSize = this.gridSize;
        const cols = Math.floor(width / gridSize);
        const rows = Math.floor(height / gridSize);

        ctx.save();
        ctx.strokeStyle = '#ff0055';
        ctx.fillStyle = '#ff0055';
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = 0.35;
        ctx.font = '8px monospace';

        for (let c = 0; c <= cols; c++) {
            const x = c * gridSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            if (c % 2 === 0) {
                ctx.fillText(`C${c}`, x + 2, 9);
            }
        }

        for (let r = 0; r <= rows; r++) {
            const y = r * gridSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();

            if (r % 2 === 0) {
                ctx.fillText(`R${r}`, 2, y - 2);
            }
        }

        ctx.restore();
    }

    renderDevFps(ctx, height) {
        ctx.save();
        
        const x = 20;
        const y = height / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y - 20, 90, 40, 4);
        } else {
            ctx.rect(x, y - 20, 90, 40);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`FPS: ${this.fps}`, x + 12, y + 5);

        ctx.restore();
    }
}

customElements.define('pcb-background', PcbBackground);