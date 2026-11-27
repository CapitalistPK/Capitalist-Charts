import {a}from'./chunk-YYNZLXDD.js';import {k,a as a$1,j,b,g}from'./chunk-TBDUB2M3.js';import'./chunk-27VB6R7A.js';import {M,w,D}from'./chunk-AQVZWCVV.js';var v={D:"#0f766e",B:"#7c3aed",R:"#b45309",S:"#be185d",E:"#1d4ed8",A:"#475569"},p=class extends k{constructor(){super(...arguments);this.symbol="";this.types="D,B,R,S,E,A";this.offTypes=new Set;}static{this.properties={symbol:{type:String},types:{type:String}};}static{this.styles=[...k.styles,a,a$1`
      :host { min-width: 260px; }
      .chips { display: flex; gap: 4px; flex-wrap: wrap; }
      .chips button { font: inherit; font-size: 0.7rem; border: 1px solid var(--_border); background: transparent; color: var(--_muted); border-radius: 99px; padding: 2px 8px; cursor: pointer; min-height: 24px; }
      .chips button[aria-pressed='true'] { background: var(--_surface); color: var(--_text); border-color: var(--_text); }
      ol { list-style: none; margin: 0; padding: 0; }
      li { height: 34px; box-sizing: border-box; display: grid; grid-template-columns: 52px 22px minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--_border); font-size: 0.8rem; overflow: hidden; }
      li:last-child { border-bottom: 0; }
      li.past { color: var(--_faint); }
      .d { color: var(--_muted); font-size: 0.72rem; }
      .mark { width: 20px; height: 20px; border-radius: 5px; color: #fff; font-size: 0.68rem; font-weight: 700; display: grid; place-items: center; }
      .grow { overflow: hidden; }
      .grow .sub { display: block; }
      .x { text-align: end; color: var(--_muted); white-space: nowrap; }
    `];}res(){if(!this.symbol.trim())return M.calendar("PSX");let t=w(this.symbol);return t?M.calendar(t.market,t.symbol):null}subscriptions(){let t=this.res();return t?[j(t)]:[]}toggle(t){this.offTypes.has(t)?this.offTypes.delete(t):this.offTypes.add(t),this.requestUpdate(),this.emit("cap:select",{hidden:[...this.offTypes]});}render(){if(this.blockedReason)return this.blockedNotice();let t=this.res(),a=this.symbol.trim()?b`${this.s("calendar")} <span class="sub">· ${this.symbol.toUpperCase()}</span>`:this.s("calendar");if(!t)return this.message(a,this.s("notFound"));let r=this.val(t);if(r?.notFound)return this.message(a,this.s("notFound"));if(!r?.data)return r?.failed?this.message(a,this.s("unavailable")):this.skeleton(8,this.s("calendar"));let l=new Set(this.types.split(",").map(e=>e.trim().toUpperCase()).filter(e=>D.includes(e))),b$1=D.filter(e=>l.has(e)),y=new Date().toISOString().slice(0,10),d=r.data.items.filter(e=>l.has(e.e)&&!this.offTypes.has(e.e)),g=e=>new Date(`${e}T00:00:00Z`).toLocaleDateString(this.locale==="ur"?"ur-PK":"en-GB",{day:"numeric",month:"short",timeZone:"UTC"});return this.frame(a,b`<div class="chips" role="group" aria-label=${this.s("calendar")}>
          ${b$1.map(e=>b`<button type="button" aria-pressed=${String(!this.offTypes.has(e))} @click=${()=>this.toggle(e)}>${e} · ${this.s(`ev${e}`)}</button>`)}
        </div>
        ${d.length?b`<ol>${d.map(e=>b`<li class=${e.d<y?"past":""}>
                <span class="d num">${g(e.d)}</span>
                <span class="mark" style="background:${v[e.e]}" title=${this.s(`ev${e.e}`)} aria-label=${this.s(`ev${e.e}`)}>${e.e}</span>
                <span class="grow">${this.link(this.quotePath(r.data.m,e.s),b`<b title=${e.s}>${e.s}</b>`,e.s,"rowlink")}<span class="sub" title=${e.n}>${e.n}</span></span>
                <span class="x num">${e.x}</span>
              </li>`)}</ol>`:b`<p class="sub">${this.s("noEvents")}</p>`}`)}};g("cap-corporate-calendar",p);export{p as CapCorporateCalendar};