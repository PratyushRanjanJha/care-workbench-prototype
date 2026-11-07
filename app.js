// Care Workbench prototype: vanilla JS, no build step.
(function () {
  const P = window.PATIENTS;
  const byId = Object.fromEntries(P.map(p => [p.id, p]));

  // ---------------- state ----------------
  const S = {
    view: "queue", sel: "P1", pend: null,
    w: { U: 0.35, D: 0.30, M: 0.25, R: 0.10 }, rulesOn: true,
    override: {},            // id -> {adj, reason}
    open: {},                // queue "why" expanded
    resolved: {},            // conflict id -> 'a'|'b'
    actions: {},             // `${pid}:${i}` -> 'accepted'|'dismissed'
    contact: {},             // `${pid}:${num}` -> outcome
    call: {},                // pid -> call state
    done: {},                // pid -> true when note signed
    merged: false, owner: null,
    verified: false, lcsw: false,
    feedLate: false, deceased: false,
    conversations: 0, log: []
  };
  let clock = 8 * 60 + 2; // simulated Monday morning, advances with each action
  const now = () => { const h = Math.floor(clock / 60), m = clock % 60; return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`; };
  function log(type, msg) { clock += 1; S.log.unshift({ t: now(), type, msg }); }
  function toast(m) { const t = document.getElementById("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2200); }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------------- ranking ----------------
  function score(p) { const c = p.comp, w = S.w; return Math.round((w.U * c.U + w.D * c.D + w.M * c.M + w.R * c.R + 1e-6) * 100) / 100; }
  function ranked() {
    let list = P.filter(p => !(S.deceased && p.id === "P2"));
    return list.map(p => {
      const ov = S.override[p.id];
      const key = (S.rulesOn ? p.pin : 0) + score(p) + (ov ? ov.adj : 0) - (S.done[p.id] ? 100 : 0);
      return { p, s: score(p), key };
    }).sort((a, b) => b.key - a.key).map((x, i) => ({ ...x, rank: i + 1 }));
  }

  // ---------------- helpers ----------------
  const chip = (k, t) => `<span class="chip ${k}">${esc(t)}</span>`;
  const av = p => `<span class="av" style="background:${p.color}">${p.initials}</span>`;
  function patientMeds(p) { let m = p.meds.slice(); if (p.id === "P5" && S.merged) m.push(["Donepezil 5 mg", "Daily · started 14 Oct", "Filled 14 Oct (merged record)", "Yes", "New: check dizziness", "High"]); return m; }
  function patientSummary(p) {
    let s = p.summary.slice();
    if (p.id === "P5" && S.merged) s = s.concat([["After merging M-90015: ED visit for a fall on 30 Oct, 16 days after starting donepezil.", "ADT + PBM (merged)"], ["A second case manager (J. Kim) is assigned on the other record.", "CM system"]]);
    return s;
  }
  function chipsFor(p) {
    let c = p.chips.slice();
    if (S.feedLate && p.id === "P1") c = c.map(x => x[1].includes("not filled") ? ["stale", "‘Not filled’ paused: pharmacy feed late"] : x);
    if (p.id === "P5" && S.merged) c = c.filter(x => !x[1].includes("duplicate")).concat([["green", "Records merged"]]);
    if (p.id === "P4" && S.verified) c = [["green", "Discharged 8 Nov · at Hope Street Shelter"], ["blue", "7-day BH follow-up due 15 Nov"], ["blue", "Restricted record"]];
    if (S.done[p.id]) c = [["green", "Contacted today · note signed"]];
    return c;
  }

  // ---------------- views ----------------
  function vQueue() {
    const r = ranked();
    const urgent = r.filter(x => x.p.pin || x.s >= 0.65).length;
    const kpis = `<div class="kpis">
      <div class="kpi"><span class="muted small">Conversations today</span><b>${S.conversations}</b><span class="small muted">goal 4 (pilot) · 5 (12 mo)</span></div>
      <div class="kpi"><span class="muted small">Urgent today</span><b>${urgent}</b><span class="small muted">hard rules pin these</span></div>
      <div class="kpi"><span class="muted small">Acuity-weighted load</span><b style="color:var(--or)">104%</b><span class="small"><a href="#" data-act="toast" data-m="Rebalance suggestion sent to supervisor">suggest rebalance</a></span></div>
      <div class="kpi"><span class="muted small">New alerts since Thu 5 pm</span><b>6</b><span class="small muted">ADT 3 · PBM 2 · lab 1</span></div>
      <div class="kpi"><span class="muted small">Data health</span><b style="font-size:15px;margin-top:6px">${S.feedLate ? "⚠ Pharmacy feed late" : "All feeds on time"}</b><span class="small muted">ADT 8:00 · PBM ${S.feedLate ? "Sat 6 am" : "7:40"}</span></div></div>`;
    const feed = S.feedLate ? `<div class="alert warn"><b>Pharmacy feed is 26 hours late.</b> Rules that depend on fills (“discharge meds not filled”, refill gaps) are paused until it arrives (rule H5).</div>` : "";
    const dead = S.deceased ? `<div class="alert info">Denise Fakename removed from today’s queue: date of death received from eligibility (rule H1 stop signal). Confirm-and-close task created.</div>` : "";
    const ctrl = `<div class="card"><div class="row" style="justify-content:space-between">
      <div><div class="h">How the order is decided</div><span class="small">Hard rules first (TOC clock, safety, stop signals), then <b>Priority = ${S.w.U.toFixed(2)} Urgency + ${S.w.D.toFixed(2)} Deadline + ${S.w.M.toFixed(2)} Modifiable risk + ${S.w.R.toFixed(2)} Reachable</b>. Reachability sets the time slot, not the priority.</span></div>
      <label class="small row"><input type="checkbox" data-act="rules" ${S.rulesOn ? "checked" : ""}> Hard rules on</label></div>
      <div class="row small" style="margin-top:8px">${["U", "D", "M", "R"].map(k => `<label>${{ U: "Urgency", D: "Deadline", M: "Modifiable", R: "Reachable" }[k]} <input type="range" min="0" max="0.6" step="0.05" value="${S.w[k]}" data-act="w" data-k="${k}"> ${S.w[k].toFixed(2)}</label>`).join("")}
      <button class="btn sm" data-act="resetw">Reset weights</button><span class="muted">Try turning hard rules off: Jasmine drops below Marcus.</span></div></div>`;
    const rows = r.map(({ p, s, rank }) => {
      const ov = S.override[p.id];
      const why = S.open[p.id] ? `<div class="why"><div class="row" style="gap:24px;align-items:flex-start">
        <div style="min-width:260px"><div class="h">Score ${s.toFixed(2)}${S.rulesOn && p.pin ? ` · pinned by ${esc(p.rule)}` : ""}</div>
        ${["U", "D", "M", "R"].map(k => `<div class="row small" style="gap:6px"><span style="width:90px">${{ U: "Urgency", D: "Deadline", M: "Modifiable", R: "Reachable" }[k]}</span><div class="bar" style="width:120px"><i style="width:${p.comp[k] * 100}%"></i></div>${p.comp[k]}</div>`).join("")}
        <div class="small muted" style="margin-top:4px">Plan risk score (tie-break only): ${esc(p.planRisk)}</div></div>
        <div style="flex:1"><div class="h">Why today: drivers with sources</div>${p.drivers.map(d => `<div class="small">• ${esc(d[0])}<span class="src">${esc(d[1])}</span></div>`).join("")}
        <div class="row" style="margin-top:8px"><button class="btn sm" data-act="ovr" data-id="${p.id}" data-d="up">Move up…</button><button class="btn sm" data-act="ovr" data-id="${p.id}" data-d="down">Snooze…</button>${ov ? `<span class="small muted">Override: ${esc(ov.reason)} <a href="#" data-act="unovr" data-id="${p.id}">undo</a></span>` : ""}</div></div></div></div>` : "";
      return `<div class="qrow">
        <div class="rank" style="background:${S.done[p.id] ? "#9AA5B1" : p.color}">${rank}</div>
        <div><div class="row" style="gap:8px">${av(p)}<div><b>${esc(p.name)}</b> ${S.rulesOn && p.pin ? '<span class="pin">PINNED</span>' : ""}<div class="small muted">${p.age} ${p.sex} · ${esc(p.plan)} · ${esc(p.lang)}</div></div></div></div>
        <div>${chipsFor(p).map(c => chip(c[0], c[1])).join("")}</div>
        <div class="small"><b>Deadline</b><br>${esc(p.deadline)}</div>
        <div class="small"><b>Best way to reach</b><br>${esc(p.slot)}</div>
        <div class="row" style="flex-direction:column;align-items:stretch;gap:6px">
          <button class="btn p sm" data-act="go" data-v="m360" data-id="${p.id}">Open</button>
          <button class="btn sm" data-act="why" data-id="${p.id}">${S.open[p.id] ? "Hide why" : `Why #${rank}?`}</button></div>
        ${why}</div>`;
    }).join("");
    return `<div class="grid">${feed}${dead}${kpis}${ctrl}<div class="card"><div class="h">My day · ${r.length} members need you</div>${rows}</div></div>`;
  }

  function vM360() {
    const p = byId[S.sel];
    const sw = `<div class="row" style="margin-bottom:12px">${P.map(x => `<button class="btn sm ${x.id === p.id ? "p" : ""}" data-act="sel" data-id="${x.id}">${x.initials} ${x.name.split(" ")[0]}</button>`).join("")}</div>`;
    let alerts = "";
    if (p.id === "P4" && !S.verified) alerts += `<div class="alert warn"><b>Status unknown.</b> Admitted 3 Nov, no discharge message for 6 days. Outreach is held until status is verified (rule H3). <button class="btn sm o" data-act="verify">Call facility to verify</button></div>`;
    if (p.id === "P4" && S.verified) alerts += `<div class="alert ok">Verified 9:12 am: discharged Sun 8 Nov to Hope Street Shelter. Outreach unlocked; 7-day BH follow-up due 15 Nov.</div>`;
    if (p.restricted) alerts += `<div class="alert info"><b>1 restricted record hidden</b> (substance-use, 42 CFR Part 2). No consent on file and you are not the BH case manager. ${S.lcsw ? "<b>Routed to LCSW D. Rivera ✓</b>" : '<button class="btn sm" data-act="lcsw">Route to LCSW</button>'} <span class="small muted">Every view of this record is logged.</span></div>`;
    if (p.duplicate && !S.merged) {
      const d = p.duplicate;
      alerts += `<div class="alert warn"><b>Possible duplicate record: ${d.other} “${esc(d.otherName)}”.</b> Merge is never automatic.
      <table style="margin:8px 0;background:#fff"><tr><th>Field</th><th>${p.mid}</th><th>${d.other}</th></tr>${d.match.map(m => `<tr><td>${m[0]}</td><td>${esc(m[1])}</td><td>${esc(m[2])}</td></tr>`).join("")}</table>
      <button class="btn g sm" data-act="merge">Same person: merge</button> <button class="btn sm" data-act="toast" data-m="Marked as different people; won’t ask again">Different people</button></div>`;
    }
    if (p.duplicate && S.merged) alerts += `<div class="alert ok"><b>Merged.</b> Revealed: ${p.duplicate.reveals.map(r => `${esc(r[0])} ${esc(r[1])}`).join(" · ")}. ${S.owner ? `Case owner: <b>${S.owner}</b> (other nurse notified).` : `Two case managers: <button class="btn sm" data-act="owner" data-o="Maria Alvarez">Keep with me</button> <button class="btn sm" data-act="owner" data-o="J. Kim">Hand to J. Kim</button>`}</div>`;

    const contacts = p.contacts.map(c => { const o = S.contact[p.id + ":" + c.num]; const st = o === "wrong" || o === "dead" ? "dead" : c.status;
      return `<div class="contact ${st}"><div class="row" style="justify-content:space-between"><b class="${st === "dead" ? "status-dead" : ""}">${esc(c.label)} · ${c.num}</b>${c.status === "best" && st !== "dead" ? chip("blue", "Try first") : ""}</div><div class="small muted">${esc(o ? "Today: " + o : c.note)}</div></div>`; }).join("");
    const conf = p.conflicts.length ? p.conflicts.map(c => { const r = S.resolved[c.id];
      return `<div class="conf"><b>${esc(c.title)}</b>${["a", "b"].map(k => `<div class="opt ${r === k ? "sel" : ""}"><span>${esc(c[k][1])}<span class="src">${esc(c[k][0])}</span>${c.suggest === k ? ' <span class="chip blue">suggested</span>' : ""}</span>${r ? (r === k ? "<b>✓ chosen</b>" : "") : `<button class="btn sm" data-act="res" data-c="${c.id}" data-k="${k}">Use this</button>`}</div>`).join("")}<div class="small muted" style="margin-top:6px">${esc(c.why)}</div></div>`; }).join("") : `<div class="small muted">No conflicts.</div>`;
    const acts = p.actions.map((a, i) => { const st = S.actions[p.id + ":" + i];
      return `<div class="field ${st === "accepted" ? "ok" : ""}"><span><b>${esc(a[0])}</b><br><span class="small muted">Because: ${esc(a[1])}</span></span>${st ? `<span class="small">${st}</span>` : `<span class="row" style="flex-wrap:nowrap"><button class="btn sm g" data-act="act" data-i="${i}" data-s="accepted">Accept</button><button class="btn sm" data-act="act" data-i="${i}" data-s="dismissed">Dismiss</button></span>`}</div>`; }).join("");
    const meds = `<table><tr><th>Medicine</th><th>Discharge / prescribed</th><th>Pharmacy</th><th>Claims</th><th>Status</th><th>Confidence</th></tr>${patientMeds(p).map(m => `<tr><td><b>${esc(m[0])}</b></td><td>${esc(m[1])}</td><td>${esc(m[2])}</td><td>${esc(m[3])}</td><td>${/Not|Must|Conflict|Gap|Never|Overuse|New|Runs/.test(m[4]) ? chip("urgent", m[4]) : chip("green", m[4])}</td><td>${esc(m[5])}</td></tr>`).join("")}</table>`;
    const tl = p.timeline.map(t => `<div class="tl"><b>${esc(t[0])}</b><span>${esc(t[1])}</span><span class="small"><span class="dot ${t[2]}"></span>${t[2]}</span></div>`).join("");
    const outBlocked = (p.id === "P4" && !S.verified);
    return `${sw}${alerts}
    <div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between"><div class="row">${av(p)}<div><b style="font-size:17px">${esc(p.name)}</b> <span class="muted">${p.mid} · ${p.age} ${p.sex} · ${esc(p.plan)} · ${esc(p.lang)}</span><div class="small">${esc(p.headline)}</div></div></div>
    <button class="btn p" data-act="go" data-v="outreach" data-id="${p.id}" ${outBlocked ? "disabled title='Verify status first'" : ""}>Start outreach →</button></div></div>
    <div class="three">
      <div class="grid" style="align-content:start"><div class="card"><div class="h">Best contact</div>${contacts}</div>
        <div class="card"><div class="h">Authorisations</div>${p.auths.length ? p.auths.map(a => `<div class="small"><b>${esc(a[0])}</b><br>${chip("urgent", a[1])}</div>`).join("") : '<span class="small muted">None open</span>'}</div>
        <div class="card"><div class="h">Social needs</div><div class="small"><b>${esc(p.sdoh[0])}</b><br>${chip(p.sdoh[2] === "stale" ? "stale" : "green", p.sdoh[1])}${p.sdoh[2] === "stale" ? '<div class="muted">Stale: shown, but can’t trigger actions</div>' : ""}</div></div></div>
      <div class="grid" style="align-content:start">
        <div class="card"><div class="row" style="justify-content:space-between"><div class="h">AI summary · draft, read before acting</div><span class="row"><button class="btn sm" data-act="ai" data-r="accepted">Looks right</button><button class="btn sm" data-act="ai" data-r="flagged">Flag an error</button></span></div>
          ${p.id === "P5" && !S.merged ? '<div class="alert warn small">Summary may be incomplete until the duplicate is resolved.</div>' : ""}
          ${patientSummary(p).map(s => `<div style="margin-bottom:4px">${esc(s[0])}<span class="src">${esc(s[1])}</span></div>`).join("")}
          <div class="small muted" style="margin-top:6px"><b>Not in this summary:</b> ${esc(p.id === "P5" && S.merged ? "Nothing outstanding" : p.notInSummary)}</div></div>
        <div class="card"><div class="h">Medicines reconciled across sources</div>${meds}</div>
        <div class="card"><div class="h">Timeline · one line per source</div>${tl}</div></div>
      <div class="grid" style="align-content:start">
        <div class="card"><div class="h">Needs your judgment</div>${conf}</div>
        <div class="card"><div class="h">Next best actions</div>${acts}</div></div></div>`;
  }

  function callState(p) {
    if (!S.call[p.id]) S.call[p.id] = { live: false, confirmed: {}, med: {}, q: {}, bullets: "", red: false, crisis: false, signed: false };
    return S.call[p.id];
  }
  function draftNote(p, c) {
    const lines = [];
    lines.push(`${p.id === "P1" ? "TCM interactive contact" : "Telephonic outreach"} with ${p.id === "P5" ? "authorised representative (daughter Lucia), Spanish interpreter" : "member"} on ${window.TODAY}, ${now()}.`);
    p.guide.prefilled.forEach((f, i) => { if (c.confirmed[i]) lines.push(`${f[0]}: ${f[1]} (confirmed; source ${f[2]}).`); });
    const meds = Object.entries(c.med).map(([m, a]) => `${m}: ${a}`);
    if (meds.length) lines.push(`Medication reconciliation completed: ${meds.join("; ")}.`);
    const qs = p.guide.questions.filter((q, i) => c.q[i]);
    if (qs.length) lines.push(`Discussed: ${qs.map(q => q.replace(/[?¿]/g, "")).join("; ")}.`);
    if (c.red) lines.push("Red-flag symptoms reviewed: escalation script followed, member advised to call 911 for breathlessness at rest or chest pain.");
    if (c.bullets.trim()) lines.push(`Nurse notes: ${c.bullets.trim()}`);
    lines.push("Every statement traces to a confirmed field or the nurse’s notes; nothing unconfirmed is written as fact.");
    return lines.join("\n");
  }

  function vOutreach() {
    const p = byId[S.sel], c = callState(p);
    const sw = `<div class="row" style="margin-bottom:12px">${P.map(x => `<button class="btn sm ${x.id === p.id ? "p" : ""}" data-act="sel" data-id="${x.id}">${x.initials} ${x.name.split(" ")[0]}</button>`).join("")}</div>`;
    if (p.id === "P4" && !S.verified) return sw + `<div class="alert warn"><b>Outreach held:</b> Jasmine’s status is unknown after a behavioural-health admission (rule H3). Verify where she is first.</div><button class="btn o" data-act="verify">Call facility to verify</button>`;
    if (S.deceased && p.id === "P2") return sw + `<div class="alert info"><b>All outreach blocked:</b> date of death received (rule H1). Confirm-and-close with condolence protocol.</div>`;
    let warn = p.id === "P5" && !S.merged ? `<div class="alert warn">Duplicate record not merged yet: consent and history may be incomplete. <button class="btn sm" data-act="go" data-v="m360" data-id="P5">Review in Member 360</button></div>` : "";
    const contacts = p.contacts.map(ct => { const k = p.id + ":" + ct.num, o = S.contact[k]; const dead = o === "wrong" || o === "dead" || ct.status === "dead";
      return `<div class="contact ${dead ? "dead" : ct.status}"><b class="${dead ? "status-dead" : ""}">${esc(ct.label)}</b><div>${ct.num}</div><div class="small muted">${esc(ct.note)}</div>
      ${o ? `<div class="small"><b>Outcome: ${o}</b></div>` : (dead ? "" : `<div class="row" style="margin-top:6px;gap:4px">${[["connected", "Connected"], ["noanswer", "No answer"], ["wrong", "Wrong person"], ["dead", "Not in service"]].map(b => `<button class="btn sm ${b[0] === "connected" ? "g" : ""}" data-act="dial" data-n="${ct.num}" data-o="${b[0]}">${b[1]}</button>`).join("")}</div>`)}</div>`; }).join("");
    if (!c.live && !c.signed) return sw + warn + `<div class="two"><div class="card"><div class="h">1 · Outreach plan: ranked numbers</div>${contacts}<div class="small muted">Each outcome re-ranks the numbers for the whole team. “Wrong person” and “Not in service” retire a number.</div></div>
      <div class="card"><div class="h">Before you dial</div><div class="small"><b>${esc(p.name)}</b> · ${esc(p.deadline)}<br>Best time: <b>${esc(p.slot)}</b></div>
      <div class="h" style="margin-top:12px">Suggested questions (from gaps in the data)</div>${p.guide.questions.map(q => `<div class="small">• ${esc(q)}</div>`).join("")}
      <div class="alert info small" style="margin-top:12px">Recording and transcription are <b>off</b> unless the member agrees. The note drafts from what you confirm and type.</div></div></div>`;

    if (c.signed) return sw + `<div class="alert ok"><b>Note signed ${now()}.</b> One entry filled: ${["TCM / contact record", "Med reconciliation (HEDIS TRC)", "Care plan update", "Audit note"].map(x => chip("green", "✓ " + x)).join("")}</div>
      <div class="two"><div class="card"><div class="h">Signed note</div><pre style="white-space:pre-wrap;font:inherit;font-size:13px">${esc(c.note)}</pre></div>
      <div class="card"><div class="h">Tasks created on sign</div>${p.guide.tasks.map(t => `<div class="field ok"><span>${esc(t[0])}</span><span class="small">${esc(t[1])}</span></div>`).join("")}
      <button class="btn p" style="margin-top:10px" data-act="go" data-v="queue">Back to My day</button></div></div>`;

    const pre = p.guide.prefilled.map((f, i) => `<div class="field ${c.confirmed[i] ? "ok" : ""}"><span><span class="small muted">${esc(f[0])}</span><br><b>${esc(f[1])}</b><span class="src">${esc(f[2])}</span></span>${c.confirmed[i] ? "✓" : `<button class="btn sm" data-act="conf" data-i="${i}">Confirm</button>`}</div>`).join("");
    const medOpts = ["Taking", "Stopped", "Not picked up", "Unsure"];
    const medrec = p.guide.medrec.map(m => `<div class="field"><span>${esc(m)}</span><select data-act="med" data-m="${esc(m)}"><option value="">Member says…</option>${medOpts.map(o => `<option ${c.med[m] === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>`).join("");
    const qs = p.guide.questions.map((q, i) => `<label class="small" style="display:block;margin:3px 0"><input type="checkbox" data-act="q" data-i="${i}" ${c.q[i] ? "checked" : ""}> ${esc(q)}</label>`).join("");
    const crisis = c.crisis ? `<div class="crisis"><b>Crisis script</b><ol class="small"><li>Stay on the line. Ask directly about safety.</li><li>Warm-transfer to 988 (Suicide &amp; Crisis Lifeline), or 911 if in immediate danger.</li><li>Notify supervisor; the note panel is locked until the crisis is closed.</li></ol><button class="btn sm" data-act="crisis">Close crisis</button></div>` : "";
    const nDone = Object.keys(c.confirmed).length + Object.keys(c.med).length;
    return sw + warn + `<div class="alert ok small">On call · ${esc(p.name)} · ${now()} · recording off (typing mode)</div>${crisis}
      <div class="three"><div class="card"><div class="h">Outreach plan</div>${contacts}</div>
      <div class="grid" style="align-content:start"><div class="card"><div class="h">2 · Call guide: pre-filled, confirm don’t retype</div>${pre}</div>
        <div class="card"><div class="h">Medication reconciliation (counts for HEDIS TRC)</div>${medrec}</div>
        <div class="card"><div class="h">Suggested questions</div>${qs}
          <div class="row" style="margin-top:8px"><label class="small"><input type="checkbox" data-act="red" ${c.red ? "checked" : ""}> Red flags reviewed (breathless at rest, chest pain, +2 kg in 3 days)</label><button class="btn sm o" data-act="crisis">Crisis on call</button></div></div></div>
      <div class="card"><div class="h">3 · Live note: AI draft from your answers</div>
        <textarea class="note" placeholder="Quick bullets, e.g. ‘didn’t know to stop lisinopril, no ride Thurs’" data-act="bul">${esc(c.bullets)}</textarea>
        <div class="h" style="margin-top:8px">Draft</div><div class="small" style="white-space:pre-wrap;background:#F7F8FC;border:1px solid #DFE5F3;border-radius:8px;padding:8px">${esc(draftNote(p, c))}</div>
        <div class="h" style="margin-top:8px">One entry fills</div>${["TCM contact", "Med rec (TRC)", "Care plan", "Audit note"].map(x => chip("blue", x)).join("")}
        <div class="h" style="margin-top:8px">Tasks to create on sign</div>${p.guide.tasks.map(t => `<div class="small">☐ ${esc(t[0])} <span class="muted">${esc(t[1])}</span></div>`).join("")}
        <button class="btn g" style="margin-top:10px;width:100%" data-act="sign" ${nDone === 0 || c.crisis ? "disabled" : ""}>Review &amp; sign</button>
        <div class="small muted">${nDone === 0 ? "Confirm at least one field to sign." : "Nothing reaches the record until you sign."}</div></div></div>`;
  }

  function vEdge() {
    const cards = [
      ["Safety", "Status unknown after admission", "Outreach held; verify task", "Try it: Jasmine", "go:m360:P4"],
      ["Privacy", "Restricted record (42 CFR Part 2)", "Hidden; route to LCSW; views logged", "Try it: Jasmine", "go:m360:P4"],
      ["Safety", "Crisis disclosed on a call", "Crisis script; 988 warm transfer; note locked", "Try it: any call", "go:outreach:P1"],
      ["Safety", "Member has died", "All outreach blocked; confirm-and-close", S.deceased ? "Undo simulation" : "Simulate for Denise", "dead"],
      ["Data", "Pharmacy feed late", "Banner; fill-based rules paused", S.feedLate ? "Undo simulation" : "Simulate", "feed"],
      ["Data", "Possible duplicate member", "Side-by-side evidence; merge only on confirm", "Try it: Rosa", "go:m360:P5"],
      ["Data", "Two sources disagree", "Side-by-side; suggested source; choice logged", "Try it: Walter", "go:m360:P1"],
      ["Data", "Impossible lab value (A1c 91%)", "Plausibility check; de-duplicated", "Try it: Denise", "go:m360:P2"],
      ["Reach", "Wrong person answers", "Number retired for the whole team", "Try it: Marcus", "go:outreach:P3"],
      ["Reach", "Number not in service", "Struck out; next number promoted", "Try it: Walter", "go:outreach:P1"],
      ["Consent", "Caregiver without authorisation", "Clinical details hidden; send form", "See Walter’s wife", "go:m360:P1"],
      ["Consent", "Interpreter needed", "Auto-booked with the call slot", "Try it: Rosa", "go:outreach:P5"],
      ["Workload", "Caseload over 100%", "Rebalance suggested; supervisor approves", "See My day", "go:queue:P1"],
      ["Workload", "Override or snooze", "Reason required; logged; tunes weights", "See My day", "go:queue:P1"],
      ["AI", "Nurse spots an AI error", "Flag → correction logged → regenerated", "Try it: any summary", "go:m360:P1"],
      ["AI", "AI service down", "Screens work without summaries; manual note", "Info only", ""]
    ];
    return `<div class="card" style="margin-bottom:14px"><b>Built for bad days.</b> <span class="muted">One rule for all 16: say what’s known and unknown, block what could harm, give Maria one next step.</span></div>
      <div class="edge">${cards.map(c => `<div class="card"><div class="tag" style="color:var(--or)">${c[0]}</div><b>${c[1]}</b><div class="small muted" style="margin:4px 0 8px">${c[2]}</div>${c[4] ? `<button class="btn sm" data-act="edge" data-x="${c[4]}">${c[3]}</button>` : `<span class="small muted">${c[3]}</span>`}</div>`).join("")}</div>`;
  }

  function vAudit() {
    const n = t => S.log.filter(l => l.type === t).length;
    return `<div class="kpis" style="margin-bottom:14px">${[["Overrides", n("override")], ["Conflicts resolved", n("conflict")], ["AI actions accepted", S.log.filter(l => l.type === "action" && l.msg.includes("accepted")).length], ["AI summaries flagged", S.log.filter(l => l.type === "ai" && l.msg.includes("flagged")).length], ["Notes signed", n("sign")]].map(k => `<div class="kpi"><span class="small muted">${k[0]}</span><b>${k[1]}</b></div>`).join("")}</div>
      <div class="card"><div class="h">Audit log: every AI output, override and confirmation</div><div class="log">${S.log.length ? S.log.map(l => `<div><b>${l.t}</b> · <span class="chip">${l.type}</span> ${esc(l.msg)}</div>`).join("") : '<span class="muted">Nothing yet. Open a member and act.</span>'}</div></div>`;
  }

  function vAbout() {
    return `<div class="card" style="max-width:820px"><h3>What this prototype shows</h3>
      <p>A case-management workbench for a telephonic nurse case manager (Maria). It joins data the health plan already has, ranks her day by deadline and danger, and prepares every call. The AI drafts; Maria decides.</p>
      <ol><li><b>My day:</b> ranked queue. Change the weights or switch hard rules off and watch the order change. Open “Why #n?” to see drivers with sources, or override with a reason.</li>
      <li><b>Member 360:</b> one screen instead of six. Resolve conflicts (Walter), merge a duplicate record (Rosa), verify an unknown status (Jasmine).</li>
      <li><b>Outreach &amp; note:</b> log call outcomes; confirm pre-filled facts; reconcile meds; the note drafts itself; signing fills 4 records and creates tasks.</li>
      <li><b>Bad days:</b> 16 edge cases, several of them live (feed late, member died).</li>
      <li><b>Audit log:</b> everything you did, as an accreditation reviewer would see it.</li></ol>
      <p class="small muted">All data is synthetic. No backend: state resets on reload. Built for the HiLabs APM product case 2026–27.</p>
      <button class="btn" data-act="reset">Reset demo</button></div>`;
  }

  // ---------------- render + events ----------------
  function render() {
    document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.v === S.view));
    const v = { queue: vQueue, m360: vM360, outreach: vOutreach, edge: vEdge, audit: vAudit, about: vAbout }[S.view];
    let html = v();
    if (S.pend) {
      const q = S.pend, pp = byId[q.id];
      const reasons = q.d === "up" ? ["Member called back; wants to talk now", "New clinical information not yet in the data", "Caregiver only available this morning"] : ["Waiting on facility callback", "Already contacted by another team today", "Member asked to be called later"];
      html += `<div class="modal"><div class="card"><h3>${q.d === "up" ? "Move" : "Snooze"} ${esc(pp.name)}: why?</h3><p class="small muted">A reason is required. It is logged and used to tune the queue weights.</p>
        ${reasons.map(r => `<button class="btn" style="display:block;width:100%;text-align:left;margin-bottom:6px" data-act="ovrok" data-r="${esc(r)}">${esc(r)}</button>`).join("")}
        <div class="row" style="margin-top:8px"><input type="text" id="ovrtxt" placeholder="Or type a reason" style="flex:1"><button class="btn p" data-act="ovrok">Save</button><button class="btn" data-act="ovrno">Cancel</button></div></div></div>`;
    }
    document.getElementById("app").innerHTML = html;
  }
  function go(v, id) { S.view = v; if (id) S.sel = id; render(); window.scrollTo(0, 0); }

  document.getElementById("today").textContent = window.TODAY;
  document.getElementById("nav").addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(b.dataset.v); });

  const app = document.getElementById("app");
  app.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, p = byId[el.dataset.id || S.sel];
    if (el.tagName === "A") e.preventDefault();
    if (["w", "rules", "med", "q", "red", "bul"].includes(a)) return; // handled by change/input
    switch (a) {
      case "go": go(el.dataset.v, el.dataset.id); break;
      case "sel": S.sel = el.dataset.id; render(); break;
      case "why": S.open[p.id] = !S.open[p.id]; render(); break;
      case "resetw": S.w = { U: 0.35, D: 0.30, M: 0.25, R: 0.10 }; render(); break;
      case "ovr": S.pend = { id: p.id, d: el.dataset.d }; render(); break;
      case "ovrok": {
        const q = S.pend, pp = byId[q.id], txt = document.getElementById("ovrtxt").value.trim(), pick = el.dataset.r || txt;
        if (!pick) { toast("Pick or type a reason"); break; }
        S.override[q.id] = { adj: q.d === "up" ? 5 : -5, reason: pick }; S.pend = null;
        log("override", `${pp.name}: ${q.d === "up" ? "moved up" : "snoozed"}: “${pick}”`); toast("Override logged"); render(); break; }
      case "ovrno": S.pend = null; render(); break;
      case "unovr": delete S.override[p.id]; log("override", `${p.name}: override undone`); render(); break;
      case "res": { const c = p.conflicts.find(x => x.id === el.dataset.c); S.resolved[c.id] = el.dataset.k; log("conflict", `${p.name} · ${c.title}: chose “${c[el.dataset.k][1]}” (${c[el.dataset.k][0]})${c.suggest !== el.dataset.k ? " — differs from suggestion" : ""}`); toast("Choice logged for audit"); render(); break; }
      case "act": S.actions[p.id + ":" + el.dataset.i] = el.dataset.s; log("action", `${p.name} · “${p.actions[el.dataset.i][0]}” ${el.dataset.s}`); render(); break;
      case "ai": log("ai", `${p.name} · AI summary ${el.dataset.r}`); toast(el.dataset.r === "flagged" ? "Flag sent: correction logged, summary will regenerate" : "Thanks: counted toward accuracy metric"); render(); break;
      case "verify": S.verified = true; log("verify", "Jasmine Dummy · status verified with Riverside Behavioral: discharged 8 Nov to Hope Street Shelter"); toast("Status verified · outreach unlocked"); S.sel = "P4"; S.view = "m360"; render(); break;
      case "lcsw": S.lcsw = true; log("privacy", "Jasmine Dummy · restricted record routed to LCSW D. Rivera"); render(); break;
      case "merge": S.merged = true; log("merge", "Rosa Testcase · M-90015 merged into M-90005 after review"); toast("Merged: 3 hidden events surfaced"); render(); break;
      case "owner": S.owner = el.dataset.o; log("merge", `Rosa Testcase · case owner set to ${S.owner}; other nurse notified`); render(); break;
      case "dial": {
        const k = p.id + ":" + el.dataset.n, o = el.dataset.o; S.contact[k] = { connected: "connected", noanswer: "no answer", wrong: "wrong", dead: "dead" }[o];
        log("outreach", `${p.name} · ${el.dataset.n}: ${o}${o === "wrong" || o === "dead" ? " — number retired for whole team" : ""}`);
        if (o === "connected") { callState(p).live = true; toast("Connected · call guide open"); }
        else if (o === "noanswer") toast("Logged · next attempt scheduled inside the deadline window");
        else toast("Number retired · next ranked number promoted");
        render(); break; }
      case "conf": callState(p).confirmed[el.dataset.i] = true; render(); break;
      case "crisis": { const c = callState(p); c.crisis = !c.crisis; log("safety", `${p.name} · crisis protocol ${c.crisis ? "opened" : "closed"}`); render(); break; }
      case "sign": {
        const c = callState(p); c.note = draftNote(p, c); c.signed = true; c.live = false; S.done[p.id] = true; S.conversations++;
        log("sign", `${p.name} · note signed; filled TCM, med rec (TRC), care plan, audit; ${p.guide.tasks.length} tasks created`); toast(`Signed · ${p.guide.tasks.length} tasks created`); render(); break; }
      case "edge": {
        const x = el.dataset.x;
        if (x === "dead") { S.deceased = !S.deceased; log("stop", S.deceased ? "Denise Fakename · date of death received (simulated): removed from queue" : "Simulation undone"); go("queue"); }
        else if (x === "feed") { S.feedLate = !S.feedLate; log("feed", S.feedLate ? "Pharmacy feed late (simulated): fill-based rules paused" : "Pharmacy feed restored"); go("queue"); }
        else { const [, v, id] = x.split(":"); go(v, id); }
        break; }
      case "toast": toast(el.dataset.m); break;
      case "reset": location.reload(); break;
    }
  });
  app.addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.act === "w") { S.w[el.dataset.k] = parseFloat(el.value); render(); }
    if (el.dataset.act === "bul") { callState(byId[S.sel]).bullets = el.value; }
  });
  app.addEventListener("change", e => {
    const el = e.target, p = byId[S.sel];
    if (el.dataset.act === "rules") { S.rulesOn = el.checked; log("rules", `Hard rules ${el.checked ? "on" : "off"} (demo)`); render(); }
    if (el.dataset.act === "med") { if (el.value) callState(p).med[el.dataset.m] = el.value; else delete callState(p).med[el.dataset.m]; render(); }
    if (el.dataset.act === "q") { callState(p).q[el.dataset.i] = el.checked; render(); }
    if (el.dataset.act === "red") { callState(p).red = el.checked; render(); }
    if (el.dataset.act === "bul") { render(); }
  });

  render();
})();
