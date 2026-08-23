/* ============================================================
   CONFIGURATIE — hier past u alles aan
   ============================================================ */
const CONFIG = {
  stad: 'Eindhoven',
  openingsdagen: [1,2,3,4,5],              // 1 = maandag ... 5 = vrijdag
  open:  '09:00',                          // TE BEVESTIGEN
  sluit: '19:00',                          // TE BEVESTIGEN
  slotMinuten: 30,
  opbouwMinuten: 15,                       // op locatie: op- en afbouw
  maxVooruitDagen: 90,
  kmTarief: 0.39,                          // € per km, heen én terug
  reistijdStaffels: [                      // toeslag === null → op aanvraag
    { tot: 10,       toeslag: 0  },
    { tot: 20,       toeslag: 15 },
    { tot: 35,       toeslag: 30 },
    { tot: Infinity, toeslag: null }
  ],
  behandelingen: [
    { id:'onderhoud', naam:'Onderhoud',  duur:60,  prijs:90,
      kort:'Volledig lichaam, rustig tempo',
      omschrijving:'De basis. Een volledige lichaamsmassage in rustig tempo, gericht op het losmaken van dagelijkse spanning in nek, schouders en onderrug. De behandeling waar de meeste mensen mee beginnen en waar de meeste mensen bij blijven.' },
    { id:'opmaat',    naam:'Op maat',    duur:90,  prijs:130, // PRIJS TE BEVESTIGEN
      kort:'Gericht op wat er die dag speelt',
      omschrijving:'Anderhalf uur waarin er dieper op één of twee gebieden wordt gewerkt, zonder de rest over te slaan. Geschikt wanneer er een duidelijke klacht is: een vastzittende schouder, een overbelaste heup, een rug die niet loslaat.' },
    { id:'verdieping',naam:'Verdieping', duur:120, prijs:170, // PRIJS TE BEVESTIGEN
      kort:'Diep bindweefselwerk, volledige sessie',
      omschrijving:'Twee uur diep bindweefselwerk voor wie structureel spanning vasthoudt. Langzaam opbouwend, met ruimte om tussendoor te ademen en na te komen. Niet bedoeld als eerste kennismaking.' }
  ],
  /* Mock-reisdata. Vervang later door een echte afstandsberekening. */
  postcodezones: [
    { van:5611, tot:5617, plaats:'Eindhoven — Centrum & Stratum',  min:6,  km:2.4 },
    { van:5621, tot:5629, plaats:'Eindhoven — Woensel-Zuid',       min:11, km:5.2 },
    { van:5631, tot:5639, plaats:'Eindhoven — Woensel-Noord',      min:14, km:7.1 },
    { van:5641, tot:5648, plaats:'Eindhoven — Tongelre',           min:12, km:6.0 },
    { van:5651, tot:5658, plaats:'Eindhoven — Strijp & Gestel',    min:9,  km:4.2 },
    { van:5503, tot:5508, plaats:'Veldhoven',                      min:18, km:9.4 },
    { van:5580, tot:5583, plaats:'Waalre & Aalst',                 min:15, km:8.1 },
    { van:5660, tot:5666, plaats:'Geldrop & Mierlo',               min:19, km:10.3 },
    { van:5670, tot:5674, plaats:'Nuenen',                         min:17, km:9.0 },
    { van:5680, tot:5689, plaats:'Best & Oirschot',                min:22, km:13.2 },
    { van:5690, tot:5694, plaats:'Son en Breugel',                 min:18, km:10.6 },
    { van:5700, tot:5709, plaats:'Helmond',                        min:28, km:19.4 },
    { van:5000, tot:5049, plaats:'Tilburg',                        min:40, km:36.0 },
    { van:5200, tot:5249, plaats:"'s-Hertogenbosch",               min:45, km:47.0 }
  ]
};

/* ============================================================
   HULPFUNCTIES
   ============================================================ */
const $  = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const euro = n => '€ ' + n.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});
const euro0 = n => Number.isInteger(n) ? '€ ' + n.toLocaleString('nl-NL') : euro(n);
const DAGEN = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
const MAANDEN = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const pad = n => String(n).padStart(2,'0');
const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const toTijd = m => pad(Math.floor(m/60))+':'+pad(m%60);
const dKey = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const langDatum = d => DAGEN[d.getDay()]+' '+d.getDate()+' '+MAANDEN[d.getMonth()]+' '+d.getFullYear();
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Stabiele pseudo-random op basis van een string, zodat de agenda
   niet verspringt bij elke render. */
