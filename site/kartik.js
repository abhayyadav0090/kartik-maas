const START=new Date(2026,9,26),N=30;
// Background photos: keep your original bundled images and visual treatment.
const BG=[];
const SH=[["नमामीश्वरं सच्-चिद्-आनन्द-रूपं\nलसत्-कुण्डलं गोकुले भ्राजमानम्\nयशोदा-भियोलूखलाद् धावमानं\nपरामृष्टम् अत्यन्ततो द्रुत्य गोप्या","I bow to Lord Damodara, whose form is eternal, full of knowledge and bliss, whose earrings swing in Gokula, who runs in fear of Mother Yashoda yet is caught by her."],["रुदन्तं मुहुर् नेत्र-युग्मं मृजन्तम्\nकराम्भोज-युग्मेन सातङ्क-नेत्रम्\nमुहुः श्वास-कम्प-त्रिरेखाङ्क-कण्ठ\nस्थित-ग्रैवं दामोदरं भक्ति-बद्धम्","Crying, rubbing His eyes with lotus hands, trembling with fear, His neck marked with three lines, Damodara is bound by love."],["इतीदृक् स्वलीलाभिर् आनन्दकुण्डे\nस्वघोषं निमज्जन्तम् आख्यापयन्तम्\nतदीयेषितज्ञेषु भक्तैर् जितत्वं\nपुनः प्रेमतस्तं शतावृत्ति वन्दे","By such pastimes He shows He is conquered by His devotees’ love. With love I bow to Him hundreds of times."],["वरं देव मोक्षं न मोक्षावधिं वा\nन चान्यं वृणे ऽहं वरेषाद् अपीह\nइदं ते वपुर् नाथ गोपालबालं\nसदा मे मनस्य् आविरास्तां किमन्यैः","O Lord, I ask not for liberation, only that Your child form of Gopala always appear in my mind. What use is anything else?"],["इदं ते मुखाम्भोजम् अत्यन्त-नीलैर्\nवृतं कुन्तलैः स्निग्ध-रक्तैश् च गोप्या\nमुहुश् चुम्बितं बिम्ब-रक्ताधरं मे\nमनस्य् आविरास्ताम् अलं लक्ष-लाभैः","May Your lotus face, framed by dark curls and kissed again and again by Yashoda, always appear in my mind. Millions of other gains are enough to leave."],["नमो देव दामोदरानन्त विष्णो\nप्रसीद प्रभो दुःख जालाब्धिमग्नम्\nकृपादृष्टिवृष्ट्यातिदीनं बतानु\nगृहाणेष माम् अज्ञम् एध्य् अक्षिदृश्यः","O Damodara, be pleased with me, sunk in an ocean of sorrow. Shower Your merciful glance on this fool and let me see You."],["कुवेरात्मजौ बद्धमूर्त्यैव यद्वत्\nत्वया मोचितौ भक्तिभाजौ कृतौ च\nतथा प्रेम-भक्तिं स्वकां मे प्रयच्छ\nन मोक्षे ग्रहो मे ऽस्ति दामोदरेह","As You freed Kuvera’s sons and made them devotees, give me Your loving devotion. I have no desire for liberation."],["नमस् ते ‘स्तु दाम्ने स्फुरद्-दीप्ति-धाम्ने\nत्वदीयोदरायाथ विश्वस्य धाम्ने\nनमो राधिकायै त्वदीयप्रियायै\nनमो ऽनन्तलीलाय देवाय तुभ्यम्","I bow to the rope that bound You, to Your radiant form, to Radha, Your beloved, and to You of endless pastimes."]];
const CORE=['v0','v11','v7','v1','v2','v3']; // wake up, chanting, hearing, reading, lamp, Damodarastakam
const byCore=a=>[...a].sort((x,y)=>(!!y.core)-(!!x.core));
const DEF=["Wake up during Brahma Muhurta","Read Srila Prabhupada’s books","Offer a ghee lamp to Lord Damodara","Recite Damodarastakam","Offer water to Tulasi Maharani","Read prayers of Kunti Maharani & Gajendra Moksha","Read Bhagavad-gita","Hear Krishna-katha","Offer Tulasi leaves to the Lord","Organize or serve in a Damodara program","Vrajvas (visit or remember the holy land of Vraj)","Increase chanting"];
const HDEF=["ब्रह्म मुहूर्त में उठें","श्रील प्रभुपाद की पुस्तकें पढ़ें","भगवान दामोदर को घी का दीप अर्पित करें","दामोदराष्टकम का पाठ करें","तुलसी महारानी को जल अर्पित करें","कुन्ती महारानी की प्रार्थनाएँ और गजेन्द्र मोक्ष पढ़ें","भगवद्-गीता पढ़ें","कृष्ण-कथा सुनें","भगवान को तुलसी दल अर्पित करें","दामोदर कार्यक्रम में सेवा करें","व्रजवास करें या व्रजधाम का स्मरण करें","हरिनाम-जप बढ़ाएँ"];
const COPY={
 en:{heroTitle:'Damodar Vows',heroSubtitle:'Kartik Sadhana Tracker · 26 Oct – 24 Nov 2026 · 30 days',heroTagline:'A time for purity · A time for devotion · A time for Krishna',authTitle:'Hare Krishna 🙏',authDesc:'Sign in with Google. Your vows and progress are saved to your account and follow you on every device.',daily:'🪔 Daily',myVows:'⭐ My Vows',analysis:'📊 Analysis',share:'Share',install:'Install',logout:'Logout',beforeStart:'Kartik begins in',setVows:'— set your vows now',today:'Today is Kartik day',of:'of',ended:'Kartik has concluded — see your journey',testing:'Testing mode: Day 1 is open so you can try selecting and unselecting vows. Days 2–30 stay locked until their dates. Clear the Day 1 test entries before the journey begins.',locked:'Future days are locked. Today and past days can be edited; each next day unlocks on its date.',finished:'The 30-day journey has ended. You can review and edit any day in the journey.',clearTest:'Clear Day 1 test data',day:'Day',purnima:'Kartik Purnima 🌕',bonus:'Bonus / closing day ✨',core:'⭐ Core vows',japaLabel:'Rounds of japa today',reflectionLabel:'Reflection / realization',notePlaceholder:'One line of gratitude...',vowsTitle:'Choose & shape your vows',vowsDesc:'⭐ Priority vows appear first every day. Switch vows on or off, rename them, or add your own. Daily checkmarks remain stored, but changing the active vow list can alter historical percentages.',addVowPlaceholder:'Add your own vow (e.g. No sleeping after sunrise)',add:'Add',goalLabel:'Daily japa goal (rounds)',reset:'Restore the 12 vows',journey:'30-day journey',legend:'Green = all active vows done · Gold fill = partial · Gold ring = all ⭐ core vows done',consistency:'Vow-wise consistency',japaChart:'Japa rounds per day',export:'Export backup',import:'Import',saving:'Saving…',saved:'Saved to your account ✓',offline:'Offline / connection issue — local copy retained; retrying…',conflictTitle:'Progress conflict detected',conflictText:'Another device has newer progress. Your local edits remain on this device. Export a backup before reloading the latest saved data.',exportLocal:'Export local backup',reloadLatest:'Reload latest progress',coreAvg:'⭐ Core avg',coreStreak:'⭐ Core streak',corePerfect:'⭐ Core-perfect days',allAvg:'All-vow avg',currentStreak:'Current streak',bestStreak:'Best streak',perfectDays:'Perfect days',totalRounds:'Total rounds',avgRounds:'Avg rounds/day',dayLocked:'That day is not editable yet.',langButton:'हिन्दी'},
 hi:{heroTitle:'दामोदर व्रत',heroSubtitle:'कार्तिक साधना ट्रैकर · 26 अक्टूबर – 24 नवम्बर 2026 · 30 दिन',heroTagline:'शुद्धता का समय · भक्ति का समय · कृष्ण का समय',authTitle:'हरे कृष्ण 🙏',authDesc:'Google से साइन इन करें। आपके व्रत और प्रगति आपके खाते में सुरक्षित रहते हैं और हर डिवाइस पर उपलब्ध रहते हैं।',daily:'🪔 दैनिक',myVows:'⭐ मेरे व्रत',analysis:'📊 विश्लेषण',share:'शेयर करें',install:'ऐप इंस्टॉल',logout:'लॉग आउट',beforeStart:'कार्तिक शुरू होने में',setVows:'दिन शेष — अभी अपने व्रत तय करें',today:'आज कार्तिक का दिन',of:'में से',ended:'कार्तिक साधना पूरी हुई — अपनी यात्रा देखें',testing:'परीक्षण मोड: व्रत चुनने और हटाने का अभ्यास करने के लिए केवल दिन 1 खुला है। दिन 2–30 अपनी तारीख आने तक बंद रहेंगे। कार्तिक शुरू होने से पहले दिन 1 का परीक्षण डेटा साफ़ कर दें।',locked:'भविष्य के दिन बंद हैं। आज और पिछले दिनों में बदलाव कर सकते हैं; अगला दिन अपनी तारीख पर खुलेगा।',finished:'30 दिनों की यात्रा पूरी हो चुकी है। आप किसी भी दिन को देख और संपादित कर सकते हैं।',clearTest:'दिन 1 का परीक्षण डेटा साफ़ करें',day:'दिन',purnima:'कार्तिक पूर्णिमा 🌕',bonus:'अतिरिक्त / समापन दिवस ✨',core:'⭐ मुख्य व्रत',japaLabel:'आज जप की मालाएँ',reflectionLabel:'चिंतन / अनुभूति',notePlaceholder:'कृतज्ञता की एक पंक्ति…',vowsTitle:'अपने व्रत चुनें और व्यवस्थित करें',vowsDesc:'⭐ मुख्य व्रत रोज़ सबसे ऊपर दिखते हैं। व्रत चालू/बंद करें, नाम बदलें या अपना व्रत जोड़ें। सोच-समझकर व्रत चुनें।',addVowPlaceholder:'अपना व्रत जोड़ें (जैसे सूर्योदय के बाद न सोना)',add:'जोड़ें',goalLabel:'दैनिक जप लक्ष्य (मालाएँ)',reset:'12 व्रत पुनः रखें',journey:'30-दिन की यात्रा',legend:'हरा = सभी सक्रिय व्रत पूरे · सुनहरा = कुछ व्रत पूरे · सुनहरी सीमा = सभी ⭐ मुख्य व्रत पूरे',consistency:'व्रत के अनुसार निरंतरता',japaChart:'प्रतिदिन जप की मालाएँ',export:'बैकअप डाउनलोड',import:'आयात करें',saving:'सहेजा जा रहा है…',saved:'आपके खाते में सुरक्षित ✓',offline:'कनेक्शन नहीं है — स्थानीय कॉपी सुरक्षित है; फिर प्रयास होगा…',conflictTitle:'प्रगति में टकराव मिला',conflictText:'दूसरे डिवाइस पर नई प्रगति सेव हुई है। आपके स्थानीय बदलाव इसी डिवाइस पर सुरक्षित हैं। नवीनतम डेटा लोड करने से पहले बैकअप डाउनलोड करें।',exportLocal:'स्थानीय बैकअप डाउनलोड',reloadLatest:'नवीनतम प्रगति लोड करें',coreAvg:'⭐ मुख्य व्रत औसत',coreStreak:'⭐ मुख्य व्रत निरंतरता',corePerfect:'⭐ मुख्य व्रत-पूर्ण दिन',allAvg:'सभी व्रत औसत',currentStreak:'वर्तमान निरंतरता',bestStreak:'सर्वश्रेष्ठ निरंतरता',perfectDays:'सभी व्रत-पूर्ण दिन',totalRounds:'कुल मालाएँ',avgRounds:'प्रतिदिन औसत मालाएँ',dayLocked:'यह दिन अभी संपादित नहीं किया जा सकता।',langButton:'English'}
};
Object.assign(COPY.en,{prabhu:'PrabhuJi',mataji:'Mataji',addrAsk:'How would you like to be greeted?',addrNone:'Just my name',addrNote:'Optional. Used only for your greeting and reminders. You can change it anytime with the ✎ button.',
 alertTitle:'🔔 Vow reminder',alertHelp:'Daily reminders run only from 26 Oct to 24 Nov 2026, and only when at least one active vow is incomplete. Sound and vibration depend on your phone/browser settings.',alertOff:'Off. Turn it on to get a reminder when any of today’s vows are incomplete.',alertOn:'On. If any vow is incomplete, you’ll get a reminder at {t}.',
 alertBlocked:'Notifications are blocked for this site. Allow them in your browser settings, then try again.',alertUnsupported:'This browser cannot receive reminders. Please use Chrome or Edge, or install the app.',
 alertIos:'On iPhone: tap Share, then Add to Home Screen, open Damodar Vows from your home screen, then turn this on.',alertNotConfigured:'Reminders are not set up on the server yet.',
 alertWorking:'Setting up reminders…',alertTestSent:'Test reminder sent. Please check your notifications ✓',alertTestFail:'Could not send the test reminder. Please try again.',alertTimeSaved:'Reminder time saved ✓',alertSaveFail:'Could not save. Please try again.',alertTestBtn:'Send test reminder',alertOffDone:'Reminders turned off.'});
