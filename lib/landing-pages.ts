// Dedicated pages for the assessments people actually search for. Each one
// targets a specific search intent ("private adult ADHD assessment", "mental
// capacity assessment for LPA", ...) with its own unique copy, price, FAQ and
// structured data. Prices and durations are NOT written here: they come from
// the service catalogue (lib/server/services.ts), so a page can never show a
// different price from the one the booking charges.
//
// Copy rules (YMYL health content): factual, non-diagnostic, no outcome
// promises, and nothing the service does not actually do. Every clinical
// statement is general and widely accepted; anything specific to Eldava
// matches what the rest of the site says.

export type Faq = { q: string; a: string };
export type LandingPage = {
  slug: string;
  /// Exact service name in the catalogue - drives price, duration, booking.
  service: string;
  group: 'Neurodevelopmental' | "Women's health" | 'Dementia and capacity' | "Men's health" | 'Learning and education';
  metaTitle: string;
  metaDescription: string;
  /// The condition/topic, for MedicalWebPage.about.
  about: string;
  eyebrow: string;
  h1: string;
  lede: string;
  whoFor: string[];
  receive: string[];
  /// Body sections: heading + paragraphs (plain text, rendered escaped).
  sections: { h2: string; p: string[] }[];
  faqs: Faq[];
  related: string[];
  articles: string[];
};

