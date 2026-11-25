(function(){
const KEY="dividas.v1",MN=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const NOMES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
const $=id=>document.getElementById(id);
const hoje=new Date();
let S={itens:[],pago:{},renda:0,tema:"",metas:[],entradas:[],cofre:[],contas:[],rendaNome:"",cartoes:[],receber:[],categorias:["Moradia","Alimentação","Transporte","Saúde","Lazer","Educação","Cartão","Outros"]};
let ano=hoje.getFullYear(),mes=hoje.getMonth()+1,chart=null,editId=null,lixo=null,tt=0;
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
let ref=null,tmr=0,mexeu=false;
function status(t){$("st").textContent=t}
function empacotar(){return{itens:S.itens,pago:Object.keys(S.pago),renda:S.renda||0,tema:S.tema||"",metas:S.metas,entradas:S.entradas,cofre:S.cofre,contas:S.contas,rendaNome:S.rendaNome||"",cartoes:S.cartoes,receber:S.receber,categorias:S.categorias,_t:Date.now()}}
let sujo=false;
function salvar(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
 if(!ref){mexeu=true;return}clearTimeout(tmr);sujo=true;status("Salvando…");
 tmr=setTimeout(()=>{const d=empacotar();
  Promise.resolve().then(()=>ref&&ref.set(d)).then(()=>{sujo=false;try{localStorage.removeItem(KEY+".pend");localStorage.setItem(KEY+".t",String(d._t))}catch(e){}status("Salvo na sua conta")},
   ()=>{sujo=false;try{localStorage.setItem(KEY+".pend","1")}catch(e){}status("Sem conexão: salvo só neste aparelho")})},500)}
const idx=ym=>{const[a,m]=ym.split("-").map(Number);return a*12+m-1};
const ymStr=(a,m)=>a+"-"+String(m).padStart(2,"0");
function ocorre(d,i){const s=idx(d.inicio);
 if(d.tipo==="fixa")return i>=s&&(!d.fim||i<=idx(d.fim));
 if(d.tipo==="parcelada")return i>=s&&i<s+d.parcelas;
 return i===s}
const doMes=(a,m)=>S.itens.filter(d=>ocorre(d,a*12+m-1));
const chave=(d,a,m)=>d.id+"|"+ymStr(a,m);
const soma=l=>l.reduce((t,d)=>t+d.valor,0);
const rendaMes=i=>(S.renda||0)+soma(S.entradas.filter(d=>ocorre(d,i)));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const somaPago=(l,a,m)=>l.reduce((t,d)=>t+(S.pago[chave(d,a,m)]?d.valor:0),0);
function rotulo(d,a,m){
 if(d.tipo==="parcelada")return"parcela "+(a*12+m-1-idx(d.inicio)+1)+" de "+d.parcelas;
 if(d.tipo==="unica")return"única";
 return d.fim?"fixa até "+MN[+d.fim.slice(5)-1]+"/"+d.fim.slice(0,4):"fixa"}
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
const ICO={edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',del:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',banco:'<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',cofre:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',entrada:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M8 13l4 4 4-4"/>'};
function svg(k){const s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("aria-hidden","true");s.innerHTML=ICO[k]||"";return s}
function ib(k,label){const b=el("button","ib "+k);b.type="button";b.title=label;b.setAttribute("aria-label",label);b.append(svg(k));return b}
function render(){
 $("ano").textContent=ano;$("renda").value=S.renda||"";$("rnome").value=S.rendaNome||"";
 const tot=[],pg=[];
 for(let m=1;m<=12;m++){const l=doMes(ano,m);tot.push(soma(l));pg.push(somaPago(l,ano,m))}
 const T=tot.reduce((a,b)=>a+b,0),P=pg.reduce((a,b)=>a+b,0),R=S.renda||0,rm=tot.map((_,i)=>rendaMes(ano*12+i));
 const acima=tot.map((t,i)=>t-rm[i]).filter(x=>x>0&&R>0),exc=acima.reduce((a,x)=>a+x,0);
 const sum=$("sum");sum.textContent="";
 [["Total do ano",brl.format(T)],["Já pago",brl.format(P)],["Falta pagar",brl.format(T-P)],
  ["Meses acima da renda",R>0?acima.length+" (excesso "+brl.format(exc)+")":"informe a renda"]].forEach(([k,v])=>{
  const d=el("div");d.append(el("small","",k),el("b","",v));sum.append(d)});
 [T,P,T-P].forEach((n,i)=>numAnim(sum.children[i].lastChild,n,"s"+i));
 const gm=$("meses");gm.textContent="";
 tot.forEach((t,i)=>{const m=i+1,b=el("button","m"+(R>0&&t>rm[i]?" over":"")+(m===mes?" sel":""));
  b.append(el("small","",MN[i]),el("b","",brl.format(t)));
  if(t>0){const p=el("i");p.style.width=Math.min(100,pg[i]/t*100)+"%";b.append(p)}
  b.onclick=()=>{mes=m;render()};gm.append(b)});
 tilesFx(gm);detalhe(tot[mes-1],rm[mes-1]);grafico(tot,rm);metas(R);cofre();cartoes();receber();if(tab==="rel")relatorios();alertaRec();if(window.obsLista)window.obsLista();
}
function detalhe(t,R){
 $("mt").textContent=NOMES[mes-1]+" de "+ano;
 const L=$("lista");L.textContent="";const l=doMes(ano,mes);
 if(!l.length)L.append(el("div","vazio","Nenhuma dívida neste mês. Use “Nova dívida” para começar."));
 l.forEach(d=>{const p=!!S.pago[chave(d,ano,mes)];
  const r=el("div","row"+(p?" pago":"")),lb=el("label"),cb=document.createElement("input");
  cb.type="checkbox";cb.checked=p;cb.dataset.k=chave(d,ano,mes);cb.setAttribute("aria-label","Marcar como pago");
  const w=el("span");w.style.minWidth="0";w.append(el("div","nm",d.nome),el("small","",rotulo(d,ano,mes)+(d.cat?" · "+d.cat:"")+(d.cartao?" · cartão "+nomeCartao(d.cartao):"")));
  lb.append(cb,w);
  const v=el("span","v",brl.format(d.valor)),e=ib("edit","Editar dívida"),x=ib("del","Excluir dívida");
  e.dataset.e=d.id;x.dataset.x=d.id;r.append(lb,v,e,x);L.append(r)});
 const en=[];if(S.renda)en.push([S.rendaNome||"Renda mensal",S.renda,"renda mensal"]);
 S.entradas.filter(d=>ocorre(d,ano*12+mes-1)).forEach(d=>en.push([d.nome,d.valor,d.tipo==="unica"?"entrada extra":"entrada mensal"]));
 if(en.length){L.append(sub("Entradas do mês"));en.forEach(([n,v,k])=>{const r=el("div","row"),w=el("span");w.style.flex="1";w.append(el("div","nm",n),el("small","",k));r.append(w,el("span","v pos","+"+brl.format(v)));L.append(r)})}
 const pg=somaPago(l,ano,mes),f=$("tot");f.textContent="";
 const add=(k,v,c)=>{const s=el("span","",k+" ");s.append(el("b",c||"",v));f.append(s)};
 if(R>0)add("Entradas",brl.format(R));add("Total",brl.format(t));add("Pago",brl.format(pg));add("Falta pagar",brl.format(t-pg));
 if(R>0)add(R>=t?"Sobra da renda":"Excede a renda",brl.format(Math.abs(R-t)),R>=t?"pos":"neg");
 if(R>0){const ym=ymStr(ano,mes),gd=S.cofre.find(x=>x.auto===ym);
  if(gd){const b=el("button","","Desfazer recebimento no banco ("+brl.format(gd.valor)+")");b.dataset.cu=gd.id;f.append(b)}
  else if(R>t){const b=el("button","pri","Receber "+brl.format(R-t)+" no banco");b.dataset.cg=ym;f.append(b)}}
}
function cor(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
function grafico(tot,R){
 if(typeof Chart==="undefined")return;
 const ds=[{type:"bar",label:"Dívidas do mês",data:tot,backgroundColor:tot.map((t,i)=>R[i]>0&&t>R[i]?cor("--bad"):cor("--ac")),borderRadius:4}];
 if(R.some(x=>x>0))ds.push({type:"line",label:"Entradas",data:R,borderColor:cor("--ok"),borderDash:[6,4],pointRadius:0,borderWidth:2});
 const tc=cor("--mu"),gc=cor("--ln");
 if(chart){chart.data.datasets=ds;chart.options.scales.x.ticks.color=tc;chart.options.scales.y.ticks.color=tc;chart.options.scales.y.grid.color=gc;chart.options.plugins.legend.labels.color=tc;chart.update();return}
 chart=new Chart($("cv"),{data:{labels:MN,datasets:ds},options:{responsive:true,maintainAspectRatio:false,
  plugins:{legend:{labels:{color:tc}},tooltip:{callbacks:{label:c=>c.dataset.label+": "+brl.format(c.parsed.y)}}},
  scales:{x:{ticks:{color:tc},grid:{display:false}},y:{beginAtZero:true,ticks:{color:tc,callback:v=>brl.format(v)},grid:{color:gc}}}}});
}
function toast(msg,undo){$("tm").textContent=msg;$("un").style.display=undo?"":"none";$("toast").style.display="flex";clearTimeout(tt);tt=setTimeout(()=>{$("toast").style.display="none";lixo=null},6000)}
$("lista").addEventListener("change",e=>{const k=e.target.dataset.k;if(!k)return;if(e.target.checked)S.pago[k]=1;else delete S.pago[k];salvar();render()});
$("lista").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.e)abrir(b.dataset.e);
 if(b.dataset.x){const i=S.itens.findIndex(d=>d.id===b.dataset.x);lixo={d:S.itens[i],i};S.itens.splice(i,1);salvar();render();toast("Dívida excluída.",true)}});