Object.assign(COPY.hi,{prabhu:'प्रभु जी',mataji:'माता जी',addrAsk:'आप किस प्रकार संबोधित होना चाहेंगे?',addrNone:'केवल मेरा नाम',addrNote:'वैकल्पिक। इसका उपयोग केवल आपके अभिवादन और रिमाइंडर में होगा। आप कभी भी ✎ बटन से बदल सकते हैं।',
 alertTitle:'🔔 व्रत रिमाइंडर',alertHelp:'दैनिक रिमाइंडर केवल 26 अक्टूबर से 24 नवम्बर 2026 तक और तभी भेजा जाएगा जब कम-से-कम एक सक्रिय व्रत अधूरा हो। आवाज़ और कंपन आपके फोन/ब्राउज़र की सेटिंग पर निर्भर करते हैं।',alertOff:'बंद है। आज का कोई भी व्रत अधूरा रहने पर रिमाइंडर पाने के लिए इसे चालू करें।',alertOn:'चालू है। यदि कोई व्रत अधूरा होगा, तो {t} पर रिमाइंडर मिलेगा।',
 alertBlocked:'इस साइट के लिए नोटिफिकेशन बंद हैं। ब्राउज़र सेटिंग में अनुमति दें, फिर दोबारा प्रयास करें।',alertUnsupported:'यह ब्राउज़र रिमाइंडर प्राप्त नहीं कर सकता। कृपया Chrome या Edge उपयोग करें, या ऐप इंस्टॉल करें।',
 alertIos:'iPhone पर: Share दबाकर “Add to Home Screen” चुनें, होम स्क्रीन से Damodar Vows खोलें, फिर इसे चालू करें।',alertNotConfigured:'सर्वर पर रिमाइंडर अभी सेट नहीं हैं।',
 alertWorking:'रिमाइंडर सेट हो रहे हैं…',alertTestSent:'टेस्ट रिमाइंडर भेज दिया गया। कृपया अपने नोटिफिकेशन देखें ✓',alertTestFail:'टेस्ट रिमाइंडर नहीं भेजा जा सका। कृपया दोबारा प्रयास करें।',alertTimeSaved:'रिमाइंडर का समय सेव हो गया ✓',alertSaveFail:'सेव नहीं हो सका। कृपया दोबारा प्रयास करें।',alertTestBtn:'टेस्ट रिमाइंडर भेजें',alertOffDone:'रिमाइंडर बंद कर दिए गए।'});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const load=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let me=null,cacheIdentity=null,D=null,sel=0,timer=null,serverRevision=0,serverLoaded=false,dirty=false,saving=false,conflicted=false,syncingVisible=false;