function seed(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h,16777619); }
  return ((h>>>0)%1000)/1000;
}

function zoekZone(pc){
  const n = parseInt(String(pc).replace(/\D/g,'').slice(0,4),10);
  if(!n || String(n).length < 4) return null;
  const z = CONFIG.postcodezones.find(z => n>=z.van && n<=z.tot);
  return z || { plaats:'Buiten de regio', min:45, km:42, onbekend:true };
}
const staffel = min => CONFIG.reistijdStaffels.find(s => min <= s.tot);
function berekenReis(pc){
  const z = zoekZone(pc); if(!z) return null;
  const st = staffel(z.min);
  return {
    plaats:z.plaats, min:z.min, km:z.km, onbekend:!!z.onbekend,
    toeslag: st.toeslag,
    kmKosten: Math.round(z.km * 2 * CONFIG.kmTarief * 100)/100,
    opAanvraag: st.toeslag === null
  };
}

/* ============================================================
   ROUTER
   ============================================================ */
const ROUTES = ['home','behandelingen','salon','op-locatie','boeken','contact'];
function route(){
  let r = (location.hash || '#/').replace('#/','').replace(/\/$/,'');
  if(!r || !ROUTES.includes(r)) r = 'home';
  $$('.pagina').forEach(p => p.classList.toggle('aan', p.id === 'p-'+r));
  $$('nav.links a').forEach(a => a.classList.toggle('actief', a.getAttribute('href') === '#/'+r));
  document.body.classList.remove('menu-open');
  window.scrollTo(0,0);
  observeAll(); onScroll();
}
window.addEventListener('hashchange', route);

/* ============================================================
   REVEAL + NAV
   ============================================================ */
/* De onthulling gaat bewust NIET via IntersectionObserver. Een element met
   .onthul staat op clip-path:inset(0 0 100%) en heeft daardoor geen zichtbaar
   oppervlak; de waarnemer meldde zo'n element nooit als zichtbaar, waardoor het
   masker nooit openging en het beeld voorgoed leeg bleef. Een rechtstreekse
   meting van de positie heeft daar geen last van. */
const DREMPEL = 0.92; // een element onthult zodra de bovenkant 92% van het scherm passeert
function toonWatInBeeldIs(){
  $$('.pagina.aan .rv:not(.in), .pagina.aan .onthul:not(.in)').forEach(el=>{
    if(el.getBoundingClientRect().top < window.innerHeight * DREMPEL) el.classList.add('in');
  });
}
let wacht = false;
function observeAll(){ toonWatInBeeldIs(); }
function onScroll(){
  $('#nav').classList.toggle('vast', window.scrollY > 40);
  if(wacht) return;
  wacht = true;
  requestAnimationFrame(()=>{ wacht = false; toonWatInBeeldIs(); });
}


window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('resize', toonWatInBeeldIs, {passive:true});
window.addEventListener('load', toonWatInBeeldIs);
$('#hamburger').addEventListener('click', ()=> document.body.classList.toggle('menu-open'));

/* ============================================================
   STATISCHE CONTENT
   ============================================================ */
const pijl = ()=> '<svg width="26" height="8" viewBox="0 0 26 8" fill="none"><path d="M0 4h24M21 1l4 3-4 3" stroke="currentColor" stroke-width="1"/></svg>';

function renderIdx(el, uitgebreid){
  el.innerHTML = CONFIG.behandelingen.map((b,i)=>`
    <div class="idx-rij">
      <div class="no">0${i+1}</div>
      <div class="tekst">
        <h3 class="d4">${b.naam}</h3>
        <p class="klein">${uitgebreid ? b.omschrijving : b.kort}</p>
      </div>
      <div class="pr">${euro0(b.prijs)}<small>${b.duur} minuten</small></div>
    </div>`).join('');
}
renderIdx($('#home-idx'), false);
renderIdx($('#beh-idx'), true);

$('#tarief-tabel').innerHTML = CONFIG.reistijdStaffels.map((s,i,a)=>{
  const van = i===0 ? 0 : a[i-1].tot;
  const label = s.tot === Infinity ? 'Meer dan '+van+' minuten' : van+' – '+s.tot+' minuten';
  const w = s.toeslag === null ? 'Op aanvraag' : (s.toeslag === 0 ? 'Geen toeslag' : euro0(s.toeslag));
  return `<tr><td>${label}</td><td>${w}</td></tr>`;
}).join('');
$('#km-tarief').textContent = euro(CONFIG.kmTarief);
$('#jaar').textContent = new Date().getFullYear();

