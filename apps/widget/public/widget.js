var pe=Object.defineProperty;var fe=(e,t,n)=>t in e?pe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var O=(e,t,n)=>fe(e,typeof t!="symbol"?t+"":t,n);(function(){"use strict";const EMBED_CONFIG={WIDGET_URL:"https://echo-monorepo-widget.vercel.app",DEFAULT_POSITION:"bottom-right"},chatBubbleIcon=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>`,closeIcon=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;function $constructor(e,t,n){function r(a,l){var d;Object.defineProperty(a,"_zod",{value:a._zod??{},enumerable:!1}),(d=a._zod).traits??(d.traits=new Set),a._zod.traits.add(e),t(a,l);for(const m in s.prototype)m in a||Object.defineProperty(a,m,{value:s.prototype[m].bind(a)});a._zod.constr=s,a._zod.def=l}const o=(n==null?void 0:n.Parent)??Object;class i extends o{}Object.defineProperty(i,"name",{value:e});function s(a){var l;const d=n!=null&&n.Parent?new i:this;r(d,a),(l=d._zod).deferred??(l.deferred=[]);for(const m of d._zod.deferred)m();return d}return Object.defineProperty(s,"init",{value:r}),Object.defineProperty(s,Symbol.hasInstance,{value:a=>{var l,d;return n!=null&&n.Parent&&a instanceof n.Parent?!0:(d=(l=a==null?void 0:a._zod)==null?void 0:l.traits)==null?void 0:d.has(e)}}),Object.defineProperty(s,"name",{value:e}),s}class $ZodAsyncError extends Error{constructor(){super("Encountered Promise during synchronous parse. Use .parseAsync() instead.")}}const globalConfig={};function config(e){return globalConfig}function getEnumValues(e){const t=Object.values(e).filter(r=>typeof r=="number");return Object.entries(e).filter(([r,o])=>t.indexOf(+r)===-1).map(([r,o])=>o)}function jsonStringifyReplacer(e,t){return typeof t=="bigint"?t.toString():t}function cached(e){return{get value(){{const t=e();return Object.defineProperty(this,"value",{value:t}),t}}}}function nullish(e){return e==null}function cleanRegex(e){const t=e.startsWith("^")?1:0,n=e.endsWith("$")?e.length-1:e.length;return e.slice(t,n)}function floatSafeRemainder(e,t){const n=(e.toString().split(".")[1]||"").length,r=(t.toString().split(".")[1]||"").length,o=n>r?n:r,i=Number.parseInt(e.toFixed(o).replace(".","")),s=Number.parseInt(t.toFixed(o).replace(".",""));return i%s/10**o}function defineLazy(e,t,n){Object.defineProperty(e,t,{get(){{const r=n();return e[t]=r,r}},set(r){Object.defineProperty(e,t,{value:r})},configurable:!0})}function assignProp(e,t,n){Object.defineProperty(e,t,{value:n,writable:!0,enumerable:!0,configurable:!0})}function esc(e){return JSON.stringify(e)}const captureStackTrace=Error.captureStackTrace?Error.captureStackTrace:(...e)=>{};function isObject(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const allowsEval=cached(()=>{var e;if(typeof navigator<"u"&&((e=navigator==null?void 0:navigator.userAgent)!=null&&e.includes("Cloudflare")))return!1;try{const t=Function;return new t(""),!0}catch{return!1}});function isPlainObject(e){if(isObject(e)===!1)return!1;const t=e.constructor;if(t===void 0)return!0;const n=t.prototype;return!(isObject(n)===!1||Object.prototype.hasOwnProperty.call(n,"isPrototypeOf")===!1)}const propertyKeyTypes=new Set(["string","number","symbol"]);function escapeRegex(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function clone(e,t,n){const r=new e._zod.constr(t??e._zod.def);return(!t||n!=null&&n.parent)&&(r._zod.parent=e),r}function normalizeParams(e){const t=e;if(!t)return{};if(typeof t=="string")return{error:()=>t};if((t==null?void 0:t.message)!==void 0){if((t==null?void 0:t.error)!==void 0)throw new Error("Cannot specify both `message` and `error` params");t.error=t.message}return delete t.message,typeof t.error=="string"?{...t,error:()=>t.error}:t}function optionalKeys(e){return Object.keys(e).filter(t=>e[t]._zod.optin==="optional"&&e[t]._zod.optout==="optional")}const NUMBER_FORMAT_RANGES={safeint:[Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],int32:[-2147483648,2147483647],uint32:[0,4294967295],float32:[-34028234663852886e22,34028234663852886e22],float64:[-Number.MAX_VALUE,Number.MAX_VALUE]};function pick(e,t){const n={},r=e._zod.def;for(const o in t){if(!(o in r.shape))throw new Error(`Unrecognized key: "${o}"`);t[o]&&(n[o]=r.shape[o])}return clone(e,{...e._zod.def,shape:n,checks:[]})}function omit(e,t){const n={...e._zod.def.shape},r=e._zod.def;for(const o in t){if(!(o in r.shape))throw new Error(`Unrecognized key: "${o}"`);t[o]&&delete n[o]}return clone(e,{...e._zod.def,shape:n,checks:[]})}function extend(e,t){if(!isPlainObject(t))throw new Error("Invalid input to extend: expected a plain object");const n={...e._zod.def,get shape(){const r={...e._zod.def.shape,...t};return assignProp(this,"shape",r),r},checks:[]};return clone(e,n)}function merge(e,t){return clone(e,{...e._zod.def,get shape(){const n={...e._zod.def.shape,...t._zod.def.shape};return assignProp(this,"shape",n),n},catchall:t._zod.def.catchall,checks:[]})}function partial(e,t,n){const r=t._zod.def.shape,o={...r};if(n)for(const i in n){if(!(i in r))throw new Error(`Unrecognized key: "${i}"`);n[i]&&(o[i]=e?new e({type:"optional",innerType:r[i]}):r[i])}else for(const i in r)o[i]=e?new e({type:"optional",innerType:r[i]}):r[i];return clone(t,{...t._zod.def,shape:o,checks:[]})}function required(e,t,n){const r=t._zod.def.shape,o={...r};if(n)for(const i in n){if(!(i in o))throw new Error(`Unrecognized key: "${i}"`);n[i]&&(o[i]=new e({type:"nonoptional",innerType:r[i]}))}else for(const i in r)o[i]=new e({type:"nonoptional",innerType:r[i]});return clone(t,{...t._zod.def,shape:o,checks:[]})}function aborted(e,t=0){var n;for(let r=t;r<e.issues.length;r++)if(((n=e.issues[r])==null?void 0:n.continue)!==!0)return!0;return!1}function prefixIssues(e,t){return t.map(n=>{var r;return(r=n).path??(r.path=[]),n.path.unshift(e),n})}function unwrapMessage(e){return typeof e=="string"?e:e==null?void 0:e.message}function finalizeIssue(e,t,n){var o,i,s,a,l,d;const r={...e,path:e.path??[]};if(!e.message){const m=unwrapMessage((s=(i=(o=e.inst)==null?void 0:o._zod.def)==null?void 0:i.error)==null?void 0:s.call(i,e))??unwrapMessage((a=t==null?void 0:t.error)==null?void 0:a.call(t,e))??unwrapMessage((l=n.customError)==null?void 0:l.call(n,e))??unwrapMessage((d=n.localeError)==null?void 0:d.call(n,e))??"Invalid input";r.message=m}return delete r.inst,delete r.continue,t!=null&&t.reportInput||delete r.input,r}function getLengthableOrigin(e){return Array.isArray(e)?"array":typeof e=="string"?"string":"unknown"}function issue(...e){const[t,n,r]=e;return typeof t=="string"?{message:t,code:"custom",input:n,inst:r}:{...t}}const initializer$1=(e,t)=>{e.name="$ZodError",Object.defineProperty(e,"_zod",{value:e._zod,enumerable:!1}),Object.defineProperty(e,"issues",{value:t,enumerable:!1}),Object.defineProperty(e,"message",{get(){return JSON.stringify(t,jsonStringifyReplacer,2)},enumerable:!0}),Object.defineProperty(e,"toString",{value:()=>e.message,enumerable:!1})},$ZodError=$constructor("$ZodError",initializer$1),$ZodRealError=$constructor("$ZodError",initializer$1,{Parent:Error});function flattenError(e,t=n=>n.message){const n={},r=[];for(const o of e.issues)o.path.length>0?(n[o.path[0]]=n[o.path[0]]||[],n[o.path[0]].push(t(o))):r.push(t(o));return{formErrors:r,fieldErrors:n}}function formatError(e,t){const n=t||function(i){return i.message},r={_errors:[]},o=i=>{for(const s of i.issues)if(s.code==="invalid_union"&&s.errors.length)s.errors.map(a=>o({issues:a}));else if(s.code==="invalid_key")o({issues:s.issues});else if(s.code==="invalid_element")o({issues:s.issues});else if(s.path.length===0)r._errors.push(n(s));else{let a=r,l=0;for(;l<s.path.length;){const d=s.path[l];l===s.path.length-1?(a[d]=a[d]||{_errors:[]},a[d]._errors.push(n(s))):a[d]=a[d]||{_errors:[]},a=a[d],l++}}};return o(e),r}function toDotPath(e){const t=[];for(const n of e)typeof n=="number"?t.push(`[${n}]`):typeof n=="symbol"?t.push(`[${JSON.stringify(String(n))}]`):/[^\w$]/.test(n)?t.push(`[${JSON.stringify(n)}]`):(t.length&&t.push("."),t.push(n));return t.join("")}function prettifyError(e){var r;const t=[],n=[...e.issues].sort((o,i)=>o.path.length-i.path.length);for(const o of n)t.push(`✖ ${o.message}`),(r=o.path)!=null&&r.length&&t.push(`  → at ${toDotPath(o.path)}`);return t.join(`
`)}const _parse=e=>(t,n,r,o)=>{const i=r?Object.assign(r,{async:!1}):{async:!1},s=t._zod.run({value:n,issues:[]},i);if(s instanceof Promise)throw new $ZodAsyncError;if(s.issues.length){const a=new((o==null?void 0:o.Err)??e)(s.issues.map(l=>finalizeIssue(l,i,config())));throw captureStackTrace(a,o==null?void 0:o.callee),a}return s.value},_parseAsync=e=>async(t,n,r,o)=>{const i=r?Object.assign(r,{async:!0}):{async:!0};let s=t._zod.run({value:n,issues:[]},i);if(s instanceof Promise&&(s=await s),s.issues.length){const a=new((o==null?void 0:o.Err)??e)(s.issues.map(l=>finalizeIssue(l,i,config())));throw captureStackTrace(a,o==null?void 0:o.callee),a}return s.value},_safeParse=e=>(t,n,r)=>{const o=r?{...r,async:!1}:{async:!1},i=t._zod.run({value:n,issues:[]},o);if(i instanceof Promise)throw new $ZodAsyncError;return i.issues.length?{success:!1,error:new(e??$ZodError)(i.issues.map(s=>finalizeIssue(s,o,config())))}:{success:!0,data:i.value}},safeParse$1=_safeParse($ZodRealError),_safeParseAsync=e=>async(t,n,r)=>{const o=r?Object.assign(r,{async:!0}):{async:!0};let i=t._zod.run({value:n,issues:[]},o);return i instanceof Promise&&(i=await i),i.issues.length?{success:!1,error:new e(i.issues.map(s=>finalizeIssue(s,o,config())))}:{success:!0,data:i.value}},safeParseAsync$1=_safeParseAsync($ZodRealError),cuid=/^[cC][^\s-]{8,}$/,cuid2=/^[0-9a-z]+$/,ulid=/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,xid=/^[0-9a-vA-V]{20}$/,ksuid=/^[A-Za-z0-9]{27}$/,nanoid=/^[a-zA-Z0-9_-]{21}$/,duration$1=/^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,guid=/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,uuid=e=>e?new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`):/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,email=/^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,_emoji$1="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";function emoji(){return new RegExp(_emoji$1,"u")}const ipv4=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,ipv6=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/,cidrv4=/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,cidrv6=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,base64=/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,base64url=/^[A-Za-z0-9_-]*$/,hostname=/^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/,e164=/^\+(?:[0-9]){6,14}[0-9]$/,dateSource="(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",date$1=new RegExp(`^${dateSource}$`);function timeSource(e){const t="(?:[01]\\d|2[0-3]):[0-5]\\d";return typeof e.precision=="number"?e.precision===-1?`${t}`:e.precision===0?`${t}:[0-5]\\d`:`${t}:[0-5]\\d\\.\\d{${e.precision}}`:`${t}(?::[0-5]\\d(?:\\.\\d+)?)?`}function time$1(e){return new RegExp(`^${timeSource(e)}$`)}function datetime$1(e){const t=timeSource({precision:e.precision}),n=["Z"];e.local&&n.push(""),e.offset&&n.push("([+-]\\d{2}:\\d{2})");const r=`${t}(?:${n.join("|")})`;return new RegExp(`^${dateSource}T(?:${r})$`)}const string$1=e=>{const t=e?`[\\s\\S]{${(e==null?void 0:e.minimum)??0},${(e==null?void 0:e.maximum)??""}}`:"[\\s\\S]*";return new RegExp(`^${t}$`)},integer=/^\d+$/,number$1=/^-?\d+(?:\.\d+)?/i,boolean$1=/true|false/i,lowercase=/^[^A-Z]*$/,uppercase=/^[^a-z]*$/,$ZodCheck=$constructor("$ZodCheck",(e,t)=>{var n;e._zod??(e._zod={}),e._zod.def=t,(n=e._zod).onattach??(n.onattach=[])}),numericOriginMap={number:"number",bigint:"bigint",object:"date"},$ZodCheckLessThan=$constructor("$ZodCheckLessThan",(e,t)=>{$ZodCheck.init(e,t);const n=numericOriginMap[typeof t.value];e._zod.onattach.push(r=>{const o=r._zod.bag,i=(t.inclusive?o.maximum:o.exclusiveMaximum)??Number.POSITIVE_INFINITY;t.value<i&&(t.inclusive?o.maximum=t.value:o.exclusiveMaximum=t.value)}),e._zod.check=r=>{(t.inclusive?r.value<=t.value:r.value<t.value)||r.issues.push({origin:n,code:"too_big",maximum:t.value,input:r.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),$ZodCheckGreaterThan=$constructor("$ZodCheckGreaterThan",(e,t)=>{$ZodCheck.init(e,t);const n=numericOriginMap[typeof t.value];e._zod.onattach.push(r=>{const o=r._zod.bag,i=(t.inclusive?o.minimum:o.exclusiveMinimum)??Number.NEGATIVE_INFINITY;t.value>i&&(t.inclusive?o.minimum=t.value:o.exclusiveMinimum=t.value)}),e._zod.check=r=>{(t.inclusive?r.value>=t.value:r.value>t.value)||r.issues.push({origin:n,code:"too_small",minimum:t.value,input:r.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),$ZodCheckMultipleOf=$constructor("$ZodCheckMultipleOf",(e,t)=>{$ZodCheck.init(e,t),e._zod.onattach.push(n=>{var r;(r=n._zod.bag).multipleOf??(r.multipleOf=t.value)}),e._zod.check=n=>{if(typeof n.value!=typeof t.value)throw new Error("Cannot mix number and bigint in multiple_of check.");(typeof n.value=="bigint"?n.value%t.value===BigInt(0):floatSafeRemainder(n.value,t.value)===0)||n.issues.push({origin:typeof n.value,code:"not_multiple_of",divisor:t.value,input:n.value,inst:e,continue:!t.abort})}}),$ZodCheckNumberFormat=$constructor("$ZodCheckNumberFormat",(e,t)=>{var s;$ZodCheck.init(e,t),t.format=t.format||"float64";const n=(s=t.format)==null?void 0:s.includes("int"),r=n?"int":"number",[o,i]=NUMBER_FORMAT_RANGES[t.format];e._zod.onattach.push(a=>{const l=a._zod.bag;l.format=t.format,l.minimum=o,l.maximum=i,n&&(l.pattern=integer)}),e._zod.check=a=>{const l=a.value;if(n){if(!Number.isInteger(l)){a.issues.push({expected:r,format:t.format,code:"invalid_type",input:l,inst:e});return}if(!Number.isSafeInteger(l)){l>0?a.issues.push({input:l,code:"too_big",maximum:Number.MAX_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst:e,origin:r,continue:!t.abort}):a.issues.push({input:l,code:"too_small",minimum:Number.MIN_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst:e,origin:r,continue:!t.abort});return}}l<o&&a.issues.push({origin:"number",input:l,code:"too_small",minimum:o,inclusive:!0,inst:e,continue:!t.abort}),l>i&&a.issues.push({origin:"number",input:l,code:"too_big",maximum:i,inst:e})}}),$ZodCheckMaxLength=$constructor("$ZodCheckMaxLength",(e,t)=>{var n;$ZodCheck.init(e,t),(n=e._zod.def).when??(n.when=r=>{const o=r.value;return!nullish(o)&&o.length!==void 0}),e._zod.onattach.push(r=>{const o=r._zod.bag.maximum??Number.POSITIVE_INFINITY;t.maximum<o&&(r._zod.bag.maximum=t.maximum)}),e._zod.check=r=>{const o=r.value;if(o.length<=t.maximum)return;const s=getLengthableOrigin(o);r.issues.push({origin:s,code:"too_big",maximum:t.maximum,inclusive:!0,input:o,inst:e,continue:!t.abort})}}),$ZodCheckMinLength=$constructor("$ZodCheckMinLength",(e,t)=>{var n;$ZodCheck.init(e,t),(n=e._zod.def).when??(n.when=r=>{const o=r.value;return!nullish(o)&&o.length!==void 0}),e._zod.onattach.push(r=>{const o=r._zod.bag.minimum??Number.NEGATIVE_INFINITY;t.minimum>o&&(r._zod.bag.minimum=t.minimum)}),e._zod.check=r=>{const o=r.value;if(o.length>=t.minimum)return;const s=getLengthableOrigin(o);r.issues.push({origin:s,code:"too_small",minimum:t.minimum,inclusive:!0,input:o,inst:e,continue:!t.abort})}}),$ZodCheckLengthEquals=$constructor("$ZodCheckLengthEquals",(e,t)=>{var n;$ZodCheck.init(e,t),(n=e._zod.def).when??(n.when=r=>{const o=r.value;return!nullish(o)&&o.length!==void 0}),e._zod.onattach.push(r=>{const o=r._zod.bag;o.minimum=t.length,o.maximum=t.length,o.length=t.length}),e._zod.check=r=>{const o=r.value,i=o.length;if(i===t.length)return;const s=getLengthableOrigin(o),a=i>t.length;r.issues.push({origin:s,...a?{code:"too_big",maximum:t.length}:{code:"too_small",minimum:t.length},inclusive:!0,exact:!0,input:r.value,inst:e,continue:!t.abort})}}),$ZodCheckStringFormat=$constructor("$ZodCheckStringFormat",(e,t)=>{var n,r;$ZodCheck.init(e,t),e._zod.onattach.push(o=>{const i=o._zod.bag;i.format=t.format,t.pattern&&(i.patterns??(i.patterns=new Set),i.patterns.add(t.pattern))}),t.pattern?(n=e._zod).check??(n.check=o=>{t.pattern.lastIndex=0,!t.pattern.test(o.value)&&o.issues.push({origin:"string",code:"invalid_format",format:t.format,input:o.value,...t.pattern?{pattern:t.pattern.toString()}:{},inst:e,continue:!t.abort})}):(r=e._zod).check??(r.check=()=>{})}),$ZodCheckRegex=$constructor("$ZodCheckRegex",(e,t)=>{$ZodCheckStringFormat.init(e,t),e._zod.check=n=>{t.pattern.lastIndex=0,!t.pattern.test(n.value)&&n.issues.push({origin:"string",code:"invalid_format",format:"regex",input:n.value,pattern:t.pattern.toString(),inst:e,continue:!t.abort})}}),$ZodCheckLowerCase=$constructor("$ZodCheckLowerCase",(e,t)=>{t.pattern??(t.pattern=lowercase),$ZodCheckStringFormat.init(e,t)}),$ZodCheckUpperCase=$constructor("$ZodCheckUpperCase",(e,t)=>{t.pattern??(t.pattern=uppercase),$ZodCheckStringFormat.init(e,t)}),$ZodCheckIncludes=$constructor("$ZodCheckIncludes",(e,t)=>{$ZodCheck.init(e,t);const n=escapeRegex(t.includes),r=new RegExp(typeof t.position=="number"?`^.{${t.position}}${n}`:n);t.pattern=r,e._zod.onattach.push(o=>{const i=o._zod.bag;i.patterns??(i.patterns=new Set),i.patterns.add(r)}),e._zod.check=o=>{o.value.includes(t.includes,t.position)||o.issues.push({origin:"string",code:"invalid_format",format:"includes",includes:t.includes,input:o.value,inst:e,continue:!t.abort})}}),$ZodCheckStartsWith=$constructor("$ZodCheckStartsWith",(e,t)=>{$ZodCheck.init(e,t);const n=new RegExp(`^${escapeRegex(t.prefix)}.*`);t.pattern??(t.pattern=n),e._zod.onattach.push(r=>{const o=r._zod.bag;o.patterns??(o.patterns=new Set),o.patterns.add(n)}),e._zod.check=r=>{r.value.startsWith(t.prefix)||r.issues.push({origin:"string",code:"invalid_format",format:"starts_with",prefix:t.prefix,input:r.value,inst:e,continue:!t.abort})}}),$ZodCheckEndsWith=$constructor("$ZodCheckEndsWith",(e,t)=>{$ZodCheck.init(e,t);const n=new RegExp(`.*${escapeRegex(t.suffix)}$`);t.pattern??(t.pattern=n),e._zod.onattach.push(r=>{const o=r._zod.bag;o.patterns??(o.patterns=new Set),o.patterns.add(n)}),e._zod.check=r=>{r.value.endsWith(t.suffix)||r.issues.push({origin:"string",code:"invalid_format",format:"ends_with",suffix:t.suffix,input:r.value,inst:e,continue:!t.abort})}}),$ZodCheckOverwrite=$constructor("$ZodCheckOverwrite",(e,t)=>{$ZodCheck.init(e,t),e._zod.check=n=>{n.value=t.tx(n.value)}});class Doc{constructor(t=[]){this.content=[],this.indent=0,this&&(this.args=t)}indented(t){this.indent+=1,t(this),this.indent-=1}write(t){if(typeof t=="function"){t(this,{execution:"sync"}),t(this,{execution:"async"});return}const r=t.split(`
`).filter(s=>s),o=Math.min(...r.map(s=>s.length-s.trimStart().length)),i=r.map(s=>s.slice(o)).map(s=>" ".repeat(this.indent*2)+s);for(const s of i)this.content.push(s)}compile(){const t=Function,n=this==null?void 0:this.args,o=[...((this==null?void 0:this.content)??[""]).map(i=>`  ${i}`)];return new t(...n,o.join(`
`))}}const version={major:4,minor:0,patch:0},$ZodType=$constructor("$ZodType",(e,t)=>{var o;var n;e??(e={}),e._zod.def=t,e._zod.bag=e._zod.bag||{},e._zod.version=version;const r=[...e._zod.def.checks??[]];e._zod.traits.has("$ZodCheck")&&r.unshift(e);for(const i of r)for(const s of i._zod.onattach)s(e);if(r.length===0)(n=e._zod).deferred??(n.deferred=[]),(o=e._zod.deferred)==null||o.push(()=>{e._zod.run=e._zod.parse});else{const i=(s,a,l)=>{let d=aborted(s),m;for(const w of a){if(w._zod.def.when){if(!w._zod.def.when(s))continue}else if(d)continue;const h=s.issues.length,b=w._zod.check(s);if(b instanceof Promise&&(l==null?void 0:l.async)===!1)throw new $ZodAsyncError;if(m||b instanceof Promise)m=(m??Promise.resolve()).then(async()=>{await b,s.issues.length!==h&&(d||(d=aborted(s,h)))});else{if(s.issues.length===h)continue;d||(d=aborted(s,h))}}return m?m.then(()=>s):s};e._zod.run=(s,a)=>{const l=e._zod.parse(s,a);if(l instanceof Promise){if(a.async===!1)throw new $ZodAsyncError;return l.then(d=>i(d,r,a))}return i(l,r,a)}}e["~standard"]={validate:i=>{var s;try{const a=safeParse$1(e,i);return a.success?{value:a.data}:{issues:(s=a.error)==null?void 0:s.issues}}catch{return safeParseAsync$1(e,i).then(l=>{var d;return l.success?{value:l.data}:{issues:(d=l.error)==null?void 0:d.issues}})}},vendor:"zod",version:1}}),$ZodString=$constructor("$ZodString",(e,t)=>{var n;$ZodType.init(e,t),e._zod.pattern=[...((n=e==null?void 0:e._zod.bag)==null?void 0:n.patterns)??[]].pop()??string$1(e._zod.bag),e._zod.parse=(r,o)=>{if(t.coerce)try{r.value=String(r.value)}catch{}return typeof r.value=="string"||r.issues.push({expected:"string",code:"invalid_type",input:r.value,inst:e}),r}}),$ZodStringFormat=$constructor("$ZodStringFormat",(e,t)=>{$ZodCheckStringFormat.init(e,t),$ZodString.init(e,t)}),$ZodGUID=$constructor("$ZodGUID",(e,t)=>{t.pattern??(t.pattern=guid),$ZodStringFormat.init(e,t)}),$ZodUUID=$constructor("$ZodUUID",(e,t)=>{if(t.version){const r={v1:1,v2:2,v3:3,v4:4,v5:5,v6:6,v7:7,v8:8}[t.version];if(r===void 0)throw new Error(`Invalid UUID version: "${t.version}"`);t.pattern??(t.pattern=uuid(r))}else t.pattern??(t.pattern=uuid());$ZodStringFormat.init(e,t)}),$ZodEmail=$constructor("$ZodEmail",(e,t)=>{t.pattern??(t.pattern=email),$ZodStringFormat.init(e,t)}),$ZodURL=$constructor("$ZodURL",(e,t)=>{$ZodStringFormat.init(e,t),e._zod.check=n=>{try{const r=n.value,o=new URL(r),i=o.href;t.hostname&&(t.hostname.lastIndex=0,t.hostname.test(o.hostname)||n.issues.push({code:"invalid_format",format:"url",note:"Invalid hostname",pattern:hostname.source,input:n.value,inst:e,continue:!t.abort})),t.protocol&&(t.protocol.lastIndex=0,t.protocol.test(o.protocol.endsWith(":")?o.protocol.slice(0,-1):o.protocol)||n.issues.push({code:"invalid_format",format:"url",note:"Invalid protocol",pattern:t.protocol.source,input:n.value,inst:e,continue:!t.abort})),!r.endsWith("/")&&i.endsWith("/")?n.value=i.slice(0,-1):n.value=i;return}catch{n.issues.push({code:"invalid_format",format:"url",input:n.value,inst:e,continue:!t.abort})}}}),$ZodEmoji=$constructor("$ZodEmoji",(e,t)=>{t.pattern??(t.pattern=emoji()),$ZodStringFormat.init(e,t)}),$ZodNanoID=$constructor("$ZodNanoID",(e,t)=>{t.pattern??(t.pattern=nanoid),$ZodStringFormat.init(e,t)}),$ZodCUID=$constructor("$ZodCUID",(e,t)=>{t.pattern??(t.pattern=cuid),$ZodStringFormat.init(e,t)}),$ZodCUID2=$constructor("$ZodCUID2",(e,t)=>{t.pattern??(t.pattern=cuid2),$ZodStringFormat.init(e,t)}),$ZodULID=$constructor("$ZodULID",(e,t)=>{t.pattern??(t.pattern=ulid),$ZodStringFormat.init(e,t)}),$ZodXID=$constructor("$ZodXID",(e,t)=>{t.pattern??(t.pattern=xid),$ZodStringFormat.init(e,t)}),$ZodKSUID=$constructor("$ZodKSUID",(e,t)=>{t.pattern??(t.pattern=ksuid),$ZodStringFormat.init(e,t)}),$ZodISODateTime=$constructor("$ZodISODateTime",(e,t)=>{t.pattern??(t.pattern=datetime$1(t)),$ZodStringFormat.init(e,t)}),$ZodISODate=$constructor("$ZodISODate",(e,t)=>{t.pattern??(t.pattern=date$1),$ZodStringFormat.init(e,t)}),$ZodISOTime=$constructor("$ZodISOTime",(e,t)=>{t.pattern??(t.pattern=time$1(t)),$ZodStringFormat.init(e,t)}),$ZodISODuration=$constructor("$ZodISODuration",(e,t)=>{t.pattern??(t.pattern=duration$1),$ZodStringFormat.init(e,t)}),$ZodIPv4=$constructor("$ZodIPv4",(e,t)=>{t.pattern??(t.pattern=ipv4),$ZodStringFormat.init(e,t),e._zod.onattach.push(n=>{const r=n._zod.bag;r.format="ipv4"})}),$ZodIPv6=$constructor("$ZodIPv6",(e,t)=>{t.pattern??(t.pattern=ipv6),$ZodStringFormat.init(e,t),e._zod.onattach.push(n=>{const r=n._zod.bag;r.format="ipv6"}),e._zod.check=n=>{try{new URL(`http://[${n.value}]`)}catch{n.issues.push({code:"invalid_format",format:"ipv6",input:n.value,inst:e,continue:!t.abort})}}}),$ZodCIDRv4=$constructor("$ZodCIDRv4",(e,t)=>{t.pattern??(t.pattern=cidrv4),$ZodStringFormat.init(e,t)}),$ZodCIDRv6=$constructor("$ZodCIDRv6",(e,t)=>{t.pattern??(t.pattern=cidrv6),$ZodStringFormat.init(e,t),e._zod.check=n=>{const[r,o]=n.value.split("/");try{if(!o)throw new Error;const i=Number(o);if(`${i}`!==o)throw new Error;if(i<0||i>128)throw new Error;new URL(`http://[${r}]`)}catch{n.issues.push({code:"invalid_format",format:"cidrv6",input:n.value,inst:e,continue:!t.abort})}}});function isValidBase64(e){if(e==="")return!0;if(e.length%4!==0)return!1;try{return atob(e),!0}catch{return!1}}const $ZodBase64=$constructor("$ZodBase64",(e,t)=>{t.pattern??(t.pattern=base64),$ZodStringFormat.init(e,t),e._zod.onattach.push(n=>{n._zod.bag.contentEncoding="base64"}),e._zod.check=n=>{isValidBase64(n.value)||n.issues.push({code:"invalid_format",format:"base64",input:n.value,inst:e,continue:!t.abort})}});function isValidBase64URL(e){if(!base64url.test(e))return!1;const t=e.replace(/[-_]/g,r=>r==="-"?"+":"/"),n=t.padEnd(Math.ceil(t.length/4)*4,"=");return isValidBase64(n)}const $ZodBase64URL=$constructor("$ZodBase64URL",(e,t)=>{t.pattern??(t.pattern=base64url),$ZodStringFormat.init(e,t),e._zod.onattach.push(n=>{n._zod.bag.contentEncoding="base64url"}),e._zod.check=n=>{isValidBase64URL(n.value)||n.issues.push({code:"invalid_format",format:"base64url",input:n.value,inst:e,continue:!t.abort})}}),$ZodE164=$constructor("$ZodE164",(e,t)=>{t.pattern??(t.pattern=e164),$ZodStringFormat.init(e,t)});function isValidJWT(e,t=null){try{const n=e.split(".");if(n.length!==3)return!1;const[r]=n;if(!r)return!1;const o=JSON.parse(atob(r));return!("typ"in o&&(o==null?void 0:o.typ)!=="JWT"||!o.alg||t&&(!("alg"in o)||o.alg!==t))}catch{return!1}}const $ZodJWT=$constructor("$ZodJWT",(e,t)=>{$ZodStringFormat.init(e,t),e._zod.check=n=>{isValidJWT(n.value,t.alg)||n.issues.push({code:"invalid_format",format:"jwt",input:n.value,inst:e,continue:!t.abort})}}),$ZodNumber=$constructor("$ZodNumber",(e,t)=>{$ZodType.init(e,t),e._zod.pattern=e._zod.bag.pattern??number$1,e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=Number(n.value)}catch{}const o=n.value;if(typeof o=="number"&&!Number.isNaN(o)&&Number.isFinite(o))return n;const i=typeof o=="number"?Number.isNaN(o)?"NaN":Number.isFinite(o)?void 0:"Infinity":void 0;return n.issues.push({expected:"number",code:"invalid_type",input:o,inst:e,...i?{received:i}:{}}),n}}),$ZodNumberFormat=$constructor("$ZodNumber",(e,t)=>{$ZodCheckNumberFormat.init(e,t),$ZodNumber.init(e,t)}),$ZodBoolean=$constructor("$ZodBoolean",(e,t)=>{$ZodType.init(e,t),e._zod.pattern=boolean$1,e._zod.parse=(n,r)=>{if(t.coerce)try{n.value=!!n.value}catch{}const o=n.value;return typeof o=="boolean"||n.issues.push({expected:"boolean",code:"invalid_type",input:o,inst:e}),n}}),$ZodUnknown=$constructor("$ZodUnknown",(e,t)=>{$ZodType.init(e,t),e._zod.parse=n=>n}),$ZodNever=$constructor("$ZodNever",(e,t)=>{$ZodType.init(e,t),e._zod.parse=(n,r)=>(n.issues.push({expected:"never",code:"invalid_type",input:n.value,inst:e}),n)});function handleArrayResult(e,t,n){e.issues.length&&t.issues.push(...prefixIssues(n,e.issues)),t.value[n]=e.value}const $ZodArray=$constructor("$ZodArray",(e,t)=>{$ZodType.init(e,t),e._zod.parse=(n,r)=>{const o=n.value;if(!Array.isArray(o))return n.issues.push({expected:"array",code:"invalid_type",input:o,inst:e}),n;n.value=Array(o.length);const i=[];for(let s=0;s<o.length;s++){const a=o[s],l=t.element._zod.run({value:a,issues:[]},r);l instanceof Promise?i.push(l.then(d=>handleArrayResult(d,n,s))):handleArrayResult(l,n,s)}return i.length?Promise.all(i).then(()=>n):n}});function handleObjectResult(e,t,n){e.issues.length&&t.issues.push(...prefixIssues(n,e.issues)),t.value[n]=e.value}function handleOptionalObjectResult(e,t,n,r){e.issues.length?r[n]===void 0?n in r?t.value[n]=void 0:t.value[n]=e.value:t.issues.push(...prefixIssues(n,e.issues)):e.value===void 0?n in r&&(t.value[n]=void 0):t.value[n]=e.value}const $ZodObject=$constructor("$ZodObject",(e,t)=>{$ZodType.init(e,t);const n=cached(()=>{const w=Object.keys(t.shape);for(const b of w)if(!(t.shape[b]instanceof $ZodType))throw new Error(`Invalid element at key "${b}": expected a Zod schema`);const h=optionalKeys(t.shape);return{shape:t.shape,keys:w,keySet:new Set(w),numKeys:w.length,optionalKeys:new Set(h)}});defineLazy(e._zod,"propValues",()=>{const w=t.shape,h={};for(const b in w){const _=w[b]._zod;if(_.values){h[b]??(h[b]=new Set);for(const S of _.values)h[b].add(S)}}return h});const r=w=>{const h=new Doc(["shape","payload","ctx"]),b=n.value,_=p=>{const f=esc(p);return`shape[${f}]._zod.run({ value: input[${f}], issues: [] }, ctx)`};h.write("const input = payload.value;");const S=Object.create(null);let v=0;for(const p of b.keys)S[p]=`key_${v++}`;h.write("const newResult = {}");for(const p of b.keys)if(b.optionalKeys.has(p)){const f=S[p];h.write(`const ${f} = ${_(p)};`);const y=esc(p);h.write(`
        if (${f}.issues.length) {
          if (input[${y}] === undefined) {
            if (${y} in input) {
              newResult[${y}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${f}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${y}, ...iss.path] : [${y}],
              }))
            );
          }
        } else if (${f}.value === undefined) {
          if (${y} in input) newResult[${y}] = undefined;
        } else {
          newResult[${y}] = ${f}.value;
        }
        `)}else{const f=S[p];h.write(`const ${f} = ${_(p)};`),h.write(`
          if (${f}.issues.length) payload.issues = payload.issues.concat(${f}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc(p)}, ...iss.path] : [${esc(p)}]
          })));`),h.write(`newResult[${esc(p)}] = ${f}.value`)}h.write("payload.value = newResult;"),h.write("return payload;");const u=h.compile();return(p,f)=>u(w,p,f)};let o;const i=isObject,s=!globalConfig.jitless,l=s&&allowsEval.value,d=t.catchall;let m;e._zod.parse=(w,h)=>{m??(m=n.value);const b=w.value;if(!i(b))return w.issues.push({expected:"object",code:"invalid_type",input:b,inst:e}),w;const _=[];if(s&&l&&(h==null?void 0:h.async)===!1&&h.jitless!==!0)o||(o=r(t.shape)),w=o(w,h);else{w.value={};const f=m.shape;for(const y of m.keys){const $=f[y],E=$._zod.run({value:b[y],issues:[]},h),z=$._zod.optin==="optional"&&$._zod.optout==="optional";E instanceof Promise?_.push(E.then(N=>z?handleOptionalObjectResult(N,w,y,b):handleObjectResult(N,w,y))):z?handleOptionalObjectResult(E,w,y,b):handleObjectResult(E,w,y)}}if(!d)return _.length?Promise.all(_).then(()=>w):w;const S=[],v=m.keySet,u=d._zod,p=u.def.type;for(const f of Object.keys(b)){if(v.has(f))continue;if(p==="never"){S.push(f);continue}const y=u.run({value:b[f],issues:[]},h);y instanceof Promise?_.push(y.then($=>handleObjectResult($,w,f))):handleObjectResult(y,w,f)}return S.length&&w.issues.push({code:"unrecognized_keys",keys:S,input:b,inst:e}),_.length?Promise.all(_).then(()=>w):w}});function handleUnionResults(e,t,n,r){for(const o of e)if(o.issues.length===0)return t.value=o.value,t;return t.issues.push({code:"invalid_union",input:t.value,inst:n,errors:e.map(o=>o.issues.map(i=>finalizeIssue(i,r,config())))}),t}const $ZodUnion=$constructor("$ZodUnion",(e,t)=>{$ZodType.init(e,t),defineLazy(e._zod,"optin",()=>t.options.some(n=>n._zod.optin==="optional")?"optional":void 0),defineLazy(e._zod,"optout",()=>t.options.some(n=>n._zod.optout==="optional")?"optional":void 0),defineLazy(e._zod,"values",()=>{if(t.options.every(n=>n._zod.values))return new Set(t.options.flatMap(n=>Array.from(n._zod.values)))}),defineLazy(e._zod,"pattern",()=>{if(t.options.every(n=>n._zod.pattern)){const n=t.options.map(r=>r._zod.pattern);return new RegExp(`^(${n.map(r=>cleanRegex(r.source)).join("|")})$`)}}),e._zod.parse=(n,r)=>{let o=!1;const i=[];for(const s of t.options){const a=s._zod.run({value:n.value,issues:[]},r);if(a instanceof Promise)i.push(a),o=!0;else{if(a.issues.length===0)return a;i.push(a)}}return o?Promise.all(i).then(s=>handleUnionResults(s,n,e,r)):handleUnionResults(i,n,e,r)}}),$ZodIntersection=$constructor("$ZodIntersection",(e,t)=>{$ZodType.init(e,t),e._zod.parse=(n,r)=>{const o=n.value,i=t.left._zod.run({value:o,issues:[]},r),s=t.right._zod.run({value:o,issues:[]},r);return i instanceof Promise||s instanceof Promise?Promise.all([i,s]).then(([l,d])=>handleIntersectionResults(n,l,d)):handleIntersectionResults(n,i,s)}});function mergeValues(e,t){if(e===t)return{valid:!0,data:e};if(e instanceof Date&&t instanceof Date&&+e==+t)return{valid:!0,data:e};if(isPlainObject(e)&&isPlainObject(t)){const n=Object.keys(t),r=Object.keys(e).filter(i=>n.indexOf(i)!==-1),o={...e,...t};for(const i of r){const s=mergeValues(e[i],t[i]);if(!s.valid)return{valid:!1,mergeErrorPath:[i,...s.mergeErrorPath]};o[i]=s.data}return{valid:!0,data:o}}if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return{valid:!1,mergeErrorPath:[]};const n=[];for(let r=0;r<e.length;r++){const o=e[r],i=t[r],s=mergeValues(o,i);if(!s.valid)return{valid:!1,mergeErrorPath:[r,...s.mergeErrorPath]};n.push(s.data)}return{valid:!0,data:n}}return{valid:!1,mergeErrorPath:[]}}function handleIntersectionResults(e,t,n){if(t.issues.length&&e.issues.push(...t.issues),n.issues.length&&e.issues.push(...n.issues),aborted(e))return e;const r=mergeValues(t.value,n.value);if(!r.valid)throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(r.mergeErrorPath)}`);return e.value=r.data,e}const $ZodEnum=$constructor("$ZodEnum",(e,t)=>{$ZodType.init(e,t);const n=getEnumValues(t.entries);e._zod.values=new Set(n),e._zod.pattern=new RegExp(`^(${n.filter(r=>propertyKeyTypes.has(typeof r)).map(r=>typeof r=="string"?escapeRegex(r):r.toString()).join("|")})$`),e._zod.parse=(r,o)=>{const i=r.value;return e._zod.values.has(i)||r.issues.push({code:"invalid_value",values:n,input:i,inst:e}),r}}),$ZodTransform=$constructor("$ZodTransform",(e,t)=>{$ZodType.init(e,t),e._zod.parse=(n,r)=>{const o=t.transform(n.value,n);if(r.async)return(o instanceof Promise?o:Promise.resolve(o)).then(s=>(n.value=s,n));if(o instanceof Promise)throw new $ZodAsyncError;return n.value=o,n}}),$ZodOptional=$constructor("$ZodOptional",(e,t)=>{$ZodType.init(e,t),e._zod.optin="optional",e._zod.optout="optional",defineLazy(e._zod,"values",()=>t.innerType._zod.values?new Set([...t.innerType._zod.values,void 0]):void 0),defineLazy(e._zod,"pattern",()=>{const n=t.innerType._zod.pattern;return n?new RegExp(`^(${cleanRegex(n.source)})?$`):void 0}),e._zod.parse=(n,r)=>t.innerType._zod.optin==="optional"?t.innerType._zod.run(n,r):n.value===void 0?n:t.innerType._zod.run(n,r)}),$ZodNullable=$constructor("$ZodNullable",(e,t)=>{$ZodType.init(e,t),defineLazy(e._zod,"optin",()=>t.innerType._zod.optin),defineLazy(e._zod,"optout",()=>t.innerType._zod.optout),defineLazy(e._zod,"pattern",()=>{const n=t.innerType._zod.pattern;return n?new RegExp(`^(${cleanRegex(n.source)}|null)$`):void 0}),defineLazy(e._zod,"values",()=>t.innerType._zod.values?new Set([...t.innerType._zod.values,null]):void 0),e._zod.parse=(n,r)=>n.value===null?n:t.innerType._zod.run(n,r)}),$ZodDefault=$constructor("$ZodDefault",(e,t)=>{$ZodType.init(e,t),e._zod.optin="optional",defineLazy(e._zod,"values",()=>t.innerType._zod.values),e._zod.parse=(n,r)=>{if(n.value===void 0)return n.value=t.defaultValue,n;const o=t.innerType._zod.run(n,r);return o instanceof Promise?o.then(i=>handleDefaultResult(i,t)):handleDefaultResult(o,t)}});function handleDefaultResult(e,t){return e.value===void 0&&(e.value=t.defaultValue),e}const $ZodPrefault=$constructor("$ZodPrefault",(e,t)=>{$ZodType.init(e,t),e._zod.optin="optional",defineLazy(e._zod,"values",()=>t.innerType._zod.values),e._zod.parse=(n,r)=>(n.value===void 0&&(n.value=t.defaultValue),t.innerType._zod.run(n,r))}),$ZodNonOptional=$constructor("$ZodNonOptional",(e,t)=>{$ZodType.init(e,t),defineLazy(e._zod,"values",()=>{const n=t.innerType._zod.values;return n?new Set([...n].filter(r=>r!==void 0)):void 0}),e._zod.parse=(n,r)=>{const o=t.innerType._zod.run(n,r);return o instanceof Promise?o.then(i=>handleNonOptionalResult(i,e)):handleNonOptionalResult(o,e)}});function handleNonOptionalResult(e,t){return!e.issues.length&&e.value===void 0&&e.issues.push({code:"invalid_type",expected:"nonoptional",input:e.value,inst:t}),e}const $ZodCatch=$constructor("$ZodCatch",(e,t)=>{$ZodType.init(e,t),e._zod.optin="optional",defineLazy(e._zod,"optout",()=>t.innerType._zod.optout),defineLazy(e._zod,"values",()=>t.innerType._zod.values),e._zod.parse=(n,r)=>{const o=t.innerType._zod.run(n,r);return o instanceof Promise?o.then(i=>(n.value=i.value,i.issues.length&&(n.value=t.catchValue({...n,error:{issues:i.issues.map(s=>finalizeIssue(s,r,config()))},input:n.value}),n.issues=[]),n)):(n.value=o.value,o.issues.length&&(n.value=t.catchValue({...n,error:{issues:o.issues.map(i=>finalizeIssue(i,r,config()))},input:n.value}),n.issues=[]),n)}}),$ZodPipe=$constructor("$ZodPipe",(e,t)=>{$ZodType.init(e,t),defineLazy(e._zod,"values",()=>t.in._zod.values),defineLazy(e._zod,"optin",()=>t.in._zod.optin),defineLazy(e._zod,"optout",()=>t.out._zod.optout),e._zod.parse=(n,r)=>{const o=t.in._zod.run(n,r);return o instanceof Promise?o.then(i=>handlePipeResult(i,t,r)):handlePipeResult(o,t,r)}});function handlePipeResult(e,t,n){return aborted(e)?e:t.out._zod.run({value:e.value,issues:e.issues},n)}const $ZodReadonly=$constructor("$ZodReadonly",(e,t)=>{$ZodType.init(e,t),defineLazy(e._zod,"propValues",()=>t.innerType._zod.propValues),defineLazy(e._zod,"values",()=>t.innerType._zod.values),defineLazy(e._zod,"optin",()=>t.innerType._zod.optin),defineLazy(e._zod,"optout",()=>t.innerType._zod.optout),e._zod.parse=(n,r)=>{const o=t.innerType._zod.run(n,r);return o instanceof Promise?o.then(handleReadonlyResult):handleReadonlyResult(o)}});function handleReadonlyResult(e){return e.value=Object.freeze(e.value),e}const $ZodCustom=$constructor("$ZodCustom",(e,t)=>{$ZodCheck.init(e,t),$ZodType.init(e,t),e._zod.parse=(n,r)=>n,e._zod.check=n=>{const r=n.value,o=t.fn(r);if(o instanceof Promise)return o.then(i=>handleRefineResult(i,n,r,e));handleRefineResult(o,n,r,e)}});function handleRefineResult(e,t,n,r){if(!e){const o={code:"custom",input:n,inst:r,path:[...r._zod.def.path??[]],continue:!r._zod.def.abort};r._zod.def.params&&(o.params=r._zod.def.params),t.issues.push(issue(o))}}class $ZodRegistry{constructor(){this._map=new Map,this._idmap=new Map}add(t,...n){const r=n[0];if(this._map.set(t,r),r&&typeof r=="object"&&"id"in r){if(this._idmap.has(r.id))throw new Error(`ID ${r.id} already exists in the registry`);this._idmap.set(r.id,t)}return this}clear(){return this._map=new Map,this._idmap=new Map,this}remove(t){const n=this._map.get(t);return n&&typeof n=="object"&&"id"in n&&this._idmap.delete(n.id),this._map.delete(t),this}get(t){const n=t._zod.parent;if(n){const r={...this.get(n)??{}};return delete r.id,{...r,...this._map.get(t)}}return this._map.get(t)}has(t){return this._map.has(t)}}function registry(){return new $ZodRegistry}const globalRegistry=registry();function _string(e,t){return new e({type:"string",...normalizeParams(t)})}function _email(e,t){return new e({type:"string",format:"email",check:"string_format",abort:!1,...normalizeParams(t)})}function _guid(e,t){return new e({type:"string",format:"guid",check:"string_format",abort:!1,...normalizeParams(t)})}function _uuid(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,...normalizeParams(t)})}function _uuidv4(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v4",...normalizeParams(t)})}function _uuidv6(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v6",...normalizeParams(t)})}function _uuidv7(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v7",...normalizeParams(t)})}function _url(e,t){return new e({type:"string",format:"url",check:"string_format",abort:!1,...normalizeParams(t)})}function _emoji(e,t){return new e({type:"string",format:"emoji",check:"string_format",abort:!1,...normalizeParams(t)})}function _nanoid(e,t){return new e({type:"string",format:"nanoid",check:"string_format",abort:!1,...normalizeParams(t)})}function _cuid(e,t){return new e({type:"string",format:"cuid",check:"string_format",abort:!1,...normalizeParams(t)})}function _cuid2(e,t){return new e({type:"string",format:"cuid2",check:"string_format",abort:!1,...normalizeParams(t)})}function _ulid(e,t){return new e({type:"string",format:"ulid",check:"string_format",abort:!1,...normalizeParams(t)})}function _xid(e,t){return new e({type:"string",format:"xid",check:"string_format",abort:!1,...normalizeParams(t)})}function _ksuid(e,t){return new e({type:"string",format:"ksuid",check:"string_format",abort:!1,...normalizeParams(t)})}function _ipv4(e,t){return new e({type:"string",format:"ipv4",check:"string_format",abort:!1,...normalizeParams(t)})}function _ipv6(e,t){return new e({type:"string",format:"ipv6",check:"string_format",abort:!1,...normalizeParams(t)})}function _cidrv4(e,t){return new e({type:"string",format:"cidrv4",check:"string_format",abort:!1,...normalizeParams(t)})}function _cidrv6(e,t){return new e({type:"string",format:"cidrv6",check:"string_format",abort:!1,...normalizeParams(t)})}function _base64(e,t){return new e({type:"string",format:"base64",check:"string_format",abort:!1,...normalizeParams(t)})}function _base64url(e,t){return new e({type:"string",format:"base64url",check:"string_format",abort:!1,...normalizeParams(t)})}function _e164(e,t){return new e({type:"string",format:"e164",check:"string_format",abort:!1,...normalizeParams(t)})}function _jwt(e,t){return new e({type:"string",format:"jwt",check:"string_format",abort:!1,...normalizeParams(t)})}function _isoDateTime(e,t){return new e({type:"string",format:"datetime",check:"string_format",offset:!1,local:!1,precision:null,...normalizeParams(t)})}function _isoDate(e,t){return new e({type:"string",format:"date",check:"string_format",...normalizeParams(t)})}function _isoTime(e,t){return new e({type:"string",format:"time",check:"string_format",precision:null,...normalizeParams(t)})}function _isoDuration(e,t){return new e({type:"string",format:"duration",check:"string_format",...normalizeParams(t)})}function _number(e,t){return new e({type:"number",checks:[],...normalizeParams(t)})}function _int(e,t){return new e({type:"number",check:"number_format",abort:!1,format:"safeint",...normalizeParams(t)})}function _boolean(e,t){return new e({type:"boolean",...normalizeParams(t)})}function _unknown(e){return new e({type:"unknown"})}function _never(e,t){return new e({type:"never",...normalizeParams(t)})}function _lt(e,t){return new $ZodCheckLessThan({check:"less_than",...normalizeParams(t),value:e,inclusive:!1})}function _lte(e,t){return new $ZodCheckLessThan({check:"less_than",...normalizeParams(t),value:e,inclusive:!0})}function _gt(e,t){return new $ZodCheckGreaterThan({check:"greater_than",...normalizeParams(t),value:e,inclusive:!1})}function _gte(e,t){return new $ZodCheckGreaterThan({check:"greater_than",...normalizeParams(t),value:e,inclusive:!0})}function _multipleOf(e,t){return new $ZodCheckMultipleOf({check:"multiple_of",...normalizeParams(t),value:e})}function _maxLength(e,t){return new $ZodCheckMaxLength({check:"max_length",...normalizeParams(t),maximum:e})}function _minLength(e,t){return new $ZodCheckMinLength({check:"min_length",...normalizeParams(t),minimum:e})}function _length(e,t){return new $ZodCheckLengthEquals({check:"length_equals",...normalizeParams(t),length:e})}function _regex(e,t){return new $ZodCheckRegex({check:"string_format",format:"regex",...normalizeParams(t),pattern:e})}function _lowercase(e){return new $ZodCheckLowerCase({check:"string_format",format:"lowercase",...normalizeParams(e)})}function _uppercase(e){return new $ZodCheckUpperCase({check:"string_format",format:"uppercase",...normalizeParams(e)})}function _includes(e,t){return new $ZodCheckIncludes({check:"string_format",format:"includes",...normalizeParams(t),includes:e})}function _startsWith(e,t){return new $ZodCheckStartsWith({check:"string_format",format:"starts_with",...normalizeParams(t),prefix:e})}function _endsWith(e,t){return new $ZodCheckEndsWith({check:"string_format",format:"ends_with",...normalizeParams(t),suffix:e})}function _overwrite(e){return new $ZodCheckOverwrite({check:"overwrite",tx:e})}function _normalize(e){return _overwrite(t=>t.normalize(e))}function _trim(){return _overwrite(e=>e.trim())}function _toLowerCase(){return _overwrite(e=>e.toLowerCase())}function _toUpperCase(){return _overwrite(e=>e.toUpperCase())}function _array(e,t,n){return new e({type:"array",element:t,...normalizeParams(n)})}function _refine(e,t,n){return new e({type:"custom",check:"custom",fn:t,...normalizeParams(n)})}class JSONSchemaGenerator{constructor(t){this.counter=0,this.metadataRegistry=(t==null?void 0:t.metadata)??globalRegistry,this.target=(t==null?void 0:t.target)??"draft-2020-12",this.unrepresentable=(t==null?void 0:t.unrepresentable)??"throw",this.override=(t==null?void 0:t.override)??(()=>{}),this.io=(t==null?void 0:t.io)??"output",this.seen=new Map}process(t,n={path:[],schemaPath:[]}){var w,h,b;var r;const o=t._zod.def,i={guid:"uuid",url:"uri",datetime:"date-time",json_string:"json-string",regex:""},s=this.seen.get(t);if(s)return s.count++,n.schemaPath.includes(t)&&(s.cycle=n.path),s.schema;const a={schema:{},count:1,cycle:void 0,path:n.path};this.seen.set(t,a);const l=(h=(w=t._zod).toJSONSchema)==null?void 0:h.call(w);if(l)a.schema=l;else{const _={...n,schemaPath:[...n.schemaPath,t],path:n.path},S=t._zod.parent;if(S)a.ref=S,this.process(S,_),this.seen.get(S).isParent=!0;else{const v=a.schema;switch(o.type){case"string":{const u=v;u.type="string";const{minimum:p,maximum:f,format:y,patterns:$,contentEncoding:E}=t._zod.bag;if(typeof p=="number"&&(u.minLength=p),typeof f=="number"&&(u.maxLength=f),y&&(u.format=i[y]??y,u.format===""&&delete u.format),E&&(u.contentEncoding=E),$&&$.size>0){const z=[...$];z.length===1?u.pattern=z[0].source:z.length>1&&(a.schema.allOf=[...z.map(N=>({...this.target==="draft-7"?{type:"string"}:{},pattern:N.source}))])}break}case"number":{const u=v,{minimum:p,maximum:f,format:y,multipleOf:$,exclusiveMaximum:E,exclusiveMinimum:z}=t._zod.bag;typeof y=="string"&&y.includes("int")?u.type="integer":u.type="number",typeof z=="number"&&(u.exclusiveMinimum=z),typeof p=="number"&&(u.minimum=p,typeof z=="number"&&(z>=p?delete u.minimum:delete u.exclusiveMinimum)),typeof E=="number"&&(u.exclusiveMaximum=E),typeof f=="number"&&(u.maximum=f,typeof E=="number"&&(E<=f?delete u.maximum:delete u.exclusiveMaximum)),typeof $=="number"&&(u.multipleOf=$);break}case"boolean":{const u=v;u.type="boolean";break}case"bigint":{if(this.unrepresentable==="throw")throw new Error("BigInt cannot be represented in JSON Schema");break}case"symbol":{if(this.unrepresentable==="throw")throw new Error("Symbols cannot be represented in JSON Schema");break}case"null":{v.type="null";break}case"any":break;case"unknown":break;case"undefined":{if(this.unrepresentable==="throw")throw new Error("Undefined cannot be represented in JSON Schema");break}case"void":{if(this.unrepresentable==="throw")throw new Error("Void cannot be represented in JSON Schema");break}case"never":{v.not={};break}case"date":{if(this.unrepresentable==="throw")throw new Error("Date cannot be represented in JSON Schema");break}case"array":{const u=v,{minimum:p,maximum:f}=t._zod.bag;typeof p=="number"&&(u.minItems=p),typeof f=="number"&&(u.maxItems=f),u.type="array",u.items=this.process(o.element,{..._,path:[..._.path,"items"]});break}case"object":{const u=v;u.type="object",u.properties={};const p=o.shape;for(const $ in p)u.properties[$]=this.process(p[$],{..._,path:[..._.path,"properties",$]});const f=new Set(Object.keys(p)),y=new Set([...f].filter($=>{const E=o.shape[$]._zod;return this.io==="input"?E.optin===void 0:E.optout===void 0}));y.size>0&&(u.required=Array.from(y)),((b=o.catchall)==null?void 0:b._zod.def.type)==="never"?u.additionalProperties=!1:o.catchall?o.catchall&&(u.additionalProperties=this.process(o.catchall,{..._,path:[..._.path,"additionalProperties"]})):this.io==="output"&&(u.additionalProperties=!1);break}case"union":{const u=v;u.anyOf=o.options.map((p,f)=>this.process(p,{..._,path:[..._.path,"anyOf",f]}));break}case"intersection":{const u=v,p=this.process(o.left,{..._,path:[..._.path,"allOf",0]}),f=this.process(o.right,{..._,path:[..._.path,"allOf",1]}),y=E=>"allOf"in E&&Object.keys(E).length===1,$=[...y(p)?p.allOf:[p],...y(f)?f.allOf:[f]];u.allOf=$;break}case"tuple":{const u=v;u.type="array";const p=o.items.map(($,E)=>this.process($,{..._,path:[..._.path,"prefixItems",E]}));if(this.target==="draft-2020-12"?u.prefixItems=p:u.items=p,o.rest){const $=this.process(o.rest,{..._,path:[..._.path,"items"]});this.target==="draft-2020-12"?u.items=$:u.additionalItems=$}o.rest&&(u.items=this.process(o.rest,{..._,path:[..._.path,"items"]}));const{minimum:f,maximum:y}=t._zod.bag;typeof f=="number"&&(u.minItems=f),typeof y=="number"&&(u.maxItems=y);break}case"record":{const u=v;u.type="object",u.propertyNames=this.process(o.keyType,{..._,path:[..._.path,"propertyNames"]}),u.additionalProperties=this.process(o.valueType,{..._,path:[..._.path,"additionalProperties"]});break}case"map":{if(this.unrepresentable==="throw")throw new Error("Map cannot be represented in JSON Schema");break}case"set":{if(this.unrepresentable==="throw")throw new Error("Set cannot be represented in JSON Schema");break}case"enum":{const u=v,p=getEnumValues(o.entries);p.every(f=>typeof f=="number")&&(u.type="number"),p.every(f=>typeof f=="string")&&(u.type="string"),u.enum=p;break}case"literal":{const u=v,p=[];for(const f of o.values)if(f===void 0){if(this.unrepresentable==="throw")throw new Error("Literal `undefined` cannot be represented in JSON Schema")}else if(typeof f=="bigint"){if(this.unrepresentable==="throw")throw new Error("BigInt literals cannot be represented in JSON Schema");p.push(Number(f))}else p.push(f);if(p.length!==0)if(p.length===1){const f=p[0];u.type=f===null?"null":typeof f,u.const=f}else p.every(f=>typeof f=="number")&&(u.type="number"),p.every(f=>typeof f=="string")&&(u.type="string"),p.every(f=>typeof f=="boolean")&&(u.type="string"),p.every(f=>f===null)&&(u.type="null"),u.enum=p;break}case"file":{const u=v,p={type:"string",format:"binary",contentEncoding:"binary"},{minimum:f,maximum:y,mime:$}=t._zod.bag;f!==void 0&&(p.minLength=f),y!==void 0&&(p.maxLength=y),$?$.length===1?(p.contentMediaType=$[0],Object.assign(u,p)):u.anyOf=$.map(E=>({...p,contentMediaType:E})):Object.assign(u,p);break}case"transform":{if(this.unrepresentable==="throw")throw new Error("Transforms cannot be represented in JSON Schema");break}case"nullable":{const u=this.process(o.innerType,_);v.anyOf=[u,{type:"null"}];break}case"nonoptional":{this.process(o.innerType,_),a.ref=o.innerType;break}case"success":{const u=v;u.type="boolean";break}case"default":{this.process(o.innerType,_),a.ref=o.innerType,v.default=JSON.parse(JSON.stringify(o.defaultValue));break}case"prefault":{this.process(o.innerType,_),a.ref=o.innerType,this.io==="input"&&(v._prefault=JSON.parse(JSON.stringify(o.defaultValue)));break}case"catch":{this.process(o.innerType,_),a.ref=o.innerType;let u;try{u=o.catchValue(void 0)}catch{throw new Error("Dynamic catch values are not supported in JSON Schema")}v.default=u;break}case"nan":{if(this.unrepresentable==="throw")throw new Error("NaN cannot be represented in JSON Schema");break}case"template_literal":{const u=v,p=t._zod.pattern;if(!p)throw new Error("Pattern not found in template literal");u.type="string",u.pattern=p.source;break}case"pipe":{const u=this.io==="input"?o.in._zod.def.type==="transform"?o.out:o.in:o.out;this.process(u,_),a.ref=u;break}case"readonly":{this.process(o.innerType,_),a.ref=o.innerType,v.readOnly=!0;break}case"promise":{this.process(o.innerType,_),a.ref=o.innerType;break}case"optional":{this.process(o.innerType,_),a.ref=o.innerType;break}case"lazy":{const u=t._zod.innerType;this.process(u,_),a.ref=u;break}case"custom":{if(this.unrepresentable==="throw")throw new Error("Custom types cannot be represented in JSON Schema");break}}}}const d=this.metadataRegistry.get(t);return d&&Object.assign(a.schema,d),this.io==="input"&&isTransforming(t)&&(delete a.schema.examples,delete a.schema.default),this.io==="input"&&a.schema._prefault&&((r=a.schema).default??(r.default=a.schema._prefault)),delete a.schema._prefault,this.seen.get(t).schema}emit(t,n){var m,w,h,b,_,S;const r={cycles:(n==null?void 0:n.cycles)??"ref",reused:(n==null?void 0:n.reused)??"inline",external:(n==null?void 0:n.external)??void 0},o=this.seen.get(t);if(!o)throw new Error("Unprocessed schema. This is a bug in Zod.");const i=v=>{var $;const u=this.target==="draft-2020-12"?"$defs":"definitions";if(r.external){const E=($=r.external.registry.get(v[0]))==null?void 0:$.id,z=r.external.uri??(j=>j);if(E)return{ref:z(E)};const N=v[1].defId??v[1].schema.id??`schema${this.counter++}`;return v[1].defId=N,{defId:N,ref:`${z("__shared")}#/${u}/${N}`}}if(v[1]===o)return{ref:"#"};const f=`#/${u}/`,y=v[1].schema.id??`__schema${this.counter++}`;return{defId:y,ref:f+y}},s=v=>{if(v[1].schema.$ref)return;const u=v[1],{ref:p,defId:f}=i(v);u.def={...u.schema},f&&(u.defId=f);const y=u.schema;for(const $ in y)delete y[$];y.$ref=p};if(r.cycles==="throw")for(const v of this.seen.entries()){const u=v[1];if(u.cycle)throw new Error(`Cycle detected: #/${(m=u.cycle)==null?void 0:m.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`)}for(const v of this.seen.entries()){const u=v[1];if(t===v[0]){s(v);continue}if(r.external){const f=(w=r.external.registry.get(v[0]))==null?void 0:w.id;if(t!==v[0]&&f){s(v);continue}}if((h=this.metadataRegistry.get(v[0]))==null?void 0:h.id){s(v);continue}if(u.cycle){s(v);continue}if(u.count>1&&r.reused==="ref"){s(v);continue}}const a=(v,u)=>{const p=this.seen.get(v),f=p.def??p.schema,y={...f};if(p.ref===null)return;const $=p.ref;if(p.ref=null,$){a($,u);const E=this.seen.get($).schema;E.$ref&&u.target==="draft-7"?(f.allOf=f.allOf??[],f.allOf.push(E)):(Object.assign(f,E),Object.assign(f,y))}p.isParent||this.override({zodSchema:v,jsonSchema:f,path:p.path??[]})};for(const v of[...this.seen.entries()].reverse())a(v[0],{target:this.target});const l={};if(this.target==="draft-2020-12"?l.$schema="https://json-schema.org/draft/2020-12/schema":this.target==="draft-7"?l.$schema="http://json-schema.org/draft-07/schema#":console.warn(`Invalid target: ${this.target}`),(b=r.external)!=null&&b.uri){const v=(_=r.external.registry.get(t))==null?void 0:_.id;if(!v)throw new Error("Schema is missing an `id` property");l.$id=r.external.uri(v)}Object.assign(l,o.def);const d=((S=r.external)==null?void 0:S.defs)??{};for(const v of this.seen.entries()){const u=v[1];u.def&&u.defId&&(d[u.defId]=u.def)}r.external||Object.keys(d).length>0&&(this.target==="draft-2020-12"?l.$defs=d:l.definitions=d);try{return JSON.parse(JSON.stringify(l))}catch{throw new Error("Error converting schema to JSON.")}}}function toJSONSchema(e,t){if(e instanceof $ZodRegistry){const r=new JSONSchemaGenerator(t),o={};for(const a of e._idmap.entries()){const[l,d]=a;r.process(d)}const i={},s={registry:e,uri:t==null?void 0:t.uri,defs:o};for(const a of e._idmap.entries()){const[l,d]=a;i[l]=r.emit(d,{...t,external:s})}if(Object.keys(o).length>0){const a=r.target==="draft-2020-12"?"$defs":"definitions";i.__shared={[a]:o}}return{schemas:i}}const n=new JSONSchemaGenerator(t);return n.process(e),n.emit(e,t)}function isTransforming(e,t){const n=t??{seen:new Set};if(n.seen.has(e))return!1;n.seen.add(e);const o=e._zod.def;switch(o.type){case"string":case"number":case"bigint":case"boolean":case"date":case"symbol":case"undefined":case"null":case"any":case"unknown":case"never":case"void":case"literal":case"enum":case"nan":case"file":case"template_literal":return!1;case"array":return isTransforming(o.element,n);case"object":{for(const i in o.shape)if(isTransforming(o.shape[i],n))return!0;return!1}case"union":{for(const i of o.options)if(isTransforming(i,n))return!0;return!1}case"intersection":return isTransforming(o.left,n)||isTransforming(o.right,n);case"tuple":{for(const i of o.items)if(isTransforming(i,n))return!0;return!!(o.rest&&isTransforming(o.rest,n))}case"record":return isTransforming(o.keyType,n)||isTransforming(o.valueType,n);case"map":return isTransforming(o.keyType,n)||isTransforming(o.valueType,n);case"set":return isTransforming(o.valueType,n);case"promise":case"optional":case"nonoptional":case"nullable":case"readonly":return isTransforming(o.innerType,n);case"lazy":return isTransforming(o.getter(),n);case"default":return isTransforming(o.innerType,n);case"prefault":return isTransforming(o.innerType,n);case"custom":return!1;case"transform":return!0;case"pipe":return isTransforming(o.in,n)||isTransforming(o.out,n);case"success":return!1;case"catch":return!1}throw new Error(`Unknown schema type: ${o.type}`)}const ZodISODateTime=$constructor("ZodISODateTime",(e,t)=>{$ZodISODateTime.init(e,t),ZodStringFormat.init(e,t)});function datetime(e){return _isoDateTime(ZodISODateTime,e)}const ZodISODate=$constructor("ZodISODate",(e,t)=>{$ZodISODate.init(e,t),ZodStringFormat.init(e,t)});function date(e){return _isoDate(ZodISODate,e)}const ZodISOTime=$constructor("ZodISOTime",(e,t)=>{$ZodISOTime.init(e,t),ZodStringFormat.init(e,t)});function time(e){return _isoTime(ZodISOTime,e)}const ZodISODuration=$constructor("ZodISODuration",(e,t)=>{$ZodISODuration.init(e,t),ZodStringFormat.init(e,t)});function duration(e){return _isoDuration(ZodISODuration,e)}const initializer=(e,t)=>{$ZodError.init(e,t),e.name="ZodError",Object.defineProperties(e,{format:{value:n=>formatError(e,n)},flatten:{value:n=>flattenError(e,n)},addIssue:{value:n=>e.issues.push(n)},addIssues:{value:n=>e.issues.push(...n)},isEmpty:{get(){return e.issues.length===0}}})},ZodRealError=$constructor("ZodError",initializer,{Parent:Error}),parse=_parse(ZodRealError),parseAsync=_parseAsync(ZodRealError),safeParse=_safeParse(ZodRealError),safeParseAsync=_safeParseAsync(ZodRealError),ZodType=$constructor("ZodType",(e,t)=>($ZodType.init(e,t),e.def=t,Object.defineProperty(e,"_def",{value:t}),e.check=(...n)=>e.clone({...t,checks:[...t.checks??[],...n.map(r=>typeof r=="function"?{_zod:{check:r,def:{check:"custom"},onattach:[]}}:r)]}),e.clone=(n,r)=>clone(e,n,r),e.brand=()=>e,e.register=(n,r)=>(n.add(e,r),e),e.parse=(n,r)=>parse(e,n,r,{callee:e.parse}),e.safeParse=(n,r)=>safeParse(e,n,r),e.parseAsync=async(n,r)=>parseAsync(e,n,r,{callee:e.parseAsync}),e.safeParseAsync=async(n,r)=>safeParseAsync(e,n,r),e.spa=e.safeParseAsync,e.refine=(n,r)=>e.check(refine(n,r)),e.superRefine=n=>e.check(superRefine(n)),e.overwrite=n=>e.check(_overwrite(n)),e.optional=()=>optional(e),e.nullable=()=>nullable(e),e.nullish=()=>optional(nullable(e)),e.nonoptional=n=>nonoptional(e,n),e.array=()=>array(e),e.or=n=>union([e,n]),e.and=n=>intersection(e,n),e.transform=n=>pipe(e,transform(n)),e.default=n=>_default(e,n),e.prefault=n=>prefault(e,n),e.catch=n=>_catch(e,n),e.pipe=n=>pipe(e,n),e.readonly=()=>readonly(e),e.describe=n=>{const r=e.clone();return globalRegistry.add(r,{description:n}),r},Object.defineProperty(e,"description",{get(){var n;return(n=globalRegistry.get(e))==null?void 0:n.description},configurable:!0}),e.meta=(...n)=>{if(n.length===0)return globalRegistry.get(e);const r=e.clone();return globalRegistry.add(r,n[0]),r},e.isOptional=()=>e.safeParse(void 0).success,e.isNullable=()=>e.safeParse(null).success,e)),_ZodString=$constructor("_ZodString",(e,t)=>{$ZodString.init(e,t),ZodType.init(e,t);const n=e._zod.bag;e.format=n.format??null,e.minLength=n.minimum??null,e.maxLength=n.maximum??null,e.regex=(...r)=>e.check(_regex(...r)),e.includes=(...r)=>e.check(_includes(...r)),e.startsWith=(...r)=>e.check(_startsWith(...r)),e.endsWith=(...r)=>e.check(_endsWith(...r)),e.min=(...r)=>e.check(_minLength(...r)),e.max=(...r)=>e.check(_maxLength(...r)),e.length=(...r)=>e.check(_length(...r)),e.nonempty=(...r)=>e.check(_minLength(1,...r)),e.lowercase=r=>e.check(_lowercase(r)),e.uppercase=r=>e.check(_uppercase(r)),e.trim=()=>e.check(_trim()),e.normalize=(...r)=>e.check(_normalize(...r)),e.toLowerCase=()=>e.check(_toLowerCase()),e.toUpperCase=()=>e.check(_toUpperCase())}),ZodString=$constructor("ZodString",(e,t)=>{$ZodString.init(e,t),_ZodString.init(e,t),e.email=n=>e.check(_email(ZodEmail,n)),e.url=n=>e.check(_url(ZodURL,n)),e.jwt=n=>e.check(_jwt(ZodJWT,n)),e.emoji=n=>e.check(_emoji(ZodEmoji,n)),e.guid=n=>e.check(_guid(ZodGUID,n)),e.uuid=n=>e.check(_uuid(ZodUUID,n)),e.uuidv4=n=>e.check(_uuidv4(ZodUUID,n)),e.uuidv6=n=>e.check(_uuidv6(ZodUUID,n)),e.uuidv7=n=>e.check(_uuidv7(ZodUUID,n)),e.nanoid=n=>e.check(_nanoid(ZodNanoID,n)),e.guid=n=>e.check(_guid(ZodGUID,n)),e.cuid=n=>e.check(_cuid(ZodCUID,n)),e.cuid2=n=>e.check(_cuid2(ZodCUID2,n)),e.ulid=n=>e.check(_ulid(ZodULID,n)),e.base64=n=>e.check(_base64(ZodBase64,n)),e.base64url=n=>e.check(_base64url(ZodBase64URL,n)),e.xid=n=>e.check(_xid(ZodXID,n)),e.ksuid=n=>e.check(_ksuid(ZodKSUID,n)),e.ipv4=n=>e.check(_ipv4(ZodIPv4,n)),e.ipv6=n=>e.check(_ipv6(ZodIPv6,n)),e.cidrv4=n=>e.check(_cidrv4(ZodCIDRv4,n)),e.cidrv6=n=>e.check(_cidrv6(ZodCIDRv6,n)),e.e164=n=>e.check(_e164(ZodE164,n)),e.datetime=n=>e.check(datetime(n)),e.date=n=>e.check(date(n)),e.time=n=>e.check(time(n)),e.duration=n=>e.check(duration(n))});function string(e){return _string(ZodString,e)}const ZodStringFormat=$constructor("ZodStringFormat",(e,t)=>{$ZodStringFormat.init(e,t),_ZodString.init(e,t)}),ZodEmail=$constructor("ZodEmail",(e,t)=>{$ZodEmail.init(e,t),ZodStringFormat.init(e,t)}),ZodGUID=$constructor("ZodGUID",(e,t)=>{$ZodGUID.init(e,t),ZodStringFormat.init(e,t)}),ZodUUID=$constructor("ZodUUID",(e,t)=>{$ZodUUID.init(e,t),ZodStringFormat.init(e,t)}),ZodURL=$constructor("ZodURL",(e,t)=>{$ZodURL.init(e,t),ZodStringFormat.init(e,t)}),ZodEmoji=$constructor("ZodEmoji",(e,t)=>{$ZodEmoji.init(e,t),ZodStringFormat.init(e,t)}),ZodNanoID=$constructor("ZodNanoID",(e,t)=>{$ZodNanoID.init(e,t),ZodStringFormat.init(e,t)}),ZodCUID=$constructor("ZodCUID",(e,t)=>{$ZodCUID.init(e,t),ZodStringFormat.init(e,t)}),ZodCUID2=$constructor("ZodCUID2",(e,t)=>{$ZodCUID2.init(e,t),ZodStringFormat.init(e,t)}),ZodULID=$constructor("ZodULID",(e,t)=>{$ZodULID.init(e,t),ZodStringFormat.init(e,t)}),ZodXID=$constructor("ZodXID",(e,t)=>{$ZodXID.init(e,t),ZodStringFormat.init(e,t)}),ZodKSUID=$constructor("ZodKSUID",(e,t)=>{$ZodKSUID.init(e,t),ZodStringFormat.init(e,t)}),ZodIPv4=$constructor("ZodIPv4",(e,t)=>{$ZodIPv4.init(e,t),ZodStringFormat.init(e,t)}),ZodIPv6=$constructor("ZodIPv6",(e,t)=>{$ZodIPv6.init(e,t),ZodStringFormat.init(e,t)}),ZodCIDRv4=$constructor("ZodCIDRv4",(e,t)=>{$ZodCIDRv4.init(e,t),ZodStringFormat.init(e,t)}),ZodCIDRv6=$constructor("ZodCIDRv6",(e,t)=>{$ZodCIDRv6.init(e,t),ZodStringFormat.init(e,t)}),ZodBase64=$constructor("ZodBase64",(e,t)=>{$ZodBase64.init(e,t),ZodStringFormat.init(e,t)}),ZodBase64URL=$constructor("ZodBase64URL",(e,t)=>{$ZodBase64URL.init(e,t),ZodStringFormat.init(e,t)}),ZodE164=$constructor("ZodE164",(e,t)=>{$ZodE164.init(e,t),ZodStringFormat.init(e,t)}),ZodJWT=$constructor("ZodJWT",(e,t)=>{$ZodJWT.init(e,t),ZodStringFormat.init(e,t)}),ZodNumber=$constructor("ZodNumber",(e,t)=>{$ZodNumber.init(e,t),ZodType.init(e,t),e.gt=(r,o)=>e.check(_gt(r,o)),e.gte=(r,o)=>e.check(_gte(r,o)),e.min=(r,o)=>e.check(_gte(r,o)),e.lt=(r,o)=>e.check(_lt(r,o)),e.lte=(r,o)=>e.check(_lte(r,o)),e.max=(r,o)=>e.check(_lte(r,o)),e.int=r=>e.check(int(r)),e.safe=r=>e.check(int(r)),e.positive=r=>e.check(_gt(0,r)),e.nonnegative=r=>e.check(_gte(0,r)),e.negative=r=>e.check(_lt(0,r)),e.nonpositive=r=>e.check(_lte(0,r)),e.multipleOf=(r,o)=>e.check(_multipleOf(r,o)),e.step=(r,o)=>e.check(_multipleOf(r,o)),e.finite=()=>e;const n=e._zod.bag;e.minValue=Math.max(n.minimum??Number.NEGATIVE_INFINITY,n.exclusiveMinimum??Number.NEGATIVE_INFINITY)??null,e.maxValue=Math.min(n.maximum??Number.POSITIVE_INFINITY,n.exclusiveMaximum??Number.POSITIVE_INFINITY)??null,e.isInt=(n.format??"").includes("int")||Number.isSafeInteger(n.multipleOf??.5),e.isFinite=!0,e.format=n.format??null});function number(e){return _number(ZodNumber,e)}const ZodNumberFormat=$constructor("ZodNumberFormat",(e,t)=>{$ZodNumberFormat.init(e,t),ZodNumber.init(e,t)});function int(e){return _int(ZodNumberFormat,e)}const ZodBoolean=$constructor("ZodBoolean",(e,t)=>{$ZodBoolean.init(e,t),ZodType.init(e,t)});function boolean(e){return _boolean(ZodBoolean,e)}const ZodUnknown=$constructor("ZodUnknown",(e,t)=>{$ZodUnknown.init(e,t),ZodType.init(e,t)});function unknown(){return _unknown(ZodUnknown)}const ZodNever=$constructor("ZodNever",(e,t)=>{$ZodNever.init(e,t),ZodType.init(e,t)});function never(e){return _never(ZodNever,e)}const ZodArray=$constructor("ZodArray",(e,t)=>{$ZodArray.init(e,t),ZodType.init(e,t),e.element=t.element,e.min=(n,r)=>e.check(_minLength(n,r)),e.nonempty=n=>e.check(_minLength(1,n)),e.max=(n,r)=>e.check(_maxLength(n,r)),e.length=(n,r)=>e.check(_length(n,r)),e.unwrap=()=>e.element});function array(e,t){return _array(ZodArray,e,t)}const ZodObject=$constructor("ZodObject",(e,t)=>{$ZodObject.init(e,t),ZodType.init(e,t),defineLazy(e,"shape",()=>t.shape),e.keyof=()=>_enum(Object.keys(e._zod.def.shape)),e.catchall=n=>e.clone({...e._zod.def,catchall:n}),e.passthrough=()=>e.clone({...e._zod.def,catchall:unknown()}),e.loose=()=>e.clone({...e._zod.def,catchall:unknown()}),e.strict=()=>e.clone({...e._zod.def,catchall:never()}),e.strip=()=>e.clone({...e._zod.def,catchall:void 0}),e.extend=n=>extend(e,n),e.merge=n=>merge(e,n),e.pick=n=>pick(e,n),e.omit=n=>omit(e,n),e.partial=(...n)=>partial(ZodOptional,e,n[0]),e.required=(...n)=>required(ZodNonOptional,e,n[0])});function object(e,t){const n={type:"object",get shape(){return assignProp(this,"shape",{...e}),this.shape},...normalizeParams(t)};return new ZodObject(n)}const ZodUnion=$constructor("ZodUnion",(e,t)=>{$ZodUnion.init(e,t),ZodType.init(e,t),e.options=t.options});function union(e,t){return new ZodUnion({type:"union",options:e,...normalizeParams(t)})}const ZodIntersection=$constructor("ZodIntersection",(e,t)=>{$ZodIntersection.init(e,t),ZodType.init(e,t)});function intersection(e,t){return new ZodIntersection({type:"intersection",left:e,right:t})}const ZodEnum=$constructor("ZodEnum",(e,t)=>{$ZodEnum.init(e,t),ZodType.init(e,t),e.enum=t.entries,e.options=Object.values(t.entries);const n=new Set(Object.keys(t.entries));e.extract=(r,o)=>{const i={};for(const s of r)if(n.has(s))i[s]=t.entries[s];else throw new Error(`Key ${s} not found in enum`);return new ZodEnum({...t,checks:[],...normalizeParams(o),entries:i})},e.exclude=(r,o)=>{const i={...t.entries};for(const s of r)if(n.has(s))delete i[s];else throw new Error(`Key ${s} not found in enum`);return new ZodEnum({...t,checks:[],...normalizeParams(o),entries:i})}});function _enum(e,t){const n=Array.isArray(e)?Object.fromEntries(e.map(r=>[r,r])):e;return new ZodEnum({type:"enum",entries:n,...normalizeParams(t)})}const ZodTransform=$constructor("ZodTransform",(e,t)=>{$ZodTransform.init(e,t),ZodType.init(e,t),e._zod.parse=(n,r)=>{n.addIssue=i=>{if(typeof i=="string")n.issues.push(issue(i,n.value,t));else{const s=i;s.fatal&&(s.continue=!1),s.code??(s.code="custom"),s.input??(s.input=n.value),s.inst??(s.inst=e),s.continue??(s.continue=!0),n.issues.push(issue(s))}};const o=t.transform(n.value,n);return o instanceof Promise?o.then(i=>(n.value=i,n)):(n.value=o,n)}});function transform(e){return new ZodTransform({type:"transform",transform:e})}const ZodOptional=$constructor("ZodOptional",(e,t)=>{$ZodOptional.init(e,t),ZodType.init(e,t),e.unwrap=()=>e._zod.def.innerType});function optional(e){return new ZodOptional({type:"optional",innerType:e})}const ZodNullable=$constructor("ZodNullable",(e,t)=>{$ZodNullable.init(e,t),ZodType.init(e,t),e.unwrap=()=>e._zod.def.innerType});function nullable(e){return new ZodNullable({type:"nullable",innerType:e})}const ZodDefault=$constructor("ZodDefault",(e,t)=>{$ZodDefault.init(e,t),ZodType.init(e,t),e.unwrap=()=>e._zod.def.innerType,e.removeDefault=e.unwrap});function _default(e,t){return new ZodDefault({type:"default",innerType:e,get defaultValue(){return typeof t=="function"?t():t}})}const ZodPrefault=$constructor("ZodPrefault",(e,t)=>{$ZodPrefault.init(e,t),ZodType.init(e,t),e.unwrap=()=>e._zod.def.innerType});function prefault(e,t){return new ZodPrefault({type:"prefault",innerType:e,get defaultValue(){return typeof t=="function"?t():t}})}const ZodNonOptional=$constructor("ZodNonOptional",(e,t)=>{$ZodNonOptional.init(e,t),ZodType.init(e,t),e.unwrap=()=>e._zod.def.innerType});function nonoptional(e,t){return new ZodNonOptional({type:"nonoptional",innerType:e,...normalizeParams(t)})}const ZodCatch=$constructor("ZodCatch",(e,t)=>{$ZodCatch.init(e,t),ZodType.init(e,t),e.unwrap=()=>e._zod.def.innerType,e.removeCatch=e.unwrap});function _catch(e,t){return new ZodCatch({type:"catch",innerType:e,catchValue:typeof t=="function"?t:()=>t})}const ZodPipe=$constructor("ZodPipe",(e,t)=>{$ZodPipe.init(e,t),ZodType.init(e,t),e.in=t.in,e.out=t.out});function pipe(e,t){return new ZodPipe({type:"pipe",in:e,out:t})}const ZodReadonly=$constructor("ZodReadonly",(e,t)=>{$ZodReadonly.init(e,t),ZodType.init(e,t)});function readonly(e){return new ZodReadonly({type:"readonly",innerType:e})}const ZodCustom=$constructor("ZodCustom",(e,t)=>{$ZodCustom.init(e,t),ZodType.init(e,t)});function check(e){const t=new $ZodCheck({check:"custom"});return t._zod.check=e,t}function refine(e,t={}){return _refine(ZodCustom,e,t)}function superRefine(e){const t=check(n=>(n.addIssue=r=>{if(typeof r=="string")n.issues.push(issue(r,n.value,t._zod.def));else{const o=r;o.fatal&&(o.continue=!1),o.code??(o.code="custom"),o.input??(o.input=n.value),o.inst??(o.inst=t),o.continue??(o.continue=!t._zod.def.abort),n.issues.push(issue(o))}},e(n.value,n)));return t}const ANSI_BACKGROUND_OFFSET=10,wrapAnsi16=(e=0)=>t=>`\x1B[${t+e}m`,wrapAnsi256=(e=0)=>t=>`\x1B[${38+e};5;${t}m`,wrapAnsi16m=(e=0)=>(t,n,r)=>`\x1B[${38+e};2;${t};${n};${r}m`,styles$3={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(styles$3.modifier);const foregroundColorNames=Object.keys(styles$3.color),backgroundColorNames=Object.keys(styles$3.bgColor);[...foregroundColorNames,...backgroundColorNames];function assembleStyles(){const e=new Map;for(const[t,n]of Object.entries(styles$3)){for(const[r,o]of Object.entries(n))styles$3[r]={open:`\x1B[${o[0]}m`,close:`\x1B[${o[1]}m`},n[r]=styles$3[r],e.set(o[0],o[1]);Object.defineProperty(styles$3,t,{value:n,enumerable:!1})}return Object.defineProperty(styles$3,"codes",{value:e,enumerable:!1}),styles$3.color.close="\x1B[39m",styles$3.bgColor.close="\x1B[49m",styles$3.color.ansi=wrapAnsi16(),styles$3.color.ansi256=wrapAnsi256(),styles$3.color.ansi16m=wrapAnsi16m(),styles$3.bgColor.ansi=wrapAnsi16(ANSI_BACKGROUND_OFFSET),styles$3.bgColor.ansi256=wrapAnsi256(ANSI_BACKGROUND_OFFSET),styles$3.bgColor.ansi16m=wrapAnsi16m(ANSI_BACKGROUND_OFFSET),Object.defineProperties(styles$3,{rgbToAnsi256:{value(t,n,r){return t===n&&n===r?t<8?16:t>248?231:Math.round((t-8)/247*24)+232:16+36*Math.round(t/255*5)+6*Math.round(n/255*5)+Math.round(r/255*5)},enumerable:!1},hexToRgb:{value(t){const n=/[a-f\d]{6}|[a-f\d]{3}/i.exec(t.toString(16));if(!n)return[0,0,0];let[r]=n;r.length===3&&(r=[...r].map(i=>i+i).join(""));const o=Number.parseInt(r,16);return[o>>16&255,o>>8&255,o&255]},enumerable:!1},hexToAnsi256:{value:t=>styles$3.rgbToAnsi256(...styles$3.hexToRgb(t)),enumerable:!1},ansi256ToAnsi:{value(t){if(t<8)return 30+t;if(t<16)return 90+(t-8);let n,r,o;if(t>=232)n=((t-232)*10+8)/255,r=n,o=n;else{t-=16;const a=t%36;n=Math.floor(t/36)/5,r=Math.floor(a/6)/5,o=a%6/5}const i=Math.max(n,r,o)*2;if(i===0)return 30;let s=30+(Math.round(o)<<2|Math.round(r)<<1|Math.round(n));return i===2&&(s+=60),s},enumerable:!1},rgbToAnsi:{value:(t,n,r)=>styles$3.ansi256ToAnsi(styles$3.rgbToAnsi256(t,n,r)),enumerable:!1},hexToAnsi:{value:t=>styles$3.ansi256ToAnsi(styles$3.hexToAnsi256(t)),enumerable:!1}}),styles$3}const ansiStyles=assembleStyles(),level=(()=>{if(!("navigator"in globalThis))return 0;if(globalThis.navigator.userAgentData){const e=navigator.userAgentData.brands.find(({brand:t})=>t==="Chromium");if(e&&e.version>93)return 3}return/\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent)?1:0})(),colorSupport=level!==0&&{level},supportsColor={stdout:colorSupport,stderr:colorSupport};function stringReplaceAll(e,t,n){let r=e.indexOf(t);if(r===-1)return e;const o=t.length;let i=0,s="";do s+=e.slice(i,r)+t+n,i=r+o,r=e.indexOf(t,i);while(r!==-1);return s+=e.slice(i),s}function stringEncaseCRLFWithFirstIndex(e,t,n,r){let o=0,i="";do{const s=e[r-1]==="\r";i+=e.slice(o,s?r-1:r)+t+(s?`\r
`:`
`)+n,o=r+1,r=e.indexOf(`
`,o)}while(r!==-1);return i+=e.slice(o),i}const{stdout:stdoutColor,stderr:stderrColor}=supportsColor,GENERATOR=Symbol("GENERATOR"),STYLER=Symbol("STYLER"),IS_EMPTY=Symbol("IS_EMPTY"),levelMapping=["ansi","ansi","ansi256","ansi16m"],styles$2=Object.create(null),applyOptions=(e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const n=stdoutColor?stdoutColor.level:0;e.level=t.level===void 0?n:t.level},chalkFactory=e=>{const t=(...n)=>n.join(" ");return applyOptions(t,e),Object.setPrototypeOf(t,createChalk.prototype),t};function createChalk(e){return chalkFactory(e)}Object.setPrototypeOf(createChalk.prototype,Function.prototype);for(const[e,t]of Object.entries(ansiStyles))styles$2[e]={get(){const n=createBuilder(this,createStyler(t.open,t.close,this[STYLER]),this[IS_EMPTY]);return Object.defineProperty(this,e,{value:n}),n}};styles$2.visible={get(){const e=createBuilder(this,this[STYLER],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const getModelAnsi=(e,t,n,...r)=>e==="rgb"?t==="ansi16m"?ansiStyles[n].ansi16m(...r):t==="ansi256"?ansiStyles[n].ansi256(ansiStyles.rgbToAnsi256(...r)):ansiStyles[n].ansi(ansiStyles.rgbToAnsi(...r)):e==="hex"?getModelAnsi("rgb",t,n,...ansiStyles.hexToRgb(...r)):ansiStyles[n][e](...r),usedModels=["rgb","hex","ansi256"];for(const e of usedModels){styles$2[e]={get(){const{level:n}=this;return function(...r){const o=createStyler(getModelAnsi(e,levelMapping[n],"color",...r),ansiStyles.color.close,this[STYLER]);return createBuilder(this,o,this[IS_EMPTY])}}};const t="bg"+e[0].toUpperCase()+e.slice(1);styles$2[t]={get(){const{level:n}=this;return function(...r){const o=createStyler(getModelAnsi(e,levelMapping[n],"bgColor",...r),ansiStyles.bgColor.close,this[STYLER]);return createBuilder(this,o,this[IS_EMPTY])}}}}const proto=Object.defineProperties(()=>{},{...styles$2,level:{enumerable:!0,get(){return this[GENERATOR].level},set(e){this[GENERATOR].level=e}}}),createStyler=(e,t,n)=>{let r,o;return n===void 0?(r=e,o=t):(r=n.openAll+e,o=t+n.closeAll),{open:e,close:t,openAll:r,closeAll:o,parent:n}},createBuilder=(e,t,n)=>{const r=(...o)=>applyStyle(r,o.length===1?""+o[0]:o.join(" "));return Object.setPrototypeOf(r,proto),r[GENERATOR]=e,r[STYLER]=t,r[IS_EMPTY]=n,r},applyStyle=(e,t)=>{if(e.level<=0||!t)return e[IS_EMPTY]?"":t;let n=e[STYLER];if(n===void 0)return t;const{openAll:r,closeAll:o}=n;if(t.includes("\x1B"))for(;n!==void 0;)t=stringReplaceAll(t,n.close,n.open),n=n.parent;const i=t.indexOf(`
`);return i!==-1&&(t=stringEncaseCRLFWithFirstIndex(t,o,r,i)),r+t+o};Object.defineProperties(createChalk.prototype,styles$2);const chalk=createChalk();createChalk({level:stderrColor?stderrColor.level:0});var __defProp$5=Object.defineProperty,__name$5=(e,t)=>__defProp$5(e,"name",{value:t,configurable:!0});const InvokeErrorType={NETWORK_ERROR:"network_error",RATE_LIMIT:"rate_limit",SERVER_ERROR:"server_error",NO_TOOL_CALL:"no_tool_call",INVALID_TOOL_ARGS:"invalid_tool_args",TOOL_EXECUTION_ERROR:"tool_execution_error",UNKNOWN:"unknown",AUTH_ERROR:"auth_error",CONTEXT_LENGTH:"context_length",CONTENT_FILTER:"content_filter"},_InvokeError=class extends Error{constructor(n,r,o,i){super(r);O(this,"type");O(this,"retryable");O(this,"statusCode");O(this,"rawError");O(this,"rawResponse");this.name="InvokeError",this.type=n,this.retryable=this.isRetryable(n,o),this.rawError=o,this.rawResponse=i}isRetryable(n,r){return(r==null?void 0:r.name)==="AbortError"?!1:[InvokeErrorType.NETWORK_ERROR,InvokeErrorType.RATE_LIMIT,InvokeErrorType.SERVER_ERROR,InvokeErrorType.NO_TOOL_CALL,InvokeErrorType.INVALID_TOOL_ARGS,InvokeErrorType.TOOL_EXECUTION_ERROR,InvokeErrorType.UNKNOWN].includes(n)}};__name$5(_InvokeError,"InvokeError");let InvokeError=_InvokeError;const debug=console.debug.bind(console,chalk.gray("[LLM]"));function zodToOpenAITool(e,t){return{type:"function",function:{name:e,description:t.description,parameters:toJSONSchema(t.inputSchema,{target:"openapi-3.0"})}}}__name$5(zodToOpenAITool,"zodToOpenAITool");function modelPatch(e){var r,o;const t=e.model||"";if(!t)return e;const n=normalizeModelName(t);return n.startsWith("qwen")&&(debug("Applying Qwen patch: use higher temperature for auto fixing"),e.temperature=Math.max(e.temperature||0,1),e.enable_thinking=!1),n.startsWith("claude")&&(debug("Applying Claude patch: disable thinking"),e.thinking={type:"disabled"},e.tool_choice==="required"?(debug('Applying Claude patch: convert tool_choice "required" to { type: "any" }'),e.tool_choice={type:"any"}):(o=(r=e.tool_choice)==null?void 0:r.function)!=null&&o.name&&(debug("Applying Claude patch: convert tool_choice format"),e.tool_choice={type:"tool",name:e.tool_choice.function.name})),n.startsWith("grok")&&(debug("Applying Grok patch: removing tool_choice"),delete e.tool_choice,debug("Applying Grok patch: disable reasoning and thinking"),e.thinking={type:"disabled",effort:"minimal"},e.reasoning={enabled:!1,effort:"low"}),n.startsWith("gpt")&&(debug("Applying GPT patch: set verbosity to low"),e.verbosity="low",n.startsWith("gpt-52")?(debug("Applying GPT-52 patch: disable reasoning"),e.reasoning_effort="none"):n.startsWith("gpt-51")?(debug("Applying GPT-51 patch: disable reasoning"),e.reasoning_effort="none"):n.startsWith("gpt-54")?(debug("Applying GPT-5.4 patch: skip reasoning_effort because chat/completions rejects it with function tools"),delete e.reasoning_effort):n.startsWith("gpt-5-mini")?(debug("Applying GPT-5-mini patch: set reasoning effort to low, temperature to 1"),e.reasoning_effort="low",e.temperature=1):n.startsWith("gpt-5")&&(debug("Applying GPT-5 patch: set reasoning effort to low"),e.reasoning_effort="low")),n.startsWith("gemini")&&(debug("Applying Gemini patch: set reasoning effort to minimal"),e.reasoning_effort="minimal"),n.startsWith("minimax")&&(debug("Applying MiniMax patch: clamp temperature to (0, 1]"),e.temperature=Math.max(e.temperature||0,.01),e.temperature>1&&(e.temperature=1),delete e.parallel_tool_calls),e}__name$5(modelPatch,"modelPatch");function normalizeModelName(e){let t=e.toLowerCase();return t.includes("/")&&(t=t.split("/")[1]),t=t.replace(/_/g,""),t=t.replace(/\./g,""),t}__name$5(normalizeModelName,"normalizeModelName");const _OpenAIClient=class{constructor(t){O(this,"config");O(this,"fetch");this.config=t,this.fetch=t.customFetch}async invoke(t,n,r,o){var y,$,E,z,N,j,X,F,R,ne,K,J,ee,Q,V,H,ue,c;const i=Object.entries(n).map(([g,T])=>zodToOpenAITool(g,T));let s="required";o!=null&&o.toolChoiceName&&!this.config.disableNamedToolChoice&&(s={type:"function",function:{name:o.toolChoiceName}});const a={model:this.config.model,temperature:this.config.temperature,messages:t,tools:i,parallel_tool_calls:!1,tool_choice:s};modelPatch(a);let l;try{l=await this.fetch(`${this.config.baseURL}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",...this.config.apiKey&&{Authorization:`Bearer ${this.config.apiKey}`}},body:JSON.stringify(a),signal:r})}catch(g){const T=(g==null?void 0:g.name)==="AbortError",x=T?"Network request aborted":"Network request failed";throw T||console.error(g),new InvokeError(InvokeErrorType.NETWORK_ERROR,x,g)}if(!l.ok){const g=await l.json().catch(),T=((y=g.error)==null?void 0:y.message)||l.statusText;throw l.status===401||l.status===403?new InvokeError(InvokeErrorType.AUTH_ERROR,`Authentication failed: ${T}`,g):l.status===429?new InvokeError(InvokeErrorType.RATE_LIMIT,`Rate limit exceeded: ${T}`,g):l.status>=500?new InvokeError(InvokeErrorType.SERVER_ERROR,`Server error: ${T}`,g):new InvokeError(InvokeErrorType.UNKNOWN,`HTTP ${l.status}: ${T}`,g)}const d=await l.json(),m=($=d.choices)==null?void 0:$[0];if(!m)throw new InvokeError(InvokeErrorType.UNKNOWN,"No choices in response",d);switch(m.finish_reason){case"tool_calls":case"function_call":case"stop":break;case"length":throw new InvokeError(InvokeErrorType.CONTEXT_LENGTH,"Response truncated: max tokens reached",void 0,d);case"content_filter":throw new InvokeError(InvokeErrorType.CONTENT_FILTER,"Content filtered by safety system",void 0,d);default:throw new InvokeError(InvokeErrorType.UNKNOWN,`Unexpected finish_reason: ${m.finish_reason}`,void 0,d)}const h=(E=(o!=null&&o.normalizeResponse?o.normalizeResponse(d):d).choices)==null?void 0:E[0],b=(X=(j=(N=(z=h==null?void 0:h.message)==null?void 0:z.tool_calls)==null?void 0:N[0])==null?void 0:j.function)==null?void 0:X.name;if(!b)throw new InvokeError(InvokeErrorType.NO_TOOL_CALL,"No tool call found in response",void 0,d);const _=n[b];if(!_)throw new InvokeError(InvokeErrorType.UNKNOWN,`Tool "${b}" not found in tools`,void 0,d);const S=(K=(ne=(R=(F=h.message)==null?void 0:F.tool_calls)==null?void 0:R[0])==null?void 0:ne.function)==null?void 0:K.arguments;if(!S)throw new InvokeError(InvokeErrorType.INVALID_TOOL_ARGS,"No tool call arguments found",void 0,d);let v;try{v=JSON.parse(S)}catch(g){throw new InvokeError(InvokeErrorType.INVALID_TOOL_ARGS,"Failed to parse tool arguments as JSON",g,d)}const u=_.inputSchema.safeParse(v);if(!u.success)throw console.error(prettifyError(u.error)),new InvokeError(InvokeErrorType.INVALID_TOOL_ARGS,"Tool arguments validation failed",u.error,d);const p=u.data;let f;try{f=await _.execute(p)}catch(g){throw new InvokeError(InvokeErrorType.TOOL_EXECUTION_ERROR,`Tool execution failed: ${g.message}`,g,d)}return{toolCall:{name:b,args:p},toolResult:f,usage:{promptTokens:((J=d.usage)==null?void 0:J.prompt_tokens)??0,completionTokens:((ee=d.usage)==null?void 0:ee.completion_tokens)??0,totalTokens:((Q=d.usage)==null?void 0:Q.total_tokens)??0,cachedTokens:(H=(V=d.usage)==null?void 0:V.prompt_tokens_details)==null?void 0:H.cached_tokens,reasoningTokens:(c=(ue=d.usage)==null?void 0:ue.completion_tokens_details)==null?void 0:c.reasoning_tokens},rawResponse:d,rawRequest:a}}};__name$5(_OpenAIClient,"OpenAIClient");let OpenAIClient=_OpenAIClient;const LLM_MAX_RETRIES=2,DEFAULT_TEMPERATURE=.7;function parseLLMConfig(e){if(!e.baseURL||!e.model)throw new Error("[PageAgent] LLM configuration required. Please provide: baseURL, model. See: https://alibaba.github.io/page-agent/docs/features/models");return{baseURL:e.baseURL,model:e.model,apiKey:e.apiKey||"",temperature:e.temperature??DEFAULT_TEMPERATURE,maxRetries:e.maxRetries??LLM_MAX_RETRIES,disableNamedToolChoice:e.disableNamedToolChoice??!1,customFetch:(e.customFetch??fetch).bind(globalThis)}}__name$5(parseLLMConfig,"parseLLMConfig");const _LLM=class extends EventTarget{constructor(n){super();O(this,"config");O(this,"client");this.config=parseLLMConfig(n),this.client=new OpenAIClient(this.config)}async invoke(n,r,o,i){return await withRetry(async()=>{if(o.aborted)throw new Error("AbortError");return await this.client.invoke(n,r,o,i)},{maxRetries:this.config.maxRetries,onRetry:__name$5(s=>{this.dispatchEvent(new CustomEvent("retry",{detail:{attempt:s,maxAttempts:this.config.maxRetries}}))},"onRetry"),onError:__name$5(s=>{this.dispatchEvent(new CustomEvent("error",{detail:{error:s}}))},"onError")})}};__name$5(_LLM,"LLM");let LLM=_LLM;async function withRetry(e,t){var o;let n=0,r=null;for(;n<=t.maxRetries;){n>0&&(t.onRetry(n),await new Promise(i=>setTimeout(i,100)));try{return await e()}catch(i){if(((o=i==null?void 0:i.rawError)==null?void 0:o.name)==="AbortError"||(console.error(i),t.onError(i),i instanceof InvokeError&&!i.retryable))throw i;r=i,n++,await new Promise(s=>setTimeout(s,100))}}throw r}__name$5(withRetry,"withRetry");var __defProp$4=Object.defineProperty,__typeError$2=e=>{throw TypeError(e)},__defNormalProp$1=(e,t,n)=>t in e?__defProp$4(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,__name$4=(e,t)=>__defProp$4(e,"name",{value:t,configurable:!0}),__publicField$1=(e,t,n)=>__defNormalProp$1(e,typeof t!="symbol"?t+"":t,n),__accessCheck$2=(e,t,n)=>t.has(e)||__typeError$2("Cannot "+n),__privateGet$2=(e,t,n)=>(__accessCheck$2(e,t,"read from private field"),n?n.call(e):t.get(e)),__privateAdd$2=(e,t,n)=>t.has(e)?__typeError$2("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),__privateSet$2=(e,t,n,r)=>(__accessCheck$2(e,t,"write to private field"),t.set(e,n),n),__privateMethod$2=(e,t,n)=>(__accessCheck$2(e,t,"access private method"),n),_status,_llm,_abortController,_observations,_states,_PageAgentCore_instances,emitStatusChange_fn,emitHistoryChange_fn,emitActivity_fn,setStatus_fn,packMacroTool_fn,getSystemPrompt_fn,getInstructions_fn,handleObservations_fn,assembleUserPrompt_fn,onDone_fn;const SYSTEM_PROMPT=`You are an AI agent designed to operate in an iterative loop to automate browser tasks. Your ultimate goal is accomplishing the task provided in <user_request>.

<intro>
You excel at following tasks:
1. Navigating complex websites and extracting precise information
2. Automating form submissions and interactive web actions
3. Gathering and saving information 
4. Operate effectively in an agent loop
5. Efficiently performing diverse web tasks
</intro>

<language_settings>
- Default working language: **English**
- Use the language that user is using. Return in user's language.
</language_settings>

<input>
At every step, your input will consist of: 
1. <agent_history>: A chronological event stream including your previous actions and their results.
2. <agent_state>: Current <user_request> and <step_info>.
3. <browser_state>: Current URL, interactive elements indexed for actions, and visible page content.
</input>

<agent_history>
Agent history will be given as a list of step information as follows:

<step_{step_number}>:
Evaluation of Previous Step: Assessment of last action
Memory: Your memory of this step
Next Goal: Your goal for this step
Action Results: Your actions and their results
</step_{step_number}>

and system messages wrapped in <sys> tag.
</agent_history>

<user_request>
USER REQUEST: This is your ultimate objective and always remains visible.
- This has the highest priority. Make the user happy.
- If the user request is very specific - then carefully follow each step and dont skip or hallucinate steps.
- If the task is open ended you can plan yourself how to get it done.
</user_request>

<browser_state>
1. Browser State will be given as:

Current URL: URL of the page you are currently viewing.
Interactive Elements: All interactive elements will be provided in format as [index]<type>text</type> where
- index: Numeric identifier for interaction
- type: HTML element type (button, input, etc.)
- text: Element description

Examples:
[33]<div>User form</div>
\\t*[35]<button aria-label='Submit form'>Submit</button>

Note that:
- Only elements with numeric indexes in [] are interactive
- (stacked) indentation (with \\t) is important and means that the element is a (html) child of the element above (with a lower index)
- Elements tagged with \`*[\` are the new clickable elements that appeared on the website since the last step - if url has not changed.
- Pure text elements without [] are not interactive.
</browser_state>

<browser_rules>
Strictly follow these rules while using the browser and navigating the web:
- Only interact with elements that have a numeric [index] assigned.
- Only use indexes that are explicitly provided.
- If the page changes after, for example, an input text action, analyze if you need to interact with new elements, e.g. selecting the right option from the list.
- By default, only elements in the visible viewport are listed. Use scrolling actions if you suspect relevant content is offscreen which you need to interact with. Scroll ONLY if there are more pixels below or above the page.
- You can scroll by a specific number of pages using the num_pages parameter (e.g., 0.5 for half page, 2.0 for two pages).
- All the elements that are scrollable are marked with \`data-scrollable\` attribute. Including the scrollable distance in every directions. You can scroll *the element* in case some area are overflowed.
- If a captcha appears, tell user you can not solve captcha. Finish the task and ask user to solve it.
- If expected elements are missing, try scrolling, or navigating back.
- If the page is not fully loaded, use the \`wait\` action.
- Do not repeat one action for more than 3 times unless some conditions changed.
- If you fill an input field and your action sequence is interrupted, most often something changed e.g. suggestions popped up under the field.
- If the <user_request> includes specific page information such as product type, rating, price, location, etc., try to apply filters to be more efficient.
- The <user_request> is the ultimate goal. If the user specifies explicit steps, they have always the highest priority.
- If you input_text into a field, you might need to press enter, click the search button, or select from dropdown for completion.
- Don't login into a page if you don't have to. Don't login if you don't have the credentials. 
- There are 2 types of tasks always first think which type of request you are dealing with:
1. Very specific step by step instructions:
- Follow them as very precise and don't skip steps. Try to complete everything as requested.
2. Open ended tasks. Plan yourself, be creative in achieving them.
- If you get stuck e.g. with logins or captcha in open-ended tasks you can re-evaluate the task and try alternative ways, e.g. sometimes accidentally login pops up, even though there some part of the page is accessible or you get some information via web search.
</browser_rules>

<capability>
- You can only handle single page app. Do not jump out of current page.
- Do not click on link if it will open in a new page (e.g., <a target="_blank">)
- It is ok to fail the task.
	- User can be wrong. If the request of user is not achievable, inappropriate or you do not have enough information or tools to achieve it. Tell user to make a better request.
	- Webpage can be broken. All webpages or apps have bugs. Some bug will make it hard for your job. It's encouraged to tell user the problem of current page. Your feedbacks (including failing) are valuable for user.
	- Trying too hard can be harmful. Repeating some action back and forth or pushing for a complex procedure with little knowledge can cause unwanted results and harmful side-effects. User would rather you complete the task with a fail.
- If you do not have knowledge for the current webpage or task. You must require user to give specific instructions and detailed steps.
</capability>

<task_completion_rules>
You must call the \`done\` action in one of three cases:
- When you have fully completed the USER REQUEST.
- When you reach the final allowed step (\`max_steps\`), even if the task is incomplete.
- When you feel stuck or unable to solve user request. Or user request is not clear or contains inappropriate content.
- If it is ABSOLUTELY IMPOSSIBLE to continue.

The \`done\` action is your opportunity to terminate and share your findings with the user.
- Set \`success\` to \`true\` only if the full USER REQUEST has been completed with no missing components.
- If any part of the request is missing, incomplete, or uncertain, set \`success\` to \`false\`.
- You can use the \`text\` field of the \`done\` action to communicate your findings and to provide a coherent reply to the user and fulfill the USER REQUEST.
- You are ONLY ALLOWED to call \`done\` as a single action. Don't call it together with other actions.
- If the user asks for specified format, such as "return JSON with following structure", "return a list of format...", MAKE sure to use the right format in your answer.
- If the user asks for a structured output, your \`done\` action's schema may be modified. Take this schema into account when solving the task!
</task_completion_rules>

<reasoning_rules>
Exhibit the following reasoning patterns to successfully achieve the <user_request>:

- Reason about <agent_history> to track progress and context toward <user_request>.
- Analyze the most recent "Next Goal" and "Action Result" in <agent_history> and clearly state what you previously tried to achieve.
- Analyze all relevant items in <agent_history> and <browser_state> to understand your state.
- Explicitly judge success/failure/uncertainty of the last action. Never assume an action succeeded just because it appears to be executed in your last step in <agent_history>. If the expected change is missing, mark the last action as failed (or uncertain) and plan a recovery.
- Analyze whether you are stuck, e.g. when you repeat the same actions multiple times without any progress. Then consider alternative approaches e.g. scrolling for more context or ask user for help.
- Ask user for help if you have any difficulty. Keep user in the loop.
- If you see information relevant to <user_request>, plan saving the information to memory.
- Always reason about the <user_request>. Make sure to carefully analyze the specific steps and information required. E.g. specific filters, specific form fields, specific information to search. Make sure to always compare the current trajectory with the user request and think carefully if thats how the user requested it.
</reasoning_rules>

<examples>
Here are examples of good output patterns. Use them as reference but never copy them directly.

<evaluation_examples>
"evaluation_previous_goal": "Successfully navigated to the product page and found the target information. Verdict: Success"
"evaluation_previous_goal": "Clicked the login button and user authentication form appeared. Verdict: Success"
</evaluation_examples>

<memory_examples>
"memory": "Found many pending reports that need to be analyzed in the main page. Successfully processed the first 2 reports on quarterly sales data and moving on to inventory analysis and customer feedback reports."
</memory_examples>

<next_goal_examples>
"next_goal": "Click on the 'Add to Cart' button to proceed with the purchase flow."
</next_goal_examples>
</examples>

<output>
{
  "evaluation_previous_goal": "Concise one-sentence analysis of your last action. Clearly state success, failure, or uncertain.",
  "memory": "1-3 concise sentences of specific memory of this step and overall progress. You should put here everything that will help you track progress in future steps. Like counting pages visited, items found, etc.",
  "next_goal": "State the next immediate goal and action to achieve it, in one clear sentence.",
  "action":{
    "Action name": {// Action parameters}
  }
}
</output>
`,log=console.log.bind(console,chalk.yellow("[autoFixer]"));function normalizeResponse(e,t){var s,a,l;let n=null;const r=(s=e.choices)==null?void 0:s[0];if(!r)throw new Error("No choices in response");const o=r.message;if(!o)throw new Error("No message in choice");const i=(a=o.tool_calls)==null?void 0:a[0];if((l=i==null?void 0:i.function)!=null&&l.arguments)n=safeJsonParse(i.function.arguments),i.function.name&&i.function.name!=="AgentOutput"&&(log("#1: fixing tool_call"),n={action:safeJsonParse(n)});else if(o.content){const d=o.content.trim(),m=retrieveJsonFromString(d);if(m)n=safeJsonParse(m),(n==null?void 0:n.name)==="AgentOutput"&&(log("#2: fixing tool_call"),n=safeJsonParse(n.arguments)),(n==null?void 0:n.type)==="function"&&(log("#3: fixing tool_call"),n=safeJsonParse(n.function.arguments)),!(n!=null&&n.action)&&!(n!=null&&n.evaluation_previous_goal)&&!(n!=null&&n.memory)&&!(n!=null&&n.next_goal)&&!(n!=null&&n.thinking)&&(log("#4: fixing tool_call"),n={action:safeJsonParse(n)});else throw new Error("No tool_call and the message content does not contain valid JSON")}else throw new Error("No tool_call nor message content is present");return n=safeJsonParse(n),n.action&&(n.action=safeJsonParse(n.action)),n.action&&t&&(n.action=validateAction(n.action,t)),n.action||(log("#5: fixing tool_call"),n.action={name:"wait",input:{seconds:1}}),{...e,choices:[{...r,message:{...o,tool_calls:[{...i||{},function:{...(i==null?void 0:i.function)||{},name:"AgentOutput",arguments:JSON.stringify(n)}}]}}]}}__name$4(normalizeResponse,"normalizeResponse");function validateAction(e,t){if(typeof e!="object"||e===null)return e;const n=Object.keys(e)[0];if(!n)return e;const r=t.get(n);if(!r){const a=Array.from(t.keys()).join(", ");throw new InvokeError(InvokeErrorType.INVALID_TOOL_ARGS,`Unknown action "${n}". Available: ${a}`)}let o=e[n];const i=r.inputSchema;if(i instanceof ZodObject&&o!==null&&typeof o!="object"){const a=Object.keys(i.shape).find(l=>!i.shape[l].safeParse(void 0).success);a&&(log(`coercing primitive action input for "${n}"`),o={[a]:o})}const s=i.safeParse(o);if(!s.success)throw new InvokeError(InvokeErrorType.INVALID_TOOL_ARGS,`Invalid input for action "${n}": ${prettifyError(s.error)}`);return{[n]:s.data}}__name$4(validateAction,"validateAction");function safeJsonParse(e){if(typeof e=="string")try{return JSON.parse(e.trim())}catch{return e}return e}__name$4(safeJsonParse,"safeJsonParse");function retrieveJsonFromString(e){try{const t=/({[\s\S]*})/.exec(e)??[];return t.length===0?null:JSON.parse(t[0])}catch{return null}}__name$4(retrieveJsonFromString,"retrieveJsonFromString");async function waitFor$1(e){await new Promise(t=>setTimeout(t,e*1e3))}__name$4(waitFor$1,"waitFor");function truncate$1(e,t){return e.length>t?e.substring(0,t)+"...":e}__name$4(truncate$1,"truncate");function randomID(e){let t=Math.random().toString(36).substring(2,11);if(!e)return t;const n=1e3;let r=0;for(;e.includes(t);)if(t=Math.random().toString(36).substring(2,11),r++,r>n)throw new Error("randomID: too many tries");return t}__name$4(randomID,"randomID");const _global=globalThis;_global.__PAGE_AGENT_IDS__||(_global.__PAGE_AGENT_IDS__=[]);const ids=_global.__PAGE_AGENT_IDS__;function uid(){const e=randomID(ids);return ids.push(e),e}__name$4(uid,"uid");const llmsTxtCache=new Map;async function fetchLlmsTxt(e){let t;try{t=new URL(e).origin}catch{return null}if(t==="null")return null;if(llmsTxtCache.has(t))return llmsTxtCache.get(t);const n=`${t}/llms.txt`;let r=null;try{console.log(chalk.gray(`[llms.txt] Fetching ${n}`));const o=await fetch(n,{signal:AbortSignal.timeout(3e3)});o.ok?(r=await o.text(),console.log(chalk.green(`[llms.txt] Found (${r.length} chars)`)),r.length>1e3&&(console.log(chalk.yellow("[llms.txt] Truncating to 1000 chars")),r=truncate$1(r,1e3))):console.debug(chalk.gray(`[llms.txt] ${o.status} for ${n}`))}catch(o){console.debug(chalk.gray(`[llms.txt] not found for ${n}`),o)}return llmsTxtCache.set(t,r),r}__name$4(fetchLlmsTxt,"fetchLlmsTxt");function assert(e,t,n){if(!e){const r=t??"Assertion failed";throw console.error(chalk.red(`❌ assert: ${r}`)),new Error(r)}}__name$4(assert,"assert");function tool(e){return e}__name$4(tool,"tool");const tools=new Map;tools.set("done",{description:"Complete task. Text is your final response to the user — keep it concise unless the user explicitly asks for detail.",inputSchema:object({text:string(),success:boolean().default(!0)}),execute:__name$4(async function(e){return Promise.resolve("Task completed")},"execute")}),tools.set("wait",{description:"Wait for x seconds. Can be used to wait until the page or data is fully loaded.",inputSchema:object({seconds:number().min(1).max(10).default(1)}),execute:__name$4(async function(e){const t=await this.pageController.getLastUpdateTime(),n=Math.max(0,e.seconds-(Date.now()-t)/1e3);return console.log(`actualWaitTime: ${n} seconds`),await waitFor$1(n),`✅ Waited for ${e.seconds} seconds.`},"execute")}),tools.set("ask_user",{description:"Ask the user a question and wait for their answer. Use this if you need more information or clarification.",inputSchema:object({question:string()}),execute:__name$4(async function(e){if(!this.onAskUser)throw new Error("ask_user tool requires onAskUser callback to be set");return`User answered: ${await this.onAskUser(e.question)}`},"execute")}),tools.set("click_element_by_index",{description:"Click element by index",inputSchema:object({index:int().min(0)}),execute:__name$4(async function(e){return(await this.pageController.clickElement(e.index)).message},"execute")}),tools.set("input_text",{description:"Click and type text into an interactive input element",inputSchema:object({index:int().min(0),text:string()}),execute:__name$4(async function(e){return(await this.pageController.inputText(e.index,e.text)).message},"execute")}),tools.set("select_dropdown_option",{description:"Select dropdown option for interactive element index by the text of the option you want to select",inputSchema:object({index:int().min(0),text:string()}),execute:__name$4(async function(e){return(await this.pageController.selectOption(e.index,e.text)).message},"execute")}),tools.set("scroll",{description:"Scroll vertically. Without index: scrolls the document. With index: scrolls the container at that index (or its nearest scrollable ancestor). Use index of a data-scrollable element to scroll a specific area.",inputSchema:object({down:boolean().default(!0),num_pages:number().min(0).max(10).optional().default(.1),pixels:number().int().min(0).optional(),index:number().int().min(0).optional()}),execute:__name$4(async function(e){return(await this.pageController.scroll({...e,numPages:e.num_pages})).message},"execute")}),tools.set("scroll_horizontally",{description:"Scroll horizontally. Without index: scrolls the document. With index: scrolls the container at that index (or its nearest scrollable ancestor). Use index of a data-scrollable element to scroll a specific area.",inputSchema:object({right:boolean().default(!0),pixels:number().int().min(0),index:number().int().min(0).optional()}),execute:__name$4(async function(e){return(await this.pageController.scrollHorizontally(e)).message},"execute")}),tools.set("execute_javascript",{description:"Execute JavaScript code on the current page. Supports async/await syntax. Use with caution!",inputSchema:object({script:string()}),execute:__name$4(async function(e){return(await this.pageController.executeJavascript(e.script)).message},"execute")});const _PageAgentCore=class extends EventTarget{constructor(t){if(super(),__privateAdd$2(this,_PageAgentCore_instances),__publicField$1(this,"id",uid()),__publicField$1(this,"config"),__publicField$1(this,"tools"),__publicField$1(this,"pageController"),__publicField$1(this,"task",""),__publicField$1(this,"taskId",""),__publicField$1(this,"history",[]),__publicField$1(this,"disposed",!1),__publicField$1(this,"onAskUser"),__privateAdd$2(this,_status,"idle"),__privateAdd$2(this,_llm),__privateAdd$2(this,_abortController,new AbortController),__privateAdd$2(this,_observations,[]),__privateAdd$2(this,_states,{totalWaitTime:0,lastURL:"",browserState:null}),this.config={...t,maxSteps:t.maxSteps??40},__privateSet$2(this,_llm,new LLM(this.config)),this.tools=new Map(tools),this.pageController=t.pageController,__privateGet$2(this,_llm).addEventListener("retry",n=>{const{attempt:r,maxAttempts:o}=n.detail;__privateMethod$2(this,_PageAgentCore_instances,emitActivity_fn).call(this,{type:"retrying",attempt:r,maxAttempts:o}),this.history.push({type:"retry",message:`LLM retry attempt ${r} of ${o}`,attempt:r,maxAttempts:o}),__privateMethod$2(this,_PageAgentCore_instances,emitHistoryChange_fn).call(this)}),__privateGet$2(this,_llm).addEventListener("error",n=>{var i;const r=n.detail.error;if(((i=r==null?void 0:r.rawError)==null?void 0:i.name)==="AbortError")return;const o=String(r);__privateMethod$2(this,_PageAgentCore_instances,emitActivity_fn).call(this,{type:"error",message:o}),this.history.push({type:"error",message:o,rawResponse:r.rawResponse}),__privateMethod$2(this,_PageAgentCore_instances,emitHistoryChange_fn).call(this)}),this.config.customTools)for(const[n,r]of Object.entries(this.config.customTools)){if(r===null){this.tools.delete(n);continue}this.tools.set(n,r)}this.config.experimentalScriptExecutionTool||this.tools.delete("execute_javascript")}get status(){return __privateGet$2(this,_status)}pushObservation(t){__privateGet$2(this,_observations).push(t)}stop(){this.pageController.cleanUpHighlights(),this.pageController.hideMask(),__privateGet$2(this,_abortController).abort()}async execute(t){var a,l,d;if(this.disposed)throw new Error("PageAgent has been disposed. Create a new instance.");if(!t)throw new Error("Task is required");this.task=t,this.taskId=uid(),this.onAskUser||this.tools.delete("ask_user");const n=this.config.onBeforeStep,r=this.config.onAfterStep,o=this.config.onBeforeTask,i=this.config.onAfterTask;await(o==null?void 0:o(this)),await this.pageController.showMask(),__privateGet$2(this,_abortController)&&(__privateGet$2(this,_abortController).abort(),__privateSet$2(this,_abortController,new AbortController)),this.history=[],__privateMethod$2(this,_PageAgentCore_instances,setStatus_fn).call(this,"running"),__privateMethod$2(this,_PageAgentCore_instances,emitHistoryChange_fn).call(this),__privateSet$2(this,_observations,[]),__privateSet$2(this,_states,{totalWaitTime:0,lastURL:"",browserState:null});let s=0;for(;;){try{console.group(`step: ${s}`),await(n==null?void 0:n(this,s)),console.log(chalk.blue.bold("👀 Observing...")),__privateGet$2(this,_states).browserState=await this.pageController.getBrowserState(),await __privateMethod$2(this,_PageAgentCore_instances,handleObservations_fn).call(this,s);const m=[{role:"system",content:__privateMethod$2(this,_PageAgentCore_instances,getSystemPrompt_fn).call(this)},{role:"user",content:await __privateMethod$2(this,_PageAgentCore_instances,assembleUserPrompt_fn).call(this)}],w={AgentOutput:__privateMethod$2(this,_PageAgentCore_instances,packMacroTool_fn).call(this)};console.log(chalk.blue.bold("🧠 Thinking...")),__privateMethod$2(this,_PageAgentCore_instances,emitActivity_fn).call(this,{type:"thinking"});const h=await __privateGet$2(this,_llm).invoke(m,w,__privateGet$2(this,_abortController).signal,{toolChoiceName:"AgentOutput",normalizeResponse:__name$4(f=>normalizeResponse(f,this.tools),"normalizeResponse")}),b=h.toolResult,_=b.input,S=b.output,v={evaluation_previous_goal:_.evaluation_previous_goal,memory:_.memory,next_goal:_.next_goal},u=Object.keys(_.action)[0],p={name:u,input:_.action[u],output:S};if(this.history.push({type:"step",stepIndex:s,reflection:v,action:p,usage:h.usage,rawResponse:h.rawResponse,rawRequest:h.rawRequest}),__privateMethod$2(this,_PageAgentCore_instances,emitHistoryChange_fn).call(this),await(r==null?void 0:r(this,this.history)),console.groupEnd(),u==="done"){const f=((a=p.input)==null?void 0:a.success)??!1,y=((l=p.input)==null?void 0:l.text)||"no text provided";console.log(chalk.green.bold("Task completed"),f,y),__privateMethod$2(this,_PageAgentCore_instances,onDone_fn).call(this,f);const $={success:f,data:y,history:this.history};return await(i==null?void 0:i(this,$)),$}}catch(m){console.groupEnd();const w=((d=m==null?void 0:m.rawError)==null?void 0:d.name)==="AbortError";console.error("Task failed",m);const h=w?"Task stopped":String(m);__privateMethod$2(this,_PageAgentCore_instances,emitActivity_fn).call(this,{type:"error",message:h}),this.history.push({type:"error",message:h,rawResponse:m}),__privateMethod$2(this,_PageAgentCore_instances,emitHistoryChange_fn).call(this),__privateMethod$2(this,_PageAgentCore_instances,onDone_fn).call(this,!1);const b={success:!1,data:h,history:this.history};return await(i==null?void 0:i(this,b)),b}if(s++,s>this.config.maxSteps){const m="Step count exceeded maximum limit";this.history.push({type:"error",message:m}),__privateMethod$2(this,_PageAgentCore_instances,emitHistoryChange_fn).call(this),__privateMethod$2(this,_PageAgentCore_instances,onDone_fn).call(this,!1);const w={success:!1,data:m,history:this.history};return await(i==null?void 0:i(this,w)),w}await waitFor$1(this.config.stepDelay??.4)}}dispose(){var t,n;console.log("Disposing PageAgent..."),this.disposed=!0,this.pageController.dispose(),__privateGet$2(this,_abortController).abort(),this.dispatchEvent(new Event("dispose")),(n=(t=this.config).onDispose)==null||n.call(t,this)}};_status=new WeakMap,_llm=new WeakMap,_abortController=new WeakMap,_observations=new WeakMap,_states=new WeakMap,_PageAgentCore_instances=new WeakSet,emitStatusChange_fn=__name$4(function(){this.dispatchEvent(new Event("statuschange"))},"#emitStatusChange"),emitHistoryChange_fn=__name$4(function(){this.dispatchEvent(new Event("historychange"))},"#emitHistoryChange"),emitActivity_fn=__name$4(function(e){this.dispatchEvent(new CustomEvent("activity",{detail:e}))},"#emitActivity"),setStatus_fn=__name$4(function(e){__privateGet$2(this,_status)!==e&&(__privateSet$2(this,_status,e),__privateMethod$2(this,_PageAgentCore_instances,emitStatusChange_fn).call(this))},"#setStatus"),packMacroTool_fn=__name$4(function(){const e=this.tools,t=Array.from(e.entries()).map(([o,i])=>object({[o]:i.inputSchema}).describe(i.description)),n=union(t);return{description:"You MUST call this tool every step!",inputSchema:object({evaluation_previous_goal:string().optional(),memory:string().optional(),next_goal:string().optional(),action:n}),execute:__name$4(async o=>{if(__privateGet$2(this,_abortController).signal.aborted)throw new Error("AbortError");console.log(chalk.blue.bold("MacroTool input"),o);const i=o.action,s=Object.keys(i)[0],a=i[s],l=[];o.evaluation_previous_goal&&l.push(`✅: ${o.evaluation_previous_goal}`),o.memory&&l.push(`💾: ${o.memory}`),o.next_goal&&l.push(`🎯: ${o.next_goal}`);const d=l.length>0?l.join(`
`):"";d&&console.log(d);const m=e.get(s);assert(m,`Tool ${s} not found`),console.log(chalk.blue.bold(`Executing tool: ${s}`),a),__privateMethod$2(this,_PageAgentCore_instances,emitActivity_fn).call(this,{type:"executing",tool:s,input:a});const w=Date.now(),h=await m.execute.bind(this)(a),b=Date.now()-w;return console.log(chalk.green.bold(`Tool (${s}) executed for ${b}ms`),h),__privateMethod$2(this,_PageAgentCore_instances,emitActivity_fn).call(this,{type:"executed",tool:s,input:a,output:h,duration:b}),s==="wait"?__privateGet$2(this,_states).totalWaitTime+=(a==null?void 0:a.seconds)||0:__privateGet$2(this,_states).totalWaitTime=0,{input:o,output:h}},"execute")}},"#packMacroTool"),getSystemPrompt_fn=__name$4(function(){if(this.config.customSystemPrompt)return this.config.customSystemPrompt;const e=this.config.language==="zh-CN"?"中文":"English";return SYSTEM_PROMPT.replace(/Default working language: \*\*.*?\*\*/,`Default working language: **${e}**`)},"#getSystemPrompt"),getInstructions_fn=__name$4(async function(){var a,l,d;const{instructions:e,experimentalLlmsTxt:t}=this.config,n=(a=e==null?void 0:e.system)==null?void 0:a.trim();let r;const o=((l=__privateGet$2(this,_states).browserState)==null?void 0:l.url)||"";if(e!=null&&e.getPageInstructions&&o)try{r=(d=e.getPageInstructions(o))==null?void 0:d.trim()}catch(m){console.error(chalk.red("[PageAgent] Failed to execute getPageInstructions callback:"),m)}const i=t&&o?await fetchLlmsTxt(o):void 0;if(!n&&!r&&!i)return"";let s=`<instructions>
`;return n&&(s+=`<system_instructions>
${n}
</system_instructions>
`),r&&(s+=`<page_instructions>
${r}
</page_instructions>
`),i&&(s+=`<llms_txt>
${i}
</llms_txt>
`),s+=`</instructions>

`,s},"#getInstructions"),handleObservations_fn=__name$4(async function(e){var r;__privateGet$2(this,_states).totalWaitTime>=3&&this.pushObservation(`You have waited ${__privateGet$2(this,_states).totalWaitTime} seconds accumulatively. DO NOT wait any longer unless you have a good reason.`);const t=((r=__privateGet$2(this,_states).browserState)==null?void 0:r.url)||"";t!==__privateGet$2(this,_states).lastURL&&(this.pushObservation(`Page navigated to → ${t}`),__privateGet$2(this,_states).lastURL=t,await waitFor$1(.5));const n=this.config.maxSteps-e;if(n===5?this.pushObservation(`⚠️ Only ${n} steps remaining. Consider wrapping up or calling done with partial results.`):n===2&&this.pushObservation(`⚠️ Critical: Only ${n} steps left! You must finish the task or call done immediately.`),__privateGet$2(this,_observations).length>0){for(const o of __privateGet$2(this,_observations))this.history.push({type:"observation",content:o}),console.log(chalk.cyan("Observation:"),o);__privateSet$2(this,_observations,[]),__privateMethod$2(this,_PageAgentCore_instances,emitHistoryChange_fn).call(this)}},"#handleObservations"),assembleUserPrompt_fn=__name$4(async function(){const e=__privateGet$2(this,_states).browserState;let t="";t+=await __privateMethod$2(this,_PageAgentCore_instances,getInstructions_fn).call(this);const n=this.history.filter(i=>i.type==="step").length;t+=`<agent_state>
`,t+=`<user_request>
`,t+=`${this.task}
`,t+=`</user_request>
`,t+=`<step_info>
`,t+=`Step ${n+1} of ${this.config.maxSteps} max possible steps
`,t+=`Current time: ${new Date().toLocaleString()}
`,t+=`</step_info>
`,t+=`</agent_state>

`,t+=`<agent_history>
`;let r=0;for(const i of this.history)i.type==="step"?(r++,t+=`<step_${r}>
`,t+=`Evaluation of Previous Step: ${i.reflection.evaluation_previous_goal}
`,t+=`Memory: ${i.reflection.memory}
`,t+=`Next Goal: ${i.reflection.next_goal}
`,t+=`Action Results: ${i.action.output}
`,t+=`</step_${r}>
`):i.type==="observation"?t+=`<sys>${i.content}</sys>
`:i.type==="user_takeover"?t+=`<sys>User took over control and made changes to the page</sys>
`:i.type;t+=`</agent_history>

`;let o=e.content;return this.config.transformPageContent&&(o=await this.config.transformPageContent(o)),t+=`<browser_state>
`,t+=e.header+`
`,t+=o+`
`,t+=e.footer+`

`,t+=`</browser_state>

`,t},"#assembleUserPrompt"),onDone_fn=__name$4(function(e=!0){this.pageController.cleanUpHighlights(),this.pageController.hideMask(),__privateMethod$2(this,_PageAgentCore_instances,setStatus_fn).call(this,e?"completed":"error"),__privateGet$2(this,_abortController).abort()},"#onDone"),__name$4(_PageAgentCore,"PageAgentCore");let PageAgentCore=_PageAgentCore;var __defProp$3=Object.defineProperty,__name$3=(e,t)=>__defProp$3(e,"name",{value:t,configurable:!0});function isHTMLElement(e){return!!e&&e.nodeType===1}__name$3(isHTMLElement,"isHTMLElement");function isInputElement(e){return(e==null?void 0:e.nodeType)===1&&e.tagName==="INPUT"}__name$3(isInputElement,"isInputElement");function isTextAreaElement(e){return(e==null?void 0:e.nodeType)===1&&e.tagName==="TEXTAREA"}__name$3(isTextAreaElement,"isTextAreaElement");function isSelectElement(e){return(e==null?void 0:e.nodeType)===1&&e.tagName==="SELECT"}__name$3(isSelectElement,"isSelectElement");function isAnchorElement(e){return(e==null?void 0:e.nodeType)===1&&e.tagName==="A"}__name$3(isAnchorElement,"isAnchorElement");function getIframeOffset(e){var r;const t=(r=e.ownerDocument.defaultView)==null?void 0:r.frameElement;if(!t)return{x:0,y:0};const n=t.getBoundingClientRect();return{x:n.left,y:n.top}}__name$3(getIframeOffset,"getIframeOffset");function getNativeValueSetter(e){return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),"value").set}__name$3(getNativeValueSetter,"getNativeValueSetter");async function waitFor(e){await new Promise(t=>setTimeout(t,e*1e3))}__name$3(waitFor,"waitFor");async function movePointerToElement(e,t,n){const r=getIframeOffset(e);window.dispatchEvent(new CustomEvent("PageAgent::MovePointerTo",{detail:{x:t+r.x,y:n+r.y}})),await waitFor(.3)}__name$3(movePointerToElement,"movePointerToElement");async function clickPointer(){window.dispatchEvent(new CustomEvent("PageAgent::ClickPointer"))}__name$3(clickPointer,"clickPointer");async function enablePassThrough(){window.dispatchEvent(new CustomEvent("PageAgent::EnablePassThrough"))}__name$3(enablePassThrough,"enablePassThrough");async function disablePassThrough(){window.dispatchEvent(new CustomEvent("PageAgent::DisablePassThrough"))}__name$3(disablePassThrough,"disablePassThrough");function getElementByIndex(e,t){const n=e.get(t);if(!n)throw new Error(`No interactive element found at index ${t}`);const r=n.ref;if(!r)throw new Error(`Element at index ${t} does not have a reference`);if(!isHTMLElement(r))throw new Error(`Element at index ${t} is not an HTMLElement`);return r}__name$3(getElementByIndex,"getElementByIndex");let lastClickedElement=null;function blurLastClickedElement(){lastClickedElement&&(lastClickedElement.dispatchEvent(new PointerEvent("pointerout",{bubbles:!0})),lastClickedElement.dispatchEvent(new PointerEvent("pointerleave",{bubbles:!1})),lastClickedElement.dispatchEvent(new MouseEvent("mouseout",{bubbles:!0})),lastClickedElement.dispatchEvent(new MouseEvent("mouseleave",{bubbles:!1})),lastClickedElement.blur(),lastClickedElement=null)}__name$3(blurLastClickedElement,"blurLastClickedElement");async function clickElement(e){var m;blurLastClickedElement(),lastClickedElement=e,await scrollIntoViewIfNeeded(e);const t=(m=e.ownerDocument.defaultView)==null?void 0:m.frameElement;t&&await scrollIntoViewIfNeeded(t);const n=e.getBoundingClientRect(),r=n.left+n.width/2,o=n.top+n.height/2;await movePointerToElement(e,r,o),await clickPointer(),await waitFor(.1);const i=e.ownerDocument;await enablePassThrough();const s=i.elementFromPoint(r,o);await disablePassThrough();const a=s instanceof HTMLElement&&e.contains(s)?s:e,l={bubbles:!0,cancelable:!0,clientX:r,clientY:o,pointerType:"mouse"},d={bubbles:!0,cancelable:!0,clientX:r,clientY:o,button:0};a.dispatchEvent(new PointerEvent("pointerover",l)),a.dispatchEvent(new PointerEvent("pointerenter",{...l,bubbles:!1})),a.dispatchEvent(new MouseEvent("mouseover",d)),a.dispatchEvent(new MouseEvent("mouseenter",{...d,bubbles:!1})),a.dispatchEvent(new PointerEvent("pointerdown",l)),a.dispatchEvent(new MouseEvent("mousedown",d)),e.focus({preventScroll:!0}),a.dispatchEvent(new PointerEvent("pointerup",l)),a.dispatchEvent(new MouseEvent("mouseup",d)),a.click(),await waitFor(.2)}__name$3(clickElement,"clickElement");async function inputTextElement(e,t){const n=e.isContentEditable;if(!isInputElement(e)&&!isTextAreaElement(e)&&!n)throw new Error("Element is not an input, textarea, or contenteditable");if(await clickElement(e),n){if(e.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"deleteContent"}))&&(e.innerText="",e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"deleteContent"}))),e.dispatchEvent(new InputEvent("beforeinput",{bubbles:!0,cancelable:!0,inputType:"insertText",data:t}))&&(e.innerText=t,e.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText",data:t}))),!(e.innerText.trim()===t.trim())){e.focus();const o=e.ownerDocument,i=(o.defaultView||window).getSelection(),s=o.createRange();s.selectNodeContents(e),i==null||i.removeAllRanges(),i==null||i.addRange(s),o.execCommand("delete",!1),o.execCommand("insertText",!1,t)}e.dispatchEvent(new Event("change",{bubbles:!0})),e.blur()}else getNativeValueSetter(e).call(e,t);n||e.dispatchEvent(new Event("input",{bubbles:!0})),await waitFor(.1),blurLastClickedElement()}__name$3(inputTextElement,"inputTextElement");async function selectOptionElement(e,t){if(!isSelectElement(e))throw new Error("Element is not a select element");const r=Array.from(e.options).find(o=>{var i;return((i=o.textContent)==null?void 0:i.trim())===t.trim()});if(!r)throw new Error(`Option with text "${t}" not found in select element`);e.value=r.value,e.dispatchEvent(new Event("change",{bubbles:!0})),await waitFor(.1)}__name$3(selectOptionElement,"selectOptionElement");async function scrollIntoViewIfNeeded(e){const t=e;typeof t.scrollIntoViewIfNeeded=="function"?t.scrollIntoViewIfNeeded():e.scrollIntoView({behavior:"auto",block:"center",inline:"nearest"})}__name$3(scrollIntoViewIfNeeded,"scrollIntoViewIfNeeded");async function scrollVertically(e,t){if(t){const s=t;let a=s,l=!1,d=null,m=0,w=0;const h=e;for(;a&&w<10;){const b=window.getComputedStyle(a),_=/(auto|scroll|overlay)/.test(b.overflowY)||b.scrollbarWidth&&b.scrollbarWidth!=="auto"||b.scrollbarGutter&&b.scrollbarGutter!=="auto",S=a.scrollHeight>a.clientHeight;if(_&&S){const v=a.scrollTop,u=a.scrollHeight-a.clientHeight;let p=h/3;p>0?p=Math.min(p,u-v):p=Math.max(p,-v),a.scrollTop=v+p;const y=a.scrollTop-v;if(Math.abs(y)>.5){l=!0,d=a,m=y;break}}if(a===document.body||a===document.documentElement)break;a=a.parentElement,w++}return l?`Scrolled container (${d==null?void 0:d.tagName}) by ${m}px`:`No scrollable container found for element (${s.tagName})`}const n=e,r=__name$3(s=>s.clientHeight>=window.innerHeight*.5,"bigEnough"),o=__name$3(s=>s&&/(auto|scroll|overlay)/.test(getComputedStyle(s).overflowY)&&s.scrollHeight>s.clientHeight&&r(s),"canScroll");let i=document.activeElement;for(;i&&!o(i)&&i!==document.body;)i=i.parentElement;if(i=o(i)?i:Array.from(document.querySelectorAll("*")).find(o)||document.scrollingElement||document.documentElement,i===document.scrollingElement||i===document.documentElement||i===document.body){const s=window.scrollY,a=document.documentElement.scrollHeight-window.innerHeight;window.scrollBy(0,n);const l=window.scrollY,d=l-s;if(Math.abs(d)<1)return n>0?"⚠️ Already at the bottom of the page, cannot scroll down further.":"⚠️ Already at the top of the page, cannot scroll up further.";const m=n>0&&l>=a-1,w=n<0&&l<=1;return m?`✅ Scrolled page by ${d}px. Reached the bottom of the page.`:w?`✅ Scrolled page by ${d}px. Reached the top of the page.`:`✅ Scrolled page by ${d}px.`}else{const s="The document is not scrollable. Falling back to container scroll.";console.log(`[PageController] ${s}`);const a=i.scrollTop,l=i.scrollHeight-i.clientHeight;i.scrollBy({top:n,behavior:"smooth"}),await waitFor(.1);const d=i.scrollTop,m=d-a;if(Math.abs(m)<1)return n>0?`⚠️ ${s} Already at the bottom of container (${i.tagName}), cannot scroll down further.`:`⚠️ ${s} Already at the top of container (${i.tagName}), cannot scroll up further.`;const w=n>0&&d>=l-1,h=n<0&&d<=1;return w?`✅ ${s} Scrolled container (${i.tagName}) by ${m}px. Reached the bottom.`:h?`✅ ${s} Scrolled container (${i.tagName}) by ${m}px. Reached the top.`:`✅ ${s} Scrolled container (${i.tagName}) by ${m}px.`}}__name$3(scrollVertically,"scrollVertically");async function scrollHorizontally(e,t){if(t){const s=t;let a=s,l=!1,d=null,m=0,w=0;const h=e;for(;a&&w<10;){const b=window.getComputedStyle(a),_=/(auto|scroll|overlay)/.test(b.overflowX)||b.scrollbarWidth&&b.scrollbarWidth!=="auto"||b.scrollbarGutter&&b.scrollbarGutter!=="auto",S=a.scrollWidth>a.clientWidth;if(_&&S){const v=a.scrollLeft,u=a.scrollWidth-a.clientWidth;let p=h/3;p>0?p=Math.min(p,u-v):p=Math.max(p,-v),a.scrollLeft=v+p;const y=a.scrollLeft-v;if(Math.abs(y)>.5){l=!0,d=a,m=y;break}}if(a===document.body||a===document.documentElement)break;a=a.parentElement,w++}return l?`Scrolled container (${d==null?void 0:d.tagName}) horizontally by ${m}px`:`No horizontally scrollable container found for element (${s.tagName})`}const n=e,r=__name$3(s=>s.clientWidth>=window.innerWidth*.5,"bigEnough"),o=__name$3(s=>s&&/(auto|scroll|overlay)/.test(getComputedStyle(s).overflowX)&&s.scrollWidth>s.clientWidth&&r(s),"canScroll");let i=document.activeElement;for(;i&&!o(i)&&i!==document.body;)i=i.parentElement;if(i=o(i)?i:Array.from(document.querySelectorAll("*")).find(o)||document.scrollingElement||document.documentElement,i===document.scrollingElement||i===document.documentElement||i===document.body){const s=window.scrollX,a=document.documentElement.scrollWidth-window.innerWidth;window.scrollBy(n,0);const l=window.scrollX,d=l-s;if(Math.abs(d)<1)return n>0?"⚠️ Already at the right edge of the page, cannot scroll right further.":"⚠️ Already at the left edge of the page, cannot scroll left further.";const m=n>0&&l>=a-1,w=n<0&&l<=1;return m?`✅ Scrolled page by ${d}px. Reached the right edge of the page.`:w?`✅ Scrolled page by ${d}px. Reached the left edge of the page.`:`✅ Scrolled page horizontally by ${d}px.`}else{const s="The document is not scrollable. Falling back to container scroll.";console.log(`[PageController] ${s}`);const a=i.scrollLeft,l=i.scrollWidth-i.clientWidth;i.scrollBy({left:n,behavior:"smooth"}),await waitFor(.1);const d=i.scrollLeft,m=d-a;if(Math.abs(m)<1)return n>0?`⚠️ ${s} Already at the right edge of container (${i.tagName}), cannot scroll right further.`:`⚠️ ${s} Already at the left edge of container (${i.tagName}), cannot scroll left further.`;const w=n>0&&d>=l-1,h=n<0&&d<=1;return w?`✅ ${s} Scrolled container (${i.tagName}) by ${m}px. Reached the right edge.`:h?`✅ ${s} Scrolled container (${i.tagName}) by ${m}px. Reached the left edge.`:`✅ ${s} Scrolled container (${i.tagName}) horizontally by ${m}px.`}}__name$3(scrollHorizontally,"scrollHorizontally");const domTree=__name$3((e={doHighlightElements:!0,focusHighlightIndex:-1,viewportExpansion:0,debugMode:!1,interactiveBlacklist:[],interactiveWhitelist:[],highlightOpacity:.1,highlightLabelOpacity:.5})=>{const{interactiveBlacklist:t,interactiveWhitelist:n,highlightOpacity:r,highlightLabelOpacity:o}=e,{doHighlightElements:i,focusHighlightIndex:s,viewportExpansion:a,debugMode:l}=e;let d=0;const m=new WeakMap;function w(c,g){!c||c.nodeType!==Node.ELEMENT_NODE||m.set(c,{...m.get(c),...g})}__name$3(w,"addExtraData");const h={boundingRects:new WeakMap,clientRects:new WeakMap,computedStyles:new WeakMap,clearCache:__name$3(()=>{h.boundingRects=new WeakMap,h.clientRects=new WeakMap,h.computedStyles=new WeakMap},"clearCache")};function b(c){if(!c)return null;if(h.boundingRects.has(c))return h.boundingRects.get(c);const g=c.getBoundingClientRect();return g&&h.boundingRects.set(c,g),g}__name$3(b,"getCachedBoundingRect");function _(c){if(!c)return null;if(h.computedStyles.has(c))return h.computedStyles.get(c);const g=window.getComputedStyle(c);return g&&h.computedStyles.set(c,g),g}__name$3(_,"getCachedComputedStyle");function S(c){if(!c)return null;if(h.clientRects.has(c))return h.clientRects.get(c);const g=c.getClientRects();return g&&h.clientRects.set(c,g),g}__name$3(S,"getCachedClientRects");const v={},u={current:0},p="playwright-highlight-container";function f(c,g,T=null){if(!c)return g;const x=[];let k=null,L=20,P=16,Y=null;try{let C=document.getElementById(p);C||(C=document.createElement("div"),C.id=p,C.style.position="fixed",C.style.pointerEvents="none",C.style.top="0",C.style.left="0",C.style.width="100%",C.style.height="100%",C.style.zIndex="2147483640",C.style.backgroundColor="transparent",document.body.appendChild(C));const q=c.getClientRects();if(!q||q.length===0)return g;const U=["#FF0000","#00FF00","#0000FF","#FFA500","#800080","#008080","#FF69B4","#4B0082","#FF4500","#2E8B57","#DC143C","#4682B4"],D=g%U.length;let oe=U[D];const Z=oe+Math.floor(r*255).toString(16).padStart(2,"0");oe=oe+Math.floor(o*255).toString(16).padStart(2,"0");let I={x:0,y:0};if(T){const W=T.getBoundingClientRect();I.x=W.left,I.y=W.top}const A=document.createDocumentFragment();for(const W of q){if(W.width===0||W.height===0)continue;const B=document.createElement("div");B.style.position="fixed",B.style.border=`2px solid ${oe}`,B.style.backgroundColor=Z,B.style.pointerEvents="none",B.style.boxSizing="border-box";const M=W.top+I.y,se=W.left+I.x;B.style.top=`${M}px`,B.style.left=`${se}px`,B.style.width=`${W.width}px`,B.style.height=`${W.height}px`,A.appendChild(B),x.push({element:B,initialRect:W})}const G=q[0];k=document.createElement("div"),k.className="playwright-highlight-label",k.style.position="fixed",k.style.background=oe,k.style.color="white",k.style.padding="1px 4px",k.style.borderRadius="4px",k.style.fontSize=`${Math.min(12,Math.max(8,G.height/2))}px`,k.textContent=g.toString(),L=k.offsetWidth>0?k.offsetWidth:L,P=k.offsetHeight>0?k.offsetHeight:P;const re=G.top+I.y,le=G.left+I.x;let ie=re+2,ae=le+G.width-L-2;(G.width<L+4||G.height<P+4)&&(ie=re-P-2,ae=le+G.width-L,ae<I.x&&(ae=le)),ie=Math.max(0,Math.min(ie,window.innerHeight-P)),ae=Math.max(0,Math.min(ae,window.innerWidth-L)),k.style.top=`${ie}px`,k.style.left=`${ae}px`,A.appendChild(k);const he=__name$3((W,B)=>{let M=0;return(...se)=>{const te=performance.now();if(!(te-M<B))return M=te,W(...se)}},"throttleFunction")(__name$3(()=>{const W=c.getClientRects();let B={x:0,y:0};if(T){const M=T.getBoundingClientRect();B.x=M.left,B.y=M.top}if(x.forEach((M,se)=>{if(se<W.length){const te=W[se],de=te.top+B.y,ce=te.left+B.x;M.element.style.top=`${de}px`,M.element.style.left=`${ce}px`,M.element.style.width=`${te.width}px`,M.element.style.height=`${te.height}px`,M.element.style.display=te.width===0||te.height===0?"none":"block"}else M.element.style.display="none"}),W.length<x.length)for(let M=W.length;M<x.length;M++)x[M].element.style.display="none";if(k&&W.length>0){const M=W[0],se=M.top+B.y,te=M.left+B.x;let de=se+2,ce=te+M.width-L-2;(M.width<L+4||M.height<P+4)&&(de=se-P-2,ce=te+M.width-L,ce<B.x&&(ce=te)),de=Math.max(0,Math.min(de,window.innerHeight-P)),ce=Math.max(0,Math.min(ce,window.innerWidth-L)),k.style.top=`${de}px`,k.style.left=`${ce}px`,k.style.display="block"}else k&&(k.style.display="none")},"updatePositions"),16);return window.addEventListener("scroll",he,!0),window.addEventListener("resize",he),Y=__name$3(()=>{window.removeEventListener("scroll",he,!0),window.removeEventListener("resize",he),x.forEach(W=>W.element.remove()),k&&k.remove()},"cleanupFn"),C.appendChild(A),g+1}finally{Y&&(window._highlightCleanupFunctions=window._highlightCleanupFunctions||[]).push(Y)}}__name$3(f,"highlightElement");function y(c){if(!c||c.nodeType!==Node.ELEMENT_NODE)return null;const g=_(c);if(!g)return null;const T=g.display;if(T==="inline"||T==="inline-block")return null;const x=g.overflowX,k=g.overflowY,L=g.scrollbarWidth&&g.scrollbarWidth!=="auto"||g.scrollbarGutter&&g.scrollbarGutter!=="auto",P=x==="auto"||x==="scroll",Y=k==="auto"||k==="scroll";if(!P&&!Y&&!L)return null;const C=c.scrollWidth-c.clientWidth,q=c.scrollHeight-c.clientHeight,U=4;if(C<U&&q<U||!Y&&!L&&C<U||!P&&!L&&q<U)return null;const D=c.scrollTop,oe=c.scrollLeft,Z=c.scrollWidth-c.clientWidth-c.scrollLeft,I=c.scrollHeight-c.clientHeight-c.scrollTop,A={top:D,right:Z,bottom:I,left:oe};return w(c,{scrollable:!0,scrollData:A}),console.log("scrollData!!!",A),A}__name$3(y,"isScrollableElement");function $(c){try{if(a===-1){const P=c.parentElement;if(!P)return!1;try{return P.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0})}catch{const C=window.getComputedStyle(P);return C.display!=="none"&&C.visibility!=="hidden"&&C.opacity!=="0"}}const g=document.createRange();g.selectNodeContents(c);const T=g.getClientRects();if(!T||T.length===0)return!1;let x=!1,k=!1;for(const P of T)if(P.width>0&&P.height>0&&(x=!0,!(P.bottom<-a||P.top>window.innerHeight+a||P.right<-a||P.left>window.innerWidth+a))){k=!0;break}if(!x||!k)return!1;const L=c.parentElement;if(!L)return!1;try{return L.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0})}catch{const Y=window.getComputedStyle(L);return Y.display!=="none"&&Y.visibility!=="hidden"&&Y.opacity!=="0"}}catch(g){return console.warn("Error checking text node visibility:",g),!1}}__name$3($,"isTextNodeVisible");function E(c){if(!c||!c.tagName)return!1;const g=new Set(["body","div","main","article","section","nav","header","footer"]),T=c.tagName.toLowerCase();return g.has(T)?!0:!new Set(["svg","script","style","link","meta","noscript","template"]).has(T)}__name$3(E,"isElementAccepted");function z(c){const g=_(c);return c.offsetWidth>0&&c.offsetHeight>0&&(g==null?void 0:g.visibility)!=="hidden"&&(g==null?void 0:g.display)!=="none"}__name$3(z,"isElementVisible");function N(c){var Z,I;if(!c||c.nodeType!==Node.ELEMENT_NODE||t.includes(c))return!1;if(n.includes(c))return!0;const g=c.tagName.toLowerCase(),T=_(c),x=new Set(["pointer","move","text","grab","grabbing","cell","copy","alias","all-scroll","col-resize","context-menu","crosshair","e-resize","ew-resize","help","n-resize","ne-resize","nesw-resize","ns-resize","nw-resize","nwse-resize","row-resize","s-resize","se-resize","sw-resize","vertical-text","w-resize","zoom-in","zoom-out"]),k=new Set(["not-allowed","no-drop","wait","progress","initial","inherit"]);function L(A){return A.tagName.toLowerCase()==="html"?!1:!!(T!=null&&T.cursor&&x.has(T.cursor))}if(__name$3(L,"doesElementHaveInteractivePointer"),L(c))return!0;const Y=new Set(["a","button","input","select","textarea","details","summary","label","option","optgroup","fieldset","legend"]),C=new Set(["disabled","readonly"]);if(Y.has(g)){if(T!=null&&T.cursor&&k.has(T.cursor))return!1;for(const A of C)if(c.hasAttribute(A)||c.getAttribute(A)==="true"||c.getAttribute(A)==="")return!1;return!(c.disabled||c.readOnly||c.inert)}const q=c.getAttribute("role"),U=c.getAttribute("aria-role");if(c.getAttribute("contenteditable")==="true"||c.isContentEditable||c.classList&&(c.classList.contains("button")||c.classList.contains("dropdown-toggle")||c.getAttribute("data-index")||c.getAttribute("data-toggle")==="dropdown"||c.getAttribute("aria-haspopup")==="true"))return!0;const D=new Set(["button","menu","menubar","menuitem","menuitemradio","menuitemcheckbox","radio","checkbox","tab","switch","slider","spinbutton","combobox","searchbox","textbox","listbox","option","scrollbar"]);if(Y.has(g)||q&&D.has(q)||U&&D.has(U))return!0;try{if(typeof getEventListeners=="function"){const re=getEventListeners(c),le=["click","mousedown","mouseup","dblclick"];for(const ie of le)if(re[ie]&&re[ie].length>0)return!0}const A=((I=(Z=c==null?void 0:c.ownerDocument)==null?void 0:Z.defaultView)==null?void 0:I.getEventListenersForNode)||window.getEventListenersForNode;if(typeof A=="function"){const re=A(c),le=["click","mousedown","mouseup","keydown","keyup","submit","change","input","focus","blur"];for(const ie of le)for(const ae of re)if(ae.type===ie)return!0}const G=["onclick","onmousedown","onmouseup","ondblclick"];for(const re of G)if(c.hasAttribute(re)||typeof c[re]=="function")return!0}catch{}return!!y(c)}__name$3(N,"isInteractiveElement");function j(c){if(a===-1)return!0;const g=S(c);if(!g||g.length===0)return!1;let T=!1;for(const C of g)if(C.width>0&&C.height>0&&!(C.bottom<-a||C.top>window.innerHeight+a||C.right<-a||C.left>window.innerWidth+a)){T=!0;break}if(!T)return!1;if(c.ownerDocument!==window.document)return!0;let k=Array.from(g).find(C=>C.width>0&&C.height>0);if(!k)return!1;const L=c.getRootNode();if(L instanceof ShadowRoot){const C=k.left+k.width/2,q=k.top+k.height/2;try{const U=L.elementFromPoint(C,q);if(!U)return!1;let D=U;for(;D&&D!==L;){if(D===c)return!0;D=D.parentElement}return!1}catch{return!0}}const P=5;return[{x:k.left+k.width/2,y:k.top+k.height/2},{x:k.left+P,y:k.top+P},{x:k.right-P,y:k.bottom-P}].some(({x:C,y:q})=>{try{const U=document.elementFromPoint(C,q);if(!U)return!1;let D=U;for(;D&&D!==document.documentElement;){if(D===c)return!0;D=D.parentElement}return!1}catch{return!0}})}__name$3(j,"isTopElement");function X(c,g){if(g===-1)return!0;const T=c.getClientRects();if(!T||T.length===0){const x=b(c);return!x||x.width===0||x.height===0?!1:!(x.bottom<-g||x.top>window.innerHeight+g||x.right<-g||x.left>window.innerWidth+g)}for(const x of T)if(!(x.width===0||x.height===0)&&!(x.bottom<-g||x.top>window.innerHeight+g||x.right<-g||x.left>window.innerWidth+g))return!0;return!1}__name$3(X,"isInExpandedViewport");const F=["aria-expanded","aria-checked","aria-selected","aria-pressed","aria-haspopup","aria-controls","aria-owns","aria-activedescendant","aria-valuenow","aria-valuetext","aria-valuemax","aria-valuemin","aria-autocomplete"];function R(c){for(let g=0;g<F.length;g++)if(c.hasAttribute(F[g]))return!0;return!1}__name$3(R,"hasInteractiveAria");function ne(c){if(!c||c.nodeType!==Node.ELEMENT_NODE)return!1;const g=c.tagName.toLowerCase();return new Set(["a","button","input","select","textarea","details","summary","label"]).has(g)?!0:c.hasAttribute("onclick")||c.hasAttribute("role")||c.hasAttribute("tabindex")||R(c)||c.hasAttribute("data-action")||c.getAttribute("contenteditable")==="true"}__name$3(ne,"isInteractiveCandidate");const K=new Set(["a","button","input","select","textarea","summary","details","label","option","li"]),J=new Set(["button","link","menuitem","menuitemradio","menuitemcheckbox","radio","checkbox","tab","switch","slider","spinbutton","combobox","searchbox","textbox","listbox","listitem","treeitem","row","option","scrollbar"]);function ee(c){if(!c||c.nodeType!==Node.ELEMENT_NODE||!z(c))return!1;const g=c.hasAttribute("role")||c.hasAttribute("tabindex")||c.hasAttribute("onclick")||typeof c.onclick=="function",T=/\b(btn|clickable|menu|item|entry|link)\b/i.test(c.className||""),x=!!c.closest('button,a,[role="button"],.menu,.dropdown,.list,.toolbar'),k=[...c.children].some(z),L=c.parentElement&&c.parentElement.isSameNode(document.body);return(N(c)||g||T)&&k&&x&&!L}__name$3(ee,"isHeuristicallyInteractive");function Q(c){var x,k,L;if(!c||c.nodeType!==Node.ELEMENT_NODE)return!1;const g=c.tagName.toLowerCase(),T=c.getAttribute("role");if(g==="iframe"||K.has(g)||T&&J.has(T)||c.isContentEditable||c.getAttribute("contenteditable")==="true"||c.hasAttribute("data-testid")||c.hasAttribute("data-cy")||c.hasAttribute("data-test")||c.hasAttribute("onclick")||typeof c.onclick=="function"||R(c))return!0;try{const P=((k=(x=c==null?void 0:c.ownerDocument)==null?void 0:x.defaultView)==null?void 0:k.getEventListenersForNode)||window.getEventListenersForNode;if(typeof P=="function"){const C=P(c),q=["click","mousedown","mouseup","keydown","keyup","submit","change","input","focus","blur"];for(const U of q)for(const D of C)if(D.type===U)return!0}if(["onmousedown","onmouseup","onkeydown","onkeyup","onsubmit","onchange","oninput","onfocus","onblur"].some(C=>c.hasAttribute(C)))return!0}catch{}return!!(ee(c)||(L=m.get(c))!=null&&L.scrollable)}__name$3(Q,"isElementDistinctInteraction");function V(c,g,T,x){if(!c.isInteractive)return!1;let k=!1;return x?Q(g)?k=!0:k=!1:k=!0,k&&(c.isInViewport=X(g,a),(c.isInViewport||a===-1)&&(c.highlightIndex=d++,i))?(s>=0?s===c.highlightIndex&&f(g,c.highlightIndex,T):f(g,c.highlightIndex,T),!0):!1}__name$3(V,"handleHighlighting");function H(c,g=null,T=!1){var P,Y,C,q,U,D,oe;if(!c||c.id===p||c.nodeType!==Node.ELEMENT_NODE&&c.nodeType!==Node.TEXT_NODE||!c||c.id===p||((P=c.dataset)==null?void 0:P.browserUseIgnore)==="true"||((Y=c.dataset)==null?void 0:Y.pageAgentIgnore)==="true"||c.getAttribute&&c.getAttribute("aria-hidden")==="true")return null;if(c===document.body){const Z={tagName:"body",attributes:{},xpath:"/body",children:[]};for(const A of c.childNodes){const G=H(A,g,!1);G&&Z.children.push(G)}const I=`${u.current++}`;return v[I]=Z,I}if(c.nodeType!==Node.ELEMENT_NODE&&c.nodeType!==Node.TEXT_NODE)return null;if(c.nodeType===Node.TEXT_NODE){const Z=(C=c.textContent)==null?void 0:C.trim();if(!Z)return null;const I=c.parentElement;if(!I||I.tagName.toLowerCase()==="script")return null;const A=`${u.current++}`;return v[A]={type:"TEXT_NODE",text:Z,isVisible:$(c)},A}if(c.nodeType===Node.ELEMENT_NODE&&!E(c))return null;if(a!==-1&&!c.shadowRoot){const Z=b(c),I=_(c),A=I&&(I.position==="fixed"||I.position==="sticky"),G=c.offsetWidth>0||c.offsetHeight>0;if(!Z||!A&&!G&&(Z.bottom<-a||Z.top>window.innerHeight+a||Z.right<-a||Z.left>window.innerWidth+a))return null}const x={tagName:c.tagName.toLowerCase(),attributes:{},children:[]};if(ne(c)||c.tagName.toLowerCase()==="iframe"||c.tagName.toLowerCase()==="body"){const Z=((q=c.getAttributeNames)==null?void 0:q.call(c))||[];for(const I of Z){const A=c.getAttribute(I);x.attributes[I]=A}c.tagName.toLowerCase()==="input"&&(c.type==="checkbox"||c.type==="radio")&&(x.attributes.checked=c.checked?"true":"false")}let k=!1;if(c.nodeType===Node.ELEMENT_NODE&&(x.isVisible=z(c),x.isVisible)){x.isTopElement=j(c);const Z=c.getAttribute("role"),I=Z==="menu"||Z==="menubar"||Z==="listbox";if((x.isTopElement||I)&&(x.isInteractive=N(c),k=V(x,c,g,T),x.ref=c,x.isInteractive&&Object.keys(x.attributes).length===0)){const A=((U=c.getAttributeNames)==null?void 0:U.call(c))||[];for(const G of A){const re=c.getAttribute(G);x.attributes[G]=re}}}if(c.tagName){const Z=c.tagName.toLowerCase();if(Z==="iframe")try{const I=c.contentDocument||((D=c.contentWindow)==null?void 0:D.document);if(I)for(const A of I.childNodes){const G=H(A,c,!1);G&&x.children.push(G)}}catch(I){console.warn("Unable to access iframe:",I)}else if(c.isContentEditable||c.getAttribute("contenteditable")==="true"||c.id==="tinymce"||c.classList.contains("mce-content-body")||Z==="body"&&((oe=c.getAttribute("data-id"))!=null&&oe.startsWith("mce_")))for(const I of c.childNodes){const A=H(I,g,k);A&&x.children.push(A)}else{if(c.shadowRoot){x.shadowRoot=!0;for(const I of c.shadowRoot.childNodes){const A=H(I,g,k);A&&x.children.push(A)}}for(const I of c.childNodes){const G=H(I,g,k||T);G&&x.children.push(G)}}}if(x.tagName==="a"&&x.children.length===0&&!x.attributes.href){const Z=b(c);if(!(Z&&Z.width>0&&Z.height>0||c.offsetWidth>0||c.offsetHeight>0))return null}x.extra=m.get(c)||null;const L=`${u.current++}`;return v[L]=x,L}__name$3(H,"buildDomTree");const ue=H(document.body);return h.clearCache(),{rootId:ue,map:v}},"domTree"),DEFAULT_VIEWPORT_EXPANSION=-1;function resolveViewportExpansion(e){return e??DEFAULT_VIEWPORT_EXPANSION}__name$3(resolveViewportExpansion,"resolveViewportExpansion");const SEMANTIC_TAGS=new Set(["nav","menu","header","footer","aside","dialog"]),newElementsCache=new WeakMap;function getFlatTree(e){const t=resolveViewportExpansion(e.viewportExpansion),n=[];for(const s of e.interactiveBlacklist||[])typeof s=="function"?n.push(s()):n.push(s);const r=[];for(const s of e.interactiveWhitelist||[])typeof s=="function"?r.push(s()):r.push(s);const o=domTree({doHighlightElements:!0,debugMode:!0,focusHighlightIndex:-1,viewportExpansion:t,interactiveBlacklist:n,interactiveWhitelist:r,highlightOpacity:e.highlightOpacity??0,highlightLabelOpacity:e.highlightLabelOpacity??.1}),i=window.location.href;for(const s in o.map){const a=o.map[s];if(a.isInteractive&&a.ref){const l=a.ref;newElementsCache.has(l)||(newElementsCache.set(l,i),a.isNew=!0)}}return o}__name$3(getFlatTree,"getFlatTree");const globRegexCache=new Map;function globToRegex(e){let t=globRegexCache.get(e);if(!t){const n=e.replace(/[.+^${}()|[\]\\]/g,"\\$&");t=new RegExp(`^${n.replace(/\*/g,".*")}$`),globRegexCache.set(e,t)}return t}__name$3(globToRegex,"globToRegex");function matchAttributes(e,t){const n={};for(const r of t)if(r.includes("*")){const o=globToRegex(r);for(const i of Object.keys(e))o.test(i)&&e[i].trim()&&(n[i]=e[i].trim())}else{const o=e[r];o&&o.trim()&&(n[r]=o.trim())}return n}__name$3(matchAttributes,"matchAttributes");function flatTreeToString(e,t=[],n=!1){const r=["title","type","checked","name","role","value","placeholder","data-date-format","alt","aria-label","aria-expanded","data-state","aria-checked","id","for","target","aria-haspopup","aria-controls","aria-owns","contenteditable"],o=[...t,...r],i=__name$3((h,b)=>h.length>b?h.substring(0,b)+"...":h,"capTextLength"),s=__name$3(h=>{const b=e.map[h];if(!b)return null;if(b.type==="TEXT_NODE"){const _=b;return{type:"text",text:_.text,isVisible:_.isVisible,parent:null,children:[]}}else{const _=b,S=[];if(_.children)for(const v of _.children){const u=s(v);u&&(u.parent=null,S.push(u))}return{type:"element",tagName:_.tagName,attributes:_.attributes??{},isVisible:_.isVisible??!1,isInteractive:_.isInteractive??!1,isTopElement:_.isTopElement??!1,isNew:_.isNew??!1,highlightIndex:_.highlightIndex,parent:null,children:S,extra:_.extra??{}}}},"buildTreeNode"),a=__name$3((h,b=null)=>{h.parent=b;for(const _ of h.children)a(_,h)},"setParentReferences"),l=s(e.rootId);if(!l)return"";a(l);const d=__name$3(h=>{let b=h.parent;for(;b;){if(b.type==="element"&&b.highlightIndex!==void 0)return!0;b=b.parent}return!1},"hasParentWithHighlightIndex"),m=__name$3((h,b,_)=>{var u,p,f,y;let S=b;const v="	".repeat(b);if(h.type==="element"){const $=n&&h.tagName&&SEMANTIC_TAGS.has(h.tagName);if(h.highlightIndex!==void 0){S+=1;const N=getAllTextTillNextClickableElement(h);let j="";if(o.length>0&&h.attributes){const R=matchAttributes(h.attributes,o),ne=Object.keys(R);if(ne.length>1){const J=new Set,ee={};for(const Q of ne){const V=R[Q];V.length>5&&(V in ee?J.add(Q):ee[V]=Q)}for(const Q of J)delete R[Q]}R.role===h.tagName&&delete R.role;const K=["aria-label","placeholder","title"];for(const J of K)R[J]&&R[J].toLowerCase().trim()===N.toLowerCase().trim()&&delete R[J];Object.keys(R).length>0&&(j=Object.entries(R).map(([J,ee])=>`${J}=${i(ee,20)}`).join(" "))}const X=h.isNew?`*[${h.highlightIndex}]`:`[${h.highlightIndex}]`;let F=`${v}${X}<${h.tagName??""}`;if(j&&(F+=` ${j}`),h.extra&&h.extra.scrollable){let R="";(u=h.extra.scrollData)!=null&&u.left&&(R+=`left=${h.extra.scrollData.left}, `),(p=h.extra.scrollData)!=null&&p.top&&(R+=`top=${h.extra.scrollData.top}, `),(f=h.extra.scrollData)!=null&&f.right&&(R+=`right=${h.extra.scrollData.right}, `),(y=h.extra.scrollData)!=null&&y.bottom&&(R+=`bottom=${h.extra.scrollData.bottom}`),F+=` data-scrollable="${R}"`}if(N){const R=N.trim();j||(F+=" "),F+=`>${R}`}else j||(F+=" ");F+=" />",_.push(F)}const E=$&&h.highlightIndex===void 0,z=E?_.length:-1;E&&(_.push(`${v}<${h.tagName}>`),S+=1);for(const N of h.children)m(N,S,_);E&&(_.length===z+1?_.pop():_.push(`${v}</${h.tagName}>`))}else if(h.type==="text"){if(d(h))return;h.parent&&h.parent.type==="element"&&h.parent.isVisible&&h.parent.isTopElement&&_.push(`${v}${h.text??""}`)}},"processNode"),w=[];return m(l,0,w),w.join(`
`)}__name$3(flatTreeToString,"flatTreeToString");const getAllTextTillNextClickableElement=__name$3((e,t=-1)=>{const n=[],r=__name$3((o,i)=>{if(!(t!==-1&&i>t)&&!(o.type==="element"&&o!==e&&o.highlightIndex!==void 0)){if(o.type==="text"&&o.text)n.push(o.text);else if(o.type==="element")for(const s of o.children)r(s,i+1)}},"collectText");return r(e,0),n.join(`
`).trim()},"getAllTextTillNextClickableElement");function getSelectorMap(e){const t=new Map,n=Object.keys(e.map);for(const r of n){const o=e.map[r];o.isInteractive&&typeof o.highlightIndex=="number"&&t.set(o.highlightIndex,o)}return t}__name$3(getSelectorMap,"getSelectorMap");function getElementTextMap(e){const t=e.split(`
`).map(r=>r.trim()).filter(r=>r.length>0),n=new Map;for(const r of t){const i=/^\[(\d+)\]<[^>]+>([^<]*)/.exec(r);if(i){const s=parseInt(i[1],10);n.set(s,r)}}return n}__name$3(getElementTextMap,"getElementTextMap");function cleanUpHighlights(){const e=window._highlightCleanupFunctions||[];for(const t of e)typeof t=="function"&&t();window._highlightCleanupFunctions=[]}__name$3(cleanUpHighlights,"cleanUpHighlights"),window.addEventListener("popstate",()=>{cleanUpHighlights()}),window.addEventListener("hashchange",()=>{cleanUpHighlights()}),window.addEventListener("beforeunload",()=>{cleanUpHighlights()});const navigation=window.navigation;if(navigation&&typeof navigation.addEventListener=="function")navigation.addEventListener("navigate",()=>{cleanUpHighlights()});else{let e=window.location.href;setInterval(()=>{window.location.href!==e&&(e=window.location.href,cleanUpHighlights())},500)}function getPageInfo(){const e=window.innerWidth,t=window.innerHeight,n=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth||0),r=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight||0),o=window.scrollX||window.pageXOffset||document.documentElement.scrollLeft||0,i=window.scrollY||window.pageYOffset||document.documentElement.scrollTop||0,s=Math.max(0,r-(window.innerHeight+i)),a=Math.max(0,n-(window.innerWidth+o));return{viewport_width:e,viewport_height:t,page_width:n,page_height:r,scroll_x:o,scroll_y:i,pixels_above:i,pixels_below:s,pages_above:t>0?i/t:0,pages_below:t>0?s/t:0,total_pages:t>0?r/t:0,current_page_position:i/Math.max(1,r-t),pixels_left:o,pixels_right:a}}__name$3(getPageInfo,"getPageInfo");function patchReact(e){const t=document.querySelectorAll('[data-reactroot], [data-reactid], [data-react-checksum], #root, #app, [id^="root-"], [id^="app-"], #adex-wrapper, #adex-root');for(const n of t)n.setAttribute("data-page-agent-not-interactive","true")}__name$3(patchReact,"patchReact");const _PageController=class extends EventTarget{constructor(t={}){super();O(this,"config");O(this,"flatTree",null);O(this,"selectorMap",new Map);O(this,"elementTextMap",new Map);O(this,"simplifiedHTML","<EMPTY>");O(this,"lastTimeUpdate",0);O(this,"isIndexed",!1);O(this,"mask",null);O(this,"maskReady",null);this.config=t,patchReact(),t.enableMask&&this.initMask()}initMask(){this.maskReady===null&&(this.maskReady=(async()=>{const{SimulatorMask:t}=await Promise.resolve().then(()=>SimulatorMaskCU7szDjy);this.mask=new t})())}async getCurrentUrl(){return window.location.href}async getLastUpdateTime(){return this.lastTimeUpdate}async getBrowserState(){const t=window.location.href,n=document.title,r=getPageInfo(),o=resolveViewportExpansion(this.config.viewportExpansion);await this.updateTree();const i=this.simplifiedHTML,s=`Current Page: [${n}](${t})`,a=`Page info: ${r.viewport_width}x${r.viewport_height}px viewport, ${r.page_width}x${r.page_height}px total page size, ${r.pages_above.toFixed(1)} pages above, ${r.pages_below.toFixed(1)} pages below, ${r.total_pages.toFixed(1)} total pages, at ${(r.current_page_position*100).toFixed(0)}% of page`,l=o===-1?"Interactive elements from top layer of the current page (full page):":"Interactive elements from top layer of the current page inside the viewport:",m=r.pixels_above>4&&o!==-1?`... ${r.pixels_above} pixels above (${r.pages_above.toFixed(1)} pages) - scroll to see more ...`:"[Start of page]",w=`${s}
${a}

${l}

${m}`,b=r.pixels_below>4&&o!==-1?`... ${r.pixels_below} pixels below (${r.pages_below.toFixed(1)} pages) - scroll to see more ...`:"[End of page]";return{url:t,title:n,header:w,content:i,footer:b}}async updateTree(){this.dispatchEvent(new Event("beforeUpdate")),this.lastTimeUpdate=Date.now(),this.mask&&(this.mask.wrapper.style.pointerEvents="none"),cleanUpHighlights();const t=[...this.config.interactiveBlacklist||[],...document.querySelectorAll("[data-page-agent-not-interactive]").values()];return this.flatTree=getFlatTree({...this.config,interactiveBlacklist:t}),this.simplifiedHTML=flatTreeToString(this.flatTree,this.config.includeAttributes,this.config.keepSemanticTags),this.selectorMap.clear(),this.selectorMap=getSelectorMap(this.flatTree),this.elementTextMap.clear(),this.elementTextMap=getElementTextMap(this.simplifiedHTML),this.isIndexed=!0,this.mask&&(this.mask.wrapper.style.pointerEvents="auto"),this.dispatchEvent(new Event("afterUpdate")),this.simplifiedHTML}async cleanUpHighlights(){console.log("[PageController] cleanUpHighlights"),cleanUpHighlights()}assertIndexed(){if(!this.isIndexed)throw new Error("DOM tree not indexed yet. Can not perform actions on elements.")}async clickElement(t){try{this.assertIndexed();const n=getElementByIndex(this.selectorMap,t),r=this.elementTextMap.get(t);return await clickElement(n),isAnchorElement(n)&&n.target==="_blank"?{success:!0,message:`✅ Clicked element (${r??t}). ⚠️ Link opened in a new tab.`}:{success:!0,message:`✅ Clicked element (${r??t}).`}}catch(n){return{success:!1,message:`❌ Failed to click element: ${n}`}}}async inputText(t,n){try{this.assertIndexed();const r=getElementByIndex(this.selectorMap,t),o=this.elementTextMap.get(t);return await inputTextElement(r,n),{success:!0,message:`✅ Input text (${n}) into element (${o??t}).`}}catch(r){return{success:!1,message:`❌ Failed to input text: ${r}`}}}async selectOption(t,n){try{this.assertIndexed();const r=getElementByIndex(this.selectorMap,t),o=this.elementTextMap.get(t);return await selectOptionElement(r,n),{success:!0,message:`✅ Selected option (${n}) in element (${o??t}).`}}catch(r){return{success:!1,message:`❌ Failed to select option: ${r}`}}}async scroll(t){try{const{down:n,numPages:r,pixels:o,index:i}=t;this.assertIndexed();const s=(o??r*window.innerHeight)*(n?1:-1),a=i!==void 0?getElementByIndex(this.selectorMap,i):null;return{success:!0,message:await scrollVertically(s,a)}}catch(n){return{success:!1,message:`❌ Failed to scroll: ${n}`}}}async scrollHorizontally(t){try{const{right:n,pixels:r,index:o}=t;this.assertIndexed();const i=r*(n?1:-1),s=o!==void 0?getElementByIndex(this.selectorMap,o):null;return{success:!0,message:await scrollHorizontally(i,s)}}catch(n){return{success:!1,message:`❌ Failed to scroll horizontally: ${n}`}}}async executeJavascript(script){try{const asyncFunction=eval(`(async () => { ${script} })`),result=await asyncFunction();return{success:!0,message:`✅ Executed JavaScript. Result: ${result}`}}catch(t){return{success:!1,message:`❌ Error executing JavaScript: ${t}`}}}async showMask(){var t;await this.maskReady,(t=this.mask)==null||t.show()}async hideMask(){var t;await this.maskReady,(t=this.mask)==null||t.hide()}dispose(){var t;cleanUpHighlights(),this.flatTree=null,this.selectorMap.clear(),this.elementTextMap.clear(),this.simplifiedHTML="<EMPTY>",this.isIndexed=!1,(t=this.mask)==null||t.dispose(),this.mask=null}};__name$3(_PageController,"PageController");let PageController=_PageController;(function(){try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(`._wrapper_gtdpc_1 {
	position: fixed;
	bottom: 100px;
	left: 50%;
	transform: translateX(-50%) translateY(20px);
	opacity: 0;
	z-index: 2147483642; /* 比 SimulatorMask 高一层 */
	box-sizing: border-box;

	overflow: visible;

	* {
		box-sizing: border-box;
	}

	--width: 360px;
	--height: 40px;
	--border-radius: 12px;

	--side-space: 12px; /* 控制栏两侧的间距 */
	--history-width: calc(var(--width) - var(--side-space) * 2);

	--color-1: rgb(57, 182, 255);
	--color-2: rgb(189, 69, 251);
	--color-3: rgb(255, 87, 51);
	--color-4: rgb(255, 214, 0);

	width: var(--width);
	height: var(--height);

	transition: all 0.3s ease-in-out;

	/* 响应式设计 */
	@media (max-width: 480px) {
		width: calc(100vw - 40px);
		--width: calc(100vw - 40px);
	}

	._background_gtdpc_39 {
		position: absolute;
		inset: -2px -8px;
		border-radius: calc(var(--border-radius) + 4px);
		filter: blur(16px);
		overflow: hidden;
		/* mix-blend-mode: lighten; */
		/* display: none; */

		&::before {
			content: '';
			z-index: -1;
			pointer-events: none;
			position: absolute;
			width: 100%;
			height: 100%;
			/* left: -100%; */
			left: 0;
			top: 0;

			background-image: linear-gradient(
				to bottom left,
				var(--color-1),
				var(--color-2),
				var(--color-1)
			);
			animation: _mask-running_gtdpc_1 2s linear infinite;
		}
		&::after {
			content: '';
			z-index: -1;
			pointer-events: none;
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;

			background-image: linear-gradient(
				to bottom left,
				var(--color-2),
				var(--color-1),
				var(--color-2)
			);
			animation: _mask-running_gtdpc_1 2s linear infinite;
			animation-delay: 1s;
		}
	}
}

@keyframes _mask-running_gtdpc_1 {
	from {
		transform: translateX(-100%);
	}
	to {
		transform: translateX(100%);
	}
}

/* 控制栏 */
._header_gtdpc_99 {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	user-select: none;

	position: absolute;
	inset: 0;

	cursor: pointer;
	flex-shrink: 0; /* 防止 header 被压缩 */

	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(10px);
	border-radius: var(--border-radius);
	background-clip: padding-box;

	box-shadow:
		0 0 0px 2px rgba(255, 255, 255, 0.4),
		0 0 5px 1px rgba(255, 255, 255, 0.3);

	._statusSection_gtdpc_121 {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-height: 24px; /* 确保垂直居中 */

		._indicator_gtdpc_128 {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.5);
			flex-shrink: 0;
			animation: none; /* 默认无动画 */

			/* 运行状态 - 有动画 */
			&._thinking_gtdpc_137 {
				background: rgb(57, 182, 255);
				animation: _pulse_gtdpc_1 0.8s ease-in-out infinite;
			}

			&._tool_executing_gtdpc_142 {
				background: rgb(189, 69, 251);
				animation: _pulse_gtdpc_1 0.6s ease-in-out infinite;
			}

			&._retry_gtdpc_147 {
				background: rgb(255, 214, 0);
				animation: _retryPulse_gtdpc_1 1s ease-in-out infinite;
			}

			/* 静止状态 - 无动画 */
			&._completed_gtdpc_153,
			&._input_gtdpc_154,
			&._output_gtdpc_155 {
				background: rgb(34, 197, 94);
				animation: none;
			}

			&._error_gtdpc_160 {
				background: rgb(239, 68, 68);
				animation: none;
			}
		}

		._statusText_gtdpc_166 {
			color: white;
			font-size: 12px;
			line-height: 1;
			font-weight: 500;
			transition: all 0.3s ease-in-out;
			position: relative;
			overflow: hidden;
			display: flex;
			align-items: center;
			min-height: 24px; /* 确保垂直居中 */

			&._fadeOut_gtdpc_178 {
				animation: _statusTextFadeOut_gtdpc_1 0.3s ease forwards;
			}

			&._fadeIn_gtdpc_182 {
				animation: _statusTextFadeIn_gtdpc_1 0.3s ease forwards;
			}
		}
	}

	._controls_gtdpc_188 {
		display: flex;
		align-items: center;
		gap: 4px;

		._controlButton_gtdpc_193 {
			width: 24px;
			height: 24px;
			border: none;
			border-radius: 4px;
			background: rgba(255, 255, 255, 0.1);
			color: white;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 12px;
			line-height: 1;

			&:hover {
				background: rgba(255, 255, 255, 0.2);
			}
		}

		._stopButton_gtdpc_212 {
			background: rgba(239, 68, 68, 0.2);
			color: rgb(255, 41, 41);
			font-weight: 600;

			&:hover {
				background: rgba(239, 68, 68, 0.3);
			}
		}
	}
}

@keyframes _statusTextFadeIn_gtdpc_1 {
	0% {
		opacity: 0;
		transform: translateY(5px);
	}
	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes _statusTextFadeOut_gtdpc_1 {
	0% {
		opacity: 1;
		transform: translateY(0);
	}
	100% {
		opacity: 0;
		transform: translateY(-5px);
	}
}

._historySectionWrapper_gtdpc_246 {
	position: absolute;
	width: var(--history-width);
	bottom: var(--height);
	left: var(--side-space);
	z-index: -2;

	padding-top: 0px;
	visibility: collapse;
	overflow: hidden;

	transition: all 0.2s;

	background: rgba(2, 0, 20, 0.5);
	/* background: rgba(186, 186, 186, 0.2); */
	backdrop-filter: blur(10px);

	text-shadow: 0 0 1px rgba(0, 0, 0, 0.2);

	border-top-left-radius: calc(var(--border-radius) + 4px);
	border-top-right-radius: calc(var(--border-radius) + 4px);

	/* border: 2px solid rgba(255, 255, 255, 0.8); */
	border: 2px solid rgba(255, 255, 255, 0.4);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);

	/* @media (prefers-color-scheme: dark) {
		box-shadow:
			0 8px 32px 0 rgba(0, 0, 0, 0.85),
			0 2px 12px 0 rgba(57, 182, 255, 0.1);
	} */

	._expanded_gtdpc_278 & {
		padding-top: 8px;
		visibility: visible;
	}

	._historySection_gtdpc_246 {
		position: relative;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: none;
		max-height: 0;
		padding-inline: 8px;

		transition: max-height 0.2s;

		._expanded_gtdpc_278 & {
			max-height: 400px;
		}

		._historyItem_gtdpc_297 {
			/* backdrop-filter: blur(10px); */
			padding: 8px 10px;
			margin-bottom: 6px;
			background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
			border-radius: 8px;
			border-left: 2px solid rgba(57, 182, 255, 0.5);
			font-size: 12px;
			color: white;
			/* color: black; */
			line-height: 1.3;
			position: relative;
			overflow: hidden;

			/* 微妙的内阴影 */
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.1),
				0 1px 3px rgba(0, 0, 0, 0.1);

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 1px;
				background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
			}

			&:hover {
				background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
				/* transform: translateY(-1px); */
				box-shadow:
					inset 0 1px 0 rgba(255, 255, 255, 0.15),
					0 2px 4px rgba(0, 0, 0, 0.15);
			}

			&:last-child {
				margin-bottom: 10px;
			}

			&._completed_gtdpc_153,
			&._input_gtdpc_154,
			&._output_gtdpc_155 {
				border-left-color: rgb(34, 197, 94);
				background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
			}

			&._error_gtdpc_160 {
				border-left-color: rgb(239, 68, 68);
				background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
			}

			&._retry_gtdpc_147 {
				border-left-color: rgb(255, 214, 0);
				background: linear-gradient(135deg, rgba(255, 214, 0, 0.1), rgba(255, 214, 0, 0.05));
			}

			&._observation_gtdpc_355 {
				border-left-color: rgb(147, 51, 234);
				background: linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05));
			}

			&._question_gtdpc_360 {
				border-left-color: rgb(255, 159, 67);
				background: linear-gradient(135deg, rgba(255, 159, 67, 0.15), rgba(255, 159, 67, 0.08));
			}

			/* 突出显示 done 成功结果 */
			&._doneSuccess_gtdpc_366 {
				background: linear-gradient(
					135deg,
					rgba(34, 197, 94, 0.25),
					rgba(34, 197, 94, 0.15),
					rgba(34, 197, 94, 0.08)
				);
				border: none;
				border-left: 4px solid rgb(34, 197, 94);
				box-shadow:
					0 4px 12px rgba(34, 197, 94, 0.3),
					inset 0 1px 0 rgba(255, 255, 255, 0.2),
					0 0 20px rgba(34, 197, 94, 0.1);
				font-weight: 600;
				color: rgb(220, 252, 231);
				padding: 10px 12px;
				margin-bottom: 8px;
				border-radius: 8px;
				position: relative;
				overflow: hidden;

				&::before {
					background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.4), transparent);
				}

				&::after {
					content: '';
					position: absolute;
					top: 0;
					left: -100%;
					width: 100%;
					height: 100%;
					background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
					animation: _shimmer_gtdpc_1 2s ease-in-out infinite;
				}

				._historyContent_gtdpc_402 {
					._statusIcon_gtdpc_403 {
						font-size: 16px;
						animation: _celebrate_gtdpc_1 0.8s ease-in-out;
						filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.5));
					}
				}
			}

			/* 突出显示 done 失败结果 */
			&._doneError_gtdpc_412 {
				background: linear-gradient(
					135deg,
					rgba(239, 68, 68, 0.25),
					rgba(239, 68, 68, 0.15),
					rgba(239, 68, 68, 0.08)
				);
				border: none;
				border-left: 4px solid rgb(239, 68, 68);
				box-shadow:
					0 4px 12px rgba(239, 68, 68, 0.3),
					inset 0 1px 0 rgba(255, 255, 255, 0.2),
					0 0 20px rgba(239, 68, 68, 0.1);
				font-weight: 600;
				color: rgb(254, 226, 226);
				padding: 10px 12px;
				margin-bottom: 8px;
				border-radius: 8px;
				position: relative;
				overflow: hidden;

				&::before {
					background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.4), transparent);
				}

				._historyContent_gtdpc_402 {
					._statusIcon_gtdpc_403 {
						font-size: 16px;
						filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.5));
					}
				}
			}

			._historyContent_gtdpc_402 {
				display: flex;
				align-items: flex-start;
				gap: 8px;

				word-break: break-all;
				white-space: pre-wrap;

				/* overflow-x: auto; */

				._statusIcon_gtdpc_403 {
					font-size: 12px;
					flex-shrink: 0;
					line-height: 1;
					transition: all 0.3s ease;
				}

				._reflectionLines_gtdpc_462 {
					display: flex;
					flex-direction: column;
					gap: 4px;
				}
			}

			._historyMeta_gtdpc_469 {
				font-size: 10px;
				color: rgba(255, 255, 255, 0.6);
				/* color: rgb(61, 61, 61); */
				margin-top: 8px;
				line-height: 1;
			}
		}
	}
}

