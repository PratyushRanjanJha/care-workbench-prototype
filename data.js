// Synthetic data for the HiLabs APM case prototype.
// Every person, phone number (555-01xx) and facility here is fictional. "Today" = Mon 9 Nov 2026, 8:00 am.
window.TODAY = "Mon 9 Nov 2026";

window.PATIENTS = [
  {
    id: "P1", mid: "M-90001", name: "Walter Sample", initials: "WS", age: 71, sex: "M",
    plan: "Medicare Advantage HMO", lang: "English", color: "#1F7DB5",
    comp: { U: 0.9, D: 0.9, M: 0.9, R: 0.7 }, pin: 3, rule: "H2 TOC clock + H4 red flag",
    planRisk: "0.71 (1 Oct)", slot: "8:30 am", deadline: "TCM contact due Tue 10 Nov (1 business day left)",
    headline: "Discharged Fri 6 Nov after heart-failure admission; 3 new meds not picked up; lisinopril still active alongside new Entresto.",
    chips: [["urgent", "HF discharge Fri · 3 new meds not filled"], ["urgent", "Med conflict"], ["blue", "TCM due Tue"]],
    drivers: [
      ["Discharge 6 Nov (ADT, received 6 Nov 4:12 pm)", "ADT"],
      ["Entresto, spironolactone, furosemide 40 mg BID: no fill in 3 days", "PBM vs discharge summary"],
      ["Lisinopril 20 mg still active at pharmacy (must stop 36 h before Entresto)", "PBM 2 Nov"],
      ["Potassium 5.3 mmol/L on 5 Nov", "Lab, LOINC 2823-3"]
    ],
    contacts: [
      { label: "Mobile", num: "555-0142", note: "Answered 15 Sep, 2:20 pm · from pharmacy profile", status: "best" },
      { label: "Home", num: "555-0110", note: "IVR 7 Nov: number not in service", status: "dead" },
      { label: "Wife (same household)", num: "555-0143", note: "No HIPAA authorisation: may pass a message only", status: "noauth" },
      { label: "PCP office · Dr A. Placeholder", num: "555-0101", note: "Verified via recent claim", status: "ok" }
    ],
    summary: [
      ["Admitted 2 Nov for acute-on-chronic systolic heart failure (EF 30%); discharged home Fri 6 Nov.", "UM review 3 Nov"],
      ["Discharge started Entresto 24/26 mg BID and spironolactone 12.5 mg, raised furosemide to 40 mg BID, and stopped lisinopril.", "Discharge summary 6 Nov"],
      ["None of the new medicines has been filled; lisinopril is still active on the pharmacy profile.", "PBM fills to 8 Nov"],
      ["Potassium 5.3 and creatinine 1.6 on 5 Nov.", "Lab 5 Nov"],
      ["Home-health nursing requested; authorisation pending because clinicals are incomplete.", "UM auth 6 Nov"]
    ],
    notInSummary: "Inpatient claim not received yet · no scale readings since 1 Nov",
    conflicts: [
      { id: "c1", title: "Furosemide dose", a: ["Discharge summary 6 Nov", "40 mg twice daily"], b: ["Pharmacy fill 20 Oct", "20 mg once daily"], suggest: "a", why: "Most recent clinician source after discharge wins (trust rule: meds)." },
      { id: "c2", title: "Interaction risk: lisinopril + Entresto", a: ["Discharge summary", "Lisinopril STOPPED"], b: ["Pharmacy profile", "Lisinopril 20 mg active, filled 2 Nov"], suggest: "a", why: "ACE inhibitor must stop 36 h before Entresto. Ask on the call; add task to inactivate at pharmacy." }
    ],
    meds: [
      ["Entresto 24/26 mg", "Twice daily · NEW", "—", "—", "Not picked up", "High"],
      ["Spironolactone 12.5 mg", "Daily · NEW", "—", "—", "Not picked up", "High"],
      ["Furosemide", "40 mg twice daily", "20 mg daily (20 Oct)", "20 mg", "Conflict", "Medium"],
      ["Lisinopril 20 mg", "STOPPED", "Active (2 Nov)", "Yes", "Must stop", "High"],
      ["Metoprolol succinate 50 mg", "Daily", "Filled 10 Oct, 30 days", "Yes", "Runs out 9 Nov", "High"]
    ],
    timeline: [
      ["ADT", "2 Nov admit · 6 Nov discharge", "fresh"],
      ["UM", "3 Nov review · 6 Nov home-health auth pending", "fresh"],
      ["Claims", "Inpatient claim pending (expected weeks later)", "pending"],
      ["Pharmacy", "Last fill 2 Nov (lisinopril) · nothing since discharge", "gap"],
      ["Labs", "5 Nov K 5.3, Cr 1.6", "fresh"],
      ["Scale (later dataset)", "Last reading 1 Nov, 65.9 kg", "stale"]
    ],
    auths: [["Home health nursing", "Pending: clinicals incomplete", "urgent"]],
    sdoh: ["Lives with wife; no transport for cardiology visit", "Screened 8 months ago", "stale"],
    actions: [
      ["Call mobile 555-0142 now (TCM)", "TCM clock + best number answered 15 Sep"],
      ["Same-day pharmacy delivery of new meds", "No fill 3 days after discharge"],
      ["Ask pharmacy to inactivate lisinopril", "Conflict c2"],
      ["Chase home-health authorisation", "UM status: clinicals incomplete"]
    ],
    guide: {
      prefilled: [["Discharge date", "Fri 6 Nov · Lakeside General", "ADT"], ["Reason", "Acute-on-chronic systolic HF", "UM"], ["Follow-up", "Cardiology, not yet booked", "UM"]],
      medrec: ["Lisinopril 20 mg", "Entresto 24/26 mg", "Spironolactone 12.5 mg", "Furosemide", "Metoprolol succinate 50 mg"],
      questions: ["Did anyone explain that you should stop lisinopril before starting Entresto?", "Can you afford the Entresto copay?", "Is your scale working? Can you weigh yourself each morning?", "Do you have a ride to cardiology this week?"],
      tasks: [["Order same-day pharmacy delivery", "you · today"], ["Ask pharmacy to inactivate lisinopril", "you · today"], ["Chase home-health authorisation", "UM liaison · Mon 3 pm"], ["Book cardiology + ride benefit", "you · by Fri 13 Nov"], ["Notify cardiology: K 5.3", "you · today"], ["Set mobile as primary number", "system · on sign"]]
    }
  },
  {
    id: "P4", mid: "M-90004", name: "Jasmine Dummy", initials: "JD", age: 29, sex: "F",
    plan: "Medicaid MCO", lang: "English", color: "#C4501A",
    comp: { U: 0.8, D: 0.7, M: 0.6, R: 0.3 }, pin: 2, rule: "H3 safety: status unknown",
    planRisk: "0.44 (1 Oct)", slot: "verify by 10 am", deadline: "7-day BH follow-up once discharged",
    headline: "Admitted to a behavioural-health unit Tue 3 Nov; no discharge message for 6 days. Housing screen is 11 months old and contradicted.",
    statusUnknown: true, restricted: true,
    chips: [["urgent", "Admitted 3 Nov · no discharge for 6 days"], ["stale", "Housing screen 11 mo old"], ["blue", "Restricted record"]],
    drivers: [
      ["ADT admit 3 Nov to Riverside Behavioral; no discharge event since", "ADT"],
      ["BH is carved out: no UM notes", "UM"],
      ["Shelter delivery address on 28 Oct pharmacy fill", "PBM"],
      ["Prepaid phone: connects only early in the month", "Contact log"]
    ],
    contacts: [
      { label: "Prepaid mobile", num: "555-0158", note: "Connected 2 Oct, 4 Sep · fails after mid-month", status: "ok" },
      { label: "Hope Street Shelter front desk", num: "555-0190", note: "Alternate contact listed 28 Oct", status: "ok" },
      { label: "SMS", num: "555-0158", note: "SMS consent on file", status: "ok" }
    ],
    summary: [
      ["Admitted 3 Nov to an inpatient behavioural-health unit for worsening depression.", "ADT 3 Nov"],
      ["No discharge message has arrived in 6 days; current location unknown.", "ADT"],
      ["October note mentions she lost her apartment; the 28 Oct fill shipped to a shelter.", "Case note 14 Oct · PBM 28 Oct"]
    ],
    notInSummary: "BH carve-out: no UM notes · one restricted record (42 CFR Part 2) not shown",
    conflicts: [
      { id: "c3", title: "Housing", a: ["SDOH screen Dec 2025", "Stable housing"], b: ["Case note 14 Oct + PBM 28 Oct", "Shelter address"], suggest: "b", why: "SDOH screen is 11 months old (stale). Re-screen; suggested Z59.01 for Maria to confirm." }
    ],
    meds: [["Sertraline 100 mg", "Daily", "Filled 28 Oct (shelter address)", "Yes", "OK", "High"]],
    timeline: [
      ["ADT", "3 Nov admit · no discharge", "gap"],
      ["UM", "Carved out: no data", "gap"],
      ["Pharmacy", "28 Oct sertraline", "fresh"],
      ["SDOH", "Screen Dec 2025: stable housing", "stale"]
    ],
    auths: [],
    sdoh: ["Housing unstable (shelter)", "Screened 11 months ago", "stale"],
    actions: [
      ["Verify status with Riverside Behavioral", "Discharge not received after 3 days"],
      ["Route restricted-record review to LCSW", "No Part 2 consent; RN assigned"],
      ["Re-screen housing on next contact", "SDOH stale + conflict"]
    ],
    guide: {
      prefilled: [["Admission", "3 Nov · Riverside Behavioral", "ADT"], ["Discharge", "Not received", "ADT"]],
      medrec: ["Sertraline 100 mg"],
      questions: ["Where are you staying right now?", "Do you have a follow-up appointment in the next 7 days?", "Is it OK to text you on this number?"],
      tasks: [["Verify discharge status with facility", "you · by 10 am"], ["LCSW consult for restricted record", "LCSW · today"], ["Book 7-day BH follow-up", "you · after discharge confirmed"]]
    }
  },
  {
    id: "P3", mid: "M-90003", name: "Marcus Placeholder", initials: "MP", age: 38, sex: "M",
    plan: "Medicaid MCO", lang: "English", color: "#17306E",
    comp: { U: 0.7, D: 0.6, M: 0.9, R: 0.4 }, pin: 0, rule: "",
    planRisk: "0.38 (1 Oct, stale)", slot: "text now, call 1:15 pm", deadline: "7-day post-ED window closes Thu 12 Nov",
    headline: "Four asthma ED visits in 90 days (only 2 in claims); every call fails because the number on file reaches his ex-partner.",
    chips: [["urgent", "4 ED visits / 90 days (2 claims pending)"], ["blue", "Post-ED window Thu"], ["stale", "Risk score as of 1 Oct"]],
    drivers: [
      ["ED visits 12 Aug, 20 Sep, 19 Oct, 5 Nov (ADT); claims show only 2", "ADT vs claims"],
      ["Rescue inhaler refilled monthly; controller never dispensed (prior auth rejected Aug)", "PBM"],
      ["Wrong-person outcome on 555-0131 on 28 Oct", "Contact log"]
    ],
    contacts: [
      { label: "Mobile (from his member-services call 2 Nov)", num: "555-0167", note: "Prefers text · works nights · SMS consent", status: "best" },
      { label: "Number on file", num: "555-0131", note: "28 Oct: reached ex-partner (wrong person)", status: "dead" },
      { label: "Pharmacy · Corner Pharmacy", num: "555-0102", note: "Fills monthly", status: "ok" }
    ],
    summary: [
      ["Four ED visits for asthma in 90 days; the last on Thu 5 Nov.", "ADT"],
      ["Rescue inhaler refilled every month; the controller inhaler was rejected for prior auth in August and never dispensed.", "PBM"],
      ["Called member services on 2 Nov from 555-0167 about a ride.", "Inbound call log"]
    ],
    notInSummary: "ADT carries no diagnosis for 5 Nov; reason inferred from 19 Oct CCD (Medium confidence)",
    conflicts: [{ id: "c4", title: "ED visits in 90 days", a: ["ADT", "4 visits"], b: ["Claims", "2 visits"], suggest: "a", why: "Claims lag weeks; ADT is near real-time. Show ‘2 claims pending’." }],
    meds: [["Albuterol inhaler", "As needed", "Filled monthly", "Yes", "Overuse", "High"], ["Fluticasone/salmeterol", "Twice daily", "Rejected: prior auth (Aug)", "—", "Never dispensed", "High"]],
    timeline: [["ADT", "4 ED visits; last 5 Nov", "fresh"], ["Claims", "2 ED visits; 2 pending", "pending"], ["Pharmacy", "Albuterol monthly; controller rejected", "fresh"], ["Risk score", "Medium as of 1 Oct (2 ED events since)", "stale"]],
    auths: [["Controller inhaler prior auth", "Rejected Aug: ask PCP for formulary alternative", "urgent"]],
    sdoh: ["Works night shifts", "Screened 4 months ago", "fresh"],
    actions: [["Text 555-0167 now; call 1–3 pm", "Best number + prefers text"], ["Ask PCP for formulary controller", "Prior auth rejected"], ["Retire 555-0131 for whole team", "Wrong person"]],
    guide: {
      prefilled: [["Last ED visit", "Thu 5 Nov · Lakeside General", "ADT"], ["Controller", "Not dispensed (PA rejected)", "PBM"]],
      medrec: ["Albuterol inhaler", "Fluticasone/salmeterol"],
      questions: ["What usually sets off your asthma?", "Have you ever used a daily controller inhaler?", "Is texting the best way to reach you?"],
      tasks: [["Request formulary controller from PCP", "you · today"], ["Book PCP follow-up before Thu 12 Nov", "you · by Wed"], ["Set 555-0167 as primary", "system · on sign"]]
    }
  },
  {
    id: "P5", mid: "M-90005", name: "Rosa Testcase", initials: "RT", age: 82, sex: "F",
    plan: "Dual-eligible D-SNP", lang: "Spanish", color: "#2E7D4F",
    comp: { U: 0.6, D: 0.5, M: 0.8, R: 0.2 }, pin: 0, rule: "",
    planRisk: "0.58 / 0.12 (duplicate)", slot: "merge now, call 6 pm", deadline: "Annual reassessment overdue 25 days",
    headline: "Dementia; daughter-caregiver overwhelmed. Her history is split across two member IDs, hiding a fall and a new drug.",
    duplicate: { other: "M-90015", otherName: "Rosa Test-Case", match: [["Date of birth", "12 Mar 1944", "12 Mar 1944"], ["Name", "Rosa Testcase", "Rosa Test-Case"], ["Address", "7 Moss Lane", "7 Moss Ln"], ["PCP", "Dr B. Example", "Dr B. Example"], ["Language", "Spanish", "—"]],
      reveals: [["30 Oct", "ED visit for a fall", "ADT on M-90015"], ["14 Oct", "Donepezil 5 mg started", "PBM on M-90015"], ["21 Oct", "Neurology note: dementia, moderate", "CCD on M-90015"], ["—", "Second case manager: J. Kim", "CM system"]] },
    chips: [["urgent", "Possible duplicate record"], ["urgent", "ED visit for a fall 30 Oct"], ["blue", "Reassessment overdue"]],
    drivers: [["Same DOB, address, PCP on M-90015", "Eligibility"], ["Aide authorisation expired 31 Oct", "UM"], ["Daughter answers only after 6 pm", "Contact log"]],
    contacts: [
      { label: "Daughter Lucia (authorised rep)", num: "555-0176", note: "Answers after 6 pm · Spanish · HIPAA auth on M-90005", status: "best" },
      { label: "Home", num: "555-0175", note: "No answer ×4", status: "ok" }
    ],
    summary: [["82-year-old with dementia living with her daughter, who is the authorised representative.", "Enrollment + HIPAA form"], ["Personal-care aide authorisation expired 31 Oct with no renewal.", "UM"], ["Daughter ‘sounds tired’ in the last two notes.", "Case notes 20, 27 Oct"]],
    notInSummary: "Possible second record not yet merged: confirm before relying on this summary",
    conflicts: [],
    meds: [["Amlodipine 5 mg", "Daily", "Filled 25 Oct", "Yes", "OK", "High"]],
    timeline: [["ADT", "No events on this ID", "gap"], ["Pharmacy", "Amlodipine monthly", "fresh"], ["UM", "Aide auth expired 31 Oct", "fresh"]],
    auths: [["Personal-care aide", "Expired 31 Oct: renew", "urgent"]],
    sdoh: ["Caregiver strain likely", "Screened 7 months ago", "stale"],
    actions: [["Review possible duplicate (M-90015)", "Same DOB + address + PCP"], ["Renew aide authorisation", "Expired 31 Oct"], ["Call daughter 6 pm with interpreter", "Answers after 6 pm, Spanish"]],
    guide: {
      prefilled: [["Authorised rep", "Lucia (daughter) · HIPAA on file", "Consent"], ["Language", "Spanish · interpreter booked 6 pm", "Enrollment"]],
      medrec: ["Amlodipine 5 mg", "Donepezil 5 mg (after merge)"],
      questions: ["¿Cómo está su mamá desde la caída?", "¿Ha notado mareos desde que empezó el donepezil?", "¿Cómo se siente usted como cuidadora?"],
      tasks: [["Renew personal-care aide authorisation", "you · today"], ["Message neurology: fall 16 days after donepezil", "you · today"], ["Respite / social-work referral", "you · this week"], ["Notify J. Kim: Maria owns the case", "system · on sign"]]
    }
  },
  {
    id: "P2", mid: "M-90002", name: "Denise Fakename", initials: "DF", age: 54, sex: "F",
    plan: "Medicaid expansion MCO", lang: "English", color: "#4A5568",
    comp: { U: 0.3, D: 0.1, M: 0.8, R: 0.2 }, pin: 0, rule: "",
    planRisk: "0.62 (1 Oct)", slot: "7:15 pm", deadline: "No hard deadline · reachable after 7 pm",
    headline: "Rising-risk diabetic: no metformin fill for 75 days and A1c up 7.4 → 9.1%. Kidney disease in claims but not on the problem list.",
    chips: [["blue", "No plan-paid metformin fill 75 days"], ["stale", "A1c unit missing"], ["blue", "CKD 3a not on problem list"]],
    drivers: [["Metformin 1,000 mg BID last filled 25 Aug (30-day)", "PBM"], ["A1c 7.4 (Mar) → 9.1 (28 Oct); duplicate ‘91 %’ removed", "Labs"], ["eGFR 41 + nephrology claim N18.31", "Labs + claims"]],
    contacts: [{ label: "Mobile", num: "555-0122", note: "Answers after 7 pm", status: "best" }],
    summary: [["No plan-paid metformin fill since 25 Aug; she may be paying cash elsewhere.", "PBM"], ["A1c rose from 7.4% in March to 9.1% on 28 Oct.", "Labs"], ["Mentioned ‘stomach problems’ on 30 Oct.", "Case note 30 Oct"]],
    notInSummary: "Cash or discount-card fills are invisible to the plan",
    conflicts: [{ id: "c5", title: "A1c 28 Oct", a: ["Lab A (LOINC 4548-4)", "9.1 (no unit)"], b: ["Lab B, same sample", "91 %"], suggest: "a", why: "A1c above 20% is impossible; same sample re-sent. Unit inferred from LOINC." }],
    meds: [["Metformin 1,000 mg", "Twice daily", "Last fill 25 Aug", "Yes", "Gap 75 days", "Medium"]],
    timeline: [["Pharmacy", "Last metformin 25 Aug", "gap"], ["Labs", "28 Oct A1c 9.1, eGFR 41", "fresh"], ["Claims", "Nephrology N18.31 (Sep)", "fresh"]],
    auths: [],
    sdoh: ["Food insecurity: no", "Screened 3 months ago", "fresh"],
    actions: [["Call after 7 pm about side effects and cost", "Never label ‘non-adherent’ from absence"], ["Ask PCP to review metformin dose for eGFR 41", "Kidney safety"], ["Add CKD 3a to problem list (suggested)", "Nephrology claim + eGFR"]],
    guide: {
      prefilled: [["Last A1c", "9.1% (28 Oct)", "Labs"], ["eGFR", "41 (28 Oct)", "Labs"]],
      medrec: ["Metformin 1,000 mg"],
      questions: ["Are you still taking metformin? Do you buy it anywhere else?", "Has it upset your stomach?", "Is cost a problem?"],
      tasks: [["PCP dose review for kidney function", "you · this week"], ["Confirm CKD 3a on problem list", "PCP"], ["Diabetes education referral", "you · this week"]]
    }
  }
];
