import { useEffect, useMemo, useState } from 'react'
import VideoPlayer from './components/VideoPlayer'
import { defaultBrand, defaultVideos, type Language, type SiteBrand, type VideoItem } from './data'
import { loadPublishedVideos, loadSiteConfig } from './lib/cms'

export type PillarKey = 'nutrition' | 'sleep' | 'movement' | 'light' | 'stress' | 'recovery'

export type Copy = {
  nav: { system: string; notes: string; story: string; follow: string; menu: string }
  preloader: {
    ariaLabel: string
    brandLine: string
    systemLine: string
    kicker: string
    title: string
    progress: string
    complete: string
  }
  ui: {
    skipToContent: string
    primaryNavigation: string
    selectLanguage: string
    englishShort: string
    georgianShort: string
    backToTop: string
    reelLabel: string
    videoLabel: string
    footerSocial: string
    studioLabel: string
  }
  seo: {
    title: string
    description: string
    socialDescription: string
  }
  player: {
    nowWatching: string
    close: string
    unsupported: string
    viewInstagram: string
  }
  hero: {
    eyebrow: string
    titleStart: string
    titleEmphasis: string
    titleEnd: string
    body: string
    explore: string
    watch: string
    marker: string
    figureTop: string
    figureAction: string
  }
  ticker: string[]
  system: {
    number: string
    eyebrow: string
    title: string
    body: string
    select: string
    focus: string
    practice: string
    previous: string
    next: string
  }
  pillars: Record<PillarKey, { name: string; lead: string; body: string; practice: string }>
  notes: {
    number: string
    eyebrow: string
    title: string
    body: string
    watch: string
    soon: string
    items: Array<{
      number: string
      title: string
      description: string
      meta: string
      tone: string
      image: string
      href: string
    }>
  }
  story: {
    number: string
    eyebrow: string
    title: string
    quote: string
    body: string
    credentials: string
    credentialsList: string[]
    portraitAlt: string
    portraitLabel: string
  }
  close: {
    eyebrow: string
    title: string
    body: string
    follow: string
    top: string
  }
  disclaimer: string
  footer: string
}

