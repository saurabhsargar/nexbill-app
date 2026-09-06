import { useRef, useState } from "react"

/**
 * Derives local editable form state from an async-loaded source (e.g. a React Query
 * result), re-syncing only when the source reference actually changes. React Query's
 * structural sharing means the reference is stable across refetches with identical
 * content, so this won't clobber in-progress edits — only genuine data changes (initial
 * load, or a value changing after a save) trigger a re-sync. Runs during render rather
 * than in an effect, per React's "adjusting state when a prop changes" pattern.
 */
export function useSyncedState<TSource, TForm>(
  source: TSource | null | undefined,
  toForm: (source: TSource) => TForm,
  initialForm: TForm
) {
  const [form, setForm] = useState<TForm>(initialForm)
  const syncedRef = useRef<TSource | null | undefined>(undefined)

  // Idempotent "previous render" comparison — React's documented pattern for adjusting
  // state when a value changes, safe to mutate a ref during render here. See:
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  // eslint-disable-next-line react-hooks/refs
  if (source && source !== syncedRef.current) {
    // eslint-disable-next-line react-hooks/refs
    syncedRef.current = source
    setForm(toForm(source))
  }

  return [form, setForm] as const
}

/** Runs `reset()` synchronously during render whenever `open` transitions false -> true. */
export function useResetOnOpen(open: boolean, reset: () => void) {
  const wasOpen = useRef(open)
  // eslint-disable-next-line react-hooks/refs -- idempotent previous-render comparison, see useSyncedState above
  if (open && !wasOpen.current) {
    reset()
  }
  // eslint-disable-next-line react-hooks/refs
  wasOpen.current = open
}
