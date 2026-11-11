// Live schedule text for these Pool Relay mock-ups. No hours or dates are typed into the pages: each element
// below fills in from the same published Pool Relay view as the calendar beside it.
//
//   data-live="hours"     this week's hours, day by day: the stretches when the chosen programs are in the water
//                         (holidays show as closed, late openings and early closings as they are booked)
//   data-live="through"   a sentence on how far the published schedule runs ("… runs through Wednesday, December 23."),
//                         or that it has no end date yet when it runs to the end of what the page reads
//   data-live="closures"  closures and changed hours coming up; the element hides when there are none
//   data-live="summary"   this week's hours (Monday to Sunday) on one line, days with the same hours run together:
//                         "Monday - Friday 6:00am – 3:00pm • Saturday no lap swim • Sunday 8:00am – 11:00am"
//
// Each takes data-view (the share token) and optional data-groups (group ids, "|"-separated; a group matches its
// subgroups too).
(function () {
  const TZ = "America/Los_Angeles";
  const API = "https://www.poolrelay.com/api/public/views/";

  const parts = (d) => Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d).map((p) => [p.type, p.value]));
  const P = parts(new Date());
  const TODAY = `${P.year}-${P.month}-${P.day}`;
  const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const dow = (iso) => new Date(iso + "T12:00:00Z").getUTCDay();
  const clock = (t) => { let [h, m] = t.split(":").map(Number); const ap = h >= 12 && h < 24 ? "pm" : "am"; h = h % 12 || 12; return m ? `${h}:${String(m).padStart(2, "0")}${ap}` : `${h}${ap}`; };
  const span = (a, b) => `${clock(a)} – ${clock(b)}`;
  const LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const md = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ── One fetch per view, shared by every element that reads it ───────────────
  const cache = {};
  const UNTIL = addDays(TODAY, 150);
  function feed(token) {
    const from = addDays(TODAY, -7), to = UNTIL;
    return (cache[token] ||= fetch(`${API}${token}/project?from=${from}&to=${to}`).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).then(({ occurrences, groups }) => {
      const up = {};
      const walk = (g, parent) => { up[g.id] = parent; (g.children || []).forEach((c) => walk(c, g.id)); };
      (groups || []).forEach((g) => walk(g, null));
      const ancestors = (id) => { const a = []; for (let g = id; g; g = up[g]) a.push(g); return a; };
      return (occurrences || []).map((o) => ({ ...o, groupsAll: (o.groupIds || []).flatMap(ancestors) }))
        .sort((x, y) => (x.date + (x.start || "")).localeCompare(y.date + (y.start || "")));
    }));
  }
  const pick = (list, el) => {
    const grps = el.dataset.groups ? el.dataset.groups.split("|") : null;
    return list.filter((o) => o.allDay || !grps || o.groupsAll.some((g) => grps.includes(g)));
  };
  const onDay = (o, d) => o.date <= d && (o.endDate || o.date) >= d;
  const isClosed = (o) => o.allDay && !o.notice && /clos/i.test(o.title);

  // The stretches of a day when anything picked is in the water, overlapping and touching blocks merged.
  function stretches(list, d) {
    const blocks = list.filter((o) => !o.allDay && o.date === d).map((o) => [o.start, o.end]).sort();
    const out = [];
    for (const [a, b] of blocks) {
      const last = out[out.length - 1];
      if (last && a <= last[1]) { if (b > last[1]) last[1] = b; } else out.push([a, b]);
    }
    return out;
  }

  const render = {
    hours(list, el) {
      let html = "";
      for (let i = 0; i < 7; i++) {
        const d = addDays(TODAY, i);
        const closed = list.find((o) => isClosed(o) && onDay(o, d));
        const s = stretches(list, d);
        const label = `${LONG[dow(d)]}, ${md(d)}`;
        const hrs = closed ? `<b>${esc(closed.title)}</b>` : s.length ? s.map(([a, b]) => esc(span(a, b))).join("<br>") : "Closed";
        html += `<tr${i === 0 ? ' class="is-today"' : ""}><td>${esc(i === 0 ? `Today (${label})` : label)}</td><td>${hrs}</td></tr>`;
      }
      return `<table class="hours">${html}</table>`;
    },
    through(list, el) {
      const t = list.filter((o) => !o.allDay && o.date >= TODAY);
      if (!t.length) return esc(el.dataset.empty || "");
      const last = t[t.length - 1].date;
      if (last > addDays(UNTIL, -7)) return "The published schedule has no end date yet.";
      return `The published schedule runs through ${esc(LONG[dow(last)])}, ${esc(md(last))}.`;
    },
    summary(list, el) {
      const clock0 = (t) => { let [h, m] = t.split(":").map(Number); const ap = h >= 12 && h < 24 ? "pm" : "am"; h = h % 12 || 12; return `${h}:${String(m).padStart(2, "0")}${ap}`; };
      const monday = addDays(TODAY, -((dow(TODAY) + 6) % 7));
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(monday, i);
        const s = stretches(list, d);
        const text = s.length ? s.map(([a, b]) => `${clock0(a)} – ${clock0(b)}`).join(" &amp; ") : esc(el.dataset.none || "closed");
        const last = days[days.length - 1];
        if (last && last.text === text) last.to = d; else days.push({ from: d, to: d, text });
      }
      const name = (r) => r.from === r.to ? LONG[dow(r.from)] : `${LONG[dow(r.from)]} - ${LONG[dow(r.to)]}`;
      return days.map((r) => `${esc(name(r))} ${r.text}`).join(" &bull; ");
    },
    closures(list, el) {
      const c = list.filter((o) => o.allDay && (o.endDate || o.date) >= TODAY);
      if (!c.length) { el.hidden = true; return ""; }
      el.hidden = false;
      const when = (o) => {
        const a = `${LONG[dow(o.date)]}, ${md(o.date)}`;
        return o.endDate && o.endDate !== o.date ? `${a} – ${LONG[dow(o.endDate)]}, ${md(o.endDate)}` : a;
      };
      return `<b>${esc(el.dataset.heading || "Holidays & Pool Closures")}</b>` +
        `<ul>${c.map((o) => `<li>${esc(when(o))}: ${esc(o.title)}</li>`).join("")}</ul>`;
    },
  };

  document.querySelectorAll("[data-live]").forEach((el) => {
    const fn = render[el.dataset.live];
    if (!fn) return;
    feed(el.dataset.view).then((list) => { el.innerHTML = fn(pick(list, el), el); el.classList.add("ready"); })
      .catch(() => { el.innerHTML = `<span class="muted">The live schedule could not be loaded. See the calendar below.</span>`; });
  });
})();
