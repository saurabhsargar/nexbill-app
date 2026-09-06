"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, X, UserPlus, Loader2 } from "lucide-react"
import { useCreateCustomer, useCustomerSearch } from "@/hooks/queries/use-customers"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { Customer } from "@/types/customer"

interface Props {
  value: Customer | null
  onChange: (customer: Customer | null) => void
}

export function CustomerPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPhone, setNewPhone] = useState("")
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedQuery = useDebouncedValue(query, 300)
  const { data: results, isFetching } = useCustomerSearch(
    debouncedQuery || undefined,
    open && !value
  )
  const createCustomer = useCreateCustomer()

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {
      setOpen(false)
      setCreating(false)
    }, 150)
  }
  const cancelBlur = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
  }

  if (value) {
    return (
      <div className="relative mt-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
        <User className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{value.name}</p>
          {value.phone && <p className="text-xs text-muted-foreground truncate">{value.phone}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={() => {
            onChange(null)
            setQuery("")
          }}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative mt-2" onBlur={handleBlur} onFocus={cancelBlur}>
      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="Customer name, phone (optional — leave blank for walk-in)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        className="h-9 pl-9 rounded-lg text-sm"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden">
          {isFetching ? (
            <div className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Searching…
            </div>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto">
                {(results ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(c)
                      setOpen(false)
                    }}
                  >
                    <span className="font-medium">{c.name}</span>
                    {(c.phone || c.email) && (
                      <span className="text-xs text-muted-foreground">
                        {[c.phone, c.email].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </button>
                ))}
                {(results ?? []).length === 0 && !creating && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    {debouncedQuery ? "No matching customers" : "Start typing to search"}
                  </p>
                )}
              </div>
              {debouncedQuery.trim().length > 1 && (
                <div className="border-t p-2">
                  {creating ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Phone (optional)"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="h-8 text-xs"
                      />
                      <Button
                        size="sm"
                        className="w-full h-8 gap-1.5"
                        disabled={createCustomer.isPending}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          createCustomer.mutate(
                            { name: debouncedQuery.trim(), phone: newPhone || undefined },
                            {
                              onSuccess: (customer) => {
                                onChange(customer)
                                setOpen(false)
                                setCreating(false)
                              },
                            }
                          )
                        }}
                      >
                        {createCustomer.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="size-3.5" />
                        )}
                        Save &quot;{debouncedQuery.trim()}&quot;
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-500/10"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setCreating(true)}
                    >
                      <UserPlus className="size-3.5" />
                      Add &quot;{debouncedQuery.trim()}&quot; as new customer
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
