# Fotografie — La Main

De site heeft dertien beeldplekken. Nu staan daar gegenereerde vlakken; die zijn bedoeld om vervangen te worden door echte fotografie.

## Zo zet je een foto erin

1. Leg je bestand in de map `foto-bron/` met de naam van de plek: `rug.jpg`, `hero.jpg`, enzovoort.
2. Draai `python3 stijl.py`.
3. Klaar. De foto wordt op de juiste verhouding gesneden, in de roze-gouden toon gezet en in `foto/` weggeschreven.

Je hoeft dus niet vooraf te snijden of te bewerken — het script doet de uitsnede en de kleur. Één foto tegelijk kan ook: `python3 stijl.py rug`.

Zit het zwaartepunt van je foto niet in het midden, pas dan `focus` aan in de tabel `PLEKKEN` onderin `stijl.py`. `(0.5, 0.42)` betekent horizontaal midden, verticaal iets boven het midden; `(0.5, 0.2)` snijdt strakker naar de bovenkant.

## Wat er per plek hoort

| Bestandsnaam | Verhouding | Onderwerp |
|---|---|---|
| `hero.jpg` | breed, liggend | Schouder en nek in strijklicht. Huid groot in beeld, gezicht niet herkenbaar. Dit is het eerste dat iemand ziet. |
| `rug.jpg` | staand 3:4 | Handen op de bovenrug, vingers in het weefsel. Het merkbeeld: dít is waar de naam vandaan komt. |
| `linnen.jpg` | vierkant | Gevouwen linnen of een stapel handdoeken, van dichtbij. |
| `olie-panorama.jpg` | panorama 21:9 | Olie die op de handpalm valt, of glanzende huid in warm licht. |
| `salon-cel.jpg` | staand 4:5 | De behandelruimte. De tafel half in beeld, veel licht, weinig spullen. |
| `locatie-cel.jpg` | staand 4:5 | Opgebouwde tafel in een woonkamer bij avondlicht. Donkerder van toon. |
| `olie-huid.jpg` | staand 4:5 | Olie glanzend op een schouder of onderarm. |
| `onderarm.jpg` | staand 3:4 | De onderarm van de masseuse in beweging, spanning in de hand zichtbaar. |
| `ruimte-panorama.jpg` | panorama 21:9 | De ruimte in de breedte. |
| `linnen-detail.jpg` | staand 3:4 | Een plooi van het laken met licht dat eroverheen strijkt. |
| `hoek-schemer.jpg` | staand 4:5 | Een hoek van de ruimte, een lamp, gedempt. Donkerder van toon. |
| `tafel-panorama.jpg` | panorama 21:9 | De opgebouwde tafel op locatie, breed. Donkerder van toon. |
| `nek-panorama.jpg` | panorama 21:9 | Nek en schouder, handen net in beeld. |

De verhouding is een richtlijn: fotografeer ruim, het script snijdt bij. Lever aan op minstens 2000 pixels aan de lange zijde.

## Aanwijzingen voor de fotograaf

**Licht.** Eén zachte bron van opzij — een raam met dun gordijn, of een softbox met diffusie. Nooit frontaal, nooit twee bronnen. Het beeld leeft van de overgang tussen licht en schaduw over een ronding.

**Lens.** 50 tot 85 mm, wijd open (f/1.4 – f/2.8). Focus op één punt en laat de rest wegvallen. Onscherpte mag; de site is erop gebouwd.

**Belichting.** Fotografeer een halve stop te licht. Het merk is zacht en licht, niet dramatisch.

**Kleur in beeld.** Houd blauw en groen uit het kader — die vechten met het roze-goud. Werk met ongebleekt linnen, klei, zand, warm hout. Geen witte handdoeken tegen een witte muur: dan is er geen toon om mee te werken.

**Huid.** Groot in beeld, van dichtbij, nooit een poserend gezicht in de lens. Het gaat om aanraking en om weefsel, niet om een model.

**Wat te vermijden.** Kaarsen, orchideeën, opgestapelde kiezels, spa-clichés. Handen die theatraal in de lucht zweven. Alles wat naar wellnessfolder ruikt.

## Als je met beeldgeneratie werkt

Werkt ook, mits het resultaat niet als een gezicht van een niet-bestaand persoon in beeld komt. Blijf bij lichaamsdelen, stof en ruimte. Een prompt die aansluit op deze stijl:

```
extreme close-up of a shoulder and neck in warm directional side light,
shallow depth of field, out of focus, soft rose-gold and pale peach tones,
matte film grain, minimal editorial fashion photography, no face visible,
85mm f/1.4, natural skin texture, warm linen background
```

Wissel het onderwerp per plek: *hands pressing into an upper back*, *folded raw linen*, *oil dripping onto an open palm*, *a massage table in a quiet room at dusk*. Houd de rest van de prompt gelijk, dan blijft de reeks één geheel.

Het maakt niet uit of het resultaat kleurtechnisch precies klopt — `stijl.py` trekt alles naar dezelfde toon.

## De toon bijstellen

Vind je het geheel te bleek, te warm of te vaag, dan zitten alle knoppen in `stijl.py`:

| Wat | Waar | Effect |
|---|---|---|
| `ontkleur` | `graderen()` | hoeveel oorspronkelijke kleur verdwijnt (hoger = eenvormiger) |
| `kracht` | `graderen()` | hoe sterk de roze-gouden trap doorwerkt |
| `optillen` | `graderen()` | hoe ver de zwarten omhoog gaan (hoger = matter, zachter) |
| `zachtheid` | `graderen()` | contrast; onder 1 vlakt het af |
| `vaag` | per plek in `PLEKKEN` | de onscherpte, als fractie van de beeldbreedte |
| kleurtrappen | bovenin `beeld.py` | de kleuren zelf |