let preferredLanguage=load('kv_preferred_lang')==='hi'?'hi':'en';
let languageSelected=false;
const cacheName=()=>`kv_cache_${cacheIdentity||me}`;
const pendingName=()=>`kv_pending_${cacheIdentity||me}`;
function savePending(base=serverRevision){try{if(D)save(pendingName(),{state:JSON.parse(JSON.stringify(D)),baseRevision:base,updatedAt:Date.now()})}catch(e){}}
function clearPending(){try{localStorage.removeItem(pendingName())}catch(e){}}
function sameState(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(e){return false}}
function trimFutureLogs(){if(!D||!D.log)return;const t=todayIdx(),last=t<0?0:Math.min(t,29);for(const key of Object.keys(D.log)){const i=Number(key);if(!Number.isInteger(i)||i<0||i>=30||i>last)delete D.log[key];}}
const fresh=()=>({vows:byCore(DEF.map((t,i)=>({id:'v'+i,t,on:true,core:CORE.includes('v'+i)}))),goal:16,log:{},lang:preferredLanguage});
function migrate(){
 if(!D||typeof D!=='object')D=fresh();
 if(!Array.isArray(D.vows))D.vows=fresh().vows;
 if(!D.log||typeof D.log!=='object'||Array.isArray(D.log))D.log={};
 if(!Number.isFinite(Number(D.goal)))D.goal=16;
 if(D.lang!=='hi')D.lang='en';
  if(!['prabhu','mataji','none'].includes(D.addr))delete D.addr;
 D.vows=D.vows.filter(v=>v&&typeof v==='object').slice(0,60).map((v,i)=>({id:typeof v.id==='string'?v.id:'v'+i,t:typeof v.t==='string'&&v.t.trim()?v.t:('Vow '+(i+1)),on:v.on!==false,core:!!v.core}));
 D.vows=byCore(D.vows);
 for(const [k,v] of Object.entries(D.log)){if(!v||typeof v!=='object'||Array.isArray(v)){delete D.log[k];continue;}if(!Array.isArray(v.done))v.done=[];if(!Number.isFinite(Number(v.rounds)))v.rounds=0;if(typeof v.note!=='string')v.note='';}
}
const lang=()=>D?(D.lang==='hi'?'hi':'en'):preferredLanguage;
const tr=k=>(COPY[lang()]&&COPY[lang()][k])||COPY.en[k]||k;
const fmt=i=>{const d=new Date(START);d.setDate(d.getDate()+i);return d.toLocaleDateString(lang()==='hi'?'hi-IN':'en-IN',{day:'numeric',month:'short'})};
const todayIdx=()=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).reduce((o,x)=>{if(x.type!=='literal')o[x.type]=Number(x.value);return o},{});return Math.floor((Date.UTC(p.year,p.month-1,p.day)-Date.UTC(2026,9,26))/864e5)};
function dayEditable(i){const t=todayIdx();if(t<0)return i===0;return i>=0&&i<N&&i<=Math.min(t,N-1)}
const api=(u,o={})=>fetch(u,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...o});
function setSync(key){const e=$('#sync');if(e)e.textContent=tr(key)}
function persist(){
 if(!D||conflicted)return;
 D.vows=byCore(D.vows);save(cacheName(),D);dirty=true;savePending(serverRevision);
 setSync(serverLoaded?'saving':'offline');
 clearTimeout(timer);
 if(serverLoaded)timer=setTimeout(push,700);
}
function exportData(filename='kartik-vows-backup.json'){
 if(!D)return;
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D,null,2)],{type:'application/json'}));a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
function showConflict(message){
 conflicted=true;clearTimeout(timer);$('#conflictPane').classList.remove('hide');
 $('#conflictTitle').textContent=tr('conflictTitle');$('#conflictText').textContent=message||tr('conflictText');
 $('#sync').textContent=tr('conflictTitle');render();
}
async function push(){
 if(!serverLoaded||!dirty||saving||conflicted)return;
 clearTimeout(timer);saving=true;let retryDelay=700;
 try{
  while(dirty&&!conflicted){
   const snapshot=JSON.parse(JSON.stringify(D));const baseRevision=serverRevision;dirty=false;
   const r=await api('/api/kartik',{method:'PUT',body:JSON.stringify({state:snapshot,revision:baseRevision})});
   let payload={};try{payload=await r.json()}catch{}
   if(r.status===409){serverRevision=Number.isSafeInteger(payload.revision)?payload.revision:serverRevision;dirty=false;showConflict(payload.error);return}
   if(r.status===400&&payload.code==='FUTURE_DAY_LOCKED'){dirty=false;showConflict(payload.error);return}
   if(r.status===428||r.status===401){dirty=true;serverLoaded=false;showConflict(payload.error||'Your session needs to be refreshed. Export a backup before reloading.');return}
   if(!r.ok)throw new Error(payload.error||'save failed');
   if(Number.isSafeInteger(payload.revision))serverRevision=payload.revision;
   save(cacheName(),D);
   if(dirty)savePending(serverRevision);else clearPending();
   setSync('saved');
  }
 }catch(e){dirty=true;savePending(serverRevision);setSync('offline');retryDelay=5000}
 finally{saving=false;if(dirty&&serverLoaded&&!conflicted){clearTimeout(timer);timer=setTimeout(push,retryDelay)}if(!document.hidden&&!conflicted)setTimeout(syncOnVisible,80)}
}
async function syncOnVisible(){
 if(!me||document.hidden||syncingVisible||conflicted||saving)return;
 syncingVisible=true;
 try{
  if(serverLoaded&&dirty){clearTimeout(timer);await push();if(conflicted||dirty)return;}
  const r=await api('/api/kartik');if(!r.ok)return;
  const j=await r.json();const rev=Number.isSafeInteger(j.revision)?j.revision:0;
  if(!serverLoaded){
   serverLoaded=true;serverRevision=rev;
   if(dirty&&j.state){showConflict();return;}
   if(dirty&&!j.state){await push();return;}
   if(j.state&&Array.isArray(j.state.vows))D=j.state;
   migrate();save(cacheName(),D);sel=Math.min(Math.max(todayIdx(),0),N-1);render();setSync('saved');return;
  }
  if(rev>serverRevision){
   if(dirty||saving){showConflict();return;}
   D=j.state&&Array.isArray(j.state.vows)?j.state:fresh();serverRevision=rev;migrate();
   preferredLanguage=D.lang==='hi'?'hi':'en';save('kv_preferred_lang',preferredLanguage);languageSelected=false;
   sel=Math.min(Math.max(todayIdx(),0),N-1);save(cacheName(),D);applyLanguage();setSync('saved');
  }
 }catch(e){}finally{syncingVisible=false}
}
async function startSession(u){
 me=u.name||u.email||'Devotee';cacheIdentity=String(u.email||me).trim().toLowerCase();
 let pendingConflict=false;
 try{
  const r=await api('/api/kartik');if(!r.ok)throw new Error('load failed');
  const j=await r.json();serverLoaded=true;serverRevision=Number.isSafeInteger(j.revision)?j.revision:0;
  const cached=load(cacheName())||load(`kv_cache_${me}`);const pending=load(pendingName());
  const remote=j.state&&Array.isArray(j.state.vows)?j.state:null;
  if(pending&&pending.state&&Array.isArray(pending.state.vows)){
   if(remote&&sameState(pending.state,remote)){D=remote;clearPending();}
   else if(Number(pending.baseRevision)===serverRevision){D=pending.state;dirty=true;}
   else if(!remote&&Number(pending.baseRevision)===0){D=pending.state;dirty=true;}
   else{D=pending.state;dirty=true;pendingConflict=true;}
  }else if(remote){D=remote;}
  else if(cached&&Array.isArray(cached.vows)){D=cached;trimFutureLogs();dirty=true;savePending(serverRevision);}
  else D=fresh();
 }catch(e){serverLoaded=false;const pending=load(pendingName());D=(pending&&pending.state)||load(cacheName())||load(`kv_cache_${me}`)||fresh();if(pending&&pending.state)dirty=true;}
 migrate();
 // Clean up any future-day entries from older versions after login. Keep pending
 // conflict data untouched so a devotee can export it before choosing which copy wins.
 if(!pendingConflict){const beforeTrim=JSON.stringify(D.log);trimFutureLogs();if(JSON.stringify(D.log)!==beforeTrim){dirty=true;save(cacheName(),D);savePending(serverRevision)}}
 if(languageSelected&&D.lang!==preferredLanguage){D.lang=preferredLanguage;dirty=true;savePending(serverRevision)}else{preferredLanguage=D.lang;save('kv_preferred_lang',preferredLanguage)}
 enter();
 if(pendingConflict)showConflict();
 if(dirty&&serverLoaded&&!conflicted)timer=setTimeout(push,300);
 if(!serverLoaded)setSync('offline');else if(!dirty)setSync('saved');
}
async function boot(){
 try{const r=await api('/api/me');if(r.ok)return startSession(await r.json())}catch(e){}
 try{const c=await (await api('/api/config')).json();
  if(!c.googleClientId){$('#err').textContent='Google client ID is not configured on the server.';return}
  const sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';
  sc.onload=()=>{google.accounts.id.initialize({client_id:c.googleClientId,callback:async resp=>{
    const r=await api('/api/auth/google',{method:'POST',body:JSON.stringify({credential:resp.credential})});
    if(r.ok)startSession(await r.json());else $('#err').textContent='Google login failed. Please try again.'}});
   google.accounts.id.renderButton($('#gbtn'),{theme:'filled_black',size:'large',shape:'pill',text:'continue_with'})};
  document.head.appendChild(sc)}catch(e){$('#err').textContent='Cannot reach the server.'}}
