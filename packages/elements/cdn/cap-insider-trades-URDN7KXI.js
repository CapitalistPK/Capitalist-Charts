import {a as a$1}from'./chunk-WRNJIDHA.js';import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-7HT5APWI.js';import {a as a$2}from'./chunk-YYNZLXDD.js';import {a as a$3,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {e as e$1,a as a$4}from'./chunk-AQVZWCVV.js';a();var o=class extends a$1{constructor(){super(...arguments);this.titleKey="insiders";}static{this.styles=[...a$1.styles,a$2,a$3`
      :host { min-width: 300px; }
      .stats { display: flex; gap: 14px; font-size: 0.75rem; color: var(--_muted); flex-wrap: wrap; }
      .stats b { font-weight: 600; }
      .who { max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
    `];}resourceFor(t,i){return e.insiders(t,i)}body(t){let i=s=>s===null?"\u2013":b`<b class="num ${s>0?"up":s<0?"down":"flat"}">${s>0?"+":s<0?"\u2212":""}${e$1(Math.abs(s))} ${this.s("shares")}</b>`;return t.rows.length?b`<div class="stats"><span>${this.s("net90")} ${i(t.net90)}</span><span>${this.s("net365")} ${i(t.net365)}</span></div>
      <table class="t"><tbody>${t.rows.slice(0,8).map(s=>b`<tr>
        <td class="num">${s.d}</td>
        <td><div class="who" title=${s.who}>${s.who}</div>${s.role?b`<div class="sub">${s.role}</div>`:""}</td>
        <td class="r"><span class=${s.side==="buy"?"up":s.side==="sell"?"down":"flat"}>${s.side==="buy"?this.s("bought"):s.side==="sell"?this.s("sold"):""}</span>
          <div class="sub num">${s.q===null?"":e$1(s.q)}${s.px===null?"":` @ ${a$4(s.px,2)}`}</div></td></tr>`)}</tbody></table>`:b`<p class="sub">${this.s("noInsiders")}</p>`}};g("cap-insider-trades",o);export{o as CapInsiderTrades};