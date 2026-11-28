import {k,a,f,b,d,g as g$1}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {w,l,h,g,b as b$1,c,e}from'./chunk-AQVZWCVV.js';var v=class extends k{constructor(){super(...arguments);this.symbol="PSX:KSE100";this.data=null;this.unsubscribe=null;this.ready=false;this.flash=null;}static{this.properties={symbol:{type:String}};}static{this.styles=[...k.styles,a`
      :host { min-width: 220px; }
      .px { font-size: 1.7rem; font-weight: 600; line-height: 1.1; letter-spacing: -0.01em; border-radius: 4px; }
      .row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
      .kv { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 0.74rem; color: var(--_muted); }
      .kv b { color: var(--_text); font-weight: 500; }
    `];}connectedCallback(){super.connectedCallback(),this.blockedReason||this.listen();}disconnectedCallback(){super.disconnectedCallback(),this.stopData();}startData(){this.listen();}stopData(){this.unsubscribe?.(),this.unsubscribe=null;}willUpdate(s){super.willUpdate(s),s.has("symbol")&&s.get("symbol")!==void 0&&!this.blockedReason&&this.listen();}listen(){this.unsubscribe?.(),this.data=null,this.ready=false;let s=w(this.symbol);if(!s){this.data={market:"PSX",symbol:this.symbol,quote:null,status:null,notFound:true,failed:false},this.requestUpdate();return}this.unsubscribe=f().poller.subscribe(s.market,s.symbol,i=>this.onData(i));}onData(s){let i=this.data?.quote?.p;this.flash=i!==void 0&&s.quote&&s.quote.p!==i?s.quote.p>i?"up":"down":null,this.data=s;let e={symbol:`${s.market}:${s.symbol}`,quote:s.quote,notFound:s.notFound};s.notFound||s.failed&&!s.quote?this.dispatchEvent(new CustomEvent("cap:error",{detail:e,bubbles:true,composed:true})):this.ready?this.dispatchEvent(new CustomEvent("cap:update",{detail:e,bubbles:true,composed:true})):(this.ready=true,this.dispatchEvent(new CustomEvent("cap:ready",{detail:e,bubbles:true,composed:true}))),this.requestUpdate();}render(){if(this.blockedReason)return this.blockedNotice();let s=this.data,i=Math.floor(Date.now()/1e3),e$1=l(s?.quote,s?.status,i,{notFound:s?.notFound??false,failed:s?.failed??false}),l$1=w(this.symbol)?.symbol??this.symbol;if(e$1==="loading")return b`<div class="card" aria-busy="true">
        <div class="hd"><span class="logo skel"></span><div style="flex:1"><div class="skel" style="height:12px;width:60%"></div></div></div>
        <div class="bd"><div class="skel" style="height:30px;width:55%"></div><div class="skel" style="height:12px;width:40%"></div></div>
        <div class="ft"><span class="skel" style="height:9px;width:90px"></span></div>
        <slot hidden></slot>
      </div>`;if(e$1==="unknown-symbol")return b`<div class="card"><div class="hd">${this.icon("search")}<div class="title">${l$1}</div></div>
        <div class="bd"><span>${this.s("notFound")}</span>
        <a class="attr" style="color:var(--_accent)" href=${this.siteHref(`/search?q=${encodeURIComponent(l$1)}`)} target="_blank" rel="noopener" @click=${o=>this.onLink(o,l$1)}>${this.s("search")} ${this.icon("chevron")}</a></div>
        <div class="ft">${this.attribution()}</div></div>`;if(e$1==="unavailable"||!s?.quote)return b`<div class="card"><div class="hd">${this.monogram(l$1)}<div class="title">${l$1}</div>${this.statusPill("unavailable")}</div>
        <div class="bd"><span class="sub">${this.s("unavailable")}</span></div>
        <div class="ft">${this.attribution()}</div></div>`;let t=s.quote,k=e$1==="live"?`${this.s("live")} \xB7 ${h(t.t)}`:e$1==="closed"?`${this.s("closed")}`:e$1==="stale"?`${this.s("updated")} ${g(t.t,i)}`:void 0,g$1=this.quotePath(t.m,t.s);return b`<div class="card" part="card">
      <div class="hd" part="header">
        ${this.monogram(t.s)}
        <div style="min-width:0">
          <div class="title"><a href=${this.siteHref(g$1)} target="_blank" rel="noopener" style="color:inherit;text-decoration:none" @click=${o=>this.onLink(o,t.s)}>${t.s}</a> <span class="sub">· ${t.m}</span></div>
          <div class="sub">${t.n}</div>
        </div>
        ${this.statusPill(e$1,k)}
      </div>
      <div class="bd" part="body">
        <div class="row"><span class="px ${this.flash?`flash-${this.flash}`:""}" aria-live="off">${b$1(t.p,2)}</span>${t.k==="index"?d:b`<span class="sub">PKR</span>`}</div>
        <div class="row" style="font-size:.86rem"><span class="num ${t.c===null?"flat":t.c>0?"up":t.c<0?"down":"flat"}">${c(t.c)}</span>${this.change(t.cp)}</div>
        <div class="kv"><span>${this.s("vol")} <b class="num">${e(t.vol)}</b></span></div>
        <span class="sr">${t.n} ${b$1(t.p)} ${c(t.c)} (${t.cp??""}%)</span>
      </div>
      <div class="ft" part="footer">${this.attribution()}<span class="num">${e$1==="live"?g(t.t,i):""}</span></div>
    </div>`}};g$1("cap-quote",v);export{v as CapQuote};