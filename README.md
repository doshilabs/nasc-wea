# WEA Alert Generator

A tool for generating Wireless Emergency Alerts for autistic children who elope, based on the [NASC SafeSearch for Autism](https://www.autismsafetycouncil.org) protocol.

Live at: [https://doshilabs.github.io/nasc-wea/](https://doshilabs.github.io/nasc-wea/)


## Background

Standard missing child alerts don't account for how autistic children behave when lost. This tool generates alerts based on NASC's SafeSearch for Autism protocol, which directs responders to:

- **Search water first** — drowning is the leading cause of death in autism elopement
- **Check hiding spots** — autistic children often hide from rescuers rather than approach them
- **Note NON-SPEAKING** — so responders know verbal commands won't work

The alert template fits within the 360-character Enhanced WEA limit.

## Codebase

Plain HTML, CSS, and JavaScript. No build step, no dependencies.

- `index.html` — page structure and form inputs
- `style.css` — layout and styles
- `script.js` — template engine, live preview, copy logic

To change the alert wording, edit `buildAlert()` in `script.js`.

## Resources

- [SafeSearch for Autism protocol (PDF)](https://cdn.prod.website-files.com/691df36c2bfdd23b8c789f03/69a70c2680bdb2d968255577_SafeSearch%20for%20Autism.pdf)
- [National Autism Safety Council](https://www.autismsafetycouncil.org)
- [FCC Enhanced WEA requirements](https://www.fcc.gov/consumers/guides/wireless-emergency-alerts-wea)
