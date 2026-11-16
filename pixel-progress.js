(function (global) {
  'use strict';

  let uidCounter = 0;

  const VALID_STATES = new Set(['loading', 'paused', 'success', 'error', 'indeterminate']);

  const DEFAULT_STATUS_TEXT = {
    loading: '进行中',
    paused: '已暂停',
    success: '已完成',
    error: '错误',
    indeterminate: '处理中'
  };

  const THEME_PALETTES = {
    orange: { c1: '#E5492B', c2: '#F28263', c3: '#FFE0D4' },
    sport:  { c1: '#E5492B', c2: '#F28263', c3: '#FFE0D4' },
    blue:   { c1: '#203F91', c2: '#4A74E8', c3: '#D4E3FF' },
    study:  { c1: '#203F91', c2: '#4A74E8', c3: '#D4E3FF' },
    gold:   { c1: '#D48817', c2: '#E4A334', c3: '#FFF0C2' },
    habit:  { c1: '#D48817', c2: '#E4A334', c3: '#FFF0C2' },
    ink:    { c1: '#262624', c2: '#66635B', c3: '#DEDAD0' },
    claude: { c1: '#D97757', c2: '#E89D82', c3: '#F4D0C3' }
  };

  function escHtml(val) {
    return String(val == null ? '' : val).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function clampProgress(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function clampHeight(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return 24;
    return Math.max(8, Math.min(36, Math.round(n)));
  }

  function resolvePixelSize(height, rawPixelSize) {
    if (rawPixelSize != null) {
      const p = Number(rawPixelSize);
      if (Number.isFinite(p)) return Math.max(2, Math.min(6, Math.round(p)));
    }
    return Math.max(2, Math.round(height / 6));
  }

  function normalizeState(raw) {
    return VALID_STATES.has(raw) ? raw : 'loading';
  }

  function normalizeWidth(raw) {
    if (raw == null || raw === '') return '560px';
    if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(40, raw) + 'px';
    return String(raw);
  }

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    ];
  }

  function mixRgb(a, b, t) {
    const r = Math.round(a[0] + (b[0] - a[0]) * t);
    const g = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return 'rgb(' + r + ', ' + g + ', ' + bl + ')';
  }

  function resolvePalette(opts) {
    if (!opts) return THEME_PALETTES.orange;
    if (opts.colors && opts.colors.c1 && opts.colors.c2 && opts.colors.c3) {
      return opts.colors;
    }
    if (opts.color && typeof opts.color === 'string') {
      const cTrim = opts.color.trim().toLowerCase();
      if (cTrim === 'var(--orange)' || cTrim === '#e5492b' || cTrim === '#c53519') {
        return THEME_PALETTES.orange;
      }
      if (cTrim === 'var(--blue)' || cTrim === '#203f91' || cTrim === '#152b66') {
        return THEME_PALETTES.blue;
      }
      if (cTrim === 'var(--gold)' || cTrim === '#e4a334' || cTrim === '#d48817') {
        return THEME_PALETTES.gold;
      }
      if (cTrim === 'var(--ink)' || cTrim === '#262624' || cTrim === '#1a1a18') {
        return THEME_PALETTES.ink;
      }
      if (cTrim === '#d97757') {
        return THEME_PALETTES.claude;
      }
      const rgb = hexToRgb(cTrim);
      if (rgb) {
        return {
          c1: opts.color,
          c2: mixRgb(rgb, [255, 242, 228], 0.36),
          c3: mixRgb(rgb, [255, 255, 255], 0.74)
        };
      }
    }
    if (opts.variant && THEME_PALETTES[opts.variant]) {
      return THEME_PALETTES[opts.variant];
    }
    return THEME_PALETTES.orange;
  }

  function buildConfig(options) {
    const opts = options || {};
    const state = normalizeState(opts.state);
    const height = clampHeight(opts.height);
    const pixelSize = resolvePixelSize(height, opts.pixelSize);
    const width = normalizeWidth(opts.width);
    const rawPct = state === 'success' ? 100 : clampProgress(opts.progress);
    const pct = Number(rawPct.toFixed(2));
    const displayPct = Math.round(pct);
    const isComplete = state === 'success' || (state === 'loading' && pct >= 100);
    const isZero = state !== 'indeterminate' && pct <= 0;
    const isTiny = state !== 'indeterminate' && pct > 0 && pct <= 11;
    const isMicro = state !== 'indeterminate' && pct > 0 && pct <= 4;
    const bare = Boolean(opts.bare);
    const showHeader = !bare && (opts.showHeader !== false) && (opts.label != null || opts.showPercent !== false || opts.showStatus !== false);
    const showPercent = opts.showPercent !== false && state !== 'indeterminate';
    const showStatus = Boolean(opts.showStatus) || (!bare && opts.showStatus !== false && state !== 'loading');
    const label = opts.label != null ? String(opts.label) : '';
    const statusText = opts.statusText != null ? String(opts.statusText) : DEFAULT_STATUS_TEXT[state];
    const errorText = opts.errorText != null ? String(opts.errorText) : '';
    const ariaLabel = opts.ariaLabel != null ? String(opts.ariaLabel) : (label || '进度条');
    const pacePct = opts.pacePct != null && Number.isFinite(Number(opts.pacePct))
      ? clampProgress(opts.pacePct)
      : null;
    const palette = resolvePalette(opts);

    return {
      state: state,
      height: height,
      pixelSize: pixelSize,
      width: width,
      pct: pct,
      displayPct: displayPct,
      isComplete: isComplete,
      isZero: isZero,
      isTiny: isTiny,
      isMicro: isMicro,
      bare: bare,
      showHeader: showHeader,
      showPercent: showPercent,
      showStatus: showStatus,
      label: label,
      statusText: statusText,
      errorText: errorText,
      ariaLabel: ariaLabel,
      pacePct: pacePct,
      palette: palette,
      className: opts.className ? String(opts.className) : ''
    };
  }

  function renderHtml(options) {
    const cfg = buildConfig(options);
    const uid = 'ppb-' + (++uidCounter);
    const classes = [
      'ppb-root',
      'ppb-state-' + cfg.state,
      cfg.bare ? 'is-bare' : '',
      cfg.isZero ? 'is-zero' : '',
      cfg.isTiny ? 'is-tiny' : '',
      cfg.isMicro ? 'is-micro' : '',
      cfg.isComplete ? 'is-complete' : '',
      cfg.className
    ].filter(Boolean).join(' ');

    const styleVars = [
      '--ppb-w:' + cfg.width,
      '--ppb-h:' + cfg.height + 'px',
      '--ppb-px:' + cfg.pixelSize + 'px',
      '--ppb-pct:' + cfg.pct + '%',
      '--ppb-c1:' + cfg.palette.c1,
      '--ppb-c2:' + cfg.palette.c2,
      '--ppb-c3:' + cfg.palette.c3
    ].join(';');

    const headerHtml = cfg.showHeader
      ? '<div class="ppb-head">'
        + '<span class="ppb-label" id="' + uid + '-lbl">' + escHtml(cfg.label) + '</span>'
        + '<span class="ppb-meta">'
        + (cfg.showStatus ? '<span class="ppb-status-tag">' + escHtml(cfg.statusText) + '</span>' : '')
        + (cfg.showPercent ? '<span class="ppb-pct-text">' + cfg.displayPct + '%</span>' : '')
        + '</span>'
        + '</div>'
      : '';

    const ariaAttr = cfg.showHeader
      ? 'aria-labelledby="' + uid + '-lbl"'
      : 'aria-label="' + escHtml(cfg.ariaLabel) + '"';

    const ariaNowAttr = cfg.state === 'indeterminate'
      ? ''
      : ' aria-valuenow="' + cfg.displayPct + '"';

    const paceMarkerHtml = cfg.pacePct != null
      ? '<span class="ppb-pace" style="left:' + cfg.pacePct + '%" title="本月时间进度 ' + Math.round(cfg.pacePct) + '%"></span>'
      : '';

    const noteHtml = cfg.state === 'error' && cfg.errorText
      ? '<div class="ppb-note" role="status">' + escHtml(cfg.errorText) + '</div>'
      : '<div class="ppb-note" role="status" hidden></div>';

    return '<div class="' + classes + '" data-ppb-state="' + cfg.state + '" data-ppb-progress="' + cfg.pct + '" style="' + escHtml(styleVars) + '">'
      + headerHtml
      + '<div class="ppb-track" role="progressbar" ' + ariaAttr + ' aria-valuemin="0" aria-valuemax="100"' + ariaNowAttr + '>'
      + '<div class="ppb-fill">'
      + '<div class="ppb-rear-glow" aria-hidden="true"></div>'
      + '<div class="ppb-body">'
      + '<div class="ppb-grad"></div>'
      + '<div class="ppb-grid" aria-hidden="true"></div>'
      + '</div>'
      + '<div class="ppb-trail" aria-hidden="true">'
      + '<span class="ppb-dot ppb-d1"></span>'
      + '<span class="ppb-dot ppb-d2"></span>'
      + '<span class="ppb-dot ppb-d3"></span>'
      + '<span class="ppb-dot ppb-d4"></span>'
      + '<span class="ppb-dot ppb-d5"></span>'
      + '<span class="ppb-dot ppb-d6"></span>'
      + '</div>'
      + '</div>'
      + '<div class="ppb-indet" aria-hidden="true"><div class="ppb-indet-runner"></div></div>'
      + paceMarkerHtml
      + '</div>'
      + noteHtml
      + '</div>';
  }

  function update(rootEl, options) {
    if (!rootEl) return null;
    const prevOpts = rootEl._ppbOptions || {};
    const merged = Object.assign({}, prevOpts, options || {});
    rootEl._ppbOptions = merged;
    const cfg = buildConfig(merged);

    VALID_STATES.forEach(function (st) {
      rootEl.classList.toggle('ppb-state-' + st, st === cfg.state);
    });
    rootEl.classList.toggle('is-zero', cfg.isZero);
    rootEl.classList.toggle('is-tiny', cfg.isTiny);
    rootEl.classList.toggle('is-micro', cfg.isMicro);
    rootEl.classList.toggle('is-complete', cfg.isComplete);
    rootEl.dataset.ppbState = cfg.state;
    rootEl.dataset.ppbProgress = String(cfg.pct);

    rootEl.style.setProperty('--ppb-w', cfg.width);
    rootEl.style.setProperty('--ppb-h', cfg.height + 'px');
    rootEl.style.setProperty('--ppb-px', cfg.pixelSize + 'px');
    rootEl.style.setProperty('--ppb-pct', cfg.pct + '%');
    rootEl.style.setProperty('--ppb-c1', cfg.palette.c1);
    rootEl.style.setProperty('--ppb-c2', cfg.palette.c2);
    rootEl.style.setProperty('--ppb-c3', cfg.palette.c3);

    const track = rootEl.querySelector('.ppb-track');
    if (track) {
      if (cfg.state === 'indeterminate') {
        track.removeAttribute('aria-valuenow');
      } else {
        track.setAttribute('aria-valuenow', String(cfg.displayPct));
      }
      if (!cfg.showHeader) {
        track.setAttribute('aria-label', cfg.ariaLabel);
      }
    }

    const labelEl = rootEl.querySelector('.ppb-label');
    if (labelEl && options && options.label != null) {
      labelEl.textContent = cfg.label;
    }

    const tagEl = rootEl.querySelector('.ppb-status-tag');
    if (tagEl) {
      tagEl.textContent = cfg.statusText;
    }

    const pctEl = rootEl.querySelector('.ppb-pct-text');
    if (pctEl) {
      if (cfg.state === 'indeterminate') {
        pctEl.hidden = true;
      } else {
        pctEl.hidden = false;
        pctEl.textContent = cfg.displayPct + '%';
      }
    }

    const noteEl = rootEl.querySelector('.ppb-note');
    if (noteEl) {
      if (cfg.state === 'error' && cfg.errorText) {
        noteEl.textContent = cfg.errorText;
        noteEl.hidden = false;
      } else {
        noteEl.textContent = '';
        noteEl.hidden = true;
      }
    }

    return rootEl;
  }

  function mount(container, options) {
    if (!container) return null;
    container.innerHTML = renderHtml(options);
    const el = container.firstElementChild;
    if (el) el._ppbOptions = Object.assign({}, options || {});
    return el;
  }

  function resolveRingPalette(opts) {
    const state = normalizeState(opts && opts.state);
    if (state === 'error') {
      return { c1: '#B83527', c2: '#DC5442', c3: '#F4A296' };
    }
    return resolvePalette(opts || {});
  }

  function buildRingLayers(opts) {
    const o = opts || {};
    const state = normalizeState(o.state);
    const cx = Number.isFinite(Number(o.cx)) ? Number(o.cx) : 64;
    const cy = Number.isFinite(Number(o.cy)) ? Number(o.cy) : 64;
    const r = Number.isFinite(Number(o.radius)) ? Number(o.radius) : 46;
    const thickness = Number.isFinite(Number(o.thickness)) ? Math.max(12, Math.round(Number(o.thickness) / 6) * 6) : 24;
    const u = thickness / 6;
    const rawPct = state === 'success' ? 100 : clampProgress(o.progress);
    const pct = Number(rawPct.toFixed(2));
    const displayPct = Math.round(pct);
    const isComplete = state === 'success' || (state === 'loading' && pct >= 100);
    const isZero = state !== 'indeterminate' && pct <= 0;
    const isTiny = state !== 'indeterminate' && pct > 0 && pct <= 11;
    const isMicro = state !== 'indeterminate' && pct > 0 && pct <= 4;
    const trailScale = isComplete ? 0 : (isMicro ? 0 : (isTiny ? 0.5 : 1));
    const pal = resolveRingPalette(o);
    const uid = 'ppr-' + (++uidCounter);
    const indents = [4, 2, 0, 1, 3, 5];
    const outerR = r + thickness / 2;
    const innerR = r - thickness / 2;
    const circMain = 2 * Math.PI * r;

    // Defs: blur filter, flowing highlight linear gradient, warm sand gradient, 6-row stepped mask
    let maskCircles = '';
    for (let i = 0; i < 6; i++) {
      const ri = outerR - (i + 0.5) * u;
      const ci = 2 * Math.PI * ri;
      const trueLen = (pct / 100) * ci;
      const indentPx = isComplete ? 0 : indents[i] * u * trailScale;
      const solidLen = isZero ? 0 : (isComplete ? ci : Math.max(0, trueLen - indentPx));
      if (solidLen > 0.05) {
        maskCircles += '<circle cx="' + cx + '" cy="' + cy + '" r="' + ri.toFixed(2)
          + '" fill="none" stroke="#ffffff" stroke-width="' + (u + 0.45).toFixed(2)
          + '" stroke-linecap="butt" stroke-dasharray="' + solidLen.toFixed(2) + ' ' + ci.toFixed(2)
          + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      }
    }

    const defsHtml =
      '<filter id="' + uid + '-blur" x="-35%" y="-35%" width="170%" height="170%">'
      + '<feGaussianBlur stdDeviation="4.8"/>'
      + '</filter>'
      + '<linearGradient id="' + uid + '-sand" x1="0%" y1="0%" x2="100%" y2="100%">'
      + '<stop offset="0%" stop-color="' + pal.c1 + '"/>'
      + '<stop offset="55%" stop-color="' + pal.c1 + '"/>'
      + '<stop offset="85%" stop-color="' + pal.c2 + '"/>'
      + '<stop offset="100%" stop-color="' + pal.c1 + '"/>'
      + '</linearGradient>'
      + '<linearGradient id="' + uid + '-beam" x1="0%" y1="0%" x2="100%" y2="0%">'
      + '<stop offset="0%" stop-color="' + pal.c2 + '" stop-opacity="0"/>'
      + '<stop offset="28%" stop-color="' + pal.c2 + '" stop-opacity="0.72"/>'
      + '<stop offset="50%" stop-color="' + pal.c3 + '" stop-opacity="0.96"/>'
      + '<stop offset="72%" stop-color="' + pal.c2 + '" stop-opacity="0.72"/>'
      + '<stop offset="100%" stop-color="' + pal.c2 + '" stop-opacity="0"/>'
      + '</linearGradient>'
      + '<mask id="' + uid + '-mask" maskUnits="userSpaceOnUse">'
      + '<rect x="' + (cx - outerR - 12) + '" y="' + (cy - outerR - 12) + '" width="' + ((outerR + 12) * 2) + '" height="' + ((outerR + 12) * 2) + '" fill="#000000"/>'
      + maskCircles
      + '</mask>';

    // Track (#FFFFFF pure white) + subtle pixel track borders + faint track grid
    const trackGrid =
      '<circle class="ppr-track" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--ppr-track-stroke, rgba(38,38,36,0.09))" stroke-width="' + thickness + '"/>'
      + '<circle class="ppr-track-border" cx="' + cx + '" cy="' + cy + '" r="' + outerR.toFixed(2) + '" fill="none" stroke="var(--ppr-track-border, rgba(38,38,36,0.18))" stroke-width="1"/>'
      + '<circle class="ppr-track-border" cx="' + cx + '" cy="' + cy + '" r="' + innerR.toFixed(2) + '" fill="none" stroke="var(--ppr-track-border, rgba(38,38,36,0.18))" stroke-width="1"/>'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(26,25,23,0.045)" stroke-width="' + thickness + '" stroke-dasharray="1 ' + Math.max(1, u - 1).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';

    if (state === 'indeterminate') {
      const runnerLen = circMain * 0.34;
      const indetMarkup = trackGrid
        + '<g class="ppr-indet-rot" style="transform-origin:' + cx + 'px ' + cy + 'px">'
        + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + pal.c2 + '" stroke-width="' + thickness + '" stroke-dasharray="' + runnerLen.toFixed(2) + ' ' + circMain.toFixed(2) + '" filter="url(#' + uid + '-blur)" opacity="0.32"/>'
        + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="url(#' + uid + '-beam)" stroke-width="' + thickness + '" stroke-dasharray="' + runnerLen.toFixed(2) + ' ' + circMain.toFixed(2) + '"/>'
        + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(22,16,13,0.22)" stroke-width="' + thickness + '" stroke-dasharray="1 ' + Math.max(1, u - 1).toFixed(2) + '"/>'
        + '</g>';
      return {
        defs: defsHtml,
        markup: indetMarkup,
        pct: pct,
        displayPct: displayPct,
        isComplete: false,
        isZero: false,
        state: state,
        palette: pal
      };
    }

    if (isZero) {
      return {
        defs: defsHtml,
        markup: trackGrid,
        pct: 0,
        displayPct: 0,
        isComplete: false,
        isZero: true,
        state: state,
        palette: pal
      };
    }

    const fillArcLen = isComplete ? circMain : (pct / 100) * circMain;
    // Layer 0: Rear glow strictly behind foreground crisp pixels
    const rearGlowHtml =
      '<g class="ppr-rear-glow" filter="url(#' + uid + '-blur)">'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + pal.c2 + '" stroke-width="' + thickness
      + '" stroke-dasharray="' + fillArcLen.toFixed(2) + ' ' + circMain.toFixed(2)
      + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
      + '</g>';

    // Layer 1 + Layer 2 inside 6-row stepped mask
    let rowGridLines = '';
    for (let k = 1; k < 6; k++) {
      rowGridLines += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (outerR - k * u).toFixed(2) + '" fill="none" stroke="rgba(22,16,13,0.18)" stroke-width="1"/>';
    }
    const beamArc = circMain * 0.42;
    const fgBodyHtml =
      '<g class="ppr-body" mask="url(#' + uid + '-mask)">'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="url(#' + uid + '-sand)" stroke-width="' + thickness + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
      + '<g class="ppr-flow-rot" style="transform-origin:' + cx + 'px ' + cy + 'px">'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="url(#' + uid + '-beam)" stroke-width="' + thickness + '" stroke-dasharray="' + beamArc.toFixed(2) + ' ' + circMain.toFixed(2) + '"/>'
      + '</g>'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(22,16,13,0.17)" stroke-width="' + thickness + '" stroke-dasharray="1 ' + Math.max(1, u - 1).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
      + rowGridLines
      + '</g>';

    // Layer 3: Fixed detached u x u pixels strictly inside [0 .. thetaEnd]
    let trailMarkup = '';
    if (!isComplete && !isMicro) {
      const endAngle = -Math.PI / 2 + (pct / 100) * Math.PI * 2;
      const dotSpecs = [
        { cls: 'ppr-d1', row: 0, backU: 2.0, color: pal.c2 },
        { cls: 'ppr-d2', row: 1, backU: 0.5, color: pal.c3 },
        { cls: 'ppr-d3', row: 4, backU: 1.0, color: pal.c1 },
        { cls: 'ppr-d4', row: 5, backU: 3.0, color: pal.c2 },
        { cls: 'ppr-d5', row: 5, backU: 0.5, color: pal.c3 },
        { cls: 'ppr-d6', row: 3, backU: 0.5, color: pal.c3 }
      ];
      const dotsLimit = isTiny ? 3 : 6;
      for (let idx = 0; idx < dotsLimit; idx++) {
        const sp = dotSpecs[idx];
        const ri = outerR - (sp.row + 0.5) * u;
        const backPx = sp.backU * u * trailScale;
        const ang = endAngle - (backPx / ri);
        // Strictly inside filled sweep [ -PI/2 .. endAngle ]
        if (ang >= -Math.PI / 2 + (u * 0.45) / ri && ang <= endAngle - (u * 0.45) / ri) {
          const px = cx + ri * Math.cos(ang);
          const py = cy + ri * Math.sin(ang);
          const deg = (ang * 180 / Math.PI) + 90;
          const sz = Math.max(2, u);
          trailMarkup += '<rect class="ppr-dot ' + sp.cls + '" x="' + (px - sz / 2).toFixed(2)
            + '" y="' + (py - sz / 2).toFixed(2) + '" width="' + sz.toFixed(2) + '" height="' + sz.toFixed(2)
            + '" fill="' + sp.color + '" transform="rotate(' + deg.toFixed(1) + ' ' + px.toFixed(2) + ' ' + py.toFixed(2) + ')"/>';
        }
      }
    }

    return {
      defs: defsHtml,
      markup: trackGrid + rearGlowHtml + fgBodyHtml + (trailMarkup ? '<g class="ppr-trail" aria-hidden="true">' + trailMarkup + '</g>' : ''),
      pct: pct,
      displayPct: displayPct,
      isComplete: isComplete,
      isZero: isZero,
      state: state,
      palette: pal
    };
  }

  function renderRingHtml(options) {
    const opts = options || {};
    const sizePx = Number.isFinite(Number(opts.size)) ? Math.max(64, Math.round(Number(opts.size))) : 128;
    const vb = Number.isFinite(Number(opts.viewBoxSize)) ? Number(opts.viewBoxSize) : 128;
    const thickness = Number.isFinite(Number(opts.thickness)) ? Number(opts.thickness) : 24;
    const radius = Number.isFinite(Number(opts.radius)) ? Number(opts.radius) : Math.round((vb - thickness - 12) / 2);
    const cx = vb / 2;
    const cy = vb / 2;
    const layers = buildRingLayers({
      progress: opts.progress,
      state: opts.state,
      variant: opts.variant,
      color: opts.color,
      colors: opts.colors,
      cx: cx,
      cy: cy,
      radius: radius,
      thickness: thickness
    });
    const bare = Boolean(opts.bare);
    const label = opts.label != null ? String(opts.label) : '';
    const ariaLabel = opts.ariaLabel != null ? String(opts.ariaLabel) : (label || '环形进度');
    const statusText = opts.statusText != null ? String(opts.statusText) : DEFAULT_STATUS_TEXT[layers.state];
    const valueText = opts.valueText != null ? String(opts.valueText) : (layers.state === 'indeterminate' ? '···' : (layers.displayPct + '%'));
    const labelText = opts.labelText != null ? String(opts.labelText) : '';
    const errorText = opts.errorText != null ? String(opts.errorText) : '';
    const classes = [
      'ppr-root',
      'ppb-state-' + layers.state,
      bare ? 'is-bare' : '',
      layers.isZero ? 'is-zero' : '',
      layers.isComplete ? 'is-complete' : '',
      opts.className ? String(opts.className) : ''
    ].filter(Boolean).join(' ');
    const ariaNowAttr = layers.state === 'indeterminate' ? '' : ' aria-valuenow="' + layers.displayPct + '"';

    return '<div class="' + classes + '" data-ppr-state="' + layers.state + '" data-ppr-progress="' + layers.pct + '" style="--ppr-size:' + sizePx + 'px;--ppr-c1:' + layers.palette.c1 + '">'
      + '<div class="ppr-stage" role="progressbar" aria-label="' + escHtml(ariaLabel) + '" aria-valuemin="0" aria-valuemax="100"' + ariaNowAttr + '>'
      + '<svg class="ppr-svg" viewBox="0 0 ' + vb + ' ' + vb + '" aria-hidden="true">'
      + '<defs>' + layers.defs + '</defs>'
      + layers.markup
      + '</svg>'
      + '<div class="ppr-center">'
      + '<strong class="ppr-center-val" style="color:' + layers.palette.c1 + '">' + escHtml(valueText) + '</strong>'
      + (labelText ? '<small class="ppr-center-lbl">' + escHtml(labelText) + '</small>' : '')
      + '</div></div>'
      + (!bare && (label || opts.showStatus !== false) ? '<div class="ppr-caption">' + (label ? '<span>' + escHtml(label) + '</span>' : '') + (opts.showStatus !== false ? '<span class="ppb-status-tag">' + escHtml(statusText) + '</span>' : '') + '</div>' : '')
      + (layers.state === 'error' && errorText ? '<div class="ppr-note" role="status">' + escHtml(errorText) + '</div>' : '<div class="ppr-note" hidden></div>')
      + '</div>';
  }

  function mountRing(container, options) {
    if (!container) return null;
    container.innerHTML = renderRingHtml(options);
    return container.firstElementChild;
  }

  function updateRing(rootEl, options) {
    if (!rootEl || !rootEl.parentElement) return null;
    const html = renderRingHtml(options);
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    const next = tpl.content.firstElementChild;
    rootEl.replaceWith(next);
    return next;
  }

  global.PixelProgressBar = {
    renderHtml: renderHtml,
    mount: mount,
    update: update,
    clampProgress: clampProgress,
    buildRingLayers: buildRingLayers,
    renderRingHtml: renderRingHtml,
    mountRing: mountRing,
    updateRing: updateRing,
    THEME_PALETTES: THEME_PALETTES
  };
})(typeof window !== 'undefined' ? window : this);
