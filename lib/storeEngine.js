// @ts-nocheck
// Motor de la tienda (Etapa 1): idéntico a la demo. Configuración central: objeto CFG.
import gsap from "gsap";
import { getSupabase } from "@/lib/supabase/client";

export function initStore() {
/* ===== CONFIGURACIÓN CENTRAL: acá se cambia marca, productos y modelos (luego vendrá de Supabase) ===== */
const IMGS={rosa:{u:"/assets/cases/rosa.webp",w:242,h:480},cian:{u:"/assets/cases/cian.webp",w:242,h:480},naranja:{u:"/assets/cases/naranja.webp",w:242,h:480},verdeagua:{u:"/assets/cases/verdeagua.webp",w:231,h:459},verdeingles:{u:"/assets/cases/verdeingles.webp",w:91,h:177},animal:{u:"/assets/cases/animal.webp",w:234,h:480},rayas:{u:"/assets/cases/rayas.webp",w:226,h:454}};
const CFG={brand:"Valentin store",logo:"Valentin",wa:"5493415418559",
 models:["iPhone 13","iPhone 13 Pro","iPhone 14","iPhone 14 Pro","iPhone 15","iPhone 15 Pro","iPhone 16","iPhone 16 Pro"],
 // m:[desde,hasta] = índices de CFG.models compatibles. Reemplazar "style" por "img" cuando existan fotos reales.
 products:[
  {id:"rosa",code:"FC-001",name:"Rosa Chicle",price:13500,m:[0,7],img:"rosa",look:"photo"},
  {id:"cian",code:"FC-002",name:"Cian",price:12900,m:[0,7],img:"cian",look:"photo"},
  {id:"naranja",code:"FC-003",name:"Naranja Flúor",price:12900,m:[0,7],img:"naranja",look:"photo"},
  {id:"verdeagua",code:"FC-004",name:"Verde Agua",price:12900,m:[0,7],img:"verdeagua",look:"photo"},
  {id:"verdeingles",code:"FC-005",name:"Verde Inglés",price:12900,m:[0,7],img:"verdeingles",look:"photo"},
  {id:"animal",code:"FC-006",name:"Animal Print",price:14900,m:[0,7],img:"animal",look:"photo"},
  {id:"rayas",code:"FC-007",name:"Rayas Blanco y Negro",price:14500,m:[0,7],img:"rayas",look:"photo"},
  {id:"transp",code:"FC-008",name:"Cristal",price:9900,m:[0,7]}]};
const $=s=>document.querySelector(s),money=n=>"$"+n.toLocaleString("es-AR");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const imgOf=p=>p.url?{u:p.url,w:p.w||1,h:p.h||2}:IMGS[p.img];
const sty=p=>{const m=imgOf(p);return m?`background-image:url(${m.u});aspect-ratio:${m.w}/${m.h}`:p.color?`background:linear-gradient(160deg,${p.color},color-mix(in srgb,${p.color} 55%,#000))`:""};
/* ===== Datos de la tienda (DEMO: localStorage). Producción: tablas de Supabase, ver supabase-schema.sql ===== */
const DB={d:null,load(){try{this.d=JSON.parse(localStorage.getItem("vs_data"))}catch(e){}
 if(!this.d||this.d.v!==2)this.d={v:2,brand:CFG.brand,logo:CFG.logo,cats:[{n:"Fundas",t:true}],products:CFG.products.map(p=>({...p,cat:"Fundas",look:p.look||p.id}))};
 CFG.brand=this.d.brand;CFG.logo=this.d.logo},save(){try{localStorage.setItem("vs_data",JSON.stringify(this.d))}catch(e){}}};
DB.load();
const byId=id=>DB.d.products.find(p=>p.id===id);
let model=5,sel=null,applied=null,cart={},busy=false;
try{cart=JSON.parse(localStorage.getItem("fc_cart")||"{}")}catch(e){}
const save=()=>{try{localStorage.setItem("fc_cart",JSON.stringify(cart))}catch(e){}};
const tryOn=p=>(DB.d.cats.find(c=>c.n===p.cat)||{t:true}).t;
const ok=p=>!tryOn(p)||(model>=p.m[0]&&model<=p.m[1]);
const range=p=>p.m[0]===p.m[1]?CFG.models[p.m[0]]:CFG.models[p.m[0]]+" a "+CFG.models[p.m[1]];

const applyBrand=()=>{$("#brand").textContent=CFG.brand;$("#logo").textContent=CFG.logo;document.title=CFG.brand+" · Demo de tienda inmersiva"};
$("#model").innerHTML=CFG.models.map((m,i)=>`<option value="${i}"${i===model?" selected":""}>${m}</option>`).join("");

/* ===== Pasarela ===== */
const track=$("#track"),runway=$("#runway");
let items=[],catF="all";
function buildRunway(){
 track.innerHTML="";
 items=DB.d.products.filter(p=>catF==="all"||p.cat===catF).map((p,i)=>{
  const el=document.createElement("div");el.className="item";el.dataset.id=p.id;
  el.innerHTML=`<div class="case s-${p.look}" style="${sty(p)}"></div><div class="lbl"><b>${esc(p.name)}</b><span>${money(p.price)}</span></div>`;
  track.appendChild(el);return{el,p,i,k:0}});
 gsap.set(".item",{xPercent:-50,yPercent:-55});
 if(sel&&!items.some(o=>o.p.id===sel))sel=null;
}
let offset=0,speed=0,hover=false,drag=false,dragX=0,moved=0,sp=200;
const mobile=()=>innerWidth<700;
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
gsap.set(".item",{xPercent:-50,yPercent:-55});
gsap.ticker.add((t,dt)=>{
 sp=mobile()?125:200;const total=items.length*sp;
 const target=drag||reduce?0:hover?26:42;
 const ap=applied&&byId(applied);$("#phone").classList.toggle("ph",!!(ap&&imgOf(ap)));
 speed+=(target-speed)*Math.min(1,dt*.006);
 offset+=speed*dt/1000;
 items.forEach(o=>{
  const pos=(((o.i*sp+offset)%total)+total)%total-total/2,tt=Math.abs(pos)/(total/2);
  o.k+=((o.p.id===sel?1:0)-o.k)*Math.min(1,dt*.012);
  gsap.set(o.el,{x:pos,scale:(1.15-.6*tt)*(1+.22*o.k),rotationY:-pos/(total/2)*32,z:-tt*260+o.k*80,opacity:1-tt*.55,zIndex:Math.round(100-tt*100+o.k*60)});
 });
});
runway.addEventListener("pointerenter",()=>hover=true);
runway.addEventListener("pointerleave",()=>hover=false);
runway.addEventListener("pointerdown",e=>{drag=true;dragX=e.clientX;moved=0});
addEventListener("pointermove",e=>{
 if(drag){const d=e.clientX-dragX;dragX=e.clientX;moved+=Math.abs(d);offset+=d}
 const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
 if(!reduce)gsap.to("#phone",{rotationY:x*26,rotationX:-y*10,duration:.9,ease:"power2.out",overwrite:"auto"});
});
addEventListener("pointerup",e=>{
 if(!drag)return;drag=false;
 if(moved<6){const it=e.target.closest&&e.target.closest(".item");if(it&&runway.contains(it))choose(it.dataset.id)}
});

/* ===== Volar una funda de un lugar a otro ===== */
function fly(srcEl,cls,toRect,{rot=0,end=1,dur=.9,ease="power3.inOut"}={}){
 return new Promise(res=>{
  const r=srcEl.getBoundingClientRect(),c=document.createElement("div");
  c.className=srcEl.className;c.style.background=srcEl.style.background;c.style.backgroundImage=srcEl.style.backgroundImage;
  Object.assign(c.style,{position:"fixed",left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px",zIndex:999,pointerEvents:"none"});
  document.body.appendChild(c);
  const w=toRect.width*end,h=toRect.height*end;
  gsap.to(c,{left:toRect.left+(toRect.width-w)/2,top:toRect.top+(toRect.height-h)/2,width:w,height:h,rotation:rot,duration:dur,ease,onComplete:()=>{c.remove();res()}});
 });
}

/* ===== Selección y prueba en el iPhone ===== */
function skin(p){const pc=$("#pcase"),im=imgOf(p);pc.className="case s-"+p.look;pc.style.background=im?"":sty(p).slice(11);pc.style.backgroundImage=im?`url(${im.u})`:""}
async function choose(id){
 if(sel===id){sel=null;render();return}
 sel=id;render();
 const p=byId(id);if(!tryOn(p)||!ok(p)||busy)return;
 busy=true;
 const src=items.find(o=>o.p.id===id).el.querySelector(".case");
 const target=$("#phone").getBoundingClientRect();
 await fly(src,"s-"+id,target,{rot:0,end:1.04,dur:.85});
 skin(p);gsap.set("#pcase",{opacity:1});applied=id;
 gsap.timeline().to("#phone",{rotationY:-28,duration:.45,ease:"power2.out"}).to("#phone",{rotationY:14,duration:.5}).to("#phone",{rotationY:0,duration:.5,ease:"back.out(2)"});
 gsap.fromTo("#pcase",{filter:"brightness(1.8)"},{filter:"brightness(1)",duration:.6});
 busy=false;
}
function render(){
 const p=sel&&byId(sel);
 items.forEach(o=>o.el.classList.toggle("no",!ok(o.p)));
 $("#pname").textContent=CFG.models[model]+" · "+PHCOL.find(c=>c[0]===pcol)[1];
 $("#cam").classList.toggle("pro",CFG.models[model].includes("Pro"));
 const st=$("#status"),add=$("#addBtn");
 if(!p){$("#cName").textContent="Elegí una funda";$("#cMeta").textContent="Tocá una funda de la pasarela para probarla en el iPhone. Arrastrá para recorrer.";$("#cPrice").textContent="";st.textContent="";add.disabled=true;return}
 $("#cName").textContent=p.name;
 $("#cMeta").innerHTML=`Código ${esc(p.code)}`+(tryOn(p)?`<br>Compatible: ${range(p)}`:"");
 $("#cPrice").textContent=money(p.price);
 const good=ok(p);st.className=good?"":"bad";
 st.textContent=good?(tryOn(p)?"Compatible con tu "+CFG.models[model]+".":"Lista para agregar a tu bolsa."):"No es compatible con "+CFG.models[model]+". Cambiá el modelo o elegí otra funda.";
 add.disabled=!good;
}
$("#model").addEventListener("change",e=>{
 model=+e.target.value;
 const p=applied&&byId(applied);
 if(p&&!ok(p)){gsap.to("#pcase",{opacity:0,duration:.4});applied=null;toast("Quitamos la funda: no calza en "+CFG.models[model])}
 gsap.fromTo("#phone",{scale:.94},{scale:1,duration:.5,ease:"back.out(2)"});
 render();
});

/* ===== Bolsa y carrito ===== */
const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);
const sum=()=>Object.entries(cart).reduce((a,[id,q])=>a+byId(id).price*q,0);
function paint(){
 for(const id in cart)if(!byId(id))delete cart[id];
 $("#badge").textContent=count();
 const ids=Object.keys(cart);
 $("#list").innerHTML=ids.length?ids.map(id=>{const p=byId(id),q=cart[id];
  return `<div class="row"><div class="case s-${p.look}" style="${sty(p)}"></div><div><b>${esc(p.name)}</b><small>${p.code} · ${money(p.price)} c/u</small>
  <div class="qty"><button data-a="-" data-id="${id}" aria-label="Menos">−</button>${q}<button data-a="+" data-id="${id}" aria-label="Más">+</button><button class="del" data-a="x" data-id="${id}">Quitar</button></div></div>
  <b>${money(p.price*q)}</b></div>`}).join(""):`<div class="empty">Tu bolsa está vacía.<br>Elegí una funda en la pasarela y agregala.</div>`;
 $("#total").textContent=money(sum());
 $("#ctotal").textContent=money(sum()+ +$("#fs").value);
 $("#goCheckout").disabled=!ids.length;
}
$("#list").addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;const id=b.dataset.id,a=b.dataset.a;
 if(a==="+")cart[id]++;if(a==="-"&&--cart[id]<1)delete cart[id];if(a==="x")delete cart[id];
 save();paint();
});
$("#fs").addEventListener("change",paint);
$("#addBtn").addEventListener("click",async()=>{
 const p=byId(sel);if(!p||!ok(p)||busy)return;busy=true;
 const src=applied===sel?$("#pcase"):items.find(o=>o.p.id===sel).el.querySelector(".case");
 await fly(src,"s-"+sel,$("#bag").getBoundingClientRect(),{rot:-18,end:.3,dur:.8,ease:"power2.in"});
 cart[sel]=(cart[sel]||0)+1;save();paint();busy=false;
 gsap.timeline().to("#bag",{scaleY:.88,scaleX:1.06,duration:.12,transformOrigin:"50% 100%"}).to("#bag",{scaleY:1,scaleX:1,duration:.7,ease:"elastic.out(1.2,.35)"});
 gsap.fromTo("#badge",{scale:1.9},{scale:1,duration:.5,ease:"back.out(3)"});
 toast(p.name+" ya está en tu bolsa");
});
function openD(){
 showV("vCart");
 gsap.set("#scrim",{pointerEvents:"auto"});gsap.to("#scrim",{opacity:1,duration:.3});
 gsap.to("#drawer",{x:0,duration:.55,ease:"power3.out"});
 gsap.from(".row",{x:30,opacity:0,stagger:.07,delay:.2,duration:.4});
}
function closeD(){gsap.to("#drawer",{x:"105%",duration:.4,ease:"power3.in"});gsap.to("#scrim",{opacity:0,duration:.3,onComplete:()=>gsap.set("#scrim",{pointerEvents:"none"})})}
function showV(v){document.querySelectorAll(".view").forEach(e=>e.classList.toggle("on",e.id===v));$("#dTitle").textContent=v==="vCart"?"Tu bolsa":"Finalizar compra"}
$("#bag").addEventListener("click",openD);$("#closeD").addEventListener("click",closeD);
$("#scrim").addEventListener("click",closeD);$("#keep").addEventListener("click",closeD);
addEventListener("keydown",e=>{if(e.key==="Escape"){closeD();$("#authM").hidden=true;$("#admin").hidden=true}});
$("#goCheckout").addEventListener("click",()=>{paint();showV("vCheck");gsap.from("#vCheck > *",{y:14,opacity:0,stagger:.05,duration:.35})});
$("#back").addEventListener("click",()=>showV("vCart"));
$("#wa").addEventListener("click",()=>{
 const n=$("#fn").value.trim(),t=$("#ft").value.trim(),a=$("#fa").value.trim();
 if(!n||!t||!a){toast("Completá nombre, teléfono y dirección");return}
 const lines=Object.entries(cart).map(([id,q])=>`• ${q} × ${byId(id).name} (${byId(id).code}) · ${CFG.models[model]}`);
 const msg=`Hola, soy ${n}. Quiero hacer este pedido:\n${lines.join("\n")}\nEnvío: ${$("#fs").selectedOptions[0].text}\nDirección: ${a}\nTeléfono: ${t}\nTotal: ${$("#ctotal").textContent}`;
 window.open(`https://wa.me/${CFG.wa}?text=${encodeURIComponent(msg)}`,"_blank");
});
function toast(m){const t=$("#toast");t.textContent=m;gsap.killTweensOf(t);gsap.timeline().to(t,{opacity:1,y:0,duration:.3}).to(t,{opacity:0,y:-20,duration:.3,delay:1.8})}

