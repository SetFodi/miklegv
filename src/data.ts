export type Language = 'en' | 'ka'

export type VideoSource = 'instagram' | 'upload' | 'external'

export type VideoItem = {
  id: string
  title_en: string
  title_ka: string
  description_en: string
  description_ka: string
  duration: string
  language: string
  thumbnail_url: string
  source_type: VideoSource
  source_url: string
  fallback_url?: string
  published: boolean
  featured: boolean
  sort_order: number
  created_at?: string
}

export type SiteBrand = {
  logoUrl: string
  profileImageUrl: string
  instagramUrl: string
  displayName: string
  displayNameKa: string
  location: string
}

export const defaultBrand: SiteBrand = {
  logoUrl: '/images/mikle-mark.png',
  profileImageUrl: '/images/mikle-profile.jpg',
  instagramUrl: 'https://www.instagram.com/mikle.hyw/',
  displayName: 'Mikle Gvianidze',
  displayNameKa: 'მაიკლ გვიანიძე',
  location: 'Hawai‘i / Georgia',
}

export const defaultVideos: VideoItem[] = [
  {
    id: 'instagram-DcDOnd1pRrY',
    title_en: 'What does it mean to actually live healthy?',
    title_ka: 'რას ნიშნავს სინამდვილეში ჯანსაღად ცხოვრება?',
    description_en: 'Why food and exercise are only two parts of a much larger system.',
    description_ka: 'რატომ არის კვება და ვარჯიში უფრო დიდი სისტემის მხოლოდ ორი ნაწილი.',
    duration: '02:27',
    language: 'EN',
    thumbnail_url: '/images/reel-health-en.jpg',
    source_type: 'upload',
    source_url: '/videos/health-en.webm',
    fallback_url: '/videos/health-en-browser.mp4',
    published: true,
    featured: true,
    sort_order: 1,
  },
  {
    id: 'instagram-DcDORepJscQ',
    title_en: 'What is health? — ქართულად',
    title_ka: 'რას ნიშნავს ჯანმრთელობა? — ქართულად',
    description_en: 'The same whole-system idea, shared directly with his Georgian community.',
    description_ka: 'იგივე იდეა ჯანმრთელობის მთლიან სისტემაზე — ქართული აუდიტორიისთვის.',
    duration: '02:43',
    language: 'KA',
    thumbnail_url: '/images/reel-health-ka.jpg',
    source_type: 'upload',
    source_url: '/videos/health-ka.webm',
    fallback_url: '/videos/health-ka-browser.mp4',
    published: true,
    featured: false,
    sort_order: 2,
  },
  {
    id: 'instagram-Db_p4EsJIi8',
    title_en: 'Why I started this page',
    title_ka: 'რატომ დავიწყე ეს გვერდი',
    description_en: 'An introduction to Mikle, his studies, and the questions guiding his work.',
    description_ka: 'მაიკლის, მისი სწავლისა და მისი საქმიანობის მთავარი კითხვების გაცნობა.',
    duration: '02:49',
    language: 'EN',
    thumbnail_url: '/images/reel-intro-en.jpg',
    source_type: 'upload',
    source_url: '/videos/intro-en.webm',
    fallback_url: '/videos/intro-en-browser.mp4',
    published: true,
    featured: false,
    sort_order: 3,
  },
  {
    id: 'instagram-Db_kEjAJYNQ',
    title_en: 'Why I started this page — in Georgian',
    title_ka: 'რატომ დავიწყე ეს გვერდი',
    description_en: 'Mikle’s introduction, shared directly with his Georgian community.',
    description_ka: 'მაიკლის გაცნობა, მისი სწავლისა და საქმიანობის მთავარი კითხვები.',
    duration: '02:56',
    language: 'KA',
    thumbnail_url: '/images/reel-intro-ka.jpg',
    source_type: 'upload',
    source_url: '/videos/intro-ka.webm',
    fallback_url: '/videos/intro-ka-browser.mp4',
    published: true,
    featured: false,
    sort_order: 4,
  },
]

export function instagramEmbedUrl(url: string) {
  const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#]+)/i)
  return match ? `https://www.instagram.com/reel/${match[1]}/embed/` : url
}
