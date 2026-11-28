import {e}from'./chunk-ICQF3XDI.js';import {a as a$1}from'./chunk-FACV67IN.js';import {a as a$2}from'./chunk-VAEDFHRU.js';import {k,a as a$3,j,b,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import'./chunk-AQVZWCVV.js';a$1();var a=class extends k{constructor(){super(...arguments);this.currencies="";this.impact="low";}static{this.properties={currencies:{type:String},impact:{type:String}};}static{this.styles=[...k.styles,a$2,a$3`
      :host { min-width: 300px; }
      .imp { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--_flat); }
      .imp.high { background: var(--_down); } .imp.medium { background: var(--_warn); }
      .wrap { overflow-x: auto; }
    `];}subscriptions(){return [j(e.econ())]}render(){if(this.blockedReason)return this.blockedNotice();let e$1=this.val(e.econ());if(!e$1?.data)return e$1?.failed||e$1?.notFound?this.message(this.s("econ"),this.s("unavailable")):this.skeleton(8,this.s("econ"));let o=new Set(this.currencies.split(",").map(t=>t.trim().toUpperCase()).filter(Boolean)),n=t=>t==="high"?3:t==="medium"?2:1,f=n(this.impact),c=e$1.data.rows.filter(t=>(!o.size||o.has(t.c))&&n(t.i)>=f);if(!c.length)return this.message(this.s("econ"),this.s("noEcon"));let g=(t,l)=>l!==null?new Date(l*1e3).toLocaleString(this.locale==="ur"?"ur-PK":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Karachi"}):new Date(`${t}T00:00:00Z`).toLocaleDateString(this.locale==="ur"?"ur-PK":"en-GB",{day:"numeric",month:"short",timeZone:"UTC"});return this.frame(this.s("econ"),b`<div class="wrap"><table class="t">
        <thead><tr><th></th><th></th><th>${this.s("econ")}</th><th class="r">${this.s("forecast")}</th><th class="r">${this.s("previous")}</th><th class="r">${this.s("actual")}</th></tr></thead>
        <tbody>${c.map(t=>b`<tr>
          <td class="num sub">${g(t.d,t.at)}</td>
          <td><span class="imp ${t.i??""}" title=${`${this.s("impact")}: ${t.i??""}`}></span> ${t.c}</td>
          <td style="white-space:normal" dir="auto">${t.t}</td>
          <td class="r num">${t.f??""}</td><td class="r num">${t.prev??""}</td><td class="r num">${t.a??""}</td></tr>`)}</tbody>
      </table></div>`)}};g("cap-economic-calendar",a);export{a as CapEconomicCalendar};