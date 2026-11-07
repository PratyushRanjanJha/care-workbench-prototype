# Care Workbench: a clickable prototype

### ▶ [Open the Care Workbench](https://pratyushranjanjha.github.io/care-workbench-prototype/)

This prototype accompanies the HiLabs APM product case 2026–27, *Reimagining the Case Management Workbench*. All data is synthetic.

---

## The problem it solves

Maria is a telephonic nurse case manager at a health plan, with 20 years of ICU experience. She spends only about **13% of her day talking to members**. The rest goes to:

- hunting across 6–7 screens to prepare each call
- dialling numbers that are dead or wrong
- typing the same facts into several forms
- working out who to call next

She manages about 48 complex members. Every hospital discharge starts a **2-business-day deadline** to reach the patient.

The workbench joins data the plan already has, ranks her day by deadline and danger, and prepares every call. **AI prepares; the nurse decides.** It never diagnoses, changes medication, closes a case or writes to the record without her signature. The goal is to take her from **2 to about 5 member conversations a day**.

## The three screens

| Screen | Question it answers | What you can do |
| --- | --- | --- |
| **My day** | Who needs me, why today, and when can I reach them? | See a ranked queue with reasons. Move the weight sliders or switch hard rules off and watch the order change. Open **Why #n?** for the drivers and their sources. Override or snooze with a reason. |
| **Member 360** | What’s going on with this person? | One screen instead of six: best contact, an AI summary with a source on every sentence, the medicine list compared across sources, a timeline, and the conflicts that need a clinician’s judgment. |
| **Outreach & note** | How do I reach them, and document it once? | Ranked phone numbers with outcome buttons, a pre-filled call guide to confirm, structured medication reconciliation, and a note that drafts itself. Signing fills 4 records and creates the follow-up tasks. |

Two extra tabs, **Bad days** (16 edge cases, two of them live) and **Audit log** (every action, as an auditor would see it), show how the product behaves when things go wrong.

## How the queue is ranked

1. **Hard rules first.** A stop signal (member died, disenrolled or opted out) removes the member. A 2-business-day discharge deadline or a safety concern pins them to the top. A clinical red flag goes to the urgent tier. A late data feed pauses the rules that depend on it.
2. **Then an open formula:** Priority = 0.35 × Urgency + 0.30 × Deadline + 0.25 × Modifiable risk + 0.10 × Reachable.
3. **Reachability sets the time slot, not the priority**, so hard-to-reach members don’t sink. The plan’s own risk score only breaks ties.

## The five synthetic patients (Monday 9 Nov 2026, 8 am)

| Rank | Patient | Situation | What the prototype shows |
| --- | --- | --- | --- |
| 1 | **Walter Sample**, 71, Medicare Advantage | Heart-failure discharge on Friday; 3 new medicines not picked up; an old blood-pressure drug (lisinopril) still active alongside a new one (Entresto) that it must not overlap with | Deadline pinning, medicine conflicts, a dead home line, one-entry documentation |
| 2 | **Jasmine Dummy**, 29, Medicaid | Behavioural-health admission with no discharge message for 6 days; housing record out of date | Safety pin, outreach held until her status is verified, a restricted record routed to a licensed clinical social worker |
| 3 | **Marcus Placeholder**, 38, Medicaid | 4 asthma ED visits in 90 days (only 2 in claims yet); the phone number on file reaches his ex-partner | Real-time hospital alerts vs slow claims, retiring a wrong number, a working number found in another plan system |
| 4 | **Rosa Testcase**, 82, dual-eligible (Medicare + Medicaid), Spanish-speaking | Dementia; daughter is her caregiver; her history is split across two member IDs | Duplicate-record merge that reveals a hidden fall and a new drug; caregiver consent; interpreter booking |
| 5 | **Denise Fakename**, 54, Medicaid | Diabetes worsening; no plan-paid metformin refill for 75 days; kidney disease missing from her problem list | Not labelling her “non-adherent” from missing data alone; catching an impossible lab value |

## About the data

- **Fictional.** Every person, phone number (555-01xx) and facility is made up. There is no real patient data.
- **Realistic sources.** The data mirrors what a health plan actually holds:
  - hospital admission and discharge alerts
  - utilisation-management reviews and authorisations
  - discharge summaries
  - pharmacy fills
  - claims and labs
  - contact history
  - consent records
  - case notes
  - risk scores
  - social-needs screens
- **Built-in mess.** It contains the kinds of errors real data has: late claims, conflicting medicine lists, missing units, duplicate IDs, stale screens and wrong phone numbers. Each one is something the product has to catch.
- **Every fact shows its source.** Facts are marked fresh, ageing or stale, and stale data is shown but cannot trigger an action.

Everything runs in your browser, and nothing is saved or sent anywhere. Reload the page (or use **About → Reset demo**) to start over.
