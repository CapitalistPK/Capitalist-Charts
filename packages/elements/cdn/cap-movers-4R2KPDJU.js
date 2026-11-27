import {a}from'./chunk-YYNZLXDD.js';import {k,a as a$1,j,b as b$1,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {v,M,b,e}from'./chunk-AQVZWCVV.js';var u=["gainers","losers","active"],o=class extends k{constructor(){super(...arguments);this.market="PSX";this.tab="gainers";this.rows=10;}static{this.properties={market:{type:String},tab:{type:String,reflect:true},rows:{type:Number}};}static{this.styles=[...k.styles,a,a$1`
      :host { min-width: 260px; }
      ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
      li { height: 38px; box-sizing: border-box; border-bottom: 1px solid var(--_border); overflow: hidden; }
      li:last-child { border-bottom: 0; }
      li a { height: 100%; padding: 4px 0; }
      .sym { font-weight: 600; font-size: 0.85rem; }
      .grow .sub { display: block; }
      .end { text-align: end; display: flex; flex-direction: column; align-items: flex-end; font-size: 0.82rem; }
    `];}res(){return v.test(this.market)?M.movers(this.market):null}subscriptions(){let s=this.res();return s?[j(s)]:[]}row(s,e$1){return b$1`<li title=${s.n}>${this.link(this.quotePath(this.market,s.s),b$1`${this.monogram(s.s)}<span class="grow"><span class="sym">${s.s}</span><br /><span class="sub">${s.n}</span></span>
        <span class="end"><span class="num">${b(s.p)}</span>${e$1==="active"?b$1`<span class="sub num">${e(s.vol)}</span>`:this.change(s.cp)}</span>`,s.s,"rowlink")}</li>`}render(){if(this.blockedReason)return this.blockedNotice();let s=this.res();if(!s)return this.message(this.market,this.s("unavailable"));let e=this.val(s);if(!e?.data)return e?.notFound||e?.failed?this.message(this.s("movers"),this.s("unavailable")):this.skeleton(8,this.s("movers"));let a=u.includes(this.tab)?this.tab:"gainers",f=e.data[a].slice(0,Math.max(1,Math.min(10,this.rows||10)));return this.frame(b$1`${this.s("movers")} <span class="sub">· ${this.market}</span>`,b$1`${this.tabs(u.map(t=>({key:t,label:this.s(t==="active"?"active":t)})),a,t=>{this.tab=t,this.emit("cap:select",{tab:t});},this.s("movers"))}
        <ol>${f.map(t=>this.row(t,a))}</ol>`)}};g("cap-movers",o);export{o as CapMovers};