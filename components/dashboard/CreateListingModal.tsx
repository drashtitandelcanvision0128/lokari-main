'use client'

import { useState, useRef, useCallback, useEffect, Fragment } from 'react'
import { apiUrl, getAuthToken } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props { open: boolean; onClose: () => void; onSuccess?: () => void }
type PriceType = 'FIXED_PRICE' | 'NEGOTIABLE' | 'AUCTION'

interface FormState {
  title: string; description: string; cropType: string; variety: string
  qualityGrade: string; harvestDate: string; quantity: string; unit: string; minOrder: string; minOrderUnit: string
  street: string; city: string; state: string; pincode: string; country: string
  priceType: PriceType; price: string; startingBid: string; auctionEnd: string
}
type FE = Partial<Record<keyof FormState | 'images' | 'general', string>>

const INIT: FormState = {
  title: '', description: '', cropType: '', variety: '', qualityGrade: 'A', harvestDate: '',
  quantity: '', unit: 'Quintal', minOrder: '', minOrderUnit: 'Quintal',
  street: '', city: '', state: '', pincode: '', country: 'India',
  priceType: 'FIXED_PRICE', price: '', startingBid: '', auctionEnd: '',
}

const GRADES  = ['A', 'B', 'C', 'Premium', 'Grade 1', 'Grade 2']
const UNITS   = ['Kg', 'Quintal', 'Ton', 'Pieces', 'Bags', 'Crates', 'Liters']
const STATES  = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh',
]
const MAX_IMG = 5
const MAX_MB  = 5

const STEPS = [
  { label: 'Crop Info', icon: 'agriculture'   },
  { label: 'Quantity',  icon: 'inventory_2'   },
  { label: 'Pricing',   icon: 'sell'          },
  { label: 'Photos',    icon: 'photo_library' },
]

// ─── Shared design atoms ──────────────────────────────────────────────────────

/** Label with a material icon, matching EditUserListingModal style */
function FieldLabel({ icon, label, required }: { icon: string; label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0b5d68]/70">
      <span className="material-symbols-outlined text-[#2eb5c2]" style={{ fontSize: '16px' }}>{icon}</span>
      {label}
      {required && <span className="ml-0.5 text-red-500 normal-case">*</span>}
    </label>
  )
}

/** Premium input matching edit modal */
const premiumCls = (err?: string) =>
  `w-full px-3.5 py-2.5 rounded-md text-sm text-[#1a1a1a] bg-white border placeholder:text-[#bbb] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ${
    err ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-[#e2e8ea] focus:ring-2 focus:ring-[#2eb5c2]/30 focus:border-[#2eb5c2]'
  }`

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-[11px] text-red-500">{msg}</p> : null
}

