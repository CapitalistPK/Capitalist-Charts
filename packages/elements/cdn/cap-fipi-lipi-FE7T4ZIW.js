import {a}from'./chunk-VAEDFHRU.js';import {k,a as a$1,j,b as b$1,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {B,M,j as j$1}from'./chunk-AQVZWCVV.js';var b=j$1,c=class extends k{constructor(){super(...arguments);this.period="1D";}static{this.properties={period:{type:String,reflect:true}};}static{this.styles=[...k.styles,a,a$1`
      :host { min-width: 300px; }
      .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
      h3 { margin: 0 0 4px; font-size: 0.74rem; font-weight: 600; color: var(--_muted); text-transform: uppercase; letter-spacing: 0.03em; }
      .row { display: grid; grid-template-columns: minmax(118px, 1.4fr) 1.5fr 62px; gap: 6px; align-items: center; font-size: 0.76rem; padding: 3px 0; }
      .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .track { position: relative; height: 10px; }
      .track::before { content: ''; position: absolute; inset-inline-start: 50%; top: -2px; bottom: -2px; border-inline-start: 1px solid var(--_border); }
      .bar { position: absolute; top: 0; height: 100%; border-radius: 2px; }
      .val { text-align: end; }
    `];}safe(){return B.includes(this.period)?this.period:"1D"}subscriptions(){return [j(M.flows("PSX",this.safe()))]}bars(o,i){let t=Math.max(1,...o.map(e=>Math.abs(e.net)));return o.map(e=>{let a=Math.abs(e.net)/t*50,n=e.net>=0?"inset-inline-start:50%":"inset-inline-end:50%";return b$1`<div class="row" role="listitem">
        <span class="lbl" title=${e.n}>${e.n}</span>
        <span class="track" aria-hidden="true"><span class="bar" style="${n};width:${a}%;background:${e.net>=0?"var(--_up)":"var(--_down)"}"></span></span>
        <span class="val num ${e.net>=0?"up":"down"}">${b(e.net,i)}</span>
      </div>`})}render(){if(this.blockedReason)return this.blockedNotice();let o=this.safe(),i=this.val(M.flows("PSX",o));if(!i?.data)return i?.notFound||i?.failed?this.message(this.s("flows"),this.s("unavailable")):this.skeleton(8,this.s("flows"));let t=i.data,e=t.types.filter(s=>s.g==="foreign"),a=t.types.filter(s=>s.g==="local"),n=t.from===t.to?t.to:`${t.from} \u2013 ${t.to}`;return this.frame(b$1`${this.s("flows")} <span class="sub">· ${t.m}</span>`,b$1`${this.tabs(B.map(s=>({key:s,label:s})),o,s=>{this.period=s,this.emit("cap:select",{period:s});},this.s("range"))}
        <div class="cols">
          <div><h3>${this.s("foreign")}</h3><div role="list">${this.bars(e,t.unit)}</div></div>
          <div><h3>${this.s("local")}</h3><div role="list">${this.bars(a,t.unit)}</div></div>
          ${t.sectors.length?b$1`<div><h3>${this.s("sectors")}</h3><div role="list">${this.bars(t.sectors.slice(0,8),t.unit)}</div></div>`:""}
        </div>`,{foot:b$1`<span class="num">${n}</span>`})}};g("cap-fipi-lipi",c);export{c as CapFipiLipi};