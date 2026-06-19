'use client'

/** Placeholder while auth hydrates — prevents blank flash on guest-only routes. */
export default function GuestPageShell() {
  return (
    <div className="min-h-screen bg-[#f9f9f7] animate-pulse">
      <div className="mx-auto max-w-2xl px-8 pt-24">
        <div className="mb-8 h-8 w-48 rounded-[0.3125rem] bg-gray-200" />
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-8">
          <div className="h-10 rounded-[0.3125rem] bg-gray-100" />
          <div className="h-10 rounded-[0.3125rem] bg-gray-100" />
          <div className="h-10 rounded-[0.3125rem] bg-gray-100" />
        </div>
      </div>
    </div>
  )
}
