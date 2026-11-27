import {a as a$1}from'./chunk-WRNJIDHA.js';import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-7HT5APWI.js';import {a as a$2}from'./chunk-YYNZLXDD.js';import {a as a$3,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {a as a$4}from'./chunk-AQVZWCVV.js';a();var d=class extends a$1{constructor(){super(...arguments);this.titleKey="dividends";}static{this.styles=[...a$1.styles,a$2,a$3`
      :host { min-width: 280px; }
      .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .stat { background: var(--_surface); border-radius: 8px; padding: 6px 9px; font-size: 0.7rem; color: var(--_muted); }
      .stat b { display: block; font-size: 1rem; color: var(--_text); font-weight: 600; }
    `];}resourceFor(s,i){return e.dividends(s,i)}body(s){let i=t=>new Date(`${t}T00:00:00Z`).toLocaleDateString(this.locale==="ur"?"ur-PK":"en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});return b`<div class="stats">
        <div class="stat">${this.s("yield")}<b class="num">${s.y===null?"\u2013":`${a$4(s.y,1)}%`}</b></div>
        <div class="stat">${this.s("nextEntitlement")}<b class="num" style="font-size:.82rem">${s.next?b`<bdi>${i(s.next.d)}</bdi> · <bdi>${s.next.x}</bdi>`:"\u2013"}</b></div>
      </div>
      <table class="t">
        <thead><tr><th>${this.s("payout")}</th><th class="r">%</th><th class="r">${this.s("perShare")}</th><th class="r">${this.s("period")}</th></tr></thead>
        <tbody>${s.rows.slice(0,8).map(t=>b`<tr>
          <td class="num">${i(t.d)}</td>
          <td class="r num">${t.dp!==null?`${a$4(t.dp,0)}%`:t.bonus!==null?`${a$4(t.bonus,0)}% B`:t.right!==null?`${a$4(t.right,0)}% R`:"\u2013"}</td>
          <td class="r num">${t.dps===null?"\u2013":`Rs ${a$4(t.dps,2)}`}</td><td class="r">${t.p??""}</td></tr>`)}</tbody>
      </table>`}};g("cap-dividends",d);export{d as CapDividends};