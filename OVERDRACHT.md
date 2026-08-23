# Overdracht — website La Main

Voor de volgende Claude-sessie of ontwikkelaar die dit project overneemt.
Lees dit eerst; het scheelt je het opnieuw ontdekken van drie valkuilen die
al een keer fout zijn gegaan.

---

## 1. Wat dit is

Een statische website voor **La Main**, een massagesalon in Eindhoven die
behandelt in de eigen salon én op locatie bij de klant. Nederlandstalig,
high-end, gericht op welvarende klanten die gezondheid serieus nemen.
Referentiekader voor de vormgeving: modehuizen als Loewe en Dior, geen
wellnesswebsite.

Geen build-stap, geen framework, geen dependencies. Drie bestanden plus een
map met beelden. Open `index.html` en het werkt.

---

## 2. Publiceren — gedaan

De site staat online op **https://bthemoon2030.github.io/la-main/**, uit de
repository **https://github.com/Bthemoon2030/la-main** (openbaar, tak `main`,
map `/`). GitHub Pages bouwt automatisch opnieuw bij elke push:

```bash
git add . && git commit -m "beschrijving" && git push
```

Na ongeveer een minuut is de wijziging live. Gecontroleerd na publicatie:
`index.html`, `stijl.css`, `app.js`, `logo-lm.svg` en de beelden leveren alle
een 200, de lettertypes van Google laden, en er staan geen absolute paden in de
opmaak — daardoor werkt de site ook onder de submap `/la-main/`.

**Let op bij pushen:** deze machine heeft ook een GitHub-account voor een ander
project opgeslagen. Daarom staat in deze repository lokaal
`credential.https://github.com.useHttpPath=true`, zodat git de inloggegevens van
`Bthemoon2030` per repository onthoudt en niet het verkeerde account pakt. Niet
weghalen.

**Eigen domein:** voeg een bestand `CNAME` toe met alleen de domeinnaam erin,
zet bij de domeinprovider een CNAME-record naar `bthemoon2030.github.io`, en
vul het domein in bij **Settings → Pages → Custom domain**.

---

## 3. Bestandsoverzicht

| Bestand | Wat het doet |
|---|---|
| `index.html` | De opmaak van alle zes pagina's. |
| `stijl.css` | Alle vormgeving, ingedeeld in acht genummerde blokken. |
| `app.js` | Router, scroll-effecten en de volledige boekingsmodule. |
| `foto/` | Dertien beelden. |
| `logo-lm.svg` | Het merkteken als vector. Zit ook als `<symbol>` in `index.html`. |
| `logo.py` | Tekent `logo-lm.svg` opnieuw. |
| `beeld.py` | Genereert de dertien plaatsvervangende beelden. |
| `stijl.py` | Zet aangeleverde fotografie om in de huisstijl. |
| `bundel.py` | Maakt er één bestand van: `la-main-compleet.html`. |
| `README.md` | Praktische handleiding. |
| `FOTOGRAFIE.md` | Briefing voor de fotograaf, per beeldplek. |

De python-scripts zijn gereedschap, geen onderdeel van de site. Ze hoeven niet
mee naar GitHub, maar het is handiger als ze bij het project blijven. Vereisen
`numpy`, `pillow` en (voor `logo.py`) `fonttools` en `brotli`.

---

## 4. Drie dingen die je niet moet omgooien

**a. De optische grootte van de letter staat bewust vast.**
Bodoni Moda is variabel met een `opsz`-as. Op automatisch kiest de browser bij
grote formaten een display-snede waarvan de haarlijnen zó dun worden dat ze
verdwijnen. Daarom staat overal `font-optical-sizing:none` met een vaste
`font-variation-settings`. Haal je dat weg, dan vallen koppen zichtbaar uit
elkaar. Dit is één keer fout gegaan en kostte een halve dag.

**b. Het logo is een vectortekening, geen tekst.**
Om precies dezelfde reden. De L en de M staan met een tussenruimte van −60
font-eenheden: de voetserif van de L eindigt net vóór de haarlijn-linkerstam
van de M. Zo wil de eigenaar het, en zo ligt het vast. Wijzigen kan met
`python3 logo.py -90`, maar overleg dat eerst — hier is lang over gedaan.

**c. Alles staat op één raster van twaalf kolommen.**
De eerste twee kolommen zijn de margekolom: daar staan labels, figuurnummers
en bijschriften. Inhoud begint altijd op kolom drie. Nieuwe secties horen zich
daaraan te houden; de klasses staan bovenin `stijl.css` (`.k-marge`, `.k-3-9`,
`.k-8-13`, enzovoort). Dat de linkerkant nooit verspringt is een bewuste keuze,
geen toeval.

---

## 5. Taal en toon