/* ===== Etapa 2 · Supabase: cuentas, tienda y panel ===== */
let sb=null;try{sb=getSupabase()}catch(e){}
const SLUG=process.env.NEXT_PUBLIC_STORE_SLUG||"valentin-store";
let myStore=null,MODELS=[];
const slugify=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const fillModels=()=>{model=Math.min(model,CFG.models.length-1);$("#model").innerHTML=CFG.models.map((m,i)=>`<option value="${i}"${i===model?" selected":""}>${esc(m)}</option>`).join("")};

const Auth={u:null,
 async init(){if(!sb)return;const{data}=await sb.auth.getSession();this.u=data.session?data.session.user:null},
 user(){return this.u?this.u.email:null},
 async signUp(e,p){if(!sb)throw Error("Supabase no está configurado");const{data,error}=await sb.auth.signUp({email:e,password:p});if(error)throw error;
  if(!data.session)throw Error("Te enviamos un email para confirmar la cuenta. Confirmala y después ingresá.");this.u=data.user},
 async signIn(e,p){if(!sb)throw Error("Supabase no está configurado");const{data,error}=await sb.auth.signInWithPassword({email:e,password:p});if(error)throw error;this.u=data.user},
 async signOut(){if(sb)await sb.auth.signOut();this.u=null}};
