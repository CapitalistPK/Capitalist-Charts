import {a as a$3,b,c as c$1,e as e$1,d as d$1}from'./chunk-CCD4FFGO.js';import {a}from'./chunk-HKMTIH7J.js';import'./chunk-QF2AVXSF.js';import {a as a$1}from'./chunk-VAEDFHRU.js';import {k,a as a$2,j,i,b as b$2,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {w,A,M,l,b as b$1,e,d,c}from'./chunk-AQVZWCVV.js';var O=4,X=["#d97706","#7c3aed","#0891b2"],Y=0,$=class extends k{constructor(){super(...arguments);this.symbols="PSX:KSE100";this.range="1Y";this.chartType="candles";this.volume="true";this.hover=null;this.size=new a(()=>this.requestUpdate());this.gid=`cso${++Y}`;}static{this.properties={symbols:{type:String},range:{type:String,reflect:true},chartType:{type:String,attribute:"chart-type",reflect:true},volume:{type:String},hover:{state:true}};}static{this.styles=[...k.styles,a$1,a$2`
      :host { min-width: 300px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; }
      .top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
      .px { font-size: 1.5rem; font-weight: 600; }
      .legend { display: flex; gap: 10px; flex-wrap: wrap; font-size: 0.72rem; color: var(--_muted); min-height: 1.2em; }
      .legend b { color: var(--_text); font-weight: 500; }
      .key { display: inline-flex; align-items: center; gap: 4px; }
      .sw { width: 10px; height: 3px; border-radius: 2px; display: inline-block; }
      .plot { flex: 1; min-height: 120px; position: relative; touch-action: pan-y; }
      .bar { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
      select { font: inherit; font-size: 0.72rem; color: var(--_text); background: var(--_surface); border: 0; border-radius: 6px; padding: 4px 6px; min-height: 26px; }
    `];}refs(){let t=new Set;return this.symbols.split(",").map(s=>w(s)).filter(s=>!!s&&!t.has(`${s.market}:${s.symbol}`)&&!!t.add(`${s.market}:${s.symbol}`)).slice(0,O)}safeRange(){return A.includes(this.range)?this.range:"1Y"}subscriptions(){let t=this.refs(),s=this.safeRange(),i$1=t.map(n=>j(M.series(n.market,n.symbol,s)));return t[0]&&i$1.push(i(t[0].market,t[0].symbol)),i$1}updated(){this.size.observe(this.renderRoot.querySelector(".plot"));}disconnectedCallback(){super.disconnectedCallback(),this.size.disconnect();}render(){if(this.blockedReason)return this.blockedNotice();let t=this.refs(),s=t[0];if(!s)return this.message(this.symbols,this.s("notFound"));let i$1=this.safeRange(),n=this.val(i(s.market,s.symbol)),b$3=this.val(M.series(s.market,s.symbol,i$1));if(n?.notFound||b$3?.notFound)return this.message(s.symbol,this.s("notFound"));if(!b$3?.data&&!n?.data)return this.skeleton(6,s.symbol);let o=b$3?.data??null,r=n?.data??null,c$2=t.slice(1).map((e,m)=>({ref:e,data:this.val(M.series(e.market,e.symbol,i$1))?.data??null,color:X[m]})).filter(e=>e.data?.b.length).map(e=>({label:e.ref.symbol,bars:e.data.b,color:e.color})),u=a$3.includes(this.chartType)?this.chartType:"candles",h=o?.b??[],l$1=this.hover!==null?h[this.hover]:void 0,A$1=l(r,n?.status,Math.floor(Date.now()/1e3),{failed:n?.failed??false}),F=e=>{let m=e.currentTarget.getBoundingClientRect();h.length&&(this.hover=d$1(e.clientX-m.left,m.width,h.length,true));},H=l$1?b$2`<span class="num">${b(l$1[0],o.i,this.locale)}</span>
          <span>${this.s("open")} <b class="num">${b$1(l$1[1])}</b></span><span>${this.s("high")} <b class="num">${b$1(l$1[2])}</b></span>
          <span>${this.s("low")} <b class="num">${b$1(l$1[3])}</b></span><span>${this.s("close")} <b class="num">${b$1(l$1[4])}</b></span>
          <span>${this.s("vol")} <b class="num">${e(l$1[5])}</b></span>`:c$2.length?b$2`<span class="key"><span class="sw" style="background:var(--_accent)"></span>${s.symbol}</span>${c$2.map(e=>b$2`<span class="key"><span class="sw" style="background:${e.color}"></span>${e.label} <b class="num">${d((e.bars.at(-1)[4]-e.bars[0][4])/e.bars[0][4]*100)}</b></span>`)}`:"",L=b$2`${this.link(this.quotePath(s.market,s.symbol),s.symbol,s.symbol,"rowlink")} <span class="sub">${r?.n??""}</span>`,N=b$2`
      <div class="top">
        <span class="px num">${r?b$1(r.p):""}</span>
        ${r?b$2`<span class="num ${(r.c??0)>0?"up":(r.c??0)<0?"down":"flat"}">${c(r.c)}</span>${this.change(r.cp)}`:""}
      </div>
      <div class="legend">${H}</div>
      <div class="plot" @pointermove=${F} @pointerleave=${()=>this.hover=null}>
        ${o&&h.length&&this.size.w?c$1(o,{type:u,width:this.size.w,height:this.size.h,id:this.gid,axis:true,volume:this.volume!=="false"&&!c$2.length,hover:this.hover,compare:c$2,baseline:i$1==="1D"?o.pc:null}):o?b$2`<p class="sub">${this.s("noData")}</p>`:b$2`<div class="skel" style="height:100%"></div>`}
        ${o?e$1(o,`${s.symbol} ${i$1}`):""}
      </div>
      <div class="bar">
        ${this.tabs(A.map(e=>({key:e,label:e})),i$1,e=>{this.range=e,this.hover=null,this.emit("cap:select",{range:e});},this.s("range"))}
        <select aria-label=${this.s("chartType")} .value=${u} @change=${e=>this.chartType=e.target.value}>
          ${a$3.map(e=>b$2`<option value=${e} ?selected=${e===u}>${e}</option>`)}
        </select>
      </div>`;return this.frame(L,N,{pill:this.statusPill(A$1),label:`${s.symbol} ${this.s("chart")}`})}};g("cap-symbol-overview",$);export{$ as CapSymbolOverview};