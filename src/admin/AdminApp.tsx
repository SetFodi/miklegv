import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { defaultCopy, type Copy, type PillarKey } from '../App'
import { defaultBrand, defaultVideos, type Language, type SiteBrand, type VideoItem } from '../data'
import { isCmsConfigured, loadSiteConfig, supabase, uploadMedia } from '../lib/cms'
import './admin.css'

type StudioTab = 'videos' | 'content' | 'brand'
type AuthState = 'loading' | 'signed-out' | 'checking' | 'authorized' | 'unauthorized'

const emptyVideo: VideoItem = {
  id: '',
  title_en: '',
  title_ka: '',
  description_en: '',
  description_ka: '',
  duration: '',
  language: 'EN',
  thumbnail_url: '',
  source_type: 'instagram',
  source_url: '',
  published: false,
  featured: false,
  sort_order: 1,
}

const contentSections = [
  {
    title: 'Homepage introduction',
    fields: [
      ['hero.eyebrow', 'Small heading', false],
      ['hero.titleStart', 'Headline — first line', false],
      ['hero.titleEmphasis', 'Headline — highlighted words', false],
      ['hero.titleEnd', 'Headline — final line', false],
      ['hero.body', 'Introduction', true],
    ],
  },
  {
    title: 'Health system',
    fields: [
      ['system.eyebrow', 'Small heading', false],
      ['system.title', 'Section title', false],
      ['system.body', 'Section introduction', true],
    ],
  },
  {
    title: 'Video library',
    fields: [
      ['notes.eyebrow', 'Small heading', false],
      ['notes.title', 'Section title', false],
      ['notes.body', 'Section introduction', true],
    ],
  },
  {
    title: 'About Mikle',
    fields: [
      ['story.eyebrow', 'Small heading', false],
      ['story.title', 'Section title', false],
      ['story.quote', 'Pull quote', true],
      ['story.body', 'Biography', true],
      ['story.credentialsList', 'Credentials — one per line', true],
    ],
  },
  {
    title: 'Closing invitation',
    fields: [
      ['close.eyebrow', 'Small heading', false],
      ['close.title', 'Closing title', true],
      ['close.body', 'Closing text', true],
    ],
  },
  {
    title: 'Footer and disclaimer',
    fields: [
      ['footer', 'Footer phrase', false],
      ['disclaimer', 'Educational disclaimer', true],
    ],
  },
] as const

const pillarKeys: PillarKey[] = ['nutrition', 'sleep', 'movement', 'light', 'stress', 'recovery']

function getPathValue(source: unknown, path: string): string | string[] {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return ''
  }, source)
  return Array.isArray(value) ? value.map(String) : String(value ?? '')
}

function setPathValue<T>(source: T, path: string, nextValue: string | string[]): T {
  const clone = structuredClone(source)
  const keys = path.split('.')
  let target = clone as Record<string, unknown>
  keys.slice(0, -1).forEach((key) => {
    target = target[key] as Record<string, unknown>
  })
  target[keys.at(-1)!] = nextValue
  return clone
}

function StudioLogo({ logoUrl }: { logoUrl: string }) {
  return (
    <div className="studio-logo">
      <img src={logoUrl} alt="" />
      <div>
        <strong>Mikle Studio</strong>
        <span>Private content desk</span>
      </div>
    </div>
  )
}

function SetupRequired() {
  return (
    <main className="studio-gate">
      <div className="studio-gate-card">
        <StudioLogo logoUrl={defaultBrand.logoUrl} />
        <span className="studio-kicker">One-time connection required</span>
        <h1>The studio is built.<br />Connect its secure home.</h1>
        <p>
          Add the Supabase project URL and public key to the environment, run the included database setup,
          and then only Mikle’s approved email will be able to sign in.
        </p>
        <div className="setup-keys">
          <code>VITE_SUPABASE_URL</code>
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
        </div>
        <a href="/">← Return to the website</a>
      </div>
    </main>
  )
}

