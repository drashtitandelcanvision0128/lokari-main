'use client'

import { useState, useRef, useCallback, useEffect, Fragment } from 'react'
import { apiUrl, getAuthToken } from '@/lib/api'
import { Icon } from '@/components/ui/Icon'

// ─── Animation keyframes ──────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes lk-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes lk-modal-in {
  from { opacity: 0; transform: scale(0.94) translateY(14px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
@keyframes lk-success-pop {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.15); }
  100% { transform: scale(1);   opacity: 1; }
}
`
let kfInjected = false
function injectKf() {
  if (typeof document === 'undefined' || kfInjected) return
  const s = document.createElement('style')
  s.textContent = KEYFRAMES
  document.head.appendChild(s)
  kfInjected = true
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props { open: boolean; onClose: () => void; onSuccess?: () => void }
type PriceType = 'FIXED_PRICE' | 'NEGOTIABLE' | 'AUCTION'

interface FormState {
  title: string; description: string; cropType: string; variety: string
  qualityGrade: string; harvestDate: string; quantity: string; unit: string; minOrder: string; minOrderUnit: string
  street: string; city: string; state: string; pincode: string; country: string
  priceType: PriceType; price: string; startingBid: string; reservePrice: string; auctionEnd: string
}
type FE = Partial<Record<keyof FormState | 'images' | 'general', string>>

const INIT: FormState = {
  title: '', description: '', cropType: '', variety: '', qualityGrade: 'A', harvestDate: '',
  quantity: '', unit: 'Quintal', minOrder: '', minOrderUnit: 'Quintal', street: '', city: '', state: '', pincode: '', country: 'India',
  priceType: 'FIXED_PRICE', price: '', startingBid: '', reservePrice: '', auctionEnd: '',
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

// ─── Shared atoms ─────────────────────────────────────────────────────────────

/** `rounded` = 4 px everywhere for inputs/buttons */
const BASE_INPUT =
  'w-full rounded border px-3 py-2 text-sm outline-none'
const OK_INPUT   =
  'border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
const ERR_INPUT  =
  'border-red-400 bg-red-50 dark:bg-red-900/20'

function fc(err?: string, extra = '') { return `${BASE_INPUT} ${err ? ERR_INPUT : OK_INPUT} ${extra}` }

function Lbl({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">
      {children}{req && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  )
}
function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null
}
function Divider({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-4 flex items-center gap-1.5">
      <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]">
        <Icon name={icon} className="text-[0.7rem] text-white" />
      </span>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0b5d68] dark:text-[#2eb5c2]">
        {children}
      </p>
      <div className="flex-1 border-t border-gray-100 dark:border-gray-700" />
    </div>
  )
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function S1({ form, errors, set }: { form: FormState; errors: FE; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-2">
      <Divider icon="edit_note">Listing Details</Divider>
      <div>
        <Lbl req>Listing Title</Lbl>
        <input type="text" placeholder="e.g. Fresh Wheat Grade A — 50 Quintal"
          value={form.title} onChange={e => set('title', e.target.value)}
          maxLength={120} className={fc(errors.title)} />
        <Err msg={errors.title} />
      </div>
      <div>
        <Lbl>Description</Lbl>
        <textarea rows={2} placeholder="Quality, certifications, growing conditions…"
          value={form.description} onChange={e => set('description', e.target.value)}
          maxLength={1000} className={`${fc()} resize-none`} />
      </div>

      <Divider icon="agriculture">Crop Details</Divider>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Lbl req>Crop Type</Lbl>
          <input type="text" placeholder="Wheat, Rice…"
            value={form.cropType} onChange={e => set('cropType', e.target.value)}
            className={fc(errors.cropType)} />
          <Err msg={errors.cropType} />
        </div>
        <div>
          <Lbl>Variety</Lbl>
          <input type="text" placeholder="Sharbati, Basmati…"
            value={form.variety} onChange={e => set('variety', e.target.value)}
            className={fc()} />
        </div>
        <div>
          <Lbl>Quality Grade</Lbl>
          <select value={form.qualityGrade} onChange={e => set('qualityGrade', e.target.value)} className={fc()}>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <Lbl>Harvest Date</Lbl>
          <input type="date" value={form.harvestDate}
            onChange={e => set('harvestDate', e.target.value)} className={fc()} />
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function S2({ form, errors, set }: { form: FormState; errors: FE; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-2">
      <Divider icon="inventory_2">Quantity</Divider>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Lbl req>Quantity</Lbl>
          <input type="number" min="1" placeholder="50"
            value={form.quantity} onChange={e => set('quantity', e.target.value)}
            className={fc(errors.quantity)} />
          <Err msg={errors.quantity} />
        </div>
        <div>
          <Lbl>Unit</Lbl>
          <select value={form.unit} onChange={e => set('unit', e.target.value)} className={fc()}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <Lbl>Min. Order</Lbl>
          <input type="number" min="1" placeholder="5"
            value={form.minOrder} onChange={e => set('minOrder', e.target.value)}
            className={fc(errors.minOrder)} />
          <Err msg={errors.minOrder} />
        </div>
        <div>
          <Lbl>Min. Order Unit</Lbl>
          <select value={form.minOrderUnit} onChange={e => set('minOrderUnit', e.target.value)} className={fc()}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <Divider icon="location_on">Location</Divider>
      <div>
        <Lbl>Street / Village</Lbl>
        <input type="text" placeholder="e.g. 12, Gandhi Nagar or Village Rampur"
          value={form.street} onChange={e => set('street', e.target.value)}
          className={fc()} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Lbl req>City</Lbl>
          <input type="text" placeholder="City"
            value={form.city} onChange={e => set('city', e.target.value)}
            className={fc(errors.city)} />
          <Err msg={errors.city} />
        </div>
        <div>
          <Lbl req>State</Lbl>
          <select value={form.state} onChange={e => set('state', e.target.value)} className={fc(errors.state)}>
            <option value="">Select</option>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <Err msg={errors.state} />
        </div>
        <div>
          <Lbl>Pincode</Lbl>
          <input type="text" maxLength={6} placeholder="110001"
            value={form.pincode}
            onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
            className={fc(errors.pincode)} />
          <Err msg={errors.pincode} />
        </div>
      </div>
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function S3({ form, errors, set }: { form: FormState; errors: FE; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-3">
      <Divider icon="sell">Selling Method</Divider>

      {/* Compact horizontal toggle */}
      <div className="flex rounded border border-gray-200 p-0.5 dark:border-gray-700">
        {(['FIXED_PRICE', 'NEGOTIABLE', 'AUCTION'] as PriceType[]).map(pt => (
          <button key={pt} type="button" onClick={() => set('priceType', pt)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded py-2 text-xs font-semibold transition-all ${
              form.priceType === pt
                ? 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}>
            <Icon name={pt === 'FIXED_PRICE' ? 'sell' : pt === 'NEGOTIABLE' ? 'handshake' : 'gavel'} className="text-sm" />
            {pt === 'FIXED_PRICE' ? 'Fixed' : pt === 'NEGOTIABLE' ? 'Negotiable' : 'Auction'}
          </button>
        ))}
      </div>

      {form.priceType === 'FIXED_PRICE' && (
        <div>
          <Divider icon="payments">Price</Divider>
          <Lbl req>Price (₹ per {form.unit})</Lbl>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2eb5c2]">₹</span>
            <input type="number" min="1" placeholder="2500"
              value={form.price} onChange={e => set('price', e.target.value)}
              className={`${fc(errors.price)} pl-6`} />
          </div>
          <Err msg={errors.price} />
        </div>
      )}

      {form.priceType === 'NEGOTIABLE' && (
        <div>
          <Divider icon="handshake">Expected Price</Divider>
          <Lbl>Expected Price (₹ per {form.unit})</Lbl>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2eb5c2]">₹</span>
            <input type="number" min="1" placeholder="2500"
              value={form.price} onChange={e => set('price', e.target.value)}
              className={`${fc(errors.price)} pl-6`} />
          </div>
          <Err msg={errors.price} />
        </div>
      )}

      {form.priceType === 'AUCTION' && (
        <div>
          <Divider icon="gavel">Auction Details</Divider>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Lbl req>Starting Bid (₹)</Lbl>
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2eb5c2]">₹</span>
                <input type="number" min="1" placeholder="2000"
                  value={form.startingBid} onChange={e => set('startingBid', e.target.value)}
                  className={`${fc(errors.startingBid)} pl-6`} />
              </div>
              <Err msg={errors.startingBid} />
            </div>
            <div>
              <Lbl req>Auction Ends On</Lbl>
              <input type="date" value={form.auctionEnd}
                onChange={e => set('auctionEnd', e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className={fc(errors.auctionEnd)} />
              <Err msg={errors.auctionEnd} />
            </div>
          </div>
        </div>
      )}

      {/* Tip — only for Fixed and Negotiable */}
      {form.priceType !== 'AUCTION' && (
        <div className={`flex items-start gap-2 rounded p-3 text-xs leading-relaxed ${
          form.priceType === 'FIXED_PRICE'
            ? 'bg-[#f0fafb] text-[#0b5d68] dark:bg-[#2eb5c2]/10 dark:text-[#2eb5c2]'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
        }`}>
          <Icon name="info" className="mt-0.5 shrink-0 text-xs" />
          {form.priceType === 'FIXED_PRICE'
            ? 'Buyers can purchase immediately. Payment held in escrow until delivery.'
            : 'Set an expected price. Buyers can contact you to negotiate before purchasing.'}
        </div>
      )}
    </div>
  )
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function S4({ images, previews, errors, dragOver, onDrop, onDragOver, onDragLeave, onFileInput, onRemove, fileRef, publishNow, onTogglePublish }: {
  images: File[]; previews: string[]; errors: FE; dragOver: boolean
  onDrop: (e: React.DragEvent) => void; onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void; onFileInput: (f: FileList) => void
  onRemove: (i: number) => void; fileRef: React.RefObject<HTMLInputElement>
  publishNow: boolean; onTogglePublish: () => void
}) {
  return (
    <div className="space-y-3">
      <Divider icon="photo_library">Photos</Divider>

      {/* Upload zone */}
      <div
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed py-5 transition-all ${
          dragOver
            ? 'border-[#2eb5c2] bg-[#2eb5c2]/5'
            : errors.images
            ? 'border-red-300 bg-red-50/60'
            : 'border-gray-200 bg-gray-50 hover:border-[#2eb5c2]/50 hover:bg-[#f0fafb] dark:border-gray-700 dark:bg-gray-800/40'
        }`}
      >
        <Icon name="cloud_upload" className={`mb-1 text-2xl ${dragOver ? 'text-[#2eb5c2]' : 'text-gray-300'}`} />
        <p className="text-xs font-semibold text-gray-500">
          {dragOver ? 'Drop here' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-[10px] text-gray-400">PNG, JPG, WEBP · {MAX_MB} MB max · up to {MAX_IMG}</p>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
          onChange={e => e.target.files && onFileInput(e.target.files)} />
      </div>
      <Err msg={errors.images} />

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-6 gap-1.5">
          {previews.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded ring-1 ring-gray-200 dark:ring-gray-700">
              <img src={src} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-[#0b5d68]/80 py-px text-center text-[8px] font-bold text-white">
                  Cover
                </div>
              )}
              <button type="button" onClick={e => { e.stopPropagation(); onRemove(i) }}
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500">
                <Icon name="close" className="text-[0.55rem]" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMG && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-300 transition-colors hover:border-[#2eb5c2] hover:text-[#2eb5c2] dark:border-gray-700">
              <Icon name="add" className="text-base" />
            </button>
          )}
        </div>
      )}

      {/* Publish toggle */}
      <label className="flex cursor-pointer items-center gap-2.5 rounded border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800/50">
        <input type="checkbox" checked={publishNow} onChange={onTogglePublish}
          className="h-4 w-4 cursor-pointer accent-[#0b5d68]" />
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Publish immediately</p>
          <p className="text-[10px] text-gray-400">Listing goes live as soon as it's submitted</p>
        </div>
        <span className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
          publishNow ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                     : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>{publishNow ? 'Live' : 'Draft'}</span>
      </label>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CreateListingModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep]             = useState(0)
  const [form, setForm]             = useState<FormState>(INIT)
  const [images, setImages]         = useState<File[]>([])
  const [previews, setPreviews]     = useState<string[]>([])
  const [errors, setErrors]         = useState<FE>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const [publishNow, setPublishNow] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null!)

  useEffect(() => { injectKf() }, [])

  useEffect(() => {
    if (open) {
      setStep(0); setForm(INIT); setImages([]); setPreviews([])
      setErrors({}); setSuccess(false); setSubmitting(false); setPublishNow(true)
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
      // NEGOTIABLE: expected price is optional, no validation required
    }
    if (s === 3 && images.length === 0) e.images = 'Upload at least one image.'
    return e
  }

  function next() { const e = validate(step); if (Object.keys(e).length) { setErrors(e); return }; setErrors({}); setStep(s => s + 1) }
  function back() { setErrors({}); setStep(s => s - 1) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
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
        // nested address object expected by the service
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
        // AUCTION
        payload.price = +form.startingBid
        payload.starting_bid = +form.startingBid
        // auction_end is YYYY-MM-DD; send as-is, service converts to end-of-day
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ animation: 'lk-backdrop-in 0.2s ease forwards' }}>

      {/* Backdrop */}
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/55" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        style={{ animation: 'lk-modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>

        {/* ── Gradient header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#0b5d68] via-[#1a8a96] to-[#2eb5c2] px-4 py-3">
          <div className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/20 ring-1 ring-white/30">
                <Icon name="add_circle" className="text-base text-white" />
              </div>
              <div>
                <h2 className="font-headline text-sm font-bold text-white">New Listing</h2>
                <p className="text-xs text-white/70">Post your produce to the marketplace</p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded bg-white/15 text-white/80 transition hover:bg-white/25">
              <Icon name="close" className="text-sm" />
            </button>
          </div>
        </div>

        {/* ── Stepper */}
        {!success && (
          <div className="shrink-0 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-start justify-center gap-0">
              {STEPS.map((s, i) => {
                const done = i < step; const cur = i === step
                return (
                  <Fragment key={s.label}>
                    {/* Circle + label — each centered independently */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-8 w-8 items-center justify-center rounded border-2 transition-all duration-300 ${
                        done ? 'border-[#2eb5c2] bg-[#2eb5c2] shadow-[0_0_0_2px_rgba(46,181,194,0.2)]'
                        : cur ? 'border-[#0b5d68] bg-[#0b5d68] shadow-[0_0_0_2px_rgba(11,93,104,0.12)] scale-110'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                      }`}>
                        <span className={`material-symbols-outlined select-none leading-none ${
                          done || cur ? 'text-white' : 'text-gray-400'
                        }`} style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>
                          {done ? 'check' : s.icon}
                        </span>
                      </div>
                      <span className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wide ${
                        cur ? 'text-[#0b5d68] dark:text-[#2eb5c2]' : done ? 'text-[#2eb5c2]' : 'text-gray-400'
                      }`}>{s.label}</span>
                    </div>
                    {/* Connector line — fixed narrow width so circles stay close */}
                    {i < STEPS.length - 1 && (
                      <div className={`mt-4 h-px w-20 shrink-0 rounded-full transition-all duration-500 ${
                        done ? 'bg-[#2eb5c2]' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Success */}
        {success && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
              style={{ animation: 'lk-success-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
              <Icon name="check_circle" className="text-4xl text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-headline text-base font-bold text-[#0b5d68] dark:text-white">Listing Created!</p>
              <p className="text-xs text-gray-500">Your produce has been posted to the marketplace.</p>
            </div>
          </div>
        )}

        {/* ── Form — no overflow-y so no scrollbar */}
        {!success && (
          <form onSubmit={submit} noValidate className="contents">
            <div className="px-6 py-3">
              {errors.general && (
                <div className="mb-3 flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <Icon name="error" className="mt-0.5 shrink-0 text-xs" />{errors.general}
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
                />
              )}
            </div>

            {/* ── Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40">
              <span className="text-xs font-medium text-gray-400">Step {step + 1} / {STEPS.length}</span>
              <div className="flex items-center gap-2">
                {step === 0 ? (
                  <button type="button" onClick={onClose}
                    className="flex h-9 w-28 items-center justify-center rounded border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                ) : (
                  <button type="button" onClick={back} disabled={submitting}
                    className="flex h-9 w-28 items-center justify-center gap-1 rounded border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                    <Icon name="arrow_back" className="text-base" />Back
                  </button>
                )}
                {isLast ? (
                  <button type="submit" disabled={submitting}
                    className="flex h-9 w-28 items-center justify-center gap-1.5 rounded bg-gradient-to-r from-[#e89151] to-[#d55b39] text-sm font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.97] disabled:opacity-60">
                    {submitting
                      ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />…</>
                      : <><Icon name="publish" className="text-base" />Post</>}
                  </button>
                ) : (
                  <button type="button" onClick={next}
                    className="flex h-9 w-28 items-center justify-center gap-1 rounded bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-sm font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.97]">
                    Next<Icon name="arrow_forward" className="text-base" />
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