const authUI=()=>{$("#authBtn").textContent=Auth.user()?"Mi panel":"Ingresar"};

/* Datos de la tienda desde Supabase -> formato interno de la pasarela */
function fromRows(st,cats,mods,prods){
 MODELS=mods;const ids=mods.map(m=>m.id);
 CFG.models.splice(0,CFG.models.length,...mods.map(m=>m.name));
 const cn={};cats.forEach(c=>cn[c.id]=c.name);
 DB.d={v:2,brand:st.name,logo:st.logo_text||st.name,
  cats:cats.map(c=>({id:c.id,n:c.name,t:c.try_on})),
  products:prods.map(p=>{const ix=(p.compat_model_ids||[]).map(i=>ids.indexOf(i)).filter(i=>i>=0);
   return{id:p.id,code:p.code||"",name:p.name,price:+p.price,cat:cn[p.category_id]||"",look:p.look,color:p.color||undefined,img:p.image_key||undefined,url:p.image_url||undefined,w:p.image_w,h:p.image_h,m:ix.length?[Math.min(...ix),Math.max(...ix)]:[0,Math.max(0,ids.length-1)]}})};
 CFG.brand=DB.d.brand;CFG.logo=DB.d.logo}
async function loadRow(st){
 const[c,m,p]=await Promise.all([
  sb.from("categories").select("*").eq("store_id",st.id).order("sort"),
  sb.from("phone_models").select("*").eq("store_id",st.id).order("sort"),
  sb.from("products").select("*").eq("store_id",st.id).order("created_at")]);
 if(c.error||m.error||p.error||!m.data.length)return false;
 fromRows(st,c.data,m.data,p.data);fillModels();applyBrand();refresh();return true}