$('#contact-form').addEventListener('submit', e=>{
  e.preventDefault(); $('#c-done').style.display='inline'; e.target.reset();
});

/* ============================================================
   BOEKINGSMODULE
   ============================================================ */
const S = {
  stap:0, locatie:null, behandeling:null,
  postcode:'', huisnummer:'', straat:'', reis:null,
  maand:new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  datum:null, tijd:null,
  naam:'', email:'', tel:'', opmerking:'', fouten:{}
};
const ALLE_STAPPEN = [
  {key:'locatie',label:'Locatie'},{key:'behandeling',label:'Behandeling'},
  {key:'adres',label:'Adres'},{key:'moment',label:'Datum & tijd'},
  {key:'gegevens',label:'Gegevens'},{key:'overzicht',label:'Bevestigen'}
];
const stappen = () => ALLE_STAPPEN.filter(s => s.key !== 'adres' || S.locatie === 'locatie');
const huidig  = () => stappen()[Math.min(S.stap, stappen().length-1)];

function totaal(){
  const b = S.behandeling; if(!b) return null;
  const opLoc = S.locatie==='locatie' && S.reis && !S.reis.opAanvraag;
  const km = opLoc ? S.reis.kmKosten : 0;
  const tt = opLoc ? S.reis.toeslag : 0;
  return { basis:b.prijs, km, tt, som: Math.round((b.prijs+km+tt)*100)/100 };
}

function slotsVoor(d){
  if(!d || !S.behandeling) return [];
  const duur = S.behandeling.duur;
  const reis = S.locatie==='locatie' && S.reis && !S.reis.opAanvraag ? S.reis.min : 0;
  const buffer = S.locatie==='locatie' ? reis + CONFIG.opbouwMinuten : 0;
  const start = toMin(CONFIG.open) + buffer;
  const eind  = toMin(CONFIG.sluit) - buffer;
  const out = [];
  for(let m = Math.ceil(start/CONFIG.slotMinuten)*CONFIG.slotMinuten; m + duur <= eind; m += CONFIG.slotMinuten){
    const t = toTijd(m);
    out.push({ tijd:t, bezet: seed(dKey(d)+t+S.behandeling.id) < 0.42 });
  }
  return out;
}
function dagOpen(d){
  const vandaag = new Date(); vandaag.setHours(0,0,0,0);
  const max = new Date(vandaag.getTime() + CONFIG.maxVooruitDagen*864e5);
  if(d < vandaag || d > max) return false;
  return CONFIG.openingsdagen.includes(d.getDay());
}

function renderProg(){
  $('#voortgang').innerHTML = stappen().map((s,i)=>{
    const cls = i === S.stap ? 'nu' : (i < S.stap ? 'klaar' : '');
    return `<div class="st ${cls}">${pad(i+1)} &nbsp;${s.label}</div>`;
  }).join('');
}
function renderBoeken(){
  if(S.stap >= stappen().length) S.stap = stappen().length-1;
  renderProg();
  const k = huidig().key, b = $('#agenda-body');
  if(k==='locatie')     b.innerHTML = vLocatie();
  if(k==='behandeling') b.innerHTML = vBehandeling();
  if(k==='adres')       b.innerHTML = vAdres();
  if(k==='moment')      b.innerHTML = vMoment();
  if(k==='gegevens')    b.innerHTML = vGegevens();
  if(k==='overzicht')   b.innerHTML = vOverzicht();
  bind();
}
function nav(terug, vooruit, label, kan){
  return `<div class="agenda-nav">
    <button class="knop leeg" data-act="terug" ${terug?'':'style="visibility:hidden"'}>← Terug</button>
    ${vooruit ? `<button class="knop vol" data-act="verder" ${kan?'':'disabled'}>${label||'Verder'}</button>` : '<span></span>'}
  </div>`;
}

