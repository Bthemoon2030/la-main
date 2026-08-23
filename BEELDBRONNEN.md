# Beeldbronnen

De elf beelden in `foto/` zijn **geen eigen fotografie**. Het zijn foto's van
Unsplash, uitgezocht op de briefing in [FOTOGRAFIE.md](FOTOGRAFIE.md) en door
`stijl.py` in de huisstijl gezet. Ze staan er als plaatsvervanger, tot er een
eigen shoot is.

## Licentie

Unsplash-licentie: kosteloos te gebruiken, ook commercieel, zonder toestemming
vooraf en zonder verplichte naamsvermelding. Wat niet mag: de foto's als zodanig
doorverkopen, of er een concurrerende beelddienst mee opzetten. Dat speelt hier
niet.

Volledige tekst: https://unsplash.com/license

## Welke foto waar staat

De originelen staan in `foto-bron/`. Wil je een foto terugzoeken of vervangen,
dan vind je hem op `https://unsplash.com/photos/<id>`.

| Plek op de site | Unsplash-id | Wat erop staat |
|---|---|---|
| `hero` | 1603309288253-08db72e5117d | schouder en nek in strijklicht |
| `rug` | 1712638932314-e2b185ca0930 | handen op de bovenrug, over een doek |
| `linnen` | 1591625591034-75d303d2e1a4 | stapel gevouwen linnen op hout |
| `salon-cel` | 1601059683522-02ae0eeff25c | stille ruimte, dun gordijn, kruk |
| `locatie-cel` | 1630389715052-983a8e31faa6 | kamer bij avondlicht |
| `olie-huid` | 1654781350550-0dc72ecb6fae | glanzende nek en bovenrug |
| `onderarm` | 1757689314932-bec6e9c39e51 | handen die een onderarm masseren |
| `ruimte-panorama` | 1552558636-f6a8f071c2b3 | strijklicht op een pleisterwand |
| `linnen-detail` | 1705290304455-35ffb433f560 | plooi van linnen met zoomdetail |
| `hoek-schemer` | 1636321667799-ddf30b3e1261 | lamp in een hoek, gedempt |
| `tafel-panorama` | 1565735852636-cbf956b1d01a | kamer bij avondlicht, licht achter het gordijn |

Geen enkele foto toont een herkenbaar gezicht — dat was een eis uit de briefing
en het scheelt bovendien gedoe met portretrecht.

## Wat hier niet klopt, en dat is bewust

De vier beelden van ruimtes (`salon-cel`, `ruimte-panorama`, `locatie-cel`,
`tafel-panorama`) tonen **niet de salon van La Main** en ook geen opgebouwde
massagetafel. Het zijn rustige interieurs in de juiste toon. De bijschriften op
de site — "De behandelruimte", "Opgebouwd op locatie" — beloven dus meer dan het
beeld waarmaakt. Zodra er eigen foto's zijn, zijn dit de vier die het eerst
vervangen moeten worden.

Wat er bij Unsplash onder "spa" en "massage room" te vinden is, is precies waar
de briefing voor waarschuwt: sauna's, hotstones, kaarsen, tulpen. Daarom is er
gekozen voor stille interieurs in plaats van letterlijke behandelkamers.

## Vervangen door eigen fotografie

```bash
# leg het bestand in foto-bron/ met de naam van de plek, bijvoorbeeld rug.jpg
python stijl.py rug
```

Werk je alles in één keer bij, laat dan `python stijl.py` de hele reeks doen.
Vergeet daarna niet de alt-teksten in `index.html` na te lopen: die beschrijven
nu wat er op de plaatsvervangers te zien is.