function updateWhen(){const t=todayIdx();if(t<0)$('#when').textContent=`${tr('beforeStart')} ${-t} ${lang()==='hi'?'दिन बाकी हैं':'day'+(-t>1?'s':'')+' — set your vows now'}`;
 else if(t>=N)$('#when').textContent=tr('ended');else $('#when').textContent=`${tr('today')} ${t+1} ${tr('of')} ${N}`;}
function helloText(){const raw=me.split('@')[0].split(' ')[0],first=raw.charAt(0).toUpperCase()+raw.slice(1).toLowerCase(),a=D&&D.addr;
 const suffix=a==='prabhu'?' '+tr('prabhu'):a==='mataji'?' '+tr('mataji'):'';return (lang()==='hi'?'हरे कृष्ण, ':'Hare Krishna, ')+first+suffix+' 🙏'}
function applyAddrCopy(){$('#addrAsk').textContent=tr('addrAsk');$('#addrPrabhu').textContent=tr('prabhu');$('#addrMataji').textContent=tr('mataji');$('#addrNone').textContent=tr('addrNone');$('#addrNote').textContent=tr('addrNote')}
function askAddress(force){if(!D||conflicted)return;if(!force&&D.addr)return;applyAddrCopy();$('#addrModal').classList.remove('hide');const b=$('#addrPrabhu');if(b)b.focus()}
function closeAddress(){$('#addrModal').classList.add('hide')}
$$('#addrModal [data-addr]').forEach(b=>b.onclick=()=>{if(!D)return;D.addr=b.dataset.addr;persist();$('#hello').textContent=helloText();closeAddress()});
$('#addrEdit').onclick=()=>askAddress(true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAddress()});
function enter(){const t=todayIdx();sel=Math.min(Math.max(t,0),N-1);
 $('#authV').classList.add('hide');$('#appV').classList.remove('hide');
 $('#hello').textContent=helloText();
 applyLanguage();shloka();loadAlerts();askAddress(false)}
