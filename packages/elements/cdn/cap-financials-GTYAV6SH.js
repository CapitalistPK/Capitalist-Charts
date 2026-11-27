import {a as a$1}from'./chunk-WRNJIDHA.js';import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-7HT5APWI.js';import {a as a$2}from'./chunk-YYNZLXDD.js';import {a as a$3,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {e as e$1,a as a$4}from'./chunk-AQVZWCVV.js';a();var l=class extends a$1{constructor(){super(...arguments);this.period="annual";this.titleKey="financials";this.rows=6;}static{this.properties={...a$1.properties,period:{type:String,reflect:true}};}static{this.styles=[...a$1.styles,a$2,a$3`
      :host { min-width: 300px; }
      .bars { direction: ltr; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 6px; align-items: end; height: 120px; }
      .col { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; height: 100%; justify-content: flex-end; }
      .pair { display: flex; gap: 2px; align-items: flex-end; width: 100%; justify-content: center; flex: 1; }
      .pair span { width: 42%; max-width: 16px; border-radius: 3px 3px 0 0; min-height: 1px; }
      .rv { background: color-mix(in srgb, var(--_accent) 55%, transparent); } .pr { background: var(--_up); } .pr.neg { background: var(--_down); }
      .lbl { font-size: 0.62rem; color: var(--_faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
      .key { display: flex; gap: 12px; font-size: 0.7rem; color: var(--_muted); }
      .key i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-inline-end: 4px; vertical-align: -1px; }
    `];}resourceFor(e$1,s){return e.financials(e$1,s,this.period==="quarterly"?"quarterly":"annual")}body(e){let s=[...e.rows].reverse(),u=Math.max(1,...s.map(t=>Math.max(t.rv??0,Math.abs(t.pr??0)))),n=t=>`${Math.abs(t??0)/u*100}%`;return b`${this.tabs([{key:"annual",label:this.s("annual")},{key:"quarterly",label:this.s("quarterly")}],e.per,t=>{this.period=t,this.emit("cap:select",{period:t});},this.s("period"))}
      <div class="key"><span><i class="rv"></i>${this.s("revenue")}</span><span><i class="pr" style="background:var(--_up)"></i>${this.s("profit")}</span></div>
      <div class="bars" role="img" aria-label=${`${this.s("revenue")} / ${this.s("profit")}`}>
        ${s.map(t=>b`<div class="col" title=${`${t.p}: ${this.s("revenue")} ${e$1(t.rv)}, ${this.s("profit")} ${e$1(t.pr)}`}>
          <div class="pair"><span class="rv" style="height:${n(t.rv)}"></span><span class="pr ${(t.pr??0)<0?"neg":""}" style="height:${n(t.pr)}"></span></div>
          <span class="lbl">${t.p}</span></div>`)}
      </div>
      <table class="t">
        <thead><tr><th>${this.s("period")}</th><th class="r">${this.s("revenue")}</th><th class="r">${this.s("profit")}</th><th class="r">${this.s("eps")}</th></tr></thead>
        <tbody>${e.rows.slice(0,4).map(t=>b`<tr><td>${t.p}</td><td class="r num">${t.rv===null?"\u2013":e$1(t.rv)}</td>
          <td class="r num ${(t.pr??0)<0?"down":""}">${t.pr===null?"\u2013":e$1(t.pr)}</td><td class="r num">${t.eps===null?"\u2013":a$4(t.eps,2)}</td></tr>`)}</tbody>
      </table>`}foot(e){return `${e.cur} \xB7 ${e.basis} \xB7 ${this.s("fiscalNote")}`}};g("cap-financials",l);export{l as CapFinancials};