$("un").onclick=()=>{if(lixo){S.itens.splice(lixo.i,0,lixo.d);lixo=null;salvar();render();$("toast").style.display="none"}};
const ymI=i=>ymStr(Math.floor(i/12),i%12+1);
const fmtYM=s=>MN[+s.slice(5)-1]+"/"+s.slice(0,4);
function resumo(){const t=$("ft").value,r=$("rs"),i=$("fi").value,f=$("ff").value,n=parseInt($("fp").value),v=parseFloat($("fv").value);
 r.hidden=!(t==="parcelada"&&i&&f&&n>0);if(r.hidden)return;
 r.textContent=n+(n===1?" parcela":" parcelas")+(v>0?" de "+brl.format(v)+" · total "+brl.format(v*n):"")+" (de "+fmtYM(i)+" até "+fmtYM(f)+")"}
function valida(){const t=$("ft").value,i=$("fi").value,f=$("ff").value;
 $("ff").required=t==="parcelada";
 $("ff").setCustomValidity(t!=="unica"&&i&&f&&idx(f)<idx(i)?"O mês final não pode ser antes do início.":"");resumo()}
function deFim(){const i=$("fi").value,f=$("ff").value;if($("ft").value==="parcelada"&&i&&f&&idx(f)>=idx(i))$("fp").value=idx(f)-idx(i)+1;valida()}
function dePar(){const i=$("fi").value,n=parseInt($("fp").value);if($("ft").value==="parcelada"&&i&&n>0)$("ff").value=ymI(idx(i)+n-1);valida()}
function tipoUI(){const t=$("ft").value;$("wp").hidden=t!=="parcelada";$("wf").hidden=t==="unica";
 $("lf").textContent=t==="fixa"?"Termina em (opcional)":"Termina em";
 $("li").textContent=t==="unica"?"Mês da dívida":"Começa em";if(t==="parcelada")dePar();valida()}
$("ft").onchange=tipoUI;
$("fi").onchange=()=>{if($("ft").value==="parcelada"&&!$("ff").value)dePar();else deFim()};
$("ff").onchange=deFim;$("fp").oninput=dePar;$("fv").oninput=resumo;
function abrir(id){editId=id||null;const d=id?S.itens.find(x=>x.id===id):null;
 $("dt").textContent=d?"Editar dívida":"Nova dívida";$("mais").hidden=!!d;$("ok").hidden=true;$("ok").style.color="var(--ok)";
 $("fn").value=d?d.nome:"";$("fv").value=d?d.valor:"";$("ft").value=d?d.tipo:"fixa";
 $("fi").value=d?d.inicio:ymStr(ano,mes);$("fp").value=d&&d.parcelas?d.parcelas:2;$("ff").value=d&&d.fim?d.fim:"";
 optsDivida(d&&d.cat,d&&d.cartao);tipoUI();$("dlg").showModal()}
$("novo").onclick=()=>abrir();$("cx").onclick=()=>$("dlg").close();
function gravar(){const t=$("ft").value,o={id:editId||Date.now().toString(36)+Math.random().toString(36).slice(2,6),
 nome:$("fn").value.trim(),valor:Math.round(parseFloat($("fv").value)*100)/100,tipo:t,inicio:$("fi").value,cat:$("fcat").value,cartao:$("fcar").value};
 if(t==="parcelada")o.parcelas=Math.max(1,idx($("ff").value)-idx(o.inicio)+1);
 if(t==="fixa"&&$("ff").value&&idx($("ff").value)>=idx(o.inicio))o.fim=$("ff").value;
 if(editId){const i=S.itens.findIndex(d=>d.id===editId);S.itens[i]=o}else S.itens.push(o);
 const[a,m]=o.inicio.split("-").map(Number);ano=a;mes=m;salvar();render();return o}
$("fm").onsubmit=e=>{e.preventDefault();try{gravar();$("dlg").close()}catch(err){$("ok").style.color="var(--bad)";$("ok").textContent="Não foi possível salvar: "+err.message;$("ok").hidden=false}};
$("mais").onclick=()=>{if(!$("fm").reportValidity())return;
 try{const o=gravar();editId=null;$("dt").textContent="Nova dívida";$("ok").style.color="var(--ok)";$("ok").textContent="Adicionada: "+o.nome+". Pode lançar a próxima.";$("ok").hidden=false;
  $("fn").value="";$("fv").value="";$("rs").hidden=true;$("fn").focus()}catch(e){$("ok").textContent="Não foi possível adicionar. Confira os campos.";$("ok").hidden=false}};
