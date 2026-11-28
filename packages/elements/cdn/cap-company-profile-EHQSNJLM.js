import {a as a$1}from'./chunk-PEV3TAL3.js';import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-FACV67IN.js';import {a as a$2}from'./chunk-VAEDFHRU.js';import {a as a$3,b,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {e as e$1,a as a$4}from'./chunk-AQVZWCVV.js';a();var l=class extends a$1{constructor(){super(...arguments);this.titleKey="profile";}static{this.styles=[...a$1.styles,a$2,a$3`
      :host { min-width: 280px; }
      .desc { font-size: 0.82rem; line-height: 1.5; color: var(--_muted); margin: 0; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
      dl { display: grid; grid-template-columns: auto 1fr; gap: 5px 12px; margin: 0; font-size: 0.8rem; }
      dt { color: var(--_faint); } dd { margin: 0; text-align: end; }
    `];}resourceFor(e$1,r){return e.profile(e$1,r)}head(e,r){return b`${this.link(this.quotePath(r,e),e,e)} <span class="sub">· ${this.s("profile")}</span>`}body(e){let r=(h,o)=>o?b`<dt>${this.s(h)}</dt><dd class="num">${o}</dd>`:"";return b`<div class="title" style="white-space:normal">${e.n}</div>
      ${e.desc?b`<p class="desc" dir="auto">${e.desc}</p>`:""}
      <dl>
        ${r("sector",e.sec)}${e.ind&&e.ind!==e.sec?r("industry",e.ind):""}
        ${r("mcap",e.mc===null?null:`PKR ${e$1(e.mc)}`)}
        ${r("listedShares",e.sh===null?null:e$1(e.sh))}
        ${r("freeFloat",e.ffp===null?e.ff===null?null:e$1(e.ff):`${a$4(e.ffp,1)}%`)}
        ${r("faceValue",e.fv===null?null:`Rs ${a$4(e.fv,2)}`)}
        ${r("fiscalYear",e.fye)}
        ${e.shariah?b`<dt>${this.s("shariah")}</dt><dd><span class=${e.shariah.ok?"up":"flat"}>${this.s(e.shariah.ok?"shariahOk":"shariahNo")}${e.shariah.ok?" \u2713":""}</span></dd>`:""}
      </dl>`}};g("cap-company-profile",l);export{l as CapCompanyProfile};