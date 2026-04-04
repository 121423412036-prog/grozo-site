(function(global) {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createCurveController(config) {
    var nav = document.getElementById(config.navId);
    var svg = document.getElementById(config.svgId);
    var path = document.getElementById(config.pathId);
    var gradient = document.getElementById(config.gradientId);

    if (!nav || !svg || !path) return null;

    var state = {
      metrics: null,
      frame: null,
      token: 0
    };

    var fillPath = null;

    function ensureFillPath() {
      if (fillPath) return fillPath;
      var fillId = (config.pathId || 'tabPath') + 'Fill';
      fillPath = document.getElementById(fillId);
      if (!fillPath) {
        fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fillPath.setAttribute('id', fillId);
        fillPath.setAttribute('fill', '#FFFFFF');
        fillPath.setAttribute('stroke', 'none');
        svg.insertBefore(fillPath, path);
      }
      return fillPath;
    }

    function listTabs() {
      return Array.prototype.slice.call(nav.querySelectorAll(config.tabSelector || '.tab'));
    }

    function getKey(el) {
      if (!el) return '';
      if (typeof config.keyFromElement === 'function') {
        return String(config.keyFromElement(el) || '');
      }
      var dataTab = el.getAttribute('data-tab');
      return String(dataTab || el.textContent || '').trim().toLowerCase();
    }

    function buildPath(metrics) {
      var baseY = 50;
      var topHeight = 10;
      return [
        'M0 ' + baseY,
        'L' + metrics.start + ' ' + baseY,
        'C' + metrics.curveStart + ' ' + baseY + ' ' + (metrics.curveStart - 10) + ' ' + topHeight + ' ' + (metrics.curveStart + metrics.shoulder) + ' ' + topHeight,
        'L' + (metrics.curveEnd - metrics.shoulder) + ' ' + topHeight,
        'C' + (metrics.curveEnd + 10) + ' ' + topHeight + ' ' + metrics.curveEnd + ' ' + baseY + ' ' + metrics.end + ' ' + baseY,
        'L' + metrics.navWidth + ' ' + baseY
      ].join(' ');
    }

    function buildFillPath(metrics) {
      var baseY = 50;
      var topHeight = 10;
      var bottomY = 58;
      return [
        'M0 ' + baseY,
        'L' + metrics.start + ' ' + baseY,
        'C' + metrics.curveStart + ' ' + baseY + ' ' + (metrics.curveStart - 10) + ' ' + topHeight + ' ' + (metrics.curveStart + metrics.shoulder) + ' ' + topHeight,
        'L' + (metrics.curveEnd - metrics.shoulder) + ' ' + topHeight,
        'C' + (metrics.curveEnd + 10) + ' ' + topHeight + ' ' + metrics.curveEnd + ' ' + baseY + ' ' + metrics.end + ' ' + baseY,
        'L' + metrics.navWidth + ' ' + baseY,
        'L' + metrics.navWidth + ' ' + bottomY,
        'L0 ' + bottomY,
        'Z'
      ].join(' ');
    }

    function getMetrics(tabEl, navWidth) {
      if (!tabEl) return null;
      var navRect = nav.getBoundingClientRect();
      var tabRect = tabEl.getBoundingClientRect();
      var width = Math.max(24, tabRect.width);
      var left = Math.max(0, tabRect.left - navRect.left);
      var pad = Number.isFinite(config.pad) ? config.pad : 18;
      return {
        navWidth: navWidth,
        start: Math.max(0, left - pad),
        end: Math.min(navWidth, left + width + pad),
        curveStart: left,
        curveEnd: left + width,
        shoulder: Math.max(10, Math.min(24, width * 0.28))
      };
    }

    function updateGradient(metrics) {
      if (!gradient || !metrics || !metrics.navWidth) return;
      var nw = metrics.navWidth;
      var fadeInX = metrics.start * 0.5;
      var fadeOutX = metrics.end + (nw - metrics.end) * 0.5;
      var centerX = (metrics.curveStart + metrics.curveEnd) / 2;
      var stops = [
        { x: 0, opacity: 0 },
        { x: fadeInX, opacity: 0.7 },
        { x: metrics.curveStart, opacity: 1 },
        { x: centerX, opacity: 1 },
        { x: metrics.curveEnd, opacity: 1 },
        { x: fadeOutX, opacity: 0.7 },
        { x: nw, opacity: 0 }
      ];
      gradient.setAttribute('x2', String(nw));
      gradient.innerHTML = stops.map(function(stop) {
        var pct = clamp((stop.x / nw) * 100, 0, 100).toFixed(2);
        return '<stop offset="' + pct + '%" stop-color="black" stop-opacity="' + stop.opacity + '"/>';
      }).join('');
    }

    function animateTo(from, to, duration) {
      if (state.frame) {
        cancelAnimationFrame(state.frame);
        state.frame = null;
      }
      var token = ++state.token;
      var startAt = performance.now();
      var easeOutCubic = function(t) { return 1 - Math.pow(1 - t, 3); };

      function step(now) {
        if (token !== state.token) return;
        var progress = Math.min(1, (now - startAt) / duration);
        var eased = easeOutCubic(progress);
        var lerp = function(a, b) { return a + (b - a) * eased; };

        var current = {
          navWidth: to.navWidth,
          start: lerp(from.start, to.start),
          end: lerp(from.end, to.end),
          curveStart: lerp(from.curveStart, to.curveStart),
          curveEnd: lerp(from.curveEnd, to.curveEnd),
          shoulder: lerp(from.shoulder, to.shoulder)
        };

        path.setAttribute('d', buildPath(current));
        ensureFillPath().setAttribute('d', buildFillPath(current));
        updateGradient(current);

        if (progress < 1) {
          state.frame = requestAnimationFrame(step);
        } else {
          state.frame = null;
          state.metrics = to;
        }
      }

      state.frame = requestAnimationFrame(step);
    }

    function setCurveForTab(tabEl, opts) {
      if (!tabEl) return;
      var navWidth = Math.max(1, Math.round(nav.getBoundingClientRect().width));
      var target = getMetrics(tabEl, navWidth);
      if (!target) return;

      svg.setAttribute('viewBox', '0 0 ' + navWidth + ' 58');

      var animate = !opts || opts.animate !== false;
      var duration = opts && Number.isFinite(opts.duration) ? opts.duration : 300;
      var reduceMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);

      if (!state.metrics) {
        state.metrics = target;
        path.setAttribute('d', buildPath(target));
        ensureFillPath().setAttribute('d', buildFillPath(target));
        updateGradient(target);
        return;
      }

      var sameWidth = Math.abs(navWidth - state.metrics.navWidth) <= 1;
      if (!animate || reduceMotion || duration <= 0 || !sameWidth) {
        state.metrics = target;
        path.setAttribute('d', buildPath(target));
        ensureFillPath().setAttribute('d', buildFillPath(target));
        updateGradient(target);
        return;
      }

      animateTo(state.metrics, target, duration);
    }

    function setActiveByElement(tabEl, opts) {
      if (!tabEl) return;
      listTabs().forEach(function(tab) {
        tab.classList.toggle(config.activeClass || 'active', tab === tabEl);
      });
      setCurveForTab(tabEl, opts || { animate: true, duration: 320 });
      if (typeof config.onChange === 'function') {
        config.onChange(getKey(tabEl), tabEl);
      }
    }

    function setActiveByKey(key, opts) {
      var normalized = String(key || '').trim().toLowerCase();
      var target = listTabs().find(function(tab) {
        return getKey(tab) === normalized;
      });
      if (target) setActiveByElement(target, opts);
    }

    function bind() {
      listTabs().forEach(function(tab) {
        tab.addEventListener('click', function() {
          setActiveByElement(tab, { animate: true, duration: 320 });
        });
      });
    }

    function getActiveTab() {
      return listTabs().find(function(tab) {
        return tab.classList.contains(config.activeClass || 'active');
      }) || null;
    }

    function refresh(opts) {
      var active = getActiveTab();
      if (active) setCurveForTab(active, opts || { animate: false });
    }

    bind();

    var initial = getActiveTab() || listTabs()[0];
    if (initial) {
      setCurveForTab(initial, { animate: false });
      if (typeof config.onChange === 'function') {
        config.onChange(getKey(initial), initial);
      }
    }

    global.addEventListener('resize', function() {
      refresh({ animate: false });
    });

    return {
      setActiveByKey: setActiveByKey,
      refresh: refresh
    };
  }

  global.initGrozoSvgTabBar = function(config) {
    try {
      return createCurveController(config || {});
    } catch (err) {
      console.warn('Failed to initialize tab curve:', err);
      return null;
    }
  };
})(window);