/* 动画关键帧 - 更快的闪烁 */
@keyframes _pulse_gtdpc_1 {
	0%,
	100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.4;
		transform: scale(1.3);
	}
}

/* 重试动画 - 旋转脉冲 */
@keyframes _retryPulse_gtdpc_1 {
	0%,
	100% {
		opacity: 1;
		transform: scale(1) rotate(0deg);
	}
	25% {
		opacity: 0.6;
		transform: scale(1.2) rotate(90deg);
	}
	50% {
		opacity: 0.8;
		transform: scale(1.1) rotate(180deg);
	}
	75% {
		opacity: 0.6;
		transform: scale(1.2) rotate(270deg);
	}
}

/* 庆祝动画 */
@keyframes _celebrate_gtdpc_1 {
	0%,
	100% {
		transform: scale(1);
	}
	25% {
		transform: scale(1.2) rotate(-5deg);
	}
	75% {
		transform: scale(1.2) rotate(5deg);
	}
}

/* done 卡片的光泽效果 */
@keyframes _shimmer_gtdpc_1 {
	0% {
		left: -100%;
	}
	100% {
		left: 100%;
	}
}

/* 输入区域样式 */
._inputSectionWrapper_gtdpc_539 {
	position: absolute;
	width: var(--history-width);
	top: var(--height);
	left: var(--side-space);
	z-index: -1;

	visibility: visible;
	overflow: hidden;

	height: 48px;

	transition: all 0.2s;

	background: rgba(186, 186, 186, 0.2);
	backdrop-filter: blur(10px);

	border-bottom-left-radius: calc(var(--border-radius) + 4px);
	border-bottom-right-radius: calc(var(--border-radius) + 4px);

	border: 2px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 1px 16px rgba(0, 0, 0, 0.4);

	&._hidden_gtdpc_562 {
		visibility: collapse;
		height: 0;
	}

	._inputSection_gtdpc_539 {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 8px 8px;

		._taskInput_gtdpc_573 {
			flex: 1;
			background: rgba(255, 255, 255, 0.4);
			border: 1px solid rgba(255, 255, 255, 0.3);
			border-radius: 10px;
			padding-inline: 10px;
			color: rgb(20, 20, 20);
			font-size: 12px;
			height: 28px;
			line-height: 1;
			outline: none;
			transition: all 0.2s ease;

			/* text-shadow: 0 0 2px rgba(255, 255, 255, 0.8); */

			/* border-color: rgba(57, 182, 255, 0.3); */

			&::placeholder {
				color: rgb(53, 53, 53);
			}

			&:focus {
				background: rgba(255, 255, 255, 0.8);
				border-color: rgba(57, 182, 255, 0.6);
				box-shadow: 0 0 0 2px rgba(57, 182, 255, 0.2);
			}
		}
	}
}`)),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();var __defProp$2=Object.defineProperty,__typeError$1=e=>{throw TypeError(e)},__name$2=(e,t)=>__defProp$2(e,"name",{value:t,configurable:!0}),__accessCheck$1=(e,t,n)=>t.has(e)||__typeError$1("Cannot "+n),__privateGet$1=(e,t,n)=>(__accessCheck$1(e,t,"read from private field"),n?n.call(e):t.get(e)),__privateAdd$1=(e,t,n)=>t.has(e)?__typeError$1("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),__privateSet$1=(e,t,n,r)=>(__accessCheck$1(e,t,"write to private field"),t.set(e,n),n),__privateMethod$1=(e,t,n)=>(__accessCheck$1(e,t,"access private method"),n),_wrapper,_indicator,_statusText,_historySection,_expandButton,_actionButton,_inputSection,_taskInput,_agent,_config,_isExpanded,_i18n,_userAnswerResolver,_isWaitingForUserAnswer,_headerUpdateTimer,_pendingHeaderText,_isAnimating,_onStatusChange,_onHistoryChange,_onActivity,_onAgentDispose,_Panel_instances,handleStatusChange_fn,handleHistoryChange_fn,handleActivity_fn,askUser_fn,getToolExecutingText_fn,handleActionButton_fn,submitTask_fn,handleUserAnswer_fn,showInputArea_fn,hideInputArea_fn,shouldShowInputArea_fn,createWrapper_fn,setupEventListeners_fn,toggle_fn,expand_fn,collapse_fn,startHeaderUpdateLoop_fn,stopHeaderUpdateLoop_fn,checkAndUpdateHeader_fn,animateTextChange_fn,updateStatusIndicator_fn,scrollToBottom_fn,renderHistory_fn,createTaskCard_fn,createHistoryCards_fn,createActionCards_fn;const enUS={ui:{panel:{ready:"Ready",thinking:"Thinking...",taskInput:"Enter new task, describe steps in detail, press Enter to submit",userAnswerPrompt:"Please answer the question above, press Enter to submit",taskTerminated:"Task terminated",taskCompleted:"Task completed",userAnswer:"User answer: {{input}}",question:"Question: {{question}}",waitingPlaceholder:"Waiting for task to start...",stop:"Stop",close:"Close",expand:"Expand history",collapse:"Collapse history",step:"Step {{number}}"},tools:{clicking:"Clicking element [{{index}}]...",inputting:"Inputting text to element [{{index}}]...",selecting:'Selecting option "{{text}}"...',scrolling:"Scrolling page...",waiting:"Waiting {{seconds}} seconds...",askingUser:"Asking user...",done:"Task done",clicked:"🖱️ Clicked element [{{index}}]",inputted:'⌨️ Inputted text "{{text}}"',selected:'☑️ Selected option "{{text}}"',scrolled:"🛞 Page scrolled",waited:"⌛️ Wait completed",executing:"Executing {{toolName}}...",resultSuccess:"success",resultFailure:"failed",resultError:"error"},errors:{elementNotFound:"No interactive element found at index {{index}}",taskRequired:"Task description is required",executionFailed:"Task execution failed",notInputElement:"Element is not an input or textarea",notSelectElement:"Element is not a select element",optionNotFound:'Option "{{text}}" not found'}}},zhCN={ui:{panel:{ready:"准备就绪",thinking:"正在思考...",taskInput:"输入新任务，详细描述步骤，回车提交",userAnswerPrompt:"请回答上面问题，回车提交",taskTerminated:"任务已终止",taskCompleted:"任务结束",userAnswer:"用户回答: {{input}}",question:"询问: {{question}}",waitingPlaceholder:"等待任务开始...",stop:"终止",close:"关闭",expand:"展开历史",collapse:"收起历史",step:"步骤 {{number}}"},tools:{clicking:"正在点击元素 [{{index}}]...",inputting:"正在输入文本到元素 [{{index}}]...",selecting:'正在选择选项 "{{text}}"...',scrolling:"正在滚动页面...",waiting:"等待 {{seconds}} 秒...",askingUser:"正在询问用户...",done:"结束任务",clicked:"🖱️ 已点击元素 [{{index}}]",inputted:'⌨️ 已输入文本 "{{text}}"',selected:'☑️ 已选择选项 "{{text}}"',scrolled:"🛞 页面滚动完成",waited:"⌛️ 等待完成",executing:"正在执行 {{toolName}}...",resultSuccess:"成功",resultFailure:"失败",resultError:"错误"},errors:{elementNotFound:"未找到索引为 {{index}} 的交互元素",taskRequired:"任务描述不能为空",executionFailed:"任务执行失败",notInputElement:"元素不是输入框或文本域",notSelectElement:"元素不是选择框",optionNotFound:'未找到选项 "{{text}}"'}}},locales={"en-US":enUS,"zh-CN":zhCN},_I18n=class{constructor(t="en-US"){O(this,"language");O(this,"translations");this.language=t in locales?t:"en-US",this.translations=locales[this.language]}t(t,n){const r=this.getNestedValue(this.translations,t);return r?n?this.interpolate(r,n):r:(console.warn(`Translation key "${t}" not found for language "${this.language}"`),t)}getNestedValue(t,n){return n.split(".").reduce((r,o)=>r==null?void 0:r[o],t)}interpolate(t,n){return t.replace(/\{\{(\w+)\}\}/g,(r,o)=>n[o]!=null?n[o].toString():r)}getLanguage(){return this.language}};__name$2(_I18n,"I18n");let I18n=_I18n;function truncate(e,t){return e.length>t?e.substring(0,t)+"...":e}__name$2(truncate,"truncate");function escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}__name$2(escapeHtml,"escapeHtml");const wrapper$1="_wrapper_gtdpc_1",background="_background_gtdpc_39",header="_header_gtdpc_99",pulse="_pulse_gtdpc_1",retryPulse="_retryPulse_gtdpc_1",statusTextFadeOut="_statusTextFadeOut_gtdpc_1",statusTextFadeIn="_statusTextFadeIn_gtdpc_1",statusSection="_statusSection_gtdpc_121",indicator="_indicator_gtdpc_128",thinking="_thinking_gtdpc_137",tool_executing="_tool_executing_gtdpc_142",retry="_retry_gtdpc_147",completed="_completed_gtdpc_153",input="_input_gtdpc_154",output="_output_gtdpc_155",error="_error_gtdpc_160",statusText="_statusText_gtdpc_166",fadeOut="_fadeOut_gtdpc_178",fadeIn="_fadeIn_gtdpc_182",controls="_controls_gtdpc_188",controlButton="_controlButton_gtdpc_193",stopButton="_stopButton_gtdpc_212",historySectionWrapper="_historySectionWrapper_gtdpc_246",shimmer="_shimmer_gtdpc_1",celebrate="_celebrate_gtdpc_1",expanded="_expanded_gtdpc_278",historySection="_historySection_gtdpc_246",historyItem="_historyItem_gtdpc_297",observation="_observation_gtdpc_355",question="_question_gtdpc_360",doneSuccess="_doneSuccess_gtdpc_366",historyContent="_historyContent_gtdpc_402",statusIcon="_statusIcon_gtdpc_403",doneError="_doneError_gtdpc_412",reflectionLines="_reflectionLines_gtdpc_462",historyMeta="_historyMeta_gtdpc_469",inputSectionWrapper="_inputSectionWrapper_gtdpc_539",hidden="_hidden_gtdpc_562",inputSection="_inputSection_gtdpc_539",taskInput="_taskInput_gtdpc_573",styles$1={wrapper:wrapper$1,"mask-running":"_mask-running_gtdpc_1",background,header,pulse,retryPulse,statusTextFadeOut,statusTextFadeIn,statusSection,indicator,thinking,tool_executing,retry,completed,input,output,error,statusText,fadeOut,fadeIn,controls,controlButton,stopButton,historySectionWrapper,shimmer,celebrate,expanded,historySection,historyItem,observation,question,doneSuccess,historyContent,statusIcon,doneError,reflectionLines,historyMeta,inputSectionWrapper,hidden,inputSection,taskInput};function createCard({icon:e,content:t,meta:n,type:r}){const o=r?styles$1[r]:"",i=Array.isArray(t)?`<div class="${styles$1.reflectionLines}">${t.map(s=>`<span>${escapeHtml(s)}</span>`).join("")}</div>`:`<span>${escapeHtml(t)}</span>`;return`
		<div class="${styles$1.historyItem} ${o}">
			<div class="${styles$1.historyContent}">
				<span class="${styles$1.statusIcon}">${e}</span>
				${i}
			</div>
			${n?`<div class="${styles$1.historyMeta}">${n}</div>`:""}
		</div>
	`}__name$2(createCard,"createCard");function createReflectionLines(e){const t=[];return e.evaluation_previous_goal&&t.push(`🔍 ${e.evaluation_previous_goal}`),e.memory&&t.push(`💾 ${e.memory}`),e.next_goal&&t.push(`🎯 ${e.next_goal}`),t}__name$2(createReflectionLines,"createReflectionLines");const _Panel=class{constructor(t,n={}){__privateAdd$1(this,_Panel_instances),__privateAdd$1(this,_wrapper),__privateAdd$1(this,_indicator),__privateAdd$1(this,_statusText),__privateAdd$1(this,_historySection),__privateAdd$1(this,_expandButton),__privateAdd$1(this,_actionButton),__privateAdd$1(this,_inputSection),__privateAdd$1(this,_taskInput),__privateAdd$1(this,_agent),__privateAdd$1(this,_config),__privateAdd$1(this,_isExpanded,!1),__privateAdd$1(this,_i18n),__privateAdd$1(this,_userAnswerResolver,null),__privateAdd$1(this,_isWaitingForUserAnswer,!1),__privateAdd$1(this,_headerUpdateTimer,null),__privateAdd$1(this,_pendingHeaderText,null),__privateAdd$1(this,_isAnimating,!1),__privateAdd$1(this,_onStatusChange,__name$2(()=>__privateMethod$1(this,_Panel_instances,handleStatusChange_fn).call(this),"#onStatusChange")),__privateAdd$1(this,_onHistoryChange,__name$2(()=>__privateMethod$1(this,_Panel_instances,handleHistoryChange_fn).call(this),"#onHistoryChange")),__privateAdd$1(this,_onActivity,__name$2(r=>__privateMethod$1(this,_Panel_instances,handleActivity_fn).call(this,r.detail),"#onActivity")),__privateAdd$1(this,_onAgentDispose,__name$2(()=>this.dispose(),"#onAgentDispose")),__privateSet$1(this,_agent,t),__privateSet$1(this,_config,n),__privateSet$1(this,_i18n,new I18n(n.language??"en-US")),__privateGet$1(this,_agent).onAskUser=r=>__privateMethod$1(this,_Panel_instances,askUser_fn).call(this,r),__privateSet$1(this,_wrapper,__privateMethod$1(this,_Panel_instances,createWrapper_fn).call(this)),__privateSet$1(this,_indicator,__privateGet$1(this,_wrapper).querySelector(`.${styles$1.indicator}`)),__privateSet$1(this,_statusText,__privateGet$1(this,_wrapper).querySelector(`.${styles$1.statusText}`)),__privateSet$1(this,_historySection,__privateGet$1(this,_wrapper).querySelector(`.${styles$1.historySection}`)),__privateSet$1(this,_expandButton,__privateGet$1(this,_wrapper).querySelector(`.${styles$1.expandButton}`)),__privateSet$1(this,_actionButton,__privateGet$1(this,_wrapper).querySelector(`.${styles$1.stopButton}`)),__privateSet$1(this,_inputSection,__privateGet$1(this,_wrapper).querySelector(`.${styles$1.inputSectionWrapper}`)),__privateSet$1(this,_taskInput,__privateGet$1(this,_wrapper).querySelector(`.${styles$1.taskInput}`)),__privateGet$1(this,_agent).addEventListener("statuschange",__privateGet$1(this,_onStatusChange)),__privateGet$1(this,_agent).addEventListener("historychange",__privateGet$1(this,_onHistoryChange)),__privateGet$1(this,_agent).addEventListener("activity",__privateGet$1(this,_onActivity)),__privateGet$1(this,_agent).addEventListener("dispose",__privateGet$1(this,_onAgentDispose)),__privateMethod$1(this,_Panel_instances,setupEventListeners_fn).call(this),__privateMethod$1(this,_Panel_instances,startHeaderUpdateLoop_fn).call(this),__privateMethod$1(this,_Panel_instances,showInputArea_fn).call(this),this.hide()}get wrapper(){return __privateGet$1(this,_wrapper)}show(){this.wrapper.style.display="block",this.wrapper.offsetHeight,this.wrapper.style.opacity="1",this.wrapper.style.transform="translateX(-50%) translateY(0)"}hide(){this.wrapper.style.opacity="0",this.wrapper.style.transform="translateX(-50%) translateY(20px)",this.wrapper.style.display="none"}reset(){__privateGet$1(this,_statusText).textContent=__privateGet$1(this,_i18n).t("ui.panel.ready"),__privateMethod$1(this,_Panel_instances,updateStatusIndicator_fn).call(this,"thinking"),__privateMethod$1(this,_Panel_instances,renderHistory_fn).call(this),__privateMethod$1(this,_Panel_instances,collapse_fn).call(this),__privateSet$1(this,_isWaitingForUserAnswer,!1),__privateSet$1(this,_userAnswerResolver,null),__privateMethod$1(this,_Panel_instances,showInputArea_fn).call(this)}expand(){__privateMethod$1(this,_Panel_instances,expand_fn).call(this)}collapse(){__privateMethod$1(this,_Panel_instances,collapse_fn).call(this)}dispose(){__privateGet$1(this,_agent).removeEventListener("statuschange",__privateGet$1(this,_onStatusChange)),__privateGet$1(this,_agent).removeEventListener("historychange",__privateGet$1(this,_onHistoryChange)),__privateGet$1(this,_agent).removeEventListener("activity",__privateGet$1(this,_onActivity)),__privateGet$1(this,_agent).removeEventListener("dispose",__privateGet$1(this,_onAgentDispose)),__privateSet$1(this,_isWaitingForUserAnswer,!1),__privateMethod$1(this,_Panel_instances,stopHeaderUpdateLoop_fn).call(this),this.wrapper.remove()}};_wrapper=new WeakMap,_indicator=new WeakMap,_statusText=new WeakMap,_historySection=new WeakMap,_expandButton=new WeakMap,_actionButton=new WeakMap,_inputSection=new WeakMap,_taskInput=new WeakMap,_agent=new WeakMap,_config=new WeakMap,_isExpanded=new WeakMap,_i18n=new WeakMap,_userAnswerResolver=new WeakMap,_isWaitingForUserAnswer=new WeakMap,_headerUpdateTimer=new WeakMap,_pendingHeaderText=new WeakMap,_isAnimating=new WeakMap,_onStatusChange=new WeakMap,_onHistoryChange=new WeakMap,_onActivity=new WeakMap,_onAgentDispose=new WeakMap,_Panel_instances=new WeakSet,handleStatusChange_fn=__name$2(function(){const e=__privateGet$1(this,_agent).status,t=e==="running"||e==="idle"?"thinking":e;__privateMethod$1(this,_Panel_instances,updateStatusIndicator_fn).call(this,t),e==="running"?(__privateGet$1(this,_actionButton).textContent="■",__privateGet$1(this,_actionButton).title=__privateGet$1(this,_i18n).t("ui.panel.stop")):(__privateGet$1(this,_actionButton).textContent="X",__privateGet$1(this,_actionButton).title=__privateGet$1(this,_i18n).t("ui.panel.close")),e==="running"&&(this.show(),__privateMethod$1(this,_Panel_instances,hideInputArea_fn).call(this)),(e==="completed"||e==="error")&&(__privateGet$1(this,_isExpanded)||__privateMethod$1(this,_Panel_instances,expand_fn).call(this),__privateMethod$1(this,_Panel_instances,shouldShowInputArea_fn).call(this)&&__privateMethod$1(this,_Panel_instances,showInputArea_fn).call(this))},"#handleStatusChange"),handleHistoryChange_fn=__name$2(function(){__privateMethod$1(this,_Panel_instances,renderHistory_fn).call(this)},"#handleHistoryChange"),handleActivity_fn=__name$2(function(e){switch(e.type){case"thinking":__privateSet$1(this,_pendingHeaderText,__privateGet$1(this,_i18n).t("ui.panel.thinking")),__privateMethod$1(this,_Panel_instances,updateStatusIndicator_fn).call(this,"thinking");break;case"executing":__privateSet$1(this,_pendingHeaderText,__privateMethod$1(this,_Panel_instances,getToolExecutingText_fn).call(this,e.tool,e.input)),__privateMethod$1(this,_Panel_instances,updateStatusIndicator_fn).call(this,"executing");break;case"executed":__privateSet$1(this,_pendingHeaderText,truncate(e.output,50));break;case"retrying":__privateSet$1(this,_pendingHeaderText,`Retrying (${e.attempt}/${e.maxAttempts})`),__privateMethod$1(this,_Panel_instances,updateStatusIndicator_fn).call(this,"retrying");break;case"error":__privateSet$1(this,_pendingHeaderText,truncate(e.message,50)),__privateMethod$1(this,_Panel_instances,updateStatusIndicator_fn).call(this,"error");break}},"#handleActivity"),askUser_fn=__name$2(function(e){return new Promise(t=>{__privateSet$1(this,_isWaitingForUserAnswer,!0),__privateSet$1(this,_userAnswerResolver,t),__privateGet$1(this,_isExpanded)||__privateMethod$1(this,_Panel_instances,expand_fn).call(this);const n=document.createElement("div");n.innerHTML=createCard({icon:"❓",content:`Question: ${e}`,type:"question"});const r=n.firstElementChild;r.setAttribute("data-temp-card","true"),__privateGet$1(this,_historySection).appendChild(r),__privateMethod$1(this,_Panel_instances,scrollToBottom_fn).call(this),__privateMethod$1(this,_Panel_instances,showInputArea_fn).call(this,__privateGet$1(this,_i18n).t("ui.panel.userAnswerPrompt"))})},"#askUser"),getToolExecutingText_fn=__name$2(function(e,t){const n=t;switch(e){case"click_element_by_index":return __privateGet$1(this,_i18n).t("ui.tools.clicking",{index:n.index});case"input_text":return __privateGet$1(this,_i18n).t("ui.tools.inputting",{index:n.index});case"select_dropdown_option":return __privateGet$1(this,_i18n).t("ui.tools.selecting",{text:n.text});case"scroll":return __privateGet$1(this,_i18n).t("ui.tools.scrolling");case"wait":return __privateGet$1(this,_i18n).t("ui.tools.waiting",{seconds:n.seconds});case"ask_user":return __privateGet$1(this,_i18n).t("ui.tools.askingUser");case"done":return __privateGet$1(this,_i18n).t("ui.tools.done");default:return __privateGet$1(this,_i18n).t("ui.tools.executing",{toolName:e})}},"#getToolExecutingText"),handleActionButton_fn=__name$2(function(){__privateGet$1(this,_agent).status==="running"?__privateGet$1(this,_agent).stop():__privateGet$1(this,_agent).dispose()},"#handleActionButton"),submitTask_fn=__name$2(function(){const e=__privateGet$1(this,_taskInput).value.trim();e&&(__privateMethod$1(this,_Panel_instances,hideInputArea_fn).call(this),__privateGet$1(this,_isWaitingForUserAnswer)?__privateMethod$1(this,_Panel_instances,handleUserAnswer_fn).call(this,e):__privateGet$1(this,_agent).execute(e))},"#submitTask"),handleUserAnswer_fn=__name$2(function(e){Array.from(__privateGet$1(this,_historySection).children).forEach(t=>{t.getAttribute("data-temp-card")==="true"&&t.remove()}),__privateSet$1(this,_isWaitingForUserAnswer,!1),__privateGet$1(this,_userAnswerResolver)&&(__privateGet$1(this,_userAnswerResolver).call(this,e),__privateSet$1(this,_userAnswerResolver,null))},"#handleUserAnswer"),showInputArea_fn=__name$2(function(e){__privateGet$1(this,_taskInput).value="",__privateGet$1(this,_taskInput).placeholder=e||__privateGet$1(this,_i18n).t("ui.panel.taskInput"),__privateGet$1(this,_inputSection).classList.remove(styles$1.hidden),setTimeout(()=>{__privateGet$1(this,_taskInput).focus()},100)},"#showInputArea"),hideInputArea_fn=__name$2(function(){__privateGet$1(this,_inputSection).classList.add(styles$1.hidden)},"#hideInputArea"),shouldShowInputArea_fn=__name$2(function(){if(__privateGet$1(this,_isWaitingForUserAnswer)||__privateGet$1(this,_agent).history.length===0)return!0;const t=__privateGet$1(this,_agent).status;return t==="completed"||t==="error"?__privateGet$1(this,_config).promptForNextTask??!0:!1},"#shouldShowInputArea"),createWrapper_fn=__name$2(function(){const t=document.createElement("div");return t.id="page-agent-runtime_agent-panel",t.className=styles$1.wrapper,t.setAttribute("data-browser-use-ignore","true"),t.setAttribute("data-page-agent-ignore","true"),t.innerHTML=`
			<div class="${styles$1.background}"></div>
			<div class="${styles$1.historySectionWrapper}">
				<div class="${styles$1.historySection}">
					<div class="${styles$1.historyItem}">
						<div class="${styles$1.historyContent}">
							<span class="${styles$1.statusIcon}">🧠</span>
							<span>${__privateGet$1(this,_i18n).t("ui.panel.waitingPlaceholder")}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="${styles$1.header}">
				<div class="${styles$1.statusSection}">
					<div class="${styles$1.indicator} ${styles$1.thinking}"></div>
					<div class="${styles$1.statusText}">${__privateGet$1(this,_i18n).t("ui.panel.ready")}</div>
				</div>
				<div class="${styles$1.controls}">
					<button class="${styles$1.controlButton} ${styles$1.expandButton}" title="${__privateGet$1(this,_i18n).t("ui.panel.expand")}">
						▼
					</button>
					<button class="${styles$1.controlButton} ${styles$1.stopButton}" title="${__privateGet$1(this,_i18n).t("ui.panel.close")}">
						X
					</button>
				</div>
			</div>
			<div class="${styles$1.inputSectionWrapper} ${styles$1.hidden}">
				<div class="${styles$1.inputSection}">
					<input 
						type="text" 
						class="${styles$1.taskInput}" 
						maxlength="1000"
					/>
				</div>
			</div>
		`,document.body.appendChild(t),t},"#createWrapper"),setupEventListeners_fn=__name$2(function(){this.wrapper.querySelector(`.${styles$1.header}`).addEventListener("click",t=>{t.target.closest(`.${styles$1.controlButton}`)||__privateMethod$1(this,_Panel_instances,toggle_fn).call(this)}),__privateGet$1(this,_expandButton).addEventListener("click",t=>{t.stopPropagation(),__privateMethod$1(this,_Panel_instances,toggle_fn).call(this)}),__privateGet$1(this,_actionButton).addEventListener("click",t=>{t.stopPropagation(),__privateMethod$1(this,_Panel_instances,handleActionButton_fn).call(this)}),__privateGet$1(this,_taskInput).addEventListener("keydown",t=>{t.isComposing||t.key==="Enter"&&(t.preventDefault(),__privateMethod$1(this,_Panel_instances,submitTask_fn).call(this))}),__privateGet$1(this,_inputSection).addEventListener("click",t=>{t.stopPropagation()})},"#setupEventListeners"),toggle_fn=__name$2(function(){__privateGet$1(this,_isExpanded)?__privateMethod$1(this,_Panel_instances,collapse_fn).call(this):__privateMethod$1(this,_Panel_instances,expand_fn).call(this)},"#toggle"),expand_fn=__name$2(function(){__privateSet$1(this,_isExpanded,!0),this.wrapper.classList.add(styles$1.expanded),__privateGet$1(this,_expandButton).textContent="▲"},"#expand"),collapse_fn=__name$2(function(){__privateSet$1(this,_isExpanded,!1),this.wrapper.classList.remove(styles$1.expanded),__privateGet$1(this,_expandButton).textContent="▼"},"#collapse"),startHeaderUpdateLoop_fn=__name$2(function(){__privateSet$1(this,_headerUpdateTimer,setInterval(()=>{__privateMethod$1(this,_Panel_instances,checkAndUpdateHeader_fn).call(this)},450))},"#startHeaderUpdateLoop"),stopHeaderUpdateLoop_fn=__name$2(function(){__privateGet$1(this,_headerUpdateTimer)&&(clearInterval(__privateGet$1(this,_headerUpdateTimer)),__privateSet$1(this,_headerUpdateTimer,null))},"#stopHeaderUpdateLoop"),checkAndUpdateHeader_fn=__name$2(function(){if(!__privateGet$1(this,_pendingHeaderText)||__privateGet$1(this,_isAnimating))return;if(__privateGet$1(this,_statusText).textContent===__privateGet$1(this,_pendingHeaderText)){__privateSet$1(this,_pendingHeaderText,null);return}const e=__privateGet$1(this,_pendingHeaderText);__privateSet$1(this,_pendingHeaderText,null),__privateMethod$1(this,_Panel_instances,animateTextChange_fn).call(this,e)},"#checkAndUpdateHeader"),animateTextChange_fn=__name$2(function(e){__privateSet$1(this,_isAnimating,!0),__privateGet$1(this,_statusText).classList.add(styles$1.fadeOut),setTimeout(()=>{__privateGet$1(this,_statusText).textContent=e,__privateGet$1(this,_statusText).classList.remove(styles$1.fadeOut),__privateGet$1(this,_statusText).classList.add(styles$1.fadeIn),setTimeout(()=>{__privateGet$1(this,_statusText).classList.remove(styles$1.fadeIn),__privateSet$1(this,_isAnimating,!1)},300)},150)},"#animateTextChange"),updateStatusIndicator_fn=__name$2(function(e){__privateGet$1(this,_indicator).className=styles$1.indicator,__privateGet$1(this,_indicator).classList.add(styles$1[e])},"#updateStatusIndicator"),scrollToBottom_fn=__name$2(function(){setTimeout(()=>{__privateGet$1(this,_historySection).scrollTop=__privateGet$1(this,_historySection).scrollHeight},0)},"#scrollToBottom"),renderHistory_fn=__name$2(function(){const e=[],t=__privateGet$1(this,_agent).task;t&&e.push(__privateMethod$1(this,_Panel_instances,createTaskCard_fn).call(this,t));const n=__privateGet$1(this,_agent).history;for(const r of n)e.push(...__privateMethod$1(this,_Panel_instances,createHistoryCards_fn).call(this,r));__privateGet$1(this,_historySection).innerHTML=e.join(""),__privateMethod$1(this,_Panel_instances,scrollToBottom_fn).call(this)},"#renderHistory"),createTaskCard_fn=__name$2(function(e){return createCard({icon:"🎯",content:e,type:"input"})},"#createTaskCard"),createHistoryCards_fn=__name$2(function(e){const t=[],n=e.type==="step"&&e.stepIndex!==void 0?__privateGet$1(this,_i18n).t("ui.panel.step",{number:(e.stepIndex+1).toString()}):void 0;if(e.type==="step"){if(e.reflection){const o=createReflectionLines(e.reflection);o.length>0&&t.push(createCard({icon:"🧠",content:o,meta:n}))}const r=e.action;r&&t.push(...__privateMethod$1(this,_Panel_instances,createActionCards_fn).call(this,r,n))}else if(e.type==="observation")t.push(createCard({icon:"👁️",content:e.content||"",meta:n,type:"observation"}));else if(e.type==="user_takeover")t.push(createCard({icon:"👤",content:"User takeover",meta:n,type:"input"}));else if(e.type==="retry"){const r=`${e.message||"Retrying"} (${e.attempt}/${e.maxAttempts})`;t.push(createCard({icon:"🔄",content:r,meta:n,type:"observation"}))}else e.type==="error"&&t.push(createCard({icon:"❌",content:e.message||"Error",meta:n,type:"observation"}));return t},"#createHistoryCards"),createActionCards_fn=__name$2(function(e,t){var r;const n=[];if(e.name==="done"){const i=e.input.text||e.output||"";i&&n.push(createCard({icon:"🤖",content:i,meta:t,type:"output"}))}else if(e.name==="ask_user"){const o=e.input,i=e.output.replace(/^User answered:\s*/i,"");n.push(createCard({icon:"❓",content:`Question: ${o.question||""}`,meta:t,type:"question"})),n.push(createCard({icon:"💬",content:`Answer: ${i}`,meta:t,type:"input"}))}else{const o=__privateMethod$1(this,_Panel_instances,getToolExecutingText_fn).call(this,e.name,e.input);n.push(createCard({icon:"🔨",content:o,meta:t})),((r=e.output)==null?void 0:r.length)>0&&n.push(createCard({icon:"🔨",content:e.output,meta:t,type:"output"}))}return n},"#createActionCards"),__name$2(_Panel,"Panel");let Panel=_Panel;var __defProp$1=Object.defineProperty,__name$1=(e,t)=>__defProp$1(e,"name",{value:t,configurable:!0});const _PageAgent=class extends PageAgentCore{constructor(n){const r=new PageController({...n,enableMask:n.enableMask??!0});super({...n,pageController:r});O(this,"panel");this.panel=new Panel(this,{language:n.language,promptForNextTask:n.promptForNextTask})}};__name$1(_PageAgent,"PageAgent");let PageAgent=_PageAgent;(function(){let e=null,t=null,n=null,r=!1,o=null,i=null,s=EMBED_CONFIG.DEFAULT_POSITION;const a=document.currentScript;if(a)i=a.getAttribute("data-organization-id"),s=a.getAttribute("data-position")||EMBED_CONFIG.DEFAULT_POSITION;else{const p=document.querySelectorAll('script[src*="embed"]'),f=Array.from(p).find(y=>y.hasAttribute("data-organization-id"));f&&(i=f.getAttribute("data-organization-id"),s=f.getAttribute("data-position")||EMBED_CONFIG.DEFAULT_POSITION)}if(!i){console.error("Echo Widget: data-organization-id attribute is required");return}function l(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d()}function d(){n=document.createElement("button"),n.id="echo-widget-button",n.innerHTML=chatBubbleIcon,n.style.cssText=`
      position: fixed;
      ${s==="bottom-right"?"right: 20px;":"left: 20px;"}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(59, 130, 246, 0.35);
      transition: all 0.2s ease;
    `,n.addEventListener("click",b),n.addEventListener("mouseenter",()=>{n&&(n.style.transform="scale(1.05)")}),n.addEventListener("mouseleave",()=>{n&&(n.style.transform="scale(1)")}),document.body.appendChild(n),t=document.createElement("div"),t.id="echo-widget-container",t.style.cssText=`
      position: fixed;
      ${s==="bottom-right"?"right: 20px;":"left: 20px;"}
      bottom: 90px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 110px);
      z-index: 999998;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `,e=document.createElement("iframe"),e.src=m(),e.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
    `,e.allow="microphone; clipboard-read; clipboard-write",t.appendChild(e),document.body.appendChild(t),window.addEventListener("message",w)}function m(){const p=new URLSearchParams;return p.append("organizationId",i),`${EMBED_CONFIG.WIDGET_URL}?${p.toString()}`}function w(p){if(p.origin!==new URL(EMBED_CONFIG.WIDGET_URL).origin)return;const{type:f,payload:y}=p.data;switch(f){case"close":S();break;case"resize":y.height&&t&&(t.style.height=`${y.height}px`);break;case"page-agent-execute":y!=null&&y.action&&h(y.action,y.requestId);break}}async function h(p,f){o||(o=new PageAgent({model:"qwen3.5-plus",baseURL:"https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run",apiKey:"NA",language:"en-US",onAfterStep:(y,$)=>{var z,N,j;const E=$[$.length-1];(E==null?void 0:E.type)==="step"&&((j=e==null?void 0:e.contentWindow)==null||j.postMessage({type:"agent-step",payload:{requestId:f,stepIndex:E.stepIndex,goal:((z=E.reflection)==null?void 0:z.next_goal)??"",actionName:((N=E.action)==null?void 0:N.name)??""}},"*"))},onAfterTask:(y,$)=>{var E;(E=e==null?void 0:e.contentWindow)==null||E.postMessage({type:"agent-done",payload:{requestId:f,success:$.success,data:$.data}},"*")}}),o.panel.hide(),o.panel.show=()=>{}),await o.execute(p)}function b(){r?S():_()}function _(){t&&n&&(r=!0,t.style.display="block",setTimeout(()=>{t&&(t.style.opacity="1",t.style.transform="translateY(0)")},10),n.innerHTML=closeIcon)}function S(){t&&n&&(r=!1,t.style.opacity="0",t.style.transform="translateY(10px)",setTimeout(()=>{t&&(t.style.display="none")},300),n.innerHTML=chatBubbleIcon,n.style.background="#3b82f6")}function v(){window.removeEventListener("message",w),t&&(t.remove(),t=null,e=null),n&&(n.remove(),n=null),o&&(o.panel.dispose(),o=null),r=!1}function u(p){v(),p.organizationId&&(i=p.organizationId),p.position&&(s=p.position),l()}window.EchoWidget={init:u,show:_,hide:S,destroy:v},l()})();/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */function computeBorderGeometry(e,t,n,r){const o=Math.max(1,Math.min(e,t)),i=Math.min(n,20),a=Math.min(i+r,o),l=Math.min(a,Math.floor(e/2)),d=Math.min(a,Math.floor(t/2)),m=g=>g/e*2-1,w=g=>g/t*2-1,h=0,b=e,_=0,S=t,v=l,u=e-l,p=d,f=t-d,y=m(h),$=m(b),E=w(_),z=w(S),N=m(v),j=m(u),X=w(p),F=w(f),R=0,ne=0,K=1,J=1,ee=l/e,Q=1-l/e,V=d/t,H=1-d/t,ue=new Float32Array([y,E,$,E,y,X,y,X,$,E,$,X,y,F,$,F,y,z,y,z,$,F,$,z,y,X,N,X,y,F,y,F,N,X,N,F,j,X,$,X,j,F,j,F,$,X,$,F]),c=new Float32Array([R,ne,K,ne,R,V,R,V,K,ne,K,V,R,H,K,H,R,J,R,J,K,H,K,J,R,V,ee,V,R,H,R,H,ee,V,ee,H,Q,V,K,V,Q,H,Q,H,K,V,K,H]);return{positions:ue,uvs:c}}/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */function compileShader(e,t,n){const r=e.createShader(t);if(!r)throw new Error("Failed to create shader");if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){const o=e.getShaderInfoLog(r)||"Unknown shader error";throw e.deleteShader(r),new Error(o)}return r}function createProgram(e,t,n){const r=compileShader(e,e.VERTEX_SHADER,t),o=compileShader(e,e.FRAGMENT_SHADER,n),i=e.createProgram();if(!i)throw new Error("Failed to create program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS)){const s=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteProgram(i),e.deleteShader(r),e.deleteShader(o),new Error(s)}return e.deleteShader(r),e.deleteShader(o),i}const fragmentShaderSource=`#version 300 es
precision lowp float;
in vec2 vUV;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uBorderWidth;
uniform float uGlowWidth;
uniform float uBorderRadius;
uniform vec3 uColors[4];
uniform float uGlowExponent;
uniform float uGlowFactor;
const float PI = 3.14159265359;
const float TWO_PI = 2.0 * PI;
const float HALF_PI = 0.5 * PI;
const vec4 startPositions = vec4(0.0, PI, HALF_PI, 1.5 * PI);
const vec4 speeds = vec4(-1.9, -1.9, -1.5, 2.1);
const vec4 innerRadius = vec4(PI * 0.8, PI * 0.7, PI * 0.3, PI * 0.1);
const vec4 outerRadius = vec4(PI * 1.2, PI * 0.9, PI * 0.6, PI * 0.4);
float random(vec2 st) {
return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
vec2 random2(vec2 st) {
return vec2(random(st), random(st + 1.0));
}
float aaStep(float edge, float d) {
float width = fwidth(d);
return smoothstep(edge - width * 0.5, edge + width * 0.5, d);
}
float aaFract(float x) {
float f = fract(x);
float w = fwidth(x);
float smooth_f = f * (1.0 - smoothstep(1.0 - w, 1.0, f));
return smooth_f;
}
float sdRoundedBox(in vec2 p, in vec2 b, in float r) {
vec2 q = abs(p) - b + r;
return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
float getInnerGlow(vec2 p, vec2 b, float radius) {
float dist_x = b.x - abs(p.x);
float dist_y = b.y - abs(p.y);
float glow_x = smoothstep(radius, 0.0, dist_x);
float glow_y = smoothstep(radius, 0.0, dist_y);
return 1.0 - (1.0 - glow_x) * (1.0 - glow_y);
}
float getVignette(vec2 uv) {
vec2 vignetteUv = uv;
vignetteUv = vignetteUv * (1.0 - vignetteUv);
float vignette = vignetteUv.x * vignetteUv.y * 25.0;
vignette = pow(vignette, 0.16);
vignette = 1.0 - vignette;
return vignette;
}
float uvToAngle(vec2 uv) {
vec2 center = vec2(0.5);
vec2 dir = uv - center;
return atan(dir.y, dir.x) + PI;
}
void main() {
vec2 uv = vUV;
vec2 pos = uv * uResolution;
vec2 centeredPos = pos - uResolution * 0.5;
vec2 size = uResolution - uBorderWidth;
vec2 halfSize = size * 0.5;
float dBorderBox = sdRoundedBox(centeredPos, halfSize, uBorderRadius);
float border = aaStep(0.0, dBorderBox);
float glow = getInnerGlow(centeredPos, halfSize, uGlowWidth);
float vignette = getVignette(uv);
glow *= vignette;
float posAngle = uvToAngle(uv);
vec4 lightCenter = mod(startPositions + speeds * uTime, TWO_PI);
vec4 angleDist = abs(posAngle - lightCenter);
vec4 disToLight = min(angleDist, TWO_PI - angleDist) / TWO_PI;
float intensityBorder[4];
intensityBorder[0] = 1.0;
intensityBorder[1] = smoothstep(0.4, 0.0, disToLight.y);
intensityBorder[2] = smoothstep(0.4, 0.0, disToLight.z);
intensityBorder[3] = smoothstep(0.2, 0.0, disToLight.w) * 0.5;
vec3 borderColor = vec3(0.0);
for(int i = 0; i < 4; i++) {
borderColor = mix(borderColor, uColors[i], intensityBorder[i]);
}
borderColor *= 1.1;
borderColor = clamp(borderColor, 0.0, 1.0);
float intensityGlow[4];
intensityGlow[0] = smoothstep(0.9, 0.0, disToLight.x);
intensityGlow[1] = smoothstep(0.7, 0.0, disToLight.y);
intensityGlow[2] = smoothstep(0.4, 0.0, disToLight.z);
intensityGlow[3] = smoothstep(0.1, 0.0, disToLight.w) * 0.7;
vec4 breath = smoothstep(0.0, 1.0, sin(uTime * 1.0 + startPositions * PI) * 0.2 + 0.8);
vec3 glowColor = vec3(0.0);
glowColor += uColors[0] * intensityGlow[0] * breath.x;
glowColor += uColors[1] * intensityGlow[1] * breath.y;
glowColor += uColors[2] * intensityGlow[2] * breath.z;
glowColor += uColors[3] * intensityGlow[3] * breath.w * glow;
glow = pow(glow, uGlowExponent);
glow *= random(pos + uTime) * 0.1 + 1.0;
glowColor *= glow * uGlowFactor;
glowColor = clamp(glowColor, 0.0, 1.0);
vec3 color = mix(glowColor, borderColor + glowColor * 0.2, border);
float alpha = mix(glow, 1.0, border);
outColor = vec4(color, alpha);
}`,vertexShaderSource=`#version 300 es
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
void main() {
vUV = aUV;
gl_Position = vec4(aPosition, 0.0, 1.0);
}`;/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */const DEFAULT_COLORS=["rgb(57, 182, 255)","rgb(189, 69, 251)","rgb(255, 87, 51)","rgb(255, 214, 0)"];function parseColor(e){const t=e.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);if(!t)throw new Error(`Invalid color format: ${e}`);const[,n,r,o]=t;return[parseInt(n)/255,parseInt(r)/255,parseInt(o)/255]}class Motion{constructor(t={}){O(this,"element");O(this,"canvas");O(this,"options");O(this,"running",!1);O(this,"disposed",!1);O(this,"startTime",0);O(this,"lastTime",0);O(this,"rafId",null);O(this,"glr");O(this,"observer");this.options={width:t.width??600,height:t.height??600,ratio:t.ratio??window.devicePixelRatio??1,borderWidth:t.borderWidth??8,glowWidth:t.glowWidth??200,borderRadius:t.borderRadius??8,mode:t.mode??"light",...t},this.canvas=document.createElement("canvas"),this.options.classNames&&(this.canvas.className=this.options.classNames),this.options.styles&&Object.assign(this.canvas.style,this.options.styles),this.canvas.style.display="block",this.canvas.style.transformOrigin="center",this.canvas.style.pointerEvents="none",this.element=this.canvas,this.setupGL(),this.options.skipGreeting||this.greet()}start(){if(this.disposed)throw new Error("Motion instance has been disposed.");if(this.running)return;if(!this.glr){console.error("WebGL resources are not initialized.");return}this.running=!0,this.startTime=performance.now(),this.resize(this.options.width??600,this.options.height??600,this.options.ratio),this.glr.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.glr.gl.useProgram(this.glr.program),this.glr.gl.uniform2f(this.glr.uResolution,this.canvas.width,this.canvas.height),this.checkGLError(this.glr.gl,"start: after initial setup");const t=()=>{if(!this.running||!this.glr)return;this.rafId=requestAnimationFrame(t);const n=performance.now();if(n-this.lastTime<1e3/32)return;this.lastTime=n;const o=(n-this.startTime)*.001;this.render(o)};this.rafId=requestAnimationFrame(t)}pause(){if(this.disposed)throw new Error("Motion instance has been disposed.");this.running=!1,this.rafId!==null&&cancelAnimationFrame(this.rafId)}dispose(){if(this.disposed)return;this.disposed=!0,this.running=!1,this.rafId!==null&&cancelAnimationFrame(this.rafId);const{gl:t,vao:n,positionBuffer:r,uvBuffer:o,program:i}=this.glr;n&&t.deleteVertexArray(n),r&&t.deleteBuffer(r),o&&t.deleteBuffer(o),t.deleteProgram(i),this.observer&&this.observer.disconnect(),this.canvas.remove()}resize(t,n,r){if(this.disposed)throw new Error("Motion instance has been disposed.");if(this.options.width=t,this.options.height=n,r&&(this.options.ratio=r),!this.running)return;const{gl:o,program:i,vao:s,positionBuffer:a,uvBuffer:l,uResolution:d}=this.glr,m=r??this.options.ratio??window.devicePixelRatio??1,w=Math.max(1,Math.floor(t*m)),h=Math.max(1,Math.floor(n*m));this.canvas.style.width=`${t}px`,this.canvas.style.height=`${n}px`,(this.canvas.width!==w||this.canvas.height!==h)&&(this.canvas.width=w,this.canvas.height=h),o.viewport(0,0,this.canvas.width,this.canvas.height),this.checkGLError(o,"resize: after viewport setup");const{positions:b,uvs:_}=computeBorderGeometry(this.canvas.width,this.canvas.height,this.options.borderWidth*m,this.options.glowWidth*m);o.bindVertexArray(s),o.bindBuffer(o.ARRAY_BUFFER,a),o.bufferData(o.ARRAY_BUFFER,b,o.STATIC_DRAW);const S=o.getAttribLocation(i,"aPosition");o.enableVertexAttribArray(S),o.vertexAttribPointer(S,2,o.FLOAT,!1,0,0),this.checkGLError(o,"resize: after position buffer update"),o.bindBuffer(o.ARRAY_BUFFER,l),o.bufferData(o.ARRAY_BUFFER,_,o.STATIC_DRAW);const v=o.getAttribLocation(i,"aUV");o.enableVertexAttribArray(v),o.vertexAttribPointer(v,2,o.FLOAT,!1,0,0),this.checkGLError(o,"resize: after UV buffer update"),o.useProgram(i),o.uniform2f(d,this.canvas.width,this.canvas.height),o.uniform1f(this.glr.uBorderWidth,this.options.borderWidth*m),o.uniform1f(this.glr.uGlowWidth,this.options.glowWidth*m),o.uniform1f(this.glr.uBorderRadius,this.options.borderRadius*m),this.checkGLError(o,"resize: after uniform updates");const u=performance.now();this.lastTime=u;const p=(u-this.startTime)*.001;this.render(p)}autoResize(t){this.observer&&this.observer.disconnect(),this.observer=new ResizeObserver(()=>{const n=t.getBoundingClientRect();this.resize(n.width,n.height)}),this.observer.observe(t)}fadeIn(){if(this.disposed)throw new Error("Motion instance has been disposed.");return new Promise((t,n)=>{const r=this.canvas.animate([{opacity:0,transform:"scale(1.2)"},{opacity:1,transform:"scale(1)"}],{duration:300,easing:"ease-out",fill:"forwards"});r.onfinish=()=>t(),r.oncancel=()=>n("canceled")})}fadeOut(){if(this.disposed)throw new Error("Motion instance has been disposed.");return new Promise((t,n)=>{const r=this.canvas.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(1.2)"}],{duration:300,easing:"ease-in",fill:"forwards"});r.onfinish=()=>t(),r.oncancel=()=>n("canceled")})}checkGLError(t,n){let r=t.getError();if(r!==t.NO_ERROR){for(console.group(`🔴 WebGL Error in ${n}`);r!==t.NO_ERROR;){const o=this.getGLErrorName(t,r);console.error(`${o} (0x${r.toString(16)})`),r=t.getError()}console.groupEnd()}}getGLErrorName(t,n){switch(n){case t.INVALID_ENUM:return"INVALID_ENUM";case t.INVALID_VALUE:return"INVALID_VALUE";case t.INVALID_OPERATION:return"INVALID_OPERATION";case t.INVALID_FRAMEBUFFER_OPERATION:return"INVALID_FRAMEBUFFER_OPERATION";case t.OUT_OF_MEMORY:return"OUT_OF_MEMORY";case t.CONTEXT_LOST_WEBGL:return"CONTEXT_LOST_WEBGL";default:return"UNKNOWN_ERROR"}}setupGL(){const t=this.canvas.getContext("webgl2",{antialias:!1,alpha:!0});if(!t)throw new Error("WebGL2 is required but not available.");const n=createProgram(t,vertexShaderSource,fragmentShaderSource);this.checkGLError(t,"setupGL: after createProgram");const r=t.createVertexArray();t.bindVertexArray(r),this.checkGLError(t,"setupGL: after VAO creation");const o=this.canvas.width||2,i=this.canvas.height||2,{positions:s,uvs:a}=computeBorderGeometry(o,i,this.options.borderWidth,this.options.glowWidth),l=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,l),t.bufferData(t.ARRAY_BUFFER,s,t.STATIC_DRAW);const d=t.getAttribLocation(n,"aPosition");t.enableVertexAttribArray(d),t.vertexAttribPointer(d,2,t.FLOAT,!1,0,0),this.checkGLError(t,"setupGL: after position buffer setup");const m=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,m),t.bufferData(t.ARRAY_BUFFER,a,t.STATIC_DRAW);const w=t.getAttribLocation(n,"aUV");t.enableVertexAttribArray(w),t.vertexAttribPointer(w,2,t.FLOAT,!1,0,0),this.checkGLError(t,"setupGL: after UV buffer setup");const h=t.getUniformLocation(n,"uResolution"),b=t.getUniformLocation(n,"uTime"),_=t.getUniformLocation(n,"uBorderWidth"),S=t.getUniformLocation(n,"uGlowWidth"),v=t.getUniformLocation(n,"uBorderRadius"),u=t.getUniformLocation(n,"uColors"),p=t.getUniformLocation(n,"uGlowExponent"),f=t.getUniformLocation(n,"uGlowFactor");t.useProgram(n),t.uniform1f(_,this.options.borderWidth),t.uniform1f(S,this.options.glowWidth),t.uniform1f(v,this.options.borderRadius),this.options.mode==="dark"?(t.uniform1f(p,2),t.uniform1f(f,1.8)):(t.uniform1f(p,1),t.uniform1f(f,1));const y=(this.options.colors||DEFAULT_COLORS).map(parseColor);for(let $=0;$<y.length;$++)t.uniform3f(t.getUniformLocation(n,`uColors[${$}]`),...y[$]);this.checkGLError(t,"setupGL: after uniform setup"),t.bindVertexArray(null),t.bindBuffer(t.ARRAY_BUFFER,null),this.glr={gl:t,program:n,vao:r,positionBuffer:l,uvBuffer:m,uResolution:h,uTime:b,uBorderWidth:_,uGlowWidth:S,uBorderRadius:v,uColors:u}}render(t){if(!this.glr)return;const{gl:n,program:r,vao:o,uTime:i}=this.glr;n.useProgram(r),n.bindVertexArray(o),n.uniform1f(i,t),n.disable(n.DEPTH_TEST),n.disable(n.CULL_FACE),n.disable(n.BLEND),n.clearColor(0,0,0,0),n.clear(n.COLOR_BUFFER_BIT),n.drawArrays(n.TRIANGLES,0,24),this.checkGLError(n,"render: after draw call"),n.bindVertexArray(null)}greet(){console.log("%c🌈 ai-motion 0.4.8 🌈","background: linear-gradient(90deg, #39b6ff, #bd45fb, #ff5733, #ffd600); color: white; text-shadow: 0 0 2px rgba(0, 0, 0, 0.2); font-weight: bold; font-size: 1em; padding: 2px 12px; border-radius: 6px;")}}(function(){try{if(typeof document<"u"){var e=document.createElement("style");e.appendChild(document.createTextNode(`._wrapper_1ooyb_1 {
	position: fixed;
	inset: 0;
	z-index: 2147483641; /* 确保在所有元素之上，除了 panel */
	cursor: wait;
	overflow: hidden;

	display: none;
}

._wrapper_1ooyb_1._visible_1ooyb_11 {
	display: block;
}
/* AI 光标样式 */
._cursor_1dgwb_2 {
	position: absolute;
	width: var(--cursor-size, 75px);
	height: var(--cursor-size, 75px);
	pointer-events: none;
	z-index: 10000;
}

._cursorBorder_1dgwb_10 {
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(45deg, rgb(57, 182, 255), rgb(189, 69, 251));
	mask-image: url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20fill='none'%3e%3cg%3e%3cpath%20d='M%2015%2042%20L%2015%2036.99%20Q%2015%2031.99%2023.7%2031.99%20L%2028.05%2031.99%20Q%2032.41%2031.99%2032.41%2021.99%20L%2032.41%2017%20Q%2032.41%2012%2041.09%2016.95%20L%2076.31%2037.05%20Q%2085%2042%2076.31%2046.95%20L%2041.09%2067.05%20Q%2032.41%2072%2032.41%2062.01%20L%2032.41%2057.01%20Q%2032.41%2052.01%2023.7%2052.01%20L%2019.35%2052.01%20Q%2015%2052.01%2015%2047.01%20Z'%20fill='none'%20stroke='%23000000'%20stroke-width='6'%20stroke-miterlimit='10'%20style='stroke:%20light-dark(rgb(0,%200,%200),%20rgb(255,%20255,%20255));'/%3e%3c/g%3e%3c/svg%3e");
	mask-size: 100% 100%;
	mask-repeat: no-repeat;

	transform-origin: center;
	transform: rotate(-135deg) scale(1.2);
	margin-left: -10px;
	margin-top: -18px;
}

._cursorFilling_1dgwb_25 {
	position: absolute;
	width: 100%;
	height: 100%;
	background: url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3e%3cdefs%3e%3c/defs%3e%3cg%20xmlns='http://www.w3.org/2000/svg'%20style='filter:%20drop-shadow(light-dark(rgba(0,%200,%200,%200.4),%20rgba(237,%20237,%20237,%200.4))%203px%204px%204px);'%3e%3cpath%20d='M%2015%2042%20L%2015%2036.99%20Q%2015%2031.99%2023.7%2031.99%20L%2028.05%2031.99%20Q%2032.41%2031.99%2032.41%2021.99%20L%2032.41%2017%20Q%2032.41%2012%2041.09%2016.95%20L%2076.31%2037.05%20Q%2085%2042%2076.31%2046.95%20L%2041.09%2067.05%20Q%2032.41%2072%2032.41%2062.01%20L%2032.41%2057.01%20Q%2032.41%2052.01%2023.7%2052.01%20L%2019.35%2052.01%20Q%2015%2052.01%2015%2047.01%20Z'%20fill='%23ffffff'%20stroke='none'%20style='fill:%20%23ffffff;'/%3e%3c/g%3e%3c/svg%3e");
	background-size: 100% 100%;
	background-repeat: no-repeat;

	transform-origin: center;
	transform: rotate(-135deg) scale(1.2);
	margin-left: -10px;
	margin-top: -18px;
}

._cursorRipple_1dgwb_39 {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
	margin-left: -50%;
	margin-top: -50%;

	&::after {
		content: '';
		opacity: 0;
		position: absolute;
		inset: 0;
		border: 4px solid rgba(57, 182, 255, 1);
		border-radius: 50%;
	}
}

._cursor_1dgwb_2._clicking_1dgwb_57 ._cursorRipple_1dgwb_39::after {
	animation: _cursor-ripple_1dgwb_1 300ms ease-out forwards;
}

@keyframes _cursor-ripple_1dgwb_1 {
	0% {
		transform: scale(0);
		opacity: 1;
	}
	100% {
		transform: scale(2);
		opacity: 0;
	}
}`)),document.head.appendChild(e)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();var __defProp=Object.defineProperty,__typeError=e=>{throw TypeError(e)},__defNormalProp=(e,t,n)=>t in e?__defProp(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,__name=(e,t)=>__defProp(e,"name",{value:t,configurable:!0}),__publicField=(e,t,n)=>__defNormalProp(e,typeof t!="symbol"?t+"":t,n),__accessCheck=(e,t,n)=>t.has(e)||__typeError("Cannot "+n),__privateGet=(e,t,n)=>(__accessCheck(e,t,"read from private field"),n?n.call(e):t.get(e)),__privateAdd=(e,t,n)=>t.has(e)?__typeError("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),__privateSet=(e,t,n,r)=>(__accessCheck(e,t,"write to private field"),t.set(e,n),n),__privateMethod=(e,t,n)=>(__accessCheck(e,t,"access private method"),n),_cursor,_currentCursorX,_currentCursorY,_targetCursorX,_targetCursorY,_SimulatorMask_instances,createCursor_fn,moveCursorToTarget_fn;function hasDarkModeClass(){const e=["dark","dark-mode","theme-dark","night","night-mode"],t=document.documentElement,n=document.body||document.documentElement;for(const o of e)if(t.classList.contains(o)||n!=null&&n.classList.contains(o))return!0;const r=t.getAttribute("data-theme");return!!(r!=null&&r.toLowerCase().includes("dark"))}__name(hasDarkModeClass,"hasDarkModeClass");function parseRgbColor(e){const t=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(e);return t?{r:parseInt(t[1]),g:parseInt(t[2]),b:parseInt(t[3])}:null}__name(parseRgbColor,"parseRgbColor");function isColorDark(e,t=128){if(!e||e==="transparent"||e.startsWith("rgba(0, 0, 0, 0)"))return!1;const n=parseRgbColor(e);return n?.299*n.r+.587*n.g+.114*n.b<t:!1}__name(isColorDark,"isColorDark");function isBackgroundDark(){const e=window.getComputedStyle(document.documentElement),t=window.getComputedStyle(document.body||document.documentElement),n=e.backgroundColor,r=t.backgroundColor;return isColorDark(r)?!0:r==="transparent"||r.startsWith("rgba(0, 0, 0, 0)")?isColorDark(n):!1}__name(isBackgroundDark,"isBackgroundDark");function isPageDark(){try{return!!(hasDarkModeClass()||isBackgroundDark())}catch(e){return console.warn("Error determining if page is dark:",e),!1}}__name(isPageDark,"isPageDark");const wrapper="_wrapper_1ooyb_1",visible="_visible_1ooyb_11",styles={wrapper,visible},cursor="_cursor_1dgwb_2",cursorBorder="_cursorBorder_1dgwb_10",cursorFilling="_cursorFilling_1dgwb_25",cursorRipple="_cursorRipple_1dgwb_39",clicking="_clicking_1dgwb_57",cursorStyles={cursor,cursorBorder,cursorFilling,cursorRipple,clicking},_SimulatorMask=class extends EventTarget{constructor(){super(),__privateAdd(this,_SimulatorMask_instances),__publicField(this,"shown",!1),__publicField(this,"wrapper",document.createElement("div")),__publicField(this,"motion",null),__privateAdd(this,_cursor,document.createElement("div")),__privateAdd(this,_currentCursorX,0),__privateAdd(this,_currentCursorY,0),__privateAdd(this,_targetCursorX,0),__privateAdd(this,_targetCursorY,0),this.wrapper.id="page-agent-runtime_simulator-mask",this.wrapper.className=styles.wrapper,this.wrapper.setAttribute("data-browser-use-ignore","true"),this.wrapper.setAttribute("data-page-agent-ignore","true");try{const i=new Motion({mode:isPageDark()?"dark":"light",styles:{position:"absolute",inset:"0"}});this.motion=i,this.wrapper.appendChild(i.element),i.autoResize(this.wrapper)}catch(i){console.warn("[SimulatorMask] Motion overlay unavailable:",i)}this.wrapper.addEventListener("click",i=>{i.stopPropagation(),i.preventDefault()}),this.wrapper.addEventListener("mousedown",i=>{i.stopPropagation(),i.preventDefault()}),this.wrapper.addEventListener("mouseup",i=>{i.stopPropagation(),i.preventDefault()}),this.wrapper.addEventListener("mousemove",i=>{i.stopPropagation(),i.preventDefault()}),this.wrapper.addEventListener("wheel",i=>{i.stopPropagation(),i.preventDefault()}),this.wrapper.addEventListener("keydown",i=>{i.stopPropagation(),i.preventDefault()}),this.wrapper.addEventListener("keyup",i=>{i.stopPropagation(),i.preventDefault()}),__privateMethod(this,_SimulatorMask_instances,createCursor_fn).call(this),document.body.appendChild(this.wrapper),__privateMethod(this,_SimulatorMask_instances,moveCursorToTarget_fn).call(this);const t=__name(i=>{const{x:s,y:a}=i.detail;this.setCursorPosition(s,a)},"movePointerToListener"),n=__name(()=>{this.triggerClickAnimation()},"clickPointerListener"),r=__name(()=>{this.wrapper.style.pointerEvents="none"},"enablePassThroughListener"),o=__name(()=>{this.wrapper.style.pointerEvents="auto"},"disablePassThroughListener");window.addEventListener("PageAgent::MovePointerTo",t),window.addEventListener("PageAgent::ClickPointer",n),window.addEventListener("PageAgent::EnablePassThrough",r),window.addEventListener("PageAgent::DisablePassThrough",o),this.addEventListener("dispose",()=>{window.removeEventListener("PageAgent::MovePointerTo",t),window.removeEventListener("PageAgent::ClickPointer",n),window.removeEventListener("PageAgent::EnablePassThrough",r),window.removeEventListener("PageAgent::DisablePassThrough",o)})}setCursorPosition(t,n){__privateSet(this,_targetCursorX,t),__privateSet(this,_targetCursorY,n)}triggerClickAnimation(){__privateGet(this,_cursor).classList.remove(cursorStyles.clicking),__privateGet(this,_cursor).offsetHeight,__privateGet(this,_cursor).classList.add(cursorStyles.clicking)}show(){var t,n;this.shown||(this.shown=!0,(t=this.motion)==null||t.start(),(n=this.motion)==null||n.fadeIn(),this.wrapper.classList.add(styles.visible),__privateSet(this,_currentCursorX,window.innerWidth/2),__privateSet(this,_currentCursorY,window.innerHeight/2),__privateSet(this,_targetCursorX,__privateGet(this,_currentCursorX)),__privateSet(this,_targetCursorY,__privateGet(this,_currentCursorY)),__privateGet(this,_cursor).style.left=`${__privateGet(this,_currentCursorX)}px`,__privateGet(this,_cursor).style.top=`${__privateGet(this,_currentCursorY)}px`)}hide(){var t,n;this.shown&&(this.shown=!1,(t=this.motion)==null||t.fadeOut(),(n=this.motion)==null||n.pause(),__privateGet(this,_cursor).classList.remove(cursorStyles.clicking),setTimeout(()=>{this.wrapper.classList.remove(styles.visible)},800))}dispose(){var t;console.log("dispose SimulatorMask"),(t=this.motion)==null||t.dispose(),this.wrapper.remove(),this.dispatchEvent(new Event("dispose"))}};_cursor=new WeakMap,_currentCursorX=new WeakMap,_currentCursorY=new WeakMap,_targetCursorX=new WeakMap,_targetCursorY=new WeakMap,_SimulatorMask_instances=new WeakSet,createCursor_fn=__name(function(){__privateGet(this,_cursor).className=cursorStyles.cursor;const e=document.createElement("div");e.className=cursorStyles.cursorRipple,__privateGet(this,_cursor).appendChild(e);const t=document.createElement("div");t.className=cursorStyles.cursorFilling,__privateGet(this,_cursor).appendChild(t);const n=document.createElement("div");n.className=cursorStyles.cursorBorder,__privateGet(this,_cursor).appendChild(n),this.wrapper.appendChild(__privateGet(this,_cursor))},"#createCursor"),moveCursorToTarget_fn=__name(function(){const e=__privateGet(this,_currentCursorX)+(__privateGet(this,_targetCursorX)-__privateGet(this,_currentCursorX))*.2,t=__privateGet(this,_currentCursorY)+(__privateGet(this,_targetCursorY)-__privateGet(this,_currentCursorY))*.2,n=Math.abs(e-__privateGet(this,_targetCursorX));n>0&&(n<2?__privateSet(this,_currentCursorX,__privateGet(this,_targetCursorX)):__privateSet(this,_currentCursorX,e),__privateGet(this,_cursor).style.left=`${__privateGet(this,_currentCursorX)}px`);const r=Math.abs(t-__privateGet(this,_targetCursorY));r>0&&(r<2?__privateSet(this,_currentCursorY,__privateGet(this,_targetCursorY)):__privateSet(this,_currentCursorY,t),__privateGet(this,_cursor).style.top=`${__privateGet(this,_currentCursorY)}px`),requestAnimationFrame(()=>__privateMethod(this,_SimulatorMask_instances,moveCursorToTarget_fn).call(this))},"#moveCursorToTarget"),__name(_SimulatorMask,"SimulatorMask");let SimulatorMask=_SimulatorMask;const SimulatorMaskCU7szDjy=Object.freeze(Object.defineProperty({__proto__:null,SimulatorMask},Symbol.toStringTag,{value:"Module"}))})();
