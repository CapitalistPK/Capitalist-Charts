import {a as a$1}from'./chunk-WRNJIDHA.js';import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-7HT5APWI.js';import {a as a$2,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {a as a$3}from'./chunk-AQVZWCVV.js';a();var l=class extends a$1{constructor(){super(...arguments);this.titleKey="seasonality";}static{this.styles=[...a$1.styles,a$2`
      :host { min-width: 300px; }
      .grid { direction: ltr; display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; align-items: end; height: 140px; position: relative; }
      .grid::after { content: ''; position: absolute; inset-inline: 0; top: 50%; border-top: 1px solid var(--_border); }
      .m { display: flex; flex-direction: column; height: 100%; position: relative; }
      .bar { position: absolute; inset-inline: 15%; border-radius: 2px; }
      .lbls { direction: ltr; display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; font-size: 0.6rem; color: var(--_faint); text-align: center; }
    `];}resourceFor(e$1,o){return e.seasonality(e$1,o)}body(e){let o=Math.max(.5,...e.rows.map(t=>Math.abs(t.avg??0))),s=t=>new Date(Date.UTC(2026,t-1,1)).toLocaleString(this.locale==="ur"?"ur-PK":"en-GB",{month:"short",timeZone:"UTC"});return b`<div class="grid" role="img" aria-label=${this.s("seasonality")}>
        ${e.rows.map(t=>{let i=t.avg??0,g=Math.abs(i)/o*50,h=`${s(t.mo)}: ${t.avg===null?"\u2013":`${a$3(t.avg,1)}%`} \xB7 ${this.s("positiveYears")} ${t.up===null?"\u2013":`${a$3(t.up*100,0)}%`} (${t.n} ${this.s("years")})`;return b`<div class="m" title=${h}><span class="bar" style="${i>=0?"bottom:50%":"top:50%"};height:${g}%;background:${i>=0?"var(--_up)":"var(--_down)"}"></span></div>`})}
      </div>
      <div class="lbls">${e.rows.map(t=>b`<span>${s(t.mo).slice(0,3)}</span>`)}</div>
      <table class="sr"><caption>${this.s("avgReturn")}</caption>${e.rows.map(t=>b`<tr><th>${s(t.mo)}</th><td>${t.avg??""}</td><td>${t.up??""}</td><td>${t.n}</td></tr>`)}</table>`}foot(e){return `${e.from}\u2013${e.to}`}};g("cap-seasonality",l);export{l as CapSeasonality};