function applyLanguage(){
 document.documentElement.lang=lang();document.title=lang()==='hi'?'दामोदर व्रत – कार्तिक साधना ट्रैकर':'Damodar Vows – Kartik Sadhana Tracker';
 const ids=['heroTitle','heroSubtitle','heroTagline','authTitle','authDesc','vowsTitle','vowsDesc','journeyTitle','legend','consistencyTitle','japaChartTitle'];
 const keys=['heroTitle','heroSubtitle','heroTagline','authTitle','authDesc','vowsTitle','vowsDesc','journey','legend','consistency','japaChart'];
 ids.forEach((id,i)=>{const el=$('#'+id);if(el)el.textContent=tr(keys[i])});
 $('#tabToday').textContent=tr('daily');$('#tabVows').textContent=tr('myVows');$('#tabStats').textContent=tr('analysis');
 if(me&&D)$('#hello').textContent=helloText();
 $('#coreLabel').textContent=tr('core');
 $('#langBtn').textContent=tr('langButton');$('#authLangBtn').textContent=tr('langButton');$('#shareBtn').textContent=tr('share');$('#installBtn').textContent=tr('install');$('#out').textContent=tr('logout');
 $('#japaLabel').childNodes[0].nodeValue=tr('japaLabel')+' ';
 $('#reflectionLabel').childNodes[0].nodeValue=tr('reflectionLabel')+' ';
 $('#note').placeholder=tr('notePlaceholder');$('#nv').placeholder=tr('addVowPlaceholder');$('#addV').textContent=tr('add');
 $('#goalLabel').childNodes[0].nodeValue=tr('goalLabel')+' ';$('#reset').textContent=tr('reset');
 $('#exp').textContent=tr('export');$('#importLabel').childNodes[0].nodeValue=tr('import')+' ';
 $('#clearTest').textContent=tr('clearTest');$('#exportLocal').textContent=tr('exportLocal');$('#reloadLatest').textContent=tr('reloadLatest');
 $('#conflictTitle').textContent=tr('conflictTitle');if(!conflicted)$('#conflictText').textContent=tr('conflictText');if(me&&D){renderAlerts();applyAddrCopy()}
 updateWhen();render();
}
function shloka(){const s=SH[(todayIdx()+800)%SH.length];$('#shl').innerHTML=`${s[0].replace(/\n/g,'<br>')}<small>${s[1]}</small>`}
const act=()=>D.vows.filter(v=>v.on);
function displayVow(v){const m=/^v(\d+)$/.exec(v.id||'');if(lang()==='hi'&&m&&Number(m[1])<HDEF.length&&v.t===DEF[Number(m[1])])return HDEF[Number(m[1])];return v.t}
function pctOf(i){const l=D.log[i];if(!l)return 0;const a=act();return a.length?a.filter(v=>l.done.includes(v.id)).length/a.length:0}
function coreOf(i){const l=D.log[i],a=act().filter(v=>v.core);if(!l||!a.length)return 0;return a.filter(v=>l.done.includes(v.id)).length/a.length}
function render(){if(!D)return;renderDays();renderList();renderVows();renderStats()}
function renderDays(){const t=todayIdx();$('#days').innerHTML=Array.from({length:N},(_,i)=>{const p=pctOf(i),locked=!dayEditable(i)||conflicted;return `<button class="d ${i==sel?'sel':''} ${i==t?'today':''} ${p>=1?'full':p>0?'part':''}" data-i="${i}" ${locked?'disabled':''} aria-label="${tr('day')} ${i+1}, ${fmt(i)}${locked?' — '+tr('dayLocked'):''}"><b>${i+1}</b>${fmt(i).split(' ')[0]}</button>`}).join('');
 $$('.d').forEach(b=>b.onclick=()=>{if(b.disabled)return;sel=+b.dataset.i;render()});
 const clear=$('#clearTest');clear.classList.toggle('hide',todayIdx()>=0);clear.disabled=conflicted;
 $('#lockHint').textContent=t<0?tr('testing'):t>=N?tr('finished'):tr('locked');}
