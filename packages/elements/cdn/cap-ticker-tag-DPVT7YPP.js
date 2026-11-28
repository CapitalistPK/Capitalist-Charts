import {k,a,i,b,g as g$1}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {w,l,b as b$1,h,c,e,g}from'./chunk-AQVZWCVV.js';var p=class extends k{constructor(){super(...arguments);this.symbol="PSX:KSE100";this.show="both";this.open=false;this.closeTimer=null;}static{this.properties={symbol:{type:String},show:{type:String},open:{state:true}};}static{this.styles=[...k.styles,a`
      :host { display: inline-block; contain: none; position: relative; min-width: 32ch; vertical-align: baseline; font-size: inherit; line-height: inherit; font-variant-numeric: tabular-nums; }
      .tag { display: inline-flex; align-items: baseline; gap: 4px; color: inherit; text-decoration: none; box-shadow: inset 0 -1px 0 currentColor; line-height: inherit; font-size: inherit; white-space: nowrap; }
      .tag .num { display: inline-block; min-width: 10ch; text-align: end; font-variant-numeric: tabular-nums; }
      .tag b { font-weight: 600; }
      /* Plain inline text, not a flex box: a flex box takes its baseline from the arrow icon and
         lifts the host's line by a couple of pixels. */
      .tag .chg { display: inline; }
      .tag .chg .ico { width: 0.85em; height: 0.85em; vertical-align: -0.05em; }
      .pop { position: absolute; z-index: 10; top: calc(100% + 6px); inset-inline-start: 0; width: 230px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.16); font-size: 0.85rem; white-space: normal; }
      .px { font-size: 1.2rem; font-weight: 600; }
      .row { display: flex; gap: 8px; align-items: baseline; }
    `];}subscriptions(){let t=w(this.symbol);return t?[i(t.market,t.symbol)]:[]}setOpen(t){this.closeTimer&&clearTimeout(this.closeTimer),t?this.open=true:this.closeTimer=setTimeout(()=>this.open=false,150);}render(){let t=w(this.symbol);if(this.blockedReason||!t)return b`<slot></slot>`;let a=this.val(i(t.market,t.symbol)),e$1=a?.data;if(!e$1)return b`<slot>${t.symbol}</slot>`;let c$1=Math.floor(Date.now()/1e3),h$1=l(e$1,a?.status,c$1,{failed:a?.failed??false}),$=e$1.k==="index"?e$1.n:e$1.s;return b`<span @mouseenter=${()=>this.setOpen(true)} @mouseleave=${()=>this.setOpen(false)} @focusin=${()=>this.setOpen(true)} @focusout=${()=>this.setOpen(false)}
      @keydown=${i=>i.key==="Escape"&&(this.open=false)}>
      <a class="tag" href=${this.siteHref(this.quotePath(e$1.m,e$1.s))} target="_blank" rel="noopener" aria-describedby="pop" @click=${i=>this.onLink(i,e$1.s)}>
        <b>${$}</b>${this.show!=="change"?b`<span class="num">${b$1(e$1.p)}</span>`:""}${this.show!=="price"?this.change(e$1.cp):""}
      </a>
      ${this.open?b`<span class="card pop" id="pop" role="tooltip">
            <span class="hd">${this.monogram(e$1.s)}<span class="title">${e$1.s}</span>${this.statusPill(h$1,h$1==="live"?`${this.s("live")} \xB7 ${h(e$1.t)}`:void 0)}</span>
            <span class="bd"><span class="sub">${e$1.n}</span>
              <span class="row"><span class="px num">${b$1(e$1.p)}</span><span class="num ${(e$1.c??0)>0?"up":(e$1.c??0)<0?"down":"flat"}">${c(e$1.c)}</span>${this.change(e$1.cp)}</span>
              <span class="sub">${this.s("vol")} <span class="num">${e(e$1.vol)}</span></span></span>
            <span class="ft">${this.attribution()}<span class="num">${g(e$1.t,c$1)}</span></span>
          </span>`:""}
    </span>`}};g$1("cap-ticker-tag",p);export{p as CapTickerTag};