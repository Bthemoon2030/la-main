# La Main — website

Statische site voor massagesalon La Main (Eindhoven). Eén bestand, geen build-stap, geen dependencies.

## Publiceren op GitHub Pages

1. Maak een repository aan, bijvoorbeeld `la-main`.
2. Zet `index.html` in de root van de `main`-branch.
3. Repository → **Settings** → **Pages** → Source: *Deploy from a branch* → Branch: `main`, map `/ (root)` → **Save**.
4. Na ongeveer een minuut staat de site op `https://<gebruikersnaam>.github.io/la-main/`.

Eigen domein: voeg een bestand `CNAME` toe met alleen de domeinnaam erin, en zet bij de domeinprovider een CNAME-record naar `<gebruikersnaam>.github.io`.

## Wat waar aan te passen

Alles wat je wilt wijzigen staat bovenaan het `<script>`-blok in `CONFIG`:

| Onderdeel | Sleutel |
|---|---|
| Openingstijden en -dagen | `open`, `sluit`, `openingsdagen` |
| Duur van een tijdslot | `slotMinuten` |
| Op- en afbouwtijd op locatie | `opbouwMinuten` |
| Kilometervergoeding | `kmTarief` |
| Reistijdstaffels | `reistijdStaffels` |
| Behandelingen, duur en prijzen | `behandelingen` |
| Reistijd per postcodegebied | `postcodezones` |

Teksten pas je direct in de HTML aan. Alles wat nog bevestigd moet worden staat gemarkeerd tussen blokhaken en is in de stylesheet zichtbaar via de klasse `tbc`.

## Logo

Het merkteken is opgebouwd in HTML, niet als afbeelding — zo blijft het scherp op elk scherm:

```html
<span class="mark"><span class="mono">LM</span><span class="wm">La Main</span></span>
```

Drie formaten: standaard (navigatie), `.md` (footer, call-to-action) en `.lg` (hero). De letter is Bodoni Moda; wil je later een getekende versie van een ontwerper, dan vervang je de `.mono` door een inline SVG en blijft de rest staan.

**Let op bij wijzigen.** Bodoni Moda is een variabele letter met een optische-grootte-as. Die staat bewust vast (`font-optical-sizing:none` met `font-variation-settings:"opsz" 11`). Haal je dat weg, dan kiest de browser bij grote formaten automatisch een display-snede met zulke dunne haarlijnen dat de voetserif van de L en de linkerstam van de M verdwijnen — en is het geen LM meer. Hetzelfde geldt voor de koppen, die op `"opsz" 16` staan.

## Beeld

De map `foto/` bevat dertien beelden in roze-goud: zachte, onscherpe composities met een lichtbron, een vormrand die aan een lichaam of stof doet denken, en een schaduwmassa. Ze zijn gegenereerd, niet gefotografeerd, en bedoeld als plaatsvervanger tot er echte fotografie is — in precies de toon die de site aanhoudt.

**Eigen foto's gebruiken.** Zet je bestand in `foto/` en wijzig alleen de `src`:

```html
<img src="foto/eigen-behandelruimte.jpg" alt="De behandelruimte">
```

De uitsnede, de verhouding en het zachte opkomen blijven staan. Valt een foto weg, dan blijft het CSS-verloop eronder zichtbaar, dus de pagina breekt nooit.

Verhoudingen: `a-34` (3:4), `a-45` (4:5), `a-11` (vierkant), `a-219` (panorama). Richtlijn voor de fotografie die de generieke beelden moet vervangen: warm strijklicht van één kant, ondiepe scherptediepte, huid en textiel groot in beeld, geen witte handdoeken op een witte achtergrond.

**Echte fotografie.** Zie `FOTOGRAFIE.md` voor de lijst van dertien plekken, wat er per plek hoort en hoe je fotografeert. Kort: leg je foto in `foto-bron/` met de naam van de plek en draai `python3 stijl.py`. Het script snijdt op maat, zet de foto in de roze-gouden toon en schrijft hem naar `foto/`. Elke foto — van welke bron dan ook — komt er in dezelfde huisstijl uit.

```
python3 stijl.py          # alles wat in foto-bron/ staat
python3 stijl.py rug      # alleen deze
```

**De plaatsvervangers opnieuw genereren.** `beeld.py` maakt de hele map opnieuw aan. Bovenin staan de kleurtrappen — pas die aan om de site koeler, warmer of donkerder te zetten. Onderin staat per beeld de hoek van de vormrand, de stand van het licht en de mate van onscherpte.

```
python3 beeld.py     # vult foto/ opnieuw
```

Vereist `numpy` en `pillow`.

## Eén bestand maken

`bundel.py` sluit alle foto's in `index.html` in en schrijft `la-main-compleet.html`. Handig om de site door te sturen of lokaal te bekijken zonder de fotomap. Voor GitHub Pages gebruik je gewoon `index.html` met `foto/` ernaast — dat laadt sneller, omdat de browser de beelden dan apart kan bewaren.

```
python3 bundel.py
```

## Nog niet definitief

- Adres van de salon, openingstijden, parkeren
- Prijzen van Op maat (90 min) en Verdieping (120 min) — alleen de € 90,– voor 60 minuten is bevestigd
- Naam en bio van de masseuse
- Annuleringsvoorwaarden, algemene voorwaarden, privacyverklaring, KvK/btw
- Fotografie (de plekken staan gereserveerd en zijn gelabeld)

## Boekingsmodule

De agenda is volledig klikbaar maar draait op gesimuleerde data: er is geen backend, geen database en geen e-mail. Bezette tijdslots worden deterministisch berekend uit datum en behandeling, zodat de agenda stabiel blijft. Reistijd en afstand komen uit de tabel `postcodezones`.

Voor een echt werkende agenda zijn drie dingen nodig:

1. Een backend of boekingsdienst die afspraken vastlegt (bijvoorbeeld Cal.com, Salonized of een eigen API).
2. Een afstandsberekening op basis van het echte salonadres (Google Distance Matrix of een open alternatief).
3. Een e-mail- of berichtenkoppeling voor bevestigingen en herinneringen.

De frontend is zo opgezet dat deze drie punten los ingeplugd kunnen worden zonder de vormgeving te raken.
