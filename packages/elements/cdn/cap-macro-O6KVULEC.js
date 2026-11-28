import {d,e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-FACV67IN.js';import {a as a$1}from'./chunk-HKMTIH7J.js';import {a as a$4,d as d$1,c}from'./chunk-QF2AVXSF.js';import {a as a$2}from'./chunk-VAEDFHRU.js';import {k,a as a$3,j,c as c$1,b,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {a as a$5}from'./chunk-AQVZWCVV.js';a();var f=class extends k{constructor(){super(...arguments);this.code="";this.size=new a$1(()=>this.requestUpdate());}static{this.properties={code:{type:String}};}static{this.styles=[...k.styles,a$2,a$3`
      :host { min-width: 280px; }
      .card { height: 100%; }
      .bd { flex: 1; min-height: 0; }
      .top { display: flex; align-items: baseline; gap: 8px; }
      .top b { font-size: 1.4rem; }
      .plot { flex: 1; min-height: 80px; }
    `];}res(){let t=this.code.trim().toUpperCase();return d.test(t)?e.macro(t):null}subscriptions(){let t=this.res();return t?[j(t)]:[]}updated(){this.size.observe(this.renderRoot.querySelector(".plot"));}disconnectedCallback(){super.disconnectedCallback(),this.size.disconnect();}draw(t){let r=this.size.w,e=this.size.h;if(!r||!e||t.pts.length<2)return "";let o=t.pts.length+t.fc.length,i=s=>s/Math.max(1,o-1)*(r-40),n=[...t.pts.map(s=>s[1]),...t.fc.flatMap(s=>[s.v,s.lo??s.v,s.hi??s.v])],a=a$4(Math.min(...n),Math.max(...n),e-4,4),c$2=t.pts.map((s,l)=>[i(l),a(s[1])]),d=c$2[c$2.length-1],_=[d,...t.fc.map((s,l)=>[i(t.pts.length+l),a(s.v)])],g=t.fc.length?`M${d[0]} ${d[1]}${t.fc.map((s,l)=>`L${i(t.pts.length+l)} ${a(s.hi??s.v)}`).join("")}${[...t.fc].reverse().map((s,l)=>`L${i(t.pts.length+t.fc.length-1-l)} ${a(s.lo??s.v)}`).join("")}Z`:"";return b`<svg class="chart" width=${r} height=${e} aria-hidden="true">
      <path d=${d$1(c$2,e)} fill="color-mix(in srgb, var(--_accent) 12%, transparent)"></path>
      <path d=${c(c$2)} fill="none" stroke="var(--_accent)" stroke-width="1.6"></path>
      ${g?c$1`<path d=${g} fill="color-mix(in srgb, var(--_warn) 18%, transparent)"></path><path d=${c(_)} fill="none" stroke="var(--_warn)" stroke-width="1.4" stroke-dasharray="4 3"></path>`:""}
      ${a.max>0&&a.min<0?c$1`<line class="grid" x1="0" x2=${r-40} y1=${a(0)} y2=${a(0)}></line>`:""}
      <text class="axis" x=${r-2} y=${a(a.max)+10} text-anchor="end">${a$5(a.max,t.dec)}</text>
      <text class="axis" x=${r-2} y=${a(a.min)-2} text-anchor="end">${a$5(a.min,t.dec)}</text>
    </svg>`}render(){if(this.blockedReason)return this.blockedNotice();let t=this.res();if(!t)return this.message(this.s("macro"),this.s("notFound"));let r=this.val(t);if(r?.notFound)return this.message(this.s("macro"),this.s("notFound"));if(!r?.data)return r?.failed?this.message(this.s("macro"),this.s("unavailable")):this.skeleton(5,this.s("macro"));let e=r.data,o=e.pts[e.pts.length-1],i=e.pts[e.pts.length-2],n=o&&i?o[1]-i[1]:null,a=n===null||n===0||e.good===null?"flat":n>0==(e.good==="up")?"up":"down",c=e.u==="percent"?"%":` ${e.u}`;return this.frame(b`${e.n}`,b`<div class="top"><b class="num">${o?`${a$5(o[1],e.dec)}${c}`:"\u2013"}</b>
          ${n!==null?b`<span class="num ${a}">${n>0?"+":n<0?"\u2212":""}${a$5(Math.abs(n),e.dec)}</span>`:""}
          <span class="sub">${o?o[0]:""}</span></div>
        <div class="plot">${this.draw(e)}</div>
        ${e.fc.length?b`<span class="sub">${this.s("forecast")}: <span class="num">${a$5(e.fc[e.fc.length-1].v,e.dec)}${c}</span> (${e.fc[e.fc.length-1].d})</span>`:""}`,{foot:e.src??""})}};g("cap-macro",f);export{f as CapMacro};