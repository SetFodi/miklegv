import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { defaultCopy, mergeCopyWithDefaults, type Copy, type PillarKey } from '../App'
import { defaultBrand, defaultVideos, type Language, type SiteBrand, type VideoItem } from '../data'
import { isCmsConfigured, loadSiteConfig, supabase, uploadMedia } from '../lib/cms'
import './admin.css'

type StudioTab = 'videos' | 'content' | 'brand' | 'account'
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
    title: 'Navigation & language',
    fields: [
      ['nav.system', 'Health system link', false],
      ['nav.notes', 'Video library link', false],
      ['nav.story', 'About link', false],
      ['nav.follow', 'Instagram button', false],
      ['nav.menu', 'Mobile menu label', false],
      ['ui.englishShort', 'English switch label', false],
      ['ui.georgianShort', 'Georgian switch label', false],
    ],
  },
  {
    title: 'Opening preloader',
    fields: [
      ['preloader.brandLine', 'Top-left brand line', false],
      ['preloader.systemLine', 'Top-right system line', false],
      ['preloader.kicker', 'Small center line', false],
      ['preloader.title', 'Main preloader statement — line breaks supported', true],
      ['preloader.progress', 'Progress caption', false],
      ['preloader.complete', 'Completion value', false],
      ['preloader.ariaLabel', 'Screen-reader loading label', false],
    ],
  },
  {
    title: 'Homepage introduction',
    fields: [
      ['hero.eyebrow', 'Small heading', false],
      ['hero.titleStart', 'Headline — opening words', false],
      ['hero.titleEmphasis', 'Headline — highlighted words', false],
      ['hero.titleEnd', 'Headline — optional final words', false],
      ['hero.body', 'Introduction', true],
      ['hero.explore', 'Explore button', false],
      ['hero.watch', 'Watch button', false],
      ['hero.marker', 'Scroll prompt', false],
      ['hero.figureTop', 'Featured-card label', false],
      ['hero.figureAction', 'Featured-card play label', false],
    ],
  },
  {
    title: 'Health system',
    fields: [
      ['system.number', 'Section number', false],
      ['system.eyebrow', 'Small heading', false],
      ['system.title', 'Section title', false],
      ['system.body', 'Section introduction', true],
      ['ticker', 'Moving topics — one per line', true],
      ['system.select', 'Pillar selector instruction', false],
      ['system.focus', 'Selected-pillar label', false],
      ['system.practice', 'Practical-tip label', false],
      ['system.previous', 'Previous button description', false],
      ['system.next', 'Next button description', false],
    ],
  },
  {
    title: 'Video library',
    fields: [
      ['notes.number', 'Section number', false],
      ['notes.eyebrow', 'Small heading', false],
      ['notes.title', 'Section title', false],
      ['notes.body', 'Section introduction', true],
      ['notes.watch', 'Video-card action', false],
      ['ui.reelLabel', 'Instagram media label', false],
      ['ui.videoLabel', 'Uploaded media label', false],
    ],
  },
  {
    title: 'Video player',
    fields: [
      ['player.nowWatching', 'Player heading', false],
      ['player.close', 'Close-button description', false],
      ['player.unsupported', 'Unsupported-browser message', true],
      ['player.viewInstagram', 'Instagram fallback link', false],
    ],
  },
  {
    title: 'About Mikle',
    fields: [
      ['story.number', 'Section number', false],
      ['story.eyebrow', 'Small heading', false],
      ['story.title', 'Section title', true],
      ['story.quote', 'Pull quote', true],
      ['story.body', 'Biography', true],
      ['story.credentials', 'Credentials heading', false],
      ['story.credentialsList', 'Credentials — one per line', true],
      ['story.portraitLabel', 'Portrait label', false],
      ['story.portraitAlt', 'Portrait accessibility description', true],
    ],
  },
  {
    title: 'Closing invitation',
    fields: [
      ['close.eyebrow', 'Small heading', false],
      ['close.title', 'Closing title', true],
      ['close.body', 'Closing text', true],
      ['close.follow', 'Instagram button', false],
      ['close.top', 'Back-to-top link', false],
    ],
  },
  {
    title: 'Footer and disclaimer',
    fields: [
      ['footer', 'Footer phrase', false],
      ['ui.footerSocial', 'Social-network label', false],
      ['ui.studioLabel', 'Studio link label', false],
      ['disclaimer', 'Educational disclaimer', true],
    ],
  },
  {
    title: 'Search, sharing & accessibility',
    fields: [
      ['seo.title', 'Browser and search title', false],
      ['seo.description', 'Search description', true],
      ['seo.socialDescription', 'Social-share description', true],
      ['ui.skipToContent', 'Skip-link label', false],
      ['ui.primaryNavigation', 'Navigation accessibility label', false],
      ['ui.selectLanguage', 'Language-switcher accessibility label', false],
      ['ui.backToTop', 'Logo-link accessibility label', false],
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

function friendlyAuthError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'That email and password don’t match. If you have never set a password, use “Set or reset password” below.'
  }
  if (normalizedMessage.includes('rate limit')) {
    return 'Too many emails were requested recently. Give the inbox a short breather, then try once more.'
  }
  if (normalizedMessage.includes('email not confirmed')) {
    return 'That account still needs its one-time email confirmation before it can sign in.'
  }

  return message
}