$("ant").onclick=()=>{ano--;render()};$("prox").onclick=()=>{ano++;render()};
$("renda").oninput=e=>{S.renda=parseFloat(e.target.value)||0;salvar();render()};
$("rnome").oninput=e=>{S.rendaNome=e.target.value;salvar();render()};
$("tema").onclick=()=>{const esc=document.documentElement.dataset.theme==="dark"||(!document.documentElement.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
 S.tema=esc?"light":"dark";document.documentElement.dataset.theme=S.tema;salvar();render()};
if(S.tema)document.documentElement.dataset.theme=S.tema;
// metas: simula em qual mês começar a pagar uma compra
const totIdx=i=>soma(S.itens.filter(d=>ocorre(d,i)));
function nper(pv,pmt,j){if(pv<=0)return 0;if(!j)return Math.ceil(pv/pmt-1e-9);if(pmt<=pv*j)return Infinity;return Math.ceil(-Math.log(1-pv*j/pmt)/Math.log(1+j)-1e-9)}
function simular(g){const n=nper(g.total-(g.entrada||0),g.parcela,(g.juros||0)/100),R=S.renda||0,h0=hoje.getFullYear()*12+hoje.getMonth(),L=[];
 if(!isFinite(n)||n<1)return{n,L};
 const T=[];for(let i=0;i<48+n;i++)T[i]=rendaMes(h0+i)-totIdx(h0+i);
 for(let s=0;s<48;s++){let pior=Infinity;for(let k=s;k<s+n;k++)pior=Math.min(pior,T[k]);
  const sobra=pior-g.parcela;L.push({i:h0+s,sobra,st:sobra>=folgaDe(g)?"ok":sobra>=0?"aperto":"nao"})}
 return{n,L,best:L.find(x=>x.st==="ok")||L.find(x=>x.st==="aperto")}}
function metas(R){const box=$("lm");box.textContent="";
 if(!S.metas.length){box.append(el("div","vazio","Nenhuma meta ainda. Ex.: uma moto de R$ 20.000 pagando R$ 500 por mês."));return}
 S.metas.forEach(g=>{if(g.modo==="avista"){box.append(cardVista(g,R));return}const r=simular(g),c=el("div","meta");
  c.append(el("b","",g.nome),el("div","",brl.format(g.total)+(g.entrada?" · entrada "+brl.format(g.entrada):"")+" · "+(isFinite(r.n)?r.n+" × "+brl.format(g.parcela):"parcela menor que os juros")+(g.juros?" · "+g.juros+"% a.m.":"")));
  const m=el("div","res");
  if(!R)m.textContent="Informe a renda mensal lá em cima para descobrir o melhor mês.";
  else if(!isFinite(r.n))m.textContent="Aumente a parcela: ela não cobre os juros do mês.";
  else if(!r.best)m.textContent="Nos próximos 4 anos nenhum mês comporta essa parcela junto com as dívidas atuais.";
  else m.append(document.createTextNode(r.best.st==="ok"?"Melhor mês para começar: ":"Primeiro mês possível (apertado): "),el("b","",fmtYM(ymI(r.best.i))),document.createTextNode(" · termina em "+fmtYM(ymI(r.best.i+r.n-1))+" · sobra mínima "+brl.format(r.best.sobra)));
  c.append(m);
  if(R&&r.L.length){const dt=document.createElement("details"),tb=el("div","mm");dt.append(el("summary","","Ver os próximos meses"));
   r.L.slice(0,12).forEach(x=>tb.append(el("span","ch "+x.st,fmtYM(ymI(x.i))+" · sobra "+brl.format(x.sobra))));
   dt.append(tb,el("small","","Sobra no mês mais pesado se você começar naquele mês. Verde: cabe com a folga. Amarelo: apertado. Vermelho: não cabe."));c.append(dt)}
  const ac=el("div","acts");
  if(R&&r.best){const lb=el("button","pri","Lançar em "+fmtYM(ymI(r.best.i)));lb.dataset.l=g.id;ac.append(lb)}
  const e=el("button","","Editar"),x=el("button","","Excluir");e.dataset.me=g.id;x.dataset.mx=g.id;ac.append(e,x);c.append(ac);box.append(c)})}
// meta à vista: o mês em que a sobra livre do próprio mês paga a compra
function folgaDe(g){return g.folga!=null?g.folga:(g.margem||0)*(S.renda||0)/100}
function simularVista(g){const h0=hoje.getFullYear()*12+hoje.getMonth(),f=folgaDe(g),L=[];
 for(let s=0;s<36;s++){const i=h0+s,livre=rendaMes(i)-totIdx(i)-f;L.push({i,livre,st:livre>=g.total?"ok":"nao"})}
 return{L,best:L.find(x=>x.st==="ok")}}
function fundos(g){const o={bancos:[],fluxo:[],juntar:[]};
 S.contas.forEach(c=>{const s=saldoDe(c.id);if(s<=0.001)return;(c.tipo==="banco"?o.bancos:c.fluxo?o.fluxo:o.juntar).push({nome:c.nome,s,cobre:s>=g.total})});
 o.soma=o.bancos.reduce((a,x)=>a+x.s,0);return o}
function cardVista(g,R){const r=simularVista(g),f=fundos(g),c=el("div","meta"),txt=t=>document.createTextNode(t);
 c.append(el("b","",g.nome+" · à vista"),el("div","",brl.format(g.total)+(folgaDe(g)?" · folga mínima de "+brl.format(folgaDe(g))+" no mês":"")));
 const cob=f.bancos.filter(x=>x.cobre).concat(f.fluxo.filter(x=>x.cobre)),soma=f.bancos.length>1&&f.soma>=g.total&&!f.bancos.some(x=>x.cobre);
 if(cob.length||soma){const a=el("div","al");a.append(el("b","","Alerta: você já tem esse dinheiro disponível. "),txt(cob.length?"Cobre a compra: "+cob.map(x=>x.nome+" ("+brl.format(x.s)+")").join(", ")+".":"Somando os bancos você tem "+brl.format(f.soma)+"."));c.append(a)}
 const m=el("div","res");
 if(!R&&!S.entradas.length)m.textContent="Informe a renda mensal para descobrir o melhor mês.";
 else if(!r.best)m.textContent="Nos próximos 3 anos nenhum mês tem sobra livre para pagar "+brl.format(g.total)+" (sobra do mês menos a folga).";
 else m.append(txt("Melhor mês de compra: "),el("b","",fmtYM(ymI(r.best.i))),txt(" · sobra livre naquele mês: "+brl.format(r.best.livre)));
 c.append(m);
 const ln=t=>{const d=el("small","",t);d.style.display="block";c.append(d)};
 f.bancos.forEach(x=>ln("Banco "+x.nome+": "+brl.format(x.s)+(x.cobre?" · cobre a compra":" · não cobre sozinho")));
 f.fluxo.forEach(x=>ln("Cofrinho de fluxo "+x.nome+": "+brl.format(x.s)+(x.cobre?" · pode ser usado":" · não cobre")));
 f.juntar.filter(x=>x.cobre).forEach(x=>ln("O cofrinho "+x.nome+" tem "+brl.format(x.s)+", mas é só para juntar dinheiro: não é recomendado usar nesta compra."));
 if((R||S.entradas.length)&&r.L.length){const dt=document.createElement("details"),tb=el("div","mm");dt.append(el("summary","","Ver os próximos meses"));
  r.L.slice(0,12).forEach(x=>tb.append(el("span","ch "+x.st,fmtYM(ymI(x.i))+" · livre "+brl.format(x.livre))));
  dt.append(tb,el("small","","Livre = renda e entradas do mês, menos as dívidas, menos a folga. Verde: paga a compra. Vermelho: não paga."));c.append(dt)}
 const ac=el("div","acts"),e=el("button","","Editar"),x=el("button","","Excluir");e.dataset.me=g.id;x.dataset.mx=g.id;ac.append(e,x);c.append(ac);return c}
let metaId=null;
function gmUI(){const a=$("gm").value==="avista";$("gwp").hidden=a;$("gwj").hidden=a;$("gwe").hidden=a;$("gp").required=!a}
$("gm").onchange=gmUI;
function abrirMeta(id){metaId=id||null;const g=id?S.metas.find(x=>x.id===id):null;$("gerr").hidden=true;
 $("gdt").textContent=g?"Editar meta":"Nova meta";
 $("gn").value=g?g.nome:"";$("gt").value=g?g.total:"";$("ge").value=g&&g.entrada?g.entrada:"";$("gp").value=g&&g.parcela?g.parcela:"";$("gj").value=g&&g.juros?g.juros:"";$("gg").value=g?Math.round(folgaDe(g)*100)/100:0;$("gm").value=g&&g.modo?g.modo:"parc";gmUI();$("dg").showModal()}
$("nmeta").onclick=()=>abrirMeta();$("gcx").onclick=()=>$("dg").close();
$("fg").onsubmit=e=>{e.preventDefault();
 const g={id:metaId||Date.now().toString(36)+Math.random().toString(36).slice(2,6),nome:$("gn").value.trim(),total:parseFloat($("gt").value),entrada:$("gm").value==="avista"?0:parseFloat($("ge").value)||0,modo:$("gm").value,parcela:$("gm").value==="avista"?0:parseFloat($("gp").value),juros:$("gm").value==="avista"?0:parseFloat($("gj").value)||0,folga:parseFloat($("gg").value)||0};
 if(g.entrada>=g.total){$("gerr").textContent="A entrada precisa ser menor que o valor total.";$("gerr").hidden=false;return}
 if(metaId){const i=S.metas.findIndex(x=>x.id===metaId);S.metas[i]=g}else S.metas.push(g);
 $("dg").close();salvar();render()};
$("lm").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.me)abrirMeta(b.dataset.me);
 if(b.dataset.mx){S.metas=S.metas.filter(x=>x.id!==b.dataset.mx);salvar();render()}
 if(b.dataset.l){const g=S.metas.find(x=>x.id===b.dataset.l),r=g&&simular(g);if(!r||!r.best)return;
  S.itens.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),nome:g.nome,valor:g.parcela,tipo:"parcelada",inicio:ymI(r.best.i),parcelas:r.n});
  S.metas=S.metas.filter(x=>x.id!==g.id);ano=Math.floor(r.best.i/12);mes=r.best.i%12+1;salvar();render();toast("Lançada como dívida parcelada em "+fmtYM(ymI(r.best.i))+".",false)}});
// entradas extras, bancos e cofrinhos
const BANCO="banco";
const saldoDe=id=>S.cofre.filter(x=>x.conta===id).reduce((a,x)=>a+x.valor,0);
const nomeConta=id=>(S.contas.find(c=>c.id===id)||{nome:id===BANCO?"Banco":"Conta excluída"}).nome;
const bancos=()=>S.contas.filter(c=>c.tipo==="banco");
function migrar(){S.contas=S.contas||[];S.cofre=S.cofre||[];
 S.contas.forEach(c=>{if(!c.tipo){c.tipo="cofrinho";c.fluxo=false}});
 const sem=S.cofre.filter(x=>!x.conta);
 if(sem.length){let c=S.contas.find(x=>x.tipo==="cofrinho");if(!c){c={id:uid(),nome:"Principal",tipo:"cofrinho",fluxo:false};S.contas.push(c)}sem.forEach(x=>{x.conta=c.id})}
 if(!bancos().length)S.contas.unshift({id:BANCO,nome:"Banco",tipo:"banco"})}
function sub(t){const h=el("small","",t);h.style.cssText="display:block;margin:14px 0 4px";return h}
function fillSel(s,sel){s.textContent="";S.contas.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=(c.tipo==="banco"?"Banco · ":"Cofrinho · ")+c.nome;s.append(o)});if(sel)s.value=sel}
function tipoConta(c){return c.tipo==="banco"?"banco":c.fluxo?"cofrinho de fluxo (pode usar em compras)":"cofrinho só para juntar"}
let movTodos=false;
function linha(o){const r=el("div","it"+(o.ico?" hasic":""));
 if(o.ico){const i=el("span","ico");i.append(svg(o.ico));r.append(i)}
 r.append(el("div","t",o.nome),el("div","v"+(o.cls?" "+o.cls:""),o.valor),el("small","s",o.sub||""));
 if(o.acoes&&o.acoes.length){const a=el("div","a");o.acoes.forEach(x=>a.append(x));r.append(a)}
 return r}
