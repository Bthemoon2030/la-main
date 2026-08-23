# La Main — website

Statische site voor een massagesalon in Eindhoven. Nederlandstalig, high-end.
Geen build-stap, geen framework: `index.html` + `stijl.css` + `app.js` + `foto/`.

Live op https://bthemoon2030.github.io/la-main/ — elke push naar `main`
publiceert opnieuw.

**Lees `OVERDRACHT.md` voordat je iets wijzigt.** Daar staat de context en de
openstaande punten (fotografie, placeholders, echte boekingskoppeling).

## Drie dingen die je niet moet omgooien

1. **`font-optical-sizing:none` blijft staan.** Bodoni Moda is variabel met een
   `opsz`-as. Op automatisch worden de haarlijnen bij grote formaten zo dun dat
   ze verdwijnen. Dit is al een keer fout gegaan.
2. **Het logo is een vector, geen tekst** (`logo-lm.svg`, ook als `<symbol>` in
   `index.html`). De tussenruimte van −60 font-eenheden is door de eigenaar
   goedgekeurd. Niet wijzigen zonder te overleggen.
3. **Eén raster van twaalf kolommen.** Kolom 1–2 is de margekolom voor labels en
   bijschriften, inhoud begint op kolom 3. Nieuwe secties houden zich daaraan.

## Taal

Alles Nederlands, ook de namen van de behandelingen. Geen Franse of Engelse
sfeerwoorden. Enige uitzondering: de salonnaam La Main. De klant wordt met
*je* aangesproken — niet met u. Toon: rustig, weinig woorden, geen
superlatieven, en **geen druk**: niets over herhaling, onderhoud of hoe vaak
iemand zou moeten komen. Dat schrikt klanten af.

## Let op

De agenda werkt op gesimuleerde data — er is geen backend. Alles wat je zou
willen aanpassen staat in het `CONFIG`-object bovenin `app.js`.

Placeholders staan tussen blokhaken en hebben de klasse `tbc`. Zoek op `[` in
`index.html` om ze te vinden.
