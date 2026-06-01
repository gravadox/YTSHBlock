function isScheduleActive(opts) {
  if (!opts.scheduleEnabled) return true;
  const now = new Date();
  const day = now.getDay();
  const days = Array.isArray(opts.scheduleDays) ? opts.scheduleDays : [1,2,3,4,5];
  if (!days.includes(day)) return false;
  const parse = t => { const [h,m] = (t || '09:00').split(':').map(Number); return h*60+m; };
  const cur = now.getHours()*60 + now.getMinutes();
  const from = parse(opts.scheduleFrom), to = parse(opts.scheduleTo);
  return from <= to ? cur >= from && cur <= to : cur >= from || cur <= to;
}
