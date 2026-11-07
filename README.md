# Care Workbench: clickable prototype (HiLabs APM case 2026–27)

A working front-end prototype of the case-management workbench from the deck. It runs entirely in the browser with no backend and no build step, using synthetic data for five fictional patients. "Today" is Monday 9 Nov 2026, 8:00 am.

## What you can do in it

| Tab | Try this |
| --- | --- |
| **My day** | Drag the weight sliders or switch **Hard rules** off and watch the queue re-order (Jasmine drops below Marcus). Open **Why #n?** to see drivers with sources; override or snooze with a reason. |
| **Member 360** | Walter: resolve the furosemide and lisinopril/Entresto conflicts, then accept next best actions. Rosa: review the duplicate record and **merge** it, which surfaces a hidden fall and a new drug, then pick the case owner. Jasmine: **verify status** (outreach is held until you do) and route the restricted record to an LCSW. |
| **Outreach & note** | Log call outcomes (wrong person or not in service retires a number). On a connected call, confirm pre-filled facts, reconcile meds and tick questions; the note drafts itself. **Sign** fills 4 records and creates tasks, and the conversations counter goes up. Try **Crisis on call**. |
| **Bad days** | 16 edge cases. **Simulate** a late pharmacy feed (its rules pause) or a member's death (removed from the queue, outreach blocked). |
| **Audit log** | Every override, AI action, conflict choice and signature, with counts. |

## Files

```
index.html   page shell and navigation
styles.css   styling
data.js      synthetic patients (edit here to change scenarios)
app.js       ranking, screens and interactions (vanilla JS)
.nojekyll    tells GitHub Pages to serve files as-is
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Host on GitHub Pages (free, about 2 minutes)

1. Create a new **public** repository on GitHub, e.g. `care-workbench-prototype`.
2. Upload these files to the repository root using **Add file → Upload files** (or `git push`).
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`**, then **Save**.
4. After about a minute, the site is live at `https://<your-username>.github.io/care-workbench-prototype/`.

With git:

```bash
git init && git add . && git commit -m "Care Workbench prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/care-workbench-prototype.git
git push -u origin main
```

## Other hosts (optional)

- **Netlify / Vercel:** import the GitHub repo. There is no build command, and the publish directory is the root. You get a URL in under a minute.
- **Streamlit:** not recommended here. Streamlit is built for Python data apps, and its widgets can't reproduce a clinical workbench UI with this level of interaction. If you need it on Streamlit Community Cloud, embed this page with `st.components.v1.html(open("index.html").read(), height=1400)`. You would first have to inline `styles.css`, `data.js` and `app.js` into `index.html`, because the embed does not load separate files.

## Notes

- All people, phone numbers (555-01xx) and facilities are fictional. No real PHI.
- State resets on reload; use **About → Reset demo** to start over.