function grupo(box,t,n){const h=el("div","grp");h.append(el("span","",t));if(n!=null)h.append(el("small","",String(n)));box.append(h)}
function cofre(){const h0=hoje.getFullYear()*12+hoje.getMonth(),box=$("cs");box.textContent="";
 let proj=0;for(let m=1;m<=12;m++){const i=ano*12+m-1;if(i<h0||S.cofre.some(x=>x.auto===ymStr(ano,m)))continue;proj+=Math.max(0,rendaMes(i)-totIdx(i))}
 const sb=bancos().reduce((a,c)=>a+saldoDe(c.id),0),sc=S.contas.filter(c=>c.tipo!=="banco").reduce((a,c)=>a+saldoDe(c.id),0);
 [["Disponível nos bancos",brl.format(sb),"hero"],["Nos cofrinhos",brl.format(sc)],["Bancos em dez/"+ano+", recebendo toda a sobra",brl.format(sb+proj)]].forEach(([k,v,c])=>{const d=el("div",c||"");d.append(el("small","",k),el("b","",v));box.append(d)});
 // bancos e cofrinhos
 const A=$("lca");A.textContent="";
 const bs=S.contas.filter(c=>c.tipo==="banco"),cs=S.contas.filter(c=>c.tipo!=="banco");
 const conta=c=>{const e=ib("edit","Editar "+c.nome),x=ib("del","Excluir "+c.nome);e.dataset.ke=c.id;x.dataset.kx=c.id;
  return linha({ico:c.tipo==="banco"?"banco":"cofre",nome:c.nome,valor:brl.format(saldoDe(c.id)),sub:c.tipo==="banco"?"Dinheiro disponível":c.fluxo?"Pode usar em compras":"Só para juntar",acoes:[e,x]})};
 grupo(A,"Bancos",bs.length);bs.forEach(c=>A.append(conta(c)));
 grupo(A,"Cofrinhos",cs.length);
 if(!cs.length)A.append(el("div","vazio","Nenhum cofrinho ainda. Use “Novo cofrinho” para separar dinheiro de uma meta."));
 cs.forEach(c=>A.append(conta(c)));
 // movimentos, agrupados por mês
 const M=$("lcm");M.textContent="";
 const mv=S.cofre.slice().sort((a,b)=>b.ym.localeCompare(a.ym)),vis=movTodos?mv:mv.slice(0,12);
 if(!mv.length)M.append(el("div","vazio","Nada ainda. Abra um mês e use “Receber … no banco”, ou o botão Depositar."));
 let ult="";
 vis.forEach(x=>{if(x.ym!==ult){ult=x.ym;grupo(M,fmtYM(x.ym))}
  const b=ib("del","Excluir movimento");b.dataset.cd=x.id;
  M.append(linha({nome:x.nota||(x.valor>0?"Depósito":"Retirada"),valor:(x.valor>0?"+":"")+brl.format(x.valor),cls:x.valor<0?"neg":"pos",sub:nomeConta(x.conta),acoes:[b]}))});
 if(mv.length>vis.length){const b=el("button","mini mais","Mostrar todos ("+mv.length+")");b.dataset.mt="1";M.append(b)}
 // entradas extras
 const E=$("lce");E.textContent="";
 if(!S.entradas.length)E.append(el("div","vazio","Nenhuma. Use para 13º, bônus, vendas ou um período em que você recebe mais."));
 S.entradas.forEach(x=>{const e=ib("edit","Editar "+x.nome),b=ib("del","Excluir "+x.nome);e.dataset.ee=x.id;b.dataset.ex=x.id;
  E.append(linha({ico:"entrada",nome:x.nome,valor:"+"+brl.format(x.valor),cls:"pos",sub:x.tipo==="unica"?fmtYM(x.inicio):"Todo mês desde "+fmtYM(x.inicio)+(x.fim?" até "+fmtYM(x.fim):""),acoes:[e,b]}))})}
function removerMov(id){const x=S.cofre.find(m=>m.id===id);if(!x)return;const antes=S.cofre;
 S.cofre=antes.filter(m=>m.id!==id&&!(x.par&&m.par===x.par));
 if(S.contas.some(c=>saldoDe(c.id)<-0.001)){S.cofre=antes;toast("Não dá para excluir: algum saldo ficaria negativo.",false);return}
 salvar();render()}
// entradas
let entId=null;
function entUI(){$("ewf").hidden=$("et").value!=="fixa";$("eli").textContent=$("et").value==="unica"?"Mês da entrada":"Começa em"}
function abrirEnt(id){entId=id||null;const x=id?S.entradas.find(e=>e.id===id):null;$("edt").textContent=x?"Editar entrada":"Nova entrada";
 $("en").value=x?x.nome:"";$("ev").value=x?x.valor:"";$("et").value=x?x.tipo:"unica";$("ei").value=x?x.inicio:ymStr(ano,mes);$("ef").value=x&&x.fim?x.fim:"";entUI();$("de").showModal()}
$("et").onchange=entUI;$("nent").onclick=()=>abrirEnt();$("ecx").onclick=()=>$("de").close();
$("fe").onsubmit=e=>{e.preventDefault();const t=$("et").value,o={id:entId||uid(),nome:$("en").value.trim(),valor:Math.round(parseFloat($("ev").value)*100)/100,tipo:t,inicio:$("ei").value};
 if(t==="fixa"&&$("ef").value&&idx($("ef").value)>=idx(o.inicio))o.fim=$("ef").value;
 if(entId){const i=S.entradas.findIndex(x=>x.id===entId);S.entradas[i]=o}else S.entradas.push(o);
 $("de").close();salvar();render()};
// contas (bancos e cofrinhos)
let kid=null;
function kUI(){$("kwu").hidden=$("kt").value!=="cofrinho"}
function abrirK(id,tipo){kid=id||null;const c=id?S.contas.find(x=>x.id===id):null;$("kdt").textContent=c?"Editar conta":(tipo==="banco"?"Novo banco":"Novo cofrinho");
 $("kn").value=c?c.nome:"";$("kt").value=c?c.tipo:(tipo||"cofrinho");$("kt").disabled=!!c;$("ku").value=c&&c.fluxo?"fluxo":"juntar";kUI();$("dk").showModal()}
$("kt").onchange=kUI;$("nk").onclick=()=>abrirK(null,"cofrinho");$("nb").onclick=()=>abrirK(null,"banco");$("kcx").onclick=()=>$("dk").close();
$("fk").onsubmit=e=>{e.preventDefault();const t=$("kt").value,o={nome:$("kn").value.trim(),tipo:t,fluxo:t==="cofrinho"&&$("ku").value==="fluxo"};
 if(kid)Object.assign(S.contas.find(x=>x.id===kid),o);else S.contas.push(Object.assign({id:uid()},o));$("dk").close();salvar();render()};
// movimentos: depósito, retirada e transferência
let autoYm=null;
function movUI(){const t=$("mtp").value;$("mwp").hidden=t!=="trf";$("mcl").textContent=t==="trf"?"De":"Conta";$("cdt").textContent=t==="dep"?"Depositar":t==="ret"?"Retirar":"Transferir"}
function abrirMov(t){autoYm=null;$("mtp").value=t;const a=(bancos()[0]||S.contas[0]).id;fillSel($("mco"),a);fillSel($("mpa"),(S.contas.find(c=>c.id!==a)||S.contas[0]).id);movUI();$("mval").value="";$("cn").value="";$("ci").value=ymStr(hoje.getFullYear(),hoje.getMonth()+1);$("cerr").hidden=true;$("dc").showModal()}
$("mtp").onchange=movUI;
$("dep").onclick=()=>abrirMov("dep");$("ret").onclick=()=>abrirMov("ret");
$("trf").onclick=()=>{if(S.contas.length<2){toast("Crie outra conta (banco ou cofrinho) antes de transferir.",false);return}abrirMov("trf")};
$("ccx").onclick=()=>$("dc").close();
$("fmv").onsubmit=e=>{e.preventDefault();const t=$("mtp").value,c=$("mco").value,v=Math.round(parseFloat($("mval").value)*100)/100,ym=$("ci").value,nota=$("cn").value.trim(),err=m=>{$("cerr").textContent=m;$("cerr").hidden=false};
 if(t!=="dep"&&v>saldoDe(c)+0.001)return err("Saldo insuficiente em "+nomeConta(c)+" ("+brl.format(saldoDe(c))+").");
 if(t==="trf"){const p=$("mpa").value;if(p===c)return err("Escolha contas diferentes.");const par=uid();
  S.cofre.push({id:uid(),conta:c,ym,valor:-v,nota:nota||"Transferência para "+nomeConta(p),par},{id:uid(),conta:p,ym,valor:v,nota:nota||"Transferência de "+nomeConta(c),par})}
 else{const o={id:uid(),conta:c,ym,valor:t==="dep"?v:-v,nota};if(autoYm&&t==="dep")o.auto=autoYm;S.cofre.push(o)}
 autoYm=null;$("dc").close();salvar();render()};
$("lc").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.mt){movTodos=true;render();return}
 if(b.dataset.cd)return removerMov(b.dataset.cd);
 if(b.dataset.ee)return abrirEnt(b.dataset.ee);
 if(b.dataset.ke)return abrirK(b.dataset.ke);
 if(b.dataset.kx){const c=S.contas.find(x=>x.id===b.dataset.kx);
  if(Math.abs(saldoDe(c.id))>0.001){toast("Transfira o saldo dessa conta antes de excluir.",false);return}
  if(c.tipo==="banco"&&bancos().length<2){toast("Mantenha pelo menos um banco.",false);return}
  S.contas=S.contas.filter(x=>x.id!==c.id)}
 else if(b.dataset.ex)S.entradas=S.entradas.filter(x=>x.id!==b.dataset.ex);
 else return;
 salvar();render()});
$("tot").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.cg){const ym=b.dataset.cg,[a,m]=ym.split("-").map(Number),i=a*12+m-1,v=Math.round((rendaMes(i)-totIdx(i))*100)/100,nota="Sobra de "+NOMES[m-1].toLowerCase();
  if(v>0&&!S.cofre.some(x=>x.auto===ym)){const bs=bancos();
   if(bs.length===1){S.cofre.push({id:uid(),conta:bs[0].id,ym,valor:v,nota,auto:ym});salvar();render()}
   else{abrirMov("dep");$("mval").value=v;$("ci").value=ym;$("cn").value=nota;autoYm=ym}}}
 if(b.dataset.cu)removerMov(b.dataset.cu)});