export const defaultCopy: Record<Language, Copy> = {
  en: {
    nav: {
      system: 'The system',
      notes: 'Field notes',
      story: 'About Mikle',
      follow: 'Follow on Instagram',
      menu: 'Menu',
    },
    preloader: {
      ariaLabel: 'Preparing Mikle Health',
      brandLine: 'MIKLE / WHOLE HEALTH',
      systemLine: '06 PILLARS · 01 SYSTEM',
      kicker: 'Nourish · Move · Recover',
      title: 'Nourishing the\nwhole system.',
      progress: 'Health is connected.',
      complete: '100',
    },
    ui: {
      skipToContent: 'Skip to content',
      primaryNavigation: 'Primary navigation',
      selectLanguage: 'Select language',
      englishShort: 'EN',
      georgianShort: 'ქარ',
      backToTop: 'Back to top',
      reelLabel: 'Reel',
      videoLabel: 'Video',
      footerSocial: 'Instagram',
      studioLabel: 'Studio',
    },
    seo: {
      title: 'Mikle — Health as a system',
      description: 'Mikle Gvianidze explores nutrition, sleep, movement, light, stress, and recovery as one connected system.',
      socialDescription: 'Practical, bilingual health education for stronger everyday living.',
    },
    player: {
      nowWatching: 'Now watching',
      close: 'Close player',
      unsupported: 'Your browser cannot play this video.',
      viewInstagram: 'View on Instagram ↗',
    },
    hero: {
      eyebrow: 'A field guide to everyday health',
      titleStart: 'Health works',
      titleEmphasis: 'as a system.',
      titleEnd: '',
      body: 'Practical ideas for stronger nutrition, sleep, movement, and recovery—in English and Georgian.',
      explore: 'Explore the system',
      watch: 'Watch the latest note',
      marker: 'Scroll to explore',
      figureTop: 'Field note / 002',
      figureAction: 'Play video',
    },
    ticker: ['Nutrition', 'Sleep', 'Movement', 'Light', 'Stress', 'Recovery'],
    system: {
      number: '01',
      eyebrow: 'The whole system',
      title: 'Six pillars. One human.',
      body: 'No single habit carries your health alone. Each pillar shapes the others—and small, consistent changes can move the entire system.',
      select: 'Choose a pillar',
      focus: 'Current focus',
      practice: 'A place to begin',
      previous: 'Previous pillar',
      next: 'Next pillar',
    },
    pillars: {
      nutrition: {
        name: 'Nutrition',
        lead: 'Give the body useful information.',
        body: 'The right nutrients help us function, perform, and recover. The goal is not perfect eating—it is a pattern your body can rely on.',
        practice: 'Build one meal around protein, color, fiber, and water.',
      },
      sleep: {
        name: 'Sleep',
        lead: 'Protect the work that happens at night.',
        body: 'Nutrition and training cannot fully compensate for five hours of sleep. Consistent rest supports energy, learning, appetite, and repair.',
        practice: 'Choose a realistic bedtime and keep it within the same 30-minute window.',
      },
      movement: {
        name: 'Movement',
        lead: 'Think beyond the workout.',
        body: 'Training matters, but so do walking, mobility, posture changes, and the small movements that break up a long day of sitting.',
        practice: 'Take a ten-minute walk after your next meal.',
      },
      light: {
        name: 'Light',
        lead: 'Set the rhythm before the day sets it for you.',
        body: 'Light is one of the strongest signals for your internal clock. When you see it—and when you avoid it—can shape sleep and alertness.',
        practice: 'Step outside for morning light within an hour of waking.',
      },
      stress: {
        name: 'Stress',
        lead: 'Notice the load, not just the feeling.',
        body: 'Work, school, relationships, and training all ask something from the same body. Health includes learning when your total load is too high.',
        practice: 'Take three slow breaths before moving into your next task.',
      },
      recovery: {
        name: 'Recovery',
        lead: 'Adaptation needs room to happen.',
        body: 'More effort is not always more progress. Rest days, adequate food, sleep, and moments of calm allow the body to rebuild.',
        practice: 'Schedule recovery with the same intention as training.',
      },
    },
    notes: {
      number: '02',
      eyebrow: 'Field notes',
      title: 'Learning, translated into life.',
      body: 'Short, practical videos for people who want to understand their health—not obsess over it.',
      watch: 'Watch note',
      soon: 'Coming next',
      items: [
        {
          number: '004',
          title: 'What does it mean to actually live healthy?',
          description: 'Why food and exercise are only two parts of a much larger system.',
          meta: '02:17 · EN',
          tone: 'sun',
          image: '/images/reel-health-en.jpg',
          href: 'https://www.instagram.com/reel/DcDOnd1pRrY/',
        },
        {
          number: '004',
          title: 'What is health? — ქართულად',
          description: 'The same whole-system idea, shared directly with his Georgian community.',
          meta: '02:17 · KA',
          tone: 'clay',
          image: '/images/reel-health-ka.jpg',
          href: 'https://www.instagram.com/reel/DcDORepJscQ/',
        },
        {
          number: '001',
          title: 'Why I started this page',
          description: 'An introduction to Mikle, his studies, and the questions guiding his work.',
          meta: '02:48 · EN',
          tone: 'moss',
          image: '/images/reel-intro-en.jpg',
          href: 'https://www.instagram.com/reel/Db_p4EsJIi8/',
        },
      ],
    },
    story: {
      number: '03',
      eyebrow: 'The person behind the notes',
      title: 'Curiosity, with a purpose.',
      quote: '“I decided to take everything I’m learning and make it useful for my community and the people around me.”',
      body: 'Mikle Gvianidze is exploring the meeting point between movement, nutrition, recovery, and whole-person care. His work turns what he is learning in the classroom and clinic into approachable ideas for everyday life.',
      credentials: 'Current path',
      credentialsList: [
        'Doctor of Physical Therapy student',
        'ISSA Certified Personal Trainer & Nutritionist',
        'Holistic health experience at Healing Your Way',
        'Creating in English & Georgian',
      ],
      portraitAlt: 'Portrait placeholder for Mikle Gvianidze',
      portraitLabel: 'Portrait / 01',
    },
    close: {
      eyebrow: 'Learn in public. Grow together.',
      title: 'A healthier life starts with seeing the whole picture.',
      body: 'Follow the next field note and build the system one pillar at a time.',
      follow: 'Follow @mikle.hyw',
      top: 'Back to top',
    },
    disclaimer: 'Educational content only. This website does not provide medical advice, diagnosis, or treatment.',
    footer: 'Made for the long game.',
  },
  ka: {
    nav: {
      system: 'სისტემა',
      notes: 'ჩანაწერები',
      story: 'მაიკლის შესახებ',
      follow: 'გამომყევი Instagram-ზე',
      menu: 'მენიუ',
    },
    preloader: {
      ariaLabel: 'მაიკლის ჯანმრთელობის გვერდი იტვირთება',
      brandLine: 'მაიკლი / სრული ჯანმრთელობა',
      systemLine: '06 საყრდენი · 01 სისტემა',
      kicker: 'იკვებე · იმოძრავე · აღდგი',
      title: 'ვკვებავთ\nმთელ სისტემას.',
      progress: 'ჯანმრთელობა კავშირშია.',
      complete: '100',
    },
    ui: {
      skipToContent: 'გადადით მთავარ შინაარსზე',
      primaryNavigation: 'მთავარი ნავიგაცია',
      selectLanguage: 'აირჩიეთ ენა',
      englishShort: 'EN',
      georgianShort: 'ქარ',
      backToTop: 'დასაწყისში დაბრუნება',
      reelLabel: 'Reel',
      videoLabel: 'ვიდეო',
      footerSocial: 'Instagram',
      studioLabel: 'სტუდია',
    },
    seo: {
      title: 'მაიკლი — ჯანმრთელობა როგორც სისტემა',
      description: 'მაიკლ გვიანიძე კვებას, ძილს, მოძრაობას, სინათლეს, სტრესსა და აღდგენას ერთ მთლიან სისტემად განიხილავს.',
      socialDescription: 'პრაქტიკული, ორენოვანი ჯანმრთელობის განათლება ყოველდღიური ცხოვრების გასაუმჯობესებლად.',
    },
    player: {
      nowWatching: 'ახლა უყურებ',
      close: 'დახურვა',
      unsupported: 'თქვენი ბრაუზერი ვიდეოს ვერ აჩვენებს.',
      viewInstagram: 'Instagram-ზე ნახვა ↗',
    },
    hero: {
      eyebrow: 'ყოველდღიური ჯანმრთელობის გზამკვლევი',
      titleStart: 'ჯანმრთელობა',
      titleEmphasis: 'ერთი სისტემაა.',
      titleEnd: '',
      body: 'პრაქტიკული იდეები კვებაზე, ძილზე, მოძრაობასა და აღდგენაზე — ქართულად და ინგლისურად.',
      explore: 'გაიცანი სისტემა',
      watch: 'ნახე ბოლო ჩანაწერი',
      marker: 'ჩამოსქროლე',
      figureTop: 'ჩანაწერი / 002',
      figureAction: 'ვიდეოს ნახვა',
    },
    ticker: ['კვება', 'ძილი', 'მოძრაობა', 'სინათლე', 'სტრესი', 'აღდგენა'],
    system: {
      number: '01',
      eyebrow: 'მთლიანი სისტემა',
      title: 'ექვსი საყრდენი. ერთი ადამიანი.',
      body: 'ჯანმრთელობას მხოლოდ ერთი ჩვევა ვერ განსაზღვრავს. თითოეული საყრდენი დანარჩენებზე მოქმედებს — მცირე და თანმიმდევრულ ცვლილებებს კი მთელი სისტემის გაუმჯობესება შეუძლია.',
      select: 'აირჩიე საყრდენი',
      focus: 'მთავარი თემა',
      practice: 'დასაწყისისთვის',
      previous: 'წინა საყრდენი',
      next: 'შემდეგი საყრდენი',
    },
    pillars: {
      nutrition: {
        name: 'კვება',
        lead: 'მიაწოდე სხეულს სასარგებლო ინფორმაცია.',
        body: 'სწორი საკვები ნივთიერებები ფუნქციონირებაში, ენერგიასა და აღდგენაში გვეხმარება. მიზანი იდეალური კვება კი არა, სანდო და მდგრადი ჩვევებია.',
        practice: 'ერთი კვება ააწყვე ცილის, ბოჭკოს, ფერადი ბოსტნეულისა და წყლის გარშემო.',
      },
      sleep: {
        name: 'ძილი',
        lead: 'დაიცავი ღამით მიმდინარე აღდგენა.',
        body: 'სრულფასოვან ძილს ვერც კვება და ვერც ვარჯიში ჩაანაცვლებს. თანმიმდევრული დასვენება ენერგიას, სწავლას, მადასა და აღდგენას უწყობს ხელს.',
        practice: 'აირჩიე რეალური დაძინების დრო და ყოველდღე 30-წუთიან შუალედში დაიცავი.',
      },
      movement: {
        name: 'მოძრაობა',
        lead: 'იფიქრე ვარჯიშის მიღმაც.',
        body: 'დარბაზი მნიშვნელოვანია, მაგრამ ასევე მნიშვნელოვანია სიარული, მობილობა, პოზის შეცვლა და დიდხანს ჯდომის ხშირი შეწყვეტა.',
        practice: 'შემდეგი ჭამის შემდეგ ათი წუთით გაისეირნე.',
      },
      light: {
        name: 'სინათლე',
        lead: 'დღის რიტმი დილიდანვე განსაზღვრე.',
        body: 'სინათლე ჩვენი შინაგანი საათის ერთ-ერთი მთავარი სიგნალია. როდის ვხედავთ და როდის ვარიდებთ თავს, ეს ძილსა და სიფხიზლეზე მოქმედებს.',
        practice: 'გაღვიძებიდან ერთ საათში გადი გარეთ და მიიღე დილის სინათლე.',
      },
      stress: {
        name: 'სტრესი',
        lead: 'დაინახე სრული დატვირთვა.',
        body: 'სამსახური, სწავლა, ურთიერთობები და ვარჯიში ერთი და იმავე სხეულისგან ითხოვს ენერგიას. ჯანმრთელობა ნიშნავს იმის ცოდნასაც, როდის არის ჯამური დატვირთვა ზედმეტი.',
        practice: 'შემდეგ საქმეზე გადასვლამდე სამჯერ ნელა ჩაისუნთქე და ამოისუნთქე.',
      },
      recovery: {
        name: 'აღდგენა',
        lead: 'პროგრესს სივრცე სჭირდება.',
        body: 'მეტი ძალისხმევა ყოველთვის მეტ შედეგს არ ნიშნავს. დასვენება, საკმარისი კვება, ძილი და სიმშვიდე სხეულს აღდგენის საშუალებას აძლევს.',
        practice: 'აღდგენა ისეთივე ყურადღებით დაგეგმე, როგორც ვარჯიში.',
      },
    },
    notes: {
      number: '02',
      eyebrow: 'ჩანაწერები',
      title: 'ცოდნა, რომელიც ცხოვრებაში გამოგადგება.',
      body: 'მოკლე და პრაქტიკული ვიდეოები მათთვის, ვისაც საკუთარი ჯანმრთელობის გაგება სურს — ზედმეტი სირთულის გარეშე.',
      watch: 'ნახე ჩანაწერი',
      soon: 'მალე',
      items: [
        {
          number: '004',
          title: 'რას ნიშნავს სინამდვილეში ჯანსაღად ცხოვრება?',
          description: 'რატომ არის კვება და ვარჯიში უფრო დიდი სისტემის მხოლოდ ორი ნაწილი.',
          meta: '02:17 · EN',
          tone: 'sun',
          image: '/images/reel-health-en.jpg',
          href: 'https://www.instagram.com/reel/DcDOnd1pRrY/',
        },
        {
          number: '004',
          title: 'რას ნიშნავს ჯანმრთელობა? — ქართულად',
          description: 'იგივე იდეა ჯანმრთელობის მთლიან სისტემაზე — ქართული აუდიტორიისთვის.',
          meta: '02:17 · KA',
          tone: 'clay',
          image: '/images/reel-health-ka.jpg',
          href: 'https://www.instagram.com/reel/DcDORepJscQ/',
        },
        {
          number: '001',
          title: 'რატომ დავიწყე ეს გვერდი',
          description: 'მაიკლის, მისი სწავლისა და მისი საქმიანობის მთავარი კითხვების გაცნობა.',
          meta: '02:48 · EN',
          tone: 'moss',
          image: '/images/reel-intro-en.jpg',
          href: 'https://www.instagram.com/reel/Db_p4EsJIi8/',
        },
      ],
    },
    story: {
      number: '03',
      eyebrow: 'ადამიანი ჩანაწერების მიღმა',
      title: 'ცნობისმოყვარეობა, რომელსაც მიზანი აქვს.',
      quote: '„გადავწყვიტე, ყველაფერი, რასაც ვსწავლობ, ჩემი საზოგადოებისა და ჩემ გარშემო მყოფი ადამიანებისთვის სასარგებლოდ ვაქციო.“',
      body: 'მაიკლ გვიანიძე სწავლობს მოძრაობის, კვების, აღდგენისა და ადამიანზე მთლიანად ორიენტირებული ზრუნვის ურთიერთკავშირს. ის აუდიტორიასა და კლინიკაში მიღებულ ცოდნას ყოველდღიური ცხოვრებისთვის გასაგებ იდეებად აქცევს.',
      credentials: 'მიმდინარე გზა',
      credentialsList: [
        'ფიზიკური თერაპიის დოქტორანტი',
        'ISSA-ს სერტიფიცირებული პერსონალური ტრენერი და ნუტრიციოლოგი',
        'ჰოლისტური ჯანმრთელობის გამოცდილება Healing Your Way-ში',
        'ქმნის ქართულ და ინგლისურ ენებზე',
      ],
      portraitAlt: 'მაიკლ გვიანიძის ფოტოს ადგილი',
      portraitLabel: 'პორტრეტი / 01',
    },
    close: {
      eyebrow: 'ვისწავლოთ საჯაროდ. გავიზარდოთ ერთად.',
      title: 'ჯანსაღი ცხოვრება სრული სურათის დანახვით იწყება.',
      body: 'გამოჰყევი შემდეგ ჩანაწერს და ააშენე სისტემა — თითო საყრდენი ერთ ჯერზე.',
      follow: 'გამომყევი @mikle.hyw-ზე',
      top: 'დასაწყისში დაბრუნება',
    },
    disclaimer: 'მასალა მხოლოდ საგანმანათლებლო მიზნებისთვისაა და არ წარმოადგენს სამედიცინო რჩევას, დიაგნოზს ან მკურნალობას.',
    footer: 'შექმნილია გრძელვადიანი გზისთვის.',
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function mergeDefined<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) ? stored : defaults) as T
  }

  if (isRecord(defaults)) {
    if (!isRecord(stored)) return defaults
    const merged: Record<string, unknown> = { ...defaults }
    Object.entries(defaults).forEach(([key, defaultValue]) => {
      merged[key] = mergeDefined(defaultValue, stored[key])
    })
    return merged as T
  }

  return (stored === undefined || stored === null ? defaults : stored) as T
}

