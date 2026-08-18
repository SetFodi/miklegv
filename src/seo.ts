import type { Language, SiteBrand } from './data'

export const SITE_ORIGIN = 'https://miklegvianidze.vercel.app'

export const LANGUAGE_PATHS: Record<Language, string> = {
  en: '/en',
  ka: '/ka',
}

export const HTML_LOCALES: Record<Language, string> = {
  en: 'en-US',
  ka: 'ka-GE',
}

const OPEN_GRAPH_LOCALES: Record<Language, string> = {
  en: 'en_US',
  ka: 'ka_GE',
}

type SeoCopy = {
  title: string
  description: string
  socialDescription: string
}

export function languageFromPathname(pathname: string): Language | null {
  if (/^\/ka(?:\/|$)/i.test(pathname)) return 'ka'
  if (/^\/en(?:\/|$)/i.test(pathname)) return 'en'
  return null
}

function absoluteUrl(path: string) {
  return new URL(path, SITE_ORIGIN).href
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function setLink(rel: string, href: string, hrefLang?: string) {
  const selector = hrefLang
    ? `link[rel="${rel}"][hreflang="${hrefLang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let element = document.head.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    if (hrefLang) element.hreflang = hrefLang
    document.head.appendChild(element)
  }
  element.href = href
}

export function updateSeoHead(language: Language, seo: SeoCopy, brand: SiteBrand) {
  const otherLanguage: Language = language === 'en' ? 'ka' : 'en'
  const canonicalUrl = absoluteUrl(LANGUAGE_PATHS[language])
  const profileImageUrl = absoluteUrl(brand.profileImageUrl)
  const localizedName = language === 'ka'
    ? brand.displayNameKa || brand.displayName
    : brand.displayName
  const profileImageAlt = language === 'ka'
    ? `${localizedName} — პორტრეტი`
    : `${localizedName} portrait`
  const topics = language === 'ka'
    ? ['კვება', 'ძილი', 'მოძრაობა', 'სინათლე', 'სტრესი', 'აღდგენა']
    : ['Nutrition', 'Sleep', 'Movement', 'Light', 'Stress', 'Recovery']

  document.title = seo.title
  document.documentElement.lang = HTML_LOCALES[language]
  document.documentElement.dataset.language = language

  setMeta('name', 'description', seo.description)
  setMeta('name', 'author', localizedName)
  setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

  setMeta('property', 'og:type', 'profile')
  setMeta('property', 'og:site_name', 'Mikle Health')
  setMeta('property', 'og:title', seo.title)
  setMeta('property', 'og:description', seo.socialDescription)
  setMeta('property', 'og:url', canonicalUrl)
  setMeta('property', 'og:locale', OPEN_GRAPH_LOCALES[language])
  setMeta('property', 'og:locale:alternate', OPEN_GRAPH_LOCALES[otherLanguage])
  setMeta('property', 'og:image', profileImageUrl)
  setMeta('property', 'og:image:secure_url', profileImageUrl)
  setMeta('property', 'og:image:alt', profileImageAlt)

  setMeta('name', 'twitter:card', 'summary')
  setMeta('name', 'twitter:title', seo.title)
  setMeta('name', 'twitter:description', seo.socialDescription)
  setMeta('name', 'twitter:image', profileImageUrl)
  setMeta('name', 'twitter:image:alt', profileImageAlt)

  setLink('canonical', canonicalUrl)
  setLink('alternate', absoluteUrl(LANGUAGE_PATHS.en), HTML_LOCALES.en)
  setLink('alternate', absoluteUrl(LANGUAGE_PATHS.ka), HTML_LOCALES.ka)
  setLink('alternate', absoluteUrl(LANGUAGE_PATHS.en), 'x-default')

  const personId = `${SITE_ORIGIN}/#mikle-gvianidze`
  const websiteId = `${SITE_ORIGIN}/#website`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${SITE_ORIGIN}/`,
        name: 'Mikle Health',
        alternateName: 'მაიკლი — ჯანმრთელობა როგორც სისტემა',
        inLanguage: [HTML_LOCALES.en, HTML_LOCALES.ka],
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: brand.displayName,
        alternateName: [brand.displayNameKa, brand.instagramHandle].filter(Boolean),
        url: canonicalUrl,
        image: profileImageUrl,
        description: seo.description,
        sameAs: [brand.instagramUrl],
        knowsAbout: topics,
      },
      {
        '@type': 'ProfilePage',
        '@id': `${canonicalUrl}#profile`,
        url: canonicalUrl,
        name: seo.title,
        description: seo.description,
        inLanguage: HTML_LOCALES[language],
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
      },
    ],
  }

  let structuredDataElement = document.head.querySelector<HTMLScriptElement>('#mikle-structured-data')
  if (!structuredDataElement) {
    structuredDataElement = document.createElement('script')
    structuredDataElement.id = 'mikle-structured-data'
    structuredDataElement.type = 'application/ld+json'
    document.head.appendChild(structuredDataElement)
  }
  structuredDataElement.textContent = JSON.stringify(structuredData)
}
