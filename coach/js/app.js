/* Coach dashboard UI — prototype only, works from file:// */
(function () {
  var db = HCFC.load();
  var state = { tab: "roster", q: "", tracking: "all", medFlagged: false, toast: "", modal: null, taskSetId: null, assessView: "grid", assessPeriodId: null, assessPlayerId: null };
  var TABS = [["roster","Roster"],["tracking","Tracking"],["fees","Fees & Uniform"],["duties","Captain & Fruit Roster"],["assessment","Assessment"],["fitness","Fitness"],["tasks","Tasks"],["medical","Medical"],["matches","Matches"],["fixtures","Fixtures"],["sessions","Sessions"],["equipment","Equipment"],["comms","Comms"],["reports","Reports"],["settings","Settings"]];

  function crestSrc(){ return window.HCFC_CREST || "../assets/crest.svg"; }
  function tteSrc(){ return window.HCFC_TTE_LOGO || "../assets/tte-mark.png"; }
  function builtBy(mod){
    return '<a class="built-by'+(mod?" "+mod:"")+'" href="https://trump.tech" target="_blank" rel="noopener" title="Trump Technology &amp; Engineering, trump.tech"><img src="'+tteSrc()+'" width="36" height="20" alt="Trump Technology &amp; Engineering mark"><span><span class="built-by-label">Built by</span><span class="built-by-name">Trump Technology &amp; Engineering</span></span></a>';
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function persist(){ HCFC.save(db); }
  function teamId(){ return db.currentTeamId || (db.teams[0] && db.teams[0].id); }
  function team(){ return db.teams.filter(function(t){ return t.id === teamId(); })[0] || db.teams[0]; }
  function teamPlayers(){ return db.players.filter(function(p){ return p.teamId === teamId(); }); }
  function playerById(id){ return db.players.filter(function(p){ return p.id === id; })[0]; }
  function todayISO(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function fmtDate(iso){ if(!iso) return "—"; var p=String(iso).split("-"); return p.length===3 ? p[2]+"/"+p[1]+"/"+p[0] : esc(iso); }
  function daysBetween(iso){ if(!iso) return null; var a=new Date(iso+"T00:00:00"); var b=new Date(); b=new Date(b.getFullYear(),b.getMonth(),b.getDate()); return Math.round((b-a)/86400000); }
  function toast(msg){ state.toast=msg; render(); setTimeout(function(){ if(state.toast===msg){ state.toast=""; render(); } }, 2800); }
  function closeModal(){ state.modal=null; render(); }

  function td(){
    return (db.settings && db.settings.technicalDirector) || { name:"Ozzi", role:"Technical Director", email:"td@humecityfc.com" };
  }
  function tdLabel(){ var x=td(); return x.name+" ("+x.role+")"; }
  function clubCoaches(){ return (db.settings && db.settings.coaches) || []; }
  function policiesNote(){ return (db.settings && db.settings.policiesNote) || "Club policies are on the club's Team App, under the Documents tab."; }
  function clubBar(){
    return '<div class="note club-bar">Concerns or feedback: <a href="mailto:'+esc(td().email)+'">'+esc(tdLabel())+'</a> · '+esc(td().email)+' · '+esc(policiesNote())+'</div>';
  }
  function pageHead(title, sub, actions){ return '<div class="page-head"><div><p class="kicker">'+esc(team().name)+'</p><h1>'+title+'</h1><p class="help">'+(sub||"")+'</p></div><div class="toolbar">'+(actions||"")+'</div></div>'; }
  function stat(v,l){ return '<div class="stat"><b>'+esc(v)+'</b><span>'+esc(l)+'</span></div>'; }
  function opt(v,l,cur){ return '<option value="'+v+'"'+(cur===v?" selected":"")+'>'+l+'</option>'; }

  function attendanceFor(playerId){
    var pidTeam=(playerById(playerId)||{}).teamId;
    var sessions=db.sessions.filter(function(s){ return s.teamId===pidTeam; });
    var present=0,total=0;
    sessions.forEach(function(s){
      var row=db.attendance.filter(function(a){ return a.sessionId===s.id && a.playerId===playerId; })[0];
      if(row){ total++; if(row.present) present++; }
    });
    return { present:present, total:total, pct: total? Math.round(present/total*100):0 };
  }
  function lastContact(playerId){
    var rows=db.comms.filter(function(c){ return c.playerId===playerId; }).sort(function(a,b){ return a.date<b.date?1:-1; });
    return rows[0]||null;
  }
  function assessment(playerId, periodId, metricId){
    return db.assessments.filter(function(a){ return a.playerId===playerId && a.periodId===periodId && a.metricId===metricId; })[0];
  }
  function changeInfo(prev, curr, lowerIsBetter){
    if(prev==null||curr==null||prev===""||curr===""||Number(prev)===0) return null;
    var p=Number(prev), c=Number(curr);
    var pct=((c-p)/Math.abs(p))*100;
    var improved=lowerIsBetter ? c<p : c>p;
    return { pct:Math.round(pct*10)/10, improved:improved, same:c===p };
  }
  function sparkline(playerId, metric){
    var vals=db.periods.map(function(p){ var a=assessment(playerId,p.id,metric.id); return a&&a.value!==""&&a.value!=null?Number(a.value):null; });
    var nums=vals.filter(function(v){ return v!=null && !isNaN(v); });
    if(nums.length<2) return '<span class="help">Not enough data</span>';
    var min=Math.min.apply(null,nums), max=Math.max.apply(null,nums), w=120, h=32, pad=3, pts=[];
    vals.forEach(function(v,i){
      if(v==null||isNaN(v)) return;
      var x=pad+(i/Math.max(vals.length-1,1))*(w-pad*2);
      var y=max===min?h/2:pad+(1-(v-min)/(max-min))*(h-pad*2);
      pts.push(x.toFixed(1)+","+y.toFixed(1));
    });
    var last=changeInfo(nums[0], nums[nums.length-1], metric.lowerIsBetter);
    var color=!last||last.same?"#5A5052":(last.improved?"#0F7B3A":"#B42318");
    return '<svg class="spark" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline fill="none" stroke="'+color+'" stroke-width="2" points="'+pts.join(" ")+'"/></svg>';
  }
  function download(filename, text, mime){
    var blob=new Blob([text],{type:mime||"text/plain"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename;
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },400);
  }
  function parseCSV(text){
    var rows=[], row=[], cur="", i, inQ=false;
    text=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
    for(i=0;i<text.length;i++){
      var ch=text[i];
      if(inQ){ if(ch==='"'){ if(text[i+1]==='"'){ cur+='"'; i++; } else inQ=false; } else cur+=ch; }
      else if(ch==='"') inQ=true;
      else if(ch===","){ row.push(cur); cur=""; }
      else if(ch==="\n"){ row.push(cur); rows.push(row); row=[]; cur=""; }
      else cur+=ch;
    }
    if(cur.length||row.length){ row.push(cur); rows.push(row); }
    return rows.filter(function(r){ return r.some(function(c){ return String(c).trim()!==""; }); });
  }
  function toCSV(rows){
    return rows.map(function(r){ return r.map(function(c){ c=String(c==null?"":c); return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c; }).join(","); }).join("\n");
  }

  function shell(inner){
    applyCoachScope();
    var t=team();
    var follow=db.medical.filter(function(m){ var p=playerById(m.playerId); return p&&p.teamId===teamId()&&m.needsFollowUp&&m.status!=="Cleared"; }).length;
    var coach=currentCoach();
    var teamLocked=coach && !coach.canViewAll && !!coach.teamId;
    var coachOpts=clubCoaches().map(function(c){ return '<option value="'+esc(c.id)+'"'+(c.id===coach.id?" selected":"")+'>'+esc(c.name)+(c.role?" — "+esc(c.role):"")+"</option>"; }).join("");
    var opts=db.teams.map(function(x){ return '<option value="'+esc(x.id)+'"'+(x.id===teamId()?" selected":"")+'>'+esc(x.name)+'</option>'; }).join("");
    var tabs=TABS.map(function(pair){
      var extra=pair[0]==="medical"&&follow?' <span class="badge badge-bad">'+follow+'</span>':"";
      return '<button type="button" data-act="tab" data-tab="'+pair[0]+'"'+(state.tab===pair[0]?' class="is-active" aria-current="page"':"")+'>'+pair[1]+extra+'</button>';
    }).join("");
    return '<div class="app-shell">'+
      '<div class="draft-banner"><strong>Temporary prototype — sample data.</strong> Do not enter real player or medical details. No sign-in is required. <a href="../index.html">Prototype hub</a>'+(HCFC.storageAvailable&&HCFC.storageAvailable()?'':' <strong>This browser could not save data, so the sample set is in memory only for this session.</strong>')+'</div>'+
      '<header class="coach-top"><div class="wrap-wide"><div class="coach-top-inner">'+
      '<a class="brand" href="../index.html"><img src="'+crestSrc()+'" width="36" height="44" alt="Placeholder crest"><span><span class="brand-name">Coach Dashboard</span><span class="brand-tag">Placeholder crest · '+esc(t.name)+'</span></span></a>'+
      '<div class="header-switches">'+'<a class="btn btn-small home-link" href="../index.html">&larr; Back to Home</a>'+
      '<label class="team-switch">Signed in as coach <select id="coach-switch">'+coachOpts+'</select></label>'+
      '<label class="team-switch">Team <select id="team-switch"'+(teamLocked?" disabled":"")+'>'+opts+'</select></label>'+
      builtBy("built-by--header")+
      '</div>'+
      '</div><p class="help scope-note">Prototype scoping only — this is not a real login. A named coach sees only their own team. Ozzi (Technical Director) can view every team.</p>'+
      '<nav class="tabbar" aria-label="Coach sections">'+tabs+'</nav></div></header>'+
      '<main class="coach-main" id="main"><div class="wrap-wide">'+clubBar()+inner+'</div></main>'+
      '<footer class="coach-foot"><div class="wrap-wide">'+builtBy("")+'</div></footer>'+
      (state.toast?'<div class="draft-banner" role="status">'+esc(state.toast)+'</div>':"")+
      (state.modal?'<div class="modal-back" data-act="backdrop"><div class="modal" role="dialog" aria-modal="true">'+state.modal+'</div></div>':"")+
      '</div>';
  }

  function viewRoster(){
    var q=state.q.toLowerCase();
    var rows=teamPlayers().filter(function(p){
      return [p.name,p.email,p.guardian1.email,p.guardian1.name,(p.guardian2||{}).email].join(" ").toLowerCase().indexOf(q)!==-1;
    }).map(function(p){
      var lc=lastContact(p.id); var days=lc?daysBetween(lc.date):999; var stale=days>=30;
      var last=lc?fmtDate(lc.date)+" ("+days+"d)":"Never";
      return '<tr class="'+(stale?"stale":"")+'"><td><strong>'+esc(p.name)+'</strong><br><span class="help">'+esc(p.email)+'</span></td>'+
        '<td>'+esc(p.guardian1.name)+' · '+esc(p.guardian1.relationship)+'<br><span class="help">'+esc(p.guardian1.email)+' · '+esc(p.guardian1.phone)+'</span>'+
        (p.guardian2&&p.guardian2.name?'<br><span class="help">2nd: '+esc(p.guardian2.name)+' · '+esc(p.guardian2.email)+' · '+esc(p.guardian2.phone)+'</span>':'')+'</td>'+
        '<td>'+last+(stale?' <span class="badge badge-warn">30+ days</span>':'')+'</td>'+
        '<td><button class="btn btn-ghost btn-small" data-act="edit-player" data-id="'+p.id+'">Edit</button> '+
        '<button class="btn btn-ghost btn-small" data-act="delete-player" data-id="'+p.id+'">Delete</button></td></tr>';
    }).join("");
    return pageHead("Roster", teamPlayers().length+" sample players",
      '<button class="btn btn-small" data-act="add-player">Add player</button>'+
      '<button class="btn btn-outline btn-small" data-act="export-roster">Export CSV</button>'+
      '<label class="btn btn-outline btn-small">Import CSV<input type="file" accept=".csv,text/csv" hidden id="import-roster"></label>')+
      '<div class="filters"><input id="search" placeholder="Search name or email" value="'+esc(state.q)+'"></div>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Player &amp; email</th><th>Parent / guardian contacts</th><th>Last contacted</th><th></th></tr></thead><tbody>'+
      (rows||'<tr><td colspan="4">No players yet.</td></tr>')+'</tbody></table></div>'+
      '<p class="help">Families not contacted in 30+ days are highlighted. All names here are sample data.</p>';
  }

  function playerForm(p){
    p=p||{name:"",email:"",guardian1:{name:"",relationship:"Parent",email:"",phone:""},guardian2:{name:"",relationship:"",email:"",phone:""},feeStatus:"Unpaid",feeAmount:0,feeDate:"",uniformOrder:"Not ordered",uniformCollection:"Not collected",uniformSize:db.settings.uniformSizes[0]};
    var sizes=db.settings.uniformSizes.map(function(s){ return '<option'+(p.uniformSize===s?" selected":"")+'>'+esc(s)+'</option>'; }).join("");
    state.modal='<h2>'+(p.id?"Edit player":"Add player")+'</h2><form id="player-form" class="form" data-id="'+esc(p.id||"")+'"><div class="grid-2">'+
      '<div class="field"><label>Player name</label><input name="name" required value="'+esc(p.name)+'"></div>'+
      '<div class="field"><label>Player email</label><input name="email" type="email" required value="'+esc(p.email)+'"></div>'+
      '<div class="field"><label>Guardian 1 name</label><input name="g1name" value="'+esc(p.guardian1.name)+'"></div>'+
      '<div class="field"><label>Relationship</label><input name="g1rel" value="'+esc(p.guardian1.relationship)+'"></div>'+
      '<div class="field"><label>Guardian 1 email</label><input name="g1email" type="email" value="'+esc(p.guardian1.email)+'"></div>'+
      '<div class="field"><label>Guardian 1 phone</label><input name="g1phone" placeholder="0400 000 000" value="'+esc(p.guardian1.phone)+'"></div>'+
      '<div class="field"><label>Guardian 2 name</label><input name="g2name" value="'+esc((p.guardian2||{}).name||"")+'"></div>'+
      '<div class="field"><label>Guardian 2 relationship</label><input name="g2rel" value="'+esc((p.guardian2||{}).relationship||"")+'"></div>'+
      '<div class="field"><label>Guardian 2 email</label><input name="g2email" type="email" value="'+esc((p.guardian2||{}).email||"")+'"></div>'+
      '<div class="field"><label>Guardian 2 phone</label><input name="g2phone" value="'+esc((p.guardian2||{}).phone||"")+'"></div>'+
      '<div class="field"><label>Fee status</label><select name="feeStatus"><option>Unpaid</option><option>Part paid</option><option>Paid</option></select></div>'+
      '<div class="field"><label>Amount owing (A$)</label><input name="feeAmount" type="number" min="0" step="0.01" value="'+esc(p.feeAmount)+'"></div>'+
      '<div class="field"><label>Fee date</label><input name="feeDate" type="date" value="'+esc(p.feeDate)+'"></div>'+
      '<div class="field"><label>Uniform order</label><select name="uniformOrder"><option>Not ordered</option><option>Ordered</option><option>Arrived</option></select></div>'+
      '<div class="field"><label>Uniform collection</label><select name="uniformCollection"><option>Not collected</option><option>Collected</option></select></div>'+
      '<div class="field"><label>Uniform size</label><select name="uniformSize">'+sizes+'</select></div></div>'+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    var f=document.getElementById("player-form");
    f.feeStatus.value=p.feeStatus; f.uniformOrder.value=p.uniformOrder; f.uniformCollection.value=p.uniformCollection;
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var d={ name:f.name.value,email:f.email.value,
        guardian1:{name:f.g1name.value,relationship:f.g1rel.value,email:f.g1email.value,phone:f.g1phone.value},
        guardian2:{name:f.g2name.value,relationship:f.g2rel.value,email:f.g2email.value,phone:f.g2phone.value},
        feeStatus:f.feeStatus.value,feeAmount:Number(f.feeAmount.value||0),feeDate:f.feeDate.value,
        uniformOrder:f.uniformOrder.value,uniformCollection:f.uniformCollection.value,uniformSize:f.uniformSize.value,teamId:teamId() };
      if(p.id){ var cur=playerById(p.id); Object.keys(d).forEach(function(k){ cur[k]=d[k]; }); }
      else { d.id=HCFC.uid("pl"); db.players.push(d); }
      persist(); closeModal(); toast("Player saved (sample / local only).");
    });
  }

  function viewTracking(){
    var list=teamPlayers();
    var paid=list.filter(function(p){ return p.feeStatus==="Paid"; }).length;
    var awaitU=list.filter(function(p){ return p.uniformOrder==="Arrived" && p.uniformCollection!=="Collected"; }).length;
    var unpaid=list.filter(function(p){ return p.feeStatus==="Unpaid"; }).length;
    var part=list.filter(function(p){ return p.feeStatus==="Part paid"; }).length;
    var filtered=list.filter(function(p){
      if(state.tracking==="unpaid") return p.feeStatus!=="Paid";
      if(state.tracking==="uniform") return p.uniformCollection!=="Collected";
      if(state.tracking==="absent") return attendanceFor(p.id).pct<80;
      return true;
    });
    var sessions=db.sessions.filter(function(s){ return s.teamId===teamId(); }).sort(function(a,b){ return a.date<b.date?1:-1; });
    var sessHead=sessions.map(function(s){ return "<th>"+s.type.charAt(0)+" "+fmtDate(s.date)+"</th>"; }).join("");
    var rows=filtered.map(function(p){
      var att=attendanceFor(p.id);
      var marks=sessions.map(function(s){
        var row=db.attendance.filter(function(a){ return a.sessionId===s.id && a.playerId===p.id; })[0];
        var val=row&&row.present?"P":(row?"A":"");
        return '<td><select data-act="att" data-sid="'+s.id+'" data-pid="'+p.id+'">'+
          '<option value=""'+(val===""?" selected":"")+">—</option>"+
          '<option value="P"'+(val==="P"?" selected":"")+">P</option>"+
          '<option value="A"'+(val==="A"?" selected":"")+">A</option></select></td>";
      }).join("");
      return "<tr><td><strong>"+esc(p.name)+"</strong><br>"+att.present+"/"+att.total+" ("+att.pct+"%)</td>"+marks+
        '<td><select data-act="field" data-id="'+p.id+'" data-k="feeStatus"><option>Unpaid</option><option'+(p.feeStatus==="Part paid"?" selected":"")+">Part paid</option><option"+(p.feeStatus==="Paid"?" selected":"")+">Paid</option></select><br>"+
        '<input data-act="field" data-id="'+p.id+'" data-k="feeAmount" type="number" style="width:5.5rem" value="'+esc(p.feeAmount)+'"> <input data-act="field" data-id="'+p.id+'" data-k="feeDate" type="date" value="'+esc(p.feeDate)+'"></td>'+
        '<td><select data-act="field" data-id="'+p.id+'" data-k="uniformOrder"><option>Not ordered</option><option'+(p.uniformOrder==="Ordered"?" selected":"")+">Ordered</option><option"+(p.uniformOrder==="Arrived"?" selected":"")+">Arrived</option></select></td>"+
        '<td><select data-act="field" data-id="'+p.id+'" data-k="uniformCollection"><option>Not collected</option><option'+(p.uniformCollection==="Collected"?" selected":"")+">Collected</option></select></td>"+
        "<td><select data-act=\"field\" data-id=\""+p.id+"\" data-k=\"uniformSize\">"+
        db.settings.uniformSizes.map(function(s){ return "<option"+(p.uniformSize===s?" selected":"")+">"+esc(s)+"</option>"; }).join("")+
        "</select></td></tr>";
    }).join("");
    return pageHead("Tracking","Attendance, fees and uniforms")+
      '<div class="stats">'+stat(paid+"/"+list.length,"Fees paid")+stat(part,"Part paid")+stat(unpaid,"Unpaid")+stat(awaitU,"Uniforms awaiting collection")+"</div>"+
      '<div class="filters"><label>Filter <select id="track-filter">'+
      opt("all","All players",state.tracking)+opt("unpaid","Fees outstanding",state.tracking)+
      opt("uniform","Uniform not collected",state.tracking)+opt("absent","Attendance under 80%",state.tracking)+
      "</select></label>"+
      '<button class="btn btn-outline btn-small" data-act="add-session">Add session</button></div>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Player / attendance</th>'+sessHead+"<th>Fees</th><th>Order</th><th>Collection</th><th>Size</th></tr></thead><tbody>"+
      (rows||"<tr><td>No players.</td></tr>")+"</tbody></table></div>"+
      '<p class="help">P = present, A = absent. Session types are Training or Match. Size list is configurable in Settings.</p>';
  }

  function viewFeesUniform(){
    var list=teamPlayers();
    var fstate=state.feesFilter||"all";
    var paid=list.filter(function(p){ return p.feeStatus==="Paid"; }).length;
    var unpaid=list.filter(function(p){ return p.feeStatus==="Unpaid"; }).length;
    var part=list.filter(function(p){ return p.feeStatus==="Part paid"; }).length;
    var ordered=list.filter(function(p){ return p.uniformOrder!=="Not ordered"; }).length;
    var awaitU=list.filter(function(p){ return p.uniformOrder==="Arrived" && p.uniformCollection!=="Collected"; }).length;
    var collected=list.filter(function(p){ return p.uniformCollection==="Collected"; }).length;
    var filtered=list.filter(function(p){
      if(fstate==="unpaid") return p.feeStatus==="Unpaid";
      if(fstate==="part") return p.feeStatus==="Part paid";
      if(fstate==="paid") return p.feeStatus==="Paid";
      if(fstate==="outstanding") return p.feeStatus!=="Paid";
      if(fstate==="uniform") return p.uniformCollection!=="Collected";
      return true;
    });
    var rows=filtered.map(function(p){
      return "<tr><td><strong>"+esc(p.name)+"</strong></td>"+
        '<td><select data-act="field" data-id="'+p.id+'" data-k="feeStatus"><option>Unpaid</option><option'+(p.feeStatus==="Part paid"?" selected":"")+">Part paid</option><option"+(p.feeStatus==="Paid"?" selected":"")+">Paid</option></select></td>"+
        '<td><input data-act="field" data-id="'+p.id+'" data-k="feeAmount" type="number" style="width:6rem" value="'+esc(p.feeAmount)+'"></td>'+
        '<td><input data-act="field" data-id="'+p.id+'" data-k="feeDate" type="date" value="'+esc(p.feeDate)+'"></td>'+
        '<td><select data-act="field" data-id="'+p.id+'" data-k="uniformOrder"><option>Not ordered</option><option'+(p.uniformOrder==="Ordered"?" selected":"")+">Ordered</option><option"+(p.uniformOrder==="Arrived"?" selected":"")+">Arrived</option></select></td>"+
        "<td><select data-act=\"field\" data-id=\""+p.id+"\" data-k=\"uniformSize\">"+
        db.settings.uniformSizes.map(function(s){ return "<option"+(p.uniformSize===s?" selected":"")+">"+esc(s)+"</option>"; }).join("")+"</select></td>"+
        '<td><select data-act="field" data-id="'+p.id+'" data-k="uniformCollection"><option>Not collected</option><option'+(p.uniformCollection==="Collected"?" selected":"")+">Collected</option></select></td></tr>";
    }).join("");
    return pageHead("Fees & Uniform","Membership fees and uniform orders for this team. Sample data only.")+
      '<div class="stats">'+stat(paid+"/"+list.length,"Fees paid")+stat(part,"Part paid")+stat(unpaid,"Unpaid")+stat(ordered,"Uniforms ordered")+stat(awaitU,"Awaiting collection")+stat(collected,"Collected")+"</div>"+
      '<div class="filters"><label>Filter <select id="fees-filter">'+
      opt("all","All players",fstate)+opt("outstanding","Fees outstanding (unpaid or part paid)",fstate)+opt("unpaid","Unpaid",fstate)+opt("part","Part paid",fstate)+opt("paid","Paid",fstate)+
      opt("uniform","Uniform not collected",fstate)+"</select></label></div>"+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Player</th><th>Fee status</th><th>Amount ($)</th><th>Date paid</th><th>Uniform order</th><th>Size</th><th>Collection</th></tr></thead><tbody>'+
      (rows||"<tr><td colspan='7'>No players match this filter.</td></tr>")+"</tbody></table></div>"+
      '<p class="help">Changes here also show in the Tracking tab, as both use the same player records. Size list is configurable in Settings.</p>';
  }

  function dutyWeeks(){
    var d=new Date(); d=new Date(d.getFullYear(),d.getMonth(),d.getDate());
    d.setDate(d.getDate()+((6-d.getDay()+7)%7));
    var out=[]; for(var i=0;i<8;i++){ var x=new Date(d); x.setDate(d.getDate()+7*i); out.push(x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")); }
    return out;
  }
  function dutyFor(week){
    db.duties=db.duties||[];
    return db.duties.filter(function(x){ return x.teamId===teamId() && x.week===week; })[0];
  }
  function dutyAutofill(onlyEmpty){
    var players=teamPlayers(); if(!players.length) return;
    db.duties=db.duties||[];
    dutyWeeks().forEach(function(w,i){
      var rec=dutyFor(w);
      if(!rec){ rec={teamId:teamId(),week:w,captainId:"",fruitId:"",notes:""}; db.duties.push(rec); }
      if(!onlyEmpty||!rec.captainId) rec.captainId=players[i%players.length].id;
      if(!onlyEmpty||!rec.fruitId) rec.fruitId=players[(i+Math.ceil(players.length/2))%players.length].id;
    });
    persist();
  }
  function viewDuties(){
    var players=teamPlayers();
    db.duties=db.duties||[]; db.teamCaptains=db.teamCaptains||{};
    var weeks=dutyWeeks();
    if(players.length && !db.duties.some(function(x){ return x.teamId===teamId(); })) dutyAutofill(false);
    var tc=db.teamCaptains[teamId()]||{captainId:"",viceId:""};
    function pOpts(sel){ return '<option value="">—</option>'+players.map(function(p){ return '<option value="'+p.id+'"'+(p.id===sel?" selected":"")+">"+esc(p.name)+"</option>"; }).join(""); }
    var counts={}; players.forEach(function(p){ counts[p.id]={c:0,f:0}; });
    var rows=weeks.map(function(w){
      var r=dutyFor(w)||{captainId:"",fruitId:"",notes:""};
      if(counts[r.captainId]) counts[r.captainId].c++;
      if(counts[r.fruitId]) counts[r.fruitId].f++;
      return "<tr><td>"+fmtDate(w)+"</td>"+
        '<td><select data-act="duty" data-week="'+w+'" data-k="captainId">'+pOpts(r.captainId)+"</select></td>"+
        '<td><select data-act="duty" data-week="'+w+'" data-k="fruitId">'+pOpts(r.fruitId)+"</select></td>"+
        '<td><input data-act="duty" data-week="'+w+'" data-k="notes" value="'+esc(r.notes||"")+'" placeholder="e.g. oranges, cut into quarters"></td></tr>';
    }).join("");
    var share=players.map(function(p){ return "<tr><td>"+esc(p.name)+"</td><td>"+counts[p.id].c+"</td><td>"+counts[p.id].f+"</td></tr>"; }).join("");
    return pageHead("Captain & Fruit Roster","Season captain, weekly match captain and who brings fruit. Sample players only.",
      '<button class="btn btn-small" data-act="duty-autofill">Auto-fill rotation</button>'+
      '<button class="btn btn-outline btn-small" data-act="duty-clear">Clear roster</button>')+
      (function(){ var c=currentCoach()||{}; return '<p class="note">Showing the roster for <strong>'+esc(team().name)+'</strong>, managed by <strong>'+esc(c.name||"")+'</strong>'+(c.role?" ("+esc(c.role)+")":"")+'. Each coach has a separate captain and fruit roster for their own team.'+(c.canViewAll?" As Technical Director, Ozzi can switch teams with the Team picker.":"")+"</p>"; })()+
      (players.length?"":"<p>No players in this team. Add players on the Roster tab first.</p>")+
      '<div class="card" style="margin-bottom:1rem"><h2>Team captain</h2><div class="grid-2">'+
      '<div class="field"><label>Season captain</label><select data-act="team-captain" data-k="captainId">'+pOpts(tc.captainId)+"</select></div>"+
      '<div class="field"><label>Vice-captain</label><select data-act="team-captain" data-k="viceId">'+pOpts(tc.viceId)+"</select></div></div></div>"+
      '<h2>Weekly roster (match days)</h2>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Week of</th><th>Match captain</th><th>Bringing fruit</th><th>Notes</th></tr></thead><tbody>'+rows+"</tbody></table></div>"+
      '<h2 style="margin-top:1.25rem">Fair share</h2><div class="table-wrap"><table class="data"><thead><tr><th>Player</th><th>Times captain</th><th>Times on fruit</th></tr></thead><tbody>'+
      (share||"<tr><td colspan='3'>No players.</td></tr>")+"</tbody></table></div>"+
      '<p class="help">Auto-fill rotates through the squad so every player gets a turn. Change any week by hand. Prototype only, nothing is sent to families.</p>';
  }

  function currentCoach(){
    var list=clubCoaches();
    var id=db.currentCoachId;
    var found=list.filter(function(c){ return c.id===id; })[0];
    return found || list[0] || { id:"", name:"Coach", role:"", canViewAll:true, teamId:"" };
  }
  function applyCoachScope(){
    var c=currentCoach();
    if(c && !c.canViewAll && c.teamId) db.currentTeamId=c.teamId;
  }
  function periodList(){
    return (db.periods||[]).slice().sort(function(a,b){ return String(a.start).localeCompare(String(b.start)); });
  }
  function periodById(id){ return (db.periods||[]).filter(function(p){ return p.id===id; })[0]; }
  function testsList(){ return db.tests||[]; }
  function testById(id){ return testsList().filter(function(t){ return t.id===id; })[0]; }
  function testResult(playerId, periodId, testId){
    return (db.testResults||[]).filter(function(r){ return r.playerId===playerId && r.periodId===periodId && r.testId===testId; })[0];
  }
  function upsertTestResult(playerId, periodId, testId, fields){
    if(!db.testResults) db.testResults=[];
    var cur=testResult(playerId, periodId, testId);
    if(!cur){ cur={ playerId:playerId, periodId:periodId, testId:testId, value:"", carriedForward:false }; db.testResults.push(cur); }
    Object.keys(fields).forEach(function(k){ cur[k]=fields[k]; });
    return cur;
  }
  function previousPeriod(periodId){
    var list=periodList(), i;
    for(i=0;i<list.length;i++) if(list[i].id===periodId) return i>0?list[i-1]:null;
    return null;
  }
  function nth(n){
    if(n==null||n==="") return "—";
    n=Number(n);
    if(!isFinite(n)) return "—";
    var v=n%100, s=["th","st","nd","rd"];
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }
  function periodDateLabel(per){
    if(!per) return "";
    var months=["January","February","March","April","May","June","July","August","September","October","November","December"];
    function part(iso){
      if(!iso) return "";
      var p=String(iso).split("-");
      var m=months[Number(p[1])-1]||p[1];
      var d=Number(p[2]);
      return d===1 ? m : m+" "+d;
    }
    var a=part(per.start), b=part(per.end);
    var y=(per.end||per.start||"").slice(0,4);
    if(a&&b) return a+" thru "+b+", "+y;
    return fmtDate(per.start)+" – "+fmtDate(per.end);
  }
  function attendanceForPeriod(playerId, period){
    var empty={ present:0, total:0, pct:0 };
    if(!period) return { train:empty, games:empty };
    var pidTeam=(playerById(playerId)||{}).teamId;
    function tally(type){
      var present=0,total=0;
      (db.sessions||[]).forEach(function(s){
        if(s.teamId!==pidTeam || s.type!==type) return;
        if(s.date<period.start || s.date>period.end) return;
        var row=(db.attendance||[]).filter(function(a){ return a.sessionId===s.id && a.playerId===playerId; })[0];
        if(row){ total++; if(row.present) present++; }
      });
      return { present:present, total:total, pct: total?Math.round(present/total*100):0 };
    }
    return { train:tally("Training"), games:tally("Match") };
  }
  function rankMaps(periodId, players){
    players=players||teamPlayers();
    var tests=testsList();
    var perTest={};
    tests.forEach(function(t){
      var rows=players.map(function(p){
        var r=testResult(p.id,periodId,t.id);
        return r&&r.value!==""&&r.value!=null&&!isNaN(Number(r.value)) ? { id:p.id, v:Number(r.value) } : null;
      }).filter(Boolean);
      rows.sort(function(a,b){ return t.lowerIsBetter ? a.v-b.v : b.v-a.v; });
      var map={}, i=0;
      while(i<rows.length){
        var j=i;
        while(j<rows.length && rows[j].v===rows[i].v) j++;
        var rank=i+1;
        for(var k=i;k<j;k++) map[rows[k].id]=rank;
        i=j;
      }
      perTest[t.id]=map;
    });
    function overall(group){
      var subset=tests.filter(function(t){ return !group || t.group===group; });
      var avgs=players.map(function(p){
        var ranks=[];
        subset.forEach(function(t){ if(perTest[t.id][p.id]) ranks.push(perTest[t.id][p.id]); });
        if(!ranks.length) return null;
        return { id:p.id, v:ranks.reduce(function(a,b){ return a+b; },0)/ranks.length };
      }).filter(Boolean);
      avgs.sort(function(a,b){ return a.v-b.v; });
      var map={}, i=0;
      while(i<avgs.length){
        var j=i;
        while(j<avgs.length && avgs[j].v===avgs[i].v) j++;
        var rank=i+1;
        for(var k=i;k<j;k++) map[avgs[k].id]=rank;
        i=j;
      }
      return map;
    }
    return { perTest:perTest, overall:overall(null), fitness:overall("fitness"), ball:overall("ball") };
  }
  function rankDelta(curr, prev){
    if(curr==null||prev==null) return "";
    if(curr<prev) return ' <span class="up" title="Improved ranking">▲</span>';
    if(curr>prev) return ' <span class="down" title="Dropped ranking">▼</span>';
    return ' <span class="help">→</span>';
  }
  function reportCardRec(playerId, periodId){
    return (db.reportCards||[]).filter(function(r){ return r.playerId===playerId && r.periodId===periodId; })[0];
  }
  function ensureReportCard(playerId, periodId){
    if(!db.reportCards) db.reportCards=[];
    var rec=reportCardRec(playerId, periodId);
    if(!rec){
      rec={ id:"rc-"+playerId+"-"+periodId, playerId:playerId, periodId:periodId, overallRating:"ON TRACK", notes:"",
        criteria:{ attendance:{status:"ON TRACK",feedback:""}, fitness:{status:"ON TRACK",feedback:""}, ballSkills:{status:"ON TRACK",feedback:""},
          gameDay:{status:"ON TRACK",feedback:""}, attitude:{status:"ON TRACK",feedback:""}, parents:{status:"ON TRACK",feedback:""} } };
      db.reportCards.push(rec);
    }
    if(!rec.criteria) rec.criteria={};
    return rec;
  }
  function statusOptions(cur){
    return ["ON TRACK","NEEDS FOCUS","EXCEEDING"].map(function(s){ return '<option value="'+s+'"'+(cur===s?" selected":"")+">"+s+"</option>"; }).join("");
  }
  function assessPeriodId(){
    if(state.assessPeriodId && periodById(state.assessPeriodId)) return state.assessPeriodId;
    var withData=periodList().filter(function(per){
      return (db.testResults||[]).some(function(r){ return r.periodId===per.id && teamPlayers().some(function(p){ return p.id===r.playerId; }); });
    });
    return (withData[withData.length-1]||periodList()[1]||periodList()[0]||{}).id;
  }
  function assessPlayerId(){
    var list=teamPlayers();
    if(state.assessPlayerId && list.some(function(p){ return p.id===state.assessPlayerId; })) return state.assessPlayerId;
    return list[0] ? list[0].id : "";
  }

  function rankCellHtml(rank, prevRank, rec){
    var cf=rec&&rec.carriedForward?' <span class="badge" title="Carried forward from the previous period">CF</span>':"";
    var tip=rec&&rec.value!==""&&rec.value!=null?' title="Result: '+esc(rec.value)+'"':"";
    return "<span"+tip+">"+(rank?esc(nth(rank)):"—")+rankDelta(rank,prevRank)+cf+"</span>";
  }

  function viewAssessment(){
    var players=teamPlayers();
    var periods=periodList();
    var pid=assessPeriodId();
    var view=state.assessView||"grid";
    var periodOpts=periods.map(function(p){ return '<option value="'+p.id+'"'+(p.id===pid?" selected":"")+">"+esc(p.name)+"</option>"; }).join("");
    var selAll=!state.assessPlayerId||state.assessPlayerId==="all"||!players.some(function(p){ return p.id===state.assessPlayerId; });
    var shown=(view!=="card"&&!selAll)?players.filter(function(p){ return p.id===state.assessPlayerId; }):players;
    var playerOpts=players.map(function(p){ return '<option value="'+p.id+'"'+((view==="card"?p.id===assessPlayerId():(!selAll&&p.id===state.assessPlayerId))?" selected":"")+">"+esc(p.name)+"</option>"; }).join("");
    var tabs='<div class="filters"><span class="help">View</span>'+
      '<button type="button" class="btn btn-small'+(view==="grid"?"":" btn-outline")+'" data-act="assess-view" data-view="grid">Rankings grid</button>'+
      '<button type="button" class="btn btn-small'+(view==="entry"?"":" btn-outline")+'" data-act="assess-view" data-view="entry">Enter results</button>'+
      '<button type="button" class="btn btn-small'+(view==="card"?"":" btn-outline")+'" data-act="assess-view" data-view="card">Report card</button>'+
      '<label>Period <select id="assess-period">'+periodOpts+"</select></label>"+
      '<label>Player <select id="assess-player">'+(view==="card"?"":'<option value="all"'+(selAll?" selected":"")+'>All players</option>')+playerOpts+"</select></label>"+
      "</div>";
    var actions='<button class="btn btn-small" data-act="print-card">Print report card</button>'+
      '<button class="btn btn-outline btn-small" data-act="mailto-card">Email draft (this player)</button>'+
      '<button class="btn btn-outline btn-small" data-act="print-team-fitness">Print team fitness report</button>'+
      '<button class="btn btn-ghost btn-small" data-act="mailto-team-fitness">Email draft (whole team)</button>';
    var body=view==="entry"?viewAssessEntry(shown,periods,pid):view==="card"?viewAssessCard(pid):viewAssessGrid(players,periods,shown);
    return pageHead("Fitness tests & assessment","Quarterly battery, squad rankings and report cards. Sample data only. Green ▲ improved, red ▼ dropped.", actions)+
      tabs+body+
      '<p class="help">CF = result carried forward from the previous period (for example if a player was injured). Rankings are calculated within this team only. This is a prototype, not official club records.</p>';
  }

  function viewAssessGrid(players, periods, shown){
    shown=shown||players;
    if(!players.length) return "<p>No players in this team. Add players on the Roster tab, or sign in as a coach who has a sample squad (Selena for U9 Girls, David Crisp for the Under 14s).</p>";
    var tests=testsList();
    var maps={};
    periods.forEach(function(per){ maps[per.id]=rankMaps(per.id, players); });
    var heads=periods.map(function(per){ return "<th>"+esc(per.name)+"</th>"; }).join("");
    function row(label, kind, testId, group, player){
      var cells=periods.map(function(per, idx){
        var prev=idx>0?periods[idx-1]:null;
        var rec=testId?testResult(player.id, per.id, testId):null;
        var rank, prevRank;
        if(kind==="overall"){ rank=maps[per.id].overall[player.id]; prevRank=prev?maps[prev.id].overall[player.id]:null; }
        else if(kind==="group"){ rank=maps[per.id][group][player.id]; prevRank=prev?maps[prev.id][group][player.id]:null; }
        else { rank=maps[per.id].perTest[testId]?maps[per.id].perTest[testId][player.id]:null; prevRank=prev&&maps[prev.id].perTest[testId]?maps[prev.id].perTest[testId][player.id]:null; }
        return "<td>"+rankCellHtml(rank, prevRank, rec)+"</td>";
      }).join("");
      var cls=kind==="overall"?" class=\"rc-overall-row\"":(kind==="group"?" class=\"rc-group-row\"":"");
      return "<tr"+cls+"><th>"+label+"</th>"+cells+"</tr>";
    }
    var blocks=shown.map(function(p){
      var body=row("Overall","overall",null,null,p)+
        row("Fitness (7 tests)","group",null,"fitness",p)+
        tests.filter(function(t){ return t.group==="fitness"; }).map(function(t){ return row(esc(t.name)+(t.unit?" ("+esc(t.unit)+")":""),"test",t.id,null,p); }).join("")+
        row("Ball skills (4 tests)","group",null,"ball",p)+
        tests.filter(function(t){ return t.group==="ball"; }).map(function(t){ return row(esc(t.name)+(t.unit?" ("+esc(t.unit)+")":""),"test",t.id,null,p); }).join("");
      return '<h3 class="rc-player-head">'+esc(p.name)+"</h3>"+
        '<div class="table-wrap"><table class="data assess-grid"><thead><tr><th>Test / ranking</th>'+heads+"</tr></thead><tbody>"+body+"</tbody></table></div>";
    }).join("");
    var latest=periods.filter(function(per){ return maps[per.id] && Object.keys(maps[per.id].overall).length; });
    var a=latest.length>=2?latest[latest.length-2]:null;
    var b=latest.length?latest[latest.length-1]:null;
    var stats="";
    if(a&&b&&shown.length===players.length){
      var up=0,down=0,same=0;
      players.forEach(function(p){
        var r0=maps[a.id].overall[p.id], r1=maps[b.id].overall[p.id];
        if(r0==null||r1==null) return;
        if(r1<r0) up++; else if(r1>r0) down++; else same++;
      });
      stats='<div class="stats">'+stat(up,"Improved overall ("+esc(a.name)+" → "+esc(b.name)+")")+stat(down,"Dropped overall")+stat(same,"Unchanged")+"</div>";
    }
    return stats+blocks;
  }

  function viewAssessEntry(players, periods, periodId){
    var per=periodById(periodId)||periods[0];
    if(!per) return "<p>Add a period in Settings first.</p>";
    var prev=previousPeriod(per.id);
    var tests=testsList();
    var heads=tests.map(function(t){ return "<th>"+esc(t.name)+"<br><span class=\"help\">"+esc(t.unit)+" · "+(t.lowerIsBetter?"lower better":"higher better")+"</span></th>"; }).join("");
    var rows=players.map(function(p){
      var cells=tests.map(function(t){
        var rec=testResult(p.id, per.id, t.id);
        var v=rec&&rec.value!=null?rec.value:"";
        var cf=rec&&rec.carriedForward;
        return "<td><input class=\"assess-val\" data-act=\"test-val\" data-pid=\""+p.id+"\" data-per=\""+per.id+"\" data-tid=\""+t.id+"\" value=\""+esc(v)+"\" inputmode=\"decimal\">"+
          '<label class="help cf-lab"><input type="checkbox" data-act="test-carry" data-pid="'+p.id+'" data-per="'+per.id+'" data-tid="'+t.id+'"'+(cf?" checked":"")+(prev?"":" disabled")+"> CF</label></td>";
      }).join("");
      return "<tr><th>"+esc(p.name)+"</th>"+cells+"</tr>";
    }).join("");
    return '<div class="card" style="margin-bottom:1rem"><p><strong>Entering results for '+esc(per.name)+"</strong> ("+esc(periodDateLabel(per))+"). Tick <strong>CF</strong> to carry forward the previous period’s result (for example if a player was injured and could not complete a test). Test names and units can be edited in Settings.</p></div>"+
      '<div class="table-wrap"><table class="data assess-entry"><thead><tr><th>Player</th>'+heads+"</tr></thead><tbody>"+(rows||"<tr><td>No players.</td></tr>")+"</tbody></table></div>";
  }

  function viewAssessCard(periodId){
    var player=playerById(assessPlayerId());
    var per=periodById(periodId);
    if(!player||!per) return "<p>Select a player and a period.</p>";
    return reportCardHTML(player, per, true)+
      '<div class="no-print toolbar" style="margin-top:1rem">'+
      '<button class="btn" data-act="print-card">Print / save as PDF</button>'+
      '<button class="btn btn-outline" data-act="mailto-card">Open email draft</button>'+
      '<button class="btn btn-ghost" data-act="dl-card">Download HTML</button></div>';
  }

  function reportCardHTML(player, per, editable){
    var rec=ensureReportCard(player.id, per.id);
    var maps=rankMaps(per.id, teamPlayers());
    var att=attendanceForPeriod(player.id, per);
    var crit=[
      { key:"attendance", title:"Attendance", measure:"Measurement - actual times at training & Game Days",
        metrics:"Train "+att.train.pct+"%"+(att.train.total?" ("+att.train.present+" of "+att.train.total+")":"")+"<br>Games "+att.games.pct+"%"+(att.games.total?" ("+att.games.present+" of "+att.games.total+")":"") },
      { key:"fitness", title:"Fitness", measure:"Measurement - set of 7 tests",
        metrics:maps.fitness[player.id]?"Ranked "+esc(nth(maps.fitness[player.id])):"—" },
      { key:"ballSkills", title:"Ball Skills", measure:"Measurement - set of 4 tests",
        metrics:maps.ball[player.id]?"Ranked "+esc(nth(maps.ball[player.id])):"—" },
      { key:"gameDay", title:"Game Day Impact", measure:"Measurement - Coaches view based on game contribution", metrics:"" },
      { key:"attitude", title:"Attitude/Behaviour", measure:"Measurement - Coaches view based on training/game days", metrics:"" },
      { key:"parents", title:"Parents", measure:"Measurement - Coaches view on overall interactions", metrics:"" }
    ];
    var rows=crit.map(function(c){
      var item=(rec.criteria&&rec.criteria[c.key])||{status:"ON TRACK",feedback:""};
      var status=editable?'<select data-act="rc-crit" data-k="status" data-ck="'+c.key+'" data-pid="'+player.id+'" data-per="'+per.id+'">'+statusOptions(item.status)+"</select>":'<strong class="rc-status">'+esc(item.status||"")+"</strong>";
      var fb=editable?'<textarea data-act="rc-crit" data-k="feedback" data-ck="'+c.key+'" data-pid="'+player.id+'" data-per="'+per.id+'" rows="3">'+esc(item.feedback||"")+"</textarea>":esc(item.feedback||"");
      return "<tr><td><strong>"+c.title+"</strong><br><span class=\"help\">"+c.measure+"</span></td><td>"+status+"</td><td>"+c.metrics+"</td><td>"+fb+"</td></tr>";
    }).join("");
    var rating=editable?'<select data-act="rc-rating" data-pid="'+player.id+'" data-per="'+per.id+'">'+statusOptions(rec.overallRating)+"</select>":'<span class="rc-rating">'+esc(rec.overallRating||"")+"</span>";
    var notes=editable?'<textarea data-act="rc-notes" data-pid="'+player.id+'" data-per="'+per.id+'" rows="3">'+esc(rec.notes||"")+"</textarea>":esc(rec.notes||"");
    var carried=(db.testResults||[]).filter(function(r){ return r.playerId===player.id && r.periodId===per.id && r.carriedForward; }).map(function(r){ var t=testById(r.testId); return t?t.name:r.testId; });
    return '<div class="rc-sheet" id="report-card">'+
      '<p class="rc-conf">CONFIDENTIAL - Do not Share</p>'+
      '<p class="rc-kicker">HUME CITY FC - 2026 Girls Program '+esc(team().name)+' Squad</p>'+
      '<p class="rc-period">'+esc(per.name)+' Report Card Period - '+esc(periodDateLabel(per))+"</p>"+
      '<div class="rc-meta"><div><span class="help">Player Name</span><strong>'+esc(player.name)+"</strong></div>"+
      '<div><span class="help">Overall Rating</span>'+rating+"</div></div>"+
      '<table class="rc-table"><thead><tr><th>Criteria Reviewed</th><th>Status</th><th>Ranking/Metrics</th><th>Feedback and How could be even better</th></tr></thead><tbody>'+rows+"</tbody></table>"+
      '<div class="rc-notes"><strong>Notes</strong>'+(carried.length && !rec.notes ? '<p class="help">Carried-forward tests: '+esc(carried.join(", "))+"</p>":"")+notes+"</div>"+
      '<p class="help rc-foot">Prototype sample report card — not an official Hume City FC record. Rankings are within this squad only.</p></div>';
  }

  function fitnessReportText(players, per, comment){
    players=players||teamPlayers();
    per=per||periodById(assessPeriodId());
    var maps=rankMaps(per.id, teamPlayers());
    var prev=previousPeriod(per.id);
    var prevMaps=prev?rankMaps(prev.id, teamPlayers()):null;
    var lines=[];
    lines.push("Hume City FC Girls Program — fitness tests & assessment (SAMPLE / PROTOTYPE)");
    lines.push("CONFIDENTIAL - Do not Share");
    lines.push("Team: "+team().name+" Squad");
    lines.push(per.name+" Report Card Period - "+periodDateLabel(per));
    lines.push("Coach: "+currentCoach().name+" ("+currentCoach().role+")");
    lines.push("");
    players.forEach(function(p){
      var rec=reportCardRec(p.id, per.id)||ensureReportCard(p.id, per.id);
      var att=attendanceForPeriod(p.id, per);
      lines.push(p.name);
      lines.push("Overall rating: "+(rec.overallRating||"—"));
      lines.push("Overall squad ranking: "+(maps.overall[p.id]?nth(maps.overall[p.id]):"—")+(prevMaps&&prevMaps.overall[p.id]&&maps.overall[p.id] ? (maps.overall[p.id]<prevMaps.overall[p.id]?" (improved from "+nth(prevMaps.overall[p.id])+")":maps.overall[p.id]>prevMaps.overall[p.id]?" (dropped from "+nth(prevMaps.overall[p.id])+")":" (unchanged)"):""));
      lines.push("Attendance: Train "+att.train.pct+"% ("+att.train.present+" of "+att.train.total+"), Games "+att.games.pct+"% ("+att.games.present+" of "+att.games.total+")");
      lines.push("Fitness ranking: "+(maps.fitness[p.id]?nth(maps.fitness[p.id]):"—")+" | Ball skills ranking: "+(maps.ball[p.id]?nth(maps.ball[p.id]):"—"));
      testsList().forEach(function(t){
        var r=testResult(p.id, per.id, t.id);
        var rank=maps.perTest[t.id]?maps.perTest[t.id][p.id]:null;
        var prevRank=prevMaps&&prevMaps.perTest[t.id]?prevMaps.perTest[t.id][p.id]:null;
        var ch="";
        if(rank&&prevRank){ ch=rank<prevRank?" ▲ improved":rank>prevRank?" ▼ dropped":" →"; }
        var val=r&&r.value!==""&&r.value!=null?r.value:"—";
        lines.push("  - "+t.name+": "+val+(t.unit?" "+t.unit:"")+"  ranked "+(rank?nth(rank):"—")+ch+(r&&r.carriedForward?" (carried forward)":""));
      });
      if(rec.notes) lines.push("Notes: "+rec.notes);
      if(comment) lines.push("Coach comment: "+comment);
      lines.push("");
    });
    lines.push("Concerns or feedback: "+tdLabel()+", "+td().email+". "+policiesNote());
    lines.push("This is a prototype report generated from sample data. It is not an official club communication. Nothing has been sent automatically.");
    return lines.join("\n");
  }

  function openFitnessReportModal(players, per, bulk){
    var text=fitnessReportText(players, per, "");
    var emails=[];
    players.forEach(function(p){ if(p.email) emails.push(p.email); if(p.guardian1&&p.guardian1.email) emails.push(p.guardian1.email); });
    state._fitnessReport={ players:players, text:text, emails:emails, bulk:!!bulk, period:per };
    state.modal="<h2>"+(bulk?"Team fitness report preview":"Fitness report preview")+"</h2>"+
      '<p class="help">Sample / prototype only. This opens an email draft or a printable view. Nothing is sent automatically.</p>'+
      '<pre class="report-pre" style="white-space:pre-wrap;padding:1rem;border-radius:8px;max-height:40vh;overflow:auto">'+esc(text)+"</pre>"+
      '<div class="toolbar">'+
      '<button class="btn" data-act="mailto-fitness">Open email draft</button>'+
      '<button class="btn btn-outline" data-act="copy-fitness">Copy report</button>'+
      '<button class="btn btn-outline" data-act="print-fitness-text">Print</button>'+
      '<button class="btn btn-ghost" data-act="close-modal">Close</button></div>';
    render(true);
  }

  function printReportCard(){
    state.assessView="card";
    render();
    setTimeout(function(){ window.print(); }, 200);
  }

  function viewFitness(){
    var rows=teamPlayers().map(function(p){
      var cells=db.metrics.map(function(m){
        var first, prev, last;
        db.periods.forEach(function(per){
          var a=assessment(p.id,per.id,m.id);
          if(a&&a.value!==""&&a.value!=null){ if(first==null) first=a.value; prev=last; last=a.value; }
        });
        var vsFirst=changeInfo(first,last,m.lowerIsBetter);
        var vsPrev=changeInfo(prev,last,m.lowerIsBetter);
        function mark(ch){ if(!ch) return "—"; if(ch.same) return "0%"; var cls=ch.improved?"up":"down"; var arrow=ch.improved?"▲":"▼"; return '<span class="'+cls+'">'+arrow+" "+(ch.pct>0?"+":"")+ch.pct+"%</span>"; }
        var inputs=db.periods.map(function(per){
          var a=assessment(p.id,per.id,m.id); var v=a?a.value:"";
          return '<label class="help">'+esc(per.name)+'<input data-act="assess" data-pid="'+p.id+'" data-per="'+per.id+'" data-met="'+m.id+'" value="'+esc(v)+'" style="width:4.4rem"></label>';
        }).join(" ");
        return "<td>"+sparkline(p.id,m)+"<br>"+inputs+"<br>vs first "+mark(vsFirst)+" · vs prev "+mark(vsPrev)+"</td>";
      }).join("");
      return "<tr><td><strong>"+esc(p.name)+"</strong></td>"+cells+"</tr>";
    }).join("");
    var heads=db.metrics.map(function(m){ return "<th>"+esc(m.name)+" ("+esc(m.unit)+")<br><span class=\"help\">"+(m.lowerIsBetter?"Lower is better":"Higher is better")+"</span></th>"; }).join("");
    return pageHead("Fitness tracker","Periods and tests are configurable in Settings — they are not hardcoded.")+
      '<p class="note">Green / ▲ means improvement in the direction set for that test. Red / ▼ means a decline. Figures are sample data.</p>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Player</th>'+heads+"</tr></thead><tbody>"+rows+"</tbody></table></div>";
  }

  function viewMedical(){
    var follow=0;
    var list=db.medical.filter(function(m){
      var p=playerById(m.playerId);
      if(!p||p.teamId!==teamId()) return false;
      if(m.needsFollowUp&&m.status!=="Cleared") follow++;
      if(state.medFlagged && !(m.needsFollowUp&&m.status!=="Cleared")) return false;
      return true;
    });
    var rows=list.map(function(m){
      var p=playerById(m.playerId);
      return "<tr><td>"+esc(p.name)+"</td><td>"+fmtDate(m.date)+"</td><td>"+esc(m.type)+"</td><td>"+esc(m.description)+"</td><td>"+esc(m.status)+"</td><td>"+
        (m.needsFollowUp?'<span class="alert-dot"></span>Yes · '+fmtDate(m.followUpDate):"No")+"</td>"+
        '<td><button class="btn btn-ghost btn-small" data-act="edit-med" data-id="'+m.id+'">Edit</button> <button class="btn btn-ghost btn-small" data-act="del-med" data-id="'+m.id+'">Delete</button></td></tr>';
    }).join("");
    return pageHead("Injury and medical notes","Sensitive health information")+
      '<div class="sensitive-note"><strong>Sensitive health information.</strong> In production this area should be restricted to the head coach and encrypted. This prototype stores notes only in this browser. Sample entries only.</div>'+
      '<div class="stats">'+stat(follow,"Need follow-up")+stat(list.length,"Notes in this view")+"</div>"+
      '<div class="filters"><label><input type="checkbox" id="med-flag"'+(state.medFlagged?" checked":"")+"> Show flagged follow-ups only</label>"+
      '<button class="btn btn-small" data-act="add-med">Add note</button></div>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Player</th><th>Date</th><th>Type</th><th>Description</th><th>Status</th><th>Follow-up</th><th></th></tr></thead><tbody>'+
      (rows||"<tr><td colspan='7'>No notes.</td></tr>")+"</tbody></table></div>";
  }
  function medForm(m){
    m=m||{playerId:(teamPlayers()[0]||{}).id,date:todayISO(),type:"",description:"",status:"Active",needsFollowUp:false,followUpDate:""};
    var opts=teamPlayers().map(function(p){ return '<option value="'+p.id+'"'+(p.id===m.playerId?" selected":"")+'>'+esc(p.name)+'</option>'; }).join("");
    state.modal="<h2>"+(m.id?"Edit":"Add")+" medical note</h2>"+
      '<div class="sensitive-note">Prototype only. Do not enter real medical details.</div>'+
      '<form id="med-form" class="form">'+
      '<div class="field"><label>Player</label><select name="playerId">'+opts+"</select></div>"+
      '<div class="grid-2"><div class="field"><label>Date</label><input name="date" type="date" value="'+esc(m.date)+'"></div>'+
      '<div class="field"><label>Type</label><input name="type" value="'+esc(m.type)+'"></div></div>'+
      '<div class="field"><label>Description</label><textarea name="description">'+esc(m.description)+"</textarea></div>"+
      '<div class="field"><label>Status</label><select name="status"><option>Active</option><option>Recovering</option><option>Cleared</option></select></div>'+
      '<label><input type="checkbox" name="needsFollowUp"'+(m.needsFollowUp?" checked":"")+"> Needs follow-up</label>"+
      '<div class="field"><label>Follow-up date</label><input name="followUpDate" type="date" value="'+esc(m.followUpDate)+'"></div>'+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    var f=document.getElementById("med-form"); f.status.value=m.status;
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var rec={playerId:f.playerId.value,date:f.date.value,type:f.type.value,description:f.description.value,status:f.status.value,needsFollowUp:f.needsFollowUp.checked,followUpDate:f.followUpDate.value};
      if(m.id){ rec.id=m.id; db.medical=db.medical.map(function(x){ return x.id===m.id?rec:x; }); }
      else { rec.id=HCFC.uid("med"); db.medical.push(rec); }
      persist(); closeModal(); toast("Medical note saved locally (sample / prototype).");
    });
  }

  function viewMatches(){
    var ms=db.matches.filter(function(m){ return m.teamId===teamId(); }).sort(function(a,b){ return a.date<b.date?1:-1; });
    var P=ms.length,W=0,D=0,L=0,GF=0,GA=0;
    ms.forEach(function(m){ if(m.result==="W")W++; else if(m.result==="D")D++; else if(m.result==="L")L++; GF+=Number(m.scoreFor||0); GA+=Number(m.scoreAgainst||0); });
    var scorers={};
    db.matchStats.forEach(function(s){
      var match=db.matches.filter(function(m){ return m.id===s.matchId; })[0];
      if(!match||match.teamId!==teamId()) return;
      if(!scorers[s.playerId]) scorers[s.playerId]={goals:0,assists:0,minutes:0};
      scorers[s.playerId].goals+=Number(s.goals||0); scorers[s.playerId].assists+=Number(s.assists||0); scorers[s.playerId].minutes+=Number(s.minutes||0);
    });
    var top=Object.keys(scorers).map(function(id){ return {p:playerById(id),s:scorers[id]}; }).filter(function(x){ return x.p; }).sort(function(a,b){ return b.s.goals-a.s.goals; });
    var matchRows=ms.map(function(m){
      return "<tr><td>"+fmtDate(m.date)+"</td><td>"+esc(m.opponent)+"</td><td>"+esc(m.homeAway)+"</td><td>"+m.scoreFor+"–"+m.scoreAgainst+"</td><td>"+m.result+"</td>"+
        '<td><button class="btn btn-ghost btn-small" data-act="edit-match" data-id="'+m.id+'">Edit / stats</button> <button class="btn btn-ghost btn-small" data-act="del-match" data-id="'+m.id+'">Delete</button></td></tr>';
    }).join("");
    var topRows=top.map(function(x){ return "<tr><td>"+esc(x.p.name)+"</td><td>"+x.s.goals+"</td><td>"+x.s.assists+"</td><td>"+x.s.minutes+"</td></tr>"; }).join("");
    return pageHead("Match results","Sample opponents only",'<button class="btn btn-small" data-act="add-match">Add result</button>')+
      '<div class="stats">'+stat(P,"Played")+stat(W,"Won")+stat(D,"Drawn")+stat(L,"Lost")+stat(GF,"GF")+stat(GA,"GA")+stat(GF-GA,"GD")+"</div>"+
      '<div class="grid-2"><div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>Opponent</th><th>H/A</th><th>Score</th><th>R</th><th></th></tr></thead><tbody>'+
      (matchRows||"<tr><td colspan='6'>No matches.</td></tr>")+"</tbody></table></div>"+
      '<div><h2>Player stats / top scorers</h2><div class="table-wrap"><table class="data"><thead><tr><th>Player</th><th>Goals</th><th>Assists</th><th>Minutes</th></tr></thead><tbody>'+
      (topRows||"<tr><td colspan='4'>No stats yet.</td></tr>")+"</tbody></table></div></div></div>";
  }
  function matchForm(m){
    m=m||{date:todayISO(),opponent:"",homeAway:"Home",scoreFor:0,scoreAgainst:0,result:"W"};
    var stats=teamPlayers().map(function(p){
      var s=(m.id?db.matchStats.filter(function(x){ return x.matchId===m.id&&x.playerId===p.id; })[0]:null)||{goals:0,assists:0,minutes:0};
      return '<tr><td>'+esc(p.name)+'</td>'+
        '<td><input name="g-'+p.id+'" type="number" min="0" value="'+s.goals+'" style="width:4rem"></td>'+
        '<td><input name="a-'+p.id+'" type="number" min="0" value="'+s.assists+'" style="width:4rem"></td>'+
        '<td><input name="min-'+p.id+'" type="number" min="0" value="'+s.minutes+'" style="width:5rem"></td></tr>';
    }).join("");
    state.modal="<h2>"+(m.id?"Edit match":"Add match")+"</h2><form id='match-form' class='form'>"+
      '<div class="grid-2"><div class="field"><label>Date</label><input name="date" type="date" value="'+esc(m.date)+'"></div>'+
      '<div class="field"><label>Opponent</label><input name="opponent" value="'+esc(m.opponent)+'" placeholder="Sample opponent name"></div>'+
      '<div class="field"><label>Home or away</label><select name="homeAway"><option>Home</option><option>Away</option></select></div>'+
      '<div class="field"><label>Score for</label><input name="scoreFor" type="number" min="0" value="'+esc(m.scoreFor)+'"></div>'+
      '<div class="field"><label>Score against</label><input name="scoreAgainst" type="number" min="0" value="'+esc(m.scoreAgainst)+'"></div>'+
      '<div class="field"><label>Result</label><select name="result"><option>W</option><option>D</option><option>L</option></select></div></div>'+
      '<h3>Per-player stats</h3><div class="table-wrap"><table class="data"><thead><tr><th>Player</th><th>Goals</th><th>Assists</th><th>Minutes</th></tr></thead><tbody>'+stats+"</tbody></table></div>"+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    var f=document.getElementById("match-form"); f.homeAway.value=m.homeAway; f.result.value=m.result;
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var rec={teamId:teamId(),date:f.date.value,opponent:f.opponent.value,homeAway:f.homeAway.value,scoreFor:Number(f.scoreFor.value||0),scoreAgainst:Number(f.scoreAgainst.value||0),result:f.result.value};
      rec.id=m.id||HCFC.uid("m");
      if(m.id) db.matches=db.matches.map(function(x){ return x.id===m.id?rec:x; }); else db.matches.push(rec);
      db.matchStats=db.matchStats.filter(function(s){ return s.matchId!==rec.id; });
      teamPlayers().forEach(function(p){ db.matchStats.push({matchId:rec.id,playerId:p.id,goals:Number(f["g-"+p.id].value||0),assists:Number(f["a-"+p.id].value||0),minutes:Number(f["min-"+p.id].value||0)}); });
      persist(); closeModal(); toast("Match saved.");
    });
  }

  function fixtureDateTime(f){ return new Date(f.date+"T"+(f.time||"00:00")+":00"); }
  function countdown(f){
    var ms=fixtureDateTime(f)-new Date();
    if(isNaN(ms)) return "Date to be confirmed";
    if(ms<0) return "Played / past";
    var d=Math.floor(ms/86400000), h=Math.floor((ms%86400000)/3600000), m=Math.floor((ms%3600000)/60000);
    if(d>0) return "In "+d+" day"+(d===1?"":"s")+", "+h+" hr";
    if(h>0) return "In "+h+" hr "+m+" min";
    return "In "+m+" min";
  }
  function viewFixtures(){
    var list=db.fixtures.filter(function(f){ return f.teamId===teamId(); }).sort(function(a,b){ return fixtureDateTime(a)-fixtureDateTime(b); });
    var upcoming=list.filter(function(f){ return fixtureDateTime(f)>=new Date(); });
    var next=upcoming[0];
    var cards=list.map(function(f){
      var isNext=next&&f.id===next.id;
      var link=f.matchId
        ? '<button class="btn btn-outline btn-small" data-act="goto-match" data-id="'+f.matchId+'">View match result</button>'
        : '<button class="btn btn-outline btn-small" data-act="result-from-fx" data-id="'+f.id+'">Record result</button>';
      return '<article class="card'+(isNext?" fixture-next":"")+'">'+
        (f.isSample?'<span class="badge badge-warn">Sample fixture</span> ':"")+
        (isNext?'<span class="badge badge-red">Next match</span>':"")+
        "<h3>"+esc(f.homeTeam)+" vs "+esc(f.awayTeam)+"</h3>"+
        "<p>"+fmtDate(f.date)+" · "+esc(f.time||"")+" · "+esc(f.round)+"<br>"+
        esc(f.venue)+(f.field?", "+esc(f.field):"")+"<br>"+esc(f.competition)+" · "+esc(f.ageGroup)+"</p>"+
        (isNext?'<p class="countdown">'+countdown(f)+"</p>":"<p>"+countdown(f)+"</p>")+
        '<div class="toolbar">'+link+
        '<button class="btn btn-ghost btn-small" data-act="ics-one" data-id="'+f.id+'">Add to calendar (.ics)</button>'+
        '<button class="btn btn-ghost btn-small" data-act="edit-fx" data-id="'+f.id+'">Edit</button>'+
        '<button class="btn btn-ghost btn-small" data-act="del-fx" data-id="'+f.id+'">Delete</button></div></article>';
    }).join("");
    return pageHead("Fixtures","Import a Dribl Events export, or add fixtures by hand",
      '<button class="btn btn-small" data-act="add-fx">Add fixture</button>'+
      '<label class="btn btn-outline btn-small">Import Dribl fixtures (CSV)<input type="file" accept=".csv,text/csv" hidden id="import-dribl"></label>'+
      '<button class="btn btn-ghost btn-small" data-act="ics-all">Download all upcoming .ics</button>')+
      (next?'<p class="note">Next match: <strong>'+esc(next.homeTeam)+" vs "+esc(next.awayTeam)+"</strong> — "+countdown(next)+". Sample fixtures are labelled.</p>":"<p>No upcoming fixtures for this team.</p>")+
      '<div class="warn-note">Dribl has no documented public API. Export events from <strong>app.dribl.com</strong> via Events → Filter → Export → Exports → Download, then import the file here. Automatic sync would need official API access from Dribl or Football Victoria. This tool does not scrape Dribl. A sample CSV is in <code>coach/sample/dribl-fixtures-sample.csv</code>.</div>'+
      '<div class="grid-2" style="margin-top:1rem">'+(cards||"<p>No fixtures yet.</p>")+"</div>";
  }
  function fxForm(f){
    f=f||{date:"",time:"10:00",round:"",homeTeam:"Hume City FC "+team().name+" (sample)",awayTeam:"",venue:"",field:"",competition:"",ageGroup:team().name,isSample:true,matchId:""};
    state.modal="<h2>"+(f.id?"Edit fixture":"Add fixture")+"</h2><form id='fx-form' class='form'><div class='grid-2'>"+
      '<div class="field"><label>Date</label><input name="date" type="date" value="'+esc(f.date)+'" required></div>'+
      '<div class="field"><label>Time</label><input name="time" type="time" value="'+esc(f.time)+'"></div>'+
      '<div class="field"><label>Round</label><input name="round" value="'+esc(f.round)+'"></div>'+
      '<div class="field"><label>Home team</label><input name="homeTeam" value="'+esc(f.homeTeam)+'"></div>'+
      '<div class="field"><label>Away team</label><input name="awayTeam" value="'+esc(f.awayTeam)+'"></div>'+
      '<div class="field"><label>Venue / ground</label><input name="venue" value="'+esc(f.venue)+'"></div>'+
      '<div class="field"><label>Field</label><input name="field" value="'+esc(f.field)+'"></div>'+
      '<div class="field"><label>League / competition</label><input name="competition" value="'+esc(f.competition)+'"></div>'+
      '<div class="field"><label>Age group</label><input name="ageGroup" value="'+esc(f.ageGroup)+'"></div></div>'+
      '<label><input type="checkbox" name="isSample"'+(f.isSample?" checked":"")+"> Mark as sample fixture</label>"+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    document.getElementById("fx-form").addEventListener("submit", function(e){
      e.preventDefault();
      var fom=e.target;
      var rec={teamId:teamId(),date:fom.date.value,time:fom.time.value,round:fom.round.value,homeTeam:fom.homeTeam.value,awayTeam:fom.awayTeam.value,venue:fom.venue.value,field:fom.field.value,competition:fom.competition.value,ageGroup:fom.ageGroup.value,isSample:fom.isSample.checked,matchId:f.matchId||""};
      rec.id=f.id||HCFC.uid("fx");
      if(f.id) db.fixtures=db.fixtures.map(function(x){ return x.id===f.id?rec:x; }); else db.fixtures.push(rec);
      persist(); closeModal(); toast("Fixture saved.");
    });
  }
  function icsFor(list){
    function stamp(d){ function z(n){ return String(n).padStart(2,"0"); } return d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+"T"+z(d.getHours())+z(d.getMinutes())+"00"; }
    var ev=list.map(function(f){
      var start=fixtureDateTime(f); var end=new Date(start.getTime()+90*60000);
      return "BEGIN:VEVENT\nUID:"+f.id+"@hcfc-prototype.local\nDTSTAMP:"+stamp(new Date())+"\nDTSTART;TZID=Australia/Melbourne:"+stamp(start)+"\nDTEND;TZID=Australia/Melbourne:"+stamp(end)+"\nSUMMARY:"+(f.homeTeam+" vs "+f.awayTeam).replace(/\n/g," ")+"\nLOCATION:"+[f.venue,f.field].filter(Boolean).join(", ")+"\nDESCRIPTION:"+(f.isSample?"SAMPLE fixture. ":"")+(f.round||"")+" "+(f.competition||"")+"\nEND:VEVENT";
    }).join("\n");
    return "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Hume City FC Girls Coach Dashboard//EN\nCALSCALE:GREGORIAN\n"+ev+"\nEND:VCALENDAR\n";
  }
  function normaliseDate(s){
    s=String(s||"").trim();
    var m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if(m){ var y=m[3].length===2?"20"+m[3]:m[3]; return y+"-"+String(m[2]).padStart(2,"0")+"-"+String(m[1]).padStart(2,"0"); }
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
    return s;
  }
  function driblMapper(headers, rows){
    var fields=[["date","Date"],["time","Time"],["round","Round"],["homeTeam","Home team"],["awayTeam","Away team"],["venue","Venue / ground"],["field","Field"],["competition","League / competition"],["ageGroup","Age group"]];
    var saved=db.settings.driblFixtureMap||{};
    function guess(key,label){
      var want=(saved[key]||label).toLowerCase();
      var found=headers.filter(function(h){ return h.toLowerCase()===want || h.toLowerCase().indexOf(want.split(" ")[0])!==-1; })[0];
      return found||saved[key]||"";
    }
    var selects=fields.map(function(f){
      var g=guess(f[0],f[1]);
      var opts=['<option value="">— skip —</option>'].concat(headers.map(function(h){ return "<option"+(h===g?" selected":"")+">"+esc(h)+"</option>"; })).join("");
      return '<div class="field"><label>'+f[1]+'</label><select name="'+f[0]+'">'+opts+"</select></div>";
    }).join("");
    state.modal="<h2>Map Dribl CSV columns</h2><p>Headers in a Dribl export can vary. Map them once; the mapping is saved in this browser.</p>"+
      '<form id="map-form" class="form"><div class="grid-2">'+selects+"</div>"+
      "<p class='help'>First rows preview: "+esc(rows.slice(0,2).map(function(r){ return r.join(" | "); }).join(" / "))+"</p>"+
      '<div class="toolbar"><button class="btn" type="submit">Import fixtures</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    document.getElementById("map-form").addEventListener("submit", function(e){
      e.preventDefault();
      var form=e.target, map={};
      fields.forEach(function(f){ map[f[0]]=form[f[0]].value; });
      db.settings.driblFixtureMap=map;
      var idx={}; headers.forEach(function(h,i){ idx[h]=i; });
      var added=0;
      rows.forEach(function(r){
        function cell(k){ return map[k]&&idx[map[k]]!=null?String(r[idx[map[k]]]||"").trim():""; }
        if(!cell("date")&&!cell("homeTeam")) return;
        db.fixtures.push({ id:HCFC.uid("fx"), teamId:teamId(), date:normaliseDate(cell("date")), time:cell("time")||"10:00",
          round:cell("round"), homeTeam:cell("homeTeam"), awayTeam:cell("awayTeam"), venue:cell("venue"),
          field:cell("field"), competition:cell("competition"), ageGroup:cell("ageGroup")||team().name, isSample:true, matchId:"" });
        added++;
      });
      persist(); closeModal(); toast("Imported "+added+" fixtures (marked sample until you uncheck that).");
    });
  }

  function viewSessions(){
    var plans=db.sessionPlans.filter(function(p){ return p.teamId===teamId(); });
    var cards=plans.map(function(p){
      return '<article class="card" id="plan-'+p.id+'"><span class="badge">Sample / editable</span><h3>'+esc(p.week)+" · "+fmtDate(p.date)+"</h3>"+
        "<p><strong>Focus:</strong> "+esc(p.theme)+"</p>"+
        "<p><strong>Warm-up:</strong> "+esc(p.warmup)+"</p>"+
        "<p><strong>Main activities:</strong><br>"+(p.activities||[]).map(function(a){ return esc(a.duration)+" — "+esc(a.name); }).join("<br>")+"</p>"+
        "<p><strong>Game:</strong> "+esc(p.game)+"<br><strong>Cool-down:</strong> "+esc(p.cooldown)+"<br><strong>Equipment:</strong> "+esc(p.equipment)+"</p>"+
        "<p><strong>Coach notes:</strong> "+esc(p.notes)+"</p>"+
        '<div class="toolbar no-print"><button class="btn btn-ghost btn-small" data-act="edit-plan" data-id="'+p.id+'">Edit</button>'+
        '<button class="btn btn-ghost btn-small" data-act="dup-plan" data-id="'+p.id+'">Duplicate week</button>'+
        '<button class="btn btn-ghost btn-small" data-act="print-plan">Print</button>'+
        '<button class="btn btn-ghost btn-small" data-act="del-plan" data-id="'+p.id+'">Delete</button></div></article>';
    }).join("");
    return pageHead("Weekly session plans","Fill in, duplicate a previous week, or print",
      '<button class="btn btn-small" data-act="add-plan">New plan</button>')+(cards||"<p>No plans yet.</p>");
  }
  function planForm(p){
    p=p||{week:"",date:todayISO(),theme:"",warmup:"",activities:[{name:"",duration:"10 min"},{name:"",duration:"15 min"}],game:"",cooldown:"",equipment:"",notes:""};
    var acts=(p.activities||[]).map(function(a,i){
      return '<div class="grid-2"><div class="field"><label>Activity '+(i+1)+'</label><input name="actn'+i+'" value="'+esc(a.name)+'"></div><div class="field"><label>Duration</label><input name="actd'+i+'" value="'+esc(a.duration)+'"></div></div>';
    }).join("");
    state.modal="<h2>"+(p.id?"Edit plan":"New session plan")+"</h2><form id='plan-form' class='form'>"+
      '<div class="grid-2"><div class="field"><label>Week</label><input name="week" value="'+esc(p.week)+'"></div>'+
      '<div class="field"><label>Date</label><input name="date" type="date" value="'+esc(p.date)+'"></div></div>'+
      '<div class="field"><label>Focus / theme</label><input name="theme" value="'+esc(p.theme)+'"></div>'+
      '<div class="field"><label>Warm-up</label><textarea name="warmup">'+esc(p.warmup)+"</textarea></div>"+acts+
      '<div class="field"><label>Game</label><textarea name="game">'+esc(p.game)+"</textarea></div>"+
      '<div class="field"><label>Cool-down</label><textarea name="cooldown">'+esc(p.cooldown)+"</textarea></div>"+
      '<div class="field"><label>Equipment needed</label><input name="equipment" value="'+esc(p.equipment)+'"></div>'+
      '<div class="field"><label>Coach notes</label><textarea name="notes">'+esc(p.notes)+"</textarea></div>"+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    document.getElementById("plan-form").addEventListener("submit", function(e){
      e.preventDefault();
      var f=e.target, acts2=[], i;
      for(i=0;i<6;i++) if(f["actn"+i]) acts2.push({name:f["actn"+i].value,duration:f["actd"+i].value});
      var rec={teamId:teamId(),week:f.week.value,date:f.date.value,theme:f.theme.value,warmup:f.warmup.value,activities:acts2,game:f.game.value,cooldown:f.cooldown.value,equipment:f.equipment.value,notes:f.notes.value};
      rec.id=p.id||HCFC.uid("sp");
      if(p.id) db.sessionPlans=db.sessionPlans.map(function(x){ return x.id===p.id?rec:x; }); else db.sessionPlans.push(rec);
      persist(); closeModal(); toast("Session plan saved.");
    });
  }

  function viewEquipment(){
    var rows=db.equipment.filter(function(e){ return e.teamId===teamId(); }).map(function(e){
      return "<tr><td>"+esc(e.item)+"</td><td>"+e.quantity+"</td><td>"+esc(e.condition)+"</td><td>"+esc(e.location)+"</td>"+
        '<td><input type="checkbox" data-act="eq-check" data-id="'+e.id+'"'+(e.checked?" checked":"")+"></td>"+
        "<td>"+fmtDate(e.lastChecked)+"</td>"+
        '<td><button class="btn btn-ghost btn-small" data-act="edit-eq" data-id="'+e.id+'">Edit</button> <button class="btn btn-ghost btn-small" data-act="del-eq" data-id="'+e.id+'">Delete</button></td></tr>';
    }).join("");
    return pageHead("Equipment inventory","Checklist for matchday and training",
      '<button class="btn btn-small" data-act="add-eq">Add item</button>')+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Item</th><th>Qty</th><th>Condition</th><th>Location</th><th>Checked</th><th>Last checked</th><th></th></tr></thead><tbody>'+
      (rows||"<tr><td colspan='7'>No items.</td></tr>")+"</tbody></table></div>";
  }
  function eqForm(e){
    e=e||{item:"",quantity:1,condition:"Good",location:"",checked:false,lastChecked:todayISO()};
    state.modal="<h2>"+(e.id?"Edit item":"Add item")+"</h2><form id='eq-form' class='form'><div class='grid-2'>"+
      '<div class="field"><label>Item</label><input name="item" value="'+esc(e.item)+'" required></div>'+
      '<div class="field"><label>Quantity</label><input name="quantity" type="number" min="0" value="'+esc(e.quantity)+'"></div>'+
      '<div class="field"><label>Condition</label><input name="condition" value="'+esc(e.condition)+'"></div>'+
      '<div class="field"><label>Location</label><input name="location" value="'+esc(e.location)+'"></div>'+
      '<div class="field"><label>Last checked</label><input name="lastChecked" type="date" value="'+esc(e.lastChecked)+'"></div></div>'+
      '<label><input type="checkbox" name="checked"'+(e.checked?" checked":"")+"> Checked</label>"+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    document.getElementById("eq-form").addEventListener("submit", function(ev){
      ev.preventDefault();
      var f=ev.target;
      var rec={teamId:teamId(),item:f.item.value,quantity:Number(f.quantity.value||0),condition:f.condition.value,location:f.location.value,checked:f.checked.checked,lastChecked:f.lastChecked.value};
      rec.id=e.id||HCFC.uid("eq");
      if(e.id) db.equipment=db.equipment.map(function(x){ return x.id===e.id?rec:x; }); else db.equipment.push(rec);
      persist(); closeModal(); toast("Equipment item saved.");
    });
  }

  function viewComms(){
    var players=teamPlayers();
    var staleN=players.filter(function(p){ var lc=lastContact(p.id); return !lc||daysBetween(lc.date)>=30; }).length;
    var notesRows=db.developmentNotes.filter(function(n){ var p=playerById(n.playerId); return p&&p.teamId===teamId(); })
      .sort(function(a,b){ return a.date<b.date?1:-1; })
      .map(function(n){ return "<tr><td>"+esc(playerById(n.playerId).name)+"</td><td>"+fmtDate(n.date)+"</td><td>"+esc(n.text)+"</td>"+
        '<td><button class="btn btn-ghost btn-small" data-act="del-note" data-id="'+n.id+'">Delete</button></td></tr>'; }).join("");
    var commRows=db.comms.filter(function(c){ var p=playerById(c.playerId); return p&&p.teamId===teamId(); })
      .sort(function(a,b){ return a.date<b.date?1:-1; })
      .map(function(c){
        var p=playerById(c.playerId); var days=daysBetween(c.date);
        return "<tr class='"+(days>=30?"stale":"")+"'><td>"+esc(p.name)+"</td><td>"+fmtDate(c.date)+"</td><td>"+esc(c.method)+"</td><td>"+esc(c.summary)+"</td><td>"+(c.followUpNeeded?"Yes":"No")+"</td>"+
          '<td><button class="btn btn-ghost btn-small" data-act="del-comm" data-id="'+c.id+'">Delete</button></td></tr>';
      }).join("");
    return pageHead("Communications and development notes", staleN+" families not contacted in 30+ days")+
      '<div class="stats">'+stat(staleN,"Families 30+ days")+"</div>"+
      '<div class="toolbar"><button class="btn btn-small" data-act="add-comm">Log a contact</button><button class="btn btn-outline btn-small" data-act="add-note">Add development note</button></div>'+
      "<h2>Family contact log</h2>"+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Family / player</th><th>Date</th><th>Method</th><th>Summary</th><th>Follow-up</th><th></th></tr></thead><tbody>'+
      (commRows||"<tr><td colspan='6'>No log entries.</td></tr>")+"</tbody></table></div>"+
      "<h2 style='margin-top:1.4rem'>Player development notes</h2>"+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Player</th><th>Date</th><th>Note</th><th></th></tr></thead><tbody>'+
      (notesRows||"<tr><td colspan='4'>No notes.</td></tr>")+"</tbody></table></div>";
  }
  function commForm(){
    var opts=teamPlayers().map(function(p){ return '<option value="'+p.id+'">'+esc(p.name)+"</option>"; }).join("");
    state.modal="<h2>Log a contact</h2><form id='comm-form' class='form'>"+
      '<div class="field"><label>Player / family</label><select name="playerId">'+opts+"</select></div>"+
      '<div class="grid-2"><div class="field"><label>Date</label><input name="date" type="date" value="'+todayISO()+'"></div>'+
      '<div class="field"><label>Method</label><select name="method"><option>Email</option><option>Phone</option><option>In person</option><option>SMS</option></select></div></div>'+
      '<div class="field"><label>Summary</label><textarea name="summary" required></textarea></div>'+
      '<label><input type="checkbox" name="followUpNeeded"> Follow-up needed</label>'+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    document.getElementById("comm-form").addEventListener("submit", function(e){
      e.preventDefault(); var f=e.target;
      db.comms.push({id:HCFC.uid("c"),playerId:f.playerId.value,date:f.date.value,method:f.method.value,summary:f.summary.value,followUpNeeded:f.followUpNeeded.checked});
      persist(); closeModal(); toast("Contact logged.");
    });
  }
  function noteForm(){
    var opts=teamPlayers().map(function(p){ return '<option value="'+p.id+'">'+esc(p.name)+"</option>"; }).join("");
    state.modal="<h2>Development note</h2><form id='note-form' class='form'>"+
      '<div class="field"><label>Player</label><select name="playerId">'+opts+"</select></div>"+
      '<div class="field"><label>Date</label><input name="date" type="date" value="'+todayISO()+'"></div>'+
      '<div class="field"><label>Note</label><textarea name="text" required></textarea></div>'+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    document.getElementById("note-form").addEventListener("submit", function(e){
      e.preventDefault(); var f=e.target;
      db.developmentNotes.push({id:HCFC.uid("dn"),playerId:f.playerId.value,date:f.date.value,text:f.text.value});
      persist(); closeModal(); toast("Note saved.");
    });
  }


  function teamTaskSets(){ return (db.taskSets||[]).filter(function(s){ return s.teamId===teamId(); }); }
  function currentTaskSet(){
    var sets=teamTaskSets();
    if(!sets.length) return null;
    if(state.taskSetId){
      var found=sets.filter(function(s){ return s.id===state.taskSetId; })[0];
      if(found) return found;
    }
    return sets[0];
  }
  function setTasks(setId){ return (db.tasks||[]).filter(function(tk){ return tk.setId===setId; }); }
  function taskDone(setId, taskId, playerId){
    var row=(db.taskProgress||[]).filter(function(x){ return x.setId===setId && x.taskId===taskId && x.playerId===playerId; })[0];
    return !!(row && row.complete);
  }
  function playerTaskPct(setId, playerId){
    var list=setTasks(setId);
    if(!list.length) return { done:0, total:0, pct:0 };
    var done=list.filter(function(tk){ return taskDone(setId, tk.id, playerId); }).length;
    return { done:done, total:list.length, pct:Math.round(done/list.length*100) };
  }
  function teamTaskPct(setId){
    var players=teamPlayers(), list=setTasks(setId);
    var total=players.length*list.length;
    if(!total) return { done:0, total:0, pct:0 };
    var done=0;
    players.forEach(function(p){ list.forEach(function(tk){ if(taskDone(setId, tk.id, p.id)) done++; }); });
    return { done:done, total:total, pct:Math.round(done/total*100) };
  }

  function viewTasks(){
    var sets=teamTaskSets();
    var set=currentTaskSet();
    if(set) state.taskSetId=set.id;
    var setOpts=sets.map(function(s){ return '<option value="'+esc(s.id)+'"'+(set&&s.id===set.id?" selected":"")+'>'+esc(s.name)+'</option>'; }).join("");
    if(!set){
      return pageHead("Player tasks","Create a task set for this team",
        '<button class="btn btn-small" data-act="add-set">New task set</button>')+
        '<p>No task sets yet for this team. Create one, for example a Summer Break Tasks set.</p>';
    }
    var tasks=setTasks(set.id);
    var teamPct=teamTaskPct(set.id);
    var cats={fitness:"Fitness",skills:"Skills",knowledge:"Knowledge",team:"Team"};
    var taskRows=tasks.map(function(tk){
      return '<tr><td><span class="badge">'+esc(cats[tk.category]||tk.category)+'</span></td><td><strong>'+esc(tk.title)+'</strong>'+
        (tk.url?' <a href="'+esc(tk.url)+'" target="_blank" rel="noopener">Video</a>':'')+
        '<br><span class="help">'+esc(tk.description)+'</span></td><td>'+esc(tk.frequency||"")+'</td><td>'+esc(tk.target||"")+'</td><td>'+fmtDate(tk.dueDate)+'</td>'+
        '<td><button class="btn btn-ghost btn-small" data-act="edit-task" data-id="'+tk.id+'">Edit</button> '+
        '<button class="btn btn-ghost btn-small" data-act="del-task" data-id="'+tk.id+'">Delete</button></td></tr>';
    }).join("");
    var heads=tasks.map(function(tk){ return '<th title="'+esc(tk.title)+'">'+esc(tk.title)+'</th>'; }).join("");
    var grid=teamPlayers().map(function(p){
      var pct=playerTaskPct(set.id,p.id);
      var cells=tasks.map(function(tk){
        var on=taskDone(set.id,tk.id,p.id);
        return '<td><input type="checkbox" data-act="task-check" data-set="'+set.id+'" data-tid="'+tk.id+'" data-pid="'+p.id+'"'+(on?" checked":"")+' aria-label="'+esc(p.name)+' — '+esc(tk.title)+'"></td>';
      }).join("");
      return '<tr><td><strong>'+esc(p.name)+'</strong></td>'+cells+'<td><strong>'+pct.done+'/'+pct.total+' ('+pct.pct+'%)</strong></td></tr>';
    }).join("");
    return pageHead("Player tasks", esc(set.name)+" · source: "+esc(set.source||"Coach"))+
      '<div class="filters"><label>Task set <select id="task-set-switch">'+setOpts+"</select></label>"+
      '<button class="btn btn-small" data-act="add-set">New set</button>'+
      '<button class="btn btn-outline btn-small" data-act="edit-set">Edit set</button>'+
      '<button class="btn btn-ghost btn-small" data-act="del-set">Delete set</button>'+
      '<button class="btn btn-outline btn-small" data-act="add-task">Add task</button></div>'+
      '<div class="stats">'+stat(teamPct.pct+"%","Team complete")+stat(teamPct.done+"/"+teamPct.total,"Tasks ticked")+stat(teamPlayers().length,"Players")+stat(tasks.length,"Tasks in this set")+"</div>"+
      '<div class="card" style="margin-bottom:1rem"><p style="white-space:pre-wrap;margin:0">'+esc(set.notes||"")+'</p></div>'+
      '<h2>Completion grid</h2>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Player</th>'+heads+"<th>% complete</th></tr></thead><tbody>"+
      (grid||"<tr><td>No players.</td></tr>")+"</tbody></table></div>"+
      "<h2 style='margin-top:1.4rem'>Task list</h2>"+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Category</th><th>Task</th><th>Frequency</th><th>Target</th><th>Due</th><th></th></tr></thead><tbody>'+
      (taskRows||"<tr><td colspan='6'>No tasks yet.</td></tr>")+"</tbody></table></div>";
  }
  function setForm(s){
    s=s||{name:"",source:"",dueDate:"",notes:""};
    state.modal="<h2>"+(s.id?"Edit task set":"New task set")+"</h2><form id='set-form' class='form'>"+
      '<div class="field"><label>Name</label><input name="name" required value="'+esc(s.name)+'" placeholder="Summer Break Tasks"></div>'+
      '<div class="grid-2"><div class="field"><label>Source</label><input name="source" value="'+esc(s.source)+'" placeholder="U11 Girls coaching staff"></div>'+
      '<div class="field"><label>Default due date</label><input name="dueDate" type="date" value="'+esc(s.dueDate||"")+'"></div></div>'+
      '<div class="field"><label>Notes for families</label><textarea name="notes">'+esc(s.notes)+"</textarea></div>"+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    document.getElementById("set-form").addEventListener("submit", function(e){
      e.preventDefault();
      var f=e.target;
      var rec={ teamId:teamId(), name:f.name.value, source:f.source.value, dueDate:f.dueDate.value, notes:f.notes.value };
      rec.id=s.id||HCFC.uid("ts");
      if(s.id) db.taskSets=db.taskSets.map(function(x){ return x.id===s.id?Object.assign({},x,rec):x; });
      else { if(!db.taskSets) db.taskSets=[]; db.taskSets.push(rec); }
      state.taskSetId=rec.id;
      persist(); closeModal(); toast("Task set saved.");
    });
  }
  function taskForm(tk){
    var set=currentTaskSet();
    tk=tk||{title:"",category:"fitness",description:"",frequency:"At least twice a week",target:"",dueDate:(set&&set.dueDate)||"",url:""};
    state.modal="<h2>"+(tk.id?"Edit task":"Add task")+"</h2><form id='task-form' class='form'>"+
      '<div class="field"><label>Title</label><input name="title" required value="'+esc(tk.title)+'"></div>'+
      '<div class="grid-2"><div class="field"><label>Category</label><select name="category"><option value="fitness">Fitness</option><option value="skills">Skills</option><option value="knowledge">Knowledge</option><option value="team">Team</option></select></div>'+
      '<div class="field"><label>Due date</label><input name="dueDate" type="date" value="'+esc(tk.dueDate||"")+'"></div></div>'+
      '<div class="field"><label>Description</label><textarea name="description">'+esc(tk.description)+"</textarea></div>"+
      '<div class="grid-2"><div class="field"><label>Frequency</label><input name="frequency" value="'+esc(tk.frequency)+'"></div>'+
      '<div class="field"><label>Target</label><input name="target" value="'+esc(tk.target)+'"></div></div>'+
      '<div class="field"><label>Video or link (optional)</label><input name="url" value="'+esc(tk.url||"")+'"></div>'+
      '<div class="toolbar"><button class="btn" type="submit">Save</button><button class="btn btn-ghost" type="button" data-act="close-modal">Cancel</button></div></form>';
    render(true);
    var f=document.getElementById("task-form"); f.category.value=tk.category||"fitness";
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var rec={ setId:set.id, title:f.title.value, category:f.category.value, description:f.description.value, frequency:f.frequency.value, target:f.target.value, dueDate:f.dueDate.value, url:f.url.value };
      rec.id=tk.id||HCFC.uid("tk");
      if(tk.id) db.tasks=db.tasks.map(function(x){ return x.id===tk.id?rec:x; });
      else { if(!db.tasks) db.tasks=[]; db.tasks.push(rec); }
      persist(); closeModal(); toast("Task saved.");
    });
  }

  function buildReport(p, comment){
    var att=attendanceFor(p.id), lines=[];
    lines.push("Hume City FC Girls Program — player progress report (SAMPLE / PROTOTYPE)");
    lines.push("Team: "+team().name);
    lines.push("Player: "+p.name);
    lines.push("Date: "+fmtDate(todayISO()));
    lines.push("");
    lines.push("Attendance: "+att.present+" of "+att.total+" sessions ("+att.pct+"%)");
    lines.push("");
    lines.push("Fitness changes (sample measurements):");
    db.metrics.forEach(function(m){
      var first,last,firstN,lastN;
      db.periods.forEach(function(per){
        var a=assessment(p.id,per.id,m.id);
        if(a&&a.value!==""&&a.value!=null){ if(first==null){ first=a.value; firstN=per.name; } last=a.value; lastN=per.name; }
      });
      var ch=changeInfo(first,last,m.lowerIsBetter);
      var arrow=!ch||ch.same?"→":(ch.improved?"▲ improved":"▼ declined");
      var pct=ch?(ch.pct>0?"+":"")+ch.pct+"%":"n/a";
      lines.push("- "+m.name+" ("+m.unit+"): "+(first!=null?first:"—")+" ("+(firstN||"")+") → "+(last!=null?last:"—")+" ("+(lastN||"")+")  "+arrow+"  vs first "+pct+(m.lowerIsBetter?" (lower is better)":" (higher is better)"));
    });
    lines.push("");
    var setsForTeam=teamTaskSets();
    if(setsForTeam.length){
      lines.push("Player tasks:");
      setsForTeam.forEach(function(s){
        var pct=playerTaskPct(s.id, p.id);
        lines.push("- "+s.name+": "+pct.done+" of "+pct.total+" complete ("+pct.pct+"%)");
        setTasks(s.id).forEach(function(tk){
          lines.push("    "+(taskDone(s.id,tk.id,p.id)?"[x]":"[ ]")+" "+tk.title+(tk.category?" ("+tk.category+")":""));
        });
      });
      lines.push("");
    }
    var ap=periodById(assessPeriodId())||periodList().filter(function(per){ return (db.testResults||[]).some(function(r){ return r.periodId===per.id && r.playerId===p.id; }); }).pop();
    if(ap && testsList().length){
      var mapsR=rankMaps(ap.id, teamPlayers());
      var attR=attendanceForPeriod(p.id, ap);
      var cardR=reportCardRec(p.id, ap.id);
      lines.push("Fitness tests & assessment — "+ap.name+" ("+periodDateLabel(ap)+"):");
      lines.push("Overall rating: "+((cardR&&cardR.overallRating)||"—"));
      lines.push("Attendance: Train "+attR.train.pct+"%, Games "+attR.games.pct+"%");
      lines.push("Fitness ranking: "+(mapsR.fitness[p.id]?nth(mapsR.fitness[p.id]):"—")+" | Ball skills ranking: "+(mapsR.ball[p.id]?nth(mapsR.ball[p.id]):"—")+" | Overall: "+(mapsR.overall[p.id]?nth(mapsR.overall[p.id]):"—"));
      testsList().forEach(function(t){
        var r=testResult(p.id, ap.id, t.id);
        var rank=mapsR.perTest[t.id]?mapsR.perTest[t.id][p.id]:null;
        lines.push("  - "+t.name+": "+(r&&r.value!=null&&r.value!==""?r.value:"—")+(t.unit?" "+t.unit:"")+"  ranked "+(rank?nth(rank):"—")+(r&&r.carriedForward?" (carried forward)":""));
      });
      if(cardR&&cardR.notes) lines.push("Notes: "+cardR.notes);
      lines.push("");
    }
    lines.push("Coach comment:");
    lines.push(comment||"[Add a comment]");
    lines.push("");
    lines.push("Concerns or feedback: "+tdLabel()+", "+td().email+". "+policiesNote());
    lines.push("This is a prototype report generated from sample data. It is not an official club communication.");
    return lines.join("\n");
  }
  function reportHTML(p, comment){
    return "<!DOCTYPE html><html lang='en-AU'><head><meta charset='utf-8'><title>Report — "+esc(p.name)+"</title></head><body style='font-family:Segoe UI,Arial,sans-serif;max-width:720px;margin:2rem auto;color:#1A1214'>"+
      "<p style='background:#FFF6D8;padding:.6rem 1rem'>SAMPLE / PROTOTYPE REPORT</p>"+
      "<h1>Hume City FC Girls Program</h1><h2>"+esc(p.name)+" · "+esc(team().name)+"</h2>"+
      '<pre class="report-pre" style="white-space:pre-wrap;font-family:inherit">'+esc(buildReport(p,comment))+"</pre></body></html>";
  }
  function viewReports(){
    var opts=['<option value="">— Choose a player —</option>'].concat(teamPlayers().map(function(p){ return '<option value="'+p.id+'">'+esc(p.name)+"</option>"; })).join("");
    return pageHead("Email reports","Preview a summary, then open it in your email program")+
      '<div class="warn-note">“Send” opens a mailto: message to the player or parent address. Bulk send uses BCC, or you can send one at a time. Real automated sending needs a backend or an email service such as Resend, SendGrid or Microsoft 365.</div>'+
      '<form id="report-form" class="card form">'+
      '<div class="field"><label>Player</label><select name="playerId">'+opts+"</select></div>"+
      '<div class="field"><label>Coach comment</label><textarea name="comment" placeholder="[Comment for the family]"></textarea></div>'+
      '<div class="toolbar"><button class="btn" type="button" data-act="preview-report">Preview report</button>'+
      '<button class="btn btn-outline" type="button" data-act="preview-bulk">Preview whole team</button></div></form>'+
      '<div class="note" style="margin-top:1rem">For the club-style report card and the quarterly fitness battery, use the <button type="button" class="btn btn-ghost btn-small" data-act="tab" data-tab="assessment">Assessment</button> tab. Reports there open as a printable view or an email draft — nothing is sent automatically.</div>';
  }
  function openReportModal(players, comment, bulk){
    var text=players.map(function(p){ return buildReport(p,comment); }).join("\n\n-----\n\n");
    var emails=[];
    players.forEach(function(p){ if(p.email) emails.push(p.email); if(p.guardian1&&p.guardian1.email) emails.push(p.guardian1.email); });
    state._report={players:players,text:text,emails:emails,comment:comment,bulk:!!bulk};
    state.modal="<h2>Report preview</h2><p class='help'>Sample / prototype report. Check addresses before you send.</p>"+
      '<pre class="report-pre" style="white-space:pre-wrap;padding:1rem;border-radius:8px;max-height:40vh;overflow:auto">'+esc(text)+"</pre>"+
      '<div class="toolbar">'+
      '<button class="btn" data-act="mailto-report">Send (opens email)</button>'+
      '<button class="btn btn-outline" data-act="copy-report">Copy report</button>'+
      '<button class="btn btn-outline" data-act="dl-report">Download report (HTML)</button>'+
      '<button class="btn btn-ghost" data-act="close-modal">Close</button></div>'+
      '<p class="help">After sending, you can add a communication log entry automatically.</p>';
    render(true);
  }

  function viewSettings(){
    var per=db.periods.map(function(p){
      return '<tr><td><input data-act="per" data-id="'+p.id+'" data-k="name" value="'+esc(p.name)+'"></td>'+
        '<td><input data-act="per" data-id="'+p.id+'" data-k="start" type="date" value="'+esc(p.start)+'"></td>'+
        '<td><input data-act="per" data-id="'+p.id+'" data-k="end" type="date" value="'+esc(p.end)+'"></td>'+
        '<td><button class="btn btn-ghost btn-small" data-act="del-per" data-id="'+p.id+'">Remove</button></td></tr>';
    }).join("");
    var met=db.metrics.map(function(m){
      return '<tr><td><input data-act="met" data-id="'+m.id+'" data-k="name" value="'+esc(m.name)+'"></td>'+
        '<td><input data-act="met" data-id="'+m.id+'" data-k="unit" value="'+esc(m.unit)+'"></td>'+
        '<td><select data-act="met" data-id="'+m.id+'" data-k="lowerIsBetter"><option value="false"'+(!m.lowerIsBetter?" selected":"")+">Higher is better</option><option value=\"true\""+(m.lowerIsBetter?" selected":"")+">Lower is better</option></select></td>"+
        '<td><button class="btn btn-ghost btn-small" data-act="del-met" data-id="'+m.id+'">Remove</button></td></tr>';
    }).join("");
    var coachRows=(clubCoaches()||[]).map(function(c){
      var tm=(db.teams||[]).filter(function(x){ return x.id===c.teamId; })[0];
      var scope=c.canViewAll?"All teams":(tm?tm.name:"—");
      return "<tr><td>"+esc(c.name)+"</td><td>"+esc(c.role)+"</td><td>"+esc(scope)+"</td><td>"+esc(c.email)+" <span class=\"help\">(placeholder)</span></td><td>"+esc(c.phone)+"</td></tr>";
    }).join("");
    var testRows=(testsList()||[]).map(function(t){
      return '<tr><td><input data-act="test-meta" data-id="'+t.id+'" data-k="name" value="'+esc(t.name)+'"></td>'+
        '<td><select data-act="test-meta" data-id="'+t.id+'" data-k="group"><option value="fitness"'+(t.group==="fitness"?" selected":"")+">Fitness</option><option value=\"ball\""+(t.group==="ball"?" selected":"")+">Ball skills</option></select></td>"+
        '<td><input data-act="test-meta" data-id="'+t.id+'" data-k="unit" value="'+esc(t.unit)+'"></td>'+
        '<td><select data-act="test-meta" data-id="'+t.id+'" data-k="lowerIsBetter"><option value="false"'+(!t.lowerIsBetter?" selected":"")+">Higher is better</option><option value=\"true\""+(t.lowerIsBetter?" selected":"")+">Lower is better</option></select></td>"+
        '<td><button class="btn btn-ghost btn-small" data-act="del-test" data-id="'+t.id+'">Remove</button></td></tr>';
    }).join("");
    return pageHead("Settings","Periods, tests, sizes, contacts and backup")+
      "<h2>Club contacts</h2>"+
      '<p class="help">Technical Director details confirmed by the club. Coach emails and phone numbers are placeholders only — no personal addresses are stored here.</p>'+
      '<div class="card" style="margin-bottom:1rem"><p><strong>'+esc(tdLabel())+'</strong><br>Email: <a href="mailto:'+esc(td().email)+'">'+esc(td().email)+"</a></p><p>"+esc(policiesNote())+"</p></div>"+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Role</th><th>Sees</th><th>Email</th><th>Phone</th></tr></thead><tbody>'+
      coachRows+"</tbody></table></div>"+

      "<h2>Assessment periods</h2><p class='help'>Default is Previous plus Q1–Q4 (Interim and Mid Season named to match the club report card periods). Rename, change dates, or add periods at any time.</p>"+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Start</th><th>End</th><th></th></tr></thead><tbody>'+per+"</tbody></table></div>"+
      '<p><button class="btn btn-outline btn-small" data-act="add-per">Add period</button></p>'+
      "<h2>Fitness test battery</h2>"+
      '<p class="help">Seven fitness tests and four ball-skill tests used on the Assessment tab and report cards. Names, units and direction are editable.</p>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Group</th><th>Unit</th><th>Direction</th><th></th></tr></thead><tbody>'+testRows+"</tbody></table></div>"+
      '<p><button class="btn btn-outline btn-small" data-act="add-test">Add test</button></p>'+
      "<h2>Additional fitness metrics</h2>"+
      '<p class="help">Optional extra measures shown on the Fitness tab only.</p>'+
      '<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Unit</th><th>Direction</th><th></th></tr></thead><tbody>'+met+"</tbody></table></div>"+
      '<p><button class="btn btn-outline btn-small" data-act="add-met">Add metric</button></p>'+
      "<h2>Uniform sizes</h2><p><input id='sizes' value='"+esc(db.settings.uniformSizes.join(", "))+"' style='width:min(32rem,100%)'> <button class='btn btn-outline btn-small' data-act='save-sizes'>Save sizes</button></p>"+
      "<h2>Backup</h2><div class='toolbar'>"+
      '<button class="btn btn-outline" data-act="export-json">Export JSON</button>'+
      '<label class="btn btn-outline">Import JSON<input type="file" accept="application/json,.json" hidden id="import-json"></label>'+
      '<button class="btn btn-ghost" data-act="reset">Reset sample data</button>'+
      '<button class="btn btn-ghost" data-act="clear">Clear all data</button></div>'+
      '<div class="sensitive-note" style="margin-top:1rem"><strong>Privacy.</strong> This prototype stores everything in localStorage in this browser. The players in a real program include minors. Production needs authentication, a hosted database, consent, and consideration of the Australian Privacy Act. Medical notes need tighter restriction and encryption. Do not put real personal data in this pack.</div>';
  }

  function render(keepModal){
    document.body.className="coach";
    var view={ roster:viewRoster, tracking:viewTracking, fees:viewFeesUniform, duties:viewDuties, assessment:viewAssessment, fitness:viewFitness, tasks:viewTasks, medical:viewMedical, matches:viewMatches, fixtures:viewFixtures, sessions:viewSessions, equipment:viewEquipment, comms:viewComms, reports:viewReports, settings:viewSettings }[state.tab]||viewRoster;
    document.getElementById("app").innerHTML=shell(view());
    bind();
  }

  function importRosterFile(file){
    var reader=new FileReader();
    reader.onload=function(){
      var rows=parseCSV(String(reader.result)); if(!rows.length) return;
      var h=rows[0].map(function(x){ return x.toLowerCase(); });
      function col(name){ return h.indexOf(name); }
      rows.slice(1).forEach(function(r){
        db.players.push({ id:HCFC.uid("pl"), teamId:teamId(),
          name:r[col("player name")]||r[col("name")]||r[0]||"Sample Player",
          email:r[col("player email")]||r[col("email")]||r[1]||"sample@example.com",
          guardian1:{name:r[col("guardian name")]||"",relationship:r[col("relationship")]||"Parent",email:r[col("guardian email")]||r[col("parent email")]||"",phone:r[col("phone")]||""},
          guardian2:{name:"",relationship:"",email:"",phone:""},
          feeStatus:"Unpaid",feeAmount:0,feeDate:"",uniformOrder:"Not ordered",uniformCollection:"Not collected",uniformSize:db.settings.uniformSizes[0] });
      });
      persist(); toast("Roster CSV imported."); render();
    };
    reader.readAsText(file);
  }
  function onDomChange(e){
    if(e.target && e.target.id==="team-switch"){ db.currentTeamId=e.target.value; persist(); render(); return; }
    if(e.target && e.target.id==="coach-switch"){
      db.currentCoachId=e.target.value; applyCoachScope(); persist(); render(); return;
    }
    if(e.target && e.target.id==="assess-period"){ state.assessPeriodId=e.target.value; render(); return; }
    if(e.target && e.target.id==="assess-player"){ state.assessPlayerId=e.target.value; render(); return; }
    if(e.target && e.target.id==="search"){ state.q=e.target.value; if(e.type==="change") render(); return; }
    if(e.target && e.target.id==="track-filter"){ state.tracking=e.target.value; render(); return; }
    if(e.target && e.target.id==="fees-filter"){ state.feesFilter=e.target.value; render(); return; }
    if(e.target && e.target.getAttribute && e.target.getAttribute("data-act")==="duty"){
      var dw=e.target.getAttribute("data-week"), drec=dutyFor(dw);
      if(!drec){ drec={teamId:teamId(),week:dw,captainId:"",fruitId:"",notes:""}; db.duties.push(drec); }
      drec[e.target.getAttribute("data-k")]=e.target.value; persist(); render(); return;
    }
    if(e.target && e.target.getAttribute && e.target.getAttribute("data-act")==="team-captain"){
      db.teamCaptains=db.teamCaptains||{}; var tcr=db.teamCaptains[teamId()]||(db.teamCaptains[teamId()]={captainId:"",viceId:""});
      tcr[e.target.getAttribute("data-k")]=e.target.value; persist(); render(); return;
    }
    if(e.target && e.target.id==="task-set-switch"){ state.taskSetId=e.target.value; render(); return; }
    if(e.target && e.target.id==="med-flag"){ state.medFlagged=e.target.checked; render(); return; }
    if(e.target && e.target.id==="import-roster" && e.target.files && e.target.files[0]) importRosterFile(e.target.files[0]);
    if(e.target && e.target.id==="import-dribl" && e.target.files && e.target.files[0]){
      var reader=new FileReader();
      reader.onload=function(){ var rows=parseCSV(String(reader.result)); if(rows.length<2){ toast("No data rows found."); return; } driblMapper(rows[0], rows.slice(1)); };
      reader.readAsText(e.target.files[0]);
    }
    if(e.target && e.target.id==="import-json" && e.target.files && e.target.files[0]){
      var reader2=new FileReader();
      reader2.onload=function(){ try{ db=JSON.parse(String(reader2.result)); persist(); toast("JSON imported."); render(); } catch(err){ alert("Could not read that JSON file."); } };
      reader2.readAsText(e.target.files[0]);
    }
    onChange(e);
  }
  function bind(){
    if(window.__hcfcBound) return;
    window.__hcfcBound=true;
    document.addEventListener("click", onClick);
    document.addEventListener("change", onDomChange);
  }

  function onClick(e){
    var btn=e.target.closest("[data-act]");
    if(!btn) return;
    var act=btn.getAttribute("data-act");
    var id=btn.getAttribute("data-id");
    if(act==="tab"){ state.tab=btn.getAttribute("data-tab"); state.modal=null; render(); }
    else if(act==="duty-autofill"){ dutyAutofill(false); render(); toast("Rotation filled for the next 8 weeks."); }
    else if(act==="duty-clear"){ if(confirm("Clear the captain and fruit roster for this team?")){ db.duties=(db.duties||[]).filter(function(x){ return x.teamId!==teamId(); }); db.duties.push({teamId:teamId(),week:"cleared",captainId:"",fruitId:"",notes:""}); persist(); render(); } }
    else if(act==="assess-view"){ state.assessView=btn.getAttribute("data-view"); render(); }
    else if(act==="print-card"){ printReportCard(); }
    else if(act==="dl-card"){
      var pl=playerById(assessPlayerId()), pe=periodById(assessPeriodId());
      if(!pl||!pe) return;
      var html="<!DOCTYPE html><html lang='en-AU'><head><meta charset='utf-8'><title>Report card — "+esc(pl.name)+"</title><style>body{font-family:Segoe UI,Calibri,Arial,sans-serif;padding:24px;color:#1a1a1a} .rc-conf{background:#8B1E1E;color:#fff;text-align:center;padding:8px;font-weight:700;letter-spacing:.04em} .rc-kicker{text-align:center;font-weight:700;margin:16px 0 4px} .rc-period{text-align:center;margin:0 0 16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:left;vertical-align:top} th{background:#f6f2f2}</style></head><body>"+reportCardHTML(pl,pe,false)+"</body></html>";
      download((pl.name+"_"+pe.name+"_report_card.html").replace(/\s+/g,"_"), html, "text/html");
    }
    else if(act==="mailto-card"){
      var plM=playerById(assessPlayerId()), peM=periodById(assessPeriodId());
      if(!plM||!peM) return;
      var textM=fitnessReportText([plM], peM, "");
      var emailsM=[]; if(plM.email) emailsM.push(plM.email); if(plM.guardian1&&plM.guardian1.email) emailsM.push(plM.guardian1.email);
      var hrefM="mailto:"+encodeURIComponent(emailsM.join(","))+"?subject="+encodeURIComponent("Hume City FC fitness report card (sample) — "+plM.name+" — "+peM.name)+"&body="+encodeURIComponent(textM.slice(0,1800));
      window.location.href=hrefM;
    }
    else if(act==="print-team-fitness" || act==="mailto-team-fitness"){
      openFitnessReportModal(teamPlayers(), periodById(assessPeriodId()), true);
    }
    else if(act==="mailto-fitness"){
      var fr=state._fitnessReport; if(!fr) return;
      var subject=encodeURIComponent("Hume City FC fitness report (sample) — "+(fr.bulk?team().name:fr.players[0].name)+(fr.period?" — "+fr.period.name:""));
      var body=encodeURIComponent(fr.text.slice(0,1800));
      var href=fr.bulk?("mailto:?bcc="+encodeURIComponent(fr.emails.join(","))+"&subject="+subject+"&body="+body):("mailto:"+encodeURIComponent(fr.emails.join(","))+"?subject="+subject+"&body="+body);
      window.location.href=href;
    }
    else if(act==="copy-fitness"){
      var ft=state._fitnessReport&&state._fitnessReport.text; if(!ft) return;
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(ft).then(function(){ toast("Report copied."); }); else prompt("Copy this report:", ft);
    }
    else if(act==="print-fitness-text"){
      var ft2=state._fitnessReport&&state._fitnessReport.text; if(!ft2) return;
      var w=window.open("", "_blank");
      if(w){ w.document.write('<pre class="report-pre" style="font-family:Segoe UI,Calibri,Arial,sans-serif;white-space:pre-wrap;padding:24px">'+esc(ft2)+"</pre>"); w.document.close(); w.focus(); w.print(); }
    }
    else if(act==="add-test"){ if(!db.tests) db.tests=[]; db.tests.push({id:HCFC.uid("ft"),group:"fitness",name:"New test",unit:"",lowerIsBetter:false}); persist(); render(); }
    else if(act==="del-test"){ db.tests=(db.tests||[]).filter(function(x){ return x.id!==id; }); persist(); render(); }
    else if(act==="close-modal" || (act==="backdrop" && e.target===btn)) closeModal();
    else if(act==="add-player") playerForm(null);
    else if(act==="edit-player") playerForm(playerById(id));
    else if(act==="delete-player"){ if(confirm("Delete this sample player?")){ db.players=db.players.filter(function(p){ return p.id!==id; }); persist(); toast("Player deleted."); render(); } }
    else if(act==="export-roster"){
      var rows=[["Player name","Player email","Guardian name","Relationship","Guardian email","Phone","Guardian 2 name","Guardian 2 email","Guardian 2 phone"]];
      teamPlayers().forEach(function(p){ rows.push([p.name,p.email,p.guardian1.name,p.guardian1.relationship,p.guardian1.email,p.guardian1.phone,(p.guardian2||{}).name||"",(p.guardian2||{}).email||"",(p.guardian2||{}).phone||""]); });
      download(team().name.replace(/\s+/g,"_")+"_roster.csv", toCSV(rows), "text/csv");
    } else if(act==="add-session"){
      var typ=prompt("Session type: Training or Match","Training"); if(!typ) return;
      typ=typ.toLowerCase().indexOf("match")>=0?"Match":"Training";
      var date=prompt("Date (YYYY-MM-DD)", todayISO()); if(!date) return;
      var s={id:HCFC.uid("s"),teamId:teamId(),date:date,type:typ};
      db.sessions.push(s);
      teamPlayers().forEach(function(p){ db.attendance.push({sessionId:s.id,playerId:p.id,present:true}); });
      persist(); toast("Session added."); render();
    } else if(act==="add-med") medForm(null);
    else if(act==="edit-med") medForm(db.medical.filter(function(m){ return m.id===id; })[0]);
    else if(act==="del-med"){ db.medical=db.medical.filter(function(m){ return m.id!==id; }); persist(); render(); }
    else if(act==="add-match") matchForm(null);
    else if(act==="edit-match") matchForm(db.matches.filter(function(m){ return m.id===id; })[0]);
    else if(act==="del-match"){ db.matches=db.matches.filter(function(m){ return m.id!==id; }); db.matchStats=db.matchStats.filter(function(s){ return s.matchId!==id; }); persist(); render(); }
    else if(act==="goto-match"){ state.tab="matches"; state.modal=null; render(); matchForm(db.matches.filter(function(m){ return m.id===id; })[0]); }
    else if(act==="result-from-fx"){
      var fx=db.fixtures.filter(function(f){ return f.id===id; })[0];
      var opp=fx.homeTeam.indexOf("Hume")>=0?fx.awayTeam:fx.homeTeam;
      var rec={id:HCFC.uid("m"),teamId:teamId(),date:fx.date,opponent:opp,homeAway:fx.homeTeam.indexOf("Hume")>=0?"Home":"Away",scoreFor:0,scoreAgainst:0,result:"D"};
      db.matches.push(rec); fx.matchId=rec.id; persist(); state.tab="matches"; matchForm(rec);
    } else if(act==="add-fx") fxForm(null);
    else if(act==="edit-fx") fxForm(db.fixtures.filter(function(f){ return f.id===id; })[0]);
    else if(act==="del-fx"){ db.fixtures=db.fixtures.filter(function(f){ return f.id!==id; }); persist(); render(); }
    else if(act==="ics-one"){ var f=db.fixtures.filter(function(x){ return x.id===id; })[0]; download((f.round||"fixture")+".ics", icsFor([f]), "text/calendar"); }
    else if(act==="ics-all"){ var up=db.fixtures.filter(function(f){ return f.teamId===teamId() && fixtureDateTime(f)>=new Date(); }); download("fixtures.ics", icsFor(up), "text/calendar"); }
    else if(act==="add-plan") planForm(null);
    else if(act==="edit-plan") planForm(db.sessionPlans.filter(function(p){ return p.id===id; })[0]);
    else if(act==="dup-plan"){ var src=db.sessionPlans.filter(function(p){ return p.id===id; })[0]; var copy=JSON.parse(JSON.stringify(src)); copy.id=HCFC.uid("sp"); copy.week=src.week+" (copy)"; copy.date=todayISO(); db.sessionPlans.push(copy); persist(); toast("Week duplicated."); render(); }
    else if(act==="print-plan") window.print();
    else if(act==="del-plan"){ db.sessionPlans=db.sessionPlans.filter(function(p){ return p.id!==id; }); persist(); render(); }
    else if(act==="add-eq") eqForm(null);
    else if(act==="edit-eq") eqForm(db.equipment.filter(function(x){ return x.id===id; })[0]);
    else if(act==="del-eq"){ db.equipment=db.equipment.filter(function(x){ return x.id!==id; }); persist(); render(); }
    else if(act==="add-comm") commForm();
    else if(act==="add-note") noteForm();
    else if(act==="del-comm"){ db.comms=db.comms.filter(function(x){ return x.id!==id; }); persist(); render(); }
    else if(act==="del-note"){ db.developmentNotes=db.developmentNotes.filter(function(x){ return x.id!==id; }); persist(); render(); }
    else if(act==="preview-report"){ var form=document.getElementById("report-form"); var p=playerById(form.playerId.value); if(!p){ alert("Choose a player first."); return; } openReportModal([p], form.comment.value, false); }
    else if(act==="preview-bulk"){ var formB=document.getElementById("report-form"); openReportModal(teamPlayers(), formB?formB.comment.value:"", true); }
    else if(act==="copy-report"){ var t=state._report&&state._report.text; if(!t) return; if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function(){ toast("Report copied."); }); else prompt("Copy this report:", t); }
    else if(act==="dl-report"){ if(!state._report) return; download("player-report.html", state._report.players.map(function(p){ return reportHTML(p, state._report.comment); }).join(""), "text/html"); }
    else if(act==="mailto-report"){
      if(!state._report) return;
      var r=state._report;
      var subject=encodeURIComponent("Hume City FC progress report (sample) — "+(r.bulk?team().name:r.players[0].name));
      var body=encodeURIComponent(r.text.slice(0,1800));
      var href=r.bulk?("mailto:?bcc="+encodeURIComponent(r.emails.join(","))+"&subject="+subject+"&body="+body):("mailto:"+encodeURIComponent(r.emails.join(","))+"?subject="+subject+"&body="+body);
      window.location.href=href;
      if(confirm("Add a communication log entry for this report?")){
        r.players.forEach(function(p){ db.comms.push({id:HCFC.uid("c"),playerId:p.id,date:todayISO(),method:"Email",summary:"SAMPLE: Progress report generated from the coach dashboard.",followUpNeeded:false}); });
        persist(); toast("Log entries added.");
      }
    } else if(act==="add-set") setForm(null);
    else if(act==="edit-set"){ var cur=currentTaskSet(); if(cur) setForm(cur); }
    else if(act==="del-set"){
      var curDel=currentTaskSet();
      if(curDel && confirm("Delete this task set and its completion ticks?")){
        db.taskSets=(db.taskSets||[]).filter(function(s){ return s.id!==curDel.id; });
        db.tasks=(db.tasks||[]).filter(function(tk){ return tk.setId!==curDel.id; });
        db.taskProgress=(db.taskProgress||[]).filter(function(x){ return x.setId!==curDel.id; });
        state.taskSetId=null; persist(); toast("Task set deleted."); render();
      }
    } else if(act==="add-task"){ if(!currentTaskSet()){ alert("Create a task set first."); return; } taskForm(null); }
    else if(act==="edit-task") taskForm((db.tasks||[]).filter(function(x){ return x.id===id; })[0]);
    else if(act==="del-task"){
      if(confirm("Delete this task?")){
        db.tasks=(db.tasks||[]).filter(function(x){ return x.id!==id; });
        db.taskProgress=(db.taskProgress||[]).filter(function(x){ return x.taskId!==id; });
        persist(); render();
      }
    } else if(act==="add-per"){ db.periods.push({id:HCFC.uid("p"),name:"New period",start:todayISO(),end:todayISO()}); persist(); render(); }
    else if(act==="del-per"){ db.periods=db.periods.filter(function(p){ return p.id!==id; }); persist(); render(); }
    else if(act==="add-met"){ db.metrics.push({id:HCFC.uid("m"),name:"New metric",unit:"",lowerIsBetter:false}); persist(); render(); }
    else if(act==="del-met"){ db.metrics=db.metrics.filter(function(m){ return m.id!==id; }); persist(); render(); }
    else if(act==="save-sizes"){ db.settings.uniformSizes=document.getElementById("sizes").value.split(",").map(function(s){ return s.trim(); }).filter(Boolean); persist(); toast("Sizes saved."); render(); }
    else if(act==="export-json") download("hcfc-coach-data.json", JSON.stringify(db,null,2), "application/json");
    else if(act==="reset"){ if(confirm("Replace everything in this browser with the sample dataset?")){ db=HCFC.resetSample(); toast("Sample data restored."); render(); } }
    else if(act==="clear"){ if(confirm("Clear all data in this browser? This cannot be undone.")){ db=HCFC.clearAll(); toast("All data cleared."); render(); } }
  }

  function onChange(e){
    var el=e.target, act=el.getAttribute("data-act");
    if(!act) return;
    if(act==="task-check"){
      var setId=el.getAttribute("data-set"), tid=el.getAttribute("data-tid"), pid=el.getAttribute("data-pid");
      db.taskProgress=(db.taskProgress||[]).filter(function(x){ return !(x.setId===setId && x.taskId===tid && x.playerId===pid); });
      if(el.checked) db.taskProgress.push({ setId:setId, taskId:tid, playerId:pid, complete:true, completedDate:todayISO() });
      persist();
      render();
    } else if(act==="att"){
      var sid=el.getAttribute("data-sid"), pid=el.getAttribute("data-pid");
      db.attendance=db.attendance.filter(function(a){ return !(a.sessionId===sid && a.playerId===pid); });
      if(el.value==="P"||el.value==="A") db.attendance.push({sessionId:sid,playerId:pid,present:el.value==="P"});
      persist();
    } else if(act==="field"){
      var p=playerById(el.getAttribute("data-id")); var k=el.getAttribute("data-k");
      p[k]=k==="feeAmount"?Number(el.value||0):el.value; persist();
    } else if(act==="assess"){
      var pid2=el.getAttribute("data-pid"), per=el.getAttribute("data-per"), met=el.getAttribute("data-met");
      db.assessments=db.assessments.filter(function(a){ return !(a.playerId===pid2 && a.periodId===per && a.metricId===met); });
      if(el.value!=="") db.assessments.push({playerId:pid2,periodId:per,metricId:met,value:Number(el.value)});
      persist();
    } else if(act==="eq-check"){
      var item=db.equipment.filter(function(x){ return x.id===el.getAttribute("data-id"); })[0];
      item.checked=el.checked; item.lastChecked=todayISO(); persist();
    } else if(act==="per"){
      var perObj=db.periods.filter(function(p){ return p.id===el.getAttribute("data-id"); })[0];
      perObj[el.getAttribute("data-k")]=el.value; persist();
    } else if(act==="met"){
      var m=db.metrics.filter(function(x){ return x.id===el.getAttribute("data-id"); })[0];
      var key=el.getAttribute("data-k");
      m[key]=key==="lowerIsBetter"?el.value==="true":el.value; persist();
    } else if(act==="test-meta"){
      var tst=testById(el.getAttribute("data-id"));
      if(!tst) return;
      var tk=el.getAttribute("data-k");
      tst[tk]=tk==="lowerIsBetter"?el.value==="true":el.value; persist();
    } else if(act==="test-val"){
      var raw=el.value.trim();
      upsertTestResult(el.getAttribute("data-pid"), el.getAttribute("data-per"), el.getAttribute("data-tid"), { value: raw===""?"":Number(raw), carriedForward:false });
      persist();
    } else if(act==="test-carry"){
      var pidC=el.getAttribute("data-pid"), perC=el.getAttribute("data-per"), tidC=el.getAttribute("data-tid");
      if(el.checked){
        var prevP=previousPeriod(perC);
        var prevR=prevP?testResult(pidC, prevP.id, tidC):null;
        upsertTestResult(pidC, perC, tidC, { value: prevR&&prevR.value!=null&&prevR.value!==""?prevR.value:"", carriedForward:true });
      } else {
        upsertTestResult(pidC, perC, tidC, { carriedForward:false });
      }
      persist(); render();
    } else if(act==="rc-rating"){
      var card=ensureReportCard(el.getAttribute("data-pid"), el.getAttribute("data-per"));
      card.overallRating=el.value; persist();
    } else if(act==="rc-notes"){
      var cardN=ensureReportCard(el.getAttribute("data-pid"), el.getAttribute("data-per"));
      cardN.notes=el.value; persist();
    } else if(act==="rc-crit"){
      var cardC=ensureReportCard(el.getAttribute("data-pid"), el.getAttribute("data-per"));
      var ck=el.getAttribute("data-ck");
      if(!cardC.criteria[ck]) cardC.criteria[ck]={status:"ON TRACK",feedback:""};
      cardC.criteria[ck][el.getAttribute("data-k")]=el.value; persist();
    }
  }

  window.HCFC_APP={ render:render, get db(){ return db; }, set db(v){ db=v; }, state:state, teamPlayers:teamPlayers, attendanceFor:attendanceFor, buildReport:buildReport, changeInfo:changeInfo };
  render();
})();
