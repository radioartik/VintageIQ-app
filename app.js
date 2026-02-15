document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const viewContainer = document.getElementById('view-container');
    const D = window.PortfolioData;

    // ──── Formatters ────
    const $ = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
    const $M = v => `$${(v / 1e6).toFixed(1)}M`;
    const $B = v => `$${(v / 1e9).toFixed(2)}B`;
    const $K = v => `$${(v / 1e3).toFixed(0)}K`;
    const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
    const pctN = (v, d = 1) => v === null || v === undefined ? '—' : `${v >= 0 ? '+' : ''}${(v * 100).toFixed(d)}%`;
    const pctCls = v => v === null || v === undefined ? 'muted' : v >= 0 ? 'positive' : 'negative';
    const fmtDate = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const fmtNum = v => v >= 1e9 ? $B(v) : v >= 1e6 ? $M(v) : v >= 1e3 ? $K(v) : $(v);
    const tip = k => { const t = D.glossary[k] || k; return `<span class="info-trigger" data-tip="${t}">ⓘ</span>`; };

    const statCard = (label, value, footer, cls = '') => `
        <div class="stat-card"><div class="stat-label">${label}</div>
        <div class="stat-value ${cls}">${value}</div>
        ${footer ? `<div class="stat-footer ${cls}">${footer}</div>` : ''}</div>`;

    const statusBadge = s => {
        const m = { Active: 'badge-positive', Exited: 'badge-warning', 'Written Off': 'badge-negative' };
        return `<span class="badge ${m[s] || ''}">${s}</span>`;
    };

    const progressBar = (label, value, max, color = 'var(--chart-1)') => `
        <div class="progress-item"><div class="progress-label"><span>${label}</span><span>${value}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(parseFloat(value), max) / max * 100}%;background:${color};"></div></div></div>`;

    // ──── SVG Line Chart ────
    const lineChart = (points, labels, h = 160, color = 'var(--chart-1)') => {
        const w = 500, pad = 4;
        const max = Math.max(...points), min = Math.min(...points), range = max - min || 1;
        const coords = points.map((p, i) => {
            const x = pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2);
            const y = pad + (1 - (p - min) / range) * (h - pad * 2);
            return [x, y, p];
        });
        const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]},${c[1]}`).join(' ');
        const area = `${line} L ${w - pad},${h} L ${pad},${h} Z`;
        const id = 'lc_' + Math.random().toString(36).substr(2, 6);
        setTimeout(() => {
            const svg = document.getElementById(id); if (!svg) return;
            const tt = document.createElement('div'); tt.className = 'chart-tooltip';
            svg.parentElement.style.position = 'relative'; svg.parentElement.appendChild(tt);
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('r', '4'); dot.setAttribute('class', 'chart-hover-point'); svg.appendChild(dot);
            svg.addEventListener('mousemove', e => {
                const rect = svg.getBoundingClientRect();
                const xPos = (e.clientX - rect.left) / rect.width * w;
                const idx = Math.round((xPos - pad) / (w - pad * 2) * (points.length - 1));
                if (idx >= 0 && idx < coords.length) {
                    const [cx, cy, val] = coords[idx];
                    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.classList.add('visible');
                    const lbl = labels ? labels[idx] : idx;
                    tt.innerHTML = `<strong>${lbl}</strong><br>${val > 99999 ? fmtNum(val) : typeof val === 'number' ? val.toFixed(1) + '%' : val}`;
                    tt.style.left = (e.clientX - rect.left + 12) + 'px'; tt.style.top = (e.clientY - rect.top - 36) + 'px';
                    tt.classList.add('visible');
                }
            });
            svg.addEventListener('mouseleave', () => { dot.classList.remove('visible'); tt.classList.remove('visible'); });
        }, 50);
        return `<svg id="${id}" viewBox="0 0 ${w} ${h}" class="svg-chart" preserveAspectRatio="none" style="height:${h}px;">
            <defs><linearGradient id="ag_${id}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.08"/>
                <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient></defs>
            <path d="${area}" fill="url(#ag_${id})"/>
            <path d="${line}" fill="none" stroke="${color}" stroke-width="2" class="svg-chart-path"/>
        </svg>`;
    };

    // ──── Bar Chart ────
    const barChart = (values, labels, h = 180) => {
        const absMax = Math.max(...values.map(Math.abs), 1);
        const hasNeg = values.some(v => v < 0);
        const id = 'bc_' + Math.random().toString(36).substr(2, 6);
        const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)'];
        setTimeout(() => {
            const el = document.getElementById(id); if (!el) return;
            const tt = document.createElement('div'); tt.className = 'chart-tooltip';
            el.style.position = 'relative'; el.appendChild(tt);
            el.querySelectorAll('[data-val]').forEach(bar => {
                bar.addEventListener('mouseenter', () => {
                    const v = parseFloat(bar.dataset.val), l = bar.dataset.lbl;
                    tt.innerHTML = `<strong>${l}</strong><br>${v >= 0 ? '+' : ''}${v.toFixed(1)}%`; tt.classList.add('visible');
                });
                bar.addEventListener('mousemove', e => {
                    const r = el.getBoundingClientRect();
                    tt.style.left = (e.clientX - r.left + 12) + 'px'; tt.style.top = (e.clientY - r.top - 36) + 'px';
                });
                bar.addEventListener('mouseleave', () => tt.classList.remove('visible'));
            });
        }, 50);
        return `<div id="${id}" style="height:${h}px;display:flex;flex-direction:column;">
            <div style="flex:${hasNeg ? 3 : 1};display:flex;align-items:flex-end;gap:4px;padding-bottom:2px;">
                ${values.map((v, i) => v < 0 ? `<div style="flex:1"></div>` :
            `<div data-val="${v}" data-lbl="${labels?.[i] || i}" style="flex:1;height:${(v / absMax) * 100}%;background:${colors[i % 8]};border-radius:3px 3px 0 0;min-height:2px;cursor:pointer;transition:opacity 0.15s;" onmouseenter="this.style.opacity='0.75'" onmouseleave="this.style.opacity='1'"></div>`
        ).join('')}
            </div>
            ${hasNeg ? `<div style="border-top:2px solid var(--border-color);flex:2;display:flex;align-items:flex-start;gap:4px;padding-top:2px;">
                ${values.map((v, i) => v >= 0 ? `<div style="flex:1"></div>` :
            `<div data-val="${v}" data-lbl="${labels?.[i] || i}" style="flex:1;height:${(Math.abs(v) / absMax) * 100}%;background:var(--negative);border-radius:0 0 3px 3px;min-height:2px;opacity:0.7;cursor:pointer;" onmouseenter="this.style.opacity='0.5'" onmouseleave="this.style.opacity='0.7'"></div>`
        ).join('')}
            </div>`: ''}
        </div>${labels ? `<div class="chart-axis">${labels.map(l => `<span>${l}</span>`).join('')}</div>` : ''}`;
    };

    // ──── Stacked Bar Chart (multi-series) ────
    const stackedBarChart = (series, labels, h = 200) => {
        // series = [ { name, values, color } ]
        const maxStack = labels.map((_, i) => series.reduce((s, sr) => s + Math.abs(sr.values[i] || 0), 0));
        const absMax = Math.max(...maxStack, 1);
        const id = 'sbc_' + Math.random().toString(36).substr(2, 6);
        setTimeout(() => {
            const el = document.getElementById(id); if (!el) return;
            const tt = document.createElement('div'); tt.className = 'chart-tooltip';
            el.style.position = 'relative'; el.appendChild(tt);
            el.querySelectorAll('[data-sval]').forEach(seg => {
                seg.addEventListener('mouseenter', () => {
                    tt.innerHTML = `<strong>${seg.dataset.slbl}</strong><br>${seg.dataset.sname}: ${seg.dataset.sval}`;
                    tt.classList.add('visible');
                });
                seg.addEventListener('mousemove', e => {
                    const r = el.getBoundingClientRect();
                    tt.style.left = (e.clientX - r.left + 12) + 'px'; tt.style.top = (e.clientY - r.top - 36) + 'px';
                });
                seg.addEventListener('mouseleave', () => tt.classList.remove('visible'));
            });
        }, 50);
        return `<div id="${id}" style="height:${h}px;display:flex;align-items:flex-end;gap:3px;padding-bottom:2px;">
            ${labels.map((lbl, i) => {
            const stack = series.map(sr => ({ name: sr.name, val: sr.values[i] || 0, color: sr.color }));
            const total = stack.reduce((s, x) => s + Math.abs(x.val), 0);
            const barH = (total / absMax) * 100;
            return `<div style="flex:1;height:${barH}%;display:flex;flex-direction:column-reverse;border-radius:3px 3px 0 0;overflow:hidden;">
                    ${stack.map(x => `<div data-sval="$${(Math.abs(x.val) / 1e6).toFixed(1)}M" data-sname="${x.name}" data-slbl="${lbl}"
                        style="height:${total > 0 ? (Math.abs(x.val) / total * 100) : 0}%;background:${x.color};cursor:pointer;transition:opacity 0.15s;min-height:${x.val > 0 ? 1 : 0}px;"
                        onmouseenter="this.style.opacity='0.75'" onmouseleave="this.style.opacity='1'"></div>`).join('')}
                </div>`;
        }).join('')}
        </div>
        <div class="chart-axis">${labels.map(l => `<span>${l}</span>`).join('')}</div>
        <div style="display:flex;gap:16px;margin-top:8px;">${series.map(sr => `<span class="legend-item"><span class="legend-dot" style="background:${sr.color}"></span>${sr.name}</span>`).join('')}</div>`;
    };

    // ──── Waterfall / Bridge Chart ────
    const waterfallChart = (items, h = 240) => {
        const id = 'wf_' + Math.random().toString(36).substr(2, 6);
        const flows = items.filter(x => x.type !== 'balance');
        const maxFlow = Math.max(...flows.map(x => Math.abs(x.value)), 1);
        const fmtVal = v => v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : '$' + (v / 1e3).toFixed(0) + 'K';
        const colorMap = { balance: 'var(--chart-1)', inflow: 'var(--positive)', gain: 'var(--chart-3)', loss: 'var(--negative)' };

        return `<div id="${id}" style="display:flex;gap:8px;align-items:stretch;height:${h}px;">
            ${items.map(item => {
            const color = colorMap[item.type] || 'var(--chart-2)';
            if (item.type === 'balance') {
                return `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;">
                        <div style="font-size:14px;font-weight:800;color:var(--text-primary);white-space:nowrap;">${fmtVal(item.value)}</div>
                        <div style="width:100%;height:60%;background:linear-gradient(180deg, ${color}22 0%, ${color}44 100%);border-radius:6px 6px 0 0;border:2px solid ${color};border-bottom:none;"></div>
                        <div style="font-size:9px;color:var(--text-muted);text-align:center;line-height:1.2;font-weight:600;">${item.label}</div>
                    </div>`;
            } else {
                const barH = Math.max((Math.abs(item.value) / maxFlow) * 75, 10);
                const sign = item.value >= 0 ? '+' : '';
                return `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;">
                        <div style="font-size:11px;font-weight:700;color:${color};white-space:nowrap;">${sign}${fmtVal(item.value)}</div>
                        <div style="width:100%;height:${barH}%;background:${color};border-radius:4px;min-height:8px;"></div>
                        <div style="font-size:9px;color:var(--text-muted);text-align:center;line-height:1.2;">${item.label}</div>
                    </div>`;
            }
        }).join('')}
        </div>
        <div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap;">
            <span class="legend-item"><span class="legend-dot" style="background:var(--chart-1)"></span>Balance</span>
            <span class="legend-item"><span class="legend-dot" style="background:var(--positive)"></span>Inflow</span>
            <span class="legend-item"><span class="legend-dot" style="background:var(--chart-3)"></span>Gains</span>
        </div>`;
    };

    const allocBar = () => `
        <div class="alloc-bar">${D.allocation.map(a => `<div class="alloc-segment" style="width:${a.pct}%;background:${a.color};" title="${a.name}: ${a.pct}%"></div>`).join('')}</div>
        <div class="alloc-legend">${D.allocation.map(a => `<div class="legend-item"><span class="legend-dot" style="background:${a.color}"></span>${a.name} (${a.pct}%)</div>`).join('')}</div>`;

    // ──── Detail Views ────
    let currentFundId = null;

    function renderFundDetail(fundId) {
        const f = D.funds.find(x => x.id === fundId);
        if (!f) return;
        currentFundId = fundId;
        const irrClass = f.irr > 0 ? 'positive' : 'negative';
        const unrealizedGain = f.nav - f.paidIn;
        const totalValue = f.nav + f.distributions;
        const totalGain = totalValue - f.paidIn;
        const navPoints = f.quarterlyNAVs.map(n => n.nav);
        const navLabels = f.quarterlyNAVs.map(n => `Q${n.quarter} ${n.year}`);
        const recentTx = f.transactions.filter(t => t.type !== 'NAV Update' && t.type !== 'Management Fee').slice(-12).reverse();

        viewContainer.innerHTML = `
            <div class="view-header"><div>
                <button class="btn btn-secondary btn-sm" id="back-btn" style="margin-bottom:12px;">← Back to Fund Holdings</button>
                <h1>${f.name}</h1>
                <div class="fund-meta">${statusBadge(f.status)}
                    <span class="meta-tag">${f.typeName}</span><span class="meta-tag">${f.strategy}</span>
                    <span class="meta-tag">Vintage ${f.vintage}</span><span class="meta-tag">${f.geography}</span></div>
            </div><div class="header-right">
                <button class="btn btn-secondary">Upload Document</button>
                <button class="btn btn-primary">Record Transaction</button></div></div>

            <div class="stats-grid">
                ${statCard('Commitment', $(f.commitment), `Unfunded: ${$M(f.unfunded)}`)}
                ${statCard('Paid-In Capital', $(f.paidIn), `${pct(f.paidIn / f.commitment)} deployed`)}
                ${statCard('Current NAV', f.status === 'Written Off' ? '$0' : $(f.nav),
            f.status === 'Exited' ? 'Fully Realized' : `Unrealized: ${unrealizedGain >= 0 ? '+' : ''}${$M(unrealizedGain)}`,
            unrealizedGain >= 0 ? 'positive' : 'negative')}
                ${statCard('Distributions', $(f.distributions), f.distributions > 0 ? 'Cash Received' : 'No distributions yet')}
            </div>
            <div class="stats-grid-3" style="margin-bottom:24px;">
                ${statCard('Net IRR', pct(f.irr), f.irr > 0.15 ? 'Top Quartile' : f.irr > 0 ? 'Median' : 'Below Median', irrClass)}
                ${statCard('Total Value', $(totalValue), `Total Gain: ${totalGain >= 0 ? '+' : ''}${$M(totalGain)}`, totalGain >= 0 ? 'positive' : 'negative')}
                ${statCard('TVPI', f.tvpi.toFixed(2) + 'x', `DPI: ${f.dpi.toFixed(2)}x | RVPI: ${f.rvpi.toFixed(2)}x`)}
            </div>

            ${navPoints.length > 2 ? `<div class="stat-card" style="margin-bottom:24px;">
                <div class="section-title">NAV History (Quarterly)</div>
                <div class="chart-container">${lineChart(navPoints, navLabels, 180, f.color)}</div></div>` : ''}

            <div class="grid-2">
                <div class="stat-card"><div class="section-title">Recent Transactions</div>
                    <table class="data-table"><thead><tr><th>Date</th><th>Type</th><th style="text-align:right">Amount</th></tr></thead>
                    <tbody>${recentTx.map(t => `<tr><td>${fmtDate(t.date)}</td>
                        <td><span class="badge ${t.type === 'Distribution' || t.type === 'Exit / Realization' ? 'badge-positive' : t.type === 'Capital Call' ? 'badge-warning' : ''}">${t.type}</span></td>
                        <td style="text-align:right" class="${t.amount > 0 ? 'positive' : 'negative'}">${t.amount > 0 ? '+' : ''}${$M(Math.abs(t.amount))}</td></tr>`).join('')}
                        ${recentTx.length === 0 ? '<tr><td colspan="3" class="muted">No transactions yet</td></tr>' : ''}
                    </tbody></table></div>
                <div class="stat-card"><div class="section-title">Documents & Files</div>
                    <div class="doc-list">${f.documents.map(doc => `<div class="doc-item">
                        <div class="doc-icon">${doc.type === 'Tax' ? '📋' : doc.type === 'Audit' ? '🔍' : '📄'}</div>
                        <div class="doc-info"><div class="doc-name">${doc.name}</div>
                        <div class="doc-date">${doc.date} · ${doc.type}</div></div></div>`).join('')}</div>
                    <div class="upload-zone" style="margin-top:16px;"><div class="upload-icon">📁</div>
                        <div class="upload-text">Drag & drop files here or <strong>browse</strong></div>
                        <div class="upload-hint">Supports PDF, CSV, XLSX</div></div></div>
            </div>`;
        document.getElementById('back-btn').addEventListener('click', () => { currentFundId = null; renderView('nav-funds'); });
    }

    function renderStockDetail(ticker) {
        const s = D.stocks.find(x => x.ticker === ticker);
        if (!s) return;
        const glClass = s.unrealizedGL >= 0 ? 'positive' : 'negative';
        const pts = s.priceHistory.map(p => p.price);
        const lbls = s.priceHistory.map(p => `Q${p.quarter} ${p.year}`);

        viewContainer.innerHTML = `
            <div class="view-header"><div>
                <button class="btn btn-secondary btn-sm" id="back-btn" style="margin-bottom:12px;">← Back to Equity Holdings</button>
                <h1>${s.ticker} — ${s.name}</h1>
                <div class="fund-meta"><span class="badge badge-positive">Active</span>
                    <span class="meta-tag">${s.sector}</span><span class="meta-tag">${s.strategy}</span>
                    <span class="meta-tag">Acquired ${s.acquired}</span></div>
            </div><div class="header-right"><button class="btn btn-primary">Trade</button></div></div>

            <div class="stats-grid">
                ${statCard('Market Value', $(s.marketValue), `${s.shares.toLocaleString()} shares @ $${s.currentPrice}`)}
                ${statCard('Cost Basis', $(s.costBasis), `Avg cost: $${s.avgCost.toFixed(2)}`)}
                ${statCard('Unrealized P&L', `${s.unrealizedGL >= 0 ? '+' : ''}${$(s.unrealizedGL)}`, pct(s.unrealizedPct), glClass)}
                ${statCard('Dividend Income', $(s.annualDividend), s.divYield > 0 ? `Yield: ${s.divYield.toFixed(2)}%` : 'Non-dividend')}
            </div>

            <div class="stat-card" style="margin-bottom:24px;">
                <div class="section-title">Price History (Quarterly)</div>
                <div class="chart-container">${lineChart(pts, lbls, 180, s.unrealizedGL >= 0 ? 'var(--positive)' : 'var(--negative)')}</div>
            </div>

            <div class="grid-2">
                <div class="stat-card"><div class="section-title">Returns by Period (Annualized)</div>
                    <table class="data-table"><thead><tr><th>Period</th><th style="text-align:right">Return</th><th>Note</th></tr></thead><tbody>
                        <tr><td><strong>YTD</strong></td><td style="text-align:right" class="${pctCls(s.returnYTD)}">${pctN(s.returnYTD)}</td><td class="muted">Q4 2024 → Q1 2025</td></tr>
                        <tr><td><strong>1 Year</strong></td><td style="text-align:right" class="${pctCls(s.return1Y)}">${pctN(s.return1Y)}</td><td class="muted">Q1 2024 → Q1 2025</td></tr>
                        <tr><td><strong>3 Year (CAGR)</strong></td><td style="text-align:right" class="${pctCls(s.return3Y)}">${pctN(s.return3Y)}</td><td class="muted">${s.return3Y !== null ? 'Annualized' : 'Held < 3 years'}</td></tr>
                        <tr><td><strong>5 Year (CAGR)</strong></td><td style="text-align:right" class="${pctCls(s.return5Y)}">${pctN(s.return5Y)}</td><td class="muted">${s.return5Y !== null ? 'Annualized' : 'Held < 5 years'}</td></tr>
                        <tr style="border-top:2px solid var(--border-color);"><td><strong>Since Inception</strong></td><td style="text-align:right" class="${pctCls(s.returnSI)}"><strong>${pctN(s.returnSI)}</strong></td><td class="muted">CAGR since ${s.acquired} (${2025 - s.acquired}yr)</td></tr>
                        <tr><td>Total Return</td><td style="text-align:right" class="${pctCls(s.totalReturn)}">${pctN(s.totalReturn)}</td><td class="muted">Cumulative, not annualized</td></tr>
                    </tbody></table></div>
                <div class="stat-card"><div class="section-title">Position & Income</div>
                    <table class="data-table"><tbody>
                        <tr><td>Shares</td><td style="text-align:right">${s.shares.toLocaleString()}</td></tr>
                        <tr><td>Current Price</td><td style="text-align:right">$${s.currentPrice.toFixed(2)}</td></tr>
                        <tr><td>Average Cost</td><td style="text-align:right">$${s.avgCost.toFixed(2)}</td></tr>
                        <tr><td>Holding Period</td><td style="text-align:right">${2025 - s.acquired} years</td></tr>
                        <tr><td>Portfolio Weight</td><td style="text-align:right">${pct(s.marketValue / D.currentAUM)}</td></tr>
                        ${s.divYield > 0 ? `
                        <tr style="border-top:2px solid var(--border-color);"><td>Dividend Yield</td><td style="text-align:right">${s.divYield.toFixed(2)}%</td></tr>
                        <tr><td>Annual Income</td><td style="text-align:right" class="positive">${$(s.annualDividend)}</td></tr>
                        <tr><td>5Y Income Est.</td><td style="text-align:right" class="positive">${$(s.annualDividend * 5)}</td></tr>
                        ` : '<tr><td colspan="2" class="muted">Non-dividend stock</td></tr>'}
                    </tbody></table></div>
            </div>`;
        document.getElementById('back-btn').addEventListener('click', () => { renderView('nav-equities'); });
    }

    // ╔══════════════════════════════════════════════╗
    // ║  ALL VIEWS                                    ║
    // ╚══════════════════════════════════════════════╝
    const views = {
        'nav-dashboard': () => `
            <div class="view-header"><h1>Portfolio Overview</h1>
                <div class="header-right"><select class="select-input"><option>As of Q1 2025</option><option>Q4 2024</option></select>
                <button class="btn btn-primary" onclick="document.getElementById('nav-report').click()">Generate Report</button></div></div>

            <div class="stats-grid">
                ${statCard(`Total AUM ${tip('NAV')}`, fmtNum(D.currentAUM), `${D.holdingCount} holdings across ${D.allocation.length} asset classes`)}
                ${statCard('Fund Commitments', $(D.totalCommitment), `${pct(D.totalPaidIn / D.totalCommitment)} deployed`)}
                ${statCard('Direct Equities', $(D.totalStockValue), `SI: ${pctN(D.eqReturnSI)} ann. | YTD: ${pctN(D.eqReturnYTD)}`, D.totalStockGL >= 0 ? 'positive' : 'negative')}
                ${statCard('Total Distributions', $(D.totalDistributions), `DPI: ${D.portfolioDPI.toFixed(2)}x`)}
            </div>

            <div class="grid-2">
                <div class="stat-card"><div class="section-title">AUM Growth — 15 Year History</div>
                    <div class="chart-container">${lineChart(D.history.yearly.map(h => h.aum), D.history.yearly.map(h => h.year))}
                        <div class="chart-axis">${D.history.yearly.filter((_, i) => i % 3 === 0 || i === D.history.yearly.length - 1).map(h => `<span>${h.year}</span>`).join('')}</div></div></div>
                <div class="stat-card"><div class="section-title">Asset Allocation</div>${allocBar()}</div>
            </div>

            <div class="grid-2" style="margin-top:0;">
                <div class="stat-card"><div class="section-title">Portfolio Metrics</div>
                    <div class="compact-stats">
                        <div class="compact-stat"><div class="stat-label">Fund IRR ${tip('IRR')}</div><div class="stat-value compact">${pct(D.portfolioIRR)}</div></div>
                        <div class="compact-stat"><div class="stat-label">TVPI ${tip('TVPI')}</div><div class="stat-value compact">${D.portfolioTVPI.toFixed(2)}x</div></div>
                        <div class="compact-stat"><div class="stat-label">Equity Return (Ann.)</div><div class="stat-value compact ${pctCls(D.eqReturnSI)}">${pctN(D.eqReturnSI)}</div></div>
                        <div class="compact-stat"><div class="stat-label">Bond Income</div><div class="stat-value compact">${$M(D.totalBondIncome)}/yr</div></div>
                    </div></div>
                <div class="stat-card"><div class="section-title">Realized vs. Unrealized</div>
                    <div class="progress-row" style="margin-top:8px;">
                        ${progressBar('Realized Gains', $M(D.realizedGains), D.realizedGains + Math.abs(D.unrealizedGains), 'var(--positive)')}
                        ${progressBar('Unrealized Gains', $M(D.unrealizedGains), D.realizedGains + Math.abs(D.unrealizedGains), 'var(--chart-2)')}
                        ${progressBar('Exited Funds', D.exitedFunds.length + ' of ' + D.funds.length, D.funds.length, 'var(--chart-6)')}
                    </div></div>
            </div>
        `,

        // ──────── FUND HOLDINGS ────────
        'nav-funds': () => `
            <div class="view-header"><h1>Fund Holdings</h1>
                <div class="header-right"><select class="select-input"><option>All (${D.funds.length})</option><option>Active (${D.activeFunds.length})</option><option>Exited (${D.exitedFunds.length})</option></select>
                <button class="btn btn-secondary">Export CSV</button></div></div>

            <table class="data-table" id="funds-table"><thead><tr>
                <th>Fund Name</th><th>Type</th><th>Vintage</th><th>Status</th>
                <th style="text-align:right">Commitment</th><th style="text-align:right">Paid-In</th>
                <th style="text-align:right">NAV</th><th style="text-align:right">Distributions</th>
                <th style="text-align:right">IRR</th><th style="text-align:right">MOIC</th></tr></thead>
            <tbody>${D.funds.sort((a, b) => b.nav - a.nav || b.distributions - a.distributions).map(f => `
                <tr class="fund-row" data-fund-id="${f.id}" style="cursor:pointer;">
                    <td><strong class="fund-link">${f.name}</strong></td>
                    <td><span class="badge" style="background:${f.color}15;color:${f.color};border:1px solid ${f.color}30;">${f.typeName}</span></td>
                    <td>${f.vintage}</td><td>${statusBadge(f.status)}</td>
                    <td style="text-align:right">${$M(f.commitment)}</td>
                    <td style="text-align:right">${$M(f.paidIn)}</td>
                    <td style="text-align:right"><strong>${f.status === 'Written Off' ? '—' : $M(f.nav)}</strong></td>
                    <td style="text-align:right">${$M(f.distributions)}</td>
                    <td style="text-align:right" class="${f.irr > 0 ? 'positive' : 'negative'}">${pct(f.irr)}</td>
                    <td style="text-align:right">${f.moic.toFixed(2)}x</td></tr>`).join('')}</tbody>
            <tfoot><tr style="font-weight:700;border-top:2px solid var(--border-color);">
                <td>Total (${D.funds.length} funds)</td><td></td><td></td><td></td>
                <td style="text-align:right">${$M(D.totalCommitment)}</td>
                <td style="text-align:right">${$M(D.totalPaidIn)}</td>
                <td style="text-align:right">${$M(D.fundNAV)}</td>
                <td style="text-align:right">${$M(D.totalDistributions)}</td>
                <td style="text-align:right" class="positive">${pct(D.portfolioIRR)}</td>
                <td style="text-align:right">${D.portfolioMOIC.toFixed(2)}x</td></tr></tfoot></table>

            <div class="grid-2" style="margin-top:24px;">
                <div class="stat-card"><div class="section-title">Top 5 by IRR</div><div class="progress-row" style="margin-top:8px;">
                    ${D.funds.filter(f => f.irr > 0).sort((a, b) => b.irr - a.irr).slice(0, 5).map(f =>
            progressBar(f.name.split(' ').slice(0, 3).join(' '), pct(f.irr), Math.max(...D.funds.map(x => x.irr)) * 100, f.color)).join('')}
                </div></div>
                <div class="stat-card"><div class="section-title">Losses & Write-Offs</div><div class="progress-row" style="margin-top:8px;">
                    ${D.funds.filter(f => f.irr < 0 || f.status === 'Written Off').map(f =>
                `<div class="progress-item"><div class="progress-label"><span>${f.name.split(' ').slice(0, 3).join(' ')}</span>
                        <span class="negative">${f.status === 'Written Off' ? 'Total Loss' : pct(f.irr)}</span></div>
                        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(Math.abs(f.irr) * 100, 100)}%;background:var(--negative);"></div></div></div>`
            ).join('') || '<div class="muted" style="padding:12px 0;">No losses</div>'}
                </div></div>
            </div>
        `,

        // ──────── EQUITY HOLDINGS ────────
        'nav-equities': () => {
            const winners = D.stocks.filter(s => s.unrealizedGL > 0).sort((a, b) => b.unrealizedGL - a.unrealizedGL);
            const losers = D.stocks.filter(s => s.unrealizedGL < 0).sort((a, b) => a.unrealizedGL - b.unrealizedGL);
            return `
            <div class="view-header"><h1>Equity Holdings</h1>
                <div class="header-right">
                    <span class="header-stat">${D.stocks.length} positions</span>
                    <span class="header-stat ${D.totalStockGL >= 0 ? 'positive' : 'negative'}">${D.totalStockGL >= 0 ? '+' : ''}${$M(D.totalStockGL)} P&L</span>
                    <button class="btn btn-secondary">Export CSV</button></div></div>

            <div class="stats-grid">
                ${statCard('Total Market Value', $(D.totalStockValue), `${pct(D.totalStockValue / D.currentAUM)} of portfolio`)}
                ${statCard('Total Cost Basis', $(D.totalStockCost), `${D.stocks.length} positions`)}
                ${statCard('Unrealized P&L', `${D.totalStockGL >= 0 ? '+' : ''}${$(D.totalStockGL)}`, pct(D.totalStockGL / D.totalStockCost), D.totalStockGL >= 0 ? 'positive' : 'negative')}
                ${statCard('Annual Dividends', $(D.totalDividendIncome), `Avg yield: ${(D.totalDividendIncome / D.totalStockValue * 100).toFixed(2)}%`)}
            </div>

            <table class="data-table"><thead><tr>
                <th>Ticker</th><th>Name</th><th>Sector</th>
                <th style="text-align:right">Mkt Value</th><th style="text-align:right">P&L</th>
                <th style="text-align:right">YTD</th><th style="text-align:right">1Y</th>
                <th style="text-align:right">Since Inception</th><th style="text-align:right">Total Return</th></tr></thead>
            <tbody>${D.stocks.sort((a, b) => b.marketValue - a.marketValue).map(s => `
                <tr class="stock-row" data-ticker="${s.ticker}" style="cursor:pointer;">
                    <td><strong class="fund-link">${s.ticker}</strong></td>
                    <td>${s.name}</td>
                    <td><span class="badge" style="background:${ASSET_COLORS.DIRECT_EQ}15;color:${ASSET_COLORS.DIRECT_EQ};">${s.sector}</span></td>
                    <td style="text-align:right"><strong>${$M(s.marketValue)}</strong></td>
                    <td style="text-align:right" class="${pctCls(s.unrealizedGL)}">${s.unrealizedGL >= 0 ? '+' : ''}${$M(s.unrealizedGL)}</td>
                    <td style="text-align:right" class="${pctCls(s.returnYTD)}">${pctN(s.returnYTD)}</td>
                    <td style="text-align:right" class="${pctCls(s.return1Y)}">${pctN(s.return1Y)}</td>
                    <td style="text-align:right" class="${pctCls(s.returnSI)}"><strong>${pctN(s.returnSI)}</strong></td>
                    <td style="text-align:right" class="${pctCls(s.totalReturn)}">${pctN(s.totalReturn)}</td></tr>`).join('')}</tbody>
            <tfoot><tr style="font-weight:700;border-top:2px solid var(--border-color);">
                <td colspan="3">Total (${D.stocks.length} positions)</td>
                <td style="text-align:right">${$(D.totalStockValue)}</td>
                <td style="text-align:right" class="${D.totalStockGL >= 0 ? 'positive' : 'negative'}">${D.totalStockGL >= 0 ? '+' : ''}${$(D.totalStockGL)}</td>
                <td colspan="4"></td></tr></tfoot></table>

            <div class="grid-2" style="margin-top:24px;">
                <div class="stat-card"><div class="section-title">Top 5 Winners</div><div class="progress-row" style="margin-top:8px;">
                    ${winners.slice(0, 5).map(s => progressBar(`${s.ticker} (${pct(s.unrealizedPct, 0)})`, `+${$M(s.unrealizedGL)}`, winners[0].unrealizedGL, 'var(--positive)')).join('')}
                </div></div>
                <div class="stat-card"><div class="section-title">Loss Positions</div><div class="progress-row" style="margin-top:8px;">
                    ${losers.slice(0, 5).map(s => `<div class="progress-item"><div class="progress-label"><span>${s.ticker} (${pct(s.unrealizedPct, 0)})</span>
                        <span class="negative">${$M(s.unrealizedGL)}</span></div>
                        <div class="progress-track"><div class="progress-fill" style="width:${Math.abs(s.unrealizedPct) * 100}%;background:var(--negative);"></div></div></div>`
            ).join('')}
                </div></div>
            </div>

            <div class="stat-card" style="margin-top:24px;"><div class="section-title">Sector Allocation</div>
                <div class="progress-row" style="margin-top:8px;">
                    ${D.stockSectors.map((s, i) => progressBar(s.sector, s.pct + '%', D.stockSectors[0].pct,
                ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'][i % 6])).join('')}
                </div></div>
        `;
        },

        // ──────── PERFORMANCE ────────
        'nav-performance': () => `
            <div class="view-header"><h1>Performance</h1></div>
            <div class="stats-grid">
                ${statCard(`Fund IRR ${tip('IRR')}`, pct(D.portfolioIRR), '+2.1% alpha vs benchmark', 'positive')}
                ${statCard(`Gross MOIC ${tip('MOIC')}`, D.portfolioMOIC.toFixed(2) + 'x', `Net: ${(D.portfolioMOIC * 0.92).toFixed(2)}x`)}
                ${statCard('Equity SI Return (Ann.)', pctN(D.eqReturnSI), `1Y: ${pctN(D.eqReturn1Y)} | YTD: ${pctN(D.eqReturnYTD)}`, pctCls(D.eqReturnSI))}
                ${statCard(`PME ${tip('PME')}`, '1.14x', 'vs S&P 500')}
            </div>

            <div class="stat-card" style="margin-bottom:24px;"><div class="section-title">Equity Returns by Period (Annualized, Value-Weighted)</div>
                <table class="data-table"><thead><tr><th>Period</th><th style="text-align:right">Return</th><th>Description</th></tr></thead><tbody>
                    <tr><td><strong>YTD</strong></td><td style="text-align:right" class="${pctCls(D.eqReturnYTD)}">${pctN(D.eqReturnYTD)}</td><td class="muted">Q4 2024 → Q1 2025 (not annualized)</td></tr>
                    <tr><td><strong>1 Year</strong></td><td style="text-align:right" class="${pctCls(D.eqReturn1Y)}">${pctN(D.eqReturn1Y)}</td><td class="muted">Q1 2024 → Q1 2025</td></tr>
                    <tr><td><strong>3 Year CAGR</strong></td><td style="text-align:right" class="${pctCls(D.eqReturn3Y)}">${pctN(D.eqReturn3Y)}</td><td class="muted">Annualized, positions held ≥ 3Y</td></tr>
                    <tr><td><strong>5 Year CAGR</strong></td><td style="text-align:right" class="${pctCls(D.eqReturn5Y)}">${pctN(D.eqReturn5Y)}</td><td class="muted">Annualized, positions held ≥ 5Y</td></tr>
                    <tr style="border-top:2px solid var(--border-color);"><td><strong>Since Inception</strong></td><td style="text-align:right" class="${pctCls(D.eqReturnSI)}"><strong>${pctN(D.eqReturnSI)}</strong></td><td class="muted">Value-weighted CAGR across all positions</td></tr>
                </tbody></table></div>

            <div class="stat-card" style="margin-bottom:24px;"><div class="section-title">Annual Returns</div>
                <div class="chart-container">${barChart(D.history.yearly.map(h => parseFloat(h.returnPct)), D.history.yearly.map(h => h.year))}</div></div>

            <div class="section-title" style="margin-top:32px;font-size:18px;">Cash Flow Analysis</div>

            <div class="grid-2" style="margin-top:16px;">
                <div class="stat-card"><div class="section-title">YTD Cash Flow Waterfall (2025)</div>
                    <div class="chart-container">${waterfallChart(D.history.ytdWaterfall, 220)}</div>
                </div>
                <div class="stat-card"><div class="section-title">Cumulative Cash Flows — Since Inception</div>
                    <div class="chart-container">${stackedBarChart([
            { name: 'Capital Injected', values: D.history.yearly.map(h => h.cumInjections), color: 'var(--chart-1)' },
            { name: 'Cumulative Gains', values: D.history.yearly.map(h => h.cumGains), color: 'var(--positive)' },
            { name: 'Distributions', values: D.history.yearly.map(h => h.cumDistributions), color: 'var(--chart-4)' }
        ], D.history.yearly.map(h => h.year), 220)}</div>
                </div>
            </div>

            <div class="stat-card" style="margin-bottom:24px;"><div class="section-title">Annual Cash Flow Breakdown</div>
                <table class="data-table"><thead><tr>
                    <th>Year</th><th style="text-align:right">Injections</th><th style="text-align:right">Gains</th>
                    <th style="text-align:right">Distributions</th><th style="text-align:right">Income</th>
                    <th style="text-align:right">Net Cash Flow</th><th style="text-align:right">Ending AUM</th></tr></thead>
                <tbody>${D.history.yearly.slice().reverse().map(h => `<tr>
                    <td><strong>${h.year}</strong></td>
                    <td style="text-align:right">${$M(h.injection)}</td>
                    <td style="text-align:right" class="${h.gains >= 0 ? 'positive' : 'negative'}">${h.gains >= 0 ? '+' : ''}${$M(h.gains)}</td>
                    <td style="text-align:right" class="positive">${$M(h.distributions)}</td>
                    <td style="text-align:right">${$M(h.income)}</td>
                    <td style="text-align:right" class="${h.netCashFlow >= 0 ? 'positive' : 'negative'}"><strong>${h.netCashFlow >= 0 ? '+' : ''}${$M(h.netCashFlow)}</strong></td>
                    <td style="text-align:right"><strong>${fmtNum(h.aum)}</strong></td></tr>`).join('')}</tbody>
                <tfoot><tr style="font-weight:700;">
                    <td>Total</td>
                    <td style="text-align:right">${$(D.history.yearly[D.history.yearly.length - 1].cumInjections)}</td>
                    <td style="text-align:right" class="positive">+${$(D.history.yearly[D.history.yearly.length - 1].cumGains)}</td>
                    <td style="text-align:right" class="positive">${$(D.history.yearly[D.history.yearly.length - 1].cumDistributions)}</td>
                    <td style="text-align:right">${$(D.history.yearly[D.history.yearly.length - 1].cumIncome)}</td>
                    <td style="text-align:right" class="${D.history.yearly[D.history.yearly.length - 1].cumNetCashFlow >= 0 ? 'positive' : 'negative'}">${D.history.yearly[D.history.yearly.length - 1].cumNetCashFlow >= 0 ? '+' : ''}${$(D.history.yearly[D.history.yearly.length - 1].cumNetCashFlow)}</td>
                    <td style="text-align:right">${fmtNum(D.history.yearly[D.history.yearly.length - 1].aum)}</td></tr></tfoot></table>
            </div>

            <div class="section-title">Strategy Benchmarking</div>
            <table class="data-table"><thead><tr><th>Strategy</th><th>Funds</th><th style="text-align:right">IRR</th><th style="text-align:right">Benchmark</th><th style="text-align:right">Alpha</th><th>Quartile</th></tr></thead>
            <tbody>${['PE', 'VC', 'RE', 'PC', 'EQ_FUNDS'].map(type => {
            const tf = D.funds.filter(f => f.type === type); if (!tf.length) return '';
            const avg = tf.reduce((s, f) => s + f.irr, 0) / tf.length;
            const bm = { PE: 0.16, VC: 0.22, RE: 0.11, PC: 0.08, EQ_FUNDS: 0.10 }[type] || 0.10;
            const a = avg - bm;
            return `<tr><td>${D.assetNames[type]}</td><td>${tf.length}</td>
                    <td style="text-align:right">${pct(avg)}</td><td style="text-align:right">${pct(bm)}</td>
                    <td style="text-align:right" class="${a > 0 ? 'positive' : 'negative'}">${a > 0 ? '+' : ''}${pct(a)}</td>
                    <td>${a > 0.02 ? '<span class="badge badge-positive">Top Quartile</span>' : a > 0 ? '<span class="badge">Upper Half</span>' : '<span class="badge badge-warning">Lower Half</span>'}</td></tr>`;
        }).join('')}</tbody></table>
        `,

        // ──────── LIQUIDITY ────────
        'nav-liquidity': () => `
            <div class="view-header"><h1>Liquidity & Cash Flow</h1></div>
            <div class="stats-grid">
                ${statCard('Cash & MM', $(D.cashPosition), 'Immediately available')}
                ${statCard('< 90 Days', $(D.totalStockValue * 0.15 + D.totalBondValue * 0.2 + D.cashPosition), 'Public equity + bonds + cash')}
                ${statCard('Expected Calls (12m)', $M(D.totalUnfunded * 0.3), `${D.activeFunds.filter(f => f.unfunded > 0).length} funds pending`, 'negative')}
                ${statCard(`LCR ${tip('LCR')}`, '1.84x', 'Above target', 'positive')}
            </div>
            <div class="grid-2">
                <div class="stat-card"><div class="section-title">Net Cash Flow Forecast (Monthly $M)</div>
                    <div class="chart-container">${barChart([8, -5, 12, -18, 6, -3, 22, -10, 15, -7, 9, -4], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}</div></div>
                <div class="stat-card"><div class="section-title">Liquidity Buckets</div>
                    <div class="progress-row" style="margin-top:8px;">
                        ${progressBar('Immediate (Cash)', '4%', 100, 'var(--chart-3)')}
                        ${progressBar('< 30 Days (Public Eq)', '15%', 100, 'var(--chart-2)')}
                        ${progressBar('30-90 Days (Bonds)', '10%', 100, 'var(--chart-4)')}
                        ${progressBar('1-3 Years (PE/VC)', '22%', 100, 'var(--chart-6)')}
                        ${progressBar('> 3 Years (Illiquid)', '49%', 100, 'var(--chart-1)')}
                    </div></div>
            </div>
        `,

        // ──────── RISK ────────
        'nav-risk': () => `
            <div class="view-header"><h1>Risk & Concentration</h1></div>
            <div class="stats-grid-3">
                ${statCard('Portfolio Vol', '14.2%', 'Annualized std dev')}
                ${statCard('Max Drawdown', '-18.4%', 'Peak-to-trough (2022)', 'negative')}
                ${statCard('Sharpe Ratio', '1.28', 'Risk-adjusted', 'positive')}
            </div>
            <div class="stat-card" style="margin-bottom:24px;"><div class="section-title">Drawdown Profile</div>
                <div class="chart-container">${lineChart([0, -1, -3, 0, 2, 1, -2, 0, 3, -5, -12, 0, 8, 12, -8, -18, -10, 0, 5, 8],
            D.history.yearly.map(h => h.year), 140, 'var(--negative)')}</div></div>
            <div class="grid-2">
                <div class="stat-card"><div class="section-title">Top 10 Concentration (All Holdings)</div>
                    <div class="progress-row">${[...D.activeFunds, ...D.stocks].sort((a, b) => (b.nav || b.marketValue) - (a.nav || a.marketValue)).slice(0, 10).map(h =>
                progressBar(h.name || h.ticker, pct((h.nav || h.marketValue) / D.currentAUM),
                    30, h.color || 'var(--chart-2)')).join('')}</div></div>
                <div class="stat-card"><div class="section-title">Asset Class Risk</div>
                    <div class="progress-row" style="margin-top:8px;">
                        ${progressBar('PE/VC (Illiquid)', 'High', 100, 'var(--negative)')}
                        ${progressBar('Real Estate', 'Medium-High', 75, 'var(--chart-6)')}
                        ${progressBar('Direct Equities', 'Medium', 50, 'var(--chart-2)')}
                        ${progressBar('Bonds/Credit', 'Low-Medium', 35, 'var(--chart-3)')}
                        ${progressBar('Cash', 'Low', 10, 'var(--positive)')}
                    </div></div>
            </div>
        `,

        // ──────── EXPOSURE ────────
        'nav-exposure': () => `
            <div class="view-header"><h1>Exposure & Allocation</h1></div>
            <div class="grid-2">
                <div class="stat-card"><div class="section-title">Full Asset Allocation</div>${allocBar()}</div>
                <div class="stat-card"><div class="section-title">Geographic Breakdown</div>
                    <div class="progress-row" style="margin-top:8px;">
                        ${progressBar('United States', '72%', 100, 'var(--chart-1)')}
                        ${progressBar('Global / Multi', '16%', 100, 'var(--chart-2)')}
                        ${progressBar('International', '8%', 100, 'var(--chart-3)')}
                        ${progressBar('Emerging Markets', '4%', 100, 'var(--chart-6)')}
                    </div></div>
            </div>
            <div class="grid-2" style="margin-top:0;">
                <div class="stat-card"><div class="section-title">Sector Exposure (All Holdings)</div>
                    <div class="progress-row" style="margin-top:8px;">
                        ${progressBar('Technology', '34%', 100, 'var(--chart-2)')}
                        ${progressBar('Financials', '14%', 100, 'var(--chart-1)')}
                        ${progressBar('Healthcare', '10%', 100, 'var(--chart-3)')}
                        ${progressBar('Real Assets / RE', '12%', 100, 'var(--chart-4)')}
                        ${progressBar('Consumer', '9%', 100, 'var(--chart-5)')}
                        ${progressBar('Energy', '5%', 100, 'var(--chart-6)')}
                        ${progressBar('Fixed Income', '10%', 100, 'var(--chart-7)')}
                        ${progressBar('Other', '6%', 100, 'var(--chart-8)')}
                    </div></div>
                <div class="stat-card"><div class="section-title">Vintage Year (Fund Commitments)</div>
                    <div class="chart-container">${(() => {
                const v = {}; D.activeFunds.forEach(f => { v[f.vintage] = (v[f.vintage] || 0) + f.nav; });
                const yrs = Object.keys(v).sort();
                return barChart(yrs.map(y => v[y] / 1e6), yrs);
            })()}</div></div>
            </div>
        `,

        // ──────── ATTRIBUTION ────────
        'nav-attribution': () => `
            <div class="view-header"><h1>Attribution & Fees</h1></div>
            <div class="stat-card" style="margin-bottom:24px;"><div class="section-title">Return Attribution (bps)</div>
                <div class="chart-container">${barChart([450, 280, 120, -60, -180], ['Selection', 'Allocation', 'Timing', 'FX', 'Fees'])}</div></div>
            <div class="grid-2">
                <div class="stat-card"><div class="section-title">Fee Summary</div>
                    <table class="data-table"><tbody>
                        <tr><td>Fund Management Fees (avg)</td><td style="text-align:right;">1.4%</td></tr>
                        <tr><td>Carry / Performance Fees</td><td style="text-align:right;">$14.2M accrued</td></tr>
                        <tr><td>Brokerage Commissions</td><td style="text-align:right;">$82K</td></tr>
                        <tr><td>Custody & Admin</td><td style="text-align:right;">0.08%</td></tr>
                        <tr><td>Total Fee Drag</td><td style="text-align:right;font-weight:700;" class="negative">−1.6%</td></tr>
                    </tbody></table></div>
                <div class="stat-card"><div class="section-title">Income Summary</div>
                    <table class="data-table"><tbody>
                        <tr><td>Stock Dividends</td><td style="text-align:right;font-weight:600;" class="positive">${$(D.totalDividendIncome)}/yr</td></tr>
                        <tr><td>Bond Coupon Income</td><td style="text-align:right;font-weight:600;" class="positive">${$(D.totalBondIncome)}/yr</td></tr>
                        <tr><td>Fund Distributions (TTM)</td><td style="text-align:right;font-weight:600;" class="positive">${$M(D.totalDistributions * 0.12)}</td></tr>
                        <tr><td><strong>Total Annual Income</strong></td><td style="text-align:right;font-weight:700;" class="positive">${$(D.totalDividendIncome + D.totalBondIncome + D.totalDistributions * 0.12)}</td></tr>
                    </tbody></table></div>
            </div>
        `,

        // ──────── LEVERAGE ────────
        'nav-leverage': () => `
            <div class="view-header"><h1>Leverage & Financing</h1></div>
            <div class="stats-grid">
                ${statCard(`LTV ${tip('LTV')}`, '28.4%', 'Target < 35%')}
                ${statCard('Fixed Rate', '60%', 'Floating: 40%')}
                ${statCard('Wtd Avg Cost', '5.4%', 'Blended rate')}
                ${statCard(`ISCR ${tip('ISCR')}`, '4.2x', 'Healthy', 'positive')}
            </div>
            <div class="section-title">Debt Maturity Profile ($M)</div>
            <div class="stat-card"><div class="chart-container">${barChart([45, 62, 38, 85, 28, 15], ['2025', '2026', '2027', '2028', '2029', '2030+'])}</div></div>
        `,

        // ──────── GOVERNANCE ────────
        'nav-governance': () => `
            <div class="view-header"><h1>Governance & Compliance</h1></div>
            <div class="grid-2">
                <div class="stat-card"><div class="section-title">Compliance Checklist</div>
                    <ul class="checklist">
                        <li><span class="check-icon">✓</span> Annual Audit 2024 — Clean Opinion</li>
                        <li><span class="check-icon">✓</span> Quarterly Valuation — Q4 Certified</li>
                        <li><span class="check-icon">✓</span> Side Letter Compliance — All 6 Active</li>
                        <li><span class="check-icon">✓</span> Tax Filings — Current Through FY2024</li>
                        <li><span class="check-icon">✓</span> AML / KYC — Annual Review Complete</li>
                        <li><span class="check-icon">✓</span> Data Privacy — GDPR/CCPA Compliant</li>
                    </ul></div>
                <div class="stat-card"><div class="section-title">ESG Composite Score</div>
                    <div style="text-align:center;padding:16px 0;">
                        <div class="stat-value" style="font-size:36px;color:var(--positive);">78</div>
                        <div class="stat-footer" style="text-align:center;">out of 100 — Above peer median</div></div>
                    <div class="progress-row" style="margin-top:16px;">
                        ${progressBar('Environmental', '72', 100, 'var(--chart-3)')}
                        ${progressBar('Social', '81', 100, 'var(--chart-2)')}
                        ${progressBar('Governance', '80', 100, 'var(--chart-1)')}
                    </div></div>
            </div>
        `,

        // ╔══════════════════════════════════════════════╗
        // ║  QUARTERLY REPORT                             ║
        // ╚══════════════════════════════════════════════╝
        'nav-report': () => {
            const top10 = [...D.activeFunds, ...D.stocks].sort((a, b) => (b.nav || b.marketValue) - (a.nav || a.marketValue)).slice(0, 10);
            const topStocks = D.stocks.sort((a, b) => b.unrealizedGL - a.unrealizedGL).slice(0, 5);
            const bottomStocks = D.stocks.sort((a, b) => a.unrealizedGL - b.unrealizedGL).slice(0, 5);
            return `
            <div class="report-container">
                <div class="report-header">
                    <div class="report-logo">◆ VintageIQ</div>
                    <div class="report-title">Quarterly Portfolio Report</div>
                    <div class="report-subtitle">Family Office Alpha | Q1 2025 | Confidential</div>
                    <button class="btn btn-primary no-print" onclick="window.print()">Print / Export PDF</button>
                </div>

                <div class="report-section">
                    <h2>Executive Summary</h2>
                    <p>The portfolio ended Q1 2025 with a total AUM of <strong>${fmtNum(D.currentAUM)}</strong> across <strong>${D.holdingCount} holdings</strong>
                    spanning ${D.allocation.length} asset classes. Fund investments generated a weighted IRR of <strong>${pct(D.portfolioIRR)}</strong>
                    with a TVPI of <strong>${D.portfolioTVPI.toFixed(2)}x</strong>. The direct equity portfolio of ${D.stocks.length} US stocks
                    is valued at <strong>${$(D.totalStockValue)}</strong> with unrealized gains of <strong>${$(D.totalStockGL)}</strong>.
                    Annual income from dividends and bond coupons totals <strong>${$(D.totalDividendIncome + D.totalBondIncome)}</strong>.</p>
                </div>

                <div class="report-section">
                    <h2>Portfolio Summary</h2>
                    <div class="report-grid">
                        <div class="report-metric"><span class="report-metric-label">Total AUM</span><span class="report-metric-value">${fmtNum(D.currentAUM)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Fund Commitments</span><span class="report-metric-value">${$(D.totalCommitment)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Direct Equities</span><span class="report-metric-value">${$(D.totalStockValue)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Fixed Income</span><span class="report-metric-value">${$(D.totalBondValue)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Alternatives</span><span class="report-metric-value">${$(D.totalAltsValue)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Cash</span><span class="report-metric-value">${$(D.cashPosition)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Fund IRR</span><span class="report-metric-value">${pct(D.portfolioIRR)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">TVPI</span><span class="report-metric-value">${D.portfolioTVPI.toFixed(2)}x</span></div>
                        <div class="report-metric"><span class="report-metric-label">Equity P&L</span><span class="report-metric-value ${D.totalStockGL >= 0 ? 'positive' : 'negative'}">${D.totalStockGL >= 0 ? '+' : ''}${$(D.totalStockGL)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Annual Income</span><span class="report-metric-value">${$(D.totalDividendIncome + D.totalBondIncome)}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Holdings</span><span class="report-metric-value">${D.holdingCount}</span></div>
                        <div class="report-metric"><span class="report-metric-label">Unfunded</span><span class="report-metric-value">${$(D.totalUnfunded)}</span></div>
                    </div>
                </div>

                <div class="report-section">
                    <h2>Asset Allocation</h2>
                    ${allocBar()}
                </div>

                <div class="report-section">
                    <h2>Top 10 Holdings by Value</h2>
                    <table class="data-table report-table"><thead><tr><th>#</th><th>Holding</th><th>Type</th><th style="text-align:right">Value</th><th style="text-align:right">% of AUM</th></tr></thead>
                    <tbody>${top10.map((h, i) => `<tr><td>${i + 1}</td><td><strong>${h.name || h.ticker}</strong></td>
                        <td>${h.typeName || 'Direct Equity'}</td>
                        <td style="text-align:right">${$(h.nav || h.marketValue)}</td>
                        <td style="text-align:right">${pct((h.nav || h.marketValue) / D.currentAUM)}</td></tr>`).join('')}</tbody></table>
                </div>

                <div class="report-section">
                    <h2>Fund Performance</h2>
                    <table class="data-table report-table"><thead><tr><th>Fund</th><th>Type</th><th>Status</th><th style="text-align:right">NAV</th><th style="text-align:right">IRR</th><th style="text-align:right">TVPI</th></tr></thead>
                    <tbody>${D.funds.sort((a, b) => b.nav - a.nav || b.tvpi - a.tvpi).map(f => `<tr>
                        <td>${f.name}</td><td>${f.typeName}</td><td>${f.status}</td>
                        <td style="text-align:right">${f.status === 'Written Off' ? '—' : $M(f.nav)}</td>
                        <td style="text-align:right" class="${f.irr > 0 ? 'positive' : 'negative'}">${pct(f.irr)}</td>
                        <td style="text-align:right">${f.tvpi.toFixed(2)}x</td></tr>`).join('')}</tbody></table>
                </div>

                <div class="report-section">
                    <h2>Equity Highlights</h2>
                    <div class="report-grid-2">
                        <div><h3>Top Winners</h3>
                            <table class="data-table report-table"><tbody>${topStocks.map(s => `<tr><td><strong>${s.ticker}</strong></td>
                                <td>${s.name}</td><td style="text-align:right" class="positive">+${$(s.unrealizedGL)}</td>
                                <td style="text-align:right" class="positive">${pct(s.unrealizedPct)}</td></tr>`).join('')}</tbody></table></div>
                        <div><h3>Notable Losses</h3>
                            <table class="data-table report-table"><tbody>${bottomStocks.map(s => `<tr><td><strong>${s.ticker}</strong></td>
                                <td>${s.name}</td><td style="text-align:right" class="negative">${$(s.unrealizedGL)}</td>
                                <td style="text-align:right" class="negative">${pct(s.unrealizedPct)}</td></tr>`).join('')}</tbody></table></div>
                    </div>
                </div>

                <div class="report-section">
                    <h2>Risk Dashboard</h2>
                    <div class="report-grid">
                        <div class="report-metric"><span class="report-metric-label">Volatility</span><span class="report-metric-value">14.2%</span></div>
                        <div class="report-metric"><span class="report-metric-label">Sharpe</span><span class="report-metric-value">1.28</span></div>
                        <div class="report-metric"><span class="report-metric-label">Max Drawdown</span><span class="report-metric-value negative">-18.4%</span></div>
                        <div class="report-metric"><span class="report-metric-label">LCR</span><span class="report-metric-value positive">1.84x</span></div>
                    </div>
                </div>

                <div class="report-footer">
                    <div>Prepared by <strong>VintageIQ</strong> — Family Office Intelligence Platform</div>
                    <div>This report is confidential and intended for authorized recipients only.</div>
                    <div>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
            </div>
        `;
        }
    };

    const ASSET_COLORS = D.assetColors;

    // ──── View Router ────
    function renderView(id) {
        viewContainer.style.opacity = '0';
        setTimeout(() => {
            const builder = views[id] || views['nav-dashboard'];
            viewContainer.innerHTML = builder();
            viewContainer.style.opacity = '1';
            attachHandlers();
        }, 80);
    }

    function attachHandlers() {
        document.querySelectorAll('.fund-row').forEach(r => r.addEventListener('click', () => renderFundDetail(r.dataset.fundId)));
        document.querySelectorAll('.stock-row').forEach(r => r.addEventListener('click', () => renderStockDetail(r.dataset.ticker)));
    }

    // ──── Mobile Menu Toggle ────
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    function closeMobileMenu() {
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('visible');
        if (menuToggle) menuToggle.classList.remove('open');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('open');
            backdrop.classList.toggle('visible', isOpen);
            menuToggle.classList.toggle('open', isOpen);
        });
    }
    if (backdrop) {
        backdrop.addEventListener('click', closeMobileMenu);
    }

    // ──── Navigation ────
    navItems.forEach(item => item.addEventListener('click', e => {
        e.preventDefault();
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentFundId = null;
        renderView(item.id);
        closeMobileMenu(); // Auto-close drawer on mobile
    }));

    renderView('nav-dashboard');
});