function SignIn({ onSent }: { onSent: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    setBusy(false)
    if (authError) setError(authError.message)
    else onSent(email)
  }

  return (
    <main className="studio-gate">
      <form className="studio-gate-card studio-login" onSubmit={submit}>
        <StudioLogo logoUrl={defaultBrand.logoUrl} />
        <span className="studio-kicker">Private access</span>
        <h1>Welcome back,<br />Mikle.</h1>
        <p>Enter your approved email. We’ll send a secure sign-in link—no password to remember.</p>
        <label>
          Email address
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </label>
        {error && <p className="studio-error">{error}</p>}
        <button className="studio-primary" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Email me a sign-in link'}
        </button>
        <a href="/">← Return to the website</a>
      </form>
    </main>
  )
}

function VideoEditor({
  video,
  onCancel,
  onSaved,
}: {
  video: VideoItem
  onCancel: () => void
  onSaved: (video: VideoItem) => void
}) {
  const [draft, setDraft] = useState(video)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = <K extends keyof VideoItem>(key: K, value: VideoItem[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')

    try {
      let sourceUrl = draft.source_url
      let thumbnailUrl = draft.thumbnail_url

      if (draft.source_type === 'upload' && videoFile) {
        sourceUrl = await uploadMedia(videoFile, 'videos')
      }
      if (thumbnailFile) {
        thumbnailUrl = await uploadMedia(thumbnailFile, 'thumbnails')
      }

      if (!sourceUrl) throw new Error('Add an Instagram Reel URL or choose a video file.')
      if (!thumbnailUrl) throw new Error('Choose a thumbnail image.')

      const nextVideo: VideoItem = {
        ...draft,
        id: draft.id || crypto.randomUUID(),
        source_url: sourceUrl,
        thumbnail_url: thumbnailUrl,
      }

      const { data, error: saveError } = await supabase.from('videos').upsert(nextVideo).select().single()
      if (saveError) throw saveError
      onSaved(data as VideoItem)
    } catch (saveFailure) {
      setError(saveFailure instanceof Error ? saveFailure.message : 'The video could not be saved.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="studio-editor" onSubmit={save}>
      <div className="studio-editor-title">
        <div>
          <span>{draft.id ? 'Edit video' : 'New video'}</span>
          <h2>{draft.title_en || 'Untitled field note'}</h2>
        </div>
        <button type="button" className="studio-quiet" onClick={onCancel}>Close</button>
      </div>

      <div className="studio-form-grid">
        <label>
          English title
          <input value={draft.title_en} onChange={(event) => update('title_en', event.target.value)} required />
        </label>
        <label>
          Georgian title
          <input value={draft.title_ka} onChange={(event) => update('title_ka', event.target.value)} required />
        </label>
        <label>
          English summary
          <textarea value={draft.description_en} onChange={(event) => update('description_en', event.target.value)} rows={4} />
        </label>
        <label>
          Georgian summary
          <textarea value={draft.description_ka} onChange={(event) => update('description_ka', event.target.value)} rows={4} />
        </label>
        <label>
          Video source
          <select value={draft.source_type} onChange={(event) => update('source_type', event.target.value as VideoItem['source_type'])}>
            <option value="instagram">Instagram Reel</option>
            <option value="upload">Upload an MP4</option>
          </select>
        </label>
        {draft.source_type === 'instagram' ? (
          <label>
            Instagram Reel URL
            <input type="url" value={draft.source_url} onChange={(event) => update('source_url', event.target.value)} placeholder="https://instagram.com/reel/…" required />
          </label>
        ) : (
          <label>
            Video file {draft.source_url && <small>Current upload kept unless replaced</small>}
            <input type="file" accept="video/mp4,video/webm" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} required={!draft.source_url} />
          </label>
        )}
        <label>
          Thumbnail {draft.thumbnail_url && <small>Current image kept unless replaced</small>}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} required={!draft.thumbnail_url} />
        </label>
        <div className="studio-mini-grid">
          <label>
            Duration
            <input value={draft.duration} onChange={(event) => update('duration', event.target.value)} placeholder="02:17" />
          </label>
          <label>
            Language
            <select value={draft.language} onChange={(event) => update('language', event.target.value)}>
              <option>EN</option>
              <option>KA</option>
              <option>EN / KA</option>
            </select>
          </label>
          <label>
            Display order
            <input type="number" min="1" value={draft.sort_order} onChange={(event) => update('sort_order', Number(event.target.value))} />
          </label>
        </div>
      </div>

      <div className="studio-switches">
        <label><input type="checkbox" checked={draft.published} onChange={(event) => update('published', event.target.checked)} /> Published</label>
        <label><input type="checkbox" checked={draft.featured} onChange={(event) => update('featured', event.target.checked)} /> Feature in homepage hero</label>
      </div>

      {error && <p className="studio-error">{error}</p>}
      <div className="studio-form-actions">
        <button type="button" className="studio-quiet" onClick={onCancel}>Cancel</button>
        <button type="submit" className="studio-primary" disabled={busy}>{busy ? 'Saving…' : 'Save video'}</button>
      </div>
    </form>
  )
}

function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>(isCmsConfigured ? 'loading' : 'signed-out')
  const [sentTo, setSentTo] = useState('')
  const [tab, setTab] = useState<StudioTab>('videos')
  const [videos, setVideos] = useState<VideoItem[]>(defaultVideos)
  const [copy, setCopy] = useState(defaultCopy)
  const [brand, setBrand] = useState<SiteBrand>(defaultBrand)
  const [editLanguage, setEditLanguage] = useState<Language>('en')
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!supabase) return
    const client = supabase

    const checkUser = async () => {
      const { data } = await client.auth.getSession()
      if (!data.session) {
        setAuthState('signed-out')
        return
      }

      setAuthState('checking')
      const signedInEmail = data.session.user.email ?? ''
      const { data: admins } = await client
        .from('site_admins')
        .select('email')
      const isAllowed = admins?.some(
        (admin) => admin.email.toLowerCase() === signedInEmail.toLowerCase(),
      )
      setAuthState(isAllowed ? 'authorized' : 'unauthorized')
    }

    checkUser()
    const { data: subscription } = client.auth.onAuthStateChange(() => checkUser())
    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (authState !== 'authorized' || !supabase) return

    Promise.all([
      supabase.from('videos').select('*').order('sort_order', { ascending: true }),
      loadSiteConfig<Record<Language, Copy>>(),
    ]).then(([videoResult, config]) => {
      if (videoResult.data?.length) setVideos(videoResult.data as VideoItem[])
      if (config?.copy) setCopy(config.copy)
      if (config?.brand) setBrand(config.brand)
    })
  }, [authState])

  const publishedCount = useMemo(() => videos.filter((video) => video.published).length, [videos])

  if (!isCmsConfigured) return <SetupRequired />
  if (authState === 'loading' || authState === 'checking') {
    return <main className="studio-loading"><img src={defaultBrand.logoUrl} alt="" /><span>Opening Mikle Studio…</span></main>
  }
  if (authState === 'signed-out') {
    if (sentTo) {
      return (
        <main className="studio-gate">
          <div className="studio-gate-card studio-login">
            <StudioLogo logoUrl={defaultBrand.logoUrl} />
            <span className="studio-kicker">Check your inbox</span>
            <h1>Your secure link is on its way.</h1>
            <p>We sent it to <strong>{sentTo}</strong>. The link returns directly to the private studio.</p>
            <button className="studio-quiet" type="button" onClick={() => setSentTo('')}>Use another email</button>
          </div>
        </main>
      )
    }
    return <SignIn onSent={setSentTo} />
  }
  if (authState === 'unauthorized') {
    return (
      <main className="studio-gate">
        <div className="studio-gate-card studio-login">
          <StudioLogo logoUrl={defaultBrand.logoUrl} />
          <span className="studio-kicker">Access protected</span>
          <h1>This email is not on Mikle’s admin list.</h1>
          <p>The website is safe—sign out and use the approved owner email.</p>
          <button className="studio-primary" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
      </main>
    )
  }

  const saveSiteConfig = async () => {
    if (!supabase) return
    setSaving(true)
    setNotice('')
    const { error } = await supabase.from('site_settings').upsert({
      key: 'site_config',
      value: { copy, brand },
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setNotice(error ? error.message : 'Changes are live on the website.')
  }

  const deleteVideo = async (video: VideoItem) => {
    if (!supabase || !window.confirm(`Delete “${video.title_en}”? This cannot be undone.`)) return
    const { error } = await supabase.from('videos').delete().eq('id', video.id)
    if (error) setNotice(error.message)
    else setVideos((current) => current.filter((item) => item.id !== video.id))
  }

  const uploadBrandAsset = async (file: File, key: 'logoUrl' | 'profileImageUrl') => {
    setSaving(true)
    try {
      const url = await uploadMedia(file, 'brand')
      setBrand((current) => ({ ...current, [key]: url }))
      setNotice('Image uploaded. Save changes when you are ready.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Image upload failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <StudioLogo logoUrl={brand.logoUrl} />
        <nav aria-label="Studio navigation">
          <button className={tab === 'videos' ? 'is-active' : ''} onClick={() => setTab('videos')}><span>01</span> Videos</button>
          <button className={tab === 'content' ? 'is-active' : ''} onClick={() => setTab('content')}><span>02</span> Website text</button>
          <button className={tab === 'brand' ? 'is-active' : ''} onClick={() => setTab('brand')}><span>03</span> Profile & brand</button>
        </nav>
        <div className="studio-sidebar-footer">
          <a href="/" target="_blank">View live website ↗</a>
          <button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
      </aside>

      <main className="studio-main">
        <header className="studio-header">
          <div>
            <span>Owner workspace</span>
            <h1>{tab === 'videos' ? 'Field notes' : tab === 'content' ? 'Website words' : 'Identity'}</h1>
          </div>
          <div className="studio-status"><i /> Website live · {publishedCount} videos</div>
        </header>

        {notice && <div className="studio-notice" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}

        {tab === 'videos' && (
          <section className="studio-section">
            <div className="studio-section-intro">
              <div><span>Video library</span><h2>Add, edit, publish, or remove a field note.</h2></div>
              <button className="studio-primary" type="button" onClick={() => setEditingVideo({ ...emptyVideo, sort_order: videos.length + 1 })}>+ Add video</button>
            </div>

            {editingVideo ? (
              <VideoEditor
                video={editingVideo}
                onCancel={() => setEditingVideo(null)}
                onSaved={(savedVideo) => {
                  setVideos((current) => [...current.filter((video) => video.id !== savedVideo.id), savedVideo].sort((a, b) => a.sort_order - b.sort_order))
                  setEditingVideo(null)
                  setNotice('Video saved successfully.')
                }}
              />
            ) : (
              <div className="studio-video-list">
                {videos.map((video) => (
                  <article key={video.id}>
                    <img src={video.thumbnail_url} alt="" />
                    <div className="studio-video-copy">
                      <div><span>{video.duration || '—'} · {video.language}</span>{video.featured && <b>Featured</b>}</div>
                      <h3>{video.title_en}</h3>
                      <p>{video.title_ka}</p>
                    </div>
                    <div className="studio-publish-state"><i className={video.published ? 'is-live' : ''} />{video.published ? 'Live' : 'Draft'}</div>
                    <div className="studio-row-actions">
                      <button type="button" onClick={() => setEditingVideo(video)}>Edit</button>
                      <button type="button" className="is-danger" onClick={() => deleteVideo(video)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'content' && (
          <section className="studio-section">
            <div className="studio-section-intro">
              <div><span>Bilingual editor</span><h2>Change the public website without touching code.</h2></div>
              <button className="studio-primary" type="button" onClick={saveSiteConfig} disabled={saving}>{saving ? 'Saving…' : 'Save & publish'}</button>
            </div>
            <div className="studio-language-tabs">
              <button className={editLanguage === 'en' ? 'is-active' : ''} onClick={() => setEditLanguage('en')}>English</button>
              <button className={editLanguage === 'ka' ? 'is-active' : ''} onClick={() => setEditLanguage('ka')}>ქართული</button>
            </div>
            <div className="studio-content-editor">
              {contentSections.map((section, sectionIndex) => (
                <details key={section.title} open={sectionIndex === 0}>
                  <summary><span>{String(sectionIndex + 1).padStart(2, '0')}</span>{section.title}<i>+</i></summary>
                  <div className="studio-content-fields">
                    {section.fields.map(([path, label, multiline]) => {
                      const value = getPathValue(copy[editLanguage], path)
                      const isList = Array.isArray(value)
                      const stringValue = isList ? value.join('\n') : value
                      return (
                        <label key={path}>
                          {label}
                          {multiline ? (
                            <textarea
                              rows={isList ? 6 : 4}
                              value={stringValue}
                              onChange={(event) => setCopy((current) => ({
                                ...current,
                                [editLanguage]: setPathValue(current[editLanguage], path, isList ? event.target.value.split('\n').filter(Boolean) : event.target.value),
                              }))}
                            />
                          ) : (
                            <input
                              value={stringValue}
                              onChange={(event) => setCopy((current) => ({
                                ...current,
                                [editLanguage]: setPathValue(current[editLanguage], path, event.target.value),
                              }))}
                            />
                          )}
                        </label>
                      )
                    })}
                  </div>
                </details>
              ))}

              <details>
                <summary><span>07</span>The six pillars<i>+</i></summary>
                <div className="studio-pillar-editor">
                  {pillarKeys.map((key, index) => (
                    <div key={key}>
                      <h3><span>{String(index + 1).padStart(2, '0')}</span>{copy[editLanguage].pillars[key].name}</h3>
                      {(['name', 'lead', 'body', 'practice'] as const).map((field) => (
                        <label key={field}>
                          {field === 'name' ? 'Name' : field === 'lead' ? 'Opening thought' : field === 'body' ? 'Explanation' : 'Practical starting point'}
                          <textarea
                            rows={field === 'name' ? 1 : 3}
                            value={copy[editLanguage].pillars[key][field]}
                            onChange={(event) => setCopy((current) => ({
                              ...current,
                              [editLanguage]: {
                                ...current[editLanguage],
                                pillars: {
                                  ...current[editLanguage].pillars,
                                  [key]: { ...current[editLanguage].pillars[key], [field]: event.target.value },
                                },
                              },
                            }))}
                          />
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </section>
        )}

        {tab === 'brand' && (
          <section className="studio-section">
            <div className="studio-section-intro">
              <div><span>Profile & brand</span><h2>Keep the identity current as Mikle’s work grows.</h2></div>
              <button className="studio-primary" type="button" onClick={saveSiteConfig} disabled={saving}>{saving ? 'Saving…' : 'Save & publish'}</button>
            </div>
            <div className="studio-brand-grid">
              <div className="studio-asset-card">
                <span>Brand mark</span>
                <div className="studio-logo-preview"><img src={brand.logoUrl} alt="Current brand mark" /></div>
                <label className="studio-upload">Replace logo<input type="file" accept="image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadBrandAsset(event.target.files[0], 'logoUrl')} /></label>
              </div>
              <div className="studio-asset-card">
                <span>Profile photograph</span>
                <div className="studio-profile-preview"><img src={brand.profileImageUrl} alt="Current profile" /></div>
                <label className="studio-upload">Replace portrait<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadBrandAsset(event.target.files[0], 'profileImageUrl')} /></label>
              </div>
              <div className="studio-brand-fields">
                <label>Display name — English<input value={brand.displayName} onChange={(event) => setBrand((current) => ({ ...current, displayName: event.target.value }))} /></label>
                <label>Display name — Georgian<input value={brand.displayNameKa ?? ''} onChange={(event) => setBrand((current) => ({ ...current, displayNameKa: event.target.value }))} /></label>
                <label>Location line<input value={brand.location} onChange={(event) => setBrand((current) => ({ ...current, location: event.target.value }))} /></label>
                <label>Instagram profile URL<input type="url" value={brand.instagramUrl} onChange={(event) => setBrand((current) => ({ ...current, instagramUrl: event.target.value }))} /></label>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default AdminApp