// ===== cartões, a receber, categorias, relatórios, navegação e animações =====
const cl=x=>JSON.parse(JSON.stringify(x||[]));
const DIA=864e5,d0=()=>{const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())};
const pd=s=>{const[a,m,d]=s.split("-").map(Number);return new Date(a,m-1,d)};
const fmtD=s=>{const[a,m,d]=s.split("-");return d+"/"+m+"/"+a};
const iso=t=>t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");
const rs=v=>brl.format(v).replace(/\u00a0/g," ");
const anim=()=>window.gsap&&!matchMedia("(prefers-reduced-motion: reduce)").matches;
const nomeCartao=id=>(S.cartoes.find(c=>c.id===id)||{nome:"cartão excluído"}).nome;
function optsLista(sel,lista,vazio,atual){sel.textContent="";
 if(vazio!==null){const o=document.createElement("option");o.value="";o.textContent=vazio;sel.append(o)}
 lista.forEach(([v,t])=>{const o=document.createElement("option");o.value=v;o.textContent=t;sel.append(o)});
 sel.value=atual||(vazio===null&&lista[0]?lista[0][0]:"")}
function optsDivida(cat,car){optsLista($("fcat"),S.categorias.map(c=>[c,c]),"Sem categoria",cat);optsLista($("fcar"),S.cartoes.map(c=>[c.id,c.nome]),"Sem cartão",car)}
// categorias
$("ncat").onclick=()=>{$("cnm").value="";$("dcat").showModal()};$("catx").onclick=()=>$("dcat").close();
$("fcatf").onsubmit=e=>{e.preventDefault();const n=$("cnm").value.trim();if(n&&!S.categorias.includes(n))S.categorias.push(n);$("dcat").close();salvar();optsDivida(n,$("fcar").value)};
// cartões
let carId=null;
function abrirCar(id){carId=id||null;const c=id?S.cartoes.find(x=>x.id===id):null;$("crt").textContent=c?"Editar cartão":"Novo cartão";
 $("cdn").value=c?c.nome:"";$("cdl").value=c?c.limite:"";$("cdv").value=c&&c.venc?c.venc:"";$("dcard").showModal()}
$("ncar").onclick=()=>abrirCar();$("crx").onclick=()=>$("dcard").close();
$("fcard").onsubmit=e=>{e.preventDefault();const o={nome:$("cdn").value.trim(),limite:parseFloat($("cdl").value),venc:parseInt($("cdv").value)||0};
 if(carId)Object.assign(S.cartoes.find(x=>x.id===carId),o);else S.cartoes.push(Object.assign({id:uid()},o));$("dcard").close();salvar();render()};
function usoCartao(id){const h0=hoje.getFullYear()*12+hoje.getMonth();let usado=0,mes=0;const it=[];
 S.itens.filter(d=>d.cartao===id).forEach(d=>{const s=idx(d.inicio),fim=d.tipo==="parcelada"?s+d.parcelas-1:d.tipo==="unica"?s:h0;let rest=0,n=0;
  for(let i=Math.max(h0,s);i<=fim;i++){if(!ocorre(d,i))continue;if(i===h0)mes+=d.valor;if(!S.pago[d.id+"|"+ymI(i)]){rest+=d.valor;n++}}
  if(rest>0)it.push({d,rest,n});usado+=rest});
 return{usado,mes,it}}
function cartoes(){const box=$("lcar"),sm=$("csm");box.textContent="";sm.textContent="";let L=0,U=0;
 const dados=S.cartoes.map(c=>{const u=usoCartao(c.id);L+=c.limite;U+=u.usado;return{c,u}});
 [["Limite total",brl.format(L)],["Devendo nos cartões",brl.format(U)],["Disponível",brl.format(L-U)],["Cartões",String(S.cartoes.length)]].forEach(([k,v])=>{const d=el("div");d.append(el("small","",k),el("b","",v));sm.append(d)});
 if(!S.cartoes.length)box.append(el("div","vazio","Nenhum cartão cadastrado. Toque em “Novo cartão” e depois escolha o cartão ao lançar uma dívida."));
 dados.forEach(({c,u})=>{const pc=c.limite?Math.min(100,u.usado/c.limite*100):0,card=el("div","cartao"),top=el("div","ct");
  top.append(el("b","",c.nome),el("small","",c.venc?"vence dia "+c.venc:""));
  const bar=el("div","pb"),f=el("i",pc>=80?"alto":"");f.dataset.w=pc;f.style.width=pc+"%";bar.append(f);
  card.append(top,bar,el("div","cv","Devendo "+brl.format(u.usado)+" de "+brl.format(c.limite)+" · disponível "+brl.format(c.limite-u.usado)+" ("+Math.round(pc)+"% usado)"),el("small","","Neste mês: "+brl.format(u.mes)));
  if(u.it.length){const dt=document.createElement("details");dt.append(el("summary","","Ver o que está no cartão"));
   u.it.forEach(x=>{const r=el("div","row"),w=el("span");w.style.flex="1";w.append(el("div","nm",x.d.nome),el("small","",x.d.tipo==="parcelada"?x.n+(x.n===1?" parcela em aberto":" parcelas em aberto"):x.d.tipo==="fixa"?"fixa deste mês":"única"));r.append(w,el("span","v",brl.format(x.rest)));dt.append(r)});card.append(dt)}
  const ac=el("div","acts"),e=el("button","","Editar"),x=el("button","","Excluir");e.dataset.ce=c.id;x.dataset.cx=c.id;ac.append(e,x);card.append(ac);box.append(card)})}
$("lcar").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.ce)return abrirCar(b.dataset.ce);
 if(b.dataset.cx){const id=b.dataset.cx;S.cartoes=S.cartoes.filter(c=>c.id!==id);S.itens.forEach(d=>{if(d.cartao===id)d.cartao=""});salvar();render()}});
// contas a receber
let recId=null;
function recInfo(r){if(r.rec)return{t:"Recebido"+(r.rdata?" em "+fmtD(r.rdata):""),c:"ok",o:3};
 const n=Math.round((pd(r.data)-d0())/DIA);
 if(n<0)return{t:"Atrasado há "+(-n)+(n===-1?" dia":" dias"),c:"nao",o:0};
 if(n===0)return{t:"Vence hoje",c:"aperto",o:1};
 return{t:n===1?"Amanhã":"Em "+n+" dias",c:n<=7?"aperto":"",o:2}}
function abrirRec(id){recId=id||null;const r=id?S.receber.find(x=>x.id===id):null;$("rct").textContent=r?"Editar conta a receber":"Nova conta a receber";
 $("rn").value=r?r.nome:"";$("rv").value=r?r.valor:"";$("rd").value=r?r.data:iso(new Date());$("ro").value=r&&r.obs?r.obs:"";$("drec").showModal()}
$("nrec").onclick=()=>abrirRec();$("rcx").onclick=()=>$("drec").close();
$("fr").onsubmit=e=>{e.preventDefault();const o={nome:$("rn").value.trim(),valor:Math.round(parseFloat($("rv").value)*100)/100,data:$("rd").value,obs:$("ro").value.trim()};
 if(recId)Object.assign(S.receber.find(x=>x.id===recId),o);else S.receber.push(Object.assign({id:uid(),rec:false},o));$("drec").close();salvar();render()};
function receber(){const box=$("lrec"),sm=$("rsm");box.textContent="";sm.textContent="";
 const L=S.receber.map(r=>({r,i:recInfo(r)})).sort((a,b)=>a.i.o-b.i.o||a.r.data.localeCompare(b.r.data)),pend=L.filter(x=>!x.r.rec),atr=pend.filter(x=>x.i.o===0),hj=pend.filter(x=>x.i.o===1);
 [["A receber",brl.format(soma(pend.map(x=>x.r)))],["Atrasado",brl.format(soma(atr.map(x=>x.r)))+" ("+atr.length+")"],["Vencem hoje",String(hj.length)],["Já recebido",brl.format(soma(L.filter(x=>x.r.rec).map(x=>x.r)))]].forEach(([k,v])=>{const d=el("div");d.append(el("small","",k),el("b","",v));sm.append(d)});
 if(!L.length)box.append(el("div","vazio","Nenhuma conta a receber. Anote quem está te devendo e a data combinada."));
 L.forEach(({r,i})=>{const row=el("div","row"+(r.rec?" pago":"")),lb=el("label"),cb=document.createElement("input"),w=el("span");
  cb.type="checkbox";cb.checked=!!r.rec;cb.dataset.rc=r.id;cb.setAttribute("aria-label","Marcar como recebido");
  w.append(el("div","nm",r.nome),el("small","",fmtD(r.data)+(r.obs?" · "+r.obs:"")));lb.append(cb,w);
  const ch=el("span","ch "+i.c,i.t),v=el("span","v",brl.format(r.valor)),e=ib("edit","Editar conta a receber"),x=ib("del","Excluir conta a receber");e.dataset.re=r.id;x.dataset.rx=r.id;
  row.append(lb,ch,v,e,x);box.append(row)})}
$("lrec").addEventListener("change",e=>{const id=e.target.dataset.rc;if(!id)return;const r=S.receber.find(x=>x.id===id);r.rec=e.target.checked;r.rdata=r.rec?iso(new Date()):"";salvar();render()});
$("lrec").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.re)return abrirRec(b.dataset.re);
 if(b.dataset.rx){S.receber=S.receber.filter(x=>x.id!==b.dataset.rx);salvar();render()}});