async function boot(){
 if(!sb)return;
 try{let st=null;myStore=null;
  if(Auth.user()){const r=await sb.from("stores").select("*").eq("owner_id",Auth.u.id).order("created_at").limit(1);st=(r.data&&r.data[0])||null;myStore=st}
  if(!st){const r=await sb.from("stores").select("*").eq("slug",SLUG).maybeSingle();st=r.data}
  if(st)await loadRow(st)}catch(e){console.error(e)}}

/* ===== Acceso ===== */
let amode="in";
function amSet(m){amode=m;$("#amT").textContent=m==="in"?"Ingresar":"Crear cuenta";$("#aGo").textContent=m==="in"?"Ingresar":"Crear mi cuenta";$("#aSw").textContent=m==="in"?"No tengo cuenta · Registrarme":"Ya tengo cuenta · Ingresar"}
$("#authBtn").addEventListener("click",()=>{if(Auth.user())openAdmin();else{amSet("in");$("#authM").hidden=false;gsap.fromTo("#authM .box",{y:30,opacity:0},{y:0,opacity:1,duration:.4,ease:"power3.out"})}});
$("#amX").onclick=()=>$("#authM").hidden=true;
$("#aSw").onclick=()=>amSet(amode==="in"?"up":"in");
$("#aGo").onclick=async()=>{const e=$("#ae").value.trim().toLowerCase(),p=$("#ap").value;
 if(!e.includes("@")||p.length<6)return toast("Email válido y contraseña de 6+ caracteres");
 try{await(amode==="in"?Auth.signIn(e,p):Auth.signUp(e,p));$("#authM").hidden=true;$("#ap").value="";authUI();await boot();openAdmin()}catch(x){toast(x.message)}};

