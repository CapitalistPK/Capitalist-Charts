import {e}from'./chunk-ICQF3XDI.js';import {a}from'./chunk-FACV67IN.js';import {k,a as a$1,j,b,g}from'./chunk-IYZR73NK.js';import'./chunk-27VB6R7A.js';import {a as a$2}from'./chunk-AQVZWCVV.js';a();function f(e,r){if(!(e>0))return 0;let t=r.slabs.find(a=>e>a.from&&(a.to===null||e<=a.to))??r.slabs[0];if(!t)return 0;let s=t.base+(e-t.from)*t.rate/100;return r.surcharge&&e>r.surcharge.over&&(s+=s*r.surcharge.rate/100),Math.max(0,Math.round(s))}var u=class extends k{constructor(){super(...arguments);this.salary=15e4;}static{this.properties={salary:{type:Number}};}static{this.styles=[...k.styles,a$1`
      :host { min-width: 260px; }
      label { font-size: 0.75rem; color: var(--_muted); display: flex; flex-direction: column; gap: 4px; }
      input { font: inherit; font-size: 1rem; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--_border); background: var(--_bg); color: var(--_text); min-height: 40px; }
      .out { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .o { background: var(--_surface); border-radius: 8px; padding: 6px 9px; font-size: 0.7rem; color: var(--_muted); }
      .o b { display: block; font-size: 1rem; color: var(--_text); font-weight: 600; }
    `];}subscriptions(){return [j(e.tax())]}render(){if(this.blockedReason)return this.blockedNotice();let t=this.val(e.tax());if(!t?.data)return t?.failed||t?.notFound?this.message(this.s("tax"),this.s("unavailable")):this.skeleton(4,this.s("tax"));let s=t.data,a=Number.isFinite(this.salary)&&this.salary>0?Math.min(this.salary,1e9):0,i=f(a*12,s),o=l=>`Rs ${a$2(l,0)}`;return this.frame(b`${this.s("tax")} <span class="sub">· ${this.s("taxYear")} ${s.ty}</span>`,b`<label>${this.s("monthlySalary")}
          <input type="number" inputmode="numeric" min="0" step="1000" .value=${String(a)} @input=${l=>{this.salary=Number(l.target.value),this.emit("cap:select",{salary:this.salary});}} /></label>
        <div class="out" aria-live="polite">
          <div class="o">${this.s("monthlyTax")}<b class="num">${o(i/12)}</b></div>
          <div class="o">${this.s("takeHome")}<b class="num">${o(a-i/12)}</b></div>
          <div class="o">${this.s("annualTax")}<b class="num">${o(i)}</b></div>
          <div class="o">${this.s("effectiveRate")}<b class="num">${a?`${a$2(i/(a*12)*100,2)}%`:"\u2013"}</b></div>
        </div>
        <span class="sub" style="white-space:normal">${this.s("taxNote")} ${s.src}</span>`)}};g("cap-tax-calculator",u);export{u as CapTaxCalculator,f as salaryTax};