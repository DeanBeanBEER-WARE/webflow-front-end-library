class DOMProcessor{constructor(...t){this.configs=t,"loading"===document.readyState?document.addEventListener("DOMContentLoaded",()=>this.init()):this.init()}init(){this.configs.forEach(t=>this.processConfig(t))}processConfig(t){const{sourceAttributes:e=[],sourceParentAttribute:r=[],targetParentAttribute:n=[],orderTargetParent:s=[],targetParentVisible:o="true"}=t;if("false"===o)return void this.removeElements(t);if(0===n.length)return void console.error("No targetParentAttribute specified in configuration:",t);const a=n[0],i="1",l=document.querySelector(`[${a}="${i}"]`);if(!l)return void console.error(`Template with ${a}="${i}" not found.`);l.style.display="none";let c=0;const d=[];if("string"==typeof s)d.push(...s.split(",").map(t=>t.trim()).filter(t=>t.length>0));else if(Array.isArray(s))s.forEach(t=>{if("string"==typeof t&&t.includes(",")){const e=t.split(",").map(t=>t.trim()).filter(t=>t.length>0);d.push(...e)}else"string"==typeof t&&d.push(t.trim())});const u=[];r.forEach(t=>{const r=document.querySelectorAll(`[${t}]`);r.forEach(t=>{u.push(t);const r=t.querySelectorAll(".w-dyn-item");r.forEach(t=>{const r=e.map(t=>{let e=[];return t.sourceContainerAttributeTxt&&e.push(`[${t.sourceContainerAttributeTxt}]`),t.sourceContainerAttributeImg&&e.push(`[${t.sourceContainerAttributeImg}]`),e.join(", ")}).filter(t=>t).join(", "),n=t.querySelectorAll(r);if(0===n.length)return;const s=l.cloneNode(!0);s.style.display="",s.id="";const o=c+1;s.setAttribute(a,o),l.parentNode.appendChild(s);let i=d[c];if(void 0!==i&&(i=parseInt(i,10),!isNaN(i)))s.style.order=i;else if(void 0!==i)console.warn(`Invalid order value at position ${c}:`,i);c++,n.forEach(t=>{this.processChild3(t,s,e)})})})}),l.parentNode.removeChild(l),u.forEach(t=>{t.parentNode.removeChild(t)})}processChild3(t,e,r){let n,s,o,a;r.forEach(e=>{e.sourceContainerAttributeTxt&&t.hasAttribute(e.sourceContainerAttributeTxt)&&(n="txt",s=t.getAttribute(e.sourceContainerAttributeTxt),o=t.textContent,a=e.targetContainerAttributeTxt),e.sourceContainerAttributeImg&&t.hasAttribute(e.sourceContainerAttributeImg)&&(n="img",s=t.getAttribute(e.sourceContainerAttributeImg),o=t.src,a=e.targetContainerAttributeImg)}),s&&a&&e.querySelectorAll(`[${a}="${s}"]`).forEach(t=>{"txt"===n?t.textContent=o:"img"===n&&(t.src=o)})}removeElements(t){const{sourceParentAttribute:e=[],targetParentAttribute:r=[]}=t;e.forEach(t=>{document.querySelectorAll(`[${t}]`).forEach(t=>{t.parentNode&&t.parentNode.removeChild(t)})}),r.forEach(t=>{document.querySelectorAll(`[${t}]`).forEach(t=>{t.parentNode&&t.parentNode.removeChild(t)})})}}window.DOMProcessor=DOMProcessor;
