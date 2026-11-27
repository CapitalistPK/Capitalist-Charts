import {a}from'./chunk-YYNZLXDD.js';import {k,a as a$1,i,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {w,l,b as b$1,c,h}from'./chunk-AQVZWCVV.js';var M=8,u=class extends k{constructor(){super(...arguments);this.indices="PSX:KSE100,PSX:KSE30,PSX:KMI30,PSX:ALLSHR";}static{this.properties={indices:{type:String}};}static{this.styles=[...k.styles,a,a$1`
      :host { min-width: 280px; }
      .breadth { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: var(--_surface); }
      .breadth span { display: block; height: 100%; }
      .legend { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--_muted); gap: 8px; flex-wrap: wrap; }
    `];}refs(){return this.indices.split(",").map(s=>w(s)).filter(s=>s!==null).slice(0,M)}subscriptions(){return this.refs().map(s=>i(s.market,s.symbol))}render(){if(this.blockedReason)return this.blockedNotice();let s=this.refs(),r=s.map(t=>({r:t,u:this.val(i(t.market,t.symbol))}));if(!r.some(t=>t.u?.data))return this.skeleton(s.length+1,this.s("marketSummary"));let n=r.find(t=>t.u?.status)?.u?.status??null,i$1=r.find(t=>t.u?.data),x=Math.floor(Date.now()/1e3),f=l(i$1.u.data,n,x),o=n?.advancers,l$1=n?.decliners,d=n?.unchanged,c$1=(o??0)+(l$1??0)+(d??0),p=(t=0)=>`${c$1?t/c$1*100:0}%`;return this.frame(b`${this.s("marketSummary")} <span class="sub">· ${i$1.r.market}</span>`,b`<table class="t">
          <thead><tr><th>${this.s("symbol")}</th><th class="r">${this.s("price")}</th><th class="r">${this.s("change")}</th></tr></thead>
          <tbody>${r.map(({r:t,u:P})=>{let a=P?.data;return b`<tr>
              <td>${this.link(this.quotePath(t.market,t.symbol),a?.n??t.symbol,t.symbol)}</td>
              <td class="r num">${a?b$1(a.p):"\u2013"}</td>
              <td class="r">${a?b`<span class="num ${(a.c??0)>0?"up":(a.c??0)<0?"down":"flat"}">${c(a.c)}</span> ${this.change(a.cp)}`:""}</td>
            </tr>`})}</tbody>
        </table>
        ${c$1?b`<div role="img" aria-label=${`${this.s("breadth")}: ${o} ${this.s("advancers")}, ${l$1} ${this.s("decliners")}, ${d} ${this.s("unchanged")}`}>
              <div class="breadth"><span style="width:${p(o)};background:var(--_up)"></span><span style="width:${p(d)};background:var(--_flat)"></span><span style="width:${p(l$1)};background:var(--_down)"></span></div>
              <div class="legend" style="margin-top:6px">
                <span class="up">▲ ${o} ${this.s("advancers")}</span><span>${d} ${this.s("unchanged")}</span><span class="down">▼ ${l$1} ${this.s("decliners")}</span>
              </div>
            </div>`:""}`,{pill:this.statusPill(f,f==="live"&&i$1.u?.data?`${this.s("live")} \xB7 ${h(i$1.u.data.t)}`:void 0)})}};g("cap-market-summary",u);export{u as CapMarketSummary};