export function mergeCopyWithDefaults(stored: unknown): Record<Language, Copy> {
  const merged = mergeDefined(defaultCopy, stored)

  if (
    merged.en.hero.titleStart === 'Health isn’t a'
    && merged.en.hero.titleEmphasis === 'checklist.'
    && merged.en.hero.titleEnd === 'It’s a living system.'
  ) {
    merged.en.hero.titleStart = defaultCopy.en.hero.titleStart
    merged.en.hero.titleEmphasis = defaultCopy.en.hero.titleEmphasis
    merged.en.hero.titleEnd = defaultCopy.en.hero.titleEnd
  }
  if (merged.en.hero.body === 'Clear ideas on nutrition, sleep, movement, light, stress, and recovery—made useful in English and Georgian.') {
    merged.en.hero.body = defaultCopy.en.hero.body
  }

  if (
    merged.ka.hero.titleStart === 'ჯანმრთელობა'
    && merged.ka.hero.titleEmphasis === 'ჩამონათვალი არ არის.'
    && merged.ka.hero.titleEnd === 'ის ცოცხალი სისტემაა.'
  ) {
    merged.ka.hero.titleStart = defaultCopy.ka.hero.titleStart
    merged.ka.hero.titleEmphasis = defaultCopy.ka.hero.titleEmphasis
    merged.ka.hero.titleEnd = defaultCopy.ka.hero.titleEnd
  }
  if (merged.ka.hero.body === 'მარტივი და პრაქტიკული იდეები კვებაზე, ძილზე, მოძრაობაზე, სინათლეზე, სტრესსა და აღდგენაზე — ქართულად და ინგლისურად.') {
    merged.ka.hero.body = defaultCopy.ka.hero.body
  }

  return merged
}