function renderList(){const editable=dayEditable(sel)&&!conflicted;const l=D.log[sel]||{done:[],rounds:0,note:''};const a=act();
 let title=`${tr('day')} ${sel+1} · ${fmt(sel)}`;if(sel===28)title+=' · '+tr('purnima');if(sel===29)title+=' · '+tr('bonus');$('#dayT').textContent=title;
 const p=Math.round(pctOf(sel)*100);$('#dayPct').textContent=p+'%';$('#dayBar').style.width=p+'%';const cp=Math.round(coreOf(sel)*100);$('#corePct').textContent=cp+'%';$('#coreBar').style.width=cp+'%';
 $('#list').innerHTML=a.length?a.map(v=>`<label class="vow ${l.done.includes(v.id)?'done':''} ${v.core?'core':''}"><input type="checkbox" data-id="${esc(v.id)}" ${l.done.includes(v.id)?'checked':''} ${editable?'':'disabled'}><span class="t"><b>${v.core?'⭐ ':''}${esc(displayVow(v))}</b></span></label>`).join(''):`<p>${lang()==='hi'?'कोई सक्रिय व्रत नहीं है। मेरे व्रत में व्रत जोड़ें।':'No active vows. Add some in My Vows.'}</p>`;
 $$('#list input').forEach(c=>c.onchange=()=>{if(!dayEditable(sel)||conflicted){render();return}const next=D.log[sel]||{done:[],rounds:0,note:''};next.done=c.checked?[...new Set([...next.done,c.dataset.id])]:next.done.filter(x=>x!==c.dataset.id);D.log[sel]=next;persist();render();if(pctOf(sel)>=1&&c.checked)burst()});
 $('#rounds').value=l.rounds||'';$('#note').value=l.note||'';$('#rounds').disabled=!editable;$('#note').disabled=!editable;
 $('#rounds').oninput=e=>{if(!dayEditable(sel)||conflicted)return;const next=D.log[sel]||{done:[],rounds:0,note:''};next.rounds=Math.max(0,Math.min(64,Number(e.target.value)||0));D.log[sel]=next;persist();renderStats()};
 $('#note').onchange=e=>{if(!dayEditable(sel)||conflicted)return;const next=D.log[sel]||{done:[],rounds:0,note:''};next.note=String(e.target.value||'').slice(0,1000);D.log[sel]=next;persist()};}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderVows(){$('#vlist').innerHTML=D.vows.map((v,i)=>`<div class="vow"><input type="checkbox" ${v.on?'checked':''} data-on="${i}" ${conflicted?'disabled':''}><span class="t"><input value="${esc(displayVow(v))}" data-ed="${i}" ${conflicted?'disabled':''}></span><button class="g sm" data-core="${i}" ${conflicted?'disabled':''}>${v.core?'⭐ '+(lang()==='hi'?'मुख्य':'Priority'):'☆ '+(lang()==='hi'?'मुख्य बनाएँ':'Make priority')}</button><button class="g sm" data-del="${i}" ${conflicted?'disabled':''}>${lang()==='hi'?'हटाएँ':'Remove'}</button></div>`).join('');
 $$('[data-on]').forEach(c=>c.onchange=()=>{D.vows[c.dataset.on].on=c.checked;persist();render()});
 $$('[data-ed]').forEach(c=>c.onchange=()=>{D.vows[c.dataset.ed].t=c.value.trim()||D.vows[c.dataset.ed].t;persist();render()});
 $$('[data-core]').forEach(c=>c.onclick=()=>{const v=D.vows[c.dataset.core];v.core=!v.core;persist();render()});
 $$('[data-del]').forEach(c=>c.onclick=()=>{D.vows.splice(Number(c.dataset.del),1);persist();render()});
 $('#nv').disabled=conflicted;$('#addV').disabled=conflicted;$('#reset').disabled=conflicted;$('#goal').disabled=conflicted;$('#imp').disabled=conflicted;
 $('#goal').value=D.goal;$('#goal').onchange=e=>{D.goal=Math.max(1,Math.min(64,Number(e.target.value)||16));persist();renderStats()}}