/* ===== Panel del dueño ===== */
const LOOKS=[["photo","Foto cargada"],["transp","Transparente"],["custom","Color liso a elección"]];
const opts=(a,s)=>a.map(([v,l])=>`<option value="${esc(v)}"${v==s?" selected":""}>${esc(l)}</option>`).join("");
let aTab="prod",editId=null;
function fillCats(){const c=DB.d.cats;if(catF!=="all"&&!c.some(x=>x.n===catF))catF="all";$("#catSel").innerHTML=opts([["all","Todas"],...c.map(x=>[x.n,x.n])],catF);$("#catSel").parentElement.hidden=c.length<2}
function refresh(){if(applied&&!byId(applied)){applied=null;gsap.set("#pcase",{opacity:0})}fillCats();buildRunway();paint();render()}
$("#catSel").addEventListener("change",e=>{catF=e.target.value;sel=null;buildRunway();render()});
function openAdmin(){$("#admin").hidden=false;$("#aMail").textContent=Auth.user();gsap.fromTo("#admin .box",{y:40,opacity:0},{y:0,opacity:1,duration:.45,ease:"power3.out"});drawAdmin()}
function drawAdmin(){
 document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("on",b.dataset.tab===aTab));
 const d=DB.d,b=$("#aBody");
 if(!myStore){b.innerHTML=`<form id="sf"><h3>Creá tu tienda</h3><label class="f">Nombre de la tienda<input name="name" required></label><p class="note">Se crea con las fundas de ejemplo y los modelos iPhone 13 a 16 Pro. Después las editás o las borrás.</p><button class="btn">Crear mi tienda</button></form>`;return}
 if(aTab==="prod"){
  const e=d.products.find(p=>p.id===editId)||{name:"",price:"",code:"",cat:d.cats[0]?.n,look:"custom",color:"#ff5a4e",m:[0,CFG.models.length-1]};
  const mo=CFG.models.map((m,i)=>[i,m]);
  b.innerHTML=`<form id="pf"><h3>${editId?"Editar producto":"Nuevo producto"}</h3>
  <label class="f">Nombre<input name="name" value="${esc(e.name)}" required></label>
  <div class="grid2"><label class="f">Precio<input name="price" type="number" min="0" value="${e.price}" required></label><label class="f">Código<input name="code" value="${esc(e.code)}"></label>
  <label class="f">Categoría<select name="cat">${opts(d.cats.map(c=>[c.n,c.n]),e.cat)}</select></label><label class="f">Diseño<select name="look">${opts(LOOKS,e.look)}</select></label></div>
  <label class="f" ${e.look==="custom"?"":"hidden"}>Color<input name="color" type="color" value="${e.color||"#ff5a4e"}"></label>
  <label class="f">Foto de la funda<input name="photo" type="file" accept="image/*"></label>
  <p class="note">Ideal: PNG o WEBP con fondo transparente. Si subís una foto con fondo blanco, se lo quitamos automáticamente.</p>
  <div class="grid2"><label class="f">Compatible desde<select name="from">${opts(mo,e.m[0])}</select></label><label class="f">Compatible hasta<select name="to">${opts(mo,e.m[1])}</select></label></div>
  <p class="note">La compatibilidad solo aplica a categorías que se prueban en el iPhone.</p>
  <button class="btn">Guardar producto</button>${editId?`<button type="button" class="btn ghost" data-act="cancel">Cancelar edición</button>`:""}</form>
  <h3>Tus productos (${d.products.length})</h3>`+d.products.map(p=>`<div class="arow"><div><div class="case s-${p.look}" style="${sty(p)}"></div><div><b>${esc(p.name)}</b><small>${esc(p.cat)} · ${money(p.price)} · ${esc(p.code)}</small></div></div><div class="btns"><button class="del" style="color:var(--mint)" data-act="edit" data-id="${p.id}">Editar</button><button class="del" data-act="del" data-id="${p.id}">Eliminar</button></div></div>`).join("");
 }else if(aTab==="cat"){
  b.innerHTML=`<form id="cf"><h3>Nueva categoría</h3><label class="f">Nombre<input name="n" required></label><label class="chk"><input type="checkbox" name="t"> Se prueba en el iPhone (como las fundas)</label><button class="btn">Crear categoría</button></form><h3>Categorías</h3>`+d.cats.map(c=>`<div class="arow"><div><div><b>${esc(c.n)}</b><small>${c.t?"Se prueba en el iPhone":"Producto común"} · ${d.products.filter(p=>p.cat===c.n).length} productos</small></div></div><button class="del" data-act="delcat" data-id="${c.id}">Eliminar</button></div>`).join("");
 }else{
  b.innerHTML=`<form id="bf"><h3>Identidad de la tienda</h3><label class="f">Nombre de la tienda<input name="brand" value="${esc(d.brand)}"></label><label class="f">Texto corto en la bolsa<input name="logo" value="${esc(d.logo)}" maxlength="14"></label><button class="btn">Guardar marca</button><p class="note">Tu tienda: /${esc(myStore.slug)}. Colores y tipografías se suman en una etapa próxima.</p></form>`;
 }
}
async function reload(){const r=await sb.from("stores").select("*").eq("id",myStore.id).single();if(r.data){myStore=r.data;await loadRow(myStore)}drawAdmin()}
/* Prepara la foto: reduce a 600px de alto, quita fondo blanco si no tiene transparencia y convierte a webp */
async function prepImage(file){
 const bmp=await createImageBitmap(file),sc=Math.min(1,600/bmp.height),w=Math.round(bmp.width*sc),h=Math.round(bmp.height*sc);
 const cv=document.createElement("canvas");cv.width=w;cv.height=h;const cx=cv.getContext("2d",{willReadFrequently:true});cx.drawImage(bmp,0,0,w,h);
 const id=cx.getImageData(0,0,w,h),d=id.data;let solid=true;for(let i=3;i<d.length;i+=4)if(d[i]<250){solid=false;break}
 if(solid){const seen=new Uint8Array(w*h),st=[];
  const white=i=>{const r=d[i*4],g=d[i*4+1],b=d[i*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mn>=215&&mx-mn<=26};
  const push=i=>{if(!seen[i]&&white(i)){seen[i]=1;st.push(i)}};
  for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
  while(st.length){const i=st.pop(),x=i%w;d[i*4+3]=0;if(x>0)push(i-1);if(x<w-1)push(i+1);if(i>=w)push(i-w);if(i<w*(h-1))push(i+w)}
  cx.putImageData(id,0,0)}
 const blob=await new Promise(r=>cv.toBlob(r,"image/webp",.9));return{blob,w,h}}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{aTab=b.dataset.tab;editId=null;drawAdmin()});
