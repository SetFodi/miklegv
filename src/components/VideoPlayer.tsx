import { useEffect } from 'react'
import type { Language, VideoItem } from '../data'
import { instagramEmbedUrl } from '../data'

type VideoPlayerProps = {
  video: VideoItem
  language: Language
  onClose: () => void
}

export default function VideoPlayer({ video, language, onClose }: VideoPlayerProps) {
  const title = language === 'ka' ? video.title_ka : video.title_en
  const description = language === 'ka' ? video.description_ka : video.description_en

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div className="video-modal" role="presentation" onMouseDown={onClose}>
      <div
        className="video-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="video-dialog-bar">
          <div>
            <span>{language === 'ka' ? 'ახლა უყურებ' : 'Now watching'}</span>
            <strong id="video-dialog-title">{title}</strong>
          </div>
          <button type="button" onClick={onClose} aria-label={language === 'ka' ? 'დახურვა' : 'Close player'}>
            <span />
            <span />
          </button>
        </div>

        <div className={`video-stage video-stage-${video.source_type}`}>
          {video.source_type === 'instagram' ? (
            <iframe
              src={instagramEmbedUrl(video.source_url)}
              title={title}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video poster={video.thumbnail_url} controls autoPlay playsInline preload="metadata">
              <source
                src={video.source_url}
                type={video.source_url.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'}
              />
              {video.fallback_url && <source src={video.fallback_url} type="video/mp4" />}
              {language === 'ka' ? 'თქვენი ბრაუზერი ვიდეოს ვერ აჩვენებს.' : 'Your browser cannot play this video.'}
            </video>
          )}
        </div>

        <div className="video-dialog-footer">
          <p>{description}</p>
          <div>
            <span>{video.duration}</span>
            <span>{video.language}</span>
            {video.source_type === 'instagram' && (
              <a href={video.source_url} target="_blank" rel="noreferrer">
                {language === 'ka' ? 'Instagram-ზე ნახვა ↗' : 'View on Instagram ↗'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