function alertaRec(){const a=$("alr"),p=S.receber.filter(r=>!r.rec).map(recInfo),at=p.filter(i=>i.o===0).length,hj=p.filter(i=>i.o===1).length;
 a.hidden=!(at||hj);if(a.hidden)return;
 a.textContent=(at?at+(at===1?" conta a receber atrasada":" contas a receber atrasadas"):"")+(at&&hj?" e ":"")+(hj?hj+(hj===1?" vence hoje":" vencem hoje"):"")+". Toque para ver."}
$("alr").onclick=()=>ir("receber");
// relatórios
const CH={},PAL=["#0f6f94","#e07a1f","#2f9e6f","#8b5cf6","#d6336c","#f2b01e","#3b82f6","#64748b","#14b8a6","#a16207"];
function mk(k,id,cfg){if(typeof Chart==="undefined")return;if(CH[k]){CH[k].data=cfg.data;CH[k].options=cfg.options;CH[k].update()}else CH[k]=new Chart($(id),cfg)}
function relCalc(){const h0=hoje.getFullYear()*12+hoje.getMonth(),per=$("rper").value||"ano",cat=$("rcat").value||"";
 const idxs=per==="mes"?[ano*12+mes-1]:per==="12"?Array.from({length:12},(_,k)=>h0+k):Array.from({length:12},(_,k)=>ano*12+k);
 const rot=per==="mes"?NOMES[mes-1]+" de "+ano:per==="12"?"Próximos 12 meses":"Ano de "+ano,porCat={},dv={},meses=[];
 idxs.forEach(i=>{const m={i,tot:0,ent:rendaMes(i),rec:soma(S.receber.filter(r=>idx(r.data.slice(0,7))===i)),cat:{}};
  S.itens.forEach(d=>{if(!ocorre(d,i))return;m.tot+=d.valor;const c=d.cat||"Sem categoria";if(cat&&c!==cat)return;
   m.cat[c]=(m.cat[c]||0)+d.valor;porCat[c]=(porCat[c]||0)+d.valor;dv[d.id]=dv[d.id]||{d,t:0};dv[d.id].t+=d.valor});
  meses.push(m)});
 const total=Object.values(porCat).reduce((a,b)=>a+b,0);
 return{rot,cat,porCat,meses,total,dv:Object.values(dv),cats:Object.keys(porCat).sort((a,b)=>porCat[b]-porCat[a])}}
