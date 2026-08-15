import { createClient } from '@supabase/supabase-js'
import type { SiteBrand, VideoItem } from '../data'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCmsConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isCmsConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export type SiteConfig<TCopy> = {
  copy: TCopy
  brand: SiteBrand
}

export async function loadPublishedVideos() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as VideoItem[]
}

export async function loadSiteConfig<TCopy>() {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_config')
    .maybeSingle()

  if (error) throw error
  return (data?.value ?? null) as SiteConfig<TCopy> | null
}

export async function uploadMedia(file: File, folder: 'videos' | 'thumbnails' | 'brand') {
  if (!supabase) throw new Error('The content studio is not connected yet.')

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '')
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
