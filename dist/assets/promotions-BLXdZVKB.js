const p=(u,e,n)=>{if(!n||n.length===0)return{originalPrice:e,discountedPrice:e,discountPercent:0};const r=new Date,s=n.filter(t=>{if(t.status!=="HOAT_DONG")return!1;const a=new Date(t.startDate),P=new Date(t.endDate),f=new Date(a.getTime()-7*60*60*1e3),D=new Date(P.getTime()-7*60*60*1e3);return r<f||r>D?!1:!t.products||t.products.length===0?!0:t.products.some(c=>{let l;if(typeof c=="string")l=c;else if(c&&typeof c=="object")l=c.id||c.id;else return!1;return l===u})});if(s.length===0)return{originalPrice:e,discountedPrice:e,discountPercent:0};const i=s.reduce((t,a)=>a.discountPercent>t.discountPercent?a:t),o=e*i.discountPercent/100,d=e-o;return{originalPrice:e,discountedPrice:Math.max(0,Math.round(d)),discountPercent:i.discountPercent,appliedPromotion:i}},b=(u,e)=>!e||e.length===0?u:u.map(n=>{var o,d;const r=((d=(o=n.variants)==null?void 0:o[0])==null?void 0:d.price)||0;if(r===0)return{...n,originalPrice:0,discountedPrice:0,discountPercent:0,hasDiscount:!1};const s=p(n.id,r,e);return{...n,originalPrice:s.originalPrice,discountedPrice:s.discountedPrice,discountPercent:s.discountPercent,appliedPromotion:s.appliedPromotion,hasDiscount:s.discountPercent>0}});export{b as a,p as c};
