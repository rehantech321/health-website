(function(){
  // The admin panel (/admin) is a separate React app under the same root
  // layout and has none of the site shell; nothing below applies there.
  if(!document.getElementById('promoBanner')){ window.Eldava = window.Eldava || { rehydrate:function(){} }; return; }
  var PROMO = { code:'ELDAVA15', pct:0.15, claimed:false };
  // Service name -> its dedicated page (/assessments/...), for linking the
  // price list and menus to those pages. Rendered by SharedShell.
  var SERVICE_PAGES = {};
  try{ SERVICE_PAGES = JSON.parse(document.getElementById('eldavaServicePages').textContent) || {}; }catch(e){}

  var SERVICES = [
    {cat:'mind', name:'Child Autism Assessment', desc:'Full diagnostic assessment for children', price:915, dur:'90 min'},
    {cat:'mind', name:'Child ADHD Assessment', desc:'Full diagnostic assessment for children', price:800, dur:'75 min'},
    {cat:'mind', name:'Combined Child Assessment', desc:'ADHD and autism, children', price:1375, dur:'120 min'},
    {cat:'mind', name:'Adult ADHD Assessment', desc:'Diagnostic assessment for adults', price:685, dur:'60 min'},
    {cat:'mind', name:'Adult Autism Assessment', desc:'Diagnostic assessment for adults', price:800, dur:'75 min'},
    {cat:'mind', name:'Adult Combined Assessment', desc:'ADHD and autism, adults', price:1145, dur:'90 min'},
    {cat:'mind', name:'Psychiatry Consultation', desc:'Depression, anxiety, OCD', price:175, dur:'45 min'},
    {cat:'mind', name:'Trauma and PTSD', desc:'EMDR and trauma focused CBT', price:140, dur:'50 min'},
    {cat:'mind', name:'Eating Disorders', desc:'Assessment and therapy', price:175, dur:'50 min'},
    {cat:'women', name:'Antenatal Consultation', desc:'Pregnancy advice', price:35, dur:'30 min'},
    {cat:'women', name:'Postnatal Consultation', desc:'Post birth recovery advice', price:70, dur:'30 min'},
    {cat:'women', name:'Lactation Consultation', desc:'Breastfeeding support', price:110, dur:'45 min'},
    {cat:'women', name:'Gynaecology Advice', desc:'Menstrual disorders, menopause', price:115, dur:'30 min'},
    {cat:'women', name:'Fertility Advice', desc:'Pre conception, hormone tests', price:175, dur:'45 min'},
    {cat:'women', name:'Menopause Advice', desc:'HRT, symptom management', price:115, dur:'30 min'},
    {cat:'child', name:'Speech and Language Therapy', desc:'Per session', price:70, dur:'45 min'},
    {cat:'child', name:'Occupational Therapy', desc:'Per session', price:80, dur:'45 min'},
    {cat:'child', name:'Educational Psychologist Assessment (EHCP)', desc:'Diagnostic assessment covering dyslexia and other specific learning difficulties, written up as an EHCP-ready report for schools and local authorities', price:1035, dur:'120 min'},
    {cat:'child', name:'Paediatric Physiotherapy', desc:'Per session', price:85, dur:'45 min'},
    {cat:'body', name:'Dermatology Advice', desc:'Remote photo diagnosis', price:60, dur:'20 min'},
    {cat:'body', name:'Cardiology Advice', desc:'Risk assessment, lifestyle', price:60, dur:'30 min'},
    {cat:'body', name:'ENT Triage', desc:'Hearing, tinnitus advice', price:60, dur:'20 min'},
    {cat:'body', name:'Ophthalmology Advice', desc:'Cataract, glaucoma advice', price:60, dur:'20 min'},
    {cat:'body', name:'Neurology Advice', desc:'Headache, migraine advice', price:60, dur:'30 min'},
    {cat:'body', name:'Urology Advice', desc:'Prostate, UTI advice', price:60, dur:'20 min'},
    {cat:'body', name:'Dyslexia and SpLD Assessment (DSA)', desc:'Adult diagnostic assessment and report for university Disabled Students’ Allowance applications or workplace needs assessments', price:748, dur:'150 min'},
    {cat:'testing', name:'QbTest Objective ADHD Testing', desc:'Computer based attention and activity test, added to any ADHD assessment', price:150, dur:'25 min'},
    {cat:'testing', name:'Pharmacogenomic Medication Test', desc:'Genetic test to help guide medication choice and dosing', price:450, dur:'Sample only'},
    {cat:'testing', name:'SensoDetect Neuro-Auditory Screening', desc:'Objective auditory screening to support diagnosis', price:75, dur:'20 min'},
    {cat:'testing', name:'Enhanced Assessment Bundle', desc:'Full assessment plus QbTest, PGx and SensoDetect', price:1450, dur:'Multi-part'},
    {cat:'testing', name:'Cognitive Function Test', desc:'Structured memory and focus assessment', price:195, dur:'40 min'},
    {cat:'testing', name:'Fertility Hormone Panel', desc:'AMH, FSH, oestradiol and progesterone', price:225, dur:'Sample only'},
    {cat:'testing', name:'Menopause Hormone Panel', desc:'FSH, oestradiol and testosterone', price:150, dur:'Sample only'},
    {cat:'postdx', name:'ADHD Coaching Programme', desc:'12 one to one coaching sessions', price:850, dur:'12 sessions'},
    {cat:'postdx', name:'CBT for Anxiety', desc:'12 one to one cognitive behavioural therapy sessions', price:1150, dur:'12 sessions'},
    {cat:'postdx', name:'Parenting Support Programme', desc:'Structured support for parents of a newly diagnosed child', price:475, dur:'6 weeks'},
    {cat:'postdx', name:'Nutrition Consultation', desc:'Dietitian led advice, including for ADHD and autism related eating patterns', price:95, dur:'45 min'},
    {cat:'postdx', name:'Medication Titration and Monitoring', desc:'12 week medication plan with review appointments', price:950, dur:'12 weeks'},
    {cat:'postdx', name:'Annual Care Plan', desc:'Annual review, 4 coaching sessions and prescription support', price:650, dur:'12 months'},
    {cat:'premium', name:'Complete Pathway Package', desc:'Assessment, coaching, medication review and objective testing', price:3200, dur:'Multi-session'},
    {cat:'premium', name:'Priority Access Package', desc:'Appointment within 48 hours, evening and weekend slots', price:1800, dur:'60 min'},
    {cat:'premium', name:'Family Assessment Package', desc:'Two adult and two child assessments plus family coaching', price:3600, dur:'Multi-session'},
    {cat:'legal', name:'Medico-Legal Expert Report', desc:'Court ready psychiatric or psychological expert witness report, clinician available for cross examination', price:2800, dur:'From 3 hours'},
    {cat:'dementia', name:'Dementia Memory Assessment', desc:'Full diagnostic memory assessment with structured cognitive testing, medical history, medication review and a collateral history from a family member where possible, plus a written report for your GP or memory clinic', price:895, dur:'90 min'},
    {cat:'dementia', name:'Mild Cognitive Impairment Pathway', desc:'Structured assessment and a personalised monitoring plan, with a 6 month review appointment to track change over time', price:495, dur:'60 min plus 6 month review'},
    {cat:'dementia', name:'Post-Diagnostic Dementia Support Programme', desc:'Six clinician-led sessions for the person diagnosed and their family, covering what the diagnosis means, planning ahead, communication strategies and accessing support', price:575, dur:'6 weekly sessions'},
    {cat:'dementia', name:'Dementia Carer Support Programme', desc:'Six clinician-led sessions for a family carer, covering behaviour changes, managing your own health and knowing when and how to ask for help', price:475, dur:'6 weekly sessions'},
    {cat:'dementia', name:'Mental Capacity Assessment', desc:'Clinician conducted and signed assessment for Lasting Power of Attorney, deputyship applications (COP3), wills and property or financial decisions, with a written report issued to your legal adviser', price:695, dur:'90 min'},
    {cat:'dementia', name:'Best Interests Assessment', desc:'Section 4 Mental Capacity Act assessment for care and treatment decisions, including care plan reviews and discharge planning', price:750, dur:'90 min'},
    {cat:'premium', name:'Dementia Family Pathway', desc:'A memory assessment, the carer support programme, a capacity review and priority access to our clinicians when things change, across the first year after concerns begin', price:2950, dur:'Multi-session, 12 months'},
    {cat:'legal', name:'Dementia Medico-Legal Report', desc:'Court ready expert report on capacity, testamentary capacity or litigation capacity, prepared by an experienced clinician available for cross examination', price:2400, dur:'From 3 hours'},
    {cat:'mens', name:"Men's Health MOT", desc:'Full review of cardiovascular risk, hormones, weight, sleep and lifestyle, with a written summary and a plan for the next 12 months', price:150, dur:'45 min'},
    {cat:'mens', name:'Male Hormone Panel', desc:'Testosterone and related markers by home sample kit, reviewed in a consultation with a clinician', price:195, dur:'Sample only'},
    {cat:'mens', name:'Erectile Dysfunction Consultation', desc:'Private consultation covering causes, lifestyle factors and treatment options, including medication where appropriate', price:95, dur:'30 min'},
    {cat:'mens', name:'Prostate Health Review', desc:'Advice on urinary symptoms, PSA testing decisions and when to be seen in person', price:85, dur:'30 min'},
    {cat:'mens', name:'Male Fertility Assessment', desc:'Semen analysis results reviewed with a clinician, plus hormone testing where indicated, lifestyle guidance and a referral pathway to specialist treatment if needed', price:185, dur:'45 min'},
    {cat:'women', name:'Endometriosis Specialist Advice', desc:'Consultation with a clinician experienced in endometriosis and pelvic pain, covering your history, which tests to request and how to get referred', price:165, dur:'45 min'},
    {cat:'women', name:'Endometriosis Pathway', desc:'Specialist advice, a hormone panel by home sample, and a written referral letter and summary for your GP or gynaecologist', price:495, dur:'Multi-part'},
    {cat:'women', name:'PCOS Assessment and Advice', desc:'Symptoms reviewed, testing explained and a management plan covering hormones, weight, skin and fertility implications, with a written summary for your GP', price:165, dur:'45 min'},
    {cat:'skin', name:'Rapid Skin Assessment', desc:'Secure photo and video review by a clinician, with written assessment and treatment guidance, or a clear answer on whether you need an in person examination', price:95, dur:'20 min'},
    {cat:'skin', name:'Skin Fast Track Package', desc:'Assessment plus a structured private referral pathway for lesions that need urgent in person review. We do not provide a skin cancer diagnosis by telehealth; any lesion of concern is escalated for in person review.', price:450, dur:'Multi-part'},
    {cat:'hearing', name:'Hearing Assessment', desc:'Structured consultation on your hearing concerns, history and function, with objective screening and guidance on whether hearing aids would help', price:95, dur:'30 min'},
    {cat:'hearing', name:'Private Hearing Aid Pathway', desc:'Assessment, hearing test coordination and a managed referral to private audiology with transparent pricing', price:450, dur:'Multi-part'},
    {cat:'hearing', name:'Cataract Triage', desc:'Consultation on your visual symptoms, how cataracts are assessed, what surgery involves, and whether to seek referral now or wait', price:75, dur:'30 min'},
    {cat:'hearing', name:'Pre-Operative Eye Assessment Review', desc:'For patients with a surgery date who want their assessment, risks and aftercare explained by an independent clinician before they sign consent', price:250, dur:'45 min'},
    {cat:'founding', name:'Founding 500: Dementia Memory Assessment Voucher', desc:'One of 500 prepaid vouchers at founding pricing, before full price applies. Lock the price now, redeem after launch on 30 September 2026, or gift it to someone you love. Full price £895.', price:695, dur:'90 min, redeemable after launch'},
    {cat:'founding', name:'Founding 500: Fertility Advice plus Hormone Panel Voucher', desc:'One of 500 prepaid vouchers at founding pricing, before full price applies. Lock the price now, redeem after launch on 30 September 2026, or gift it to someone you love. Full price £400.', price:345, dur:'45 min plus sample kit, redeemable after launch'},
    {cat:'founding', name:'Founding 500: Neurodivergent Assessment Voucher', desc:'One of 500 prepaid vouchers at founding pricing, before full price applies. Lock the price now, redeem after launch on 30 September 2026, or gift it to someone you love. Full price £685.', price:545, dur:'75 min, redeemable after launch'}
  ];
  var CATS = {all:'All', mind:'Mental Health and Neurodevelopmental', women:"Women's Health and Maternity", child:'Children and SEND', body:'Adult Specialties', testing:'Objective Testing', postdx:'Post-Diagnostic Support', premium:'Premium Packages', legal:'Medico-Legal', dementia:'Dementia Care', mens:"Men's Health", skin:'Skin and Dermatology', hearing:'Hearing and Eye Care', founding:'Founding 500 Vouchers'};
  // Real, path-based routes for every page, used for pushState navigation, sitemap generation and
  // static prerendering. Hash links (#pricing) still work as a fallback for old bookmarks.
  var PAGE_PATHS = {
    home: '/', pricing: '/pricing/', how: '/how-it-works/', pathway: '/complete-pathway/',
    pharmacy: '/pharmacy-delivery/', academy: '/clinician-training-academy/', ai: '/guided-intake-technology/',
    outcomes: '/outcomes-and-transparency/', corporate: '/for-employers/', schools: '/for-schools/',
    universities: '/for-universities/', insurers: '/for-insurers/', 'health-systems': '/for-health-systems/',
    legal: '/for-legal-and-solicitors/', charity: '/charity-partnership/', founding500: '/founding-500/',
    blog: '/insights/', founders: '/founders-circle/', events: '/events/', partner: '/join-the-network/',
    about: '/about/', 'founder-note': '/founders-note/', register: '/account/register/', profile: '/account/profile/',
    screening: '/free-screening-tools/', 'clinician-login': '/clinician/sign-in/', 'clinician-portal': '/clinician/portal/'
  };
  var PATH_PAGES = {};
  Object.keys(PAGE_PATHS).forEach(function(id){ PATH_PAGES[PAGE_PATHS[id]] = id; });

  var FOUNDING_VOUCHER_CAP = 500;
  // Overwritten from GET /api/vouchers/count on load - the real number of paid
  // vouchers. This starting value only shows until that request returns.
  var FOUNDING_VOUCHERS_CLAIMED = 0;

  var COUNTRIES = [
    {name:'United Kingdom', flag:'🇬🇧'}, {name:'United States', flag:'🇺🇸'}, {name:'Canada', flag:'🇨🇦'},
    {name:'Australia', flag:'🇦🇺'}, {name:'Germany', flag:'🇩🇪'}, {name:'Ireland', flag:'🇮🇪'},
    {name:'New Zealand', flag:'🇳🇿'}, {name:'South Africa', flag:'🇿🇦'}, {name:'Singapore', flag:'🇸🇬'},
    {name:'Spain', flag:'🇪🇸'}, {name:'Italy', flag:'🇮🇹'}, {name:'France', flag:'🇫🇷'},
    {name:'Netherlands', flag:'🇳🇱'}, {name:'Sweden', flag:'🇸🇪'}, {name:'Norway', flag:'🇳🇴'},
    {name:'United Arab Emirates', flag:'🇦🇪'}, {name:'Poland', flag:'🇵🇱'}, {name:'Hungary', flag:'🇭🇺'},
    {name:'Slovenia', flag:'🇸🇮'}, {name:'Portugal', flag:'🇵🇹'}
  ];
  var selectedCountry = '';
  // Flag emoji are deliberately not used in the option labels: Windows has no
  // flag glyphs and renders them as bare letter pairs ("GB United Kingdom"),
  // which reads as a bug. Plain names are legible everywhere.
  function renderCountryOptions(el, placeholder){
    if(!el) return;
    el.innerHTML = '<option value="">'+(placeholder||'Select your country')+'</option>'
      + COUNTRIES.map(function(c){ return '<option value="'+c.name+'">'+c.name+'</option>'; }).join('');
    el.classList.toggle('is-placeholder', !el.value);
  }

  // ============ VALIDATED SCREENING INSTRUMENTS ============
  // These are the same public-domain / widely licensed instruments implemented server-side in the
  // real intake platform's scoring service (ASRS v1.1, AQ-10, PHQ-9, GAD-7 are free for clinical
  // use; PC-PTSD-5 and SCOFF are published, freely used screening tools). Nothing here diagnoses
  // anything - every result is framed as an informal indication for a licensed clinician to confirm,
  // matching the same honesty standard already used on the free screening tools page.
  var FREQ5 = ['Never','Rarely','Sometimes','Often','Very Often'];
  var AGREE4 = ['Definitely agree','Slightly agree','Slightly disagree','Definitely disagree'];
  var FREQ4 = ['Not at all','Several days','More than half the days','Nearly every day'];
  var YESNO = ['No','Yes'];

  var ASRS6 = [
    {t:'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?', shade:2},
    {t:'How often do you have difficulty getting things in order when you have to do a task that requires organisation?', shade:2},
    {t:'How often do you have problems remembering appointments or obligations?', shade:2},
    {t:'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?', shade:3},
    {t:'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?', shade:3},
    {t:'How often do you feel overly active and compelled to do things, like you were driven by a motor?', shade:3}
  ];
  // Verified against the Autism Research Centre AQ-10 (Adult) instrument, September 2026.
  var AQ10 = [
    {t:'I often notice small sounds when others do not.', on:'agree'},
    {t:'I usually concentrate more on the whole picture, rather than the small details.', on:'disagree'},
    {t:'I find it easy to do more than one thing at once.', on:'disagree'},
    {t:'If there is an interruption, I can switch back to what I was doing very quickly.', on:'disagree'},
    {t:"I find it easy to 'read between the lines' when someone is talking to me.", on:'disagree'},
    {t:'I know how to tell if someone listening to me is getting bored.', on:'disagree'},
    {t:"When I'm reading a story, I find it difficult to work out the characters' intentions.", on:'agree'},
    {t:'I like to collect information about categories of things (for example, types of car, types of bird, types of train, types of plant).', on:'agree'},
    {t:'I find it easy to work out what someone is thinking or feeling just by looking at their face.', on:'disagree'},
    {t:"I find it difficult to work out people's intentions.", on:'agree'}
  ];
  var PHQ9_ITEMS = ['Little interest or pleasure in doing things','Feeling down, depressed, or hopeless','Trouble falling or staying asleep, or sleeping too much','Feeling tired or having little energy','Poor appetite or overeating','Feeling bad about yourself, or that you are a failure, or have let yourself or your family down','Trouble concentrating on things, such as reading or watching television','Moving or speaking so slowly that other people could have noticed, or the opposite, being fidgety or restless','Thoughts that you would be better off dead, or of hurting yourself in some way'];
  var GAD7_ITEMS = ['Feeling nervous, anxious, or on edge','Not being able to stop or control worrying','Worrying too much about different things','Trouble relaxing',"Being so restless that it's hard to sit still",'Becoming easily annoyed or irritable','Feeling afraid as if something awful might happen'];
  var PCPTSD5_ITEMS = ['Had nightmares about the event, or thought about it when you did not want to','Tried hard not to think about it, or went out of your way to avoid situations that reminded you of it','Been constantly on guard, watchful, or easily startled','Felt numb or detached from people, activities or your surroundings','Felt guilty, or unable to stop blaming yourself or others for the event'];
  var SCOFF_ITEMS = ['Do you make yourself sick because you feel uncomfortably full?','Do you worry you have lost control over how much you eat?','Have you recently lost more than one stone (about 6.4kg) in a 3 month period?','Do you believe yourself to be fat when others say you are too thin?','Would you say that food dominates your life?'];

  function phqSeverity(t){ return t<=4?'minimal':t<=9?'mild':t<=14?'moderate':t<=19?'moderately severe':'severe'; }
  function gadSeverity(t){ return t<=4?'minimal':t<=9?'mild':t<=14?'moderate':'severe'; }

  var CP_SCREENERS = {
    adhd: {
      tool:'ASRS v1.1 Screener (Part A)',
      note:'The same six-question screener used worldwide, including by the WHO, as a first-line ADHD indicator in adults.',
      groups:[{scale:FREQ5, items:ASRS6.map(function(i){return i.t;})}],
      interpret:function(ans){
        var shaded=0; for(var i=0;i<6;i++){ if(ans[i]>=ASRS6[i].shade) shaded++; }
        var sig = shaded>=4;
        return {html:'<div class="cp-tag">ASRS Part A &middot; '+shaded+' of 6 in the shaded range</div><p>'+(sig?'Your answers fall in a range often associated with ADHD in adults.':'Your answers do not strongly suggest ADHD on this brief screener.')+'</p>', significant:sig};
      }
    },
    autism: {
      tool:'AQ-10',
      note:'The 10-item Autism Spectrum Quotient short screener used in many NHS and private referral pathways.',
      groups:[{scale:AGREE4, items:AQ10.map(function(i){return i.t;})}],
      interpret:function(ans){
        var score=0; for(var i=0;i<10;i++){ var agreed = ans[i]<=1; if((AQ10[i].on==='agree')===agreed) score++; }
        var sig = score>=6;
        return {html:'<div class="cp-tag">AQ-10 &middot; '+score+' of 10</div><p>'+(sig?'Your answers fall in a range where a fuller autism assessment is often recommended.':'Your answers do not strongly suggest autism on this brief screener.')+'</p>', significant:sig};
      }
    },
    combined: {
      tool:'ASRS Part A and AQ-10',
      note:'Both brief screeners together, since this assessment covers ADHD and autism.',
      groups:[
        {label:'ADHD indicators (ASRS Part A)', scale:FREQ5, items:ASRS6.map(function(i){return i.t;})},
        {label:'Autism indicators (AQ-10)', scale:AGREE4, items:AQ10.map(function(i){return i.t;})}
      ],
      interpret:function(ans){
        var a = CP_SCREENERS.adhd.interpret(ans.slice(0,6));
        var b = CP_SCREENERS.autism.interpret(ans.slice(6,16));
        return {html:a.html+b.html, significant:a.significant||b.significant};
      }
    },
    psychiatry: {
      tool:'PHQ-9 and GAD-7',
      note:'The same standardised depression and anxiety questionnaires clinicians ask before a psychiatry consultation.',
      groups:[
        {label:'Over the last two weeks (PHQ-9)', scale:FREQ4, items:PHQ9_ITEMS},
        {label:'Over the last two weeks (GAD-7)', scale:FREQ4, items:GAD7_ITEMS}
      ],
      interpret:function(ans){
        var phq = ans.slice(0,9), gad = ans.slice(9,16);
        var phqTotal = phq.reduce(function(s,v){return s+v;},0);
        var gadTotal = gad.reduce(function(s,v){return s+v;},0);
        var item9 = phq[8] > 0;
        cp.selfHarmFlagFromScreener = item9;
        return {
          html:'<div class="cp-tag">PHQ-9 &middot; '+phqTotal+'/27 &middot; '+phqSeverity(phqTotal)+' range</div>'
            +'<div class="cp-tag">GAD-7 &middot; '+gadTotal+'/21 &middot; '+gadSeverity(gadTotal)+' range</div>'
            +(item9?'<p><b>You indicated some thoughts of self-harm in your answers above.</b> Please see the safety guidance on the next step, whatever you answer there.</p>':'<p>These scores help your clinician prepare, and will be reviewed properly at your consultation.</p>'),
          significant: phqTotal>=10 || gadTotal>=10 || item9
        };
      }
    },
    trauma: {
      tool:'PC-PTSD-5',
      note:'A five-question primary care screen for post-traumatic stress, developed by the US National Center for PTSD.',
      groups:[{scale:YESNO, items:PCPTSD5_ITEMS}],
      interpret:function(ans){
        var yes = ans.filter(function(v){return v===1;}).length;
        var sig = yes>=3;
        return {html:'<div class="cp-tag">PC-PTSD-5 &middot; '+yes+' of 5 "yes"</div><p>'+(sig?'This is commonly treated as a positive screen, meaning a fuller trauma assessment is usually worthwhile.':'This does not meet the commonly used threshold for a positive screen.')+'</p>', significant:sig};
      }
    },
    eating: {
      tool:'SCOFF Questionnaire',
      note:'A five-question screen for eating disorders, developed at St George’s Hospital Medical School, London.',
      groups:[{scale:YESNO, items:SCOFF_ITEMS}],
      interpret:function(ans){
        var yes = ans.filter(function(v){return v===1;}).length;
        var sig = yes>=2;
        return {html:'<div class="cp-tag">SCOFF &middot; '+yes+' of 5 "yes"</div><p>'+(sig?'Two or more "yes" answers is the commonly used threshold suggesting a fuller assessment is worthwhile.':'Your answers do not meet the commonly used threshold on this brief screen.')+'</p>', significant:sig};
      }
    },
    general: {
      tool:null,
      note:'There is no single standardised screening questionnaire for this service, so we keep this step short.',
      groups:[],
      interpret:function(){ return {html:'<p>Your clinician will take a full history at your consultation. There is no standardised pre-screen for this service.</p>', significant:false}; }
    }
  };

  function cpTrackFor(specialtyName){
    var svc = findService(specialtyName);
    var n = (specialtyName||'').toLowerCase();
    if(n.indexOf('combined')!==-1 || n.indexOf('family assessment')!==-1) return 'combined';
    if(n.indexOf('adhd')!==-1) return 'adhd';
    if(n.indexOf('autism')!==-1) return 'autism';
    if(n.indexOf('psychiatry')!==-1) return 'psychiatry';
    if(n.indexOf('trauma')!==-1 || n.indexOf('ptsd')!==-1) return 'trauma';
    if(n.indexOf('eating disorder')!==-1) return 'eating';
    return 'general';
  }

  var ENQUIRY_FORMS = {
    clinician: {
      title:'Apply as a clinician', team:'clinicians@eldava.com',
      sub:'Tell us your specialty and where you are registered, and our clinical recruitment team will follow up by email.',
      fields:[
        {id:'eqSpecialty', label:'Specialty', type:'select', options:['Psychiatry','Clinical psychology','Paediatrics','Mental health nursing','Occupational therapy','Speech and language therapy','Other']},
        {id:'eqRegBody', label:'Registration body', type:'select', options:['GMC (UK)','HCPC (UK)','NMC (UK)','AHPRA (Australia)','PSYPACT / state board (US)','Other, will confirm by email']},
        {id:'eqExperience', label:'Years assessing ADHD or autism', type:'select', options:['None yet, training route','Under 2 years','2 to 5 years','Over 5 years']}
      ]
    },
    pharmacist: {
      title:'Register your interest', team:'clinicians@eldava.com',
      sub:'Tell us your registration and prescribing scope, and our pharmacy team will follow up by email.',
      fields:[
        {id:'eqRegBody', label:'Registration body', type:'select', options:['GPhC (UK)','PSNI (Northern Ireland)','Other, will confirm by email']},
        {id:'eqPrescriber', label:'Prescribing status', type:'select', options:['Independent prescriber','Supplementary prescriber','Not yet, working towards it']},
        {id:'eqInterest', label:'Main area of interest', type:'select', options:['Private prescriptions','Pharmacy delivery operations','Both']}
      ]
    },
    tech: {
      title:'Register your interest in a technical role', team:'hello@eldava.com',
      sub:'Tell us your discipline and what you have worked on. We do not have a public job board yet; enquiries go straight to our founding team.',
      fields:[
        {id:'eqDiscipline', label:'Discipline', type:'select', options:['Software engineering','Product design','Data and analytics','Security and compliance','Other']},
        {id:'eqPortfolio', label:'Portfolio or LinkedIn link', type:'text', placeholder:'https://'}
      ]
    },
    testimonial: {
      title:'Share your story', team:'hello@eldava.com',
      sub:'Tell us who you are and how you work with Eldava Health. We will only ever publish it with your explicit sign-off, credited to your real name.',
      fields:[
        {id:'eqRelation', label:'You are a', type:'select', options:['Patient','Clinician','Referral or pharmacy partner','Other']}
      ]
    },
    corporate: {
      title:'Request an employer proposal', team:'partnerships@eldava.com',
      sub:'Tell us about your organisation and which programme you need, and we will come back with pricing in your local currency.',
      fields:[
        {id:'eqSize', label:'Organisation size', type:'select', options:['Under 100 employees','100 to 500','500 to 2,000','Over 2,000']},
        {id:'eqProgramme', label:'Programme of interest', type:'select', options:['Essential','Growth','Enterprise','Not sure yet']},
        {id:'eqCountry', label:'Primary country of operation', type:'text', placeholder:'e.g. United Kingdom'}
      ]
    },
    'health-systems': {
      title:'Discuss a backlog pilot', team:'telehealth@eldava.com',
      sub:'Tell us about your organisation and the pathway you want to pilot, and our health systems team will follow up.',
      fields:[
        {id:'eqOrgType', label:'Organisation type', type:'select', options:['NHS trust or Integrated Care Board','Other public health commissioner','Government or public health body outside the UK','Other']},
        {id:'eqPathway', label:'Pathway of interest', type:'select', options:['Dementia and memory assessment','Neurodevelopmental (ADHD/autism) assessment','Both','Not sure yet']},
        {id:'eqCountry', label:'Country or region', type:'text', placeholder:'e.g. United Kingdom'}
      ]
    },
    legal: {
      title:'Send instructions or an enquiry', team:'telehealth@eldava.com',
      sub:'Tell us what your instruction requires, and we will confirm whether it falls within our clinicians’ licensure in your jurisdiction before accepting it.',
      fields:[
        {id:'eqReportType', label:'Report required', type:'select', options:['Mental capacity assessment (LPA / deputyship)','Testamentary capacity assessment','Best interests assessment','Medico-legal expert witness report','Not sure yet']},
        {id:'eqJurisdiction', label:'Jurisdiction', type:'text', placeholder:'e.g. England and Wales'}
      ]
    },
    schools: {
      title:'Request a school proposal', team:'partnerships@eldava.com',
      sub:'Tell us your pupil numbers and current SEN process, and our education team will follow up.',
      fields:[
        {id:'eqPupils', label:'Approximate pupil numbers', type:'select', options:['Under 500','500 to 1,500','Over 1,500, or multi-academy trust']},
        {id:'eqProgramme', label:'Programme of interest', type:'select', options:['Individual SEN assessment','Multi-academy trust programme','Staff training','Not sure yet']}
      ]
    },
    universities: {
      title:'Request a university proposal', team:'partnerships@eldava.com',
      sub:'Tell us your student numbers and funding route, and our education team will follow up.',
      fields:[
        {id:'eqStudents', label:'Approximate student numbers', type:'select', options:['Under 5,000','5,000 to 20,000','Over 20,000']},
        {id:'eqProgramme', label:'Programme of interest', type:'select', options:['Student neurodiversity screening','University partnership programme','Staff training','Not sure yet']}
      ]
    },
    insurers: {
      title:'Discuss a network arrangement', team:'partnerships@eldava.com',
      sub:'Tell us about your organisation, and our partnerships team will follow up. Commercial terms are negotiated per contract.',
      fields:[
        {id:'eqOrgType', label:'Organisation type', type:'select', options:['Private health insurer','NHS trust or public body','Development finance or government body','Other']},
        {id:'eqCountry', label:'Primary country of operation', type:'text', placeholder:'e.g. United Kingdom'}
      ]
    },
    pathway: {
      title:'Ask about the Complete Pathway', team:'patients@eldava.com',
      sub:"We'll confirm exact pricing for your country and needs.",
      fields:[
        {id:'eqCondition', label:'Main area of concern', type:'select', options:['ADHD','Autism','Both ADHD and autism','Not sure yet']},
        {id:'eqCountry', label:'Country', type:'text', placeholder:'e.g. United Kingdom'}
      ]
    },
    'default': {
      title:'Talk to our care team', team:'patients@eldava.com',
      sub:'Tell us what you need and we will point you to the right assessment.',
      fields:[
        {id:'eqReason', label:'This is about', type:'select', options:['Booking or pricing help','A question before I book','Media or press enquiry','Something else']}
      ]
    }
  };

  function renderEnquiryFields(kind){
    var cfg = ENQUIRY_FORMS[kind] || ENQUIRY_FORMS['default'];
    var html = '';
    (cfg.fields||[]).forEach(function(f){
      if(f.type==='select'){
        html += '<div class="frow"><label for="'+f.id+'">'+f.label+'</label><select id="'+f.id+'" data-eqf="1"><option value="">Select</option>';
        f.options.forEach(function(o){ html += '<option value="'+o+'">'+o+'</option>'; });
        html += '</select></div>';
      } else {
        html += '<div class="frow"><label for="'+f.id+'">'+f.label+'</label><input id="'+f.id+'" data-eqf="1" type="text" placeholder="'+(f.placeholder||'')+'"></div>';
      }
    });
    return html;
  }

  var SCREEN_OPTS = ['Never','Rarely','Sometimes','Often','Very often'];
  var SCREENERS = {
    adhd: {
      label:'ADHD traits',
      questions:[
        'How often do you have trouble wrapping up the final details of a task once the hard parts are done?',
        'How often do you have difficulty getting things in order when a task requires organisation?',
        'How often do you have problems remembering appointments or obligations?',
        'How often do you feel restless or fidgety when you have to sit still for a long time?',
        'How often do you find yourself talking more than you meant to in social situations?'
      ]
    },
    autism: {
      label:'autism traits',
      questions:[
        'How often do you notice small details that other people do not?',
        'How often do you find it hard to work out what someone is thinking or feeling from their face or tone of voice?',
        'How often do you prefer a predictable routine and find unexpected changes difficult?',
        'How often do you find it hard to make small talk or casual conversation?',
        'How often do you get intensely focused on specific topics or interests?'
      ]
    }
  };
  var screenState = { adhd:[null,null,null,null,null], autism:[null,null,null,null,null] };

  function renderScreenerQuestions(type){
    var data = SCREENERS[type];
    var html = '';
    data.questions.forEach(function(q, qi){
      html += '<div style="margin-bottom:16px;"><p style="font-weight:600; margin-bottom:8px;">'+(qi+1)+'. '+q+'</p><div style="display:flex; gap:6px; flex-wrap:wrap;">';
      SCREEN_OPTS.forEach(function(opt, oi){
        html += '<div class="radio-opt" style="flex:none; padding:8px 12px; font-size:0.78rem;" data-q="'+qi+'" data-v="'+oi+'" onclick="Eldava.answerScreener(\''+type+'\','+qi+','+oi+',this)">'+opt+'</div>';
      });
      html += '</div></div>';
    });
    html += '<button class="btn btn-primary btn-sm" onclick="Eldava.finishScreener(\''+type+'\')">See my result</button>';
    return html;
  }

  var USPS = [
    {t:'See a specialist this week, not in two years', d:'Public waiting lists for ADHD, autism and general specialist assessment now run from months to years across the UK, Canada, Australia and much of Europe. Eldava Health books most patients within a week and delivers a written report within days of the session.'},
    {t:'Priced well below the typical private clinic', d:'Assisted intake and reporting cut administrative overhead, and the saving is reflected in the price. The launch offer takes a further 15% off for the first 2,000 patients, and every price can be split into 3 instalments.'},
    {t:'Every clinician is licensed and verified', d:'Clinicians hold an active registration recognised in the country where the patient is located, checked before onboarding and reviewed on an ongoing basis. No unlicensed practitioners are permitted on the platform, in any market.'},
    {t:'Assisted intake, human diagnosis', d:'A structured intake and validated screening tools speed up scoring and paperwork before your session. The diagnosis itself, and the final report, is always made and signed by your treating licensed clinician.'},
    {t:'Reports accepted by schools, employers and insurers', d:'Reports follow DSM-5 and ICD-11 standards and are formatted for EHCP applications, workplace adjustment requests and most insurance claims.'},
    {t:'Guided, not generic, intake', d:'Our guided pre-consultation asks a handful of targeted questions instead of a blank form, and gives you a summary you can review before you ever pick a time slot.'},
    {t:'Support that continues after diagnosis', d:'Coaching, medication titration and annual care plans are available once you have a diagnosis, so the relationship does not end the day your report lands.'},
    {t:'Pay in full, or pay in 3', d:'Every self-serve price on this site can be split into 3 interest-free instalments at checkout, so the headline price is never a barrier to booking.'}
  ];

  var FAQ = [
    {q:'Why are your prices lower than other private clinics?', a:'Assisted intake and report drafting reduce administrative overhead, and that saving is passed on in the price. The clinical work itself, the interview, the judgement and the sign off, is always carried out by a licensed clinician.'},
    {q:'Can I pay in instalments?', a:'Yes. Every service on this site can be spread across 3 monthly payments through Klarna or PayPal where available in your country, or paid in full by card. Missing a payment could affect your ability to get credit in future, and full terms are shown before you confirm.'},
    {q:'Is the 15% launch offer time limited?', a:'Yes. It is available to the first 2,000 patients who book using code ELDAVA15. Prices shown already reflect this code where it has been applied.'},
    {q:'Is this accepted by my doctor, school, employer, or solicitor?', a:'Your report is prepared by a qualified clinician licensed in your region and written to professional standards. Most doctors, schools, employers and solicitors accept it, but acceptance decisions sit with them, not with us, and we will always tell you honestly if your pathway is one where acceptance varies.'},
    {q:'Can you assess me if I am outside the UK?', a:'Yes, where we have clinicians licensed in your region. At booking, you tell us where you are, and we match you accordingly. If we cannot serve your region yet, we tell you before you pay, not after.'},
    {q:'Are your reports valid in my country?', a:'Every report is prepared by a clinician licensed in your region. Acceptance by your doctor, school, employer, solicitor, or court rests with them, and we will tell you honestly before booking if your pathway is one where acceptance varies by institution.'},
    {q:'Do I need a referral to book an assessment?', a:'No referral is required for most assessments. You can book directly. A small number of services, and some insurance funded bookings, may ask for a GP letter, which we will tell you about before you pay.'},
    {q:'Which countries does Eldava Health operate in?', a:'Eldava Health currently operates across 20 countries including the United Kingdom, United States, Canada, Australia, Germany and Ireland, with clinicians registered under the relevant body in each jurisdiction.'},
    {q:'Do you diagnose conditions?', a:'Where a pathway can be delivered responsibly by telehealth, yes, by a qualified clinician, with a signed report. Where a condition requires physical examination or testing we cannot perform remotely, we do not pretend otherwise. We assess, we escalate, and we refer.'},
    {q:'What happens if you find something serious?', a:'Every red flag finding follows a documented escalation pathway. You will never receive a concerning result with no route forward.'},
    {q:'Who will I actually speak to?', a:'A qualified clinician matched to your pathway and licensed in your region, working under our Clinical Director. Never a chatbot, never a sales person, never a call centre.'},
    {q:'How is my data kept private?', a:'Clinical data is encrypted in transit and at rest, access is limited to your treating clinician and authorised staff, and no information is shared with third parties without your consent, other than where required by law.'},
    {q:'What if I need more than a single assessment?', a:'Once you have a diagnosis you can add coaching, medication titration and monitoring, or an annual care plan. These are listed under Post-Diagnostic Support on the pricing page.'},
    {q:'Do you work with schools, employers, universities, insurers or health systems?', a:'Yes. We run separate partnership programmes for workplace screening, school and multi-academy trust support, university student assessment, insurer partnerships and public health system backlog pilots, priced individually. Use the Join the network page, or the relevant organisation page, to request a proposal.'}
  ];

  var ARTICLE_CATS = {all:'All articles', adhd:'ADHD', autism:'Autism', assessment:'Getting assessed', workplace:'Workplace & education', careers:'Working with us', company:'About Eldava Health'};

  var ARTICLES = [
    {
      id:'adhd-adults-overview', cat:'adhd', title:'ADHD in adults: symptoms, diagnosis and what treatment can involve',
      excerpt:'What ADHD looks like when it is missed in childhood and identified later in life, how a formal diagnosis is reached, and the treatment options a clinician may discuss with you.',
      read:'6 min read',
      body:`<p>Attention-deficit/hyperactivity disorder, ADHD, is a neurodevelopmental condition that affects attention regulation, impulse control and activity levels. It is present from childhood, even when it is not recognised or diagnosed until adulthood. Many adults who are diagnosed later in life describe having spent years attributing their difficulties to personality or lack of discipline, rather than to an underlying, diagnosable condition.</p>
      <h3>Common signs in adulthood</h3>
      <p>ADHD presents differently across people and across the lifespan. In adults, common patterns include difficulty sustaining attention on tasks that are not intrinsically interesting, disorganisation and missed deadlines, losing or misplacing items regularly, restlessness or an internal sense of being "on the go," interrupting others or struggling to wait your turn, and difficulty regulating emotional responses. Hyperactivity often looks less like visible fidgeting and more like racing thoughts or a persistent feeling of restlessness.</p>
      <h3>How a diagnosis is reached</h3>
      <p>A formal diagnosis is made by a licensed clinician, typically a psychiatrist or clinical psychologist, following a structured clinical interview. This usually draws on your developmental history, ideally including evidence that symptoms were present in childhood, standardised rating scales such as the DIVA-5 or ASRS, and an assessment of how significant your symptoms are across more than one area of life, such as work, relationships and daily functioning. Diagnostic criteria in most of the countries Eldava Health operates in follow DSM-5-TR or ICD-11.</p>
      <h3>What treatment can involve</h3>
      <p>Treatment plans are individual and are set by your prescribing clinician, not by any online tool. They can include stimulant or non-stimulant medication, psychoeducation, coaching focused on executive function strategies, and workplace or study accommodations. Not everyone who is diagnosed chooses medication, and some manage well with structured coaching and environmental changes alone.</p>
      <div class="callout">This article is educational and does not replace an individual clinical assessment. If you recognise several of these patterns in yourself, the next step is a proper evaluation, not self-diagnosis.</div>`,
      cta:{text:'See ADHD assessment options and pricing', action:"Eldava.go('pricing'); Eldava.filterPriceByCat('mind');"}
    },
    {
      id:'autism-signs-children', cat:'autism', title:'Recognising early signs of autism in children',
      excerpt:'General, non-diagnostic information on developmental differences parents and carers sometimes notice, and what a next step could look like.',
      read:'5 min read',
      body:`<p>Autism is a neurodevelopmental difference that affects how a person communicates, interacts socially, and experiences the world sensorially. It is not an illness and there is no single "look" of autism: presentation varies enormously between children, and between boys and girls, which is part of why some children, particularly girls, are identified later than others.</p>
      <h3>Differences some parents and carers notice</h3>
      <p>No single sign confirms autism, and every child develops at their own pace, but differences that sometimes lead a parent to seek an assessment include limited or inconsistent eye contact, delayed speech and language development or unusual patterns of speech, a strong preference for routine and distress when routines change, intense, narrow interests, repetitive movements or behaviours, and sensory sensitivities to sound, light, texture or touch.</p>
      <h3>What to do if you notice these patterns</h3>
      <p>None of the differences above are, on their own, a diagnosis. If you notice a pattern of these traits over time and it is affecting your child's wellbeing, school life or family life, the appropriate next step is a structured developmental assessment with a licensed clinician, such as a paediatrician, clinical psychologist or psychiatrist experienced in neurodevelopmental assessment. Early identification does not change who your child is, but it can open the door to the right support at school and at home.</p>
      <div class="callout">This article provides general information only and is not a diagnostic tool or a substitute for a professional evaluation. If you are worried about your child's development, speak with your GP, paediatrician or a qualified clinician.</div>`,
      cta:{text:'See child and SEND assessment options', action:"Eldava.go('pricing'); Eldava.filterPriceByCat('child');"}
    },
    {
      id:'adhd-autism-overlap', cat:'autism', title:'ADHD and autism together: understanding overlapping traits',
      excerpt:'Why the two conditions are frequently discussed together, how clinicians tell them apart, and why a co-occurring diagnosis is common.',
      read:'5 min read',
      body:`<p>ADHD and autism are separate diagnoses with separate criteria, but they co-occur more often than was historically recognised, and some traits, such as difficulty with attention, sensory sensitivity, or social communication differences, can look similar on the surface while having a different underlying cause.</p>
      <h3>Why differentiation matters</h3>
      <p>Getting the right diagnosis, or the right combination of diagnoses, matters because the support and, where relevant, treatment options differ. A clinician experienced in both conditions will look at the pattern, timing and context of traits, not just whether a trait is present, to understand what is driving them. This is why a thorough assessment takes time and structured tools, rather than a short questionnaire alone.</p>
      <h3>Living with both</h3>
      <p>Many people are diagnosed with both ADHD and autism, sometimes called AuDHD informally, and describe the combination as creating its own distinct pattern of strengths and challenges, rather than simply the sum of two separate conditions. A good assessment report should reflect that individual pattern rather than applying a generic template.</p>`,
      cta:{text:'Read about our comorbidity-aware assessment approach', action:"Eldava.go('how');"}
    },
    {
      id:'private-assessment-what-to-expect', cat:'assessment', title:'What to expect from a private ADHD or autism assessment',
      excerpt:'A walk-through of the process, from booking to receiving your report, and the questions worth asking before you pay for any assessment.',
      read:'5 min read',
      body:`<p>Private assessments exist because public waiting lists in many countries now run into months or years. A private route does not change what a proper assessment involves, only how quickly you can access it.</p>
      <h3>What a thorough assessment includes</h3>
      <ul>
        <li>A structured clinical interview covering your current symptoms and, where relevant, your developmental history</li>
        <li>Validated screening tools appropriate to the condition being assessed</li>
        <li>Time with a licensed clinician who holds an active registration in your country</li>
        <li>A written report that explains the clinician's reasoning, not just a yes or no answer</li>
      </ul>
      <h3>Questions worth asking before you book anywhere</h3>
      <p>Is the assessment conducted by a licensed clinician, and can you verify their registration. Does the price include a full written report, or is that an extra cost. How long does the assessment take, given that a rushed 15-minute call is unlikely to constitute a rigorous evaluation. What happens if the clinician needs more information, and is a follow-up included.</p>
      <h3>Before your appointment</h3>
      <p>Most providers, including us, offer some form of structured intake beforehand. Use it properly: write down specific examples of how symptoms affect you, not just general impressions, and gather anything useful in advance, such as old school reports for a childhood-onset condition, or a partner or parent's observations if they are willing to share them. A clinician can only work with what they are given in the time available.</p>
      <h3>What a good report should contain</h3>
      <p>A properly written report explains the clinician's reasoning against recognised diagnostic criteria, not just a headline conclusion. It should be specific enough that a school, employer or insurer reading it later can see exactly what was assessed and how the conclusion was reached, rather than a generic template with your name inserted.</p>
      <div class="callout">We publish our own process on the <a onclick="Eldava.go('how')">How it works</a> page, including the mandatory safety check every booking goes through before payment.</div>`,
      cta:{text:'See how a Eldava Health assessment works', action:"Eldava.go('how');"}
    },
    {
      id:'public-waiting-lists', cat:'assessment', title:'Why ADHD and autism assessment waiting lists are so long',
      excerpt:'A look at the capacity gap behind long public waiting times, and what options exist while you wait.',
      read:'4 min read',
      body:`<p>Across several public healthcare systems, demand for ADHD and autism assessment has grown faster than assessment capacity, driven by rising referral numbers, wider public awareness of both conditions, and a limited pool of clinicians trained to conduct these specific assessments. The result, reported widely in the UK, Canada, Australia and Ireland among other countries, is waiting times that can run from many months to several years, depending on region and service.</p>
      <h3>What this means in practice</h3>
      <p>A long wait is not a reflection of how significant your difficulties are; it reflects system capacity. While you wait, some people choose to pursue a private assessment to get a formal diagnosis sooner, others use the waiting period to gather supporting evidence such as school reports or a symptom diary, and some remain on the public list because cost or eligibility rules make a private route unsuitable for them. All three are reasonable choices, and none is a judgement on the person waiting.</p>
      <div class="callout">Reported waiting times vary by source, region and over time; if a specific figure matters to your decision, check current guidance from your local health service rather than relying on any single website, including this one.</div>`,
      cta:{text:'Compare assessment turnaround and pricing', action:"Eldava.go('pricing');"}
    },
    {
      id:'adhd-women-girls', cat:'adhd', title:'ADHD in women and girls: why it is often diagnosed later',
      excerpt:'How ADHD can present differently in women and girls, and why that has historically led to under-diagnosis.',
      read:'5 min read',
      body:`<p>Diagnostic criteria for ADHD were developed largely from studies of hyperactive young boys, which means presentations that look different, quieter inattentiveness, internalised restlessness, high-effort masking of symptoms in social or academic settings, have historically been under-recognised, particularly in girls and women.</p>
      <h3>Patterns that are frequently missed</h3>
      <p>Many women describe years of feeling like they were working much harder than peers to achieve the same results, chronic disorganisation hidden behind visible over-compensation, emotional sensitivity or overwhelm that was previously attributed to anxiety or mood alone, and a diagnosis, when it finally comes, often in their thirties or forties, sometimes prompted by a child's own ADHD assessment.</p>
      <p>If this sounds familiar, it does not confirm a diagnosis on its own, but it may be worth raising with a clinician experienced in adult ADHD assessment, ideally one who is specifically aware of how presentation can differ by sex and gender.</p>`,
      cta:{text:'See our adult ADHD assessment', action:"Eldava.go('pricing'); Eldava.filterPriceByCat('mind');"}
    },
    {
      id:'autism-adults-missed-childhood', cat:'autism', title:'Autism in adults: when traits were missed in childhood',
      excerpt:'Why some autistic adults are only identified later in life, and what an adult autism assessment involves.',
      read:'4 min read',
      body:`<p>Autism awareness, diagnostic tools and clinical training have all changed substantially over recent decades. Many adults now seeking an assessment grew up at a time when autism was less well understood, particularly outside of more visibly disruptive presentations, which means traits were sometimes missed, masked, or misattributed to anxiety, shyness or, again, more often in women, simply overlooked.</p>
      <h3>What an adult assessment looks at</h3>
      <p>An adult autism assessment typically explores your developmental history as far as it can be reconstructed, current social communication patterns, sensory experiences, and the presence of restricted or repetitive interests and behaviours, using structured tools alongside clinical judgement. Because childhood records are not always available, a skilled clinician will place weight on consistent lifelong patterns rather than requiring documentary proof from childhood.</p>
      <p>Receiving a diagnosis as an adult does not change who you are; many people describe it as providing a coherent explanation for a lifetime of experiences, and a basis for accessing appropriate workplace or personal support.</p>`,
      cta:{text:'See adult autism assessment options', action:"Eldava.go('pricing'); Eldava.filterPriceByCat('mind');"}
    },
    {
      id:'after-diagnosis-next-steps', cat:'assessment', title:'What happens after an ADHD or autism diagnosis',
      excerpt:'Coaching, medication, workplace adjustments and ongoing review: an overview of what post-diagnostic support can look like.',
      read:'5 min read',
      body:`<p>A diagnosis is a starting point, not an end point. What happens next depends on the individual, the diagnosis, and personal preference, but common next steps include a shareable written report for school, work or insurance purposes, a conversation with your clinician about whether medication is appropriate, in the case of ADHD, structured coaching focused on executive function and daily strategies, and requesting reasonable adjustments at work or in education where relevant.</p>
      <h3>Ongoing review matters</h3>
      <p>For conditions like ADHD where medication may be part of the plan, regular review with your prescribing clinician is important to monitor response and any side effects. For autism, ongoing support is more often about environment and strategy than medication, though co-occurring conditions such as anxiety are sometimes treated separately.</p>
      <h3>Telling other people</h3>
      <p>Whether and how to share a diagnosis with an employer, school or family member is a personal decision, not an obligation. A report can sit unused until you decide it is useful, for example if you later want to request a workplace adjustment or exam accommodation. There is no default requirement to disclose a diagnosis to anyone.</p>
      <h3>If your first plan doesn't work</h3>
      <p>Medication response, coaching fit and useful adjustments often take some trial and adjustment to get right. A single unhelpful first attempt at a strategy is common and does not mean the diagnosis was wrong or that nothing will help; it usually means the plan needs a review with your clinician, not abandonment.</p>
      <div class="callout">Our Complete Pathway package bundles a full assessment with structured coaching and review, for people who want an integrated plan rather than booking each step separately.</div>`,
      cta:{text:'See the Complete Pathway', action:"Eldava.go('pathway');"}
    },
    {
      id:'bnpl-healthcare-explained', cat:'company', title:'Buy now, pay later for healthcare: how instalment payment works here',
      excerpt:'A plain-language explanation of how paying in 3 instalments works at Eldava Health, and the risks worth understanding before you use it.',
      read:'3 min read',
      body:`<p>The cost of a private assessment can be a genuine barrier, which is why every assessment on this platform can be paid in full or split into 3 interest-free instalments at checkout.</p>
      <h3>How it works</h3>
      <p>You choose "pay in 3" at checkout, the first instalment is taken immediately, and the remaining two are taken automatically at fixed intervals. There is no added interest across the 3 instalments.</p>
      <h3>What to understand before you use it</h3>
      <p>Buy now, pay later is still a form of credit. Missing a scheduled payment could affect your ability to get credit in future, and it is worth only choosing this option if you are confident the future instalments are affordable. Full terms are always shown before you confirm a booking.</p>`,
      cta:{text:'See instalment pricing on assessments', action:"Eldava.go('pricing');"}
    },
    {
      id:'guided-pre-consultation-explained', cat:'company', title:'How our guided pre-consultation works, and why we do not call it "AI-powered"',
      excerpt:'An honest explanation of the technology behind our intake tool: what it does, what it does not do, and why we chose that wording.',
      read:'4 min read',
      body:`<p>Before your appointment, you can use our guided pre-consultation to answer a structured set of questions about your main concern, duration of symptoms, prior history, and a mandatory safety check. It organises what you tell us into a short summary your clinician can review before you meet.</p>
      <h3>What it is, in plain terms</h3>
      <p>It is a structured, rule-based questionnaire with branching logic. It is not a large language model generating a diagnosis, and it does not replace the clinical interview. We describe it as "guided," not "AI-powered," because we think the label should describe what the tool actually does, not what sounds more impressive.</p>
      <h3>The one thing it always does</h3>
      <p>If you indicate any risk to your own safety during the guided pre-consultation or the booking flow, the tool stops routing you toward a booking and shows you crisis resources instead. That check cannot be skipped.</p>`,
      cta:{text:'Try the guided pre-consultation', action:"Eldava.openCarePathway();"}
    },
    {
      id:'neurodiversity-workplace-guide', cat:'workplace', title:'Neurodiversity in the workplace: a practical guide for employers',
      excerpt:'Confidentiality, reasonable adjustments and why fast access to assessment can reduce avoidable staff turnover.',
      read:'5 min read',
      body:`<p>Supporting neurodivergent employees is not primarily about running a screening programme; it is about building a workplace where a diagnosis, if an employee chooses to disclose one, leads to practical adjustments rather than stigma.</p>
      <h3>Practical starting points for employers</h3>
      <ul>
        <li>Keep any assessment or diagnosis information confidential and share it only with explicit employee consent</li>
        <li>Train line managers to recognise when an employee may benefit from a workplace needs assessment, without diagnosing them informally</li>
        <li>Offer flexible options, such as adjusted communication style, quiet working space or flexible scheduling, as a default conversation, not only after a formal diagnosis</li>
        <li>Reduce the time between an employee raising a concern and getting access to a proper assessment, since long personal waiting periods can affect performance and wellbeing in the meantime</li>
      </ul>
      <p>None of this requires guessing at diagnoses. It requires a clear, confidential route to a proper assessment, and a culture where using it is not held against anyone.</p>`,
      cta:{text:'See our employer programmes', action:"Eldava.go('corporate');"}
    },
    {
      id:'choosing-a-private-assessment', cat:'assessment', title:'Choosing a private assessment provider: what to check first',
      excerpt:'A short, practical checklist before you book anywhere, not just with us.',
      read:'3 min read',
      body:`<p>Not all private assessment providers operate to the same standard, and price alone is not a reliable signal of quality. Before booking with any provider, it is worth checking a few things.</p>
      <ul>
        <li>Can you verify the clinician's professional registration independently, rather than just taking a website's word for it</li>
        <li>Does the price include a full written report, and is it clear what happens if more time or a follow-up is needed</li>
        <li>Is there a clear, published safety process if you disclose risk to yourself during intake</li>
        <li>Is pricing transparent up front, rather than only available after you have given personal details</li>
      </ul>
      <p>We built our own <a onclick="Eldava.go('about')">About and trust</a> page, and our pricing page, to answer these questions for our own platform without you having to ask.</p>`,
      cta:{text:'See our pricing, in full, up front', action:"Eldava.go('pricing');"}
    },
    {
      id:'why-we-built-eldava-health', cat:'company', title:'Why we built Eldava Health',
      excerpt:'The gap between diagnosis and public waiting lists, and what we are trying to do about it.',
      read:'4 min read',
      body:`<p>Eldava Health exists because the gap between recognising a possible ADHD or autism trait and getting a proper, clinician-led assessment has become, in many countries, a multi-year wait. That gap is not caused by a lack of clinical knowledge; it is a capacity problem, and it falls hardest on people who cannot afford to simply wait it out or pay whatever a scarce private market charges.</p>
      <p>Our approach is to remove administrative friction, structured intake, clear pricing, instalment payment, so that the clinical work itself, the part that actually matters, is what a booking pays for. We are a new platform, and we would rather grow carefully across a small number of well-regulated markets than overclaim reach or results we do not have evidence for yet. Our <a onclick="Eldava.go('outcomes')">outcomes and transparency page</a> explains what we track today and what we will publish as we scale.</p>`,
      cta:{text:'Read more about us', action:"Eldava.go('about');"}
    },
    {
      id:'clinician-credentialing-safety', cat:'company', title:'Our approach to clinician credentialing and patient safety',
      excerpt:'How clinicians join our network, and why every booking runs through a mandatory safety check before payment.',
      read:'4 min read',
      body:`<p>Every clinician on the Eldava Health platform must hold an active professional registration recognised in the country where they are practising, such as GMC or HCPC in the UK, AHPRA in Australia, or the equivalent body elsewhere. We check this before a clinician joins the network, and again on an ongoing basis.</p>
      <h3>The safety check that cannot be skipped</h3>
      <p>Both our guided pre-consultation and our booking flow include a mandatory question about risk to your own safety. A positive answer stops the flow from proceeding to payment and instead shows crisis resources appropriate to your country. This is a deliberate product decision: we would rather interrupt a booking than let a genuine safety concern pass through a form unnoticed.</p>`,
      cta:{text:'Read our full trust and safety page', action:"Eldava.go('about');"}
    },
    {
      id:'how-long-assessment-training-takes', cat:'careers', title:'How long does ADHD or autism assessment training actually take',
      excerpt:'A realistic look at the difference between an initial course and independent clinical competency, for clinicians considering this as a specialism.',
      read:'4 min read',
      body:`<p>If you are a licensed clinician weighing up whether to add ADHD or autism assessment to your practice, it helps to separate two very different things: completing an initial course, and being ready to work independently.</p>
      <h3>Two different milestones</h3>
      <p>Introductory workshops for most recognised assessment tools are commonly delivered over a small number of days and cover the diagnostic framework, the tools themselves, and initial scoring practice. Reaching independent clinical competency, the point where you can reliably conduct and score assessments without supervision, is a separate and longer milestone, typically requiring several months of supervised practice on top of the initial course. For some tools, a further, more demanding reliability standard exists for clinicians who want to use the tool in formal research settings, which can take longer still.</p>
      <h3>What this means if you're planning your own training</h3>
      <p>Budget your time in two stages, not one: the course itself, and the supervised practice period afterward. A provider or platform that implies a two-day course alone makes you a fully independent assessor is understating what the specialism actually requires.</p>
      <div class="callout">Our own Training Academy is built around this reality: Foundation courses run 6 weeks self-paced, and our Complete Pathway folds in structured supervised practice hours rather than leaving that stage to chance.</div>`,
      cta:{text:'See our Training Academy course catalogue', action:"Eldava.go('academy');"}
    },
    {
      id:'what-credentialing-checks-before-patients', cat:'careers', title:'What we check before a clinician sees a single patient',
      excerpt:'An inside look at the credentialing process every clinician on our network goes through before their first booking.',
      read:'3 min read',
      body:`<p>Joining the Eldava Health clinician network is not a one-click signup. Before a clinician can accept a single booking, we verify their professional registration directly against the relevant regulator's public register for the country they intend to practise in, confirm the specific scope their registration covers, since some registrations allow assessment but not prescribing, or vice versa, and check that any claimed specialist training is genuine.</p>
      <h3>Ongoing, not one-time</h3>
      <p>Registration status is checked again periodically, not only at onboarding, because a registration can change, lapse or be restricted after someone has joined. If a clinician's registration status changes, their ability to take new bookings changes with it.</p>
      <p>This is deliberately more friction than a typical marketplace signup. We think that's the correct trade-off for a platform where the product is a clinical diagnosis.</p>`,
      cta:{text:'Learn how to apply as a clinician', action:"Eldava.go('partner');"}
    },
    {
      id:'joining-as-pharmacist-nurse-prescriber', cat:'careers', title:'Joining as a pharmacist or nurse prescriber: what the role actually involves',
      excerpt:'What remote prescribing work through Eldava Health can look like, and the limits that always sit with your own registration.',
      read:'3 min read',
      body:`<p>Pharmacist and nurse prescribers considering remote work through Eldava Health often ask the same first question: what can I actually do here. The honest answer is that it depends entirely on your own registration and the rules of the country the patient is in at the time, not on anything we grant you.</p>
      <h3>What we provide</h3>
      <p>Where your qualification and local regulation support it, our pharmacy delivery infrastructure and existing patient pipeline mean you are plugging into a working system rather than building booking, delivery and follow-up logistics from nothing. What we do not do is expand your scope of practice beyond what your registration already allows.</p>
      <p>If you are exploring whether remote prescribing fits your registration, that conversation happens as part of your application, before you are matched with any patient.</p>`,
      cta:{text:'Register your interest', action:"Eldava.openEnquiry('clinician');"}
    }
  ];

  function round5(n){ return Math.round(n/5)*5; }
  function fmt(p){ return '£' + Math.round(p).toLocaleString('en-GB'); }
  function discounted(price){ return round5(price * (1 - PROMO.pct)); }
  function currentPrice(price){ return PROMO.claimed ? discounted(price) : price; }
  function findService(name){ for(var i=0;i<SERVICES.length;i++){ if(SERVICES[i].name===name) return SERVICES[i]; } return SERVICES[3]; }
  function nextWeekday(offset){ var d=new Date(); d.setDate(d.getDate()+offset); return d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}); }
  function threeSplit(total){
    var a = Math.round(total/3*100)/100;
    var b = a, c = Math.round((total - a - b)*100)/100;
    return [a,b,c];
  }

  function renderAccordion(el, items, withIndex){
    if(!el) return;
    el.innerHTML = items.map(function(it,i){
      return '<div class="acc-item" data-open="false"><button class="acc-trigger" onclick="Eldava.toggleAcc(this)">'
        + '<span class="t">' + (withIndex? '<span class="idx">0'+(i+1)+'</span>':'') + (it.t||it.q) + '</span>'
        + '<span class="plus">+</span></button><div class="acc-panel"><div class="acc-panel-inner">' + (it.d||it.a) + '</div></div></div>';
    }).join('');
  }

  function priceBlockHtml(price, colorClass){
    if(PROMO.claimed){
      return '<span class="price-was mono">'+fmt(price)+'</span><span class="'+colorClass+' mono">'+fmt(discounted(price))+'</span><span class="save-badge">SAVE 15%</span>';
    }
    return '<span class="'+colorClass+' mono">'+fmt(price)+'</span>';
  }

  function renderPriceTabs(){
    var tabsEl = document.getElementById('priceTabs');
    if(!tabsEl) return;
    tabsEl.innerHTML = Object.keys(CATS).map(function(k,i){
      return '<button class="tab" role="tab" aria-selected="'+(i===0?'true':'false')+'" data-cat="'+k+'" onclick="Eldava.filterPrice(this)">'+CATS[k]+'</button>';
    }).join('');
  }

  function renderPriceTable(cat){
    var body = document.getElementById('priceTableBody');
    if(!body) return;
    var rows = SERVICES.filter(function(s){ return cat==='all' || s.cat===cat; });
    body.innerHTML = rows.map(function(s){
      var now = currentPrice(s.price);
      var split = threeSplit(now)[0];
      return '<tr><td><div class="svc-name">'+(SERVICE_PAGES[s.name] ? '<a href="'+SERVICE_PAGES[s.name]+'">'+s.name+'</a>' : s.name)+'</div><div class="svc-desc">'+s.desc+'</div></td>'
        + '<td>'+s.dur+'</td><td class="svc-price">'+priceBlockHtml(s.price,'svc-price')+'</td>'
        + '<td class="mono" style="color:var(--text-soft); font-size:0.85rem;">3 &times; '+fmt(split)+'</td>'
        + '<td><button class="btn btn-primary btn-sm" onclick="Eldava.openBooking(\''+s.name.replace(/'/g,"\\'")+'\')">Book</button></td></tr>';
    }).join('');
  }

  var blogFilter = 'all';
  function renderBlogTabs(){
    var tabsEl = document.getElementById('blogTabs');
    if(!tabsEl) return;
    tabsEl.innerHTML = Object.keys(ARTICLE_CATS).map(function(k,i){
      return '<button class="tab" role="tab" aria-selected="'+(k===blogFilter?'true':'false')+'" data-cat="'+k+'" onclick="Eldava.filterBlog(this)">'+ARTICLE_CATS[k]+'</button>';
    }).join('');
  }
  function renderBlogGrid(){
    var rows = ARTICLES.filter(function(a){ return blogFilter==='all' || a.cat===blogFilter; });
    var grid = document.getElementById('blogGrid');
    if(!grid) return;
    // Real links to each article's own page (app/insights/[slug]), so every
    // article is crawlable and shareable at its own URL.
    grid.innerHTML = rows.map(function(a){
      return '<a class="blog-card" href="/insights/'+a.id+'/">'
        + '<span class="cat">'+ARTICLE_CATS[a.cat]+'</span>'
        + '<h3>'+a.title+'</h3>'
        + '<p>'+a.excerpt+'</p>'
        + '<span class="rd">'+a.read+'</span></a>';
    }).join('');
  }
  function findArticle(id){ for(var i=0;i<ARTICLES.length;i++){ if(ARTICLES[i].id===id) return ARTICLES[i]; } return null; }
  function renderBlogArchive(){
    // Retired: each article now has its own URL (a second full copy of every
    // article on /insights/ was duplicate content). Kept so callers need no change.
    return;
    var el = document.getElementById('blogArchive');
    if(!el) return;
    el.innerHTML = ARTICLES.map(function(a){
      return '<details id="blog-'+a.id+'" class="blog-archive-item">'
        + '<summary><span class="cat">'+ARTICLE_CATS[a.cat]+'</span><h2>'+a.title+'</h2><span class="rd">'+a.read+'</span></summary>'
        + '<div class="blog-archive-body">'+a.body+'</div>'
        + '</details>';
    }).join('');
  }

  function populateSelect(sel){
    var byCat = {};
    SERVICES.forEach(function(s){ (byCat[s.cat]=byCat[s.cat]||[]).push(s); });
    var html = '';
    Object.keys(byCat).forEach(function(c){
      html += '<optgroup label="'+CATS[c]+'">';
      byCat[c].forEach(function(s){ html += '<option value="'+s.name+'">'+s.name+' ('+fmt(s.price)+')</option>'; });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
  }

  function renderMegaMenu(){
    var order = ['mind','women','child','body','testing','postdx','premium','legal','dementia','mens','skin','hearing','founding'];
    var cats = order.map(function(c){
      return '<button onclick="Eldava.go(\'pricing\'); Eldava.filterPriceByCat(\''+c+'\'); Eldava.closeMega();">'+CATS[c]+'</button>';
    }).join('');
    var popular = [SERVICES[3], SERVICES[4], SERVICES[0]];
    var pop = popular.map(function(s){
      return '<div class="pop-row"><span>'+(SERVICE_PAGES[s.name] ? '<a href="'+SERVICE_PAGES[s.name]+'">'+s.name+'</a>' : s.name)+'</span><span class="p mono">'+fmt(currentPrice(s.price))+'</span></div>';
    }).join('');
    document.getElementById('megaMenu').innerHTML =
      '<div class="cats">'+cats+'</div>'
      + '<div class="popular"><div class="lbl">Popular</div>'+pop
      + '<button class="seeall" onclick="Eldava.go(\'pricing\'); Eldava.closeMega();">See full price list &rarr;</button></div>';
  }

  var state = { service: SERVICES[3].name, price: SERVICES[3].price, safetyFlag:false, payMode:'full' };
  var cp = { specialty: SERVICES[3].name, concern:'', duration:'', prior:'', meds:'', family:'', safety:false, track:'adhd', screenerAnswers:[], selfHarmFlagFromScreener:false, screenerResult:null };
  // Front-end only account gate. This site is a static marketing/demo build with no live backend
  // attached, so "registration" here just gates entry to booking/pathway and holds a name+email
  // for the session - it is NOT a substitute for the real /api/register endpoint in the actual
  // intake platform, and nothing here is persisted beyond this browser tab.
  // Account state mirrors real server-side sessions: populated from
  // GET /api/auth/me on load and by the login/register endpoints. The httpOnly
  // session cookie - not anything here - is what actually authorises a request.
  var patientAccount = null;
  var pendingAction = null; // 'booking' | 'pathway' | 'profile', plus args to replay once signed in
  var pendingArgs = null;

  var clinicianAccount = null;
  var clinicianTab = 'upcoming';
  var clinicianCaseOpen = null;
  var clinicianCases = [];

  // Live purchase state, distinct from `state` (which tracks the UI selection).
  var booking = { intakeId:null, slotId:null, appointmentId:null, voucherId:null, reference:null, clinicianName:'', startsAt:null, mode:'video', isVoucher:false, promo:null };
  var intake = { id:null, questions:[], answers:{}, redFlag:false, aiGenerated:false };

  // ---------------------------------------------------------------- helpers

  /// Every call carries the session cookie and resolves to { ok, status, data }
  /// - never throws - so a failed request always surfaces in the UI.
  function apiCall(method, url, body){
    var opts = { method: method, credentials:'same-origin', headers:{} };
    if(body !== undefined){ opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(url, opts).then(function(res){
      return res.json().catch(function(){ return {}; }).then(function(data){ return { ok: res.ok, status: res.status, data: data }; });
    }).catch(function(){
      return { ok:false, status:0, data:{ error:'Could not reach the server. Check your connection and try again.' } };
    });
  }

  /// Anything from a patient, a clinician or the model is escaped before innerHTML.
  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function showError(id, message){
    var el = document.getElementById(id); if(!el) return;
    if(!message){ el.hidden = true; el.textContent = ''; return; }
    el.textContent = message; el.hidden = false;
  }
  function setBusy(id, busy, busyLabel){
    var btn = document.getElementById(id); if(!btn) return;
    if(busy){
      if(!btn.getAttribute('data-label')) btn.setAttribute('data-label', btn.textContent);
      btn.disabled = true; btn.textContent = busyLabel || 'Working…';
    } else {
      btn.disabled = false;
      var label = btn.getAttribute('data-label'); if(label) btn.textContent = label;
    }
  }
  /// Keeps each dropdown toggle's aria-expanded in step with its menu - drives
  /// the caret rotation in CSS and tells a screen reader the menu's state.
  function syncMenuState(){
    [['megaToggle','megaMenu'], ['orgToggle','orgMenu'], ['resToggle','resMenu']].forEach(function(pair){
      var btn = document.getElementById(pair[0]), menu = document.getElementById(pair[1]);
      if(btn && menu) btn.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
    });
  }
  function setText(id, value){ var el = document.getElementById(id); if(el) el.textContent = value; }
  function toggleHidden(id, hidden){ var el = document.getElementById(id); if(el) el.hidden = hidden; }

  /// "Jane Carter" -> "JC".
  function initialsFor(name){
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if(!parts.length) return '?';
    if(parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase();
  }
  function row(label, value){ return '<dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd>'; }

  function fmtSlotDate(iso){ return new Date(iso).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }); }
  function fmtSlotTime(iso){ return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }); }
  function fmtSlotFull(iso){ return new Date(iso).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' }) + ' at ' + fmtSlotTime(iso); }

  function apptBadge(a){
    if(a.status === 'CANCELLED') return '<span class="appt-badge cancelled">cancelled</span>';
    if(a.status === 'EXPIRED') return '<span class="appt-badge cancelled">hold expired</span>';
    if(a.status === 'COMPLETED') return '<span class="appt-badge done">completed</span>';
    if(a.paymentStatus === 'PAID' || a.status === 'CONFIRMED' || a.status === 'PAID' || a.status === 'REDEEMED') return '<span class="appt-badge confirmed">'+(a.status === 'REDEEMED' ? 'redeemed' : 'confirmed')+'</span>';
    if(a.paymentStatus === 'PROCESSING') return '<span class="appt-badge pending">payment processing</span>';
    if(a.paymentStatus === 'FAILED') return '<span class="appt-badge failed">payment failed</span>';
    return '<span class="appt-badge pending">awaiting payment</span>';
  }

  function apptCard(a){
    var needsPayment = a.status === 'PENDING_PAYMENT' && a.paymentStatus !== 'PROCESSING';
    var amount = a.priceLabel + (a.discountLabel ? ' (saved '+a.discountLabel+' with '+esc(a.promoCode)+')' : '') + (a.paymentMethod ? ' via ' + (a.paymentMethod === 'KLARNA' ? 'Klarna' : 'card') : '');
    return '<div class="appt-card">'
      + '<div class="appt-head"><b>'+esc(a.serviceName)+'</b>'+apptBadge(a)+'</div>'
      + '<div class="appt-when">'+esc(fmtSlotFull(a.startsAt))+'</div>'
      + '<dl class="appt-meta">'+row('Clinician', a.clinicianName)+row('Format', a.mode + ', ' + a.durationMin + ' min')+row('Amount', amount)+row('Reference', a.reference)+'</dl>'
      + (a.intakeCompleted ? '<p class="appt-note">Your intake answers were sent to your clinician.</p>' : '')
      + (a.joinUrl ? '<p class="appt-join"><a class="btn btn-primary btn-sm" href="'+esc(a.joinUrl)+'" target="_blank" rel="noopener">Join video call</a> <span class="appt-join-url">'+esc(a.joinUrl)+'</span></p>'
          : (a.upcoming && a.status === 'CONFIRMED'
              ? (a.mode === 'video' ? '<p class="appt-note">Your clinician will add the video link before the appointment. We will email it to you, and it will appear here.</p>'
                                     : '<p class="appt-note">Phone appointment: your clinician will call you on the number on your account.</p>')
              : ''))
      + (needsPayment ? '<button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="Eldava.resumePayment(\''+esc(a.id)+'\', false)">Complete payment</button>' : '')
      + '</div>';
  }

  function voucherCard(v){
    var needsPayment = v.status === 'PENDING_PAYMENT' && v.paymentStatus !== 'PROCESSING';
    return '<div class="appt-card">'
      + '<div class="appt-head"><b>'+esc(v.serviceName)+'</b>'+apptBadge(v)+'</div>'
      + '<dl class="appt-meta">'+row('Voucher code', v.code)+row('Amount', v.priceLabel + (v.paymentMethod ? ' via ' + (v.paymentMethod === 'KLARNA' ? 'Klarna' : 'card') : ''))+row('Bought', new Date(v.createdAt).toLocaleDateString('en-GB'))+'</dl>'
      + (v.status === 'PAID' ? '<p class="appt-note">Redeemable after launch. Keep your code.</p>' : '')
      + (needsPayment ? '<button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="Eldava.resumePayment(\''+esc(v.id)+'\', true)">Complete payment</button>' : '')
      + '</div>';
  }

  function renderScreener(){
    cp.track = cpTrackFor(cp.specialty);
    cp.screenerAnswers = [];
    var scr = CP_SCREENERS[cp.track];
    var headEl = document.getElementById('cpScreenerHead');
    var bodyEl = document.getElementById('cpScreenerBody');
    var nextBtn = document.getElementById('cpStep2NextBtn');
    if(!scr.groups.length){
      headEl.innerHTML = '<p class="sub" style="margin-top:0;">'+scr.note+'</p>';
      bodyEl.innerHTML = '';
      nextBtn.disabled = false;
      return;
    }
    headEl.innerHTML = '<span class="cp-tag" style="margin-bottom:8px;">'+scr.tool+'</span><p class="sub" style="margin-top:6px;">'+scr.note+'</p>';
    var flat = 0, html = '';
    scr.groups.forEach(function(g){
      if(g.label){ html += '<h4 style="margin-top:18px;">'+g.label+'</h4>'; }
      g.items.forEach(function(itemText){
        var idx = flat;
        html += '<div class="screen-q"><div class="qtext">'+itemText+'</div><div class="radio-row">'
          + g.scale.map(function(opt, si){ return '<div class="radio-opt" onclick="Eldava.cpScreenerSelect('+idx+','+si+',this)">'+opt+'</div>'; }).join('')
          + '</div></div>';
        flat++;
      });
    });
    bodyEl.innerHTML = html;
    nextBtn.disabled = true;
  }

  // ------------------------------------------------------- clinician portal

  function loadClinicianCases(){
    if(clinicianTab === 'profile') return loadClinicianProfile();
    var el = document.getElementById('clinicianTabContent');
    if(el) el.innerHTML = '<p style="color:var(--void-soft);">Loading your appointments&hellip;</p>';
    return apiCall('GET', '/api/clinician/cases?scope=' + encodeURIComponent(clinicianTab)).then(function(res){
      if(!res.ok){
        if(res.status === 401){ clinicianAccount = null; Eldava.go('clinician-login'); return; }
        if(el) el.innerHTML = '<p class="clin-empty">'+esc(res.data.error || 'Could not load your appointments.')+'</p>';
        return;
      }
      clinicianCases = res.data.cases || [];
      renderClinicianTabContent();
    });
  }

  function riskChip(level){
    if(!level) return '<span class="clin-urgency none">no intake</span>';
    var cls = level === 'urgent' ? 'urgent' : (level === 'elevated' ? 'elevated' : 'non_urgent');
    return '<span class="clin-urgency '+cls+'">'+esc(level)+'</span>';
  }

  function renderCaseList(){
    if(!clinicianCases.length) return '<p class="clin-empty">Nothing here yet. Confirmed bookings appear as soon as a patient has paid.</p>';
    return clinicianCases.map(function(c){
      var noteState = c.noteSigned ? 'note signed' : (c.hasNote ? 'note in progress' : 'no note yet');
      // A video appointment with no link yet is the thing most worth catching
      // from the list, so it gets its own flag.
      var linkState = c.mode === 'video' ? (c.hasLink ? '<span class="clin-flag ok">link set</span>' : (c.status === 'CONFIRMED' ? '<span class="clin-flag warn">no video link yet</span>' : '')) : '<span class="clin-flag">phone</span>';
      return '<div class="clin-inbox-item" onclick="Eldava.openClinicianCase(\''+esc(c.id)+'\')">'
        + '<div><div><b>'+esc(c.patientName)+'</b> &middot; '+esc(c.serviceName)+' '+linkState+'</div>'
        + '<div class="meta">'+esc(fmtSlotFull(c.startsAt))+' &middot; '+esc(c.mode)+' &middot; '+esc(c.reference)+' &middot; '+esc(noteState)+'</div></div>'
        + riskChip(c.riskLevel) + '</div>';
    }).join('');
  }

  /// The meeting-link block on a case. Video: the clinician pastes the link
  /// for whatever platform they use; the patient is emailed when it is saved.
  /// Phone: no link exists - show the number to call instead.
  function renderMeetingBlock(c){
    if(c.mode !== 'video'){
      return '<div class="clin-meeting"><div class="clin-ai-head"><span class="cp-tag">Phone consultation</span></div>'
        + '<p class="clin-meta">You call the patient at the appointment time.</p>'
        + '<p class="clin-phone">'+(c.patient.phone ? '<a href="tel:'+esc(c.patient.phone)+'">'+esc(c.patient.phone)+'</a>' : '<i>No phone number on the patient’s account - contact them at '+esc(c.patient.email)+' to arrange.</i>')+'</p></div>';
    }
    var editable = c.status === 'CONFIRMED';
    return '<div class="clin-meeting"><div class="clin-ai-head"><span class="cp-tag">Video consultation</span>'
      + (c.joinUrl ? '<span class="clin-flag ok">link set</span>' : '<span class="clin-flag warn">no link yet</span>') + '</div>'
      + (c.joinUrl ? '<p class="clin-meta">Current link: <a class="clin-link" href="'+esc(c.joinUrl)+'" target="_blank" rel="noopener">'+esc(c.joinUrl)+'</a></p>' : '<p class="clin-meta">Paste the meeting link from the platform you use (Teams, Zoom, Google Meet, Doxy, Attend Anywhere…). The patient is emailed as soon as you save it.</p>')
      + (editable
          ? '<div class="clin-link-row"><input id="joinUrlInput" type="url" placeholder="https://…" value="'+esc(c.joinUrl || '')+'" autocomplete="off">'
            + '<button class="btn btn-primary btn-sm" id="joinUrlSave" onclick="Eldava.saveJoinUrl()">'+(c.joinUrl ? 'Update link' : 'Save link')+'</button>'
            + (c.joinUrl ? '<button class="btn btn-ghost btn-sm" id="joinUrlClear" onclick="Eldava.saveJoinUrl(true)">Remove</button>' : '')
            + '</div><div class="form-error" id="joinUrlError" hidden></div><p class="clin-status" id="joinUrlStatus"></p>'
          : '<p class="clin-provenance">Links can only be edited on confirmed, upcoming appointments.</p>')
      + '</div>';
  }

  // -------------------------------------------------------- clinician profile

  function renderClinicianProfile(p){
    return '<div class="clin-detail">'
      + '<div class="clin-profile-head"><span class="acct-avatar-lg">'+esc(initialsFor(p.displayName))+'</span>'
      + '<div><h4 style="margin:0;">'+esc(p.displayName)+'</h4><p class="clin-meta">'+esc(p.specialtyLabel)+(p.regulator ? ' &middot; '+esc(p.regulator)+' '+esc(p.regNumber||'') : '')+'</p></div></div>'
      + '<div class="clin-stats"><div><b>'+esc(p.counts.upcoming)+'</b><span>upcoming</span></div><div><b>'+esc(p.counts.completed)+'</b><span>completed</span></div>'
      + '<div><b>'+esc(new Date(p.memberSince).toLocaleDateString('en-GB',{month:'short',year:'numeric'}))+'</b><span>on the network since</span></div></div>'
      + '<dl class="clin-dl">'+row('Email', p.email)+row('Specialty', p.specialtyLabel)+(p.regulator ? row('Regulator', p.regulator) : '')+(p.regNumber ? row('Registration number', p.regNumber) : '')+'</dl>'
      + '<p class="clin-provenance">Name, specialty and registration were verified when you joined and are changed by the clinical team, not here.</p>'

      + '<div class="clin-note" style="margin-top:22px;"><div class="clin-ai-head"><span class="cp-tag">Your bio</span></div>'
      + '<p class="clin-provenance">Shown to patients when they choose an appointment time.</p>'
      + '<div class="finder-row"><textarea id="clinBio" rows="3" maxlength="600" placeholder="One or two sentences about your practice">'+esc(p.bio||'')+'</textarea></div>'
      + '<div class="clin-note-actions"><button class="btn btn-primary btn-sm" id="clinBioSave" onclick="Eldava.saveClinicianBio()">Save bio</button></div>'
      + '<div class="form-error" id="clinBioError" hidden></div><p class="clin-status" id="clinBioStatus"></p></div>'

      + '<div class="clin-note" style="margin-top:16px;"><div class="clin-ai-head"><span class="cp-tag">Change password</span></div>'
      + '<div class="field-grid"><div class="finder-row"><label for="clinPwCurrent">Current password</label><input id="clinPwCurrent" type="password" autocomplete="current-password"></div>'
      + '<div class="finder-row"><label for="clinPwNew">New password</label><input id="clinPwNew" type="password" autocomplete="new-password" placeholder="At least 10 characters"></div></div>'
      + '<div class="clin-note-actions"><button class="btn btn-ghost btn-sm" id="clinPwSave" onclick="Eldava.changeClinicianPassword()">Change password</button></div>'
      + '<div class="form-error" id="clinPwError" hidden></div><p class="clin-status" id="clinPwStatus"></p></div>'
      + '</div>';
  }

  function loadClinicianProfile(){
    var el = document.getElementById('clinicianTabContent');
    if(el) el.innerHTML = '<p style="color:var(--void-soft);">Loading your profile&hellip;</p>';
    return apiCall('GET', '/api/clinician/me').then(function(res){
      if(!res.ok){
        if(res.status === 401){ clinicianAccount = null; Eldava.go('clinician-login'); return; }
        if(el) el.innerHTML = '<p class="clin-empty">'+esc(res.data.error || 'Could not load your profile.')+'</p>'; return;
      }
      if(el) el.innerHTML = renderClinicianProfile(res.data.profile);
    });
  }

  /// The pre-consultation briefing: who the patient is, what the AI made of
  /// their intake, every verbatim answer, and the clinician's own notes.
  function renderCaseDetail(c){
    var s = c.summary;
    var html = '<button class="clin-back" onclick="Eldava.closeClinicianCase()">&larr; Back to list</button><div class="clin-detail">';
    html += '<h4>'+esc(c.patient.fullName)+' &middot; age '+esc(c.patient.age)+'</h4>';
    html += '<p class="clin-meta">'+esc(c.serviceName)+' &middot; '+esc(fmtSlotFull(c.startsAt))+' &middot; '+esc(c.durationMin)+' min '+esc(c.mode)+' &middot; ref '+esc(c.reference)+'</p>';
    html += '<p class="clin-meta">'+esc(c.patient.email)+(c.patient.phone ? ' &middot; '+esc(c.patient.phone) : '')+' &middot; '+esc(c.patient.country)+' &middot; DOB '+esc(c.patient.dateOfBirth)+'</p>';
    html += renderMeetingBlock(c);

    if(c.intake && c.intake.redFlag){
      html += '<div class="clin-alert"><b>Safety flag raised during intake.</b><p>'+esc(c.intake.redFlagReason || 'Review the intake answers before this consultation.')+'</p></div>';
    }

    if(s){
      html += '<div class="clin-ai"><div class="clin-ai-head"><span class="cp-tag">AI intake summary</span>'+riskChip(s.riskLevel)+'</div>';
      html += '<h4>Presenting complaint</h4><p>'+esc(s.presentingComplaint)+'</p>';
      html += '<h4>History</h4><p>'+esc(s.historySummary)+'</p>';
      if((s.suggestedFocus||[]).length) html += '<h4>Suggested areas to explore</h4><ul>'+s.suggestedFocus.map(function(f){ return '<li>'+esc(f)+'</li>'; }).join('')+'</ul>';
      if((s.riskFlags||[]).length) html += '<h4>Risk flags</h4><ul>'+s.riskFlags.map(function(f){ return '<li>'+esc(f)+'</li>'; }).join('')+'</ul>';
      html += '<p class="clin-provenance">'+(s.model === 'mock-no-api-key'
          ? 'Not AI-generated: no model was configured, so this is built from the patient’s verbatim answers only.'
          : 'Generated by '+esc(s.model)+' from the patient’s intake answers. A summary is a prompt for your own assessment, not a clinical finding.')+'</p></div>';
      if((s.answerDigest||[]).length){
        html += '<h4>What the patient actually answered</h4><div class="clin-answers">'
          + s.answerDigest.map(function(a){ return '<div class="clin-answer"><div class="q">'+esc(a.question)+'</div><div class="a">'+esc(a.answer)+'</div></div>'; }).join('') + '</div>';
      }
    } else {
      html += '<p class="clin-empty">This patient booked without completing the guided intake, so there is no summary. Their own description of the concern is below.</p>';
    }
    if(c.intake && c.intake.concern) html += '<h4>In the patient’s own words</h4><p class="clin-verbatim">'+esc(c.intake.concern)+'</p>';
    html += renderNoteForm(c) + '</div>';
    return html;
  }

  function noteField(label, value){ return '<h4>'+esc(label)+'</h4><p class="clin-verbatim">'+(value ? esc(value) : '<i>Not recorded.</i>')+'</p>'; }

  function renderNoteForm(c){
    var n = c.note || { subjective:'', objective:'', assessment:'', plan:'', signedAt:null };
    if(n.signedAt){
      return '<div class="clin-note signed"><div class="clin-ai-head"><span class="cp-tag">Clinical note</span><span class="clin-urgency non_urgent">signed</span></div>'
        + '<p class="clin-provenance">Signed '+esc(new Date(n.signedAt).toLocaleString('en-GB'))+'. A signed note is the clinical record and can no longer be edited here.</p>'
        + noteField('Subjective', n.subjective) + noteField('Objective', n.objective) + noteField('Assessment', n.assessment) + noteField('Plan', n.plan) + '</div>';
    }
    return '<div class="clin-note"><div class="clin-ai-head"><span class="cp-tag">Your clinical note</span></div>'
      + '<p class="clin-provenance">Written by you, during or after the consultation. Saved separately from the AI summary above.</p>'
      + '<div class="finder-row"><label for="noteS">Subjective</label><textarea id="noteS" rows="3" placeholder="What the patient reports, in their words">'+esc(n.subjective)+'</textarea></div>'
      + '<div class="finder-row"><label for="noteO">Objective</label><textarea id="noteO" rows="3" placeholder="Observations, mental state, screening results">'+esc(n.objective)+'</textarea></div>'
      + '<div class="finder-row"><label for="noteA">Assessment</label><textarea id="noteA" rows="3" placeholder="Your clinical impression">'+esc(n.assessment)+'</textarea></div>'
      + '<div class="finder-row"><label for="noteP">Plan</label><textarea id="noteP" rows="3" placeholder="Next steps, prescription, follow-up, referrals">'+esc(n.plan)+'</textarea></div>'
      + '<div class="form-error" id="noteError" hidden></div>'
      + '<div class="clin-note-actions"><button class="btn btn-ghost" id="noteSaveBtn" onclick="Eldava.saveNote(false)">Save draft</button>'
      + '<button class="btn btn-primary" id="noteSignBtn" onclick="Eldava.saveNote(true)">Sign and complete</button></div>'
      + '<p class="clin-status" id="noteStatus"></p></div>';
  }

  function renderClinicianTabContent(){
    var el = document.getElementById('clinicianTabContent');
    if(!el) return;
    el.innerHTML = clinicianCaseOpen ? renderCaseDetail(clinicianCaseOpen) : renderCaseList();
  }

  // ------------------------------------------------------- AI intake rendering

  function cpShow(step){
    ['cpStep0','cpStep1','cpStep2','cpStep3','cpStep4'].forEach(function(id,i){ document.getElementById(id).hidden = i!==step; });
    ['cps0','cps1','cps2','cps3','cps4'].forEach(function(id,i){ var el = document.getElementById(id); if(el) el.className = step>=i?'done':''; });
  }
  function bookingShow(step){
    var ai = document.getElementById('bookStepAI'); if(ai) ai.hidden = true;
    ['bookStep0','bookStep1','bookStep2','bookStep3','bookStep4'].forEach(function(id,i){ document.getElementById(id).hidden = i!==step; });
    ['ms0','ms1','ms2','ms3'].forEach(function(id,i){ var el = document.getElementById(id); if(el) el.className = step>=i?'done':''; });
  }

  function renderIntakeIntro(intro, aiGenerated, introId){
    var el = document.getElementById(introId || 'cpAiIntro'); if(!el) return;
    el.innerHTML = '<span class="cp-tag">'+(aiGenerated ? 'Tailored to what you told us' : 'Standard intake questions')+'</span>'
      + '<p class="sub" style="margin-top:6px;">'+esc(intro || '')+'</p>'
      + (aiGenerated ? '' : '<p class="cp-degraded">Our question assistant is unavailable right now, so these are our standard intake questions. Your clinician still sees every answer.</p>');
  }

  function questionHtml(q){
    var html = '<div class="screen-q intake-q" data-qid="'+esc(q.id)+'" data-required="'+(q.required?'1':'0')+'" data-type="'+esc(q.type)+'">'
      + '<div class="qtext">'+esc(q.prompt)+(q.required ? '' : ' <span class="optional">optional</span>')+'</div>'
      + (q.helpText ? '<p class="qhelp">'+esc(q.helpText)+'</p>' : '');
    if(q.type === 'text'){
      html += '<textarea class="intake-input" rows="3" placeholder="Your answer"></textarea>';
    } else if(q.type === 'scale'){
      html += '<div class="radio-row scale-row">';
      for(var n=0;n<=10;n++) html += '<div class="radio-opt scale-opt" data-val="'+n+'" onclick="Eldava.intakeSelect(this, false)">'+n+'</div>';
      html += '</div>';
    } else {
      var multi = q.type === 'multi_select';
      html += '<div class="radio-row">'+(q.options||[]).map(function(opt){
        return '<div class="radio-opt" data-val="'+esc(opt)+'" onclick="Eldava.intakeSelect(this, '+(multi?'true':'false')+')">'+esc(opt)+'</div>';
      }).join('')+'</div>';
    }
    return html + '</div>';
  }
  function renderIntakeQuestions(questions, containerId){ var el = document.getElementById(containerId || 'cpAiQuestions'); if(el) el.innerHTML = questions.map(questionHtml).join(''); }
  function appendIntakeQuestions(questions, intro, containerId){
    var el = document.getElementById(containerId || 'cpAiQuestions'); if(!el) return;
    el.insertAdjacentHTML('beforeend', '<div class="intake-followup"><span class="cp-tag">A few follow-ups</span>'+(intro ? '<p class="sub" style="margin-top:6px;">'+esc(intro)+'</p>' : '')+'</div>'+questions.map(questionHtml).join(''));
    var first = el.querySelector('.intake-followup'); if(first) first.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  function collectIntakeAnswers(containerId){
    var answers = {}, missing = [];
    document.querySelectorAll('#' + (containerId || 'cpAiQuestions') + ' .intake-q').forEach(function(block){
      var id = block.getAttribute('data-qid'), type = block.getAttribute('data-type'), required = block.getAttribute('data-required') === '1', value;
      if(type === 'text'){ var input = block.querySelector('.intake-input'); value = input ? input.value.trim() : ''; }
      else if(type === 'multi_select'){ value = Array.prototype.map.call(block.querySelectorAll('.radio-opt.selected'), function(o){ return o.getAttribute('data-val'); }); }
      else { var chosen = block.querySelector('.radio-opt.selected'); value = chosen ? chosen.getAttribute('data-val') : ''; }
      var empty = value === '' || value == null || (Array.isArray(value) && !value.length);
      if(required && empty) missing.push(id);
      if(!empty) answers[id] = value;
    });
    return { answers: answers, missing: missing };
  }
  function highlightMissing(ids, containerId){
    var first = null;
    document.querySelectorAll('#' + (containerId || 'cpAiQuestions') + ' .intake-q').forEach(function(block){
      var isMissing = ids.indexOf(block.getAttribute('data-qid')) !== -1;
      block.classList.toggle('missing', isMissing);
      if(isMissing && !first) first = block;
    });
    if(first) first.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  function refreshPriceDisplays(){
    renderPriceTable(document.querySelector('#priceTabs .tab[aria-selected="true"]') ? document.querySelector('#priceTabs .tab[aria-selected="true"]').getAttribute('data-cat') : 'all');
    populateSelect(document.getElementById('mService'));
    populateSelect(document.getElementById('cpSpecialty'));
    renderMegaMenu();
    if(!document.getElementById('navCountrySelect').options.length){
      renderCountryOptions(document.getElementById('navCountrySelect'), 'Country');
      renderCountryOptions(document.getElementById('heroCountrySelect'), 'Select your country');
      renderCountryOptions(document.getElementById('mobileCountrySelect'), 'Select your country');
      renderCountryOptions(document.getElementById('regCountry'), 'Select your country');
      renderCountryOptions(document.getElementById('clinApCountry'), 'Select your country');
      renderCountryOptions(document.getElementById('pCountry'), 'Select your country');
    }
    setText('heroFromPrice', fmt(currentPrice(SERVICES[3].price)));
    setText('bannerCode', PROMO.code);
    setText('priceStripCode', PROMO.code);
    var bp = currentPrice(SERVICES[3].price), sp = threeSplit(bp);
    setText('bnplExAmount', fmt(bp));
    setText('bnplExFull', fmt(bp)+' today');
    setText('bnplExThree', '3 \u00d7 '+fmt(sp[0]));
    // Prices on server-built pages (assessment pages) follow the promo state too.
    document.querySelectorAll('[data-live-price]').forEach(function(el){
      var svc = findService(el.getAttribute('data-live-price'));
      if(svc && svc.name === el.getAttribute('data-live-price')) el.textContent = fmt(currentPrice(svc.price));
    });
    renderFoundingCounter();
  }

  function renderFoundingCounter(){
    var fc = document.getElementById('foundingCounter');
    if(!fc) return;
    var remaining = Math.max(0, FOUNDING_VOUCHER_CAP - FOUNDING_VOUCHERS_CLAIMED);
    fc.textContent = remaining + ' of ' + FOUNDING_VOUCHER_CAP + ' remaining';
  }

  /// Pulls the real count of claimed vouchers from the server.
  function loadFoundingCount(){
    apiCall('GET', '/api/vouchers/count').then(function(res){
      if(!res.ok) return;
      FOUNDING_VOUCHER_CAP = res.data.cap || FOUNDING_VOUCHER_CAP;
      FOUNDING_VOUCHERS_CLAIMED = res.data.claimed || 0;
      renderFoundingCounter();
    });
  }

  function setBannerCountdown(){
    var key='eldavaPromoDeadline'; var deadline;
    try{
      deadline = localStorage.getItem(key);
      if(!deadline){ deadline = Date.now()+14*24*60*60*1000; localStorage.setItem(key,String(deadline)); }
      else{ deadline = parseInt(deadline,10); }
    }catch(e){ deadline = Date.now()+14*24*60*60*1000; }
    function tick(){
      var ms = deadline-Date.now(); var el=document.getElementById('bannerCountdown'); if(!el) return;
      if(ms<=0){ el.textContent='Offer ending soon'; return; }
      var d=Math.floor(ms/86400000), h=Math.floor((ms%86400000)/3600000), m=Math.floor((ms%3600000)/60000);
      el.textContent = d+'d '+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m';
    }
    tick(); setInterval(tick,30000);
  }

  window.Eldava = {
    setCountry: function(name){
      selectedCountry = name || '';
      ['navCountrySelect','heroCountrySelect','mobileCountrySelect','regCountry','clinApCountry','pCountry'].forEach(function(id){
        var el = document.getElementById(id);
        if(el && el.value !== selectedCountry && Array.from(el.options).some(function(o){ return o.value === selectedCountry; })){
          el.value = selectedCountry;
        }
        if(el) el.classList.toggle('is-placeholder', !el.value);
      });
      var note = document.getElementById('heroCountryNote');
      if(note){ note.textContent = selectedCountry ? ('Showing pricing and availability for ' + selectedCountry + '.') : ''; }
    },
    startScreener: function(type){
      document.getElementById('screenStart-'+type).style.display = 'none';
      var qEl = document.getElementById('screenQs-'+type);
      qEl.innerHTML = renderScreenerQuestions(type);
      qEl.style.display = 'block';
    },
    answerScreener: function(type, qi, oi, btn){
      screenState[type][qi] = oi;
      var row = btn.parentElement;
      row.querySelectorAll('.radio-opt').forEach(function(b){ b.classList.remove('selected'); });
      btn.classList.add('selected');
    },
    finishScreener: function(type){
      var answers = screenState[type];
      var answered = answers.filter(function(a){ return a !== null; });
      var total = answered.reduce(function(s,a){ return s+a; }, 0);
      var band;
      if(answered.length === 0){ band = "Answer at least one question to see a reflection."; }
      else if(total <= 6){ band = "Based on your answers, these " + SCREENERS[type].label + " show up rarely for you."; }
      else if(total <= 13){ band = "Based on your answers, these " + SCREENERS[type].label + " show up sometimes for you."; }
      else { band = "Based on your answers, these " + SCREENERS[type].label + " show up often for you. Many people who recognise this pattern choose to book a full assessment."; }
      var resEl = document.getElementById('screenResult-'+type);
      resEl.innerHTML = '<div class="note-box">'+band+' This is an informal reflection, not a score or a diagnosis. <button onclick="Eldava.go(\'pricing\')" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">See assessment pricing</button> or <button onclick="Eldava.openBooking()" style="background:none;border:none;color:var(--jade-deep);text-decoration:underline;cursor:pointer;padding:0;font:inherit;">book a full assessment</button>.</div>';
      resEl.style.display = 'block';
    },
    go: function(page){
      if(page === 'clinician-portal' && !clinicianAccount){ page = 'clinician-login'; }
      // The profile page is meaningless signed out - send them to sign in, then
      // bounce them back here once they have.
      if(page === 'profile' && !patientAccount){ pendingAction = 'profile'; pendingArgs = null; page = 'register'; }
      var target = document.getElementById('page-'+page);
      // Each page ships only its own section (lib/activate-route.ts); any
      // other section is a real page load at its own URL.
      if(!target){ if(PAGE_PATHS[page]){ window.location.href = PAGE_PATHS[page]; } return; }
      document.querySelectorAll('.page-view').forEach(function(p){ p.classList.remove('active'); });
      target.classList.add('active');
      // Mark the active nav item so the underline indicator tracks the page.
      document.querySelectorAll('nav.links .navlink').forEach(function(b){
        if(b.getAttribute('data-page') === page){ b.setAttribute('aria-current','page'); } else { b.removeAttribute('aria-current'); }
      });
      if(page === 'profile'){ Eldava.loadProfile(); }
      if(page === 'clinician-portal'){ loadClinicianCases(); }
      window.scrollTo(0,0);
      Eldava.closeMega();
      Eldava.closeSolutions();
      Eldava.closeMobileNav();
      var titles = {
        home:'Private Online ADHD & Autism Assessments | Eldava Health',
        pricing:'Private Assessment Prices: ADHD, Autism & More | Eldava Health',
        how:'How an Online ADHD or Autism Assessment Works | Eldava Health',
        partner:'Join Our Clinician Network | Remote Assessment Work | Eldava Health',
        about:'About Eldava Health | Clinical Governance & Patient Safety',
        pharmacy:'Online Prescription & Pharmacy Delivery | Eldava Health',
        academy:'ADHD & Autism Assessment Training for Clinicians | Eldava Health',
        corporate:'Neurodiversity & ADHD Assessments for Employers | Eldava Health',
        schools:'SEN, EHCP & Autism Assessments for Schools | Eldava Health',
        universities:'DSA Assessments for University Students | Eldava Health',
        insurers:'Diagnostic Assessment Partnerships for Insurers | Eldava Health',
        ai:'Guided Pre-Consultation Intake Technology | Eldava Health',
        outcomes:'Outcomes and Transparency | Eldava Health',
        pathway:'ADHD Assessment, Treatment & Aftercare Pathway | Eldava Health',
        'founder-note':'Why We Built Eldava Health: A Note From the Founder',
        screening:'Free ADHD & Autism Screening Tests Online | Eldava Health',
        register:'Create Your Account | Eldava Health',
        profile:'Your Profile | Eldava Health',
        'clinician-login':'Clinician Sign In | Eldava Health',
        'clinician-portal':'Clinician Portal | Eldava Health',
        founders:'Founders Circle | Eldava Health',
        events:'ADHD, Autism & Dementia Webinars and Events | Eldava Health',
        blog:'ADHD, Autism & Assessment Articles | Eldava Health Insights',
        'health-systems':'Assessment Backlog Pilots for NHS Trusts & ICBs | Eldava Health',
        legal:'Mental Capacity & Medico-Legal Expert Reports | Eldava Health',
        charity:'Our Dementia & Fertility Charity Partnership | Eldava Health',
        founding500:'Founding 500: Prepaid Assessment Vouchers | Eldava Health'
      };
      var descs = {
        home:'Private online assessments with licensed clinicians: adult and child ADHD, autism, dementia and memory, menopause and more. Appointments in days, not years. Pay in full or in 3.',
        pricing:'Transparent prices for 60+ private assessments: adult ADHD, autism, dementia memory assessment, menopause, dyslexia and medico-legal reports. Report included, pay in full or in 3.',
        how:'How a private online assessment works: book, a guided pre-consultation with a safety check, live video with a licensed clinician, then a signed written report.',
        partner:'Join the Eldava Health clinician network: remote, flexible assessment work for psychiatrists, psychologists, pharmacists and specialist nurse prescribers.',
        about:'Who we are, our clinical governance model and Clinical Director, and the credentialing and safety standards behind every Eldava Health assessment.',
        pharmacy:'How prescriptions work after an Eldava Health assessment: sent to a pharmacy of your choice or a delivery partner, only where medication is clinically indicated.',
        academy:'Structured training for licensed clinicians building a specialism in adult and child ADHD and autism assessment, with supervised practice.',
        corporate:'Employer programmes for neurodivergent staff: ADHD, autism and specialist assessments with workplace-ready reports, in Essential, Growth and Enterprise tiers.',
        schools:'Specialist assessment programmes for schools and multi-academy trusts: autism, ADHD and educational psychology assessments with EHCP-ready reports.',
        universities:'ADHD, autism and dyslexia assessment pathways for universities and students, with DSA-ready diagnostic reports for Disabled Students\' Allowance applications.',
        insurers:'Partnership programmes for health insurers referring policyholders for specialist diagnostic assessment, with fixed pricing and fast access.',
        ai:'How our guided pre-consultation works before your assessment, what it does and does not do, and why a licensed clinician always makes every clinical decision.',
        outcomes:'How Eldava Health measures and reports outcomes honestly: what we publish, what we do not claim, and how patient feedback is verified.',
        pathway:'The Complete Pathway: diagnostic assessment, medication titration, coaching and ongoing review with the same service, instead of starting again after diagnosis.',
        'founder-note':'Why Jayden Ohen built Eldava Health, in his own words: long waiting lists, families left without answers, and what a better assessment service looks like.',
        screening:'Free, non-diagnostic online screening questionnaires for ADHD and autism traits. A starting point, not a diagnosis, with guidance on what to do next.',
        register:'Create your Eldava Health patient account to book an assessment.',
        profile:'Your Eldava Health account details, appointments and vouchers.',
        'clinician-login':'Sign in to the Eldava Health clinician portal.',
        'clinician-portal':'Manage your Eldava Health clinician caseload and appointments.',
        founders:'The Eldava Health Founders Circle for early clinical and commercial partners.',
        events:'Upcoming Eldava Health webinars and events on ADHD, autism, dementia and specialist assessment, for clinicians and the public.',
        blog:'Practical, fact-checked articles on adult ADHD, autism, getting a private assessment, waiting lists and workplace support, reviewed by clinicians.',
        'health-systems':'Commissioner-funded and self-funded ADHD, autism and memory assessment backlog pilots for NHS trusts, ICBs and public health systems.',
        legal:'Medico-legal instructions for solicitors: mental capacity, testamentary capacity, best interests assessments and court-ready psychiatric expert witness reports.',
        charity:'How every completed Eldava Health assessment gives back to our dementia and fertility charity partners.',
        founding500:'500 prepaid assessment vouchers at founding pricing, locked for life: memory assessment, fertility and neurodivergent assessment. Closing at launch on 30 September 2026.'
      };
      document.title = titles[page] || 'Eldava Health';
      var metaDesc = document.querySelector('meta[name="description"]');
      if(metaDesc){ metaDesc.setAttribute('content', descs[page] || descs.home); }
      var canon = document.querySelector('link[rel="canonical"]');
      var realPath = PAGE_PATHS[page] || '/';
      if(canon){ try{ canon.setAttribute('href', new URL(canon.getAttribute('href'), location.href).origin + realPath); }catch(e){} }
      // Real path-based navigation: each page has its own crawlable URL (see PAGE_PATHS above),
      // not just a hash fragment, so this route is independently indexable and shareable.
      try{
        if(location.pathname !== realPath){ history.pushState({page:page}, '', realPath); }
      }catch(e){}
    },
    filterPriceByCat: function(cat){
      // Called straight after go('pricing'); from any other page that is a
      // page load, so carry the choice across it.
      if(!document.getElementById('priceTableBody')){ try{ sessionStorage.setItem('eldavaPriceCat', cat); }catch(e){} return; }
      document.querySelectorAll('#priceTabs .tab').forEach(function(t){ t.setAttribute('aria-selected', t.getAttribute('data-cat')===cat ? 'true':'false'); });
      renderPriceTable(cat);
    },
    toggleMega: function(){
      var m = document.getElementById('megaMenu');
      m.hidden = !m.hidden;
      document.getElementById('orgMenu').hidden = true;
      document.getElementById('resMenu').hidden = true;
      document.getElementById('acctMenu').hidden = true;
      syncMenuState();
    },
    closeMega: function(){ document.getElementById('megaMenu').hidden = true; syncMenuState(); },
    toggleOrg: function(){
      var m = document.getElementById('orgMenu');
      m.hidden = !m.hidden;
      document.getElementById('megaMenu').hidden = true;
      document.getElementById('resMenu').hidden = true;
      document.getElementById('acctMenu').hidden = true;
      syncMenuState();
    },
    closeOrg: function(){ document.getElementById('orgMenu').hidden = true; syncMenuState(); },
    toggleResources: function(){
      var m = document.getElementById('resMenu');
      m.hidden = !m.hidden;
      document.getElementById('megaMenu').hidden = true;
      document.getElementById('orgMenu').hidden = true;
      document.getElementById('acctMenu').hidden = true;
      syncMenuState();
    },
    closeResources: function(){ document.getElementById('resMenu').hidden = true; syncMenuState(); },
    closeSolutions: function(){ Eldava.closeOrg(); Eldava.closeResources(); },
    toggleAcct: function(){
      var m = document.getElementById('acctMenu');
      m.hidden = !m.hidden;
      document.getElementById('megaMenu').hidden = true;
      document.getElementById('orgMenu').hidden = true;
      document.getElementById('resMenu').hidden = true;
    },
    closeAcct: function(){ document.getElementById('acctMenu').hidden = true; },
    toggleMobileNav: function(){
      var p = document.getElementById('mobilePanel');
      var open = p.classList.toggle('open');
      p.hidden = !open;
      document.getElementById('mobileToggle').setAttribute('aria-expanded', open ? 'true':'false');
    },
    closeMobileNav: function(){
      var p = document.getElementById('mobilePanel');
      p.classList.remove('open'); p.hidden = true;
      document.getElementById('mobileToggle').setAttribute('aria-expanded','false');
    },
    switchPartner: function(btn, which){
      document.querySelectorAll('.role-grid .role-card').forEach(function(b){ b.setAttribute('aria-selected','false'); });
      btn.setAttribute('aria-selected','true');
      ['clin','pharma','student','org','tech'].forEach(function(k){
        var el = document.getElementById('partner'+k.charAt(0).toUpperCase()+k.slice(1));
        if(el) el.classList.toggle('active', which===k);
      });
    },
    toggleAcc: function(btn){
      var item = btn.closest('.acc-item'); var panel = item.querySelector('.acc-panel');
      var open = item.getAttribute('data-open')==='true';
      item.setAttribute('data-open', open?'false':'true');
      panel.style.maxHeight = open?'0px':(panel.scrollHeight+'px');
    },
    filterPrice: function(btn){
      document.querySelectorAll('#priceTabs .tab').forEach(function(t){ t.setAttribute('aria-selected','false'); });
      btn.setAttribute('aria-selected','true');
      renderPriceTable(btn.getAttribute('data-cat'));
    },
    filterBlog: function(btn){
      blogFilter = btn.getAttribute('data-cat');
      document.querySelectorAll('#blogTabs .tab').forEach(function(t){ t.setAttribute('aria-selected', t===btn?'true':'false'); });
      renderBlogGrid();
    },
    openArticle: function(id){
      var a = findArticle(id);
      if(!a) return;
      // Articles have their own pages now; the modal below is no longer used.
      window.location.href = '/insights/'+id+'/'; return;
      document.getElementById('articleCat').textContent = ARTICLE_CATS[a.cat];
      document.getElementById('articleTitle').textContent = a.title;
      document.getElementById('articleMeta').textContent = a.read + ' · Reviewed 2 September 2026';
      document.getElementById('articleBody').innerHTML = a.body;
      var ctaEl = document.getElementById('articleCta');
      if(a.cta){
        ctaEl.innerHTML = '<div><h4 style="margin-bottom:4px;">Related</h4><p style="color:var(--text-soft);">'+a.title+'</p></div><button class="btn btn-primary" onclick="'+a.cta.action.replace(/"/g,'&quot;')+'">'+a.cta.text+'</button>';
      } else { ctaEl.innerHTML=''; }
      document.getElementById('articleOverlay').hidden = false;
      document.getElementById('articleOverlay').scrollTop = 0;
      document.querySelector('.article-modal').scrollTop = 0;
      try{ history.replaceState(null,'','#blog-'+id); }catch(e){}
    },
    closeArticle: function(){
      document.getElementById('articleOverlay').hidden = true;
      try{ history.replaceState(null,'','#blog'); }catch(e){}
    },
    dismissBanner: function(){ document.getElementById('promoBanner').hidden = true; try{ localStorage.setItem('eldavaBannerDismissed','1'); }catch(e){} },
    openBooking: function(serviceName){
      if(!patientAccount){ pendingAction = 'booking'; pendingArgs = serviceName; Eldava.go('register'); return; }
      var svc = findService(serviceName || state.service);
      state.service = svc.name; state.price = svc.price; state.safetyFlag = false; state.payMode='full';
      // A fresh booking starts with no intake attached; the guided flow sets
      // booking.intakeId AFTER calling this, so a stale one from an earlier
      // booking can never be reused here.
      booking.slotId = null; booking.appointmentId = null; booking.voucherId = null; booking.reference = null; booking.promo = null; booking.intakeId = null;
      booking.isVoucher = svc.cat === 'founding';
      showError('step0Error', '');
      document.getElementById('mService').value = svc.name;
      Eldava.updateSummary();
      Eldava.setPayMode('full');
      ['qPrior','qCare','qSafety'].forEach(function(id){ document.getElementById(id).querySelectorAll('.radio-opt').forEach(function(o){o.classList.remove('selected');}); });
      document.getElementById('crisisBox').hidden = true;
      document.getElementById('step0NextBtn').hidden = false;
      document.getElementById('qNotes').value = '';
      showError('payError', '');
      toggleHidden('promoApplied', true);
      // Prefill from the account rather than asking again for what we know.
      var nameEl = document.getElementById('pName'), emailEl = document.getElementById('pEmail');
      if(nameEl && !nameEl.value) nameEl.value = patientAccount.fullName || '';
      if(emailEl && !emailEl.value) emailEl.value = patientAccount.email || '';
      Eldava.bookingBack(0);
      document.getElementById('bookingOverlay').hidden = false;
      document.body.style.overflow = 'hidden';
    },
    closeBooking: function(){ document.getElementById('bookingOverlay').hidden = true; document.body.style.overflow = ''; },
    updateSummary: function(){
      var svc = findService(state.service);
      var was = svc.price, now = booking.promo ? booking.promo.priceMinor / 100 : currentPrice(svc.price);
      var discounted = booking.promo ? true : PROMO.claimed;
      document.getElementById('mSummaryName').textContent = svc.name;
      document.getElementById('mSummaryName2').textContent = svc.name;
      document.getElementById('mSummaryPrice').textContent = fmt(now);
      document.getElementById('mSummaryPrice2').textContent = fmt(now);
      [document.getElementById('mSummaryWas'), document.getElementById('mSummaryWas2')].forEach(function(el){ el.textContent = fmt(was); el.hidden = !discounted; });
      // Klarna sets its own instalment plan at its checkout after its own
      // eligibility check, so we show the total and let Klarna state the split.
      var sp = threeSplit(now);
      document.getElementById('payFullSub').textContent = fmt(now)+' today';
      document.getElementById('payThreeSub').textContent = 'Around 3 \u00d7 '+fmt(sp[0])+', set by Klarna';
      document.getElementById('bnplInst1').textContent = fmt(now);
      document.getElementById('bnplInst2').textContent = 'Klarna';
      document.getElementById('bnplInst3').textContent = 'At checkout';
    },
    /// 'full' pays by card now; 'three' hands off to Klarna.
    setPayMode: function(mode){
      state.payMode = mode;
      document.getElementById('payFullOpt').classList.toggle('selected', mode==='full');
      document.getElementById('payThreeOpt').classList.toggle('selected', mode==='three');
      document.getElementById('bnplBreakdown').classList.toggle('on', mode==='three');
      var btn = document.getElementById('payNowBtn');
      if(btn){ btn.textContent = mode==='three' ? 'Continue to Klarna' : 'Continue to secure payment'; btn.setAttribute('data-label', btn.textContent); }
    },
    /// Step between "what's going on" and choosing a time: the AI asks its
    /// structured questions inside the booking modal.
    bookingStartIntake: function(){
      var concern = (document.getElementById('qNotes').value || '').trim();
      showError('step0Error', '');
      if(concern.length < 10){
        showError('step0Error', 'Please tell us, in a sentence or two, what has been going on - your clinician reads this before you meet.');
        document.getElementById('qNotes').focus();
        return;
      }
      intake = { id:null, questions:[], answers:{}, redFlag:false, aiGenerated:false };
      setBusy('step0NextBtn', true, 'Preparing your questions…');
      apiCall('POST', '/api/intake/start', { specialty: state.service, concern: concern }).then(function(res){
        setBusy('step0NextBtn', false);
        if(!res.ok){
          if(res.status === 401){ pendingAction='booking'; pendingArgs=state.service; Eldava.closeBooking(); Eldava.go('register'); return; }
          showError('step0Error', res.data.error || 'Could not prepare your questions. Please try again.');
          return;
        }
        intake.id = res.data.intakeId; intake.questions = res.data.questions || []; intake.aiGenerated = res.data.aiGenerated;
        renderIntakeIntro(res.data.intro, res.data.aiGenerated, 'bookAiIntro');
        renderIntakeQuestions(intake.questions, 'bookAiQuestions');
        showError('bookAiError', ''); toggleHidden('bookAiCrisis', true); toggleHidden('bookAiBtn', false);
        bookingShow(0); document.getElementById('bookStep0').hidden = true;
        document.getElementById('bookStepAI').hidden = false;
        var modal = document.querySelector('#bookingOverlay .modal'); if(modal) modal.scrollTop = 0;
      });
    },
    /// Submits the intake answers. Follow-ups append in place; a safety
    /// disclosure stops the booking with crisis signposting; otherwise the
    /// intake is completed (which writes the clinician's summary) and the
    /// patient moves on to choose a time.
    bookingIntakeNext: function(){
      var collected = collectIntakeAnswers('bookAiQuestions');
      showError('bookAiError', '');
      if(collected.missing.length){ showError('bookAiError', 'Please answer every required question before continuing.'); highlightMissing(collected.missing, 'bookAiQuestions'); return; }
      setBusy('bookAiBtn', true, 'Saving your answers…');
      apiCall('POST', '/api/intake/answer', { intakeId: intake.id, answers: collected.answers }).then(function(res){
        if(!res.ok){ setBusy('bookAiBtn', false); showError('bookAiError', res.data.error || 'Could not save your answers.'); return; }
        intake.answers = collected.answers; intake.redFlag = res.data.redFlag;

        if(!res.data.done && (res.data.questions || []).length){
          setBusy('bookAiBtn', false);
          intake.questions = intake.questions.concat(res.data.questions);
          appendIntakeQuestions(res.data.questions, res.data.intro, 'bookAiQuestions');
          return;
        }
        if(intake.redFlag){
          setBusy('bookAiBtn', false);
          toggleHidden('bookAiCrisis', false); toggleHidden('bookAiBtn', true);
          document.getElementById('bookAiCrisis').scrollIntoView({ behavior:'smooth', block:'center' });
          return;
        }
        setBusy('bookAiBtn', true, 'Preparing your clinician’s summary…');
        apiCall('POST', '/api/intake/complete', { intakeId: intake.id }).then(function(done){
          setBusy('bookAiBtn', false);
          if(!done.ok){ showError('bookAiError', done.data.error || 'Could not complete your questions.'); return; }
          booking.intakeId = intake.id;
          bookingShow(1);
          Eldava.loadSlots();
        });
      });
    },
    /// Fetches live availability for the selected service.
    loadSlots: function(){
      var picker = document.getElementById('slotPicker'), nextBtn = document.getElementById('slotNextBtn');
      booking.slotId = null;
      if(nextBtn) nextBtn.disabled = true;
      picker.innerHTML = '<div class="slot-loading">Loading available appointments&hellip;</div>';
      apiCall('GET', '/api/booking/slots?service=' + encodeURIComponent(state.service)).then(function(res){
        if(!res.ok){
          if(res.status === 401){ pendingAction='booking'; pendingArgs=state.service; Eldava.closeBooking(); Eldava.go('register'); return; }
          picker.innerHTML = '<p class="slot-empty">'+esc(res.data.error || 'Could not load availability.')+'</p>'; return;
        }
        var clinicians = res.data.clinicians || [];
        if(!clinicians.length){ picker.innerHTML = '<p class="slot-empty">No appointments are currently listed for this service. Please contact us and we will find you a time.</p>'; return; }
        picker.innerHTML = clinicians.map(function(c){
          return '<div class="slot-clinician"><div class="slot-clinician-head"><b>'+esc(c.displayName)+'</b>'+(c.regulator ? '<span class="slot-reg">'+esc(c.regulator)+'</span>' : '')+'</div>'
            + (c.bio ? '<p class="slot-bio">'+esc(c.bio)+'</p>' : '')
            + '<div class="slot-grid">'+c.slots.slice(0, 24).map(function(s){
                return '<button type="button" class="slot-opt" data-slot="'+esc(s.id)+'" onclick="Eldava.selectSlot(this, \''+esc(s.id)+'\', \''+esc(c.displayName)+'\', \''+esc(s.startsAt)+'\', \''+esc(s.mode)+'\')">'
                  + '<span class="d">'+esc(fmtSlotDate(s.startsAt))+'</span><span class="t">'+esc(fmtSlotTime(s.startsAt))+'</span><span class="m">'+esc(s.mode)+'</span></button>';
              }).join('')+'</div></div>';
        }).join('');
      });
    },
    selectSlot: function(el, slotId, clinicianName, startsAt, mode){
      document.querySelectorAll('#slotPicker .slot-opt').forEach(function(b){ b.classList.remove('selected'); });
      el.classList.add('selected');
      booking.slotId = slotId; booking.clinicianName = clinicianName; booking.startsAt = startsAt; booking.mode = mode;
      var nextBtn = document.getElementById('slotNextBtn'); if(nextBtn) nextBtn.disabled = false;
    },
    onModalServiceChange: function(){
      var svc = findService(document.getElementById('mService').value);
      state.service = svc.name; state.price = svc.price;
      Eldava.updateSummary();
    },
    selectRadio: function(groupId, el, isSafety){
      document.getElementById(groupId).querySelectorAll('.radio-opt').forEach(function(o){ o.classList.remove('selected'); });
      el.classList.add('selected');
      var val = el.getAttribute('data-val');
      if(groupId==='qSafety'){
        state.safetyFlag = !!isSafety;
        document.getElementById('crisisBox').hidden = !state.safetyFlag;
        document.getElementById('step0NextBtn').hidden = state.safetyFlag;
      } else if(groupId==='cpDuration'){ cp.duration = val; }
      else if(groupId==='cpPrior'){ cp.prior = val; }
      else if(groupId==='cpMeds'){ cp.meds = val; }
      else if(groupId==='cpFamily'){ cp.family = val; }
      else if(groupId==='cpSafety'){
        cp.safety = !!isSafety;
        document.getElementById('cpCrisisBox').hidden = !(cp.safety || cp.selfHarmFlagFromScreener);
        document.getElementById('cpStep3NextBtn').hidden = cp.safety;
      }
    },
    cpScreenerSelect: function(flatIndex, scaleIdx, el){
      el.parentElement.querySelectorAll('.radio-opt').forEach(function(o){ o.classList.remove('selected'); });
      el.classList.add('selected');
      cp.screenerAnswers[flatIndex] = scaleIdx;
      var scr = CP_SCREENERS[cp.track];
      var total = scr.groups.reduce(function(n,g){ return n+g.items.length; }, 0);
      var answered = cp.screenerAnswers.filter(function(v){ return v!==undefined && v!==null; }).length;
      document.getElementById('cpStep2NextBtn').disabled = (answered < total);
    },
    bookingNext: function(step){
      if(step===1 && state.safetyFlag){ return; }

      if(step===1){
        // Founding vouchers are prepaid and redeemed later - there is no slot
        // to choose, so skip straight to details.
        if(booking.isVoucher){ bookingShow(2); return; }

        // Every consultation booking goes through the AI intake before a time
        // is chosen, so the clinician always receives a summary. If the
        // patient arrived from the guided flow the intake is already complete
        // and this is skipped.
        if(!booking.intakeId){ Eldava.bookingStartIntake(); return; }

        bookingShow(1);
        Eldava.loadSlots();
        return;
      }

      if(step===2 && !booking.isVoucher && !booking.slotId){ return; }

      if(step===3){
        var name=document.getElementById('pName').value, email=document.getElementById('pEmail').value;
        if(!name||!email){ document.getElementById(!name?'pName':'pEmail').focus(); return; }
        var code = document.getElementById('promoCodeInput').value.trim().toUpperCase();

        showError('payError', '');
        setBusy('payNowBtn', true, 'Holding your place…');

        var request = booking.isVoucher
          ? apiCall('POST', '/api/vouchers/create', { serviceName: state.service })
          : apiCall('POST', '/api/booking/create', { slotId: booking.slotId, serviceName: state.service, intakeId: booking.intakeId, promoCode: code || null });

        request.then(function(res){
          setBusy('payNowBtn', false);
          if(!res.ok){
            if(res.status === 409 && !booking.isVoucher){
              bookingShow(1); Eldava.loadSlots();
              window.alert(res.data.error || 'That time has just been taken. Please choose another.');
              return;
            }
            if(res.status === 401){ pendingAction='booking'; pendingArgs=state.service; Eldava.closeBooking(); Eldava.go('register'); return; }
            showError('payError', res.data.error || 'Could not hold that appointment.');
            bookingShow(3);
            return;
          }
          if(booking.isVoucher){
            booking.voucherId = res.data.voucherId; booking.reference = res.data.code;
          } else {
            booking.appointmentId = res.data.appointmentId; booking.reference = res.data.reference;
            booking.clinicianName = res.data.clinician.displayName; booking.startsAt = res.data.startsAt;
          }
          // The server decided the price - including whether the promo code
          // was valid - so the payment step reflects that, not a client guess.
          booking.promo = res.data.promo ? { code: res.data.promo.code, percentOff: res.data.promo.percentOff, priceMinor: res.data.priceMinor } : null;
          var applied = document.getElementById('promoApplied');
          if(applied){
            if(res.data.resumed){ applied.textContent = 'You already held this time - picking up where you left off. ' + (booking.promo ? booking.promo.code + ' is applied.' : ''); applied.hidden = false; }
            else if(booking.promo){ applied.textContent = booking.promo.code + ' applied: ' + booking.promo.percentOff + '% off, saving ' + fmt(res.data.discountMinor / 100) + '.'; applied.hidden = false; }
            else if(res.data.promoError){ applied.textContent = 'Promo code not applied: ' + res.data.promoError; applied.hidden = false; }
            else { applied.hidden = true; }
          }
          Eldava.updateSummary();
          bookingShow(3);
        });
        return;
      }

      bookingShow(step);
    },
    bookingBack: function(step){
      // Going back from payment on a voucher purchase skips the slot step too.
      if(step===1 && booking.isVoucher) step = 0;
      bookingShow(step);
    },
    /// Hands off to the payment provider's hosted page. Nothing is confirmed
    /// here - the provider's webhook is what marks the purchase paid.
    confirmBooking: function(){
      if(!booking.appointmentId && !booking.voucherId){ showError('payError', 'Your place has not been held yet. Go back a step.'); return; }
      showError('payError', '');
      setBusy('payNowBtn', true, 'Opening secure payment…');
      apiCall('POST', '/api/payments/checkout', {
        appointmentId: booking.appointmentId, voucherId: booking.voucherId,
        method: state.payMode === 'three' ? 'KLARNA' : 'CARD'
      }).then(function(res){
        if(!res.ok){ setBusy('payNowBtn', false); showError('payError', res.data.error || 'Could not start the payment.'); return; }
        try{ sessionStorage.setItem('eldavaPendingRef', booking.reference || ''); }catch(e){}
        window.location.href = res.data.checkoutUrl;
      });
    },
    /// Restarts checkout for a booking or voucher that was held but never paid.
    resumePayment: function(id, isVoucher){
      apiCall('POST', '/api/payments/checkout', isVoucher ? { voucherId: id, method: 'CARD' } : { appointmentId: id, method: 'CARD' }).then(function(res){
        if(!res.ok){ window.alert(res.data.error || 'Could not restart the payment.'); Eldava.loadProfile(); return; }
        window.location.href = res.data.checkoutUrl;
      });
    },
    /// Renders the confirmation step from the server's view of the purchase.
    showBookingResult: function(status){
      bookingShow(4);
      var heading = document.getElementById('confirmHeading'), icon = document.getElementById('confirmIcon');
      var payLine = document.getElementById('confirmPayLine'), detail = document.getElementById('confirmDetail');
      var email = (patientAccount && patientAccount.email) || 'your email';
      setText('confirmRef', status.reference); setText('confirmEmail', email);
      var isVoucher = status.kind === 'voucher';
      var paid = status.paymentStatus === 'PAID' || status.status === 'CONFIRMED' || status.status === 'PAID';

      if(paid){
        icon.textContent = '✓'; icon.className = 'check';
        heading.textContent = isVoucher ? 'Your voucher is yours' : 'Your session is booked';
        payLine.textContent = 'A confirmation is on its way to ' + email + '.';
      } else if(status.paymentStatus === 'PROCESSING'){
        icon.textContent = '⋯'; icon.className = 'check pending';
        heading.textContent = 'Payment is being confirmed';
        payLine.textContent = 'Your provider is still confirming this payment. We will email ' + email + ' as soon as it clears.';
      } else {
        icon.textContent = '!'; icon.className = 'check failed';
        heading.textContent = 'Payment was not completed';
        payLine.textContent = status.lastError || 'No payment was taken. You can try again from My profile.';
      }

      detail.innerHTML = '<div class="row"><span>Service</span><b>'+esc(status.serviceName)+'</b></div>'
        + (isVoucher ? '<div class="row"><span>Voucher code</span><b>'+esc(status.reference)+'</b></div><div class="row"><span>Redeemable</span><b>After launch</b></div>'
          : '<div class="row"><span>Clinician</span><b>'+esc(status.clinicianName)+'</b></div><div class="row"><span>When</span><b>'+esc(fmtSlotFull(status.startsAt))+'</b></div><div class="row"><span>Format</span><b>'+esc(status.mode)+', '+esc(status.durationMin)+' min</b></div>')
        + '<div class="row"><span>Amount</span><b>'+esc(status.priceLabel)+(status.discountLabel ? ' <small>(saved '+esc(status.discountLabel)+')</small>' : '')+'</b></div>'
        + (status.paymentMethod ? '<div class="row"><span>Paid by</span><b>'+esc(status.paymentMethod==='KLARNA'?'Klarna':'Card')+'</b></div>' : '');
    },
    toggleEnquiry: function(){
      var p = document.getElementById('enquiryPanel');
      var willOpen = p.hidden;
      p.hidden = !p.hidden;
      if(willOpen){ Eldava.openEnquiry('default'); }
    },
    openEnquiry: function(kind){
      document.getElementById('enquiryPanel').hidden = false;
      var cfg = ENQUIRY_FORMS[kind] || ENQUIRY_FORMS['default'];
      document.getElementById('enquiryTitle').textContent = cfg.title;
      document.getElementById('enquirySub').textContent = cfg.sub;
      document.getElementById('eqExtra').innerHTML = renderEnquiryFields(kind);
      document.getElementById('enquiryPanel').setAttribute('data-kind', kind);
    },
    submitEnquiry: function(){
      var name=document.getElementById('eqName').value.trim(), email=document.getElementById('eqEmail').value.trim();
      var panel = document.getElementById('enquiryPanel');
      if(!name||!email){ document.getElementById(!name?'eqName':'eqEmail').focus(); return; }
      var kind = panel.getAttribute('data-kind') || 'default';
      var cfg = ENQUIRY_FORMS[kind] || ENQUIRY_FORMS['default'];

      // Gather the per-form extra fields by their ids.
      var fields = {};
      (cfg.fields || []).forEach(function(f){
        var el = document.getElementById(f.id);
        if(el && el.value) fields[f.label || f.id] = el.value;
      });

      var btn = panel.querySelector('button.btn-primary');
      if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }

      apiCall('POST', '/api/enquiries', { kind: kind, name: name, email: email, fields: fields }).then(function(res){
        if(!res.ok){
          if(btn){ btn.disabled = false; btn.textContent = 'Send'; }
          var err = panel.querySelector('.form-error');
          if(!err){ err = document.createElement('div'); err.className = 'form-error'; panel.appendChild(err); }
          err.textContent = res.data.error || 'Could not send your enquiry. Please try again.'; err.hidden = false;
          return;
        }
        panel.innerHTML = '<h4>Thank you, '+esc(name.split(' ')[0])+'</h4><p>Your enquiry has been sent to our team (reference '+esc(res.data.id.slice(-6).toUpperCase())+') and we will reply to '+esc(email)+' shortly. You can also reach us directly at <a href="mailto:'+esc(cfg.team)+'">'+esc(cfg.team)+'</a>.</p>';
      });
    },
    /// `auto` marks the timed first-visit popup, which is suppressed for anyone
    /// already signed in - pitching a sign-up discount to an existing patient
    /// on their own profile page is noise. The banner's explicit "Claim it"
    /// button still opens it for everyone.
    openPromo: function(auto){
      if(auto && (patientAccount || clinicianAccount)) return;
      document.getElementById('promoOverlay').hidden = false;
    },
    closePromo: function(){ document.getElementById('promoOverlay').hidden = true; try{ localStorage.setItem('eldavaPromoSeen','1'); }catch(e){} },
    claimPromo: function(){
      var email = document.getElementById('promoEmail').value.trim();
      if(!email){ document.getElementById('promoEmail').focus(); return; }
      // Lead capture. The discount itself is applied server-side at booking,
      // so the UI's "claimed" state is only a display preference.
      apiCall('POST', '/api/promo/claim', { email: email, code: PROMO.code, source: 'promo-modal' });
      PROMO.claimed = true; refreshPriceDisplays();
      try{ localStorage.setItem('eldavaPromoSeen','1'); localStorage.setItem('eldavaPromoClaimed','1'); }catch(e){}
      document.getElementById('promoOverlay').hidden = true;
    },
    applyPromoAndBook: function(){
      PROMO.claimed = true; refreshPriceDisplays();
      try{ localStorage.setItem('eldavaPromoClaimed','1'); }catch(e){}
      Eldava.openBooking();
    },
    closeNudge: function(){ document.getElementById('nudgeToast').hidden = true; try{ localStorage.setItem('eldavaNudgeSeen','1'); }catch(e){} },
    openCarePathway: function(){
      if(!patientAccount){ pendingAction = 'pathway'; pendingArgs = null; Eldava.go('register'); return; }
      cp = { specialty: document.getElementById('cpSpecialty').value, concern:'', duration:'', prior:'', meds:'', family:'', safety:false, track:'adhd', screenerAnswers:[], selfHarmFlagFromScreener:false, screenerResult:null };
      intake = { id:null, questions:[], answers:{}, redFlag:false, aiGenerated:false };
      document.getElementById('cpConcern').value = '';
      document.getElementById('cpAiQuestions').innerHTML = '';
      document.getElementById('cpAiIntro').innerHTML = '';
      showError('cpStartError', ''); showError('cpAnswerError', '');
      var g = document.getElementById('cpSafety'); if(g){ g.querySelectorAll('.radio-opt').forEach(function(o){o.classList.remove('selected');}); }
      document.getElementById('cpCrisisBox').hidden = true;
      document.getElementById('cpStep3NextBtn').hidden = false;
      Eldava.cpBack(0);
      document.getElementById('cpOverlay').hidden = false;
      document.body.style.overflow = 'hidden';
    },
    /// Option click for an AI-generated intake question.
    intakeSelect: function(el, multi){
      var rowEl = el.parentElement;
      if(multi){ el.classList.toggle('selected'); }
      else { rowEl.querySelectorAll('.radio-opt').forEach(function(o){ o.classList.remove('selected'); }); el.classList.add('selected'); }
      var block = el.closest('.intake-q'); if(block) block.classList.remove('missing');
    },
    /// The header has three states. A signed-in clinician wins over a patient
    /// session in the same browser: while a doctor is logged in the header is
    /// clinician-only - no patient avatar, no "Book a session" - because those
    /// are the patient's controls and showing them to a doctor is noise at
    /// best and a mis-booking at worst.
    refreshAccountUi: function(){
      var clin = !!clinicianAccount;
      var pat = !clin && !!patientAccount;

      // Header controls
      toggleHidden('acctToggle', clin || pat);
      toggleHidden('navBookBtn', clin);
      var avatar = document.getElementById('acctAvatar');
      if(avatar){ avatar.hidden = !pat; avatar.setAttribute('title', pat ? patientAccount.fullName : ''); }
      var clinAvatar = document.getElementById('acctClinAvatar');
      if(clinAvatar){ clinAvatar.hidden = !clin; clinAvatar.setAttribute('title', clin ? clinicianAccount.displayName : ''); }

      // Patient block
      var pi = pat ? initialsFor(patientAccount.fullName) : '?';
      setText('acctInitials', pi); setText('acctInitialsLg', pi);
      setText('acctWho', pat ? patientAccount.fullName : ''); setText('acctEmail', pat ? patientAccount.email : '');
      toggleHidden('acctSigned', !pat); toggleHidden('acctProfileOpt', !pat); toggleHidden('acctSignoutRow', !pat);

      // Clinician block
      var ci = clin ? initialsFor(clinicianAccount.displayName.replace(/^Dr\.?\s+/i, '')) : '?';
      setText('acctClinInitials', ci); setText('acctClinInitialsLg', ci);
      setText('acctClinWho', clin ? clinicianAccount.displayName : ''); setText('acctClinEmail', clin ? clinicianAccount.email : '');
      toggleHidden('acctClinSigned', !clin); toggleHidden('acctPortalOpt', !clin); toggleHidden('acctClinSignoutRow', !clin);

      // The generic "Patient / Clinician sign in" options only make sense signed out.
      toggleHidden('acctPatientOpt', clin || pat);
      var clinOpt = document.querySelector('#acctMenu a.acct-option[href="/clinician/sign-in/"]');
      if(clinOpt) clinOpt.hidden = clin || pat;

      // Mobile panel mirrors the same three states.
      toggleHidden('mobileAcctOut', clin || pat); toggleHidden('mobileAcctIn', !pat); toggleHidden('mobileAcctClin', !clin);
    },
    patientLogout: function(){
      apiCall('POST', '/api/auth/logout').then(function(){
        patientAccount = null;
        booking = { intakeId:null, slotId:null, appointmentId:null, voucherId:null, reference:null, clinicianName:'', startsAt:null, mode:'video', isVoucher:false, promo:null };
        intake = { id:null, questions:[], answers:{}, redFlag:false, aiGenerated:false };
        Eldava.refreshAccountUi(); Eldava.closeAcct(); Eldava.go('home');
      });
    },
    /// Loads and renders the profile page: details, appointments, vouchers.
    loadProfile: function(){
      var detailsEl = document.getElementById('profileDetails'), listEl = document.getElementById('profileAppointments'), vEl = document.getElementById('profileVouchers');
      if(!listEl) return;
      listEl.innerHTML = '<p class="profile-loading">Loading your appointments&hellip;</p>';
      apiCall('GET', '/api/patient/appointments').then(function(res){
        if(!res.ok){
          if(res.status === 401){ patientAccount = null; Eldava.refreshAccountUi(); Eldava.go('register'); return; }
          listEl.innerHTML = '<p class="profile-empty">'+esc(res.data.error || 'Could not load your appointments.')+'</p>'; return;
        }
        var p = res.data.patient;
        setText('profileGreeting', 'Hello, ' + (p.fullName || '').split(' ')[0]);
        if(detailsEl){
          detailsEl.innerHTML = row('Name', p.fullName) + row('Email', p.email) + row('Date of birth', p.dateOfBirth) + row('Country', p.country)
            + (p.phone ? row('Phone', p.phone) : '') + row('Member since', new Date(p.memberSince).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }));
        }
        var appts = res.data.appointments || [], vouchers = res.data.vouchers || [];
        if(!appts.length){
          listEl.innerHTML = '<p class="profile-empty">You have not booked an appointment yet.</p><button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="Eldava.openBooking()">Book a session</button>';
        } else {
          var upcoming = appts.filter(function(a){ return a.upcoming; }), past = appts.filter(function(a){ return !a.upcoming; });
          listEl.innerHTML = (upcoming.length ? '<h4 class="profile-sub">Upcoming</h4>' + upcoming.map(apptCard).join('') : '')
            + (past.length ? '<h4 class="profile-sub">Past</h4>' + past.map(apptCard).join('') : '');
        }
        if(vEl) vEl.innerHTML = vouchers.length ? '<h4 class="profile-sub">Founding 500 vouchers</h4>' + vouchers.map(voucherCard).join('') : '';
      });
    },
    closeCarePathway: function(){ document.getElementById('cpOverlay').hidden = true; document.body.style.overflow = ''; },
    setRegMode: function(mode){
      document.getElementById('regTabCreate').classList.toggle('active', mode==='create');
      document.getElementById('regTabLogin').classList.toggle('active', mode==='login');
      document.getElementById('regFormCreate').hidden = mode!=='create';
      document.getElementById('regFormLogin').hidden = mode!=='login';
      document.getElementById('regError').hidden = true;
      document.getElementById('loginError').hidden = true;
    },
    submitRegister: function(ev){
      ev.preventDefault();
      var isLogin = document.getElementById('regFormLogin').hidden === false;
      var errorId = isLogin ? 'loginError' : 'regError';
      showError(errorId, '');
      var request;
      if(isLogin){
        var email = document.getElementById('loginEmail').value.trim(), pw = document.getElementById('loginPassword').value;
        if(!email || !pw){ showError('loginError', 'Enter your email and password.'); return; }
        request = apiCall('POST', '/api/auth/login', { email: email, password: pw });
      } else {
        var name = document.getElementById('regName').value.trim(), em = document.getElementById('regEmail').value.trim();
        var pw2 = document.getElementById('regPassword').value, country = document.getElementById('regCountry').value, dob = document.getElementById('regDob').value;
        if(!name || !em || !country || !dob || pw2.length < 10){ showError('regError', 'Please fill in every field. Password must be at least 10 characters.'); return; }
        request = apiCall('POST', '/api/auth/register', { fullName: name, email: em, password: pw2, country: country, dateOfBirth: dob });
      }
      request.then(function(res){
        if(!res.ok){ showError(errorId, res.data.error || 'Something went wrong. Please try again.'); return; }
        patientAccount = res.data.patient;
        Eldava.refreshAccountUi();
        var action = pendingAction, args = pendingArgs;
        pendingAction = null; pendingArgs = null;
        if(action === 'booking'){ Eldava.openBooking(args); }
        else if(action === 'pathway'){ Eldava.openCarePathway(); }
        else { Eldava.go('profile'); }
      });
    },
    submitClinicianLogin: function(ev){
      ev.preventDefault();
      var email = document.getElementById('clinEmail').value.trim(), pw = document.getElementById('clinPassword').value;
      showError('clinLoginError', '');
      if(!email || !pw){ showError('clinLoginError', 'Enter your email and password.'); return; }
      apiCall('POST', '/api/clinician/login', { email: email, password: pw }).then(function(res){
        if(!res.ok){ showError('clinLoginError', res.data.error || 'Could not sign you in.'); return; }
        clinicianAccount = res.data.clinician;
        document.getElementById('clinWho').textContent = clinicianAccount.displayName;
        document.getElementById('clinPassword').value = '';
        Eldava.refreshAccountUi();
        clinicianCaseOpen = null; clinicianTab = 'upcoming';
        document.querySelectorAll('.clinician-nav-item').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab') === 'upcoming'); });
        Eldava.go('clinician-portal');
      });
    },
    clinicianLogout: function(){
      apiCall('POST', '/api/clinician/logout').then(function(){
        clinicianAccount = null; clinicianCaseOpen = null; clinicianCases = [];
        document.getElementById('clinEmail').value = ''; document.getElementById('clinPassword').value = '';
        Eldava.refreshAccountUi();
        Eldava.go('clinician-login'); Eldava.setClinMode('login');
      });
    },
    setClinMode: function(mode){
      document.getElementById('clinTabLogin').classList.toggle('active', mode==='login');
      document.getElementById('clinTabApply').classList.toggle('active', mode==='apply');
      document.getElementById('clinFormLogin').hidden = mode!=='login';
      document.getElementById('clinFormApply').hidden = mode!=='apply';
      document.getElementById('clinApplySuccess').style.display = 'none';
      document.getElementById('clinLoginError').hidden = true;
      document.getElementById('clinApplyError').hidden = true;
    },
    submitClinicianApply: function(ev){
      ev.preventDefault();
      var err = document.getElementById('clinApplyError');
      var required = ['clinApName','clinApEmail','clinApPassword','clinApSpecialty','clinApCountry','clinApQualification','clinApRegulator','clinApRegNumber','clinApExperience','clinApHours','clinApLanguages'];
      var missing = required.some(function(id){ return !document.getElementById(id).value.trim(); });
      var pwLen = document.getElementById('clinApPassword').value.length;
      if(missing || pwLen < 10){
        err.textContent = 'Please complete every field. Password must be at least 10 characters.';
        err.hidden = false;
        return;
      }
      err.hidden = true;
      var v = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var submitBtn = document.querySelector('#clinFormApply button[type="submit"]');
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }
      apiCall('POST', '/api/applications', {
        fullName: v('clinApName'), email: v('clinApEmail'), password: document.getElementById('clinApPassword').value,
        specialty: v('clinApSpecialty'), country: v('clinApCountry'), qualification: v('clinApQualification'),
        regulator: v('clinApRegulator'), regNumber: v('clinApRegNumber'), experience: v('clinApExperience'),
        hoursPerWeek: v('clinApHours'), languages: v('clinApLanguages'), notes: v('clinApNotes')
      }).then(function(res){
        if(submitBtn){ submitBtn.disabled = false; submitBtn.innerHTML = 'Submit application &rarr;'; }
        if(!res.ok){ err.textContent = res.data.error || 'Could not submit your application.'; err.hidden = false; return; }
        document.getElementById('clinFormApply').hidden = true;
        document.getElementById('clinApplySuccess').style.display = 'block';
      });
    },
    setClinicianTab: function(tab){
      clinicianTab = tab; clinicianCaseOpen = null;
      document.querySelectorAll('.clinician-nav-item').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab')===tab); });
      loadClinicianCases();
    },
    openClinicianCase: function(id){
      var el = document.getElementById('clinicianTabContent');
      if(el) el.innerHTML = '<p style="color:var(--void-soft);">Loading case&hellip;</p>';
      apiCall('GET', '/api/clinician/case/' + encodeURIComponent(id)).then(function(res){
        if(!res.ok){
          if(res.status === 401){ clinicianAccount = null; Eldava.go('clinician-login'); return; }
          if(el) el.innerHTML = '<p class="clin-empty">'+esc(res.data.error || 'Could not open that case.')+'</p>'; return;
        }
        clinicianCaseOpen = res.data; renderClinicianTabContent();
      });
    },
    closeClinicianCase: function(){ clinicianCaseOpen = null; loadClinicianCases(); },
    /// Saves (or, with `clear`, removes) the meeting link on the open case.
    saveJoinUrl: function(clear){
      if(!clinicianCaseOpen) return;
      showError('joinUrlError', '');
      var input = document.getElementById('joinUrlInput');
      var value = clear ? '' : (input ? input.value.trim() : '');
      if(!clear && !value){ showError('joinUrlError', 'Paste the meeting link first.'); return; }
      var btnId = clear ? 'joinUrlClear' : 'joinUrlSave';
      setBusy(btnId, true, clear ? 'Removing…' : 'Saving…');
      apiCall('PATCH', '/api/clinician/appointment/' + encodeURIComponent(clinicianCaseOpen.id), { joinUrl: value }).then(function(res){
        setBusy(btnId, false);
        if(!res.ok){ showError('joinUrlError', res.data.error || 'Could not save the link.'); return; }
        clinicianCaseOpen.joinUrl = res.data.joinUrl;
        renderClinicianTabContent();
        setText('joinUrlStatus', clear ? 'Link removed.' : (res.data.notified ? 'Saved. The patient has been emailed the link.' : 'Saved. The patient will see it under My profile.'));
      });
    },
    saveClinicianBio: function(){
      showError('clinBioError', '');
      var bio = (document.getElementById('clinBio') || {}).value || '';
      setBusy('clinBioSave', true, 'Saving…');
      apiCall('PATCH', '/api/clinician/me', { bio: bio }).then(function(res){
        setBusy('clinBioSave', false);
        if(!res.ok){ showError('clinBioError', res.data.error || 'Could not save.'); return; }
        setText('clinBioStatus', 'Bio saved.');
      });
    },
    changeClinicianPassword: function(){
      showError('clinPwError', '');
      var cur = (document.getElementById('clinPwCurrent') || {}).value || '', nw = (document.getElementById('clinPwNew') || {}).value || '';
      if(!cur || !nw){ showError('clinPwError', 'Enter your current password and a new one.'); return; }
      setBusy('clinPwSave', true, 'Changing…');
      apiCall('PATCH', '/api/clinician/me', { currentPassword: cur, newPassword: nw }).then(function(res){
        setBusy('clinPwSave', false);
        if(!res.ok){ showError('clinPwError', res.data.error || 'Could not change password.'); return; }
        document.getElementById('clinPwCurrent').value = ''; document.getElementById('clinPwNew').value = '';
        setText('clinPwStatus', 'Password changed. Any other devices signed in as you have been signed out.');
      });
    },
    /// Saves the clinician's SOAP note; `sign` makes it the clinical record.
    saveNote: function(sign){
      if(!clinicianCaseOpen) return;
      showError('noteError', '');
      var val = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
      if(sign && !window.confirm('Signing locks this note as the clinical record. It cannot be edited afterwards. Continue?')) return;
      var btnId = sign ? 'noteSignBtn' : 'noteSaveBtn';
      setBusy(btnId, true, sign ? 'Signing…' : 'Saving…');
      apiCall('POST', '/api/clinician/notes', { appointmentId: clinicianCaseOpen.id, subjective: val('noteS'), objective: val('noteO'), assessment: val('noteA'), plan: val('noteP'), sign: sign === true }).then(function(res){
        setBusy(btnId, false);
        if(!res.ok){ showError('noteError', res.data.error || 'Could not save the note.'); return; }
        if(res.data.signed){ Eldava.openClinicianCase(clinicianCaseOpen.id); return; }
        setText('noteStatus', 'Draft saved ' + new Date(res.data.updatedAt).toLocaleTimeString('en-GB') + '.');
      });
    },
    cpNext: function(step){
      // Steps 1 and 2 talk to the intake API and advance in a callback.
      if(step===1){
        cp.specialty = document.getElementById('cpSpecialty').value;
        cp.concern = document.getElementById('cpConcern').value.trim();
        showError('cpStartError', '');
        if(cp.concern.length < 10){ showError('cpStartError', 'Please tell us a little more about what has been going on.'); return; }
        setBusy('cpStartBtn', true, 'Preparing your questions…');
        apiCall('POST', '/api/intake/start', { specialty: cp.specialty, concern: cp.concern }).then(function(res){
          setBusy('cpStartBtn', false);
          if(!res.ok){
            if(res.status === 401){ pendingAction='pathway'; Eldava.closeCarePathway(); Eldava.go('register'); return; }
            showError('cpStartError', res.data.error || 'Could not start your intake.'); return;
          }
          intake.id = res.data.intakeId; intake.questions = res.data.questions || []; intake.answers = {}; intake.aiGenerated = res.data.aiGenerated;
          renderIntakeIntro(res.data.intro, res.data.aiGenerated);
          renderIntakeQuestions(intake.questions);
          cpShow(1);
        });
        return;
      }

      if(step===2){
        var collected = collectIntakeAnswers();
        showError('cpAnswerError', '');
        if(collected.missing.length){ showError('cpAnswerError', 'Please answer every required question before continuing.'); highlightMissing(collected.missing); return; }
        setBusy('cpAnswerBtn', true, 'Saving your answers…');
        apiCall('POST', '/api/intake/answer', { intakeId: intake.id, answers: collected.answers }).then(function(res){
          setBusy('cpAnswerBtn', false);
          if(!res.ok){ showError('cpAnswerError', res.data.error || 'Could not save your answers.'); return; }
          intake.answers = collected.answers; intake.redFlag = res.data.redFlag;
          // Follow-ups: append in place and stay on this step.
          if(!res.data.done && (res.data.questions || []).length){
            intake.questions = intake.questions.concat(res.data.questions);
            appendIntakeQuestions(res.data.questions, res.data.intro);
            return;
          }
          // A safety disclosure skips the screener and shows crisis support.
          if(intake.redFlag){
            document.getElementById('cpCrisisBox').hidden = false;
            document.getElementById('cpStep3NextBtn').hidden = true;
            cpShow(3); return;
          }
          cp.duration = cp.duration || 'Not specified'; cp.prior = cp.prior || 'no'; cp.meds = cp.meds || 'no'; cp.family = cp.family || 'no';
          renderScreener();
          cpShow(2);
        });
        return;
      }

      if(step===3){
        var scr = CP_SCREENERS[cp.track];
        // Defense in depth: never trust the disabled attribute alone. Re-check completeness here
        // too, so a stale DOM state or direct call can't skip past an unanswered screener item.
        var totalItems = scr.groups.reduce(function(n,g){ return n+g.items.length; }, 0);
        var answeredItems = cp.screenerAnswers.filter(function(v){ return v!==undefined && v!==null; }).length;
        if(answeredItems < totalItems) return;
        cp.screenerResult = scr.interpret(cp.screenerAnswers);
        document.getElementById('cpCrisisBox').hidden = !cp.selfHarmFlagFromScreener;
      }
      if(step===4){
        if(cp.safety) return;
        // Completing the intake is what writes the clinician's briefing, so it
        // has to succeed before the patient can move on to booking.
        setBusy('cpStep3NextBtn', true, 'Preparing your summary\u2026');
        apiCall('POST', '/api/intake/complete', { intakeId: intake.id }).then(function(res){
          setBusy('cpStep3NextBtn', false);
          if(!res.ok){ showError('cpAnswerError', res.data.error || 'Could not complete your intake.'); return; }
          Eldava.cpRenderSummary(res.data.recommendation);
          cpShow(4);
        });
        return;
      }
      cpShow(step);
    },
    cpBack: function(step){ cpShow(step); },
    /// Patient-facing recap: reflective, not interpretive. It repeats what
    /// they told us and names the recommended service; what the answers might
    /// mean is for the clinician to say, at the consultation.
    cpRenderSummary: function(recommendation){
      var svc = findService(cp.specialty);
      var catLabel = CATS[svc.cat] || 'this area';
      var price = recommendation ? recommendation.priceMinor / 100 : currentPrice(svc.price);
      var name = recommendation ? recommendation.name : svc.name;
      var answered = intake.questions.filter(function(q){ var a = intake.answers[q.id]; return a !== undefined && a !== null && a !== '' && !(Array.isArray(a) && !a.length); });
      var answerList = answered.map(function(q){ var a = intake.answers[q.id]; return '<div class="cp-answer"><div class="q">'+esc(q.prompt)+'</div><div class="a">'+esc(Array.isArray(a) ? a.join(', ') : a)+'</div></div>'; }).join('');
      var scr = CP_SCREENERS[cp.track];
      var screenerBlock = (scr.tool && cp.screenerResult) ? ('<h4 style="margin-top:14px;">Your screening indication</h4>' + cp.screenerResult.html + '<p style="font-size:0.85rem; color:var(--text-soft);">This is an informal indication from a brief self-report screener, not a diagnosis. Only a licensed clinician, through a full assessment, can provide one.</p>') : '';
      document.getElementById('cpSummaryBox').innerHTML =
        '<span class="cp-tag">Your summary</span><h4>What you told us</h4>'
        + (cp.concern ? '<p class="cp-verbatim">&ldquo;'+esc(cp.concern)+'&rdquo;</p>' : '')
        + '<div class="cp-answers">'+answerList+'</div>' + screenerBlock
        + '<h4 style="margin-top:14px;">What happens next</h4>'
        + '<p>Your answers have been written up for a licensed clinician, who reads them before you meet. Based on the service you chose, that is our <b>'+esc(name)+'</b> ('+esc(catLabel)+'), '+fmt(price)+'.</p>'
        + '<ul><li>A clinician reviews this summary before your consultation, so you do not start from scratch</li>'
        + '<li>Nothing here is a diagnosis, and no assessment has been made yet</li>'
        + '<li>Full written report after your assessment, typically within 2 to 5 days</li>'
        + '<li>Pay in full by card, or choose Klarna to pay later</li></ul>';
    },
    cpContinueToBooking: function(){
      Eldava.closeCarePathway();
      Eldava.openBooking(cp.specialty);
      // Carries the completed intake into the booking (set after openBooking,
      // which resets it), so the booking skips its own intake step and the
      // clinician's briefing is linked to the appointment they see it under.
      booking.intakeId = intake.id;
      if(cp.concern){ document.getElementById('qNotes').value = cp.concern; }
      if(intake.redFlag || cp.selfHarmFlagFromScreener){ document.getElementById('qSafety').querySelector('[data-val="yes"]').click(); }
    }
  };

  document.addEventListener('click', function(e){
    var mm = document.getElementById('megaMenu'), mt = document.getElementById('megaToggle');
    if(!mm.hidden && !mm.contains(e.target) && e.target!==mt){ mm.hidden = true; }
    var om = document.getElementById('orgMenu'), ot = document.getElementById('orgToggle');
    if(!om.hidden && !om.contains(e.target) && e.target!==ot){ om.hidden = true; }
    var rm = document.getElementById('resMenu'), rt = document.getElementById('resToggle');
    if(!rm.hidden && !rm.contains(e.target) && e.target!==rt){ rm.hidden = true; }
    var am = document.getElementById('acctMenu'), at = document.getElementById('acctToggle'), av = document.getElementById('acctAvatar'), cv = document.getElementById('acctClinAvatar');
    // Both avatars are triggers for this menu; a click on either (or the
    // initials inside) must not count as an outside click.
    if(!am.hidden && !am.contains(e.target) && e.target!==at && !(av && av.contains(e.target)) && !(cv && cv.contains(e.target))){ am.hidden = true; }
    // These branches close menus directly, so the carets need re-syncing.
    syncMenuState();
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      Eldava.closeMega(); Eldava.closeSolutions(); Eldava.closeAcct(); Eldava.closeMobileNav();
      var ao = document.getElementById('articleOverlay');
      if(ao && !ao.hidden){ Eldava.closeArticle(); }
    }
  });

  /// Everything this script writes into the DOM at startup, in one idempotent
  /// function. The shell is rendered from an HTML string by React; if React
  /// ever re-applies that string (Fast Refresh in development after an edit to
  /// shared-body.ts, for instance) every <option>, counter and account state
  /// this script had added is wiped, while the script itself does not re-run.
  /// SharedShell calls Eldava.rehydrate() after each render so that cannot
  /// leave the page half-populated.
  function renderStatic(){
    renderAccordion(document.getElementById('uspAccordion'), USPS, true);
    renderAccordion(document.getElementById('faqAccordion'), FAQ, false);
    renderPriceTabs();
    // A category chosen on another page (filterPriceByCat before a page load).
    try{
      var pendingCat = sessionStorage.getItem('eldavaPriceCat');
      if(pendingCat && document.getElementById('priceTabs')){
        sessionStorage.removeItem('eldavaPriceCat');
        document.querySelectorAll('#priceTabs .tab').forEach(function(t){ t.setAttribute('aria-selected', t.getAttribute('data-cat')===pendingCat ? 'true':'false'); });
      }
    }catch(e){}
    renderBlogTabs();
    renderBlogGrid();
    renderBlogArchive();
    populateSelect(document.getElementById('mService'));
    populateSelect(document.getElementById('cpSpecialty'));
    refreshPriceDisplays();
    Eldava.setPayMode('full');
    Eldava.refreshAccountUi();
    if(clinicianAccount){ var who = document.getElementById('clinWho'); if(who) who.textContent = clinicianAccount.displayName; }
    // Re-mark the active nav item for whatever page is showing.
    var custom = document.querySelector('#page-custom[data-nav]');
    var current = PATH_PAGES[location.pathname] || (custom && custom.getAttribute('data-nav')) || 'home';
    document.querySelectorAll('nav.links .navlink').forEach(function(b){
      if(b.getAttribute('data-page') === current){ b.setAttribute('aria-current','page'); } else { b.removeAttribute('aria-current'); }
    });
    syncMenuState();
  }
  Eldava.rehydrate = function(){
    // Only meaningful once the DOM has actually been replaced; cheap to run.
    renderStatic();
    var current = PATH_PAGES[location.pathname];
    if(current === 'profile' && patientAccount){ Eldava.loadProfile(); }
    if(current === 'clinician-portal' && clinicianAccount){ loadClinicianCases(); }
  };

  try{ if(localStorage.getItem('eldavaPromoClaimed')==='1'){ PROMO.claimed = true; } }catch(e){}
  renderStatic();
  setBannerCountdown();

  try{
    if(localStorage.getItem('eldavaBannerDismissed')==='1'){ document.getElementById('promoBanner').hidden = true; }
    if(localStorage.getItem('eldavaPromoSeen')!=='1'){ setTimeout(function(){ Eldava.openPromo(true); }, 2200); }
  }catch(e){ setTimeout(function(){ Eldava.openPromo(true); }, 2200); }

  var nudgeShown = false;
  window.addEventListener('scroll', function(){
    if(nudgeShown) return;
    var scrolled = (window.scrollY) / (document.body.scrollHeight - window.innerHeight);
    if(scrolled > 0.5){
      nudgeShown = true;
      try{ if(localStorage.getItem('eldavaNudgeSeen')!=='1'){ document.getElementById('nudgeToast').hidden = false; } }catch(e){}
    }
  });

  // ------------------------------------------------------------- bootstrap

  loadFoundingCount();

  /// Restores both sessions from the httpOnly cookies, so a refresh (or the
  /// round trip through the payment provider) does not look like a logout.
  apiCall('GET', '/api/auth/me').then(function(res){
    if(!res.ok){
      // Session unknown (server down, network). Treat as signed out so a
      // gated page still lands on its sign-in rather than an empty shell.
      var gated = PATH_PAGES[location.pathname];
      if(AUTH_GATED[gated]){ Eldava.go(gated); }
      return;
    }
    patientAccount = res.data.patient;
    clinicianAccount = res.data.clinician;
    Eldava.refreshAccountUi();
    if(clinicianAccount){ var who = document.getElementById('clinWho'); if(who) who.textContent = clinicianAccount.displayName; }

    // Auth-gated pages were deliberately left unrouted at startup (see the
    // initial routing at the bottom). Route them now that we know who this
    // is: go() loads the page for a signed-in visitor, or sends anyone else
    // to the right sign-in page.
    var page = PATH_PAGES[location.pathname];
    if(AUTH_GATED[page]){ Eldava.go(page); }

    handleCheckoutReturn();
  });

  /// Pages whose content depends on the session, so routing to them must wait
  /// for /api/auth/me.
  var AUTH_GATED = { profile:true, 'clinician-portal':true };

  /// Coming back from the payment provider. The URL only says the patient
  /// returned - the server is asked what actually happened, and a
  /// still-processing payment is polled briefly for the webhook to land.
  function handleCheckoutReturn(){
    var params = new URLSearchParams(window.location.search);
    var outcome = params.get('checkout');
    if(!outcome) return;
    var reference = params.get('ref');
    if(!reference){ try{ reference = sessionStorage.getItem('eldavaPendingRef'); }catch(e){} }
    try{ sessionStorage.removeItem('eldavaPendingRef'); }catch(e){}
    if(!reference || !patientAccount) return;

    try{ history.replaceState(null, '', window.location.pathname); }catch(e){}

    document.getElementById('bookingOverlay').hidden = false;
    document.body.style.overflow = 'hidden';
    bookingShow(4);
    setText('confirmHeading', 'Checking your payment…'); setText('confirmRef', reference);

    var attempts = 0;
    (function poll(){
      apiCall('GET', '/api/payments/status?reference=' + encodeURIComponent(reference)).then(function(res){
        if(!res.ok){ setText('confirmHeading', 'Could not load this booking'); setText('confirmPayLine', res.data.error || 'Please check your email for confirmation.'); return; }
        var status = res.data;
        var settled = status.paymentStatus === 'PAID' || status.paymentStatus === 'FAILED' || status.status === 'CONFIRMED' || status.status === 'PAID';
        // Give the webhook a few seconds before reporting a pending payment.
        if(!settled && outcome === 'success' && attempts < 6){ attempts++; setTimeout(poll, 1500); return; }
        booking.reference = status.reference;
        Eldava.showBookingResult(status);
        if(status.kind === 'voucher') loadFoundingCount();
      });
    })();
  }

  var validPages = Object.keys(PAGE_PATHS);
  function routeHash(h){
    if(h.indexOf('blog-')===0){
      var artId = h.slice(5);
      if(findArticle(artId)){ window.location.replace('/insights/'+artId+'/'); return true; }
    }
    if(h && validPages.indexOf(h)!==-1){ Eldava.go(h); return true; }
    return false;
  }
  // Route on load: prefer the real path (https://eldava.com/pricing/), fall back to a legacy
  // hash link (https://eldava.com/#pricing) so old bookmarks and shared links keep working.
  var initPage = PATH_PAGES[location.pathname];
  // Pages that depend on who is signed in are NOT routed here: the session
  // check (/api/auth/me, in the bootstrap above) has not returned yet, so
  // go() would see nobody signed in and bounce to the sign-in page - and
  // because that bounce pushes a new URL, the intended page would be lost.
  // The server has already rendered the right section for these paths; the
  // bootstrap routes them once it knows who the visitor is.
  if(initPage && initPage !== 'home' && !AUTH_GATED[initPage]){
    Eldava.go(initPage);
  } else if(!initPage || initPage === 'home'){
    var initHash = (location.hash||'').replace('#','');
    if(initHash && initHash!=='home'){ routeHash(initHash); }
  }
  window.addEventListener('hashchange', function(){
    var h = (location.hash||'').replace('#','');
    routeHash(h);
  });
  // Browser back/forward: re-render the page matching the URL we've navigated to.
  window.addEventListener('popstate', function(){
    var page = PATH_PAGES[location.pathname];
    if(page){ Eldava.go(page); }
  });
})();
