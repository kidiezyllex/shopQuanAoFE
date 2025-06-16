import{r as e}from"./react-vendor-B55MjJUH.js";let t,a,r,o={data:""},s=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,i=/\/\*[^]*?\*\/|  +/g,n=/\n+/g,l=(e,t)=>{let a="",r="",o="";for(let s in e){let i=e[s];"@"==s[0]?"i"==s[1]?a=s+" "+i+";":r+="f"==s[1]?l(i,s):s+"{"+l(i,"k"==s[1]?"":t)+"}":"object"==typeof i?r+=l(i,t?t.replace(/([^,])+/g,(e=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,(t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)))):s):null!=i&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=l.p?l.p(s,i):s+":"+i+";")}return a+(t&&o?t+"{"+o+"}":o)+r},c={},d=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+d(e[a]);return t}return e};function p(e){let t=this||{},a=e.call?e(t.p):e;return((e,t,a,r,o)=>{let p=d(e),m=c[p]||(c[p]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(p));if(!c[m]){let t=p!==e?e:(e=>{let t,a,r=[{}];for(;t=s.exec(e.replace(i,""));)t[4]?r.shift():t[3]?(a=t[3].replace(n," ").trim(),r.unshift(r[0][a]=r[0][a]||{})):r[0][t[1]]=t[2].replace(n," ").trim();return r[0]})(e);c[m]=l(o?{["@keyframes "+m]:t}:t,a?"":"."+m)}let u=a&&c.g?c.g:null;return a&&(c.g=c[m]),f=c[m],g=t,y=r,(b=u)?g.data=g.data.replace(b,f):-1===g.data.indexOf(f)&&(g.data=y?f+g.data:g.data+f),m;var f,g,y,b})(a.unshift?a.raw?((e,t,a)=>e.reduce(((e,r,o)=>{let s=t[o];if(s&&s.call){let e=s(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;s=t?"."+t:e&&"object"==typeof e?e.props?"":l(e,""):!1===e?"":e}return e+r+(null==s?"":s)}),""))(a,[].slice.call(arguments,1),t.p):a.reduce(((e,a)=>Object.assign(e,a&&a.call?a(t.p):a)),{}):a,(r=t.target,"object"==typeof window?((r?r.querySelector("#_goober"):window._goober)||Object.assign((r||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:r||o),t.g,t.o,t.k);var r}p.bind({g:1});let m=p.bind({k:1});function u(e,o){let s=this||{};return function(){let o=arguments;return function i(n,l){let c=Object.assign({},n),d=c.className||i.className;s.p=Object.assign({theme:a&&a()},c),s.o=/ *go\d+/.test(d),c.className=p.apply(s,o)+(d?" "+d:"");let m=e;return e[0]&&(m=c.as||e,delete c.as),r&&m[0]&&r(c),t(m,c)}}}var f=(e,t)=>(e=>"function"==typeof e)(e)?e(t):e,g=(()=>{let e=0;return()=>(++e).toString()})(),y=(()=>{let e;return()=>{if(void 0===e&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),b=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map((e=>e.id===t.toast.id?{...e,...t.toast}:e))};case 2:let{toast:a}=t;return b(e,{type:e.toasts.find((e=>e.id===a.id))?1:0,toast:a});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map((e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e))};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter((e=>e.id!==t.toastId))};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map((e=>({...e,pauseDuration:e.pauseDuration+o})))}}},h=[],x={toasts:[],pausedAt:void 0},v=e=>{x=b(x,e),h.forEach((e=>{e(x)}))},w=e=>(t,a)=>{let r=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||g()}))(t,e,a);return v({type:2,toast:r}),r.id},$=(e,t)=>w("blank")(e,t);$.error=w("error"),$.success=w("success"),$.loading=w("loading"),$.custom=w("custom"),$.dismiss=e=>{v({type:3,toastId:e})},$.remove=e=>v({type:4,toastId:e}),$.promise=(e,t,a)=>{let r=$.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then((e=>{let o=t.success?f(t.success,e):void 0;return o?$.success(o,{id:r,...a,...null==a?void 0:a.success}):$.dismiss(r),e})).catch((e=>{let o=t.error?f(t.error,e):void 0;o?$.error(o,{id:r,...a,...null==a?void 0:a.error}):$.dismiss(r)})),e};var k,E,j,z,A=m`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,N=m`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,F=m`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,I=u("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${A} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${N} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${F} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,O=m`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,C=u("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${O} 1s linear infinite;
`,D=m`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,S=m`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,T=u("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${D} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${S} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,_=u("div")`
  position: absolute;
`,L=u("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,M=m`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,P=u("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${M} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,q=({toast:t})=>{let{icon:a,type:r,iconTheme:o}=t;return void 0!==a?"string"==typeof a?e.createElement(P,null,a):a:"blank"===r?null:e.createElement(L,null,e.createElement(C,{...o}),"loading"!==r&&e.createElement(_,null,"error"===r?e.createElement(I,{...o}):e.createElement(T,{...o})))},H=e=>`\n0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,Z=e=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}\n`,B=u("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,G=u("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;e.memo((({toast:t,position:a,style:r,children:o})=>{let s=t.height?((e,t)=>{let a=e.includes("top")?1:-1,[r,o]=y()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[H(a),Z(a)];return{animation:t?`${m(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${m(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(t.position||a||"top-center",t.visible):{opacity:0},i=e.createElement(q,{toast:t}),n=e.createElement(G,{...t.ariaProps},f(t.message,t));return e.createElement(B,{className:t.className,style:{...s,...r,...t.style}},"function"==typeof o?o({icon:i,message:n}):e.createElement(e.Fragment,null,i,n))})),k=e.createElement,l.p=E,t=k,a=j,r=z,p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var J=$;const K=()=>({showToast:({title:e,message:t,type:a})=>{switch(a){case"success":J.success(t);break;case"error":J.error(t);break;default:J(t)}}});export{K as u};
