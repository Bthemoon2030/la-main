# Oud — de website staat nu op la-main.nl

Deze repository was tot 01-10-2026 de website van **La Main**. Dat is hij niet meer.

**De echte site:** https://la-main.nl
**De repository daarvan:** `La-main/website`, onder het eigen GitHub-account van
de salon. Werkmap op de pc: `C:\Users\Robbi\Projects\la-main-nl`, met `LEES-MIJ.md`
waarin staat hoe je publiceert, wat de DNS-regels zijn en hoe Cal.com wordt
ingericht.

Wat hier nog staat is één bestand: `index.html` stuurt bezoekers van
`bthemoon2030.github.io/la-main/` door naar la-main.nl.

## Wat er is weggehaald, en hoe je het terugkrijgt

Op 01-10-2026 zijn weggehaald:

- de oude site van zes pagina's (`app.js`, `stijl.css`, `foto/`, `foto-bron/`);
- de proefpagina's `nieuw/`, `nieuw-zonder-scroll/` en `presentatie/`;
- het gereedschap en de documentatie: `logo.py`, `logo-lm.svg`, `stijl.py`,
  `beeld.py`, `bundel.py`, `README.md`, `CLAUDE.md`, `BEELDBRONNEN.md` en
  `FOTOGRAFIE.md`.

Alles staat nog in de geschiedenis van deze repository:

```bash
git log --oneline              # zoek de commit van vóór 01-10-2026
git show <commit>:FOTOGRAFIE.md > FOTOGRAFIE.md
git checkout <commit> -- logo.py logo-lm.svg
```

Twee dingen die je waarschijnlijk nog nodig hebt:

- **`FOTOGRAFIE.md`** — de briefing per beeldplek voor de echte fotoshoot; het
  grootste openstaande punt van de site.
- **`logo.py`** — tekent het merkteken LM opnieuw als vector. Het logo is gezet
  uit **Bodoni Moda**, gewicht 700 bij optische grootte 11, met een tussenruimte
  van −60 font-eenheden tussen de L en de M. Die vorm is door de eigenaresse
  goedgekeurd; niet wijzigen zonder overleg.