Alles in het Nederlands, ook de namen van de behandelingen. **Geen Franse of
Engelse sfeerwoorden** — geen *signature treatment*, geen *booking*, geen
*Le Rituel*. De enige uitzondering is de naam van de salon zelf: La Main.

De behandelingen heten **Onderhoud** (60 min), **Op maat** (90 min) en
**Verdieping** (120 min), genoemd naar wat ze doen.

Toon: rustig, zelfverzekerd, weinig woorden. Geen uitroeptekens, geen
superlatieven. De klant wordt met *u* aangesproken.

---

## 6. De boekingsmodule

Volledig klikbaar, maar het draait op **gesimuleerde data**. Er is geen
backend, geen database, geen e-mail. Bezette tijdslots worden deterministisch
berekend uit datum en behandeling, zodat de agenda niet verspringt bij
herrenderen. Reistijd en afstand komen uit een tabel met postcodegebieden
rond Eindhoven.

Alles wat je zou willen aanpassen staat in het `CONFIG`-object bovenin
`app.js`: openingstijden, slotduur, kilometertarief, reistijdstaffels,
behandelingen met prijzen, en de postcodetabel.

Voor een echt werkende agenda zijn drie koppelingen nodig:

1. Een boekingsdienst of eigen backend die afspraken vastlegt
   (Cal.com, Salonized, of iets eigens).
2. Een echte afstandsberekening vanaf het salonadres
   (Google Distance Matrix of een open alternatief).
3. E-mailbevestigingen en herinneringen.

De frontend is zo opgezet dat die drie los ingeplugd kunnen worden zonder de
vormgeving te raken. Op het bevestigingsscherm staat nu een zin die vermeldt
dat het een demonstratie is — die moet weg zodra er echt geboekt kan worden.

---

## 7. Wat nog ontbreekt

Alles hieronder staat in de site als placeholder tussen blokhaken, zichtbaar
gemaakt met de klasse `tbc`. Zoek op `[` in `index.html` om ze te vinden.

- Adres van de salon in Eindhoven
- Openingstijden per dag (nu 09:00–19:00 als aanname)
- Prijzen van Op maat en Verdieping — **alleen de € 90 voor 60 minuten is bevestigd**
- Naam en achtergrond van de masseuse; er is nog geen stuk over wie zij is
- Annuleringsvoorwaarden
- E-mailadres en telefoonnummer
- Algemene voorwaarden, privacyverklaring, KvK- en btw-nummer

Het contactformulier doet nu niets. Koppel het aan Formspree, Netlify Forms
of een eigen endpoint.

---

## 8. Fotografie — het belangrijkste openstaande punt

De dertien beelden in `foto/` zijn **gegenereerd, niet gefotografeerd**. Zachte
roze-gouden composities die als plaatsvervanger dienen. Ze zijn mooi, maar de
site heeft daardoor geen onderwerp: geen handen, geen huid, geen ruimte. Dat is
het verschil tussen een goede en een uitstekende site, en het is met code niet
op te lossen.

Zodra er echte foto's zijn:

```bash
# leg de bestanden in foto-bron/ met de naam van de plek
python3 stijl.py
```

Dat snijdt elke foto op de juiste verhouding, zet hem in de roze-gouden toon en
schrijft hem naar `foto/`. Het werkt met foto's uit elke bron — eigen shoot,
fotograaf, gelicentieerde stock — en levert altijd één samenhangende reeks.
`FOTOGRAFIE.md` beschrijft per plek wat er hoort en hoe er gefotografeerd moet
worden.

---

## 9. Waar de kwaliteitslat ligt

De eigenaar heeft expliciet om een 10 gevraagd en heeft eerdere versies
afgekeurd omdat ze te sjabloonachtig waren. Wat is afgesproken:

- Geen rijen identieke kaartjes, geen gecentreerde koppen met twee knoppen
  eronder, geen emoji, geen paarse verlopen
- Beeld mag door de kolom heen breken en over sectiegrenzen schuiven
- Eén beweging voor de hele site: beeld komt onder een masker vandaan
- De accentkleur (klei, `#A96F52`) wordt spaarzaam maar zichtbaar gebruikt:
  figuurnummers, sectienummers, de onderstreping in de navigatie, focusranden
- De cursieve Bodoni komt precies één keer voor, in het citaat op de homepagina

Bij twijfel: liever één sterk, ongebruikelijk idee consequent doorgevoerd dan
tien veilige.

---

## 10. Handige commando's

```bash
python3 bundel.py       # alles in één bestand voor doorsturen of bekijken
python3 beeld.py        # de plaatsvervangende beelden opnieuw genereren
python3 stijl.py        # aangeleverde fotografie in de huisstijl zetten
python3 logo.py [n]     # het merkteken opnieuw tekenen, n = tussenruimte
```
