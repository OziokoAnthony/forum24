import { useEffect, useRef, useState } from 'react'
import {
  Captions,
  ExternalLink,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Video as VideoIcon,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { Video } from '../../data/content'
import { Cover } from '../ui/Cover'

function toSeconds(stamp: string) {
  return stamp
    .split(':')
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0)
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const padded = (value: number) => String(value).padStart(2, '0')
  return hours ? `${hours}:${padded(minutes)}:${padded(secs)}` : `${minutes}:${padded(secs)}`
}

const iconButton =
  'grid h-10 w-10 place-items-center rounded-md text-white/90 transition hover:bg-white/15 hover:text-white'

/**
 * Inline player for the Learning Centre.
 *
 * The prototype has no video file, so playback is simulated: progress advances
 * on a timer, chapters seek, and captions follow the transcript. Everything is
 * a native button or range input, so the whole player is keyboard operable.
 * Production swaps the media layer for the provider embed and keeps this shell.
 */
export function VideoPlayer({ video }: { video: Video }) {
  const duration = Math.max(toSeconds(video.duration), 1)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [muted, setMuted] = useState(false)
  const [captions, setCaptions] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)

  const ended = current >= duration
  const percent = Math.min(100, (current / duration) * 100)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setCurrent((value) => Math.min(duration, value + 0.25))
    }, 250)
    return () => window.clearInterval(id)
  }, [playing, duration])

  useEffect(() => {
    if (current >= duration) setPlaying(false)
  }, [current, duration])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === shellRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!video.embeddable) {
    return (
      <div className="rounded-control border border-line bg-panel p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mist text-sky-700">
          <VideoIcon size={22} aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-lg font-extrabold">This video can’t be played here</h3>
        <p className="mx-auto mt-1 max-w-[46ch] text-sm text-ink-soft">
          The provider does not allow embedding for this video. You can still watch it on{' '}
          {video.provider}.
        </p>
        <a
          href="https://example.com"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex items-center gap-2 font-bold text-sky-700 hover:underline"
        >
          Watch on {video.provider}
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    )
  }

  function togglePlay() {
    if (ended) {
      setCurrent(0)
      setPlaying(true)
      return
    }
    setPlaying((value) => !value)
  }

  async function toggleFullscreen() {
    if (!shellRef.current) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await shellRef.current.requestFullscreen()
    } catch {
      // Some browsers refuse fullscreen outside a user gesture; the button stays.
    }
  }

  const chapterIndex = video.chapters.reduce(
    (active, chapter, index) => (toSeconds(chapter.at) <= current ? index : active),
    0,
  )
  const captionIndex = Math.min(
    video.transcript.length - 1,
    Math.floor((current / duration) * video.transcript.length),
  )
  const caption = video.transcript[captionIndex]

  return (
    <div className="overflow-hidden rounded-control border border-line bg-panel shadow-card">
      <div
        ref={shellRef}
        className="video-shell group relative aspect-video bg-slate-950"
      >
        <Cover tone={video.cover} className="absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-slate-950/55" />

        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-10 grid place-items-center"
            aria-label={ended ? `Replay ${video.title}` : `Play ${video.title}`}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-sky-600 text-white shadow-[inset_0_2px_0_rgb(255_255_255_/_0.4),0_5px_0_#0d3f7d,0_16px_26px_-12px_rgb(26_111_216_/_0.9)] transition group-hover:scale-105">
              {ended ? (
                <RotateCcw size={26} aria-hidden="true" />
              ) : (
                <Play size={26} fill="currentColor" aria-hidden="true" className="ml-1" />
              )}
            </span>
          </button>
        )}

        {captions && current > 0 && !ended && (
          <p className="pointer-events-none absolute inset-x-4 bottom-[76px] z-20 mx-auto max-w-[54ch] rounded-md bg-slate-950/85 px-3 py-1.5 text-center text-[13px] leading-snug font-medium text-white sm:text-sm">
            {caption}
          </p>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-slate-950/95 via-slate-950/70 to-transparent px-3 pt-10 pb-2">
          <input
            type="range"
            min={0}
            max={duration}
            step={1}
            value={Math.round(current)}
            onChange={(event) => setCurrent(Number(event.target.value))}
            className="player-range w-full"
            style={{
              backgroundImage: `linear-gradient(to right, #3fa9ea 0%, #3fa9ea ${percent}%, rgb(255 255 255 / 0.28) ${percent}%, rgb(255 255 255 / 0.28) 100%)`,
            }}
            aria-label={`Seek within ${video.title}`}
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
          />

          <div className="mt-1 flex items-center gap-0.5">
            <button
              type="button"
              onClick={togglePlay}
              className={iconButton}
              aria-label={playing ? 'Pause video' : ended ? 'Replay video' : 'Play video'}
            >
              {playing ? (
                <Pause size={18} fill="currentColor" aria-hidden="true" />
              ) : ended ? (
                <RotateCcw size={17} aria-hidden="true" />
              ) : (
                <Play size={18} fill="currentColor" aria-hidden="true" />
              )}
            </button>

            <span className="ml-1 text-[11px] font-semibold tabular-nums text-white/90">
              {formatTime(current)} <span className="text-white/50">/</span> {formatTime(duration)}
            </span>

            {muted && (
              <span className="ml-2 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white/90 uppercase">
                Muted
              </span>
            )}

            <span className="flex-1" />

            <button
              type="button"
              onClick={() => setCaptions((value) => !value)}
              className={`${iconButton} ${captions ? 'text-sky-300' : 'text-white/60'}`}
              aria-label={captions ? 'Turn captions off' : 'Turn captions on'}
              aria-pressed={captions}
            >
              <Captions size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              className={iconButton}
              aria-label={muted ? 'Unmute video' : 'Mute video'}
              aria-pressed={muted}
            >
              {muted ? (
                <VolumeX size={18} aria-hidden="true" />
              ) : (
                <Volume2 size={18} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className={iconButton}
              aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'}
              aria-pressed={fullscreen}
            >
              {fullscreen ? (
                <Minimize size={17} aria-hidden="true" />
              ) : (
                <Maximize size={17} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-panel">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-3 pt-2.5">
          <h2 className="text-[12px] font-extrabold tracking-[0.06em] text-ink-muted uppercase">
            Chapters
          </h2>
          <p className="text-[11px] font-medium text-ink-muted">
            Prototype player · progress simulated
          </p>
        </div>

        <ol className="mt-1.5 flex gap-2 overflow-x-auto px-3 pb-3">
          {video.chapters.map((chapter, index) => {
            const active = index === chapterIndex && current > 0
            return (
              <li key={chapter.at} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCurrent(toSeconds(chapter.at))
                    setPlaying(true)
                  }}
                  aria-current={active ? 'true' : undefined}
                  className={`flex items-center gap-2 rounded-control border px-2.5 py-1.5 text-left text-[12px] font-semibold transition ${
                    active
                      ? 'border-sky-300 bg-sky-50 text-sky-800'
                      : 'border-line bg-cloud text-ink-soft hover:border-sky-300 hover:text-sky-800'
                  }`}
                >
                  <span className="tabular-nums text-ink-muted">{chapter.at}</span>
                  <span className="whitespace-nowrap">{chapter.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