function vLocatie(){
  return `
  <h2 class="d3" style="margin:0 0 30px">Waar wilt u behandeld worden?</h2>
  <div class="keuzes">
    <button class="keuze ${S.locatie==='salon'?'gekozen':''}" data-loc="salon">
      <span class="vink">${pijl()}</span>
      <span class="label">In de salon</span>
      <span>
        <span class="d4" style="display:block;margin-bottom:8px">${CONFIG.stad}</span>
        <span class="klein">Eén behandelruimte, één klant per keer. Geen reiskosten.</span>
      </span>
    </button>
    <button class="keuze ${S.locatie==='locatie'?'gekozen':''}" data-loc="locatie">
      <span class="vink">${pijl()}</span>
      <span class="label">Op locatie</span>
      <span>
        <span class="d4" style="display:block;margin-bottom:8px">Thuis of op kantoor</span>
        <span class="klein">Tafel en linnen gaan mee. Reistijd en reiskosten ziet u vooraf.</span>
      </span>
    </button>
  </div>
  ${nav(false,true,'Verder',!!S.locatie)}`;
}

function vBehandeling(){
  return `
  <h2 class="d3" style="margin:0 0 10px">Welke behandeling?</h2>
  <p class="klein" style="margin-bottom:30px">${S.locatie==='salon' ? 'In de salon in '+CONFIG.stad+'.' : 'Op uw eigen locatie.'}</p>
  <div>
    ${CONFIG.behandelingen.map(b=>`
      <button class="trt ${S.behandeling&&S.behandeling.id===b.id?'gekozen':''}" data-beh="${b.id}">
        <span class="stip"></span>
        <span>
          <span class="d4" style="display:block;margin-bottom:6px">${b.naam}</span>
          <span class="klein">${b.omschrijving}</span>
        </span>
        <span class="pr" style="font-family:var(--display);font-size:24px;white-space:nowrap">
          ${euro0(b.prijs)}
          <small style="font-family:var(--sans);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--inkt-42);display:block;margin-top:5px;text-align:right">${b.duur} min</small>
        </span>
      </button>`).join('')}
  </div>
  ${nav(true,true,'Verder',!!S.behandeling)}`;
}

function vAdres(){
  const r = S.reis;
  let paneel = '';
  if(r){
    if(r.opAanvraag){
      paneel = `<div class="melding" style="margin-top:30px">
        <strong style="font-weight:400">${r.plaats}</strong> — circa ${r.min} minuten reistijd.
        Boven de 35 minuten maken we een afspraak op maat.
        <a href="#/contact" style="text-decoration:underline">Neem contact op</a> en u krijgt binnen één werkdag een voorstel.
      </div>`;
    } else {
      const t = totaal();
      paneel = `<div class="opbouw" style="margin-top:34px">
        <div class="label" style="margin-bottom:16px">${r.plaats}</div>
        <div class="som-rij"><span class="k">${S.behandeling.naam} · ${S.behandeling.duur} min</span><span class="cijfers">${euro(t.basis)}</span></div>
        <div class="som-rij"><span class="k">Reiskosten · ${String(r.km).replace('.',',')} km heen en terug · ${euro(CONFIG.kmTarief)}/km</span><span class="cijfers">${euro(t.km)}</span></div>
        <div class="som-rij"><span class="k">Reistijdtoeslag · circa ${r.min} min enkele reis</span><span class="cijfers">${t.tt===0?'Geen':euro(t.tt)}</span></div>
        <div class="som-rij tot"><span>Totaal</span><span class="cijfers">${euro(t.som)}</span></div>
      </div>
      <p class="klein" style="margin-top:16px">De agenda houdt automatisch rekening met de heen- en terugreis en met vijftien minuten op- en afbouw.</p>`;
    }
  }
  return `
  <h2 class="d3" style="margin:0 0 10px">Waar mogen we komen?</h2>
  <p class="klein" style="margin-bottom:34px">Postcode en huisnummer volstaan. Het volledige adres vragen we in de volgende stap.</p>
  <div class="veldrij" style="max-width:640px">
    <div>
      <label class="lbl" for="f-pc">Postcode</label>
      <input class="invoer" id="f-pc" value="${esc(S.postcode)}" placeholder="5611 AB" autocomplete="postal-code" maxlength="7">
      ${S.fouten.postcode?`<span class="fout">${S.fouten.postcode}</span>`:''}
    </div>
    <div>
      <label class="lbl" for="f-hn">Huisnummer</label>
      <input class="invoer" id="f-hn" value="${esc(S.huisnummer)}" placeholder="12" autocomplete="address-line1">
    </div>
  </div>
  ${paneel}
  ${nav(true,true,'Verder', !!(r && !r.opAanvraag && S.huisnummer.trim()))}`;
}