function renderStats(){const t=Math.min(todayIdx(),N-1);const upto=Math.max(t,-1);
 let full=0,sum=0,rounds=0,streak=0,best=0,run=0,cfull=0,csum=0,cs=0;
 for(let i=0;i<=upto;i++){const c=coreOf(i);csum+=c;if(c>=1)cfull++;const p=pctOf(i);sum+=p;if(p>=1){full++;run++;best=Math.max(best,run)}else run=0;rounds+=(D.log[i]?.rounds)||0}
 for(let i=upto;i>=0;i--){if(pctOf(i)>=1)streak++;else if(i!=upto)break}
 for(let i=upto;i>=0;i--){if(coreOf(i)>=1)cs++;else if(i!=upto)break}
 const days=upto+1;
 $('#kpi').innerHTML=[[days>0?Math.round(csum/days*100)+'%':'—',tr('coreAvg')],[cs,tr('coreStreak')],[cfull,tr('corePerfect')],[days>0?Math.round(sum/days*100)+'%':'—',tr('allAvg')],[streak,tr('currentStreak')],[best,tr('bestStreak')],[full,tr('perfectDays')],[rounds,tr('totalRounds')],[days>0?(rounds/days).toFixed(1):'—',tr('avgRounds')]].map(x=>`<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
 $('#heat').innerHTML=Array.from({length:N},(_,i)=>{const p=pctOf(i);return `<div title="${tr('day')} ${i+1}: ${Math.round(p*100)}%" style="${coreOf(i)>=1?'box-shadow:inset 0 0 0 2px var(--gold);':''}background:${p>=1?'rgba(143,214,148,.45)':p>0?'rgba(243,201,105,.35)':'rgba(255,255,255,.05)'}">${i+1}</div>`}).join('');
 $('#vbars').innerHTML=D.vows.map(v=>{let c=0;for(let i=0;i<=upto;i++)if(D.log[i]?.done.includes(v.id))c++;const p=days>0?Math.round(c/days*100):0;return `<div style="margin:8px 0"><div class="row sp" style="font-size:14px"><span>${v.core?'⭐ ':''}${esc(displayVow(v))}</span><span style="color:var(--gold)">${c}/${Math.max(days,0)}</span></div><div class="bar"><i style="width:${p}%"></i></div></div>`}).join('');
 const mx=Math.max(D.goal,...Array.from({length:N},(_,i)=>D.log[i]?.rounds||0),1);const gy=130-(D.goal/mx)*120;
 $('#chart').innerHTML=`<line x1="0" x2="600" y1="${gy}" y2="${gy}" stroke="#f08fb0" stroke-dasharray="4 4"/>`+Array.from({length:N},(_,i)=>{const r=D.log[i]?.rounds||0,h=r/mx*120;return `<rect x="${i*20+3}" y="${130-h}" width="14" height="${h}" rx="3" fill="#f3c969"/>`}).join('')}
function burst(){const vw=document.documentElement.clientWidth;for(let i=0;i<6;i++)floatOne('🪔',12+i*(vw-60)/5)}
const FL=['नमामीश्वरं सच्-चिद्-आनन्द-रूपं\nलसत्-कुण्डलं गोकुले भ्राजमानम्','यशोदा-भियोलूखलाद् धावमानं\nपरामृष्टम् अत्यन्ततो द्रुत्य गोप्या','रुदन्तं मुहुर् नेत्र-युग्मं मृजन्तम्\nकराम्भोज-युग्मेन सातङ्क-नेत्रम्','मुहुः श्वास-कम्प-त्रिरेखाङ्क-कण्ठ\nस्थित-ग्रैवं दामोदरं भक्ति-बद्धम्','इतीदृक् स्वलीलाभिर् आनन्दकुण्डे\nस्वघोषं निमज्जन्तम् आख्यापयन्तम्','तदीयेषितज्ञेषु भक्तैर् जितत्वं\nपुनः प्रेमतस्तं शतावृत्ति वन्दे','वरं देव मोक्षं न मोक्षावधिं वा\nन चान्यं वृणे ऽहं वरेषाद् अपीह','इदं ते वपुर् नाथ गोपालबालं\nसदा मे मनस्य् आविरास्तां किमन्यैः','इदं ते मुखाम्भोजम् अत्यन्त-नीलैर्\nवृतं कुन्तलैः स्निग्ध-रक्तैश् च गोप्या','मुहुश् चुम्बितं बिम्ब-रक्ताधरं मे\nमनस्य् आविरास्ताम् अलं लक्ष-लाभैः','नमो देव दामोदरानन्त विष्णो\nप्रसीद प्रभो दुःख जालाब्धिमग्नम्','कृपादृष्टिवृष्ट्यातिदीनं बतानु\nगृहाणेष माम् अज्ञम् एध्य् अक्षिदृश्यः','कुवेरात्मजौ bद्धमूर्त्यैव यद्वत्\nत्वया मोचितौ भक्तिभाजौ कृतौ च','तथा प्रेम-भक्तिं स्वकां मे प्रयच्छ\nन मोक्षे ग्रहो मे ऽस्ति दामोदरेह','नमस् ते ‘स्तु दाम्ने स्फुरद्-दीप्ति-धाम्ने\nत्वदीयोदरायाथ विश्वस्य धाम्ने','नमो राधिकायै त्वदीयप्रियायै\nनमो ऽनन्तलीलाय देवाय तुभ्यम्','हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे\nहरे राम हरे राम राम राम हरे हरे'];
const SPEED=38;let lastT=0;
function floatOne(txt,x){
 if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const vw=document.documentElement.clientWidth,vh=innerHeight,e=document.createElement('div');
 e.className='fl';e.textContent=txt||FL[Math.floor(Math.random()*FL.length)];
 e.style.fontSize=(vw<700?17:24)+'px';e.style.visibility='hidden';$('#float').appendChild(e);
 const w=e.offsetWidth,h=e.offsetHeight,now=performance.now();
 if(x===undefined&&lastT&&(now-lastT)/1000*SPEED<h+60){e.remove();return}
 e.style.left=(x!==undefined?x:12+Math.random()*Math.max(0,vw-24-w))+'px';
 const d=1.15*vh/SPEED;e.style.animationDuration=d+'s';e.style.visibility='';
 if(x===undefined)lastT=now;setTimeout(()=>e.remove(),d*1000)}
const tick=()=>{if(!document.hidden)floatOne()};setInterval(tick,1000);
(function tryBg(list){if(!list.length)return;const u=list.splice(Math.floor(Math.random()*list.length),1)[0],im=new Image();im.onload=()=>{$('#bg').style.backgroundImage=`url(${u})`};im.onerror=()=>tryBg(list);im.src=u})([...BG]);
$('#out').onclick=async()=>{if(!confirm(lang()==='hi'?'क्या आप लॉग आउट करना चाहते हैं?':'Log out of your account?'))return;try{await api('/api/auth/logout',{method:'POST'});if(window.google)google.accounts.id.disableAutoSelect()}catch(e){}location.reload()};
$$('.tabs [data-t]').forEach(b=>b.onclick=()=>{$$('.tabs [data-t]').forEach(x=>x.classList.remove('on'));b.classList.add('on');['today','vows','stats'].forEach(s=>$('#'+s).classList.toggle('hide',s!==b.dataset.t));render()});
function toggleLanguage(){preferredLanguage=lang()==='hi'?'en':'hi';languageSelected=true;save('kv_preferred_lang',preferredLanguage);if(D){D.lang=preferredLanguage;persist()}applyLanguage()}
$('#langBtn').onclick=()=>{if(conflicted)return;toggleLanguage()};$('#authLangBtn').onclick=()=>toggleLanguage();
let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;});
$('#installBtn').onclick=async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();try{await deferredInstallPrompt.userChoice}catch(e){}deferredInstallPrompt=null;return}const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);alert(ios?(lang()==='hi'?'Safari में Share बटन दबाएँ और “Add to Home Screen” चुनें।':'In Safari, tap Share, then choose “Add to Home Screen”.'):(lang()==='hi'?'ब्राउज़र मेन्यू खोलें और “Install app” या “Add to Home screen” चुनें।':'Open your browser menu and choose “Install app” or “Add to Home screen”.'))};
$('#shareBtn').onclick=async()=>{const url=location.origin+'/kartik',data={title:'Damodar Vows – Kartik Sadhana Tracker',text:'Join a 30-day Kartik Sadhana journey of daily vows, japa and reflection. Hare Krishna!'};try{if(navigator.share)await navigator.share({...data,url});else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(url);alert(lang()==='hi'?'ट्रैकर लिंक कॉपी हो गया।':'Tracker link copied. Share it on WhatsApp.')}else prompt('Copy the tracker link',url)}catch(e){if(e&&e.name!=='AbortError'){try{prompt('Copy the tracker link',url)}catch{}}}};
$('#clearTest').onclick=()=>{if(todayIdx()>=0||conflicted)return;if(!confirm(lang()==='hi'?'दिन 1 का परीक्षण डेटा हटाएँ?':'Clear all Day 1 test entries?'))return;D.log[0]={done:[],rounds:0,note:''};persist();render()};
$('#exportLocal').onclick=()=>exportData('kartik-vows-local-backup.json');$('#reloadLatest').onclick=()=>{clearPending();location.reload()};
$('#addV').onclick=()=>{if(conflicted)return;const t=$('#nv').value.trim();if(!t)return;if(D.vows.length>=60){alert('Maximum 60 vows.');return}D.vows.push({id:'c'+Date.now(),t,on:true,core:false});$('#nv').value='';persist();render()};
$('#reset').onclick=()=>{if(conflicted)return;const have=new Set(D.vows.map(v=>v.t));DEF.forEach((t,i)=>{if(!have.has(t))D.vows.push({id:'v'+i,t,on:true,core:CORE.includes('v'+i)})});persist();render()};
$('#exp').onclick=()=>exportData();
$('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!Array.isArray(d.vows)||d.vows.length>60||!d.log||typeof d.log!=='object')throw new Error('Invalid backup');D=d;migrate();trimFutureLogs();persist();applyLanguage();alert(lang()==='hi'?'बैकअप आयात हो गया।':'Backup imported. Future-day entries were removed.')}catch(x){alert(lang()==='hi'?'यह बैकअप फ़ाइल मान्य नहीं है।':'This backup file is not valid.')}finally{e.target.value=''}};r.readAsText(f)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncOnVisible()});window.addEventListener('focus',syncOnVisible);window.addEventListener('pageshow',syncOnVisible);

/* ===== Evening vow reminders (web push) ===== */
const PUSH_OK='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const IS_IOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
const alertState={configured:true,enabled:false,hour:18,minute:0,busy:false};
const myTz=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Kolkata'}catch(e){return 'Asia/Kolkata'}};
const b64ToU8=s=>{const p='='.repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};
const sameBuf=(a,b)=>{if(!a||!b||a.byteLength!==b.byteLength)return false;const x=new Uint8Array(a),y=new Uint8Array(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return false;return true};
const pad2=n=>String(n).padStart(2,'0');
function timeLabel(h,m){return new Date(2000,0,1,h,m).toLocaleTimeString(lang()==='hi'?'hi-IN':'en-IN',{hour:'numeric',minute:'2-digit',hour12:true})}
function alertTimeValue(){const v=($('#alertTime').value||'18:00').split(':').map(Number);return {hour:v[0]||0,minute:v[1]||0}}
function renderAlerts(msg,bad){
 $('#alertTitle').textContent=tr('alertTitle');$('#alertTest').textContent=tr('alertTestBtn');$('#alertHelp').textContent=tr('alertHelp');
 const supported=PUSH_OK,granted=supported&&Notification.permission==='granted',on=alertState.enabled&&granted;
 $('#alertToggle').checked=on;$('#alertToggle').disabled=alertState.busy;$('#alertTime').value=pad2(alertState.hour)+':'+pad2(alertState.minute);
 $('#alertTest').classList.toggle('hide',!on);
 let t;if(msg)t=msg;else if(!supported)t=IS_IOS?tr('alertIos'):tr('alertUnsupported');else if(!alertState.configured)t=tr('alertNotConfigured');
 else if(Notification.permission==='denied')t=tr('alertBlocked');else if(on)t=tr('alertOn').replace('{t}',timeLabel(alertState.hour,alertState.minute));else t=tr('alertOff');
 const e=$('#alertStatus');e.textContent=t;e.style.color=bad?'#ff9a9a':'var(--mut)'}
async function swReady(){await navigator.serviceWorker.register('/sw.js');return navigator.serviceWorker.ready}
async function ensureSubscribed(){
 const cfg=await (await api('/api/push/config')).json();if(!cfg.enabled||!cfg.publicKey){const e=new Error('notconfigured');e.code='notconfigured';throw e}
 const reg=await swReady(),key=b64ToU8(cfg.publicKey);let sub=await reg.pushManager.getSubscription();
 if(sub&&!sameBuf(sub.options&&sub.options.applicationServerKey,key.buffer)){await sub.unsubscribe();sub=null}
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
 const r=await api('/api/push/subscribe',{method:'POST',body:JSON.stringify({subscription:sub.toJSON(),app:'kartik'})});
 if(!r.ok)throw new Error('subscribe failed');return sub}
async function saveAlertSettings(enabled){const t=alertTimeValue();
 const r=await api('/api/kartik/alerts',{method:'PUT',body:JSON.stringify({enabled,hour:t.hour,minute:t.minute,tz:myTz()})});
 if(!r.ok)throw new Error('settings failed');const j=await r.json();Object.assign(alertState,{configured:j.configured,enabled:j.enabled,hour:j.hour,minute:j.minute})}
async function sendTest(){const r=await api('/api/kartik/alerts/test',{method:'POST'});if(!r.ok){let j={};try{j=await r.json()}catch(e){}const e=new Error(j.error||'test failed');e.code=j.code;throw e}}
async function loadAlerts(){
 try{const r=await api('/api/kartik/alerts');if(r.ok){const j=await r.json();Object.assign(alertState,{configured:j.configured,enabled:j.enabled,hour:j.hour,minute:j.minute});
  if(j.enabled&&j.tz!==myTz())saveAlertSettings(true).catch(()=>{})}}catch(e){}
 renderAlerts();
 if(alertState.enabled&&PUSH_OK&&Notification.permission==='granted')ensureSubscribed().catch(()=>{})}   /* keeps this device's subscription fresh */
$('#alertToggle').onchange=async ev=>{const want=ev.target.checked;if(alertState.busy){ev.target.checked=!want;return}
 alertState.busy=true;let msg='',bad=false;
 try{
  if(want){
   if(!PUSH_OK){const e=new Error('unsupported');e.code='unsupported';throw e}
   if(!alertState.configured){const e=new Error('notconfigured');e.code='notconfigured';throw e}
   let perm=Notification.permission;if(perm==='default')perm=await Notification.requestPermission();
   if(perm!=='granted'){const e=new Error('blocked');e.code='blocked';throw e}
   renderAlerts(tr('alertWorking'));await ensureSubscribed();await saveAlertSettings(true);await sendTest();msg=tr('alertTestSent')
  }else{
   await saveAlertSettings(false);
   try{const reg=await navigator.serviceWorker.getRegistration('/sw.js'),sub=reg&&await reg.pushManager.getSubscription();
    if(sub){await api('/api/push/subscribe',{method:'DELETE',body:JSON.stringify({endpoint:sub.endpoint})});await sub.unsubscribe()}}catch(e){}
   msg=tr('alertOffDone')}
 }catch(err){ev.target.checked=!want;bad=true;
  if(want){alertState.enabled=false;try{await saveAlertSettings(false)}catch(e){}}
  msg=err.code==='blocked'?tr('alertBlocked'):err.code==='unsupported'?(IS_IOS?tr('alertIos'):tr('alertUnsupported')):err.code==='notconfigured'||err.code==='PUSH_NOT_CONFIGURED'?tr('alertNotConfigured'):(String(err.message||'').slice(0,160)||tr('alertTestFail'))}
 finally{alertState.busy=false;renderAlerts(msg,bad)}};
$('#alertTime').onchange=async()=>{
 const previous={hour:alertState.hour,minute:alertState.minute};
 const t=alertTimeValue();alertState.hour=t.hour;alertState.minute=t.minute;
 try{
  // Persist the selected time even when reminders are currently OFF.
  await saveAlertSettings(alertState.enabled);
  renderAlerts(tr('alertTimeSaved'));
 }catch(e){
  alertState.hour=previous.hour;alertState.minute=previous.minute;
  $('#alertTime').value=pad2(previous.hour)+':'+pad2(previous.minute);
  renderAlerts(tr('alertSaveFail'),true);
 }
};
$('#alertTest').onclick=async()=>{if(alertState.busy)return;alertState.busy=true;renderAlerts(tr('alertWorking'));
 try{await ensureSubscribed();await sendTest();alertState.busy=false;renderAlerts(tr('alertTestSent'))}
 catch(e){alertState.busy=false;renderAlerts(String(e&&e.message||'').slice(0,160)||tr('alertTestFail'),true)}};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
boot();
