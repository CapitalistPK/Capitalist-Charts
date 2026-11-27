import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-7HT5APWI.js';import {k,a as a$1,j,b,g as g$1}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {w,v,g}from'./chunk-AQVZWCVV.js';a();var n=class extends k{constructor(){super(...arguments);this.symbol="";this.market="PSX";this.rows=6;this.summaries="true";}static{this.properties={symbol:{type:String},market:{type:String},rows:{type:Number},summaries:{type:String}};}static{this.styles=[...k.styles,a$1`
      :host { min-width: 260px; }
      ol { margin: 0; padding: 0; list-style: none; }
      li { height: 78px; box-sizing: border-box; padding: 6px 0; border-bottom: 1px solid var(--_border); overflow: hidden; }
      li:last-child { border-bottom: 0; }
      li a { color: inherit; text-decoration: none; font-weight: 600; font-size: 0.86rem; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      li a:hover, li a:focus-visible { color: var(--_accent); }
      p { margin: 3px 0 0; font-size: 0.78rem; line-height: 1.35; color: var(--_muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .meta { font-size: 0.68rem; color: var(--_faint); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    `];}res(){if(this.symbol.trim()){let e$1=w(this.symbol);return e$1?e.news(e$1.market,e$1.symbol):null}return v.test(this.market)?e.news(this.market):null}subscriptions(){let e=this.res();return e?[j(e)]:[]}render(){if(this.blockedReason)return this.blockedNotice();let e=this.res(),i=b`${this.s("news")}${this.symbol.trim()?b` <span class="sub">· ${this.symbol.toUpperCase()}</span>`:""}`;if(!e)return this.message(i,this.s("notFound"));let r=this.val(e);if(r?.notFound)return this.message(i,this.s("notFound"));if(!r?.data)return r?.failed?this.message(i,this.s("unavailable")):this.skeleton(6,this.s("news"));let f=Math.floor(Date.now()/1e3),l=r.data.rows.slice(0,Math.max(1,Math.min(20,this.rows||6)));return l.length?this.frame(i,b`<ol>${l.map(t=>b`<li>
        ${this.link(`/news/${t.slug}`,b`<span dir="auto">${t.t}</span>`)}
        ${this.summaries!=="false"&&t.sum?b`<p dir="auto"><span class="sr">${this.s("summaryLabel")}: </span>${t.sum}</p>`:""}
        <div class="meta">${g(t.d,f)}${t.out?` \xB7 ${t.out}`:""}${t.syms.length?` \xB7 ${t.syms.join(", ")}`:""}</div>
      </li>`)}</ol>`):this.message(i,this.s("noNews"))}};g$1("cap-news",n);export{n as CapNews};