function vMoment(){
  const m = S.maand;
  const eerste = new Date(m.getFullYear(), m.getMonth(), 1);
  const dagenInMaand = new Date(m.getFullYear(), m.getMonth()+1, 0).getDate();
  const offset = (eerste.getDay()+6)%7;
  const vandaag = new Date(); vandaag.setHours(0,0,0,0);
  const kanTerug = m > new Date(vandaag.getFullYear(), vandaag.getMonth(), 1);
  const maxM = new Date(vandaag.getTime()+CONFIG.maxVooruitDagen*864e5);
  const kanVooruit = m < new Date(maxM.getFullYear(), maxM.getMonth(), 1);

  let cells = ['ma','di','wo','do','vr','za','zo'].map(d=>`<div class="dag-kop">${d}</div>`).join('');
  for(let i=0;i<offset;i++) cells += '<div class="dag leeg"></div>';
  for(let d=1;d<=dagenInMaand;d++){
    const dt = new Date(m.getFullYear(), m.getMonth(), d);
    const open = dagOpen(dt);
    const sel = S.datum && dKey(S.datum)===dKey(dt);
    cells += `<button class="dag ${open?'':'dicht'} ${sel?'gekozen':''}" ${open?`data-dag="${dKey(dt)}"`:''}>${d}</button>`;
  }

  const sl = S.datum ? slotsVoor(S.datum) : [];
  const vrij = sl.filter(s=>!s.bezet).length;
  const slotHtml = !S.datum
    ? '<p class="klein">Kies eerst een dag.</p>'
    : (sl.length===0
        ? '<p class="klein">Voor deze combinatie van behandeling en reistijd is er op deze dag geen ruimte. Kies een andere dag.</p>'
        : `<p class="klein" style="margin-bottom:18px">${langDatum(S.datum)} — ${vrij} ${vrij===1?'moment':'momenten'} beschikbaar</p>
           <div class="tijden">${sl.map(s=>`<button class="tijd ${s.bezet?'dicht':''} ${S.tijd===s.tijd?'gekozen':''}" ${s.bezet?'':`data-tijd="${s.tijd}"`}>${s.tijd}</button>`).join('')}</div>`);

  return `
  <h2 class="d3" style="margin:0 0 10px">Wanneer schikt het?</h2>
  <p class="klein" style="margin-bottom:34px">De salon werkt van maandag tot en met vrijdag${S.locatie==='locatie'?'. Reistijd en op- en afbouw zijn al ingepland.':'.'}</p>
  <div class="twee-kal">
    <div>
      <div class="kal-kop">
        <div class="d4">${MAANDEN[m.getMonth()]} ${m.getFullYear()}</div>
        <div class="kal-nav">
          <button data-maand="-1" ${kanTerug?'':'disabled'} aria-label="Vorige maand">‹</button>
          <button data-maand="1" ${kanVooruit?'':'disabled'} aria-label="Volgende maand">›</button>
        </div>
      </div>
      <div class="kal">${cells}</div>
    </div>
    <div>${slotHtml}</div>
  </div>
  ${nav(true,true,'Verder', !!(S.datum && S.tijd))}`;
}

function vGegevens(){
  const f = S.fouten;
  return `
  <h2 class="d3" style="margin:0 0 10px">Uw gegevens</h2>
  <p class="klein" style="margin-bottom:34px">Deze gebruiken we alleen voor uw afspraak en de bevestiging.</p>
  <div style="max-width:760px">
    <div class="veldrij groep">
      <div><label class="lbl" for="g-naam">Naam</label>
        <input class="invoer" id="g-naam" value="${esc(S.naam)}" autocomplete="name">
        ${f.naam?`<span class="fout">${f.naam}</span>`:''}</div>
      <div><label class="lbl" for="g-tel">Telefoon</label>
        <input class="invoer" id="g-tel" value="${esc(S.tel)}" autocomplete="tel" placeholder="06 12 34 56 78">
        ${f.tel?`<span class="fout">${f.tel}</span>`:''}</div>
    </div>
    <div class="groep"><label class="lbl" for="g-mail">E-mail</label>
      <input class="invoer" id="g-mail" value="${esc(S.email)}" autocomplete="email" placeholder="naam@voorbeeld.nl">
      ${f.email?`<span class="fout">${f.email}</span>`:''}</div>
    ${S.locatie==='locatie'?`<div class="groep"><label class="lbl" for="g-adres">Straat en huisnummer</label>
      <input class="invoer" id="g-adres" value="${esc(S.straat)}" placeholder="Straatnaam ${esc(S.huisnummer)}">
      ${f.straat?`<span class="fout">${f.straat}</span>`:''}</div>`:''}
    <div class="groep"><label class="lbl" for="g-opm">Blessures, voorkeuren of allergieën <span style="text-transform:none;letter-spacing:0">(optioneel)</span></label>
      <textarea class="invoer" id="g-opm" rows="3" placeholder="Bijvoorbeeld: gevoelige onderrug, geen druk op de nek, allergie voor amandelolie.">${esc(S.opmerking)}</textarea></div>
  </div>
  ${nav(true,true,'Naar het overzicht',true)}`;
}

