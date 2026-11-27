import {a as a$1}from'./chunk-WRNJIDHA.js';import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-7HT5APWI.js';import {a as a$2,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {a as a$3,b as b$1}from'./chunk-AQVZWCVV.js';a();var l=class extends a$1{constructor(){super(...arguments);this.titleKey="radar";this.rows=6;}static{this.styles=[...a$1.styles,a$2`
      :host { min-width: 280px; }
      .read { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
      .read b { font-size: 1.25rem; text-transform: capitalize; }
      .drv { display: grid; grid-template-columns: minmax(90px, 1fr) 2fr 42px; gap: 6px; align-items: center; font-size: 0.76rem; }
      .track { position: relative; height: 8px; border-radius: 99px; background: var(--_surface); }
      .track::after { content: ''; position: absolute; inset-block: -2px; inset-inline-start: 50%; width: 1px; background: var(--_border); }
      .track span { position: absolute; inset-block: 0; border-radius: 99px; }
      .drv .num { text-align: end; }
      ul { margin: 0; padding-inline-start: 16px; font-size: 0.72rem; color: var(--_muted); }
      h3 { margin: 4px 0 0; font-size: 0.7rem; color: var(--_faint); font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
    `];}resourceFor(a,e$1){return e.radar(a,e$1)}body(a){let e=/attract|accum|buy|bull/i.test(a.d)?"up":/risk|avoid|reduce|sell|bear/i.test(a.d)?"down":"flat",b$2=Math.max(.5,...a.drv.map(t=>Math.abs(t.sc??0)));return b`<div class="read"><b class=${e}>${a.d}</b>${a.hz?b`<span class="sub">${a.hz}</span>`:""}
        ${a.cf!==null?b`<span class="sub">${this.s("confidence")} <span class="num">${a$3(a.cf*100,0)}%</span></span>`:""}</div>
      ${a.lo!==null&&a.hi!==null?b`<span class="sub">${this.s("expectedRange")} <span class="num">${b$1(a.lo)} – ${b$1(a.hi)}</span></span>`:""}
      <h3>${this.s("drivers")}</h3>
      ${a.drv.map(t=>{let r=t.sc??0,p=Math.abs(r)/b$2*50,c=t.sc===null?"\u2013":`${r>0?"+":r<0?"\u2212":""}${a$3(Math.abs(r),2)}`;return b`<div class="drv"><span dir="auto">${t.l}</span>
          <span class="track" role="img" aria-label=${`${t.l}: ${c}`}><span style="inset-inline-start:${r>=0?50:50-p}%;width:${p}%;background:${t.dir==="up"?"var(--_up)":t.dir==="down"?"var(--_down)":"var(--_flat)"}"></span></span>
          <span class="num sub">${c}</span></div>`})}
      ${a.warn.length?b`<h3>${this.s("whatsMissing")}</h3><ul>${a.warn.map(t=>b`<li dir="auto">${t}</li>`)}</ul>`:""}`}foot(a){return a.as}};g("cap-radar",l);export{l as CapRadar};