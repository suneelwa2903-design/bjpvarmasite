"use client"

import { useEffect, useRef, useState } from "react"
import { loadXWidgets } from "@/lib/xWidgets"
import { useInViewOnce } from "@/hooks/useInViewOnce"

declare global {
  interface Window {
    twttr?: { widgets?: any }
  }
}

type Props = {
  username?: string
  theme?: "light" | "dark"
  height?: number
}

export default function XLatestTweet({ username = "BjpVarma", theme = "light", height }: Props) {
  const wrapper = useRef<HTMLDivElement | null>(null)
  const { ref, inView } = useInViewOnce<HTMLDivElement>()
  const [state, setState] = useState<"idle" | "loading" | "ok" | "fallback">("idle")
  const createdOnceRef = useRef(false)

  useEffect(() => {
    if (!wrapper.current && ref.current) wrapper.current = ref.current
  }, [ref])

  useEffect(() => {
    if (!inView) return
    if (createdOnceRef.current) return
    createdOnceRef.current = true

    let canceled = false

    const create = async (attempt = 1) => {
      setState("loading")
      try {
        await loadXWidgets()
        if (canceled || !wrapper.current) return
        wrapper.current.innerHTML = ""
        const result = await window.twttr!.widgets.createTimeline(
          { sourceType: "profile", screenName: username },
          wrapper.current,
          { tweetLimit: 1, chrome: "noheader nofooter noborders transparent", theme, dnt: true, height }
        )
        if (!result) {
          if (attempt <= 3) {
            setTimeout(() => !canceled && create(attempt + 1), 10000 * attempt)
          } else {
            setState("fallback")
          }
          return
        }
        setState("ok")
      } catch {
        if (attempt <= 3) {
          setTimeout(() => !canceled && create(attempt + 1), 10000 * attempt)
        } else {
          setState("fallback")
        }
      }
    }

    create()
    return () => {
      canceled = true
    }
  }, [inView, theme, username, height])

  return (
    <div ref={ref} className="rounded-md overflow-hidden bg-transparent">
      <div className="bg-white rounded-md p-2 min-h-[140px]" ref={wrapper} />
      {state !== "ok" && (
        <div className="p-3 text-sm text-white/80">
          {state === "loading" && "Loading latest post…"}
          {state === "fallback" && (
            <a href={`https://twitter.com/${username}`} target="_blank" rel="noreferrer" className="underline">
              View latest post on X (@{username})
            </a>
          )}
        </div>
      )}
    </div>
  )
}