function vOverzicht(){
  const t = totaal(), r = S.reis;
  return `
  <h2 class="d3" style="margin:0 0 34px">Klopt dit zo?</h2>
  <div class="twee-som">
    <div>
      <table class="tabel">
        <tr><td style="color:var(--inkt-62)">Behandeling</td><td>${S.behandeling.naam} · ${S.behandeling.duur} minuten</td></tr>
        <tr><td style="color:var(--inkt-62)">Waar</td><td>${S.locatie==='salon' ? 'In de salon, '+CONFIG.stad : esc(S.straat)+', '+esc(S.postcode.toUpperCase())}</td></tr>
        <tr><td style="color:var(--inkt-62)">Wanneer</td><td>${langDatum(S.datum)}<br>${S.tijd} – ${toTijd(toMin(S.tijd)+S.behandeling.duur)}</td></tr>
        <tr><td style="color:var(--inkt-62)">Naam</td><td>${esc(S.naam)}</td></tr>
        <tr><td style="color:var(--inkt-62)">Contact</td><td>${esc(S.email)}<br>${esc(S.tel)}</td></tr>
        ${S.opmerking?`<tr><td style="color:var(--inkt-62)">Opmerking</td><td>${esc(S.opmerking)}</td></tr>`:''}
      </table>
      <p class="klein tbc" style="margin-top:24px">[Annuleringsvoorwaarden nog te bevestigen — hier komt de termijn waarbinnen kosteloos verzet kan worden.]</p>
    </div>
    <div>
      <div class="opbouw">
        <div class="label" style="margin-bottom:16px">Prijsopbouw</div>
        <div class="som-rij"><span class="k">Behandeling</span><span class="cijfers">${euro(t.basis)}</span></div>
        ${S.locatie==='locatie'?`
          <div class="som-rij"><span class="k">Reiskosten · ${String(r.km).replace('.',',')} km v.v.</span><span class="cijfers">${euro(t.km)}</span></div>
          <div class="som-rij"><span class="k">Reistijdtoeslag</span><span class="cijfers">${t.tt===0?'Geen':euro(t.tt)}</span></div>`:''}
        <div class="som-rij tot"><span>Totaal</span><span class="cijfers">${euro(t.som)}</span></div>
      </div>
      <button class="knop vol" data-act="bevestig" style="width:100%;justify-content:center;margin-top:18px">Afspraak bevestigen</button>
      <button class="knop leeg" data-act="terug" style="margin-top:10px">← Terug</button>
    </div>
  </div>`;
}

function vKlaar(){
  const code = 'LM-' + (Math.floor(seed(dKey(S.datum)+S.tijd+S.email)*9000)+1000);
  return `
  <div class="bevestigd">
    <div class="ring">${pijl()}</div>
    <h2 class="d2" style="margin:0 0 22px;max-width:14ch">Uw afspraak staat genoteerd.</h2>
    <p class="lead" style="margin-bottom:30px">
      ${langDatum(S.datum)} om ${S.tijd}, ${S.locatie==='salon' ? 'in de salon in '+CONFIG.stad : 'bij u op locatie'}.
      Een bevestiging is onderweg naar ${esc(S.email)}.
    </p>
    <table class="tabel" style="max-width:460px">
      <tr><td style="color:var(--inkt-62)">Referentie</td><td class="cijfers">${code}</td></tr>
      <tr><td style="color:var(--inkt-62)">Behandeling</td><td>${S.behandeling.naam} · ${S.behandeling.duur} min</td></tr>
      <tr><td style="color:var(--inkt-62)">Totaal</td><td class="cijfers">${euro(totaal().som)}</td></tr>
    </table>
    <div class="melding" style="max-width:52ch">Dit is een demonstratie. Er is nog geen koppeling met een agenda of e-mailsysteem; de afspraak wordt niet daadwerkelijk vastgelegd.</div>
    <div style="margin-top:34px;display:flex;gap:14px;flex-wrap:wrap">
      <a href="#/" class="knop">Naar de homepagina</a>
      <button class="knop leeg" data-act="opnieuw">Nog een afspraak maken</button>
    </div>
  </div>`;
}

