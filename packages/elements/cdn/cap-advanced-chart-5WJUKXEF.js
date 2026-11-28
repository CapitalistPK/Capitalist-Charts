import {k,a,h,b as b$1,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {w}from'./chunk-AQVZWCVV.js';var m="/pro/charts/embed/advanced",b=/^[A-Za-z0-9:.,_-]{0,200}$/,c=/^[A-Za-z0-9_-]{1,24}$/,l=class extends k{constructor(){super(...arguments);this.symbol="PSX:KSE100";this.interval="1D";this.chartType="candles";this.studies="";this.compare="";this.hideTopToolbar="false";this.hideSideToolbar="false";this.allowSymbolChange="true";this.events="true";this.loaded=false;}static{this.properties={symbol:{type:String},interval:{type:String},chartType:{type:String,attribute:"chart-type"},studies:{type:String},compare:{type:String},hideTopToolbar:{type:String,attribute:"hide-top-toolbar"},hideSideToolbar:{type:String,attribute:"hide-side-toolbar"},allowSymbolChange:{type:String,attribute:"allow-symbol-change"},events:{type:String},loaded:{state:true}};}static{this.styles=[...k.styles,a`
      :host { min-width: 300px; }
      .card { height: 100%; position: relative; }
      iframe { border: 0; width: 100%; flex: 1; min-height: 0; display: block; background: var(--_bg); }
      .skel { position: absolute; inset: 0 0 26px; border-radius: 0; }
      .ft { padding-top: 6px; }
    `];}src(){let s=w(this.symbol);if(!s)return null;let e=new URL(m,h),t=e.searchParams;t.set("symbol",`${s.market}:${s.symbol}`),c.test(this.interval)&&t.set("interval",this.interval),c.test(this.chartType)&&t.set("type",this.chartType),this.studies&&b.test(this.studies)&&t.set("studies",this.studies);let n=this.compare.split(",").map(i=>w(i)).filter(i=>!!i).slice(0,4).map(i=>`${i.market}:${i.symbol}`);return n.length&&t.set("compare",n.join(",")),this.hideTopToolbar==="true"&&t.set("top","0"),this.hideSideToolbar==="true"&&t.set("side","0"),this.allowSymbolChange==="false"&&t.set("lock","1"),this.events==="false"&&t.set("events","0"),t.set("theme",this.theme==="dark"||this.theme==="light"?this.theme:"auto"),t.set("locale",this.locale==="ur"?"ur":"en"),t.set("utm_source","widget"),e.toString()}render(){if(this.blockedReason)return this.blockedNotice();let s=this.src();if(!s)return this.message(this.symbol,this.s("notFound"));let e=w(this.symbol);return b$1`<div class="card" part="card">
      ${this.loaded?"":b$1`<div class="skel" aria-hidden="true"></div>`}
      <iframe
        src=${s}
        title=${`${e.symbol} ${this.s("chart")}`}
        loading="lazy"
        referrerpolicy="origin"
        allow="fullscreen; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        @load=${()=>{this.loaded=true,this.emit("cap:ready",{symbol:`${e.market}:${e.symbol}`});}}
      ></iframe>
      <div class="ft" part="footer">${this.attribution()}${this.link(this.quotePath(e.market,e.symbol),this.s("openChart"),e.symbol,"attr")}</div>
    </div>`}};g("cap-advanced-chart",l);export{m as ADVANCED_CHART_PATH,l as CapAdvancedChart};