$("#aX").onclick=()=>$("#admin").hidden=true;
$("#aOut").onclick=async()=>{await Auth.signOut();$("#admin").hidden=true;authUI();toast("Sesión cerrada");boot()};
$("#aBody").addEventListener("change",ev=>{if(ev.target.name==="look")ev.target.form.color.parentElement.hidden=ev.target.value!=="custom"});
async function saveForm(form,f){
 const d=DB.d;
 if(form.id==="sf"){const name=f.get("name").trim(),r=await sb.rpc("create_store",{p_name:name,p_slug:slugify(name)});
  if(r.error)throw Error(r.error.code==="23505"?"Ese nombre ya existe, probá otro":r.error.message);toast("¡Tienda creada!");await boot();drawAdmin();return}
 if(form.id==="pf"){
  const old=d.products.find(x=>x.id===editId),cat=d.cats.find(c=>c.n===f.get("cat")),fr=+f.get("from"),to=+f.get("to"),[a,z]=fr<=to?[fr,to]:[to,fr];
  const row={name:f.get("name").trim(),price:+f.get("price"),code:f.get("code").trim()||"VS-"+String(Date.now()).slice(-4),category_id:cat?cat.id:null,look:f.get("look"),compat_model_ids:MODELS.slice(a,z+1).map(m=>m.id)};
  row.color=row.look==="custom"?f.get("color"):null;
  const file=f.get("photo");
  if(file&&file.size){const im=await prepImage(file),path=`${myStore.id}/${crypto.randomUUID()}.webp`;
   const up=await sb.storage.from("product-images").upload(path,im.blob,{contentType:"image/webp"});if(up.error)throw up.error;
   row.image_url=sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;row.image_w=im.w;row.image_h=im.h;row.image_key=null;row.look="photo"}
  else if(row.look==="photo"&&!(old&&(old.img||old.url)))row.look="custom";
  const r=editId?await sb.from("products").update(row).eq("id",editId):await sb.from("products").insert({...row,store_id:myStore.id});
  if(r.error)throw r.error;editId=null;toast("Producto guardado")}
 if(form.id==="cf"){const n=f.get("n").trim();if(!n||d.cats.some(c=>c.n===n))throw Error("Poné un nombre nuevo");
  const r=await sb.from("categories").insert({store_id:myStore.id,name:n,try_on:f.get("t")==="on",sort:d.cats.length});if(r.error)throw r.error;toast("Categoría creada")}
 if(form.id==="bf"){const r=await sb.from("stores").update({name:f.get("brand").trim()||myStore.name,logo_text:f.get("logo").trim()||myStore.logo_text}).eq("id",myStore.id);if(r.error)throw r.error;toast("Marca actualizada")}
 await reload()}
