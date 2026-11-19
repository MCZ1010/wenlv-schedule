(function () {
  var el = document.getElementById('chart-daily');
  if (!el || !window.SCHEDULE) return;

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var green = style.getPropertyValue('--green').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  var dates = [], idx = {};
  window.SCHEDULE.forEach(function (r) {
    if (!(r[0] in idx)) { idx[r[0]] = dates.length; dates.push(r[0]); }
  });
  dates.sort(function (a, b) {
    function k(s) { var p = s.split('.'); return (+p[0]) * 100 + (+p[1]); }
    return k(a) - k(b);
  });
  idx = {};
  dates.forEach(function (d, i) { idx[d] = i; });

  var series = [
    { key: '文', name: '文旅启韵', color: accent },
    { key: '园', name: '公园聚力', color: accent2 },
    { key: '自', name: '自然教育', color: green }
  ];
  var counts = {};
  series.forEach(function (s) {
    counts[s.key] = dates.map(function () { return 0; });
  });
  window.SCHEDULE.forEach(function (r) {
    counts[r[6]][idx[r[0]]] += 1;
  });

  var chart = echarts.init(el, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    color: series.map(function (s) { return s.color; }),
    grid: { left: 40, right: 12, top: 46, bottom: 58 },
    legend: {
      top: 0,
      left: 0,
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 16,
      textStyle: { color: muted, fontSize: 11 }
    },
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(123,75,148,.06)' } },
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, interval: 0, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: muted, fontSize: 10 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: series.map(function (s, i) {
      return {
        name: s.name,
        type: 'bar',
        stack: 'total',
        barMaxWidth: 18,
        itemStyle: {
          color: s.color,
          borderColor: '#FBF8F3',
          borderWidth: 1,
          borderRadius: i === series.length - 1 ? [2, 2, 0, 0] : 0
        },
        data: counts[s.key]
      };
    })
  });
  window.addEventListener('resize', function () { chart.resize(); });

  /* 点击柱子跳转到对应日期 */
  chart.on('click', function (p) {
    var target = document.getElementById('d' + p.name.replace('.', '-'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