const SHARED_PAY = 'You can pay in full by card, or spread the cost over three monthly payments with Klarna where it is available in your country. The price shown includes your written report.';

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'adult-adhd-assessment',
    service: 'Adult ADHD Assessment',
    group: 'Neurodevelopmental',
    metaTitle: 'Private Adult ADHD Assessment Online | Eldava Health',
    metaDescription: 'Private adult ADHD assessment by live video with a licensed psychiatrist or psychologist. Written diagnostic report, appointments often within days, pay in full or in 3.',
    about: 'Attention deficit hyperactivity disorder (ADHD)',
    eyebrow: 'Adult ADHD assessment',
    h1: 'Private adult ADHD assessment online',
    lede: 'A full diagnostic assessment for adults who think they may have ADHD, carried out live on video by a licensed clinician, with a written report you can share with your GP, employer or university.',
    whoFor: [
      'Adults who have struggled for years with focus, organisation, time or restlessness and want a clear answer',
      'People facing a long public waiting list who would rather be assessed now',
      'Anyone who was never assessed as a child, including many women whose ADHD was missed',
      'Adults who need a formal report for workplace adjustments or study support',
    ],
    receive: [
      'A structured clinical interview with a licensed clinician on live video',
      'A written, signed diagnostic report to DSM-5 or ICD-11 standards',
      'A clear explanation of the outcome and the options that follow, whichever way it goes',
      'Optional objective testing (QbTest) and medication titration if clinically appropriate',
    ],
    sections: [
      {
        h2: 'What happens in an adult ADHD assessment',
        p: [
          'Before your appointment you complete a short guided pre-consultation, including a mandatory safety check, so the clinician starts with the right picture. The assessment itself is a structured clinical interview covering your current difficulties, how they affect work, relationships and daily life, and your developmental history. ADHD is present from childhood, so the clinician will ask about your early years too; a school report or a relative who knew you as a child can help but is not essential.',
          'Clinicians typically use established tools such as the DIVA-5 interview and adult rating scales alongside their own clinical judgement. They also consider other explanations for your difficulties, such as anxiety, low mood, sleep problems or autism, which can look similar or occur alongside ADHD.',
        ],
      },
      {
        h2: 'After the assessment',
        p: [
          'You receive a written report explaining the outcome and the reasons for it. If ADHD is diagnosed, treatment options can include medication, coaching and practical adjustments; nobody is obliged to take medication. If medication is appropriate, it is started and adjusted carefully in a titration phase with review appointments.',
          'In the UK, whether your GP agrees to take over prescribing under a shared care arrangement after a private diagnosis is the GP practice\'s decision. It is worth asking your practice about their policy before you book, and we are happy to explain what our report and titration letters include.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a private adult ADHD assessment cost?', a: 'The adult ADHD assessment is a fixed price shown on this page, including the written report. You can pay in full or in three monthly instalments with Klarna where available.' },
      { q: 'Is an online ADHD assessment as valid as a face-to-face one?', a: 'Yes, for most adults. The diagnosis rests on a structured clinical interview and history, which a licensed clinician can carry out on video to the same standard. If anything suggests an in-person review is needed, the clinician will tell you.' },
      { q: 'Will I get ADHD medication?', a: 'Medication is only ever prescribed if a clinician judges it clinically appropriate after a diagnosis. It is started through a titration phase with regular reviews, never on the basis of an online form.' },
      { q: 'Do I need a GP referral?', a: 'No. You can book directly. It is still helpful to have a summary of your medical history and any medication you take to hand.' },
      { q: 'What if the assessment does not find ADHD?', a: 'Your report explains why, and what else may explain your difficulties, with suggested next steps. An honest answer either way is the point of the assessment.' },
    ],
    related: ['adhd-and-autism-assessment', 'adult-autism-assessment', 'child-adhd-assessment'],
    articles: ['adhd-adults-overview', 'adhd-women-girls', 'private-assessment-what-to-expect', 'public-waiting-lists'],
  },
  {
    slug: 'child-adhd-assessment',
    service: 'Child ADHD Assessment',
    group: 'Neurodevelopmental',
    metaTitle: 'Private Child ADHD Assessment Online | Eldava Health',
    metaDescription: 'Private ADHD assessment for children with a licensed clinician on live video. Includes school input and a written report for your GP and school. Pay in full or in 3.',
    about: 'Attention deficit hyperactivity disorder (ADHD) in children',
    eyebrow: 'Child ADHD assessment',
    h1: 'Private ADHD assessment for children',
    lede: 'A full diagnostic ADHD assessment for your child with a licensed clinician experienced in childhood neurodevelopment, with a written report you can share with your GP and your child\'s school.',
    whoFor: [
      'Parents and carers worried about their child\'s attention, impulsivity or activity levels',
      'Families facing a long wait for a public child development or CAMHS assessment',
      'Children whose school has raised concerns about focus, behaviour or learning',
      'Families who need a formal report to support school adjustments',
    ],
    receive: [
      'A clinical interview with you and, where appropriate, your child, on live video',
      'Structured information gathered from home and school',
      'A written, signed diagnostic report to DSM-5 or ICD-11 standards',
      'Guidance on support at home and at school, whatever the outcome',
    ],
    sections: [
      {
        h2: 'How a child ADHD assessment works',
        p: [
          'ADHD is diagnosed when symptoms of inattention and/or hyperactivity-impulsivity are persistent, start in childhood, are present in more than one setting and genuinely affect everyday life. Because of that, the assessment draws on more than one view of your child: your account as a parent or carer, the clinician\'s own observations, and information from school, usually through questionnaires completed by a teacher.',
          'The clinician will ask about pregnancy, early development, health, learning and family history, and will consider other things that can look like ADHD or sit alongside it, such as autism, anxiety, sleep difficulties, hearing problems or specific learning difficulties.',
          'Assessment in pre-school children is less common, as some of these behaviours are part of normal development at that age. The clinician will advise whether an assessment is appropriate for your child now.',
        ],
      },
      {
        h2: 'After the assessment',
        p: [
          'Your report sets out the outcome and the reasons for it, with practical recommendations for home and school. If ADHD is diagnosed, the clinician will explain the support and treatment options, which may include parent training, school adjustments and, where appropriate for the child\'s age and needs, medication started under careful monitoring.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a private child ADHD assessment cost?', a: 'The child ADHD assessment has a fixed price shown on this page, including the written report. You can pay in full or across three monthly instalments with Klarna where available.' },
      { q: 'Does my child need to be on the video call the whole time?', a: 'No. Much of the history is taken with the parent or carer. The clinician will explain when they would like to see and speak with your child, keeping it comfortable and age-appropriate.' },
      { q: 'Will the school accept a private ADHD report?', a: 'The report is written by a qualified clinician to recognised diagnostic standards and is designed to be shared with schools. How a school or local authority uses it is their decision, but a clear, well-evidenced report is what they look for.' },
      { q: 'Can you assess ADHD and autism at the same time?', a: 'Yes. If both are a question, a combined assessment looks at both in one pathway, which is often quicker and less repetitive for your child.' },
    ],
    related: ['child-autism-assessment', 'adult-adhd-assessment', 'educational-psychologist-assessment-ehcp'],
    articles: ['adhd-autism-overlap', 'private-assessment-what-to-expect', 'after-diagnosis-next-steps'],
  },
  {
    slug: 'adult-autism-assessment',
    service: 'Adult Autism Assessment',
    group: 'Neurodevelopmental',
    metaTitle: 'Private Adult Autism Assessment Online | Eldava Health',
    metaDescription: 'Private adult autism assessment on live video with a licensed clinician. A careful, respectful diagnostic assessment and written report. Pay in full or in 3 monthly payments.',
    about: 'Autism spectrum disorder in adults',
    eyebrow: 'Adult autism assessment',
    h1: 'Private adult autism assessment online',
    lede: 'A careful, respectful diagnostic assessment for adults who think they may be autistic, carried out on live video by a licensed clinician, with a written report explaining the outcome.',
    whoFor: [
      'Adults who have long felt different in social situations, or exhausted by "masking"',
      'People whose autistic traits were missed in childhood, particularly women',
      'Adults with an autistic child or relative who recognise similar traits in themselves',
      'Anyone who wants a formal answer for self-understanding, work or study support',
    ],
    receive: [
      'A structured diagnostic interview with a licensed clinician on live video',
      'A developmental history, with input from someone who knew you as a child where possible',
      'A written, signed report to DSM-5 or ICD-11 standards',
      'Signposting to post-diagnostic support, whatever the outcome',
    ],
    sections: [
      {
        h2: 'What an adult autism assessment involves',
        p: [
          'Autism is a lifelong difference in social communication and interaction, alongside patterns such as a strong need for routine and predictability, intense interests and sensory sensitivities. In adults these traits are often hidden by years of learned coping, which is why a good assessment takes a detailed history rather than relying on a single test.',
          'The clinician will explore your experiences across childhood and adulthood, and may use standardised questionnaires and structured interview approaches. Where possible they will also speak to a parent, sibling or someone else who knew you when you were young. If that is not possible, tell us; it does not rule out an assessment.',
          'The clinician also considers what else might explain your experiences, and whether ADHD, anxiety or other conditions are present alongside autism, which is common.',
        ],
      },
      {
        h2: 'After the assessment',
        p: [
          'You receive a written report setting out the outcome and the reasoning behind it. Many adults describe a diagnosis as a relief that reframes their past. Whatever the result, the clinician will talk you through it and point you to practical support, including workplace adjustments and peer support.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a private adult autism assessment cost?', a: 'The adult autism assessment has a fixed price shown on this page, including the written report, payable in full or over three monthly instalments with Klarna where available.' },
      { q: 'Can autism be assessed online?', a: 'Yes. Assessment of adults relies heavily on a detailed clinical interview and history, which can be done well on video. If the clinician feels an in-person element is needed, they will explain why.' },
      { q: 'What if I do not have anyone who knew me as a child?', a: 'That is common and does not prevent an assessment. The clinician will rely more on your own account and any records you have, such as school reports.' },
      { q: 'Should I have an ADHD and autism assessment together?', a: 'If you recognise traits of both, a combined assessment looks at both in one pathway, which is usually quicker and costs less than two separate assessments.' },
    ],
    related: ['adhd-and-autism-assessment', 'adult-adhd-assessment', 'child-autism-assessment'],
    articles: ['autism-adults-missed-childhood', 'adhd-autism-overlap', 'after-diagnosis-next-steps'],
  },
  {
    slug: 'child-autism-assessment',
    service: 'Child Autism Assessment',
    group: 'Neurodevelopmental',
    metaTitle: 'Private Child Autism Assessment Online | Eldava Health',
    metaDescription: 'Private autism assessment for children with a licensed clinician on live video. Developmental history, school input and a written report for school and EHCP. Pay in 3.',
    about: 'Autism spectrum disorder in children',
    eyebrow: 'Child autism assessment',
    h1: 'Private autism assessment for children',
    lede: 'A full diagnostic autism assessment for your child with a clinician experienced in childhood development, and a written report you can share with your GP, school and local authority.',
    whoFor: [
      'Parents and carers who have noticed differences in communication, play, routine or sensory needs',
      'Families on a long waiting list for a public neurodevelopmental assessment',
      'Children whose nursery or school has raised concerns',
      'Families who need a report to support an EHCP or school adjustments',
    ],
    receive: [
      'A detailed developmental history taken with you on live video',
      'Age-appropriate observation of your child and information from nursery or school',
      'A written, signed diagnostic report to DSM-5 or ICD-11 standards',
      'Practical recommendations for home, school and next steps',
    ],
    sections: [
      {
        h2: 'How a child autism assessment works',
        p: [
          'There is no single test for autism. A diagnosis is reached by building a full picture of your child\'s development: early communication, play, relationships, routines, interests and sensory experiences, and how these show up at home and at school.',
          'The clinician takes a detailed developmental history with you, observes your child in a way suited to their age, and gathers information from nursery or school. They also consider other explanations and conditions that can occur alongside autism, such as ADHD, language disorders or anxiety.',
          'Girls and children who cope well on the surface are sometimes identified later. If you have a persistent sense that something is different, that is worth taking seriously, even if others have not noticed it yet.',
        ],
      },
      {
        h2: 'After the assessment',
        p: [
          'The report sets out the outcome and the reasoning in plain language, with recommendations that schools and local authorities can act on. It can be used as evidence in an Education, Health and Care Plan (EHCP) request, although the decision on an EHCP always rests with the local authority.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a private child autism assessment cost?', a: 'The child autism assessment has a fixed price shown on this page, including the written report. You can pay in full or across three monthly instalments with Klarna where available.' },
      { q: 'Can a child be assessed for autism over video?', a: 'Much of a child autism assessment is the developmental history taken with parents, which works well on video, alongside school information and observation. If the clinician feels your child needs to be seen in person, they will tell you and explain why.' },
      { q: 'Will the report support an EHCP application?', a: 'Yes. The report is written to be shared with schools and local authorities and to support an EHCP request. The local authority makes the final decision.' },
      { q: 'What age can a child be assessed for autism?', a: 'Autism can be identified at different ages. The clinician will discuss your child\'s age and development with you and advise whether an assessment is appropriate now.' },
    ],
    related: ['child-adhd-assessment', 'educational-psychologist-assessment-ehcp', 'adult-autism-assessment'],
    articles: ['autism-signs-children', 'adhd-autism-overlap', 'after-diagnosis-next-steps'],
  },
  {
    slug: 'adhd-and-autism-assessment',
    service: 'Adult Combined Assessment',
    group: 'Neurodevelopmental',
    metaTitle: 'Combined ADHD and Autism Assessment for Adults | Eldava Health',
    metaDescription: 'Assessed for ADHD and autism together in one private pathway, online with a licensed clinician. One history, one report, lower cost than two assessments. Pay in 3.',
    about: 'ADHD and autism (co-occurring neurodevelopmental conditions)',
    eyebrow: 'Combined ADHD and autism assessment',
    h1: 'Combined ADHD and autism assessment for adults',
    lede: 'If you recognise traits of both ADHD and autism, a combined assessment looks at both in one pathway, with one developmental history and one written report, at a lower cost than two separate assessments.',
    whoFor: [
      'Adults who relate to descriptions of both ADHD and autism',
      'People already diagnosed with one who suspect the other',
      'Anyone who wants the whole picture rather than two separate processes',
    ],
    receive: [
      'One extended clinical assessment on live video covering both conditions',
      'A single developmental history, rather than telling your story twice',
      'A written, signed report addressing ADHD and autism to DSM-5 or ICD-11 standards',
      'Advice on support and treatment options that fit the whole picture',
    ],
    sections: [
      {
        h2: 'Why assess ADHD and autism together',
        p: [
          'ADHD and autism are separate diagnoses, but they occur together far more often than was once recognised. Some experiences, such as difficulty with attention, sensory overload or social exhaustion, can come from either, and telling them apart matters because the right support differs.',
          'Assessing both in one pathway lets a single clinician weigh the full picture, avoids repeating the same history across two appointments, and gives you one coherent report instead of two that may not reference each other.',
        ],
      },
      {
        h2: 'What the assessment covers',
        p: [
          'The clinician takes a detailed history of your childhood and adult life, explores attention, activity and impulsivity alongside social communication, routines, interests and sensory experiences, and considers other explanations such as anxiety or low mood. The outcome may be ADHD, autism, both, or neither, and the report explains the reasoning.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a combined ADHD and autism assessment cost?', a: 'The combined adult assessment has a fixed price shown on this page, which is lower than booking the adult ADHD and adult autism assessments separately. You can pay in full or in three monthly instalments with Klarna where available.' },
      { q: 'Is it common to have both ADHD and autism?', a: 'Yes. The two conditions frequently co-occur, and many people are diagnosed with one before the other is recognised.' },
      { q: 'Is there a combined assessment for children?', a: 'Yes. A combined child assessment is also available and follows the same principle, with input from parents and school.' },
    ],
    related: ['adult-adhd-assessment', 'adult-autism-assessment', 'child-adhd-assessment'],
    articles: ['adhd-autism-overlap', 'adhd-adults-overview', 'autism-adults-missed-childhood'],
  },
  {
    slug: 'dementia-memory-assessment',
    service: 'Dementia Memory Assessment',
    group: 'Dementia and capacity',
    metaTitle: 'Private Dementia and Memory Assessment Online | Eldava Health',
    metaDescription: 'Private memory assessment for dementia concerns: cognitive testing, medical history, medication review and family input, with a written report for your GP. Pay in 3.',
    about: 'Dementia and memory loss',
    eyebrow: 'Dementia memory assessment',
    h1: 'Private dementia and memory assessment',
    lede: 'A full memory assessment for someone whose memory or thinking has changed, with structured cognitive testing, a medical and medication review, input from family where possible, and a written report for the GP or memory clinic.',
    whoFor: [
      'People noticing changes in their own memory, word-finding or planning',
      'Families worried about a parent or partner and wanting clarity sooner',
      'Anyone waiting for a memory clinic appointment who wants an earlier specialist view',
    ],
    receive: [
      'A structured cognitive assessment with a clinician on live video',
      'A full medical history and review of current medication',
      'A collateral history from a family member or friend, where possible',
      'A written report for your GP or memory clinic, with clear next steps',
    ],
    sections: [
      {
        h2: 'What a memory assessment looks at',
        p: [
          'Memory and thinking can change for many reasons, not only dementia. Low mood, sleep problems, thyroid or vitamin deficiencies, infections and the side effects of some medicines can all affect memory, and several of these are treatable. A good assessment looks for them as well as for signs of a dementia or mild cognitive impairment.',
          'The clinician takes a detailed history, carries out structured cognitive testing covering memory, attention, language and problem-solving, and reviews current medication. Where possible they also speak with someone who knows the person well, because changes are often noticed first by others.',
        ],
      },
      {
        h2: 'What a remote assessment can and cannot do',
        p: [
          'Some parts of a dementia work-up, such as blood tests and brain scans, need to be arranged in person. The report sets out clearly which investigations are recommended, so your GP or memory clinic can arrange them, and what the findings so far suggest. If changes are mild, a monitoring pathway with a scheduled review may be the most useful next step.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a private memory assessment cost?', a: 'The dementia memory assessment has a fixed price shown on this page, including the written report for the GP or memory clinic, payable in full or across three monthly instalments with Klarna where available.' },
      { q: 'Can dementia be assessed online?', a: 'Much of a memory assessment, including the history, cognitive testing and family input, can be done well on video. Blood tests and scans are arranged in person, and the report says which are recommended.' },
      { q: 'Can a family member join the appointment?', a: 'Yes, and it is encouraged. A family member or close friend can add important detail about changes they have noticed.' },
      { q: 'What if the person does not want an assessment?', a: 'An assessment needs the person\'s agreement. If you are worried about someone who is reluctant, our carer support programme and the clinician can help you think about how to raise it.' },
    ],
    related: ['mental-capacity-assessment', 'mens-health-check', 'menopause-consultation'],
    articles: [],
  },
  {
    slug: 'mental-capacity-assessment',
    service: 'Mental Capacity Assessment',
    group: 'Dementia and capacity',
    metaTitle: 'Mental Capacity Assessment for LPA, COP3 & Wills | Eldava Health',
    metaDescription: 'Clinician-conducted mental capacity assessment for Lasting Power of Attorney, deputyship (COP3), wills and financial decisions, with a signed report for your solicitor.',
    about: 'Mental capacity (Mental Capacity Act 2005)',
    eyebrow: 'Mental capacity assessment',
    h1: 'Mental capacity assessment for LPA, COP3 and wills',
    lede: 'A clinician-conducted capacity assessment for a specific decision, such as making a Lasting Power of Attorney, a deputyship application to the Court of Protection, a will, or a property or financial decision, with a signed report issued to your legal adviser.',
    whoFor: [
      'Solicitors needing capacity evidence for an LPA, will or transaction',
      'Families applying for deputyship who need a COP3 assessment',
      'Anyone whose capacity for an important decision may later be questioned',
    ],
    receive: [
      'An assessment by a clinician experienced in capacity work, on live video',
      'A decision-specific assessment applying the Mental Capacity Act framework',
      'A signed written report, or completed COP3, issued to your legal adviser',
    ],
    sections: [
      {
        h2: 'How capacity is assessed',
        p: [
          'In England and Wales, capacity is assessed under the Mental Capacity Act 2005. It is decision-specific and time-specific: the question is whether the person can make this particular decision at the time it needs to be made, not whether they have capacity in general. A diagnosis such as dementia does not, on its own, mean someone lacks capacity.',
          'The clinician considers whether the person can understand the information relevant to the decision, retain it long enough to decide, use or weigh it, and communicate their decision. People must be given all practicable help to make the decision themselves before they are treated as lacking capacity.',
        ],
      },
      {
        h2: 'Working with your solicitor',
        p: [
          'Tell us the exact decision the assessment is for and who instructs us. With consent, the clinician can receive relevant information from the solicitor in advance, and the signed report is issued directly to your legal adviser. For contested matters or court proceedings, a full medico-legal expert report may be more appropriate.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a mental capacity assessment cost?', a: 'The mental capacity assessment has a fixed price shown on this page, including the signed report, payable in full or in three monthly instalments with Klarna where available.' },
      { q: 'Can you complete a COP3 form for a deputyship application?', a: 'Yes. The assessment can be carried out for a deputyship application, with the COP3 completed by the assessing clinician.' },
      { q: 'Can a capacity assessment be done by video?', a: 'In many cases, yes. If the person\'s hearing, vision or communication needs mean video is not suitable, the clinician will tell you before the assessment goes ahead.' },
      { q: 'Does a dementia diagnosis mean someone cannot make a will or LPA?', a: 'No. Capacity is decision-specific. Many people with a dementia diagnosis still have capacity to make particular decisions, especially earlier on.' },
    ],
    related: ['dementia-memory-assessment', 'medico-legal-expert-report'],
    articles: [],
  },
  {
    slug: 'menopause-consultation',
    service: 'Menopause Advice',
    group: "Women's health",
    metaTitle: 'Online Menopause Consultation and HRT Advice | Eldava Health',
    metaDescription: 'Private online menopause consultation with a clinician: symptoms, HRT options, risks and benefits, and a plan. Appointments often within days, including evenings.',
    about: 'Menopause and perimenopause',
    eyebrow: 'Menopause consultation',
    h1: 'Online menopause consultation and HRT advice',
    lede: 'A private video consultation for perimenopause and menopause symptoms, with time to talk through HRT and non-hormonal options, the risks and benefits for you, and a clear plan.',
    whoFor: [
      'Women with hot flushes, night sweats, sleep problems, low mood, brain fog or changes to periods',
      'Anyone wondering whether their symptoms could be perimenopause',
      'Women already on HRT who want a review of dose, type or side effects',
    ],
    receive: [
      'An unhurried consultation with a clinician on live video',
      'Discussion of HRT and non-hormonal options, including risks and benefits for you',
      'A written summary and plan you can share with your GP',
      'Optional menopause hormone panel by home sample, where it is useful',
    ],
    sections: [
      {
        h2: 'What the consultation covers',
        p: [
          'Perimenopause can begin years before periods stop, and symptoms vary widely: hot flushes and night sweats, sleep disturbance, joint aches, low mood or anxiety, poor concentration, vaginal dryness and changes in periods. The clinician will go through your symptoms, medical and family history, and what matters most to you.',
          'In the UK, NICE guidance says that perimenopause and menopause can usually be diagnosed from symptoms alone in women over 45, without a blood test. Blood tests are more useful in younger women or where the picture is unclear, and the clinician will say if one would help.',
        ],
      },
      {
        h2: 'HRT and other options',
        p: [
          'For many women, HRT is the most effective treatment for menopausal symptoms, and for most the benefits outweigh the risks. The right choice depends on your history, so the clinician will discuss the types of HRT, alternatives and lifestyle measures. Where a prescription is appropriate and permitted in your country, the clinician can arrange it; otherwise your written summary sets out the recommendation for your GP.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a private menopause consultation cost?', a: 'The menopause consultation has a fixed price shown on this page. A menopause hormone panel by home sample is available as an optional extra.' },
      { q: 'Do I need a blood test to confirm menopause?', a: 'Often not. In the UK, women over 45 with typical symptoms can usually be diagnosed without a blood test. The clinician will advise if a test would help in your case.' },
      { q: 'Can I get HRT from an online consultation?', a: 'If HRT is clinically appropriate and prescribing is permitted in your country, the clinician can arrange a prescription. Otherwise you receive a written recommendation for your GP.' },
    ],
    related: ['endometriosis-specialist', 'mens-health-check', 'dementia-memory-assessment'],
    articles: [],
  },
  {
    slug: 'endometriosis-specialist',
    service: 'Endometriosis Specialist Advice',
    group: "Women's health",
    metaTitle: 'Endometriosis Specialist Consultation Online | Eldava Health',
    metaDescription: 'See a clinician experienced in endometriosis and pelvic pain online: your history, which tests to ask for, and a written summary to speed up your referral. Pay in 3.',
    about: 'Endometriosis',
    eyebrow: 'Endometriosis specialist advice',
    h1: 'Endometriosis specialist consultation online',
    lede: 'A consultation with a clinician experienced in endometriosis and pelvic pain, to take your symptoms seriously, work out which tests to ask for, and give you a written summary that helps you get referred.',
    whoFor: [
      'Anyone with painful periods, pelvic pain, pain during sex or bowel and bladder symptoms around their cycle',
      'People who feel their symptoms have been dismissed or who have waited years for answers',
      'Anyone preparing for a GP or gynaecology appointment who wants a clear, written history',
    ],
    receive: [
      'A detailed consultation with an experienced clinician on live video',
      'Advice on which investigations to request and why',
      'A written summary and referral letter for your GP or gynaecologist',
      'Optional endometriosis pathway with a hormone panel by home sample',
    ],
    sections: [
      {
        h2: 'Why endometriosis takes so long to diagnose',
        p: [
          'Endometriosis is common, but getting a diagnosis often takes years. Symptoms overlap with other conditions, period pain is too often treated as normal, and standard scans can look normal even when endometriosis is present. A clear, well-documented history is one of the most useful things you can take to a referral.',
          'Laparoscopy remains the definitive way to confirm endometriosis, although ultrasound or MRI performed by specialists can identify some forms. The clinician will explain what each investigation can and cannot show.',
        ],
      },
      {
        h2: 'What you leave with',
        p: [
          'You leave with an understanding of what might be causing your symptoms, what to ask for next, and a written summary and referral letter setting out your history in the terms a gynaecologist will look for. The clinician can also discuss options for managing pain and symptoms in the meantime.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does an endometriosis consultation cost?', a: 'The endometriosis specialist consultation has a fixed price shown on this page, payable in full or in three monthly instalments with Klarna where available.' },
      { q: 'Can endometriosis be diagnosed online?', a: 'A definite diagnosis usually needs investigations such as specialist imaging or laparoscopy. An online consultation can assess your symptoms, advise which tests to request and help you get the right referral sooner.' },
      { q: 'Will I get a referral letter?', a: 'Yes. You receive a written summary and referral letter for your GP or gynaecologist.' },
    ],
    related: ['menopause-consultation', 'dementia-memory-assessment'],
    articles: [],
  },
  {
    slug: 'dyslexia-assessment-adults',
    service: 'Dyslexia and SpLD Assessment (DSA)',
    group: 'Learning and education',
    metaTitle: 'Adult Dyslexia Assessment for DSA and Work | Eldava Health',
    metaDescription: 'Adult diagnostic assessment for dyslexia and specific learning difficulties, with a report for Disabled Students\' Allowance (DSA) applications or workplace needs. Pay in 3.',
    about: 'Dyslexia and specific learning difficulties (SpLD)',
    eyebrow: 'Adult dyslexia and SpLD assessment',
    h1: 'Adult dyslexia assessment for DSA and work',
    lede: 'A diagnostic assessment for adults who think they may have dyslexia or another specific learning difficulty, with a report written for Disabled Students\' Allowance applications or workplace needs assessments.',
    whoFor: [
      'University students, or those about to start, applying for Disabled Students\' Allowance',
      'Adults who have always found reading, spelling or written work harder than expected',
      'Employees who need evidence to support reasonable adjustments at work',
    ],
    receive: [
      'A structured diagnostic assessment of reading, writing, spelling, processing and memory',
      'A background history covering education and earlier support',
      'A written diagnostic report suitable for DSA or workplace needs assessments',
      'Practical recommendations for study or work',
    ],
    sections: [
      {
        h2: 'What the assessment involves',
        p: [
          'A dyslexia or SpLD assessment looks at the pattern of your skills, not just whether reading is difficult. It uses standardised tests of literacy, phonological processing, working memory and processing speed alongside your educational history, so the report can explain where the difficulty lies and what support will help.',
          'Because some tests are timed and interactive, please make sure you have a quiet room, a reliable connection and a laptop or larger screen for the appointment. We will send full instructions after booking.',
        ],
      },
      {
        h2: 'Using the report for DSA or at work',
        p: [
          'Disabled Students\' Allowance applications require diagnostic evidence of a specific learning difficulty, and the report is written for that purpose. Your funding body and the needs assessor decide what support is agreed. For employees, the report supports conversations about reasonable adjustments with your employer or an Access to Work assessment.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does an adult dyslexia assessment cost?', a: 'The adult dyslexia and SpLD assessment has a fixed price shown on this page, including the diagnostic report, payable in full or in three monthly instalments with Klarna where available.' },
      { q: 'Is the report accepted for DSA?', a: 'The report is written as diagnostic evidence for Disabled Students\' Allowance applications. Your funding body decides on eligibility and the support agreed.' },
      { q: 'Can a dyslexia assessment be done online?', a: 'Yes, using assessment materials designed for remote delivery, as long as you have a quiet space, a reliable connection and a laptop or larger screen.' },
    ],
    related: ['educational-psychologist-assessment-ehcp', 'adult-adhd-assessment'],
    articles: ['neurodiversity-workplace-guide'],
  },
  {
    slug: 'educational-psychologist-assessment-ehcp',
    service: 'Educational Psychologist Assessment (EHCP)',
    group: 'Learning and education',
    metaTitle: 'Private Educational Psychologist Assessment for EHCP | Eldava Health',
    metaDescription: 'Private educational psychologist assessment for children covering dyslexia and specific learning difficulties, with an EHCP-ready report for school and the local authority.',
    about: 'Specific learning difficulties and special educational needs in children',
    eyebrow: 'Educational psychologist assessment',
    h1: 'Private educational psychologist assessment for EHCP',
    lede: 'A diagnostic assessment of your child\'s learning, covering dyslexia and other specific learning difficulties, written up as an EHCP-ready report for their school and local authority.',
    whoFor: [
      'Parents whose child is struggling with reading, writing, maths or keeping up in class',
      'Families preparing an Education, Health and Care Plan (EHCP) request',
      'Schools and SENCOs who need specialist evidence for a pupil',
    ],
    receive: [
      'A structured assessment of your child\'s cognitive and learning profile',
      'Background information from you and your child\'s school',
      'An EHCP-ready written report with clear, specific recommendations',
    ],
    sections: [
      {
        h2: 'What the assessment covers',
        p: [
          'An educational psychology assessment looks at how your child learns: their reasoning, memory, processing speed and literacy and numeracy skills, and how these compare with what would be expected for their age. It combines standardised testing with information from home and school to explain why your child is finding learning difficult and what will help.',
        ],
      },
      {
        h2: 'Using the report for an EHCP',
        p: [
          'An EHCP is a legal document describing a child\'s special educational needs and the support to meet them. Parents can request an EHC needs assessment from their local authority. A clear specialist report, with specific and measurable recommendations, is strong evidence for that request, although the local authority makes the decision.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: 'How much does a private educational psychologist assessment cost?', a: 'The educational psychologist assessment has a fixed price shown on this page, including the EHCP-ready report, payable in full or in three monthly instalments with Klarna where available.' },
      { q: 'Will the local authority accept a private report?', a: 'Local authorities must consider relevant evidence you provide with an EHC needs assessment request. The decision is theirs, but a detailed specialist report with specific recommendations is what they look for.' },
      { q: 'Does this assessment diagnose autism or ADHD?', a: 'No. It focuses on learning and specific learning difficulties. If autism or ADHD is a question, a separate child autism or ADHD assessment is the right route.' },
    ],
    related: ['child-autism-assessment', 'child-adhd-assessment', 'dyslexia-assessment-adults'],
    articles: ['autism-signs-children'],
  },
  {
    slug: 'mens-health-check',
    service: "Men's Health MOT",
    group: "Men's health",
    metaTitle: "Men's Health MOT Online | Private Health Check | Eldava Health",
    metaDescription: "A private men's health MOT on video: heart risk, hormones, weight, sleep and lifestyle reviewed by a clinician, with a written summary and a 12-month plan.",
    about: "Men's health",
    eyebrow: "Men's health MOT",
    h1: "Men's health MOT online",
    lede: "A private review of the things men tend to put off: heart and circulation risk, hormones, weight, sleep and lifestyle, with a written summary and a practical plan for the next 12 months.",
    whoFor: [
      'Men over 35 who have not had a proper health review in years',
      'Anyone with a family history of heart disease, diabetes or prostate problems',
      'Men noticing tiredness, low energy, poor sleep or changes in libido',
    ],
    receive: [
      'A structured consultation with a clinician on live video',
      'A review of cardiovascular risk factors, weight, sleep and lifestyle',
      'Advice on which tests are worth doing, including an optional male hormone panel',
      'A written summary and a personal plan for the next 12 months',
    ],
    sections: [
      {
        h2: 'What the MOT covers',
        p: [
          'The consultation looks at your risk of heart disease and stroke, blood pressure and weight, sleep, alcohol, smoking and activity, mood and stress, and urinary and sexual health. The clinician will ask about your family history and any symptoms you have been putting off mentioning.',
          'Where tests would help, such as blood pressure readings, cholesterol, blood sugar or a testosterone and hormone panel by home sample kit, the clinician will explain which are worth doing and why, rather than testing everything by default.',
        ],
      },
      {
        h2: 'What happens next',
        p: [
          'You receive a written summary and a plan for the next year: what to change, what to monitor, and anything to take to your GP. If something needs to be seen in person, the clinician will tell you clearly.',
        ],
      },
      { h2: 'Price and payment', p: [SHARED_PAY] },
    ],
    faqs: [
      { q: "How much does a men's health MOT cost?", a: "The men's health MOT has a fixed price shown on this page. A male hormone panel by home sample kit is available as an optional extra." },
      { q: 'Does the MOT include a testosterone test?', a: 'Testosterone and related markers can be checked with an optional male hormone panel by home sample kit, reviewed with a clinician.' },
      { q: 'Can I talk about erectile dysfunction or prostate symptoms?', a: 'Yes. These are part of the review, and dedicated erectile dysfunction and prostate health consultations are also available.' },
    ],
    related: ['dementia-memory-assessment', 'adult-adhd-assessment', 'menopause-consultation'],
    articles: [],
  },
];

export function landingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

export const ASSESSMENTS_BASE = '/assessments/';
export const landingPath = (slug: string) => `${ASSESSMENTS_BASE}${slug}/`;

/// Service name -> page path, for linking the price list and menus.
export function servicePageMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of LANDING_PAGES) map[p.service] = landingPath(p.slug);
  return map;
}
