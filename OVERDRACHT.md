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
| `foto/` | Elf beelden. |
| `logo-lm.svg` | Het merkteken als vector. Zit ook als `<symbol>` in `index.html`. |
| `logo.py` | Tekent `logo-lm.svg` opnieuw. |
| `beeld.py` | Genereert plaatsvervangende beelden (niet meer in gebruik). |
| `stijl.py` | Zet aangeleverde fotografie om in de huisstijl. |
| `bundel.py` | Maakt er één bestand van: `la-main-compleet.html`. |
| `README.md` | Praktische handleiding. |
| `FOTOGRAFIE.md` | Briefing voor de fotograaf, per beeldplek. |
| `BEELDBRONNEN.md` | Welke foto waar staat, en onder welke licentie. |

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

De behandelingen heten **Regulier** (60 min), **Op maat** (90 min) en
**Verdieping** (120 min).

De pay-off is **"De massage die je verdient."**

Toon: rustig, zelfverzekerd, weinig woorden. Geen uitroeptekens, geen
superlatieven. De klant wordt met *je* aangesproken.

**Leg geen druk op herhaling.** De eerste versie van de site verkocht massage
als noodzakelijk onderhoud dat je met regelmaat moest volhouden — compleet met
een vergelijking met de kapper en de sportschool. Dat werkte afschrikkend en is
er in augustus 2026 uit gehaald. Eén keer komen mag ook; dat staat nu
letterlijk op de homepagina. Schrijf niets terug in die richting.

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

## 8. Fotografie — plaatsvervangers, geen eigen shoot

De elf beelden in `foto/` zijn foto's van Unsplash, uitgezocht op de
briefing hieronder en door `stijl.py` in de roze-gouden toon gezet. Ze zijn
kosteloos en commercieel te gebruiken; de verantwoording per beeld staat in
[BEELDBRONNEN.md](BEELDBRONNEN.md).

Daarmee heeft de site een onderwerp: handen, huid, linnen, licht. Wat er nog
niet is, is **de salon zelf**. De vier beelden van ruimtes tonen rustige
interieurs, geen behandelkamer en geen opgebouwde tafel, terwijl de bijschriften
dat wel beweren. Dat zijn de vier die als eerste vervangen moeten worden zodra er
eigen fotografie is.

```bash
# leg de bestanden in foto-bron/ met de naam van de plek
python stijl.py
```

Dat snijdt elke foto op de juiste verhouding, zet hem in de roze-gouden toon en
schrijft hem naar `foto/`. `FOTOGRAFIE.md` beschrijft per plek wat er hoort en
hoe er gefotografeerd moet worden. Loop na afloop de alt-teksten in `index.html`
na — die beschrijven nu wat er op de plaatsvervangers staat.

## 9. Waar de kwaliteitslat ligt

De eigenaar heeft expliciet om een 10 gevraagd en heeft eerdere versies
afgekeurd omdat ze te sjabloonachtig waren. Wat is afgesproken:

- Geen rijen identieke kaartjes, geen gecentreerde koppen met twee knoppen
  eronder, geen emoji, geen paarse verlopen
- Beeld mag door de kolom heen breken en over sectiegrenzen schuiven
- Eén beweging voor de hele site: beeld komt onder een masker vandaan
- De accentkleur (klei, `#A96F52`) wordt spaarzaam maar zichtbaar gebruikt:
  sectielabels, sectienummers, de onderstreping in de navigatie, focusranden
- De cursieve Bodoni komt precies één keer voor, in het citaat op de homepagina

Bij twijfel: liever één sterk, ongebruikelijk idee consequent doorgevoerd dan
tien veilige.

---

## 10. Losse presentatie in `presentatie/`

Sinds 15-09-2026 staat er een aparte presentatie met afspraakplanner op
**https://bthemoon2030.github.io/la-main/presentatie/**. Die volgt bewust
**niets** van de huisstijl hierboven (op verzoek: alleen logo, naam en wat ze
doet): donkere wijnkleur, Gilda Display + Hanken Grotesk, zes bladen die je
horizontaal doorbladert, een warmtebeeld op canvas.

- `presentatie/index.html` is de bron; alles zit in dat ene bestand.
- Staat op `noindex`, maar is via de link openbaar te openen.
- Planner: salon en op locatie, reiskosten per postcode (schatting:
  hemelsbreed × 1,35 vanaf het centrum van Eindhoven), vrije tijden per 30 min.
  Alle bedragen, tijden en het werkgebied staan in `CONFIG` bovenin het
  laatste script. **Voorlopig:** € 130/€ 170 voor 90/120 min, ma–vr 09–19,
  € 0,39/km en toeslag 0/15/30.
- Op GitHub is het een **proefversie**: bevestigen toont de bevestiging maar
  slaat niets op. Dezelfde pagina draait ook als Claude-Artifact met de
  `db`-capability; daar worden afspraken wél opgeslagen en is er een
  agenda-overzicht. Die versie is het bestand zonder `<!doctype>`, `<html>`,
  `<head>` en `<body>`.
- Voor echte klanten is een boekingsdienst of backend nodig (zie §6).

### `nieuw/` — homepagina in espresso en ivoor

Sinds 15-09-2026 staat er ook een nieuwe homepagina op
**https://bthemoon2030.github.io/la-main/nieuw/**, gebouwd naar opzet H
(look en feel geïnspireerd op jessicavanduren.com; geen teksten of beelden
daarvan overgenomen).

- `nieuw/index.html` is de bron; de foto's komen uit de gedeelde map `foto/`
  (`../foto/…`), er staan geen kopieën in `nieuw/`.
- Letters: Pinyon Script (naam en titels), Prata (kapitalen), Cormorant
  Garamond (tekst), Montserrat (kleine koppen). Het LM-logo staat ongewijzigd
  midden in de navigatie.
- Dezelfde planner als in `presentatie/`, met hetzelfde `CONFIG`-blok en
  dezelfde voorlopige bedragen. Op GitHub een proefversie; de Claude-Artifact
  "La Main Eindhoven" slaat afspraken wel op.
- Knoppen met `data-kies` (salon/locatie) en de behandelingen
  (`data-kies-beh`) vullen de planner voor.
- Scrolleffect zoals op de inspiratiesite: in "Rust begint bij aandacht"
  blijft `.intro-plak` (kop, tekst, drie vage foto's) een schermhoogte lang
  staan met `position:sticky`, terwijl `.intro-zweef` met scherpe foto's
  eroverheen scrolt. **Geen `overflow:hidden` op `.intro`**, anders plakt er
  niets. Onder 900 px werkt het effect ook, kleiner gezet; de hoogte gebruikt
  `svh` zodat het blok niet verspringt als de adresbalk in- of uitschuift.
- **Vergelijkversie:** `nieuw-zonder-scroll/` is exact `nieuw/` van vóór het
  scrolleffect (commit d6bf0a1): losse collage, geen vaste kop, geen bruine
  waas onder de navigatie. Alleen bedoeld om te vergelijken; wijzigingen aan
  de planner of teksten gaan niet automatisch mee. Verwijder de map zodra er
  gekozen is.
- Staat op `noindex`. De kamerfoto's bij "In de salon" en "Op locatie" zijn
  plaatsvervangers, niet de echte salon.

---

## 11. Handige commando's

```bash
python3 bundel.py       # alles in één bestand voor doorsturen of bekijken
python3 beeld.py        # de plaatsvervangende beelden opnieuw genereren
python3 stijl.py        # aangeleverde fotografie in de huisstijl zetten
python3 logo.py [n]     # het merkteken opnieuw tekenen, n = tussenruimte
```
