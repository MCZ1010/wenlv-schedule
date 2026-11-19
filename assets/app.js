(function () {
  var V = window.VENUES, C = window.CATS, DATA = window.SCHEDULE, WD = window.WEEKDAYS;

  /* ---------- 分组 ---------- */
  var days = [];
  var map = {};
  DATA.forEach(function (r) {
    if (!map[r[0]]) { map[r[0]] = []; days.push(r[0]); }
    map[r[0]].push({
      date: r[0], start: r[1], end: r[2], name: r[3],
      desc: r[4], venue: r[5], cat: r[6]
    });
  });
  days.sort(function (a, b) {
    function k(s) { var p = s.split('.'); return (+p[0]) * 100 + (+p[1]); }
    return k(a) - k(b);
  });
  days.forEach(function (d) {
    map[d].sort(function (a, b) {
      if (a.start !== b.start) return a.start < b.start ? -1 : 1;
      return a.end < b.end ? -1 : 1;
    });
  });

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- 顶部数据 ---------- */
  var names = {};
  DATA.forEach(function (r) { names[r[3]] = 1; });
  var usedVenues = {};
  DATA.forEach(function (r) { usedVenues[r[5]] = 1; });
  document.getElementById('stat-days').textContent = days.length;
  document.getElementById('stat-names').textContent = Object.keys(names).length;
  document.getElementById('stat-slots').textContent = DATA.length;
  document.getElementById('stat-venues').textContent = Object.keys(usedVenues).length;

  /* ---------- 日期导航 ---------- */
  var navHtml = days.map(function (d) {
    return '<a href="#d' + d.replace('.', '-') + '" data-day="' + d + '">' + d + ' ' + WD[d] + '</a>';
  }).join('');
  document.getElementById('nav-days').innerHTML = navHtml;

  /* ---------- 筛选 ---------- */
  var active = 'all';
  var filterDefs = [
    { key: 'all', label: '全部板块', dot: '' },
    { key: '文', label: '文旅启韵', dot: 'wl' },
    { key: '园', label: '公园聚力', dot: 'gy' },
    { key: '自', label: '自然教育', dot: 'zr' }
  ];
  var filterBox = document.getElementById('filters');
  filterBox.innerHTML = filterDefs.map(function (f) {
    return '<button type="button" data-cat="' + f.key + '" class="' + (f.key === 'all' ? 'on' : '') + '">' +
      (f.dot ? '<span class="dot ' + f.dot + '"></span>' : '') + f.label + '</button>';
  }).join('');

  /* ---------- 日程渲染 ---------- */
  function renderDay(d) {
    var rows = map[d].filter(function (r) { return active === 'all' || r.cat === active; });
    if (!rows.length) return '';
    var body = rows.map(function (r) {
      var v = V[r.venue], c = C[r.cat];
      var venueHtml = '<div class="venue">' +
        (v.code ? '<span class="vcode">' + v.code + ' 点位</span>' : '') +
        '<span class="vname">' + esc(v.name) + '</span>' +
        (v.sub ? '<span class="vsub">' + esc(v.sub) + '</span>' : '') +
        '</div>';
      return '<li class="slot" data-cat="' + r.cat + '">' +
        '<div class="time">' + r.start + '–' + r.end + '</div>' +
        '<div><div class="name">' + esc(r.name) + '<span class="tag ' + c.cls + '">' + c.label + '</span></div>' +
        (r.desc ? '<div class="desc">' + esc(r.desc) + '</div>' : '') +
        '</div>' + venueHtml + '</li>';
    }).join('');
    return '<section class="day" id="d' + d.replace('.', '-') + '" data-day="' + d + '">' +
      '<div class="day-head"><span class="day-date">' + d + '</span>' +
      '<span class="day-week">' + WD[d] + '</span>' +
      '<span class="day-count">共 <b>' + rows.length + '</b> 场</span></div>' +
      '<ul class="slots">' + body + '</ul></section>';
  }

  function render() {
    document.getElementById('schedule').innerHTML = days.map(renderDay).join('');
    observeDays();
  }

  filterBox.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    active = btn.getAttribute('data-cat');
    Array.prototype.forEach.call(filterBox.children, function (b) {
      b.classList.toggle('on', b === btn);
    });
    render();
  });

  /* ---------- 导航高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#nav-days a'));
  function setActive(d) {
    navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-day') === d); });
  }
  var io;
  function observeDays() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.getAttribute('data-day'));
      });
    }, { rootMargin: '-130px 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('.day').forEach(function (s) { io.observe(s); });
  }

  render();
  setActive(days[0]);
})();