const pillarKeys: PillarKey[] = ['nutrition', 'sleep', 'movement', 'light', 'stress', 'recovery']

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={diagonal ? 'M7 17 17 7M8 7h9v9' : 'M5 12h14M14 7l5 5-5 5'} />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className={`menu-icon ${open ? 'is-open' : ''}`} aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function Monogram({
  logoUrl = defaultBrand.logoUrl,
  label = defaultBrand.displayName,
  wordmark = 'MIKLE',
  backToTop = 'Back to top',
}: {
  logoUrl?: string
  label?: string
  wordmark?: string
  backToTop?: string
}) {
  return (
    <a className="monogram" href="#top" aria-label={`${label}, ${backToTop}`}>
      <img src={logoUrl} alt="" />
      <span>{wordmark}</span>
    </a>
  )
}

type PreloaderPhase = 'visible' | 'leaving' | 'hidden'

function SitePreloader({ phase, logoUrl, copy }: { phase: PreloaderPhase; logoUrl: string; copy: Copy['preloader'] }) {
  if (phase === 'hidden') return null

  return (
    <div className={`site-preloader is-${phase}`} role="status" aria-label={copy.ariaLabel}>
      <div className="preloader-topline">
        <span>{copy.brandLine}</span>
        <span>{copy.systemLine}</span>
      </div>

      <div className="preloader-center">
        <div className="preloader-orbit" aria-hidden="true">
          <span className="preloader-ring preloader-ring-outer" />
          <span className="preloader-ring preloader-ring-inner" />
          <div className="preloader-nutrients">
            {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
          </div>
          <div className="preloader-core">
            <span />
            <img src={logoUrl} alt="" />
          </div>
        </div>

        <div className="preloader-copy">
          <span>{copy.kicker}</span>
          <strong>
            {copy.title.split('\n').map((line, index) => (
              <span key={`${line}-${index}`}>{line}{index < copy.title.split('\n').length - 1 && <br />}</span>
            ))}
          </strong>
        </div>
      </div>

      <div className="preloader-progress" aria-hidden="true">
        <span>{copy.progress}</span>
        <div><i /></div>
        <b>{copy.complete}</b>
      </div>
    </div>
  )
}

function App() {
  const [preloaderPhase, setPreloaderPhase] = useState<PreloaderPhase>(() => {
    try {
      return window.sessionStorage.getItem('mikle-preloader-seen') === '1' ? 'hidden' : 'visible'
    } catch {
      return 'visible'
    }
  })
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem('mikle-language')
    return saved === 'ka' ? 'ka' : 'en'
  })
  const [selectedPillar, setSelectedPillar] = useState<PillarKey>('nutrition')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [siteCopy, setSiteCopy] = useState(defaultCopy)
  const [brand, setBrand] = useState<SiteBrand>(defaultBrand)
  const [videos, setVideos] = useState<VideoItem[]>(defaultVideos)
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  const t = siteCopy[language]
  const selectedIndex = pillarKeys.indexOf(selectedPillar)
  const pillar = t.pillars[selectedPillar]
  const activeLanguageCode = language === 'ka' ? 'KA' : 'EN'
  const visibleVideos = useMemo(
    () => videos.filter((video) => video.language.toUpperCase().split('/').map((tag) => tag.trim()).includes(activeLanguageCode)),
    [activeLanguageCode, videos],
  )
  const languageFallbackVideos = defaultVideos.filter((video) => video.language === activeLanguageCode)
  const libraryVideos = visibleVideos.length ? visibleVideos : languageFallbackVideos
  const featuredVideo = libraryVideos.find((video) => video.featured) ?? libraryVideos[0]
  const localizedDisplayName = language === 'ka'
    ? brand.displayNameKa || defaultBrand.displayNameKa
    : brand.displayName
  const localizedWordmark = language === 'ka'
    ? brand.wordmarkKa || defaultBrand.wordmarkKa
    : brand.wordmark
  const localizedLocation = language === 'ka'
    ? brand.locationKa || defaultBrand.locationKa
    : brand.location
  const featuredTitle = language === 'ka' ? featuredVideo.title_ka : featuredVideo.title_en
  const featuredDescription = language === 'ka' ? featuredVideo.description_ka : featuredVideo.description_en

  const selectAdjacent = (direction: -1 | 1) => {
    const nextIndex = (selectedIndex + direction + pillarKeys.length) % pillarKeys.length
    setSelectedPillar(pillarKeys[nextIndex])
  }

  const orbitStyle = useMemo(
    () => ({ '--active-index': selectedIndex } as React.CSSProperties),
    [selectedIndex],
  )

  useEffect(() => {
    if (preloaderPhase === 'hidden') return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const leaveAfter = reduceMotion ? 180 : 1450
    const hideAfter = reduceMotion ? 260 : 2200

    document.body.classList.add('preloader-active')
    const leaveTimer = window.setTimeout(() => setPreloaderPhase('leaving'), leaveAfter)
    const hideTimer = window.setTimeout(() => {
      setPreloaderPhase('hidden')
      document.body.classList.remove('preloader-active')
      try {
        window.sessionStorage.setItem('mikle-preloader-seen', '1')
      } catch {
        // Storage can be unavailable in privacy-restricted browsers.
      }
    }, hideAfter)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(hideTimer)
      document.body.classList.remove('preloader-active')
    }
    // The opening sequence intentionally runs once for the lifetime of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dataset.language = language
    window.localStorage.setItem('mikle-language', language)
  }, [language])

  useEffect(() => {
    let cancelled = false

    Promise.all([loadSiteConfig<Record<Language, Copy>>(), loadPublishedVideos()])
      .then(([config, publishedVideos]) => {
        if (cancelled) return
        if (config?.copy) setSiteCopy(mergeCopyWithDefaults(config.copy))
        if (config?.brand) setBrand({ ...defaultBrand, ...config.brand })
        if (publishedVideos.length) setVideos(publishedVideos)
      })
      .catch((error) => {
        console.warn('Using the built-in site content because the content studio is unavailable.', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.title = t.seo.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.seo.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', t.seo.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t.seo.socialDescription)

    const absoluteProfileImage = new URL(brand.profileImageUrl, window.location.origin).href
    let socialImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
    if (!socialImage) {
      socialImage = document.createElement('meta')
      socialImage.setAttribute('property', 'og:image')
      document.head.appendChild(socialImage)
    }
    socialImage.setAttribute('content', absoluteProfileImage)

  }, [brand.profileImageUrl, t.seo])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [language])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <SitePreloader phase={preloaderPhase} logoUrl={brand.logoUrl} copy={t.preloader} />
      <div className={`site-shell ${preloaderPhase === 'hidden' ? 'is-ready' : 'is-preloading'}`} id="top">
      <a className="skip-link" href="#main">{t.ui.skipToContent}</a>

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <Monogram logoUrl={brand.logoUrl} label={localizedDisplayName} wordmark={localizedWordmark} backToTop={t.ui.backToTop} />

        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{t.nav.menu}</span>
          <MenuIcon open={menuOpen} />
        </button>

        <nav id="site-navigation" className={menuOpen ? 'is-open' : ''} aria-label={t.ui.primaryNavigation}>
          <a href="#system" onClick={closeMenu}>{t.nav.system}</a>
          <a href="#notes" onClick={closeMenu}>{t.nav.notes}</a>
          <a href="#story" onClick={closeMenu}>{t.nav.story}</a>
        </nav>

        <div className="header-actions">
          <div className="language-switcher" aria-label={t.ui.selectLanguage}>
            <button
              className={language === 'en' ? 'is-active' : ''}
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
            >
              {t.ui.englishShort}
            </button>
            <span>/</span>
            <button
              className={language === 'ka' ? 'is-active' : ''}
              type="button"
              onClick={() => setLanguage('ka')}
              aria-pressed={language === 'ka'}
            >
              {t.ui.georgianShort}
            </button>
          </div>
          <a className="header-follow" href={brand.instagramUrl} target="_blank" rel="noreferrer">
            <span>{t.nav.follow}</span>
            <ArrowIcon diagonal />
          </a>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grain" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">{t.hero.eyebrow}</p>
            <h1 id="hero-title">
              {t.hero.titleStart && <span>{t.hero.titleStart}</span>}
              {t.hero.titleStart && t.hero.titleEmphasis && ' '}
              {t.hero.titleEmphasis && <em>{t.hero.titleEmphasis}</em>}
              {t.hero.titleEmphasis && t.hero.titleEnd && ' '}
              {t.hero.titleEnd && <span>{t.hero.titleEnd}</span>}
            </h1>
            <p className="hero-intro">{t.hero.body}</p>
            <div className="hero-actions">
              <a className="button button-light" href="#system">
                {t.hero.explore}
                <ArrowIcon />
              </a>
              <button className="text-link text-link-light" type="button" onClick={() => setActiveVideo(featuredVideo)}>
                <span className="play-icon"><PlayIcon /></span>
                {t.hero.watch}
              </button>
            </div>
          </div>

          <aside className="hero-note" aria-label={featuredTitle}>
            <div className="note-topline">
              <span>{t.hero.figureTop}</span>
              <span>↗</span>
            </div>
            <button
              type="button"
              className="hero-note-media"
              aria-label={t.hero.figureAction}
              onClick={() => setActiveVideo(featuredVideo)}
            >
              <img src={featuredVideo.thumbnail_url} alt="" />
              <span className="hero-media-play"><PlayIcon /></span>
              <span className="hero-media-label">{featuredVideo.source_type === 'instagram' ? t.ui.reelLabel : t.ui.videoLabel} · {featuredVideo.language}</span>
            </button>
            <div className="note-copy">
              <h2>{featuredTitle}</h2>
              <p>{featuredDescription}</p>
            </div>
            <button className="note-meta" type="button" onClick={() => setActiveVideo(featuredVideo)}>
              <span>{featuredVideo.duration} · {featuredVideo.language}</span>
              <span>{t.hero.figureAction} <ArrowIcon diagonal /></span>
            </button>
          </aside>

          <a className="scroll-marker" href="#system">
            <span>{t.hero.marker}</span>
            <span className="scroll-line" aria-hidden="true" />
          </a>
        </section>

        <div className="pillar-ticker" aria-hidden="true">
          <div className="ticker-track">
            {[...t.ticker, ...t.ticker].map((item, index) => (
              <span key={`${item}-${index}`}>
                {item}<i>✦</i>
              </span>
            ))}
          </div>
        </div>

        <section className="system-section section" id="system" aria-labelledby="system-title">
          <div className="section-heading" data-reveal>
            <span className="section-number">({t.system.number})</span>
            <div>
              <p className="eyebrow">{t.system.eyebrow}</p>
              <h2 id="system-title">{t.system.title}</h2>
            </div>
            <p className="section-intro">{t.system.body}</p>
          </div>

          <div className="system-explorer" data-reveal>
            <div className="orbit-panel" style={orbitStyle}>
              <p className="orbit-instruction">{t.system.select}</p>
              <div className="orbit" role="group" aria-label={t.system.select}>
                <div className="orbit-ring orbit-ring-outer" aria-hidden="true" />
                <div className="orbit-ring orbit-ring-inner" aria-hidden="true" />
                <div className="orbit-core" aria-live="polite">
                  <span>{String(selectedIndex + 1).padStart(2, '0')}</span>
                  <strong>{pillar.name}</strong>
                </div>
                {pillarKeys.map((key, index) => (
                  <button
                    type="button"
                    className={`orbit-node orbit-node-${index + 1} ${selectedPillar === key ? 'is-active' : ''}`}
                    key={key}
                    onClick={() => setSelectedPillar(key)}
                    aria-pressed={selectedPillar === key}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{t.pillars[key].name}</strong>
                  </button>
                ))}
              </div>
            </div>

            <article className="pillar-detail" key={`${language}-${selectedPillar}`}>
              <div className="pillar-detail-top">
                <p>{t.system.focus} / {String(selectedIndex + 1).padStart(2, '0')}</p>
                <div className="pillar-nav">
                  <button type="button" onClick={() => selectAdjacent(-1)} aria-label={t.system.previous}>←</button>
                  <button type="button" onClick={() => selectAdjacent(1)} aria-label={t.system.next}>→</button>
                </div>
              </div>
              <h3>{pillar.name}</h3>
              <p className="pillar-lead">{pillar.lead}</p>
              <p className="pillar-body">{pillar.body}</p>
              <div className="practice-card">
                <span>✦</span>
                <div>
                  <p>{t.system.practice}</p>
                  <strong>{pillar.practice}</strong>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="notes-section section" id="notes" aria-labelledby="notes-title">
          <div className="section-heading section-heading-light" data-reveal>
            <span className="section-number">({t.notes.number})</span>
            <div>
              <p className="eyebrow">{t.notes.eyebrow}</p>
              <h2 id="notes-title">{t.notes.title}</h2>
            </div>
            <p className="section-intro">{t.notes.body}</p>
          </div>

          <div className="notes-grid">
            {libraryVideos.map((video, index) => (
              <button
                type="button"
                className={`note-card note-card-${['sun', 'clay', 'moss'][index % 3]}`}
                onClick={() => setActiveVideo(video)}
                key={video.id}
                data-reveal
                style={{ '--delay': `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="note-card-visual">
                  <img src={video.thumbnail_url} alt="" />
                  <span className="card-index">/{String(index + 1).padStart(3, '0')}</span>
                  <span className="card-play"><PlayIcon /></span>
                </div>
                <div className="note-card-copy">
                  <span className="card-meta">{video.duration} · {video.language}</span>
                  <h3>{language === 'ka' ? video.title_ka : video.title_en}</h3>
                  <p>{language === 'ka' ? video.description_ka : video.description_en}</p>
                  <span className="card-action">
                    {t.notes.watch}
                    <ArrowIcon diagonal />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="story-section section" id="story" aria-labelledby="story-title">
          <div className="story-visual" data-reveal>
            <div className="portrait-placeholder" role="img" aria-label={t.story.portraitAlt}>
              <span className="portrait-halo" aria-hidden="true" />
              <img className="portrait-image" src={brand.profileImageUrl} alt="" />
              <span className="portrait-note">{t.story.portraitLabel}</span>
            </div>
            <p>{localizedDisplayName} · {localizedLocation}</p>
          </div>

          <div className="story-copy" data-reveal>
            <span className="section-number">({t.story.number})</span>
            <p className="eyebrow">{t.story.eyebrow}</p>
            <h2 id="story-title">{t.story.title}</h2>
            <blockquote>{t.story.quote}</blockquote>
            <p className="story-body">{t.story.body}</p>

            <div className="credentials">
              <p>{t.story.credentials}</p>
              <ul>
                {t.story.credentialsList.map((credential, index) => (
                  <li key={credential}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {credential}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="closing-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="eyebrow">{t.close.eyebrow}</p>
          <h2 id="closing-title">{t.close.title}</h2>
          <p>{t.close.body}</p>
          <a className="button button-dark" href={brand.instagramUrl} target="_blank" rel="noreferrer">
            {t.close.follow}
            <ArrowIcon diagonal />
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-identity">
            <Monogram logoUrl={brand.logoUrl} label={localizedDisplayName} wordmark={localizedWordmark} backToTop={t.ui.backToTop} />
            <div>
              <strong>{localizedDisplayName}</strong>
              <span>{t.footer}</span>
            </div>
          </div>
          <a className="footer-social" href={brand.instagramUrl} target="_blank" rel="noreferrer">
            {t.ui.footerSocial} · {brand.instagramHandle}
            <ArrowIcon diagonal />
          </a>
          <a className="footer-top" href="#top">{t.close.top} ↑</a>
        </div>
        <div className="footer-legal">
          <p>{t.disclaimer}</p>
          <span>© {new Date().getFullYear()} {localizedDisplayName} · <a href="/admin">{t.ui.studioLabel}</a></span>
        </div>
      </footer>

        {activeVideo && <VideoPlayer video={activeVideo} language={language} labels={t.player} onClose={() => setActiveVideo(null)} />}
      </div>
    </>
  )
}

export default App
