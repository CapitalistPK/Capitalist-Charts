import {k,a,f,b as b$1,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {w,M,b}from'./chunk-AQVZWCVV.js';var h=40,l=class extends k{constructor(){super(...arguments);this.symbols="PSX:KSE100,PSX:KSE30,PSX:KMI30";this.index="";this.list=null;this.speed=40;this.paused=false;this.data=new Map;this.unsubs=[];}static{this.properties={symbols:{type:String},index:{type:String},speed:{type:Number},paused:{state:true}};}static{this.styles=[...k.styles,a`
      .tape { flex-direction: row; align-items: center; height: 46px; }
      button.pause { flex: none; border: 0; background: transparent; color: var(--_muted); width: 40px; height: 100%; cursor: pointer; border-inline-end: 1px solid var(--_border); display: grid; place-items: center; }
      .viewport { flex: 1 1 0; width: 0; overflow: hidden; min-width: 0; mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent); }
      .track { display: inline-flex; white-space: nowrap; animation: scroll var(--_dur, 40s) linear infinite; }
      .tape:hover .track, .tape:focus-within .track, .paused .track { animation-play-state: paused; }
      .item { display: inline-flex; gap: 6px; align-items: center; padding: 0 14px; font-size: 0.82rem; border-inline-end: 1px solid var(--_border); color: inherit; text-decoration: none; }
      .item b { font-weight: 600; }
      .attr-wrap { flex: none; padding: 0 12px; font-size: 0.68rem; border-inline-start: 1px solid var(--_border); height: 100%; display: flex; align-items: center; }
      @media (max-width: 480px) { .attr-wrap { padding: 0 8px; font-size: 0; } .attr-wrap .ico { font-size: 0.8rem; } }
      @keyframes scroll { to { transform: translateX(-50%); } }
      :host(:dir(rtl)) .track { animation-name: scroll-rtl; }
      @keyframes scroll-rtl { to { transform: translateX(50%); } }
      @media (prefers-reduced-motion: reduce) { .track { animation: none; } .viewport { overflow-x: auto; mask-image: none; } button.pause { display: none; } }
    `];}connectedCallback(){super.connectedCallback(),this.blockedReason||this.listen();}disconnectedCallback(){super.disconnectedCallback(),this.stopData();}startData(){this.listen();}stopData(){this.unsubs.forEach(e=>e()),this.unsubs=[];}willUpdate(e){super.willUpdate(e),(e.has("symbols")&&e.get("symbols")!==void 0||e.has("index")&&e.get("index")!==void 0)&&!this.blockedReason&&this.listen();}refs(){let e=new Set;return this.symbols.split(",").map(t=>w(t)).filter(t=>t!==null&&!e.has(`${t.market}:${t.symbol}`)&&!!e.add(`${t.market}:${t.symbol}`)).slice(0,h)}indexRef(){return this.index.trim()?w(this.index):null}listen(){this.unsubs.forEach(i=>i()),this.data.clear(),this.list=null;let e=f().poller,t=true,s=this.indexRef();if(s){this.unsubs=[e.subscribeResource(M.list(s.market,s.symbol),i=>{this.list=i,t&&i.data&&(t=false,this.dispatchEvent(new CustomEvent("cap:ready",{bubbles:true,composed:true}))),this.requestUpdate();})];return}this.unsubs=this.refs().map(i=>e.subscribe(i.market,i.symbol,r=>{this.data.set(`${r.market}:${r.symbol}`,r),t&&(t=false,this.dispatchEvent(new CustomEvent("cap:ready",{bubbles:true,composed:true}))),this.requestUpdate();}));}item(e,t){return b$1`<a class="item" href=${this.siteHref(this.quotePath(t,e.s))} target="_blank" rel="noopener" @click=${s=>this.onLink(s,e.s)}
      ><b>${e.s}</b><span class="num">${b(e.p)}</span>${this.change(e.cp)}</a
    >`}items(){let e=this.indexRef();if(e){let t=this.list?.data?.items;return t?t.map(s=>this.item(s,e.market)):[b$1`<span class="item"><b>${e.symbol}</b><span class="skel" style="width:48px;height:10px"></span></span>`]}return this.refs().map(t=>{let s=this.data.get(`${t.market}:${t.symbol}`)?.quote;return s?b$1`<a class="item" href=${this.siteHref(this.quotePath(s.m,s.s))} target="_blank" rel="noopener" @click=${i=>this.onLink(i,s.s)}
        ><b>${s.k==="index"?s.n:s.s}</b><span class="num">${b(s.p)}</span>${this.change(s.cp)}</a
      >`:b$1`<span class="item"><b>${t.symbol}</b><span class="skel" style="width:48px;height:10px"></span></span>`})}render(){if(this.blockedReason)return this.blockedNotice();let e=this.items();return b$1`<div class="card tape ${this.paused?"paused":""}" role="region" aria-label="Ticker tape" part="card" style="--_dur:${Math.max(10,this.speed)}s">
      <button class="pause" type="button" aria-pressed=${String(this.paused)} aria-label=${this.s(this.paused?"play":"pause")} @click=${()=>this.paused=!this.paused}>
        ${this.icon(this.paused?"play":"pause")}
      </button>
      <div class="viewport"><div class="track">${e}<span aria-hidden="true" inert style="display:inline-flex">${e}</span></div></div>
      <div class="attr-wrap">${this.attribution()}</div>
    </div>`}};g("cap-ticker-tape",l);export{l as CapTickerTape};