function bind(){
  $$('#agenda-body [data-loc]').forEach(b=>b.onclick=()=>{ S.locatie=b.dataset.loc; S.datum=null; S.tijd=null; renderBoeken(); });
  $$('#agenda-body [data-beh]').forEach(b=>b.onclick=()=>{ S.behandeling=CONFIG.behandelingen.find(x=>x.id===b.dataset.beh); S.tijd=null; renderBoeken(); });
  $$('#agenda-body [data-dag]').forEach(b=>b.onclick=()=>{ const [y,mo,d]=b.dataset.dag.split('-').map(Number); S.datum=new Date(y,mo-1,d); S.tijd=null; renderBoeken(); });
  $$('#agenda-body [data-tijd]').forEach(b=>b.onclick=()=>{ S.tijd=b.dataset.tijd; renderBoeken(); });
  $$('#agenda-body [data-maand]').forEach(b=>b.onclick=()=>{ S.maand=new Date(S.maand.getFullYear(), S.maand.getMonth()+Number(b.dataset.maand), 1); renderBoeken(); });

  const pc = $('#f-pc'), hn = $('#f-hn');
  if(pc){
    const her = ()=>{
      S.postcode = pc.value; S.huisnummer = hn.value;
      S.reis = pc.value.replace(/\D/g,'').length>=4 ? berekenReis(pc.value) : null;
      const actief = document.activeElement === hn ? 'hn' : 'pc';
      const caret = (actief==='hn' ? hn : pc).selectionStart;
      renderBoeken();
      const el = actief==='hn' ? $('#f-hn') : $('#f-pc');
      if(el){ el.focus(); try{ el.setSelectionRange(caret,caret); }catch(e){} }
    };
    pc.oninput = her; hn.oninput = her;
  }
  const veld = {'g-naam':'naam','g-tel':'tel','g-mail':'email','g-opm':'opmerking','g-adres':'straat'};
  Object.keys(veld).forEach(id=>{ const el=$('#'+id); if(el) el.oninput = ()=> S[veld[id]] = el.value; });

  const verder = $('#agenda-body [data-act="verder"]');
  if(verder) verder.onclick = ()=>{
    if(huidig().key==='gegevens' && !valideer()){ renderBoeken(); return; }
    S.stap++; renderBoeken(); naarTop();
  };
  $$('#agenda-body [data-act="terug"]').forEach(b=>b.onclick=()=>{ S.stap=Math.max(0,S.stap-1); renderBoeken(); naarTop(); });
  const bev = $('#agenda-body [data-act="bevestig"]');
  if(bev) bev.onclick = ()=>{ $('#agenda-body').innerHTML = vKlaar(); $('#voortgang').innerHTML=''; bind(); naarTop(); };
  const opn = $('#agenda-body [data-act="opnieuw"]');
  if(opn) opn.onclick = ()=>{
    Object.assign(S,{stap:0,locatie:null,behandeling:null,postcode:'',huisnummer:'',straat:'',reis:null,datum:null,tijd:null,naam:'',email:'',tel:'',opmerking:'',fouten:{}});
    renderBoeken(); naarTop();
  };
}
function naarTop(){ window.scrollTo({top:0,behavior:'smooth'}); }

function valideer(){
  const f = {};
  if(!S.naam.trim()) f.naam = 'Vul uw naam in.';
  if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(S.email.trim())) f.email = 'Dit e-mailadres klopt niet.';
  if(S.tel.replace(/\D/g,'').length < 9) f.tel = 'Vul een telefoonnummer in waarop u bereikbaar bent.';
  if(S.locatie==='locatie' && !S.straat.trim()) f.straat = 'Vul de straatnaam in.';
  S.fouten = f;
  return Object.keys(f).length === 0;
}

renderBoeken();
route();
