import {a}from'./chunk-7HT5APWI.js';import {a as a$1}from'./chunk-YYNZLXDD.js';import {k as k$1,a as a$2,j,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {v,M,e}from'./chunk-AQVZWCVV.js';a();function k(l){return l.sectors.map(r=>{let e=0,o=0,t=0,h=0;for(let s of r.items)if(e+=s.mc,s.cp!==null){let a=s.mc/(1+s.cp/100);o+=a*s.cp,s.cp>0?t+=1:s.cp<0&&(h+=1);}let d=r.items.reduce((s,a)=>s+(a.cp===null?0:a.mc/(1+a.cp/100)),0);return {n:r.n,cp:d>0?o/d:null,mc:e,up:t,down:h,count:r.items.length}}).sort((r,e)=>(e.cp??-1/0)-(r.cp??-1/0))}var m=class extends k$1{constructor(){super(...arguments);this.market="PSX";this.rows=12;}static{this.properties={market:{type:String},rows:{type:Number}};}static{this.styles=[...k$1.styles,a$1,a$2`
      :host { min-width: 300px; }
      .b { display: flex; height: 6px; width: 64px; border-radius: 99px; overflow: hidden; background: var(--_surface); margin-inline-start: auto; }
      .b span { height: 100%; }
    `];}subscriptions(){return v.test(this.market)?[j(M.map(this.market))]:[]}render(){if(this.blockedReason)return this.blockedNotice();if(!v.test(this.market))return this.message(this.market,this.s("unavailable"));let e$1=this.val(M.map(this.market));if(!e$1?.data)return e$1?.failed||e$1?.notFound?this.message(this.s("sectorPerf"),this.s("unavailable")):this.skeleton(8,this.s("sectorPerf"));let o=k(e$1.data).slice(0,Math.max(1,Math.min(40,this.rows||12)));return this.frame(b`${this.s("sectorPerf")} <span class="sub">· ${this.market}</span>`,b`<table class="t">
        <thead><tr><th>${this.s("sector")}</th><th class="r">${this.s("change")}</th><th class="r">${this.s("mcap")}</th><th class="r">${this.s("breadth")}</th></tr></thead>
        <tbody>${o.map(t=>b`<tr>
          <td style="white-space:normal">${t.n}</td>
          <td class="r">${this.change(t.cp)}</td>
          <td class="r num">${e(t.mc)}</td>
          <td class="r"><span class="b" role="img" aria-label=${`${t.up} ${this.s("advancers")}, ${t.down} ${this.s("decliners")}`}>
            <span style="width:${t.up/Math.max(1,t.count)*100}%;background:var(--_up)"></span><span style="flex:1"></span><span style="width:${t.down/Math.max(1,t.count)*100}%;background:var(--_down)"></span></span></td>
        </tr>`)}</tbody></table>`)}};g("cap-sector-performance",m);export{m as CapSectorPerformance,k as sectorRows};