$("#aBody").addEventListener("submit",async ev=>{ev.preventDefault();const form=ev.target,btn=form.querySelector("button:not([type=button])");
 if(btn)btn.disabled=true;
 try{await saveForm(form,new FormData(form))}catch(x){toast(x.message||"No se pudo guardar")}
 if(btn)btn.disabled=false});
$("#aBody").addEventListener("click",async ev=>{const b=ev.target.closest("[data-act]");if(!b)return;const d=DB.d,id=b.dataset.id,a=b.dataset.act;
 if(a==="edit"){editId=id;drawAdmin();$("#admin .box").scrollTop=0;return}
 if(a==="cancel"){editId=null;drawAdmin();return}
 if(!b.dataset.sure){b.dataset.sure=1;b.textContent="¿Seguro?";return}
 try{
  if(a==="del"){const r=await sb.from("products").delete().eq("id",id);if(r.error)throw r.error}
  if(a==="delcat"){const c=d.cats.find(x=>x.id===id);if(d.products.some(p=>p.cat===c.n))return toast("Esa categoría tiene productos");if(d.cats.length<2)return toast("Dejá al menos una categoría");
   const r=await sb.from("categories").delete().eq("id",id);if(r.error)throw r.error;if(catF===c.n)catF="all"}
  await reload()}catch(x){toast(x.message||"No se pudo eliminar")}});
