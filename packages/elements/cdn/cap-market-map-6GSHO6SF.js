import {a}from'./chunk-HKMTIH7J.js';import {i,j as j$1}from'./chunk-QF2AVXSF.js';import {k,a as a$1,j,c,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {v,M,d,b as b$1,e}from'./chunk-AQVZWCVV.js';var L=15;function A(p){let y=Math.round(j$1(p,3)*70)+22;return `color-mix(in srgb, ${p===null||p===0?"var(--_flat)":p>0?"var(--_up)":"var(--_down)"} ${y}%, var(--_surface))`}var w=class extends k{constructor(){super(...arguments);this.market="PSX";this.sector="";this.tip=null;this.size=new a(()=>this.requestUpdate());}static{this.properties={market:{type:String},sector:{type:String},tip:{state:true}};}static{this.styles=[...k.styles,a$1`
      :host { min-width: 300px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; padding: 6px var(--_pad); }
      .plot { position: relative; width: 100%; height: 100%; min-height: 160px; }
      .plot > svg { display: block; position: absolute; inset: 0; direction: ltr; }
      .plot { overflow: hidden; }
      a text { pointer-events: none; }
      .sec { fill: var(--_muted); font-size: 10px; font-weight: 600; }
      .lbl { font-weight: 600; text-anchor: middle; }
      a:focus-visible rect { stroke: var(--_accent); stroke-width: 2; }
      .tip { position: absolute; pointer-events: none; background: var(--_bg); border: 1px solid var(--_border); border-radius: 8px; padding: 6px 8px; font-size: 0.75rem; box-shadow: 0 6px 18px rgb(0 0 0 / 0.14); z-index: 2; max-width: 220px; }
    `];}res(){return v.test(this.market)?M.map(this.market):null}subscriptions(){let o=this.res();return o?[j(o)]:[]}updated(){this.size.observe(this.renderRoot.querySelector(".plot"));}disconnectedCallback(){super.disconnectedCallback(),this.size.disconnect();}render(){if(this.blockedReason)return this.blockedNotice();let o=this.res();if(!o)return this.message(this.market,this.s("unavailable"));let c$1=this.val(o);if(!c$1?.data)return c$1?.notFound||c$1?.failed?this.message(this.s("marketMap"),this.s("unavailable")):this.skeleton(6,this.s("marketMap"));let f=this.sector.trim().toLowerCase(),u=c$1.data.sectors.filter(x=>!f||x.n.toLowerCase()===f),n=this.size.w,l=this.size.h,M=c``;if(n>0&&l>0){let x=i(u,e=>e.items.reduce((h,v)=>h+v.mc,0),{x:0,y:0,w:n,h:l});M=c`${x.map(e=>{let h=e.h>40&&e.w>50,v=i(e.item.items,t=>t.mc,{x:e.x+1,y:e.y+(h?L:1),w:e.w-2,h:e.h-(h?L:1)-1});return c`<g>
          ${h?c`<text class="sec" x=${e.x+3} y=${e.y+11}>${e.item.n.length*6>e.w?`${e.item.n.slice(0,Math.max(2,Math.floor(e.w/6)-1))}\u2026`:e.item.n}</text>`:""}
          ${v.map(t=>{let i=t.item,s=Math.max(8,Math.min(16,Math.sqrt(t.w*t.h)/5)),_=t.w>s*i.s.length*.62+4&&t.h>s*1.2,z=_&&t.h>s*2.6;return c`<a href=${this.siteHref(this.quotePath(this.market,i.s))} target="_blank" rel="noopener" aria-label=${`${i.s} ${d(i.cp)}`}
                @click=${d=>this.onLink(d,i.s)}
                @pointermove=${d=>this.tip={x:d.offsetX,y:d.offsetY,item:i,sector:e.item.n}}
                @pointerleave=${()=>this.tip=null}>
              <rect x=${t.x+.5} y=${t.y+.5} width=${Math.max(0,t.w-1)} height=${Math.max(0,t.h-1)} rx="2" fill=${A(i.cp)} opacity=${i.st?.75:1}></rect>
              ${_?c`<text class="lbl" fill=${j$1(i.cp,3)>.45?"#fff":"var(--_text)"} x=${t.x+t.w/2} y=${t.y+t.h/2+(z?-s*.15:s*.35)} font-size=${s}>${i.s}</text>`:""}
              ${z?c`<text class="lbl" fill=${j$1(i.cp,3)>.45?"#fff":"var(--_text)"} x=${t.x+t.w/2} y=${t.y+t.h/2+s*.95} font-size=${s*.75} font-weight="400">${d(i.cp)}</text>`:""}
            </a>`})}
        </g>`})}`;}let r=this.tip;return this.frame(b`${this.s("marketMap")} <span class="sub">· ${this.market}${f&&u[0]?` \xB7 ${u[0].n}`:""}</span>`,b`<div class="plot">
        ${n?b`<svg width=${n} height=${l} viewBox="0 0 ${n} ${l}" role="group" aria-label=${this.s("marketMap")}>${M}</svg>`:""}
        ${r?b`<div class="tip" style="left:${Math.min(r.x+12,Math.max(0,n-200))}px;top:${Math.min(r.y+12,Math.max(0,l-80))}px">
              <b>${r.item.s}</b> <span class="sub">${r.item.n}</span><br />
              <span class="num">${b$1(r.item.p)}</span> ${this.change(r.item.cp)}<br />
              <span class="sub">${r.sector} · ${this.s("mcap")} ${e(r.item.mc)}</span>
            </div>`:""}
      </div>`)}};g("cap-market-map",w);export{w as CapMarketMap};