class SpanFadeInStagger{constructor(a){this.textIDs=a.textIDs||[],this.easing=a.easing||"ease",this.transition=a.transition||"200ms",this.threshold=a.threshold||.5,this.staggerDelay=a.staggerDelay||100,this.repeat=a.repeat||!1,this.tokenSizeWord=a.tokenSizeWord||!1,this.responsive=a.responsive||!1,this.observers=new Map,document.addEventListener("DOMContentLoaded",()=>{this.init(),this.responsive&&window.addEventListener("resize",this.debounce(()=>this.init(),300))})}debounce(a,b){let c;return()=>{clearTimeout(c),c=setTimeout(()=>a.apply(this),b)}}init(){this.textIDs.forEach(a=>{const b=document.getElementById(a);if(!b)return void console.error(`Element with ID "${a}" not found.`);if(this.observers.has(a)&&(this.observers.get(a).disconnect(),this.observers.delete(a)),!this.repeat&&"true"===b.getAttribute("data-animated"))return;this.unwrapSpans(b),this.tokenSizeWord?this.wrapWordsInSpans(b):this.wrapLinesInSpans(b),b.style.overflow="hidden";const c=this.tokenSizeWord?Array.from(b.querySelectorAll("span.word-span")):Array.from(b.querySelectorAll("span.line-span"));0===c.length?console.warn(`No ${this.tokenSizeWord?"word":"line"} spans found within element with ID "${a}".`):c.forEach(a=>{a.style.display=this.tokenSizeWord?"inline-block":"block",this.tokenSizeWord&&(a.style.whiteSpace="pre-wrap"),a.style.opacity="0",a.style.transform="translateY(20px)",a.style.transition=`opacity ${this.transition} ${this.easing}, transform ${this.transition} ${this.easing}`,a.style.willChange="opacity, transform"});const d={threshold:this.threshold},e=new IntersectionObserver((a,d)=>{a.forEach(a=>{a.isIntersecting?(this.animateSpans(c),!this.repeat&&(b.setAttribute("data-animated","true"),d.unobserve(a.target))):this.repeat&&this.resetSpans(c)})},d);e.observe(b),this.observers.set(a,e)})}animateSpans(a){a.forEach((a,b)=>{setTimeout(()=>{a.style.opacity="1",a.style.transform="translateY(0)"},b*this.staggerDelay)})}resetSpans(a){a.forEach(a=>{a.style.opacity="0",a.style.transform="translateY(20px)"})}wrapLinesInSpans(a){const b=document.createRange(),c=this.getTextNodes(a),d=[];c.forEach(b=>{const c=b.textContent.split(/(\s+)/);for(let e=0;e<c.length;e++){const f=c[e];if(""!==f.trim()){const g=document.createElement("span");g.textContent=f+(e+1<c.length&&""===c[e+1].trim()?c[e+1]:""),g.classList.add("word-span"),a.insertBefore(g,b),d.push(g)}}a.removeChild(b)});const e=[];d.forEach(a=>{b.selectNode(a);const c=b.getBoundingClientRect(),d=c.top;0===e.length||5<Math.abs(d-e[e.length-1].top)?e.push({top:d,spans:[a]}):e[e.length-1].spans.push(a)}),e.forEach(a=>{const b=document.createElement("span");b.classList.add("line-span"),a.spans[0].parentNode.insertBefore(b,a.spans[0]),a.spans.forEach(a=>{b.appendChild(a)})})}wrapWordsInSpans(a){const b=this.getTextNodes(a),c=[];b.forEach(b=>{const d=b.textContent.split(/(\s+)/);for(let e=0;e<d.length;e++){const f=d[e];if(""!==f.trim()){const g=document.createElement("span");g.textContent=f+(e+1<d.length&&""===d[e+1].trim()?d[e+1]:""),g.classList.add("word-span"),a.insertBefore(g,b),c.push(g)}}a.removeChild(b)})}getTextNodes(a){let b=[];const c=document.createTreeWalker(a,NodeFilter.SHOW_TEXT,null,!1);for(let d;d=c.nextNode();)""!==d.textContent.trim()&&b.push(d);return b}}window.SpanFadeInStagger=SpanFadeInStagger;