applyBrand();authUI();fillCats();buildRunway();
Auth.init().then(()=>{authUI();boot()});

/* ===== Color del iPhone ===== */
const PHCOL=[["rosa","Rosa","#f3d6d4"],["rojo","Rojo","#c20f24"],["blanco","Blanco","#efeae2"],["negro","Negro","#2a2d36"],["azul","Azul","#336fa0"]];
let pcol="rosa";
(function(){const sw=$("#sw"),ph=$("#phone");
 sw.innerHTML=PHCOL.map(c=>`<button class="dot" data-c="${c[0]}" style="background:${c[2]}" role="radio" aria-label="${c[1]}" title="${c[1]}"></button>`).join("");
 const mark=()=>sw.querySelectorAll(".dot").forEach(d=>{const on=d.dataset.c===pcol;d.classList.toggle("on",on);d.setAttribute("aria-checked",on)});
 sw.addEventListener("click",e=>{const d=e.target.closest(".dot");if(!d||d.dataset.c===pcol)return;pcol=d.dataset.c;mark();render();
  gsap.to("#phone .body,#cam",{opacity:0,duration:.14,overwrite:"auto",onComplete:()=>{ph.style.setProperty("--ph","var(--ph-"+pcol+")");ph.style.setProperty("--cm","var(--cm-"+pcol+")");gsap.to("#phone .body,#cam",{opacity:1,duration:.3})}});
  gsap.fromTo("#phone",{scale:.93},{scale:1,duration:.6,ease:"back.out(2)"})});
 mark()})();

/* ===== Ambiente ===== */
if(!reduce){
 gsap.to("#phoneWrap",{y:-9,duration:2.8,yoyo:true,repeat:-1,ease:"sine.inOut"});
 gsap.to("#bag",{rotation:2,duration:3.2,yoyo:true,repeat:-1,ease:"sine.inOut"});
 for(let i=0;i<7;i++){const b=document.createElement("div"),s=40+Math.random()*90;
  b.className="bokeh";Object.assign(b.style,{width:s+"px",height:s+"px",left:Math.random()*95+"vw",top:Math.random()*80+"vh"});
  document.body.appendChild(b);
  gsap.to(b,{x:"random(-40,40)",y:"random(-50,50)",opacity:"random(.3,.9)",duration:"random(4,8)",repeat:-1,yoyo:true,ease:"sine.inOut"});}
 gsap.from(".item",{opacity:0,duration:1.2,delay:.2});
 gsap.from("#phoneWrap",{y:80,opacity:0,duration:1,ease:"power3.out"});
 gsap.from("#bag",{x:-60,opacity:0,duration:1,delay:.2,ease:"power3.out"});
}
paint();render();
}
