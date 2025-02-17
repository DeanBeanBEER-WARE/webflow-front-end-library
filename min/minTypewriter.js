class Typewriter{constructor(t){Typewriter.instanceCounter=(Typewriter.instanceCounter||0)+1,this.instanceId=Typewriter.instanceCounter;const{hTag:e,addClass:i,textArray:s,targetParent:r,randomText:n=!1,caretFrequency:a=1e3,endHold:h=2e3,startHold:o=500,characterHold:l=200,deleteHold:d=100,caretClass:c}=t;this.options={hTag:e,addClass:i,textArray:s,targetParent:r,randomText:n,caretFrequency:a,endHold:h,startHold:o,characterHold:l,deleteHold:d,caretClass:c},this.loopNum=0,this.isDeleting=!1,this.txt="",this.currentText="",this.previousTextIndex=-1,this._init=this._init.bind(this),"loading"===document.readyState?document.addEventListener("DOMContentLoaded",this._init):this._init()}_init(){const{hTag:t,addClass:e,textArray:i,targetParent:s,randomText:r,caretFrequency:n,endHold:a,startHold:h,characterHold:o,deleteHold:l,caretClass:d}=this.options;if(!e)throw Error("Typewriter Error: 'addClass' is required.");if(!s)throw Error("Typewriter Error: 'targetParent' is required.");if(!i||!Array.isArray(i)||0===i.length)throw Error("Typewriter Error: 'textArray' must be a non-empty array.");if(this.hTag=/^h[1-6]$/.test(t)?t:"h1",this.addClass=e,this.textArray=i.slice(),this.targetParent=document.getElementById(s),!this.targetParent)throw Error(`Typewriter Error: No element found with id '${s}'.`);this.randomText=r,this.caretFrequency=n,this.endHold=a,this.startHold=h,this.characterHold=o,this.deleteHold=l,this.caretClass=d,this._createElements(),this.tick()}_createElements(){this.headingElement=document.createElement(this.hTag),this.headingElement.classList.add(this.addClass,"typewriter-text"),this.wrapSpan=document.createElement("span"),this.wrapSpan.classList.add("typewriter-wrap"),this.caretClass&&this.wrapSpan.classList.add(this.caretClass),this.headingElement.appendChild(this.wrapSpan),this.targetParent.appendChild(this.headingElement);const t=document.createElement("style");t.type="text/css";const e=`@keyframes blink-caret-${this.instanceId}{0%,50%{border-right-color:#fff}50.01%,100%{border-right-color:transparent}}`;t.innerHTML=`${e}.typewriter-wrap{animation:blink-caret-${this.instanceId} ${this.caretFrequency}ms step-end infinite}`,document.head.appendChild(t)}_getNextText(){if(this.randomText){if(1===this.textArray.length)return this.textArray[0];let t;do{t=Math.floor(Math.random()*this.textArray.length)}while(t===this.previousTextIndex);return this.previousTextIndex=t,this.textArray[t]}return this.textArray[this.loopNum%this.textArray.length]}tick(){this.currentText||(this.currentText=this._getNextText()),this.isDeleting?this.txt=this.currentText.substring(0,this.txt.length-1):this.txt=this.currentText.substring(0,this.txt.length+1),this.wrapSpan.textContent=this.txt;let t=this.isDeleting?this.deleteHold:this.characterHold;!this.isDeleting&&this.txt===this.currentText?(t=this.endHold,this.isDeleting=!0):this.isDeleting&&""===this.txt&&(this.isDeleting=!1,this.loopNum++,this.currentText="",t=this.startHold),setTimeout(()=>this.tick(),t)}}window.Typewriter=Typewriter;