function relatorios(){const ps=$("rper"),pc=$("rcat");
 optsLista(ps,[["ano","Ano de "+ano],["mes",NOMES[mes-1]+" de "+ano],["12","Próximos 12 meses"]],null,ps.value||"ano");
 optsLista(pc,S.categorias.concat(["Sem categoria"]).map(c=>[c,c]),"Todas as categorias",pc.value);
 const r=relCalc(),tc=cor("--mu"),gc=cor("--ln"),n=r.meses.length||1,pior=r.meses.reduce((a,m)=>m.tot>a.tot?m:a,{tot:0,i:0});
 const sm=$("rsum");sm.textContent="";
 [["Total no período",brl.format(r.total)],["Maior categoria",r.cats[0]?r.cats[0]+" · "+brl.format(r.porCat[r.cats[0]]):"-"],["Média por mês",brl.format(r.total/n)],["Mês mais pesado",pior.tot?MN[pior.i%12]+" · "+brl.format(pior.tot):"-"]].forEach(([k,v])=>{const d=el("div");d.append(el("small","",k),el("b","",v));sm.append(d)});
 const tb=$("rtab");tb.textContent="";
 r.cats.forEach((c,i)=>{const l=el("div","rtr"),a=el("span"),dot=el("i");dot.style.background=PAL[i%PAL.length];a.append(dot,document.createTextNode(c));
  l.append(a,el("b","",brl.format(r.porCat[c])),el("small","",r.total?Math.round(r.porCat[c]/r.total*100)+"%":""));tb.append(l)});
 if(!r.cats.length)tb.append(el("div","vazio","Sem dívidas neste período."));
 const ax={x:{ticks:{color:tc},grid:{display:false}},y:{beginAtZero:true,ticks:{color:tc,callback:v=>brl.format(v)},grid:{color:gc}}},lg={labels:{color:tc,boxWidth:12}};
 mk("cat","cc",{type:"doughnut",data:{labels:r.cats,datasets:[{data:r.cats.map(c=>r.porCat[c]),backgroundColor:r.cats.map((_,i)=>PAL[i%PAL.length]),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:lg.labels},tooltip:{callbacks:{label:c=>c.label+": "+brl.format(c.parsed)}}}}});
 mk("mes","cs2",{type:"bar",data:{labels:r.meses.map(m=>MN[m.i%12]),datasets:r.cats.map((c,i)=>({label:c,data:r.meses.map(m=>m.cat[c]||0),backgroundColor:PAL[i%PAL.length],stack:"s"}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:lg,tooltip:{callbacks:{label:c=>c.dataset.label+": "+brl.format(c.parsed.y)}}},scales:Object.assign({},ax,{x:{stacked:true,ticks:{color:tc},grid:{display:false}},y:Object.assign({},ax.y,{stacked:true})})}});
 mk("flx","cf",{data:{labels:r.meses.map(m=>MN[m.i%12]),datasets:[{type:"bar",label:"Dívidas",data:r.meses.map(m=>m.tot),backgroundColor:cor("--bad"),borderRadius:4},{type:"line",label:"Entradas + a receber",data:r.meses.map(m=>m.ent+m.rec),borderColor:cor("--ok"),backgroundColor:cor("--ok"),tension:.3,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:lg},scales:ax}});
 const mx=$("rmix");mx.textContent="";mx.append(sub("Cartões"));
 if(!S.cartoes.length)mx.append(el("div","vazio","Nenhum cartão cadastrado."));
 S.cartoes.forEach(c=>{const u=usoCartao(c.id),row=el("div","row");row.append(el("span","nm",c.nome),el("span","v",brl.format(u.usado)+" de "+brl.format(c.limite)));mx.append(row)});
 mx.append(sub("Contas a receber"));const pend=S.receber.filter(x=>!x.rec),atr=pend.filter(x=>recInfo(x).o===0);
 const row=el("div","row");row.append(el("span","nm","A receber (pendente)"),el("span","v",brl.format(soma(pend))));mx.append(row);
 const r2=el("div","row");r2.append(el("span","nm","Atrasado ("+atr.length+")"),el("span","v neg",brl.format(soma(atr))));mx.append(r2)}
function txtRel(){const r=relCalc(),L=[],sec=t=>{L.push("",t.toUpperCase(),"-".repeat(t.length))},n=r.meses.length||1;
 L.push("RELATÓRIO FINANCEIRO","Período: "+r.rot+(r.cat?" | Categoria: "+r.cat:""),"Gerado em "+fmtD(iso(new Date())));
 sec("Resumo");L.push("Total de dívidas: "+rs(r.total),"Média por mês: "+rs(r.total/n));
 sec("Por categoria");r.cats.forEach(c=>L.push(c.padEnd(22)+rs(r.porCat[c]).padStart(14)+"  "+(r.total?Math.round(r.porCat[c]/r.total*100):0)+"%"));
 sec("Mês a mês (dívidas, entradas, a receber, sobra)");r.meses.forEach(m=>L.push((MN[m.i%12]+"/"+Math.floor(m.i/12)).padEnd(10)+rs(m.tot).padStart(14)+rs(m.ent).padStart(14)+rs(m.rec).padStart(14)+rs(m.ent+m.rec-m.tot).padStart(14)));
 sec("Cartões");if(!S.cartoes.length)L.push("Nenhum cartão cadastrado.");S.cartoes.forEach(c=>{const u=usoCartao(c.id);L.push(c.nome.padEnd(22)+"limite "+rs(c.limite)+" | devendo "+rs(u.usado)+" | disponível "+rs(c.limite-u.usado))});
 sec("Contas a receber");if(!S.receber.length)L.push("Nenhuma conta a receber.");S.receber.slice().sort((a,b)=>a.data.localeCompare(b.data)).forEach(x=>L.push(fmtD(x.data)+"  "+x.nome.padEnd(22)+rs(x.valor).padStart(14)+"  "+recInfo(x).t));
 sec("Dívidas do período");if(!r.dv.length)L.push("Nenhuma dívida.");r.dv.forEach(x=>L.push(x.d.nome.padEnd(24)+(x.d.cat||"-").padEnd(16)+(x.d.cartao?nomeCartao(x.d.cartao):"-").padEnd(14)+rs(x.t).padStart(14)));
 return L.join("\n")}
function pdfRel(){const J=window.jspdf;if(!J||!J.jsPDF)throw new Error("PDF indisponível");const doc=new J.jsPDF({unit:"pt",format:"a4"}),r=relCalc(),n=r.meses.length||1;let y=44;
 doc.setFontSize(18);doc.text("Relatório financeiro",40,y);doc.setFontSize(10);doc.setTextColor(90);
 doc.text("Período: "+r.rot+(r.cat?"  |  Categoria: "+r.cat:"")+"  |  Gerado em "+fmtD(iso(new Date())),40,y+16);doc.setTextColor(0);y+=34;
 const tb=(t,head,body)=>{if(!body.length)return;doc.setFontSize(12);doc.text(t,40,y+16);doc.autoTable({startY:y+22,head:[head],body,styles:{fontSize:9,cellPadding:4},headStyles:{fillColor:[15,111,148]},margin:{left:40,right:40}});y=doc.lastAutoTable.finalY+10};
 tb("Resumo",["Item","Valor"],[["Total de dívidas no período",rs(r.total)],["Média por mês",rs(r.total/n)]]);
 tb("Por categoria",["Categoria","Total","%"],r.cats.map(c=>[c,rs(r.porCat[c]),(r.total?Math.round(r.porCat[c]/r.total*100):0)+"%"]));
 tb("Mês a mês",["Mês","Dívidas","Entradas","A receber","Sobra"],r.meses.map(m=>[MN[m.i%12]+"/"+Math.floor(m.i/12),rs(m.tot),rs(m.ent),rs(m.rec),rs(m.ent+m.rec-m.tot)]));
 tb("Cartões",["Cartão","Limite","Devendo","Disponível"],S.cartoes.map(c=>{const u=usoCartao(c.id);return[c.nome,rs(c.limite),rs(u.usado),rs(c.limite-u.usado)]}));
 tb("Contas a receber",["Quem","Vencimento","Valor","Situação"],S.receber.slice().sort((a,b)=>a.data.localeCompare(b.data)).map(x=>[x.nome,fmtD(x.data),rs(x.valor),recInfo(x).t]));
 tb("Dívidas do período",["Dívida","Categoria","Cartão","Total no período"],r.dv.map(x=>[x.d.nome,x.d.cat||"-",x.d.cartao?nomeCartao(x.d.cartao):"-",rs(x.t)]));
 return doc.output("blob")}
async function baixar(nome,make,tipo){const msg=$("xmsg");let dl=null;
 try{dl=window.claude?await claude.use("downloads"):null}catch(e){}
 try{const data=make();
  if(dl){await dl.save({filename:nome,data});msg.textContent="Pronto: "+nome;return}
  if(window.claude){msg.textContent="O download não está disponível aqui. Use “Copiar texto”.";return}
  const blob=data instanceof Blob?data:new Blob([data],{type:tipo}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=nome;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);msg.textContent="Arquivo gerado: "+nome}
 catch(e){msg.textContent=e&&e.code==="declined"?"Download cancelado.":"Não foi possível gerar o arquivo ("+(e&&e.message||"erro")+")."}}
// navegação por abas
const TABS=["inicio","contas","cartoes","receber","metas","rel"],VISTO=new Set(),ULT={n:0};let tab="inicio";
function ir(t){tab=t;TABS.forEach(x=>{$("v-"+x).hidden=x!==t});
 document.querySelectorAll("#nav button").forEach(b=>{const on=b.dataset.t===t;b.classList.toggle("on",on);b.setAttribute("aria-current",on?"page":"false")});
 $("fab").hidden=t==="rel"||t==="contas";window.scrollTo(0,0);if(t==="rel")relatorios();animTab(t)}
function animTab(t){if(!anim())return;const v=$("v-"+t);
 gsap.fromTo(v.querySelectorAll(".rv"),{opacity:0,y:8},{opacity:1,y:0,duration:.4,stagger:.05,ease:"power3.out",overwrite:"auto",clearProps:"transform"});
 v.querySelectorAll(".pb i").forEach(i=>gsap.fromTo(i,{scaleX:0},{scaleX:1,duration:.9,ease:"power2.out",delay:.2}));
 if(window.ScrollTrigger)ScrollTrigger.refresh()}
function numAnim(e,n,k){const de=ULT[k]==null?0:ULT[k];ULT[k]=n;if(!anim()||de===n)return;const o={v:de},sn=gsap.utils.snap(.01);
 gsap.to(o,{v:n,duration:.9,ease:"power2.out",onUpdate:()=>{e.textContent=brl.format(sn(o.v))}})}
function tilesFx(gm){if(ULT.ano!==ano){ULT.ano=ano;if(anim())gsap.from(gm.children,{y:12,opacity:0,duration:.4,stagger:.03,ease:"power3.out",clearProps:"transform"})}
 const s=gm.querySelector(".sel");if(s&&gm.scrollWidth>gm.clientWidth+4)gm.scrollTo({left:s.offsetLeft-(gm.clientWidth-s.offsetWidth)/2,behavior:ULT.n++?"smooth":"auto"})}
function fx(){if(!window.gsap)return;if(window.ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add("(prefers-reduced-motion: no-preference)",()=>{
  const tl=gsap.timeline({defaults:{ease:"power3.out"}});
  tl.fromTo("header",{y:-60,opacity:0},{y:0,opacity:1,duration:.5},0)
   .fromTo("#v-inicio .rv",{opacity:0,y:8},{opacity:1,y:0,duration:.45,stagger:.05,clearProps:"transform"},.15)
   .fromTo("#nav button",{y:30,opacity:0},{y:0,opacity:1,stagger:.05,duration:.4},.3)
   .fromTo("#fab",{scale:.8,opacity:0},{scale:1,opacity:1,duration:.35,clearProps:"transform"},.5);
  })}
function iniciar(){
 $("nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b)ir(b.dataset.t)});
 $("fab").onclick=()=>{({inicio:()=>abrir(),contas:()=>abrirMov("dep"),cartoes:()=>abrirCar(),receber:()=>abrirRec(),metas:()=>abrirMeta()}[tab]||(()=>{}))()};
 $("rper").onchange=relatorios;$("rcat").onchange=relatorios;
 $("xpdf").onclick=()=>baixar("relatorio-financeiro.pdf",pdfRel,"application/pdf");
 $("xtxt").onclick=()=>baixar("relatorio-financeiro.txt",txtRel,"text/plain");
 $("xcp").onclick=async()=>{try{await navigator.clipboard.writeText(txtRel());$("xmsg").textContent="Relatório copiado."}catch(e){$("xmsg").textContent="Não foi possível copiar aqui."}};
 fx()}
// backup e importação (aceita também o dividas.json do programa antigo)
$("bk").onclick=()=>{$("tx").value=JSON.stringify({itens:S.itens,pago:S.pago,renda:S.renda,metas:S.metas,entradas:S.entradas,cofre:S.cofre,contas:S.contas,rendaNome:S.rendaNome||"",cartoes:S.cartoes,receber:S.receber,categorias:S.categorias},null,1);$("msg").textContent="";$("dbk").showModal()};
$("fc").onclick=()=>$("dbk").close();
$("cp").onclick=async()=>{try{await navigator.clipboard.writeText($("tx").value);$("msg").textContent="Copiado."}catch(e){$("tx").select();$("msg").textContent="Selecione e copie o texto manualmente."}};
$("fl").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$("tx").value=r.result};r.readAsText(f)};
function converter(a){return a.map(d=>{
 const o={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),nome:String(d.nome||"").trim(),valor:Number(d.valor)||0};
 if(d.tipo==="parcelada"){o.tipo="parcelada";o.inicio=ymStr(ano,d.mes_inicio);o.parcelas=d.mes_fim-d.mes_inicio+1}
 else if(d.tipo==="mensal_unica"||d.tipo==="unica"){o.tipo="unica";o.inicio=ymStr(ano,d.mes)}
 else{o.tipo="fixa";o.inicio=ymStr(ano,1)}
 return o})}
$("im").onclick=()=>{try{const j=JSON.parse($("tx").value);
 if(Array.isArray(j)){S.itens=S.itens.concat(converter(j));$("msg").textContent=j.length+" dívidas importadas para "+ano+" (fixas começam em janeiro)."}
 else if(j&&Array.isArray(j.itens)){S.itens=j.itens;S.metas=j.metas||[];S.entradas=j.entradas||[];S.cofre=j.cofre||[];S.contas=j.contas||[];S.rendaNome=j.rendaNome||"";S.cartoes=j.cartoes||[];S.receber=j.receber||[];if(j.categorias&&j.categorias.length)S.categorias=j.categorias;migrar();S.pago=j.pago||{};S.renda=j.renda||0;$("msg").textContent="Backup restaurado."}
 else throw 0;
 salvar();render()}catch(e){$("msg").textContent="Texto inválido. Cole o JSON completo."}};
// ===== nuvem: login por e-mail + salvamento automático (Firebase) =====
const NV={ok:false,user:null,doc:null,auth:null,db:null};
const copia=x=>JSON.parse(JSON.stringify(x));
const temDados=()=>!!(S.itens.length||S.entradas.length||S.receber.length||S.cartoes.length||S.metas.length||S.cofre.length||S.renda);
function aplicar(d){
 S.itens=copia(d.itens||[]);S.metas=copia(d.metas||[]);S.entradas=copia(d.entradas||[]);S.cofre=copia(d.cofre||[]);S.contas=copia(d.contas||[]);
 S.rendaNome=d.rendaNome||"";S.cartoes=copia(d.cartoes||[]);S.receber=copia(d.receber||[]);
 if(d.categorias&&d.categorias.length)S.categorias=copia(d.categorias);
 S.pago={};(d.pago||[]).forEach(k=>S.pago[k]=1);S.renda=d.renda||0;S.tema=d.tema||S.tema||"";
 migrar();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
 if(S.tema)document.documentElement.dataset.theme=S.tema;render()}
function mesclar(d){
 const L={itens:S.itens,metas:S.metas,entradas:S.entradas,cofre:S.cofre,contas:S.contas,cartoes:S.cartoes,receber:S.receber},pg=Object.assign({},S.pago),rn=S.renda,rnm=S.rendaNome,cats=S.categorias.slice();
 aplicar(d);
 Object.keys(L).forEach(k=>{const ids=new Set(S[k].map(x=>x.id));L[k].forEach(x=>{if(!ids.has(x.id))S[k].push(copia(x))})});
 Object.assign(S.pago,pg);if(!S.renda&&rn)S.renda=rn;if(!S.rendaNome&&rnm)S.rendaNome=rnm;
 cats.forEach(c=>{if(!S.categorias.includes(c))S.categorias.push(c)});
 migrar();render()}
function lerSnap(s){try{const x=s.data();return x&&x.json?JSON.parse(x.json):null}catch(e){return null}}
function ligar(doc){NV.doc=doc;ref={set:d=>doc.set({v:1,_t:d._t,json:JSON.stringify(d)})}}
const msgC=t=>{$("acm").textContent=t||""};
function erroAuth(e){const c=e&&e.code||"";
 return({"auth/invalid-email":"E-mail inválido.","auth/missing-password":"Digite a senha.","auth/weak-password":"A senha precisa ter pelo menos 6 caracteres.",
 "auth/email-already-in-use":"Este e-mail já tem conta. Toque em Entrar.","auth/invalid-credential":"E-mail ou senha incorretos.","auth/wrong-password":"E-mail ou senha incorretos.",
 "auth/user-not-found":"E-mail ou senha incorretos.","auth/too-many-requests":"Muitas tentativas. Espere alguns minutos e tente de novo.","auth/network-request-failed":"Sem conexão com a internet.",
 "auth/operation-not-allowed":"Login por e-mail não está ativado no Firebase (veja o LEIA-ME-NUVEM.md)."}[c])||("Não deu certo ("+(c||e&&e.message||"erro")+").")}
function atualizarConta(){const u=NV.user;$("conta").classList.toggle("on",!!u);
 $("acoff").hidden=NV.ok;$("acout").hidden=!NV.ok||!!u;$("acin").hidden=!NV.ok||!u;if(u)$("acem").textContent=u.email||""}
async function entrou(u){
 status("Sincronizando…");
 try{
  const doc=NV.db.collection("users").doc(u.uid),snap=await doc.get();
  const vinc=localStorage.getItem(KEY+".uid")===u.uid,pend=localStorage.getItem(KEY+".pend")==="1";
  const d=snap.exists?lerSnap(snap):null;let subir=false;
  if(!d)subir=true;
  else if(vinc&&pend)subir=true;
  else if(!vinc&&temDados()){try{localStorage.setItem(KEY+".bkp",JSON.stringify(S))}catch(e){}mesclar(d);subir=true}
  else{aplicar(d);try{localStorage.setItem(KEY+".t",String(d._t||0))}catch(e){}}
  try{localStorage.setItem(KEY+".uid",u.uid)}catch(e){}
  ligar(doc);
  if(subir)salvar();else status("Salvo na sua conta");
 }catch(e){ref=null;NV.doc=null;
  status(e&&e.code==="permission-denied"?"Conta sem permissão: confira as regras do Firestore":"Sem conexão com a conta: salvo só neste aparelho");
  if(e&&e.code==="permission-denied")msgC("O Firestore recusou o acesso. Confira as regras de segurança no LEIA-ME-NUVEM.md.")}
 atualizarConta()}
async function puxar(){
 if(!NV.doc||sujo||localStorage.getItem(KEY+".pend")==="1")return false;
 try{const s=await NV.doc.get();if(!s.exists)return false;const d=lerSnap(s),t=+localStorage.getItem(KEY+".t")||0;
  if(d&&d._t&&d._t>t){aplicar(d);try{localStorage.setItem(KEY+".t",String(d._t))}catch(e){}status("Atualizado com os dados da sua conta");return true}}catch(e){}
 return false}
async function entrarConta(criar){
 const em=$("ace").value.trim(),sn=$("acs").value;
 if(!em||!sn){msgC("Digite o e-mail e a senha.");return}
 msgC(criar?"Criando conta…":"Entrando…");
 try{if(criar)await NV.auth.createUserWithEmailAndPassword(em,sn);else await NV.auth.signInWithEmailAndPassword(em,sn);
  $("acs").value="";msgC("");$("dacc").close()}catch(e){msgC(erroAuth(e))}}
function iniciarNuvem(){
 $("conta").onclick=$("st").onclick=()=>{atualizarConta();msgC("");$("dacc").showModal()};
 $("accx").onclick=()=>$("dacc").close();
 const cfg=window.FIREBASE_CONFIG;
 NV.ok=!!(cfg&&cfg.apiKey&&cfg.projectId&&window.firebase&&firebase.initializeApp);
 if(NV.ok){try{firebase.initializeApp(cfg);NV.auth=firebase.auth();NV.db=firebase.firestore()}catch(e){NV.ok=false}}
 atualizarConta();if(!NV.ok)return;
 $("facc").onsubmit=e=>{e.preventDefault();entrarConta(false)};
 $("accr").onclick=()=>entrarConta(true);
 $("acfg").onclick=async()=>{const em=$("ace").value.trim();if(!em){msgC("Digite seu e-mail acima e toque em Esqueci a senha.");return}
  try{await NV.auth.sendPasswordResetEmail(em);msgC("Enviamos um e-mail para criar uma nova senha. Olhe também o spam.")}catch(e){msgC(erroAuth(e))}};
 $("acsync").onclick=async()=>{msgC("Atualizando…");if(sujo||localStorage.getItem(KEY+".pend")==="1"){salvar();msgC("Enviando suas alterações…");return}
  msgC(await puxar()?"Pronto: dados atualizados.":"Você já está com os dados mais recentes.")};
 $("acsair").onclick=async()=>{
  if(sujo||localStorage.getItem(KEY+".pend")==="1"){msgC("Ainda há alterações sem enviar. Conecte-se à internet e espere \"Salvo na sua conta\" antes de sair.");return}
  if(!confirm("Sair da conta? Os dados serão apagados deste aparelho (continuam salvos na sua conta)."))return;
  try{await NV.auth.signOut()}catch(e){}
  ["",".uid",".t",".pend",".bkp"].forEach(s=>{try{localStorage.removeItem(KEY+s)}catch(e){}});location.reload()};
 NV.auth.onAuthStateChanged(u=>{NV.user=u;
  if(u)entrou(u);else{ref=null;NV.doc=null;status("Salvo só neste aparelho");atualizarConta()}});
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")puxar()});
 window.addEventListener("online",()=>{if(ref&&localStorage.getItem(KEY+".pend")==="1")salvar()})}
// teclado do celular: mantém a janela visível e rola até o campo
if(window.visualViewport){const vv=visualViewport,r=document.documentElement;
 const f=()=>{r.style.setProperty("--vvh",vv.height+"px");r.style.setProperty("--vvt",vv.offsetTop+"px");r.classList.toggle("kb",window.innerHeight-vv.height>120)};
 vv.addEventListener("resize",f);vv.addEventListener("scroll",f);f()}
document.addEventListener("focusin",e=>{const t=e.target;if(t&&t.closest&&t.closest("dialog")&&/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))setTimeout(()=>{try{t.scrollIntoView({block:"center",behavior:"smooth"})}catch(_){}},350)});
migrar();render();iniciar();iniciarNuvem();
// dados privados por pessoa: cada visitante grava só na própria área
(async()=>{try{
 status("Salvo só neste navegador");
 if(!window.claude)return;
 const [u,db]=await Promise.all([claude.use("user"),claude.use("db")]);
 if(!u||!db)return;
 const id=await u.id();if(!id)return;
 const r=db.doc("data/users/"+id+"/app"),s=await r.get();
 if(s.exists){const d=s.data(),loc=mexeu?{itens:S.itens,pago:S.pago,renda:S.renda,metas:S.metas,entradas:S.entradas,cofre:S.cofre,contas:S.contas,cartoes:S.cartoes,receber:S.receber}:null;
  S.itens=JSON.parse(JSON.stringify(d.itens||[]));S.metas=JSON.parse(JSON.stringify(d.metas||[]));S.entradas=JSON.parse(JSON.stringify(d.entradas||[]));S.cofre=JSON.parse(JSON.stringify(d.cofre||[]));S.contas=JSON.parse(JSON.stringify(d.contas||[]));S.rendaNome=d.rendaNome||"";S.cartoes=cl(d.cartoes);S.receber=cl(d.receber);if(d.categorias&&d.categorias.length)S.categorias=cl(d.categorias);S.pago={};(d.pago||[]).forEach(k=>S.pago[k]=1);S.renda=d.renda||0;S.tema=d.tema||"";
  if(loc){const ids=new Set(S.itens.map(x=>x.id));loc.itens.forEach(x=>{if(!ids.has(x.id))S.itens.push(x)});const mi=new Set(S.metas.map(x=>x.id));(loc.metas||[]).forEach(x=>{if(!mi.has(x.id))S.metas.push(x)});["entradas","cofre","contas","cartoes","receber"].forEach(k=>{const q=new Set(S[k].map(x=>x.id));(loc[k]||[]).forEach(x=>{if(!q.has(x.id))S[k].push(x)})});Object.assign(S.pago,loc.pago);if(loc.renda)S.renda=loc.renda;ref=r;salvar()}
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  migrar();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(S.tema)document.documentElement.dataset.theme=S.tema;render()}
 else if(S.itens.length||S.renda)await r.set(empacotar());
 ref=r;status("Salvo na sua conta")
}catch(e){}})();
})();