async function isAllowedStudioEmail(email: string) {
  if (!supabase) return false

  const { data, error } = await supabase.rpc('is_studio_email_allowed', {
    candidate_email: email,
  })

  if (error) throw error
  return Boolean(data)
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    try {
      if (!(await isAllowedStudioEmail(normalizedEmail))) {
        setError('That email isn’t on the guest list. Nice try, mystery nutritionist.')
        return
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (authError) setError(friendlyAuthError(authError.message))
    } catch {
      setError('The doorman is taking a hydration break. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  const requestPasswordReset = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    try {
      if (!(await isAllowedStudioEmail(normalizedEmail))) {
        setError('That email isn’t on the guest list. Nice try, mystery nutritionist.')
        return
      }

      const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/admin`,
      })
      if (authError) setError(friendlyAuthError(authError.message))
      else setResetSent(true)
    } catch {
      setError('The doorman is taking a hydration break. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  if (resetSent) {
    return (
      <main className="studio-gate">
        <div className="studio-gate-card studio-login">
          <StudioLogo logoUrl={defaultBrand.logoUrl} />
          <span className="studio-kicker">One last email</span>
          <h1>Open the reset link.</h1>
          <p>
            We sent a password setup link to <strong>{email.trim().toLowerCase()}</strong>. After you choose a password,
            regular Studio logins will not send email.
          </p>
          <button className="studio-quiet" type="button" onClick={() => setResetSent(false)}>Send it again</button>
          <button className="studio-text-button" type="button" onClick={() => { setResetMode(false); setResetSent(false); setError('') }}>Back to sign in</button>
        </div>
      </main>
    )
  }

  if (resetMode) {
    return (
      <main className="studio-gate">
        <form className="studio-gate-card studio-login" onSubmit={requestPasswordReset}>
          <StudioLogo logoUrl={defaultBrand.logoUrl} />
          <span className="studio-kicker">Password setup</span>
          <h1>Choose it once.<br />Use it from then on.</h1>
          <p>We’ll send one secure link so you can set a first password or replace a forgotten one.</p>
          <label>
            Approved email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" autoFocus />
          </label>
          {error && <p className="studio-error" role="alert">{error}</p>}
          <button className="studio-primary" type="submit" disabled={busy}>
            {busy ? 'Preparing link…' : 'Send password setup link'}
          </button>
          <button className="studio-text-button" type="button" onClick={() => { setResetMode(false); setError('') }}>I know my password</button>
          <a href="/">← Return to the website</a>
        </form>
      </main>
    )
  }

  return (
    <main className="studio-gate">
      <form className="studio-gate-card studio-login" onSubmit={submit}>
        <StudioLogo logoUrl={defaultBrand.logoUrl} />
        <span className="studio-kicker">Private access</span>
        <h1>Welcome back,<br />Mikle.</h1>
        <p>Sign in with the Studio password. This browser will remember the session until you choose to sign out.</p>
        <label>
          Email address
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" autoFocus />
        </label>
        <label>
          Password
          <span className="studio-password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>
        {error && <p className="studio-error" role="alert">{error}</p>}
        <button className="studio-primary" type="submit" disabled={busy}>
          {busy ? 'Opening Studio…' : 'Enter Studio'}
        </button>
        <button className="studio-text-button" type="button" onClick={() => { setResetMode(true); setError('') }}>Set or reset password</button>
        <a href="/">← Return to the website</a>
      </form>
    </main>
  )
}

function PasswordSetup({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const savePassword = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setError('')

    if (password.length < 10) {
      setError('Use at least 10 characters. A password manager can make a strong one for you.')
      return
    }
    if (password !== confirmation) {
      setError('Those passwords don’t match yet.')
      return
    }

    setBusy(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (updateError) {
      setError(friendlyAuthError(updateError.message))
      return
    }

    window.history.replaceState({}, document.title, window.location.pathname)
    onComplete()
  }

  return (
    <main className="studio-gate">
      <form className="studio-gate-card studio-login" onSubmit={savePassword}>
        <StudioLogo logoUrl={defaultBrand.logoUrl} />
        <span className="studio-kicker">Secure the Studio</span>
        <h1>Make it memorable.<br />Keep it private.</h1>
        <p>Set a password with at least 10 characters. Once saved, you’ll use email and password for future logins.</p>
        <label>
          New password
          <span className="studio-password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={10}
              autoComplete="new-password"
              autoFocus
            />
            <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        <label>
          Confirm password
          <input type={showPassword ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={10} autoComplete="new-password" />
        </label>
        {error && <p className="studio-error" role="alert">{error}</p>}
        <button className="studio-primary" type="submit" disabled={busy}>{busy ? 'Saving password…' : 'Save password & enter'}</button>
      </form>
    </main>
  )
}

function AccountSecurity({ email }: { email: string }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const savePassword = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setMessage('')
    setIsError(false)

    if (password.length < 10) {
      setIsError(true)
      setMessage('Use at least 10 characters.')
      return
    }
    if (password !== confirmation) {
      setIsError(true)
      setMessage('Those passwords don’t match yet.')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) {
      setIsError(true)
      setMessage(friendlyAuthError(error.message))
      return
    }

    setPassword('')
    setConfirmation('')
    setMessage('Password saved. Future logins can use it immediately.')
  }

  return (
    <section className="studio-section">
      <div className="studio-section-intro">
        <div><span>Account security</span><h2>Keep the keys to the Studio simple and private.</h2></div>
      </div>
      <div className="studio-account-grid">
        <article className="studio-account-card">
          <span>Signed-in owner</span>
          <h3>{email}</h3>
          <p>The session stays remembered on this browser. Use Sign out only on a shared device.</p>
        </article>
        <form className="studio-account-card studio-account-form" onSubmit={savePassword}>
          <span>Set or change password</span>
          <h3>A fresh Studio password</h3>
          <p>If you originally entered with a magic link, set your permanent password here before signing out.</p>
          <label>
            New password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required autoComplete="new-password" />
          </label>
          <label>
            Confirm password
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={10} required autoComplete="new-password" />
          </label>
          {message && <p className={isError ? 'studio-error' : 'studio-success'} role="status">{message}</p>}
          <button className="studio-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
        </form>
      </div>
    </section>
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
          <input lang="ka" value={draft.title_ka} onChange={(event) => update('title_ka', event.target.value)} required />
        </label>
        <label>
          English summary
          <textarea value={draft.description_en} onChange={(event) => update('description_en', event.target.value)} rows={4} />
        </label>
        <label>
          Georgian summary
          <textarea lang="ka" value={draft.description_ka} onChange={(event) => update('description_ka', event.target.value)} rows={4} />
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
  const [passwordSetup, setPasswordSetup] = useState(false)
  const [signedInEmail, setSignedInEmail] = useState('')
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
        setSignedInEmail('')
        setAuthState('signed-out')
        return
      }

      setAuthState('checking')
      const signedInEmail = data.session.user.email ?? ''
      setSignedInEmail(signedInEmail)
      const { data: admins } = await client
        .from('site_admins')
        .select('email')
      const isAllowed = admins?.some(
        (admin) => admin.email.toLowerCase() === signedInEmail.toLowerCase(),
      )
      setAuthState(isAllowed ? 'authorized' : 'unauthorized')
    }

    checkUser()
    const { data: subscription } = client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordSetup(true)
      window.setTimeout(() => void checkUser(), 0)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (authState !== 'authorized' || !supabase) return

    Promise.all([
      supabase.from('videos').select('*').order('sort_order', { ascending: true }),
      loadSiteConfig<Record<Language, Copy>>(),
    ]).then(([videoResult, config]) => {
      if (videoResult.data?.length) setVideos(videoResult.data as VideoItem[])
      if (config?.copy) setCopy(mergeCopyWithDefaults(config.copy))
      if (config?.brand) setBrand({ ...defaultBrand, ...config.brand })
    })
  }, [authState])

  useEffect(() => {
    if (authState !== 'authorized') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [authState, tab])

  const publishedCount = useMemo(() => videos.filter((video) => video.published).length, [videos])

  if (!isCmsConfigured) return <SetupRequired />
  if (authState === 'loading' || authState === 'checking') {
    return <main className="studio-loading"><img src={defaultBrand.logoUrl} alt="" /><span>Opening Mikle Studio…</span></main>
  }
  if (passwordSetup && authState === 'authorized') {
    return <PasswordSetup onComplete={() => setPasswordSetup(false)} />
  }
  if (authState === 'signed-out') {
    return <SignIn />
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
          <button data-mobile-label="Videos" className={tab === 'videos' ? 'is-active' : ''} onClick={() => setTab('videos')}><span>01</span> Videos</button>
          <button data-mobile-label="Website" className={tab === 'content' ? 'is-active' : ''} onClick={() => setTab('content')}><span>02</span> Website text</button>
          <button data-mobile-label="Brand" className={tab === 'brand' ? 'is-active' : ''} onClick={() => setTab('brand')}><span>03</span> Profile & brand</button>
          <button data-mobile-label="Account" className={tab === 'account' ? 'is-active' : ''} onClick={() => setTab('account')}><span>04</span> Account</button>
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
            <h1>{tab === 'videos' ? 'Field notes' : tab === 'content' ? 'Website words' : tab === 'brand' ? 'Identity' : 'Security'}</h1>
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
              <button type="button" className={editLanguage === 'en' ? 'is-active' : ''} onClick={() => setEditLanguage('en')}>English</button>
              <button type="button" className={editLanguage === 'ka' ? 'is-active' : ''} onClick={() => setEditLanguage('ka')}>ქართული</button>
            </div>
            <div className="studio-content-editor" lang={editLanguage === 'ka' ? 'ka' : 'en'}>
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
                <summary><span>{String(contentSections.length + 1).padStart(2, '0')}</span>The six pillars<i>+</i></summary>
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

        {tab === 'account' && <AccountSecurity email={signedInEmail} />}

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
                <label>Display name — Georgian<input lang="ka" value={brand.displayNameKa ?? ''} onChange={(event) => setBrand((current) => ({ ...current, displayNameKa: event.target.value }))} /></label>
                <label>Short wordmark — English<input value={brand.wordmark} onChange={(event) => setBrand((current) => ({ ...current, wordmark: event.target.value }))} /></label>
                <label>Short wordmark — Georgian<input lang="ka" value={brand.wordmarkKa} onChange={(event) => setBrand((current) => ({ ...current, wordmarkKa: event.target.value }))} /></label>
                <label>Location — English<input value={brand.location} onChange={(event) => setBrand((current) => ({ ...current, location: event.target.value }))} /></label>
                <label>Location — Georgian<input lang="ka" value={brand.locationKa} onChange={(event) => setBrand((current) => ({ ...current, locationKa: event.target.value }))} /></label>
                <label>Instagram handle<input value={brand.instagramHandle} onChange={(event) => setBrand((current) => ({ ...current, instagramHandle: event.target.value }))} placeholder="@mikle.hyw" /></label>
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
