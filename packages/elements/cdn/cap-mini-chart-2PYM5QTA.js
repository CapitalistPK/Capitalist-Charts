import {a as a$3,c as c$1,b as b$2,e,d}from'./chunk-CCD4FFGO.js';import {a}from'./chunk-HKMTIH7J.js';import'./chunk-QF2AVXSF.js';import {a as a$1}from'./chunk-VAEDFHRU.js';import {k,a as a$2,i,j,b,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {w,A,M,l,b as b$1,c}from'./chunk-AQVZWCVV.js';var _=0,m=class extends k{constructor(){super(...arguments);this.symbol="PSX:KSE100";this.range="1D";this.chartType="area";this.hover=null;this.size=new a(()=>this.requestUpdate());this.gid=`cmc${++_}`;}static{this.properties={symbol:{type:String},range:{type:String,reflect:true},chartType:{type:String,attribute:"chart-type"},hover:{state:true}};}static{this.styles=[...k.styles,a$1,a$2`
      :host { min-width: 240px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; padding-bottom: 4px; }
      .top { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
      .px { font-size: 1.35rem; font-weight: 600; }
      .plot { flex: 1; min-height: 60px; position: relative; }
      .tip { position: absolute; top: 0; inset-inline-start: 0; font-size: 0.7rem; color: var(--_muted); background: var(--_bg); padding: 0 4px; border-radius: 4px; pointer-events: none; }
      .tabs { margin-top: 2px; flex: none; }
      .tabs button { padding: 3px 7px; min-height: 24px; }
    `];}ref(){return w(this.symbol)}safeRange(){return A.includes(this.range)?this.range:"1D"}subscriptions(){let e=this.ref();return e?[i(e.market,e.symbol),j(M.series(e.market,e.symbol,this.safeRange()))]:[]}updated(){this.size.observe(this.renderRoot.querySelector(".plot"));}disconnectedCallback(){super.disconnectedCallback(),this.size.disconnect();}pick(e){this.range=e,this.hover=null,this.emit("cap:select",{range:e});}render(){if(this.blockedReason)return this.blockedNotice();let e$1=this.ref();if(!e$1)return this.message(this.symbol,this.s("notFound"));let a=this.val(i(e$1.market,e$1.symbol)),u=this.val(M.series(e$1.market,e$1.symbol,this.safeRange()));if(a?.notFound)return this.message(e$1.symbol,this.s("notFound"));if(!a?.data&&!u?.data)return this.skeleton(3,e$1.symbol);let s=a?.data??null,t=u?.data??null,E=l(s,a?.status,Math.floor(Date.now()/1e3),{failed:a?.failed??false}),P=a$3.includes(this.chartType)?this.chartType:"area",o=t?.b??[],n=this.hover!==null?o[this.hover]:void 0,q=i=>{let b=i.currentTarget.getBoundingClientRect();o.length&&(this.hover=d(i.clientX-b.left,b.width,o.length,false));},D=b`${this.link(this.quotePath(e$1.market,e$1.symbol),e$1.symbol,e$1.symbol,"rowlink")} <span class="sub">${s?.n??""}</span>`,M$1=b`
      <div class="top">
        <span class="px num">${s?b$1(s.p):""}</span>
        ${s?b`<span class="num ${(s.c??0)>0?"up":(s.c??0)<0?"down":"flat"}">${c(s.c)}</span>${this.change(s.cp)}`:""}
      </div>
      <div class="plot" @pointermove=${q} @pointerleave=${()=>this.hover=null}>
        ${t&&o.length&&this.size.w?c$1(t,{type:P,width:this.size.w,height:this.size.h,id:this.gid,hover:this.hover,baseline:t.r==="1D"?t.pc:null}):t&&!o.length?b`<p class="sub">${this.s("noData")}</p>`:b`<div class="skel" style="height:100%"></div>`}
        ${n?b`<span class="tip num">${b$2(n[0],t.i,this.locale)} · ${b$1(n[4])}</span>`:""}
        ${t?e(t,`${e$1.symbol} ${t.r}`):""}
      </div>
      ${this.tabs(A.map(i=>({key:i,label:i})),this.safeRange(),i=>this.pick(i),this.s("range"))}
    `;return this.frame(D,M$1,{pill:this.statusPill(E),label:`${e$1.symbol} ${this.s("chart")}`})}};g("cap-mini-chart",m);export{m as CapMiniChart};