/** Section card matching edit modal */
function SectionCard({ title, icon, children, action }: {
  title: string; icon?: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e8ecee] bg-white shadow-[0_1px_4px_rgba(11,93,104,0.06)]">
      <div className="flex items-center justify-between border-b border-[#f0f4f5] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-[#2eb5c2]" style={{ fontSize: '20px' }}>{icon}</span>}
          <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[#0b5d68]">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Step 1: Crop Info ────────────────────────────────────────────────────────

function S1({ form, errors, set }: { form: FormState; errors: FE; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Listing Details" icon="edit_note">
        <div className="space-y-3">
          <div>
            <FieldLabel icon="title" label="Listing Title" required />
            <input type="text" placeholder="e.g. Fresh Wheat Grade A — 50 Quintal"
              value={form.title} onChange={e => set('title', e.target.value)}
              maxLength={120} className={premiumCls(errors.title)} />
            <Err msg={errors.title} />
          </div>
          <div>
            <FieldLabel icon="notes" label="Description" />
            <textarea rows={3} placeholder="Quality, certifications, growing conditions…"
              value={form.description} onChange={e => set('description', e.target.value)}
              maxLength={1000} className={`${premiumCls()} resize-none`} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Crop Details" icon="agriculture">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="grass" label="Crop Type" required />
            <input type="text" placeholder="Wheat, Rice…"
              value={form.cropType} onChange={e => set('cropType', e.target.value)}
              className={premiumCls(errors.cropType)} />
            <Err msg={errors.cropType} />
          </div>
          <div>
            <FieldLabel icon="eco" label="Variety" />
            <input type="text" placeholder="Sharbati, Basmati…"
              value={form.variety} onChange={e => set('variety', e.target.value)}
              className={premiumCls()} />
          </div>
          <div>
            <FieldLabel icon="grade" label="Quality Grade" />
            <select value={form.qualityGrade} onChange={e => set('qualityGrade', e.target.value)} className={premiumCls()}>
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel icon="calendar_today" label="Harvest Date" />
            <input type="date" value={form.harvestDate}
              onChange={e => set('harvestDate', e.target.value)} className={premiumCls()} />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Step 2: Quantity & Location ──────────────────────────────────────────────

function S2({ form, errors, set }: { form: FormState; errors: FE; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Quantity" icon="inventory_2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="scale" label="Quantity" required />
            <input type="number" min="1" placeholder="50"
              value={form.quantity} onChange={e => set('quantity', e.target.value)}
              className={premiumCls(errors.quantity)} />
            <Err msg={errors.quantity} />
          </div>
          <div>
            <FieldLabel icon="straighten" label="Unit" />
            <select value={form.unit} onChange={e => set('unit', e.target.value)} className={premiumCls()}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel icon="production_quantity_limits" label="Min. Order" />
            <input type="number" min="1" placeholder="5"
              value={form.minOrder} onChange={e => set('minOrder', e.target.value)}
              className={premiumCls(errors.minOrder)} />
            <Err msg={errors.minOrder} />
          </div>
          <div>
            <FieldLabel icon="straighten" label="Min. Order Unit" />
            <select value={form.minOrderUnit} onChange={e => set('minOrderUnit', e.target.value)} className={premiumCls()}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Location" icon="location_on">
        <div className="space-y-3">
          <div>
            <FieldLabel icon="signpost" label="Street / Village" />
            <input type="text" placeholder="e.g. 12, Gandhi Nagar or Village Rampur"
              value={form.street} onChange={e => set('street', e.target.value)}
              className={premiumCls()} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <FieldLabel icon="apartment" label="City" required />
              <input type="text" placeholder="City"
                value={form.city} onChange={e => set('city', e.target.value)}
                className={premiumCls(errors.city)} />
              <Err msg={errors.city} />
            </div>
            <div>
              <FieldLabel icon="map" label="State" required />
              <select value={form.state} onChange={e => set('state', e.target.value)} className={premiumCls(errors.state)}>
                <option value="">Select</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              <Err msg={errors.state} />
            </div>
            <div>
              <FieldLabel icon="pin" label="Pincode" />
              <input type="text" maxLength={6} placeholder="110001"
                value={form.pincode}
                onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
                className={premiumCls(errors.pincode)} />
              <Err msg={errors.pincode} />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Step 3: Pricing ──────────────────────────────────────────────────────────

function S3({ form, errors, set }: { form: FormState; errors: FE; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Selling Method" icon="sell">
        {/* Tab toggle */}
        <div className="flex rounded-md border border-[#e2e8ea] p-0.5 mb-4">
          {(['FIXED_PRICE', 'NEGOTIABLE', 'AUCTION'] as PriceType[]).map(pt => (
            <button key={pt} type="button" onClick={() => set('priceType', pt)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded py-2 text-xs font-semibold transition-all ${
                form.priceType === pt
                  ? 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white shadow-sm'
                  : 'text-[#888] hover:text-[#0b5d68]'
              }`}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {pt === 'FIXED_PRICE' ? 'sell' : pt === 'NEGOTIABLE' ? 'handshake' : 'gavel'}
              </span>
              {pt === 'FIXED_PRICE' ? 'Fixed Price' : pt === 'NEGOTIABLE' ? 'Negotiable' : 'Auction'}
            </button>
          ))}
        </div>

        {/* Fixed / Negotiable */}
        {(form.priceType === 'FIXED_PRICE' || form.priceType === 'NEGOTIABLE') && (
          <div>
            <FieldLabel icon="payments"
              label={form.priceType === 'FIXED_PRICE' ? `Price (₹ per ${form.unit})` : `Expected Price (₹ per ${form.unit})`}
              required={form.priceType === 'FIXED_PRICE'} />
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2eb5c2]">₹</span>
              <input type="number" min="1" placeholder="2500"
                value={form.price} onChange={e => set('price', e.target.value)}
                className={`${premiumCls(errors.price)} pl-7`} />
            </div>
            <Err msg={errors.price} />
            {form.priceType === 'NEGOTIABLE' && (
              <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                Buyers can contact you to negotiate before purchasing.
              </p>
            )}
          </div>
        )}

        {/* Auction */}
        {form.priceType === 'AUCTION' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="gavel" label="Starting Bid (₹)" required />
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2eb5c2]">₹</span>
                <input type="number" min="1" placeholder="2000"
                  value={form.startingBid} onChange={e => set('startingBid', e.target.value)}
                  className={`${premiumCls(errors.startingBid)} pl-7`} />
              </div>
              <Err msg={errors.startingBid} />
            </div>
            <div>
              <FieldLabel icon="event" label="Auction Ends On" required />
              <input type="date" value={form.auctionEnd}
                onChange={e => set('auctionEnd', e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className={premiumCls(errors.auctionEnd)} />
              <Err msg={errors.auctionEnd} />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Step 4: Photos ───────────────────────────────────────────────────────────

function S4({ images, previews, errors, dragOver, onDrop, onDragOver, onDragLeave, onFileInput, onRemove, fileRef, publishNow, onTogglePublish, showImageError }: {
  images: File[]; previews: string[]; errors: FE; dragOver: boolean
  onDrop: (e: React.DragEvent) => void; onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void; onFileInput: (f: FileList) => void
  onRemove: (i: number) => void; fileRef: React.RefObject<HTMLInputElement>
  publishNow: boolean; onTogglePublish: () => void
  showImageError: boolean
}) {
  return (
    <div className="space-y-4">
      <SectionCard title="Product Photos" icon="photo_library">
        {/* Upload zone */}
        <div
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-8 transition-colors ${
            dragOver
              ? 'border-[#2eb5c2] bg-[#2eb5c2]/5'
              : showImageError && errors.images
              ? 'border-red-300 bg-red-50/60'
              : 'border-[#e2e8ea] bg-[#f7f9fa] hover:border-[#2eb5c2]/50 hover:bg-[#eef8f9]'
          }`}
        >
          <span className="material-symbols-outlined mb-2 text-[#2eb5c2]" style={{ fontSize: '36px' }}>cloud_upload</span>
          <p className="text-sm font-semibold text-[#0b5d68]">
            {dragOver ? 'Drop here' : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-xs text-[#999]">PNG, JPG, WEBP · {MAX_MB} MB max · up to {MAX_IMG} images</p>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
            onChange={e => e.target.files && onFileInput(e.target.files)} />
        </div>
        {showImageError && <Err msg={errors.images} />}

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {previews.map((src, i) => (
              <div key={src} className="group relative aspect-square overflow-hidden rounded-md border border-[#e8ecee]">
                <img src={src} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0b5d68]/80 py-px text-center text-[8px] font-bold text-white">
                    Cover
                  </div>
                )}
                <button type="button" onClick={e => { e.stopPropagation(); onRemove(i) }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500">
                  <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
                </button>
              </div>
            ))}
            {images.length < MAX_IMG && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-[#e2e8ea] text-[#bbb] hover:border-[#2eb5c2] hover:text-[#2eb5c2]">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
              </button>
            )}
          </div>
        )}
      </SectionCard>

      {/* Publish toggle */}
      <SectionCard title="Visibility" icon="visibility">
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={publishNow} onChange={onTogglePublish}
            className="h-4 w-4 cursor-pointer accent-[#0b5d68]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0b5d68]">Publish immediately</p>
            <p className="text-xs text-[#999]">Listing goes live as soon as it's submitted</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            publishNow ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}>{publishNow ? 'Live' : 'Draft'}</span>
        </label>
      </SectionCard>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function CreateListingModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep]             = useState(0)
  const [form, setForm]             = useState<FormState>(INIT)
  const [images, setImages]         = useState<File[]>([])
  const [previews, setPreviews]     = useState<string[]>([])
  const [errors, setErrors]         = useState<FE>({})
  const [submitting, setSubmitting]       = useState(false)
  const [success, setSuccess]             = useState(false)
  const [dragOver, setDragOver]           = useState(false)
  const [publishNow, setPublishNow]       = useState(true)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (open) {
      setStep(0); setForm(INIT); setImages([]); setPreviews([])
      setErrors({}); setSuccess(false); setSubmitting(false); setPublishNow(true); setSubmitAttempted(false)
    }
  }, [open])

  useEffect(() => () => { previews.forEach(URL.revokeObjectURL) }, [previews])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler) }
  }, [open, onClose])

  const set = (k: keyof FormState, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: undefined }))
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const valid: File[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue
      if (f.size > MAX_MB * 1024 * 1024) { setErrors(p => ({ ...p, images: `"${f.name}" exceeds ${MAX_MB} MB.` })); continue }
      valid.push(f)
    }
    setImages(prev => {
      const merged = [...prev, ...valid].slice(0, MAX_IMG)
      setPreviews(() => merged.map(f => URL.createObjectURL(f)))
      return merged
    })
    setErrors(p => ({ ...p, images: undefined }))
  }, [])

  const removeImage = (i: number) => {
    setImages(prev => { const n = prev.filter((_, j) => j !== i); setPreviews(() => n.map(f => URL.createObjectURL(f))); return n })
  }

  function validate(s: number): FE {
    const e: FE = {}
    if (s === 0) {
      if (!form.title.trim())    e.title    = 'Required.'
      if (!form.cropType.trim()) e.cropType = 'Required.'
    }
    if (s === 1) {
      if (!form.quantity || isNaN(+form.quantity) || +form.quantity <= 0) e.quantity = 'Enter a valid quantity.'
      if (!form.city.trim()) e.city  = 'Required.'
      if (!form.state)       e.state = 'Required.'
      if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = '6 digits.'
    }
    if (s === 2) {
      if (form.priceType === 'FIXED_PRICE') {
        if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Enter a valid price.'
      } else if (form.priceType === 'AUCTION') {
        if (!form.startingBid || isNaN(+form.startingBid) || +form.startingBid <= 0) e.startingBid = 'Required.'
        if (!form.auctionEnd) e.auctionEnd = 'Required.'
      }
    }
    if (s === 3 && images.length === 0) e.images = 'Upload at least one image.'
    return e
  }

  function next() { const e = validate(step); if (Object.keys(e).length) { setErrors(e); return }; setErrors({}); setStep(s => s + 1) }
  function back() { setErrors({}); setStep(s => s - 1) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    const errs = validate(3)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true); setErrors({})
    try {
      const payload: Record<string, unknown> = {
        type: 'PRODUCE',
        title: form.title.trim(),
        description: form.description.trim(),
        crop_type: form.cropType.trim(),
        variety: form.variety.trim() || undefined,
        quality_grade: form.qualityGrade,
        quantity: +form.quantity,
        unit: form.unit,
        harvest_date: form.harvestDate || undefined,
        min_order_quantity: form.minOrder ? +form.minOrder : undefined,
        min_order_unit: form.minOrder ? form.minOrderUnit : undefined,
        address: {
          street: form.street.trim() || null,
          city: form.city.trim(),
          state: form.state,
          pincode: form.pincode.trim(),
          country: form.country || 'India',
        },
        price_type: form.priceType,
        status: publishNow ? 'ACTIVE' : 'DRAFT',
      }
      if (form.priceType === 'FIXED_PRICE' || form.priceType === 'NEGOTIABLE') {
        payload.price = form.price ? +form.price : 0
      } else {
        payload.price = +form.startingBid
        payload.starting_bid = +form.startingBid
        if (form.auctionEnd) payload.auction_end = form.auctionEnd
      }
      const fd = new FormData()
      fd.append('data', JSON.stringify(payload))
      images.forEach(img => fd.append('product_images', img))
      const token = getAuthToken()
      const res   = await fetch(apiUrl('/listings'), { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd })
      const json  = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to create listing.')
      setSuccess(true)
      setTimeout(() => { onClose(); onSuccess?.() }, 1600)
    } catch (err: any) {
      setErrors({ general: err.message || 'Something went wrong.' })
    } finally { setSubmitting(false) }
  }

  if (!open) return null
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(10, 30, 35, 0.55)', backdropFilter: 'blur(6px)' }}>

      {/* Backdrop */}
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />

      {/* Modal shell */}
      <div className="relative z-10 flex w-full max-w-3xl max-h-[96vh] flex-col overflow-hidden rounded-md bg-[#f7f9fa] shadow-[0_32px_80px_rgba(11,93,104,0.18),0_0_0_1px_rgba(11,93,104,0.08)]">

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between bg-white border-b border-[#edf1f3] px-6 pt-6 pb-4 shrink-0">
          {/* Teal accent bar */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0b5d68] via-[#2eb5c2] to-[#2eb5c2]/30" />

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>add_circle</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b5d68] leading-tight">New Listing</h2>
              <p className="text-xs text-[#888] mt-0.5">Post your produce to the marketplace</p>
            </div>
          </div>

          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-[#999] hover:text-[#0b5d68] hover:bg-[#f0f4f5] transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* ── Stepper ── */}
        {!success && (
          <div className="shrink-0 bg-white border-b border-[#edf1f3] px-6 py-3">
            <div className="flex items-center justify-center gap-0">
              {STEPS.map((s, i) => {
                const done = i < step; const cur = i === step
                return (
                  <Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md border-2 transition-all duration-300 ${
                        done ? 'border-[#2eb5c2] bg-[#2eb5c2]'
                        : cur  ? 'border-[#0b5d68] bg-[#0b5d68] scale-110 shadow-[0_0_0_3px_rgba(11,93,104,0.12)]'
                        : 'border-[#e2e8ea] bg-white'
                      }`}>
                        <span className="material-symbols-outlined select-none leading-none"
                          style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1", color: done || cur ? '#fff' : '#bbb' }}>
                          {done ? 'check' : s.icon}
                        </span>
                      </div>
                      <span className={`whitespace-nowrap text-[9px] font-bold uppercase tracking-wide ${
                        cur ? 'text-[#0b5d68]' : done ? 'text-[#2eb5c2]' : 'text-[#bbb]'
                      }`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`mt-3.5 h-px w-16 shrink-0 transition-all duration-500 ${done ? 'bg-[#2eb5c2]' : 'bg-[#e2e8ea]'}`} />
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {success && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 bg-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#0b5d68]">Listing Created!</p>
              <p className="mt-1 text-sm text-[#888]">Your produce has been posted to the marketplace.</p>
            </div>
          </div>
        )}

        {/* ── Form body ── */}
        {!success && (
          <form onSubmit={submit} noValidate className="contents">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {errors.general && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <span className="material-symbols-outlined mt-0.5 shrink-0" style={{ fontSize: '16px' }}>error</span>
                  {errors.general}
                </div>
              )}
              {step === 0 && <S1 form={form} errors={errors} set={set} />}
              {step === 1 && <S2 form={form} errors={errors} set={set} />}
              {step === 2 && <S3 form={form} errors={errors} set={set} />}
              {step === 3 && (
                <S4 errors={errors} images={images} previews={previews}
                  dragOver={dragOver} fileRef={fileRef}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onFileInput={addFiles} onRemove={removeImage}
                  publishNow={publishNow} onTogglePublish={() => setPublishNow(p => !p)}
                  showImageError={submitAttempted}
                />
              )}
            </div>

            {/* ── Sticky footer ── */}
            <div className="shrink-0 bg-white border-t border-[#edf1f3] px-6 py-4 flex items-center justify-between gap-3">
              <p className="hidden text-xs text-[#aaa] sm:block">Step {step + 1} of {STEPS.length}</p>
              <div className="flex items-center gap-3 ml-auto">
                {step === 0 ? (
                  <button type="button" onClick={onClose}
                    className="px-5 py-2.5 rounded-md text-sm font-semibold text-[#555] border border-[#e0e4e6] bg-white hover:bg-[#f5f7f8] hover:border-[#cdd3d6] transition-colors">
                    Cancel
                  </button>
                ) : (
                  <button type="button" onClick={back} disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-semibold text-[#555] border border-[#e0e4e6] bg-white hover:bg-[#f5f7f8] hover:border-[#cdd3d6] transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>Back
                  </button>
                )}
                {isLast ? (
                  <button type="submit" disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] hover:from-[#0a5260] hover:to-[#28a8b4] active:scale-[0.98] shadow-[0_2px_12px_rgba(46,181,194,0.35)] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting
                      ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Posting…</>
                      : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>publish</span>Post Listing</>}
                  </button>
                ) : (
                  <button type="button" onClick={next}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] hover:from-[#0a5260] hover:to-[#28a8b4] active:scale-[0.98] shadow-[0_2px_12px_rgba(46,181,194,0.35)] transition-all">
                    Next<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
