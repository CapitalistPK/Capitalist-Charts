import {a}from'./chunk-VAEDFHRU.js';import {k,a as a$1,j,b,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {M,F,a as a$2}from'./chunk-AQVZWCVV.js';var y=8;function v(s){let l=s>=100?2:s>=1?3:s>=.01?4:6;return a$2(s,l)}var p=class extends k{constructor(){super(...arguments);this.currencies="PKR,USD,EUR,GBP,SAR,AED,CNY";}static{this.properties={currencies:{type:String}};}static{this.styles=[...k.styles,a,a$1`
      :host { min-width: 300px; }
      .wrap { overflow-x: auto; }
      th[scope='row'] { font-weight: 600; color: var(--_text); font-size: 0.78rem; }
      td.diag { color: var(--_faint); text-align: center; }
    `];}subscriptions(){return [j(M.fx("PKR"))]}render(){if(this.blockedReason)return this.blockedNotice();let r=this.val(M.fx("PKR"));if(!r?.data)return r?.notFound||r?.failed?this.message(this.s("fx"),this.s("unavailable")):this.skeleton(6,this.s("fx"));let a=r.data,i=new Map([[a.base,1],...a.rates.map(t=>[t.c,t.r])]),o=[...new Set(this.currencies.split(",").map(t=>t.trim().toUpperCase()))].filter(t=>F.test(t)&&i.has(t)).slice(0,y),g=new Date(a.t*1e3).toLocaleString(this.locale==="ur"?"ur-PK":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Karachi"});return this.frame(this.s("fx"),b`<div class="wrap" tabindex="0" role="region" aria-label=${this.s("fx")}><table class="t">
          <caption class="sr">${this.s("fxNote")}</caption>
          <thead><tr><th></th>${o.map(t=>b`<th class="r" scope="col">${t}</th>`)}</tr></thead>
          <tbody>${o.map(t=>b`<tr><th scope="row">${t}</th>${o.map(m=>t===m?b`<td class="diag">—</td>`:b`<td class="r num">${v(i.get(m)/i.get(t))}</td>`)}</tr>`)}</tbody>
        </table></div>
        <p class="sub" style="white-space:normal;font-size:.68rem">${this.s("fxNote")}</p>`,{foot:`${this.s("updated")} ${g}`})}};g("cap-fx-cross-rates",p);export{p as CapFxCrossRates};