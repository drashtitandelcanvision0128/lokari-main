'use client'

import { useState, useRef, useCallback, Fragment } from 'react'
import Button from '@/components/common/Button'

interface DynamicFormProps {
  listingType: 'produce' | 'warehouse' | 'transport'
  currentStep: number
  setCurrentStep: (step: number) => void
  onSubmit: (data: any) => void
  listingData: any
  setListingData: (data: any) => void
  success?: boolean
}

const STEPS = [
  { label: 'Crop Info', icon: 'edit_note' },
  { label: 'Quanity', icon: 'inventory_2' },
  { label: 'Pricing', icon: 'sell' },
  // { label: 'Review', icon: 'preview' },
  { label: 'Photos', icon: 'photo_library' },
]

const GRADES = ['A', 'B', 'C', 'Premium', 'Grade 1', 'Grade 2']
const UNITS = ['Quintal', 'Kg', 'Ton', 'Pieces', 'Bags', 'Crates', 'Liters']

const MAX_IMG = 5
const MAX_MB = 5


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
  `w-full px-3.5 py-2.5 rounded-md text-sm text-[#1a1a1a] bg-white border placeholder:text-[#bbb] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ${err ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-[#e2e8ea] focus:ring-2 focus:ring-[#2eb5c2]/30 focus:border-[#2eb5c2]'
  }`

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-[11px] text-red-500">{msg}</p> : null
}

const inputClass = `
w-full
h-10
px-3
text-sm
rounded-md
border
border-[#e2e8ea]
bg-white
text-[#333]
outline-none
transition-all
duration-200
focus:border-[#2eb5c2]
focus:ring-2
focus:ring-[#2eb5c2]/20
`

const labelClass = `
block
text-[11px]
font-bold
uppercase
tracking-wide
text-[#0b5d68]
mb-1.5
`

const errorClass = `
text-xs
text-red-500
mt-1
`


const SectionCard = ({
  title,
  icon,
  children
}: {
  title: string
  icon: string
  children: React.ReactNode
}) => (
  <div className="overflow-hidden rounded-lg border border-[#e8ecee] bg-white shadow-sm">

    <div className="flex items-center gap-2 border-b border-[#f0f4f5] px-4 py-3">

      <span
        className="material-symbols-outlined text-[#2eb5c2]"
        style={{ fontSize: "20px" }}
      >
        {icon}
      </span>

      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b5d68]">
        {title}
      </h3>

    </div>


    <div className="p-4">
      {children}
    </div>

  </div>
)

const DynamicForm = ({
  listingType,
  currentStep,
  setCurrentStep,
  onSubmit,
  listingData,
  setListingData,
  success,
}: DynamicFormProps) => {
  const [errors, setErrors] = useState<any>({})

  const updateFormData = (field: string, value: any) => {
    setListingData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  // const validateStep = (step: number): boolean => {
  const validateStep = (step: number, type: typeof listingType): boolean => {
    const newErrors: any = {}

    // STEP 1
    if (step === 1) {

      if (!listingData.title?.trim())
        newErrors.title = 'Title is required'

      // if (!listingData.description?.trim())
      //   newErrors.description = 'Description is required'


      if (listingType === 'produce') {

        if (!listingData.cropName?.trim())
          newErrors.cropName = 'Crop type is required'

        // if (!listingData.harvestDate)
        //   newErrors.harvestDate = 'Harvest date is required'

      }


      if (listingType === 'warehouse') {

        if (!listingData.facilityName?.trim())
          newErrors.facilityName = 'Facility name is required'

        if (!listingData.capacity)
          newErrors.capacity = 'Capacity is required'

      }


      if (listingType === 'transport') {
        if (!listingData.vehicleType)
          newErrors.vehicleType = 'Vehicle type is required'
        if (!listingData.capacity || +listingData.capacity <= 0)
          newErrors.capacity = 'Capacity is required'
      }
    }



    else if (step === 2) {
      if (type === 'produce') {
        if (!listingData.quantity)
          newErrors.quantity = 'Quantity is required'
        if (!listingData.minOrder || +listingData.minOrder <= 0)
          newErrors.minOrder = 'Min. order is required'
      }

      if (type === 'warehouse') {
        if (!listingData.capacity || +listingData.capacity <= 0)
          newErrors.capacity = 'Capacity is required'
      }

      if (type === 'transport') {
        if (!listingData.routes?.from?.trim())
          newErrors['routes.from'] = 'From location is required'
        if (!listingData.routes?.to?.trim())
          newErrors['routes.to'] = 'To location is required'
      }

      if (!listingData.city?.trim()) newErrors.city = 'City is required'
      if (!listingData.state?.trim()) newErrors.state = 'State is required'
      if (!listingData.pincode?.trim()) newErrors.pincode = 'Pincode is required'
    }

    else if (step === 3) {
      if (!listingData.priceType)
        newErrors.priceType = 'Price type is required'
      if (listingData.priceType === 'fixed' && (!listingData.price || +listingData.price <= 0))
        newErrors.price = 'Enter a valid price.'
      if (listingData.priceType === 'auction') {
        if (!listingData.startingBid || +listingData.startingBid <= 0) newErrors.startingBid = 'Required.'
        if (!listingData.auctionEnd) newErrors.auctionEnd = 'Required.'
      }
    }

    else if (step === 4) {
      if (images.length === 0) newErrors.images = 'Upload at least one image.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }


  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [publishNow, setPublishNow] = useState(true)
  const submittedPublishNowRef = useRef(true)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null!)

  const addFiles = useCallback((files: FileList | File[]) => {
    const valid: File[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue
      if (f.size > MAX_MB * 1024 * 1024) {
        setErrors((p: any) => ({ ...p, images: `"${f.name}" exceeds ${MAX_MB} MB.` }))
        continue
      }
      valid.push(f)
    }
    setImages(prev => {
      const merged = [...prev, ...valid].slice(0, MAX_IMG)
      setPreviews(merged.map(f => URL.createObjectURL(f)))
      return merged
    })
    setErrors((p: any) => ({ ...p, images: undefined }))
  }, [])

  const removeImage = (i: number) => {
    setImages(prev => {
      const next = prev.filter((_, j) => j !== i)
      setPreviews(next.map(f => URL.createObjectURL(f)))
      return next
    })
  }



  const handleNext = () => {
    console.log(currentStep, listingData);
    if (validateStep(currentStep, listingType)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    setSubmitAttempted(true)
    if (!validateStep(4, listingType)) return


    submittedPublishNowRef.current = publishNow
    // Pass plain data + images, let the page build FormData
    onSubmit({ ...listingData, product_images: images, publishNow })
  }
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep listingType={listingType} listingData={listingData} updateFormData={updateFormData} errors={errors} />
      case 2:
        return <DetailsStep listingType={listingType} listingData={listingData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <PricingStep listingType={listingType} listingData={listingData} updateFormData={updateFormData} errors={errors} />
      case 4:
        return (
          <PhotosStep
            images={images}
            previews={previews}
            errors={errors}
            dragOver={dragOver}
            submitAttempted={submitAttempted}
            fileRef={fileRef}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onFileInput={addFiles}
            onRemove={removeImage}
            publishNow={publishNow}
            onTogglePublish={() => setPublishNow(p => !p)}
          />
        )
      default:
        return null
    }
  }

  return (

    <div className="
    bg-[#f7f9fa]
    min-h-full
    flex
    flex-col
  ">

      {/* Header */}
      <div className="
      relative
      bg-white
      border-b
      border-[#edf1f3]
      px-6
      pt-6
      pb-4
    ">

        <div className="
        absolute
        top-0
        left-0
        w-full
        h-[3px]
        bg-gradient-to-r
        from-[#0b5d68]
        via-[#2eb5c2]
        to-[#2eb5c2]/30
      "/>


        <div className="flex items-center gap-4">

          <div className="
          w-10
          h-10
          rounded-md
          bg-gradient-to-br
          from-[#0b5d68]
          to-[#2eb5c2]
          flex
          items-center
          justify-center
        ">

            <span className="material-symbols-outlined text-white">
              add_circle
            </span>

          </div>


          <div>

            <h2 className="
            text-lg
            font-bold
            text-[#0b5d68]
          ">
              Create Listing
            </h2>


            <p className="
            text-xs
            text-[#888]
          ">
              Post your produce to the marketplace
            </p>


          </div>

        </div>

      </div>


      {/* Stepper */}
      {!success && (
        <div className="
  shrink-0
  bg-white
  border-b
  border-[#edf1f3]
  px-6
  py-3
">

          <div className="
    flex
    items-center
    justify-center
    gap-0
  ">


            {STEPS.map((s, i) => {

              const stepIndex = i + 1

              const done = stepIndex < currentStep
              const cur = stepIndex === currentStep


              return (

                <Fragment key={s.label}>


                  <div className="
            flex
            flex-col
            items-center
            gap-1
          ">


                    <div
                      className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                border-2
                transition-all
                duration-300

                ${done
                          ? 'border-[#2eb5c2] bg-[#2eb5c2]'

                          : cur
                            ? 'border-[#0b5d68] bg-[#0b5d68] scale-110 shadow-[0_0_0_3px_rgba(11,93,104,0.12)]'

                            : 'border-[#e2e8ea] bg-white'
                        }
              `}
                    >


                      <span
                        className="
                  material-symbols-outlined
                  select-none
                "
                        style={{
                          fontSize: '14px',
                          fontVariationSettings: "'FILL' 1",
                          color:
                            done || cur
                              ? '#fff'
                              : '#bbb'
                        }}
                      >

                        {done ? 'check' : s.icon}

                      </span>


                    </div>



                    <span
                      className={`
                whitespace-nowrap
                text-[9px]
                font-bold
                uppercase
                tracking-wide

                ${cur
                          ? 'text-[#0b5d68]'
                          : done
                            ? 'text-[#2eb5c2]'
                            : 'text-[#bbb]'
                        }
              `}
                    >

                      {s.label}

                    </span>


                  </div>



                  {i < STEPS.length - 1 && (

                    <div
                      className={`
                mt-3.5
                h-px
                w-16
                shrink-0
                transition-all
                duration-500

                ${done
                          ? 'bg-[#2eb5c2]'
                          : 'bg-[#e2e8ea]'
                        }
              `}
                    />

                  )}


                </Fragment>

              )

            })}


          </div>


        </div>
      )}

      {/* Content */}
      {success ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 bg-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <span
              className="material-symbols-outlined text-emerald-500"
              style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#0b5d68]">Listing Created!</p>

            {submittedPublishNowRef.current ? (
              <>
                {/* <p className="text-xs text-red-500">publishNow: {String(submittedPublishNowRef.current)}</p> */}
                <p className="mt-1 text-sm text-[#888]">Your listing has been posted to the marketplace.</p>
                <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-md px-3 py-2">
                  <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '14px' }}>schedule</span>
                  Your listing will be publicly visible once verified — usually within 24 hours.
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-[#888]">Your listing has been added to the system.</p>
                <p className="mt-2 text-xs text-[#aaa] bg-[#f7f9fa] rounded-md px-3 py-2">
                  <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '14px' }}>info</span>
                  You can publish your listing anytime from your dashboard. Verification usually takes 24 hours.
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6 py-5 space-y-4 flex-1">
          {renderStepContent()}
        </div>
      )}



      {/* Footer */}
      {!success && (
        <div className="
      bg-white
      border-t
      border-[#edf1f3]
      px-6
      py-4
      flex
      justify-end
      items-center
      gap-3
    ">

          <div className="flex items-center gap-3 ml-auto">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-semibold text-[#555] border border-[#e0e4e6] bg-white hover:bg-[#f5f7f8] hover:border-[#cdd3d6] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                Back
              </button>
            ) : null}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] hover:from-[#0a5260] hover:to-[#28a8b4] active:scale-[0.98] shadow-[0_2px_12px_rgba(46,181,194,0.35)] transition-all"
              >
                Next
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] hover:from-[#0a5260] hover:to-[#28a8b4] active:scale-[0.98] shadow-[0_2px_12px_rgba(46,181,194,0.35)] transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>publish</span>
                Post Listing
              </button>
            )}
          </div>


        </div>
      )}

    </div>
  )

}

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];
// Step Components

// Step 1
const BasicInfoStep = ({ listingType, listingData, updateFormData, errors }: any) => (
  // <div className="space-y-6">
  <div className="space-y-4">
    <SectionCard
      title="Listing Details"
      icon="edit_note"
    >
      <div className="space-y-3">
        <div>
          <FieldLabel icon="title" label="Listing Title" required />

          <input
            type="text"
            value={listingData.title || ''}
            onChange={(e) => updateFormData('title', e.target.value)}
            //             className={`
            // ${inputClass}
            // ${errors.title
            //                 ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
            //                 : ''
            //               }
            // `}
            className={premiumCls(errors.title)}
            maxLength={120}
            placeholder="e.g. Fresh Wheat Grade A — 50 Quintal"
          />
          <Err msg={errors.title} />
          {/* {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>} */}
        </div>

        <div>
          <FieldLabel icon="notes" label="Description" />
          <textarea
            value={listingData.description || ''}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={3}
            //           className={`
            //   ${inputClass}
            //   h-auto
            //   py-3
            //   resize-none
            //   ${errors.description
            //               ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
            //               : ''
            //             }
            // `}
            className={`${premiumCls()} resize-none`}
            maxLength={1000}
            placeholder="Quality, certifications, growing conditions…"
          />

        </div>
      </div>
    </SectionCard>


    <SectionCard
      title={
        listingType === 'produce'
          ? "Crop Details"
          : listingType === 'warehouse'
            ? "Warehouse Details"
            : "Transport Details"
      }
      icon={
        listingType === 'produce'
          ? "agriculture"
          : listingType === 'warehouse'
            ? "warehouse"
            : "local_shipping"
      }
    >
      {listingType === 'produce' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="grass" label="Crop Type" required />
            <input
              type="text"
              value={listingData.cropName || ''}
              onChange={(e) => updateFormData('cropName', e.target.value)}
              className={premiumCls(errors.cropName)}
              placeholder="Wheat, Rice…"
            />
            <Err msg={errors.cropName} />
          </div>

          <div>
            <FieldLabel icon="eco" label="Variety" />
            <input
              type="text"
              value={listingData.variety || ''}
              onChange={(e) => updateFormData('variety', e.target.value)}
              className={premiumCls()}
              placeholder="Sharbati, Basmati…"
            />
          </div>

          <div>
            <FieldLabel icon="grade" label="Quality Grade" />
            <select
              value={listingData.qualityGrade || ''}
              onChange={(e) => updateFormData('qualityGrade', e.target.value)}
              className={premiumCls()}
            >
              {/* <option value="">Select Grade</option> */}
              {GRADES.map(g => <option key={g}>{g}</option>)}
              {/* <option value="">Select Grade</option>
              <option value="premium">Premium</option>
              <option value="grade-a">Grade A</option>
              <option value="grade-b">Grade B</option>
              <option value="standard">Standard</option> */}
            </select>
          </div>

          <div>
            <FieldLabel icon="calendar_today" label="Harvest Date" />

            <input
              type="date"
              value={listingData.harvestDate || ''}
              onChange={(e) => updateFormData('harvestDate', e.target.value)}
              className={premiumCls()}
            />

            {/* {errors.harvestDate &&
              <p className="text-red-500 text-sm mt-1">
                {errors.harvestDate}
              </p>} */}
          </div>





          {/* <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Storage Requirements
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#666666] mb-1">Temperature (°C)</label>
                <input
                  type="text"
                  value={listingData.storageTemp || ''}
                  onChange={(e) => updateFormData('storageTemp', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 2-8°C"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1">Humidity (%)</label>
                <input
                  type="text"
                  value={listingData.storageHumidity || ''}
                  onChange={(e) => updateFormData('storageHumidity', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 60-70%"
                />
              </div>
            </div>
          </div> */}



        </div>
      )}

      {/* {listingType === 'warehouse' && (
        <>
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Facility Name *
            </label>
            <input
              type="text"
              value={listingData.facilityName || ''}
              onChange={(e) => updateFormData('facilityName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.facilityName ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
              placeholder="Enter facility name"
            />
            {errors.facilityName && <p className="text-red-500 text-sm mt-1">{errors.facilityName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Address *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={listingData.address || ''}
                onChange={(e) => updateFormData('address', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.address ? 'border-red-500' : 'border-[#e0e0e0]'
                  }`}
                placeholder="Street address"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={listingData.city || ''}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className={inputClass}
                  placeholder="City"
                />
                <input
                  type="text"
                  value={listingData.state || ''}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  className={inputClass}
                  placeholder="State"
                />
              </div>
            </div>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Storage Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Cold', 'Wet', 'Dry', 'Frozen'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={listingData.storageTypes?.includes(type) || false}
                    onChange={(e) => {
                      const current = listingData.storageTypes || []
                      if (e.target.checked) {
                        updateFormData('storageTypes', [...current, type])
                      } else {
                        updateFormData('storageTypes', current.filter((t: string) => t !== type))
                      }
                    }}
                    className="mr-2 text-[#2eb5c2] focus:ring-[#2eb5c2]"
                  />
                  <span className="text-sm text-[#666666]">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0b5d68] mb-2">
                Available Capacity (sq ft) *
              </label>
              <input
                type="number"
                value={listingData.capacity || ''}
                onChange={(e) => updateFormData('capacity', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.capacity ? 'border-red-500' : 'border-[#e0e0e0]'
                  }`}
                placeholder="0"
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b5d68] mb-2">
                Pricing Model
              </label>
              <select
                value={listingData.pricingModel || ''}
                onChange={(e) => updateFormData('pricingModel', e.target.value)}
                className={inputClass}
              >
                <option value="">Select Model</option>
                <option value="per-sqft">Per sq ft/month</option>
                <option value="per-ton">Per ton/day</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Available Dates
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#666666] mb-1">From</label>
                <input
                  type="date"
                  value={listingData.availableFrom || ''}
                  onChange={(e) => updateFormData('availableFrom', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1">To</label>
                <input
                  type="date"
                  value={listingData.availableTo || ''}
                  onChange={(e) => updateFormData('availableTo', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </>
      )} */}

      {/* {listingType === 'warehouse' && (
        <div className="space-y-3">
          <div>
            <FieldLabel icon="warehouse" label="Facility Name" required />
            <input
              type="text"
              value={listingData.facilityName || ''}
              onChange={(e) => updateFormData('facilityName', e.target.value)}
              className={premiumCls(errors.facilityName)}
              placeholder="e.g. Rampur Cold Storage"
            />
            <Err msg={errors.facilityName} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="straighten" label="Available Capacity (sq ft)" required />
              <input
                type="number"
                min="1"
                value={listingData.capacity || ''}
                onChange={(e) => updateFormData('capacity', e.target.value)}
                className={premiumCls(errors.capacity)}
                placeholder="5000"
              />
              <Err msg={errors.capacity} />
            </div>

            <div>
              <FieldLabel icon="category" label="Storage Type" />
              <select
                value={listingData.storageType || ''}
                onChange={(e) => updateFormData('storageType', e.target.value)}
                className={premiumCls()}
              >
                <option value="">Select Type</option>
                <option value="Cold">Cold</option>
                <option value="Dry">Dry</option>
                <option value="Wet">Wet</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="calendar_today" label="Available From" />
              <input
                type="date"
                value={listingData.availableFrom || ''}
                onChange={(e) => updateFormData('availableFrom', e.target.value)}
                className={premiumCls()}
              />
            </div>
            <div>
              <FieldLabel icon="event" label="Available To" />
              <input
                type="date"
                value={listingData.availableTo || ''}
                onChange={(e) => updateFormData('availableTo', e.target.value)}
                className={premiumCls()}
              />
            </div>
          </div>
        </div>
      )} */}

      {listingType === 'warehouse' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="warehouse" label="Facility Name" required />
            <input
              type="text"
              value={listingData.facilityName || ''}
              onChange={(e) => updateFormData('facilityName', e.target.value)}
              className={premiumCls(errors.facilityName)}
              placeholder="e.g. Rampur Cold Storage"
            />
            <Err msg={errors.facilityName} />
          </div>

          <div>
            <FieldLabel icon="category" label="Storage Type" />
            <select
              value={listingData.storageType || ''}
              onChange={(e) => updateFormData('storageType', e.target.value)}
              className={premiumCls()}
            >
              <option value="">Select Type</option>
              <option value="Cold">Cold</option>
              <option value="Dry">Dry</option>
              <option value="Wet">Wet</option>
              <option value="Frozen">Frozen</option>
            </select>
          </div>
        </div>
      )}


      {/* {listingType === 'transport' && (
        <>
          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Vehicle Type *
            </label>
            <select
              value={listingData.vehicleType || ''}
              onChange={(e) => updateFormData('vehicleType', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.vehicleType ? 'border-red-500' : 'border-[#e0e0e0]'
                }`}
            >
              <option value="">Select Vehicle Type</option>
              <option value="truck">Truck</option>
              <option value="tempo">Tempo</option>
              <option value="reefer">Reefer (Refrigerated)</option>
              <option value="flatbed">Flatbed</option>
            </select>
            {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0b5d68] mb-2">
                Vehicle Capacity (tons) *
              </label>
              <input
                type="number"
                value={listingData.capacity || ''}
                onChange={(e) => updateFormData('capacity', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.capacity ? 'border-red-500' : 'border-[#e0e0e0]'
                  }`}
                placeholder="0"
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0b5d68] mb-2">
                Price per km
              </label>
              <input
                type="number"
                value={listingData.pricePerKm || ''}
                onChange={(e) => updateFormData('pricePerKm', e.target.value)}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Service Routes *
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#666666] mb-1">From *</label>
                <input
                  type="text"
                  value={listingData.routes?.from || ''}
                  onChange={(e) => updateFormData('routes', { ...listingData.routes, from: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors['routes.from'] ? 'border-red-500' : 'border-[#e0e0e0]'
                    }`}
                  placeholder="Starting location"
                />
                {errors['routes.from'] && <p className="text-red-500 text-sm mt-1">{errors['routes.from']}</p>}
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1">To *</label>
                <input
                  type="text"
                  value={listingData.routes?.to || ''}
                  onChange={(e) => updateFormData('routes', { ...listingData.routes, to: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors['routes.to'] ? 'border-red-500' : 'border-[#e0e0e0]'
                    }`}
                  placeholder="Destination"
                />
                {errors['routes.to'] && <p className="text-red-500 text-sm mt-1">{errors['routes.to']}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Additional Services
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={listingData.refrigeration || false}
                  onChange={(e) => updateFormData('refrigeration', e.target.checked)}
                  className="mr-2 text-[#2eb5c2] focus:ring-[#2eb5c2]"
                />
                <span className="text-sm text-[#666666]">Refrigeration Available</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Availability Dates
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#666666] mb-1">From</label>
                <input
                  type="date"
                  value={listingData.availableFrom || ''}
                  onChange={(e) => updateFormData('availableFrom', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1">To</label>
                <input
                  type="date"
                  value={listingData.availableTo || ''}
                  onChange={(e) => updateFormData('availableTo', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </>
      )} */}

      {/* {listingType === 'transport' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="local_shipping" label="Vehicle Type" required />
              <select
                value={listingData.vehicleType || ''}
                onChange={(e) => updateFormData('vehicleType', e.target.value)}
                className={premiumCls(errors.vehicleType)}
              >
                <option value="">Select Type</option>
                <option value="Truck">Truck</option>
                <option value="Tempo">Tempo</option>
                <option value="Reefer">Reefer (Refrigerated)</option>
                <option value="Flatbed">Flatbed</option>
              </select>
              <Err msg={errors.vehicleType} />
            </div>

            <div>
              <FieldLabel icon="fitness_center" label="Capacity (tons)" required />
              <input
                type="number"
                min="1"
                value={listingData.capacity || ''}
                onChange={(e) => updateFormData('capacity', e.target.value)}
                className={premiumCls(errors.capacity)}
                placeholder="10"
              />
              <Err msg={errors.capacity} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="place" label="Route From" required />
              <input
                type="text"
                value={listingData.routes?.from || ''}
                onChange={(e) => updateFormData('routes', { ...listingData.routes, from: e.target.value })}
                className={premiumCls(errors['routes.from'])}
                placeholder="e.g. Bhopal"
              />
              <Err msg={errors['routes.from']} />
            </div>

            <div>
              <FieldLabel icon="flag" label="Route To" required />
              <input
                type="text"
                value={listingData.routes?.to || ''}
                onChange={(e) => updateFormData('routes', { ...listingData.routes, to: e.target.value })}
                className={premiumCls(errors['routes.to'])}
                placeholder="e.g. Delhi"
              />
              <Err msg={errors['routes.to']} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={listingData.refrigeration || false}
              onChange={(e) => updateFormData('refrigeration', e.target.checked)}
              className="h-4 w-4 accent-[#0b5d68]"
            />
            <span className="text-sm text-[#555]">Refrigeration available</span>
          </label>
        </div>
      )} */}

      {/* {listingType === 'transport' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="local_shipping" label="Vehicle Type" required />
              <select
                value={listingData.vehicleType || ''}
                onChange={(e) => updateFormData('vehicleType', e.target.value)}
                className={premiumCls(errors.vehicleType)}
              >
                <option value="">Select Type</option>
                <option value="Truck">Truck</option>
                <option value="Tempo">Tempo</option>
                <option value="Reefer">Reefer (Refrigerated)</option>
                <option value="Flatbed">Flatbed</option>
              </select>
              <Err msg={errors.vehicleType} />
            </div>

            <div>
              <FieldLabel icon="fitness_center" label="Capacity (tons)" required />
              <input
                type="number"
                min="1"
                value={listingData.capacity || ''}
                onChange={(e) => updateFormData('capacity', e.target.value)}
                className={premiumCls(errors.capacity)}
                placeholder="10"
              />
              <Err msg={errors.capacity} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="place" label="Route From" required />
              <input
                type="text"
                value={listingData.routes?.from || ''}
                onChange={(e) => updateFormData('routes', { ...listingData.routes, from: e.target.value })}
                className={premiumCls(errors['routes.from'])}
                placeholder="e.g. Bhopal"
              />
              <Err msg={errors['routes.from']} />
            </div>

            <div>
              <FieldLabel icon="flag" label="Route To" required />
              <input
                type="text"
                value={listingData.routes?.to || ''}
                onChange={(e) => updateFormData('routes', { ...listingData.routes, to: e.target.value })}
                className={premiumCls(errors['routes.to'])}
                placeholder="e.g. Delhi"
              />
              <Err msg={errors['routes.to']} />
            </div>
          </div>
        </div>
      )} */}

      {listingType === 'transport' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="local_shipping" label="Vehicle Type" required />
              <select
                value={listingData.vehicleType || ''}
                onChange={(e) => updateFormData('vehicleType', e.target.value)}
                className={premiumCls(errors.vehicleType)}
              >
                <option value="">Select Type</option>
                <option value="Truck">Truck</option>
                <option value="Tempo">Tempo</option>
                <option value="Reefer">Reefer (Refrigerated)</option>
                <option value="Flatbed">Flatbed</option>
              </select>
              <Err msg={errors.vehicleType} />
            </div>

            <div>
              <FieldLabel icon="fitness_center" label="Capacity" required />
              <input
                type="number"
                min="1"
                value={listingData.capacity || ''}
                onChange={(e) => updateFormData('capacity', e.target.value)}
                className={premiumCls(errors.capacity)}
                placeholder="10"
              />
              <Err msg={errors.capacity} />
            </div>

            <div>
              <FieldLabel icon="category" label="Capacity Unit" />
              <select
                value={listingData.capacityUnit || 'ton'}
                onChange={(e) => updateFormData('capacityUnit', e.target.value)}
                className={premiumCls()}
              >
                <option value="ton">Tons</option>
                <option value="kg">Kilograms</option>
                <option value="quintal">Quintal</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  </div>

)

// ─── Step 2: Quantity & Location ──────────────────────────────────────────────
const DetailsStep = ({ listingType, listingData, updateFormData, errors }: any) => (
  <div className="space-y-4">

    {/* Quantity — only for produce */}
    {listingType === 'produce' && (
      <SectionCard title="Quantity" icon="inventory_2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="scale" label="Quantity" required />
            <input
              type="number"
              min="1"
              value={listingData.quantity || ''}
              onChange={(e) => updateFormData('quantity', e.target.value)}
              className={premiumCls(errors.quantity)}
              placeholder="50"
            />
            <Err msg={errors.quantity} />
          </div>

          <div>
            <FieldLabel icon="straighten" label="Unit" />
            <select
              value={listingData.unit || 'Quintal'}
              onChange={(e) => updateFormData('unit', e.target.value)}
              className={premiumCls()}
            >
              {UNITS.map(u => <option key={u}>{u}</option>)}
              {/* <option value="kg">Kilograms (kg)</option>
            <option value="quintal">Quintal</option>
            <option value="ton">Ton</option>
            <option value="lbs">Pounds (lbs)</option>
            <option value="bushels">Bushels</option> */}
            </select>
          </div>

          <div>
            <FieldLabel icon="production_quantity_limits" label="Min. Order" />
            <input type="number" min="1" placeholder="5"
              value={listingData.minOrder} onChange={e => updateFormData('minOrder', e.target.value)}
              className={premiumCls(errors.minOrder)} />
            <Err msg={errors.minOrder} />
          </div>
          <div>
            <FieldLabel icon="straighten" label="Min. Order Unit" />
            <select value={listingData.minOrderUnit} onChange={e => updateFormData('minOrderUnit', e.target.value)} className={premiumCls()}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </SectionCard>
    )}

    {/* Warehouse capacity & availability */}
    {listingType === 'warehouse' && (
      <SectionCard title="Storage Capacity & Availability" icon="warehouse">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="straighten" label="Capacity" required />
            <input
              type="number"
              min="1"
              value={listingData.capacity || ''}
              onChange={(e) => updateFormData('capacity', e.target.value)}
              className={premiumCls(errors.capacity)}
              placeholder="5000"
            />
            <Err msg={errors.capacity} />
          </div>

          <div>
            <FieldLabel icon="category" label="Capacity Unit" />
            <select
              value={listingData.capacityUnit || 'sqft'}
              onChange={(e) => updateFormData('capacityUnit', e.target.value)}
              className={premiumCls()}
            >
              <option value="sqft">Sq. Ft</option>
              <option value="sqm">Sq. Meters</option>
              <option value="ton">Tons</option>
            </select>
          </div>

          <div>
            <FieldLabel icon="calendar_today" label="Available From" />
            <input
              type="date"
              value={listingData.availableFrom || ''}
              onChange={(e) => updateFormData('availableFrom', e.target.value)}
              className={premiumCls()}
            />
          </div>

          <div>
            <FieldLabel icon="event" label="Available To" />
            <input
              type="date"
              value={listingData.availableTo || ''}
              onChange={(e) => updateFormData('availableTo', e.target.value)}
              className={premiumCls()}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={listingData.climateControlled || false}
              onChange={(e) => updateFormData('climateControlled', e.target.checked)}
              className="h-4 w-4 accent-[#0b5d68]"
            />
            <span className="text-sm text-[#555]">Climate controlled facility</span>
          </label>
        </div>
      </SectionCard>
    )}


    {/* Transport capacity & availability */}
    {/* {listingType === 'transport' && (
      <SectionCard title="Vehicle Capacity & Availability" icon="local_shipping">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="fitness_center" label="Capacity" required />
            <input
              type="number"
              min="1"
              value={listingData.capacity || ''}
              onChange={(e) => updateFormData('capacity', e.target.value)}
              className={premiumCls(errors.capacity)}
              placeholder="10"
            />
            <Err msg={errors.capacity} />
          </div>

          <div>
            <FieldLabel icon="category" label="Capacity Unit" />
            <select
              value={listingData.capacityUnit || 'ton'}
              onChange={(e) => updateFormData('capacityUnit', e.target.value)}
              className={premiumCls()}
            >
              <option value="ton">Tons</option>
              <option value="kg">Kilograms</option>
              <option value="quintal">Quintal</option>
            </select>
          </div>

          <div>
            <FieldLabel icon="calendar_today" label="Available From" />
            <input
              type="date"
              value={listingData.availableFrom || ''}
              onChange={(e) => updateFormData('availableFrom', e.target.value)}
              className={premiumCls()}
            />
          </div>

          <div>
            <FieldLabel icon="event" label="Available To" />
            <input
              type="date"
              value={listingData.availableTo || ''}
              onChange={(e) => updateFormData('availableTo', e.target.value)}
              className={premiumCls()}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={listingData.isRefrigerated || false}
              onChange={(e) => updateFormData('isRefrigerated', e.target.checked)}
              className="h-4 w-4 accent-[#0b5d68]"
            />
            <span className="text-sm text-[#555]">Refrigerated vehicle</span>
          </label>
        </div>
      </SectionCard>
    )} */}

    {listingType === 'transport' && (
      <SectionCard title="Vehicle Capacity & Availability" icon="local_shipping">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel icon="calendar_today" label="Available From" />
            <input
              type="date"
              value={listingData.availableFrom || ''}
              onChange={(e) => updateFormData('availableFrom', e.target.value)}
              className={premiumCls()}
            />
          </div>

          <div>
            <FieldLabel icon="event" label="Available To" />
            <input
              type="date"
              value={listingData.availableTo || ''}
              onChange={(e) => updateFormData('availableTo', e.target.value)}
              className={premiumCls()}
            />
          </div>

          <div>
            <FieldLabel icon="place" label="Route From" required />
            <input
              type="text"
              value={listingData.routes?.from || ''}
              onChange={(e) => updateFormData('routes', { ...listingData.routes, from: e.target.value })}
              className={premiumCls(errors['routes.from'])}
              placeholder="e.g. Bhopal"
            />
            <Err msg={errors['routes.from']} />
          </div>

          <div>
            <FieldLabel icon="flag" label="Route To" required />
            <input
              type="text"
              value={listingData.routes?.to || ''}
              onChange={(e) => updateFormData('routes', { ...listingData.routes, to: e.target.value })}
              className={premiumCls(errors['routes.to'])}
              placeholder="e.g. Delhi"
            />
            <Err msg={errors['routes.to']} />
          </div>
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={listingData.isRefrigerated || false}
              onChange={(e) => updateFormData('isRefrigerated', e.target.checked)}
              className="h-4 w-4 accent-[#0b5d68]"
            />
            <span className="text-sm text-[#555]">Refrigerated vehicle</span>
          </label>
        </div>
      </SectionCard>
    )}


    <SectionCard
      title="Location"
      icon="location_on"
    >
      <div className="space-y-3">
        <div>
          <FieldLabel icon="signpost" label="Street / Village" />
          <input
            type="text"
            value={listingData.street || ''}
            onChange={(e) => updateFormData('street', e.target.value)}
            className={premiumCls()}
            placeholder="e.g. 12, Gandhi Nagar or Village Rampur"
          />
          {/* {errors.street && (
            <p className="text-red-500 text-sm mt-1">
              {errors.street}
            </p>
          )} */}
        </div>
        <div className="grid grid-cols-3 gap-3">

          <div>
            <FieldLabel icon="apartment" label="City" required />
            <input
              type="text"
              value={listingData.city || ''}
              onChange={(e) => updateFormData('city', e.target.value)}
              className={premiumCls(errors.city)}
              placeholder="City"
            />
            <Err msg={errors.city} />
          </div>

          <div>
            <FieldLabel icon="map" label="State" required />

            <select
              value={listingData.state || ''}
              onChange={(e) => updateFormData('state', e.target.value)}
              className={premiumCls(errors.state)}
            >
              <option value="">Select</option>

              {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
              {/* {INDIAN_STATES.map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))} */}
            </select>
            <Err msg={errors.state} />
          </div>

          <div>
            <FieldLabel icon="pin" label="Pincode" />
            <input
              type="text"
              maxLength={6} placeholder="110001"
              value={listingData.pincode || ''}
              onChange={(e) => updateFormData('pincode', e.target.value)}
              className={premiumCls(errors.pincode)}
            />
            <Err msg={errors.pincode} />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-[#0b5d68] mb-2">
              Country
            </label>

            <input
              type="text"
              value="India"
              readOnly
              className={inputClass}
            />
          </div> */}
        </div>
      </div>
    </SectionCard>
  </div>
)


// ─── Step 3: Pricing ──────────────────────────────────────────────────────────
// const PricingStep = ({ listingType, listingData, updateFormData, errors }: any) => (
//   <div className="space-y-4">
//     <SectionCard
//       title="Selling Method"
//       icon="sell"
//     >
//       {/* Tab toggle */}
//       <div>
//         <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//           Price Type *
//         </label>
//         <select
//           value={listingData.priceType || ''}
//           onChange={(e) => updateFormData('priceType', e.target.value)}
//           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.priceType ? 'border-red-500' : 'border-[#e0e0e0]'
//             }`}
//         >
//           <option value="">Select Price Type</option>
//           <option value="fixed">Fixed Price</option>
//           <option value="negotiable">Negotiable</option>
//           {listingType === 'produce' && <option value="auction">Auction</option>}
//         </select>
//         {errors.priceType && <p className="text-red-500 text-sm mt-1">{errors.priceType}</p>}
//       </div>

//       {listingData.priceType === 'fixed' && (
//         <div>
//           <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//             Price (per unit) *
//           </label>
//           <input
//             type="number"
//             value={listingData.price || ''}
//             onChange={(e) => updateFormData('price', e.target.value)}
//             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.price ? 'border-red-500' : 'border-[#e0e0e0]'
//               }`}
//             placeholder="0.00"
//           />
//           {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
//         </div>
//       )}

//       {listingData.priceType === 'auction' && (
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//               Starting Bid *
//             </label>
//             <input
//               type="number"
//               value={listingData.startingBid || ''}
//               onChange={(e) => updateFormData('startingBid', e.target.value)}
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] ${errors.startingBid ? 'border-red-500' : 'border-[#e0e0e0]'
//                 }`}
//               placeholder="0.00"
//             />
//             {errors.startingBid && <p className="text-red-500 text-sm mt-1">{errors.startingBid}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//               Reserve Price
//             </label>
//             <input
//               type="number"
//               value={listingData.reservePrice || ''}
//               onChange={(e) => updateFormData('reservePrice', e.target.value)}
//               className={inputClass}
//               placeholder="0.00"
//             />
//             <p className="text-xs text-[#666666] mt-1">Minimum price you're willing to accept</p>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//                 Auction Start Time
//               </label>
//               <input
//                 type="datetime-local"
//                 value={listingData.auctionStart || ''}
//                 onChange={(e) => updateFormData('auctionStart', e.target.value)}
//                 className={inputClass}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//                 Auction End Time
//               </label>
//               <input
//                 type="datetime-local"
//                 value={listingData.auctionEnd || ''}
//                 onChange={(e) => updateFormData('auctionEnd', e.target.value)}
//                 className={inputClass}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </SectionCard>

//     <SectionCard
//       title="Duration"
//       icon="schedule"
//     >
//       <div>
//         <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//           Listing Duration *
//         </label>
//         <select
//           value={listingData.duration || ''}
//           onChange={(e) => updateFormData('duration', e.target.value)}
//           className={inputClass}
//         >
//           <option value="">Select Duration</option>
//           <option value="7">7 days</option>
//           <option value="14">14 days</option>
//           <option value="30">30 days</option>
//           <option value="60">60 days</option>
//         </select>
//       </div>

//       <div>
//         <label className="flex items-center">
//           <input
//             type="checkbox"
//             checked={listingData.publishNow || false}
//             onChange={(e) => updateFormData('publishNow', e.target.checked)}
//             className="mr-2 text-[#2eb5c2] focus:ring-[#2eb5c2]"
//           />
//           <span className="text-sm text-[#666666]">Publish immediately</span>
//         </label>
//       </div>
//     </SectionCard>
//   </div>
// )

const PricingStep = ({ listingType, listingData, updateFormData, errors }: any) => {
  const pt = listingData.priceType || 'fixed'

  return (
    <div className="space-y-4">
      <SectionCard title="Selling Method" icon="sell">

        {/* ── 3-button tab toggle (replaces the <select>) ── */}
        <div className="flex rounded-md border border-[#e2e8ea] p-0.5 mb-4">
          {(
            ['fixed', 'negotiable', ...(listingType === 'produce' ? ['auction'] : [])] as string[]
          ).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => updateFormData('priceType', type)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded py-2 text-xs font-semibold transition-all ${pt === type
                ? 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white shadow-sm'
                : 'text-[#888] hover:text-[#0b5d68]'
                }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {type === 'fixed' ? 'sell' : type === 'negotiable' ? 'handshake' : 'gavel'}
              </span>
              {type === 'fixed' ? 'Fixed Price' : type === 'negotiable' ? 'Negotiable' : 'Auction'}
            </button>
          ))}
        </div>

        {/* ── Fixed / Negotiable ── */}
        {(pt === 'fixed' || pt === 'negotiable') && (
          <div>
            <FieldLabel
              icon="payments"
              // label={
              //   pt === 'fixed'
              //     ? `Price (₹ per ${listingData.unit || 'unit'})`
              //     : `Expected Price (₹ per ${listingData.unit || 'unit'})`
              // }

              label={
                listingType === 'transport'
                  ? pt === 'fixed' ? 'Price (₹ per km)' : 'Expected Price (₹ per km)'
                  : listingType === 'warehouse'
                    ? pt === 'fixed' ? 'Price (₹ per sq ft / month)' : 'Expected Price (₹ per sq ft / month)'
                    : pt === 'fixed'
                      ? `Price (₹ per ${listingData.unit || 'unit'})`
                      : `Expected Price (₹ per ${listingData.unit || 'unit'})`
              }
              required={pt === 'fixed'}
            />
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2eb5c2]">
                ₹
              </span>
              <input
                type="number"
                min="1"
                value={listingData.price || ''}
                onChange={e => updateFormData('price', e.target.value)}
                placeholder="2500"
                className={`${premiumCls(errors.price)} pl-7`}
              />
            </div>
            <Err msg={errors.price} />
            {pt === 'negotiable' && (
              <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                Buyers can contact you to negotiate before purchasing.
              </p>
            )}
          </div>
        )}

        {/* ── Auction ── */}
        {pt === 'auction' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel icon="gavel" label="Starting Bid (₹)" required />
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2eb5c2]">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={listingData.startingBid || ''}
                  onChange={e => updateFormData('startingBid', e.target.value)}
                  placeholder="2000"
                  className={`${premiumCls(errors.startingBid)} pl-7`}
                />
              </div>
              <Err msg={errors.startingBid} />
            </div>

            <div>
              <FieldLabel icon="event" label="Auction Ends On" required />
              <input
                type="date"
                value={listingData.auctionEnd || ''}
                onChange={e => updateFormData('auctionEnd', e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className={premiumCls(errors.auctionEnd)}
              />
              <Err msg={errors.auctionEnd} />
            </div>
          </div>
        )}

      </SectionCard>
    </div>
  )
}


// ─── Step 4: Photos ───────────────────────────────────────────────────────────
// const ReviewStep = ({ listingType, updateFormData, listingData }: any) => (
//   <div className="space-y-6">
//     <SectionCard
//       title="Listing Preview"
//       icon="preview"
//     >

//       <div className="space-y-4">
//         <div>
//           <h4 className="font-medium text-[#0b5d68]">{listingData.title || 'Untitled Listing'}</h4>
//           <p className="text-[#666666] mt-1">{listingData.description || 'No description provided'}</p>
//         </div>

//         {listingType === 'produce' && (
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <span className="text-[#666666]">Crop:</span>
//               <span className="ml-2 font-medium">{listingData.cropName || 'Not specified'}</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Quantity:</span>
//               <span className="ml-2 font-medium">{listingData.quantity || '0'} {listingData.unit || 'kg'}</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Harvest Date:</span>
//               <span className="ml-2 font-medium">{listingData.harvestDate || 'Not specified'}</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Price Type:</span>
//               <span className="ml-2 font-medium">{listingData.priceType || 'Not specified'}</span>
//             </div>
//           </div>
//         )}


//         {listingType === 'warehouse' && (
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <span className="text-[#666666]">Facility:</span>
//               <span className="ml-2 font-medium">{listingData.facilityName || 'Not specified'}</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Capacity:</span>
//               <span className="ml-2 font-medium">{listingData.capacity || '0'} sq ft</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Storage Types:</span>
//               <span className="ml-2 font-medium">{listingData.storageTypes?.join(', ') || 'Not specified'}</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Pricing:</span>
//               <span className="ml-2 font-medium">{listingData.pricingModel || 'Not specified'}</span>
//             </div>
//           </div>
//         )}

//         {listingType === 'transport' && (
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <span className="text-[#666666]">Vehicle:</span>
//               <span className="ml-2 font-medium">{listingData.vehicleType || 'Not specified'}</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Capacity:</span>
//               <span className="ml-2 font-medium">{listingData.capacity || '0'} tons</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Route:</span>
//               <span className="ml-2 font-medium">{listingData.routes?.from || 'Not specified'} to {listingData.routes?.to || 'Not specified'}</span>
//             </div>
//             <div>
//               <span className="text-[#666666]">Price per km:</span>
//               <span className="ml-2 font-medium">Rs. {listingData.pricePerKm || '0'}</span>
//             </div>
//           </div>
//         )}

//         <div className="pt-4 border-t border-[#e0e0e0]">
//           <div className="flex items-center justify-between">
//             <span className="text-sm text-[#666666]">Listing Duration:</span>
//             <span className="font-medium">{listingData.duration || 'Not specified'} days</span>
//           </div>
//           <div className="flex items-center justify-between mt-2">
//             <span className="text-sm text-[#666666]">Status:</span>
//             <span className="font-medium text-[#2eb5c2]">
//               {listingData.publishNow ? 'Will be published immediately' : 'Draft'}
//             </span>
//           </div>
//         </div>
//       </div>


//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <h4 className="font-medium text-blue-900 mb-2">Ready to Publish?</h4>
//         <p className="text-sm text-blue-700">
//           Your listing will be visible to other users immediately after publishing. You can edit or deactivate it anytime from your dashboard.
//         </p>
//       </div>
//     </SectionCard>



//     <SectionCard
//       title="Media"
//       icon="image"
//     >
//       <div>
//         <label className="block text-sm font-medium text-[#0b5d68] mb-2">
//           Photos (Upload 1-8 images)
//         </label>

//         <input
//           type="file"
//           multiple
//           accept="image/*"
//           onChange={(e) =>
//             updateFormData(
//               'product_images',
//               Array.from(e.target.files || [])
//             )
//           }
//         />

//         <p className="text-sm mt-2">
//           {listingData.product_images?.length || 0} images selected
//         </p>
//       </div>
//     </SectionCard>
//   </div>
// )

function PhotosStep({
  images,
  previews,
  errors,
  dragOver,
  submitAttempted,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInput,
  onRemove,
  fileRef,
  publishNow,
  onTogglePublish,
}: {
  images: File[]
  previews: string[]
  errors: any
  dragOver: boolean
  submitAttempted: boolean
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onFileInput: (f: FileList) => void
  onRemove: (i: number) => void
  fileRef: React.RefObject<HTMLInputElement>
  publishNow: boolean
  onTogglePublish: () => void
}) {
  return (
    <div className="space-y-4">

      {/* ── Upload zone ── */}
      <SectionCard title="Product Photos" icon="photo_library">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-8 transition-colors ${dragOver
            ? 'border-[#2eb5c2] bg-[#2eb5c2]/5'
            : submitAttempted && errors.images
              ? 'border-red-300 bg-red-50/60'
              : 'border-[#e2e8ea] bg-[#f7f9fa] hover:border-[#2eb5c2]/50 hover:bg-[#eef8f9]'
            }`}
        >
          <span
            className="material-symbols-outlined mb-2 text-[#2eb5c2]"
            style={{ fontSize: '36px' }}
          >
            cloud_upload
          </span>
          <p className="text-sm font-semibold text-[#0b5d68]">
            {dragOver ? 'Drop here' : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-xs text-[#999]">
            PNG, JPG, WEBP · {MAX_MB} MB max · up to {MAX_IMG} images
          </p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files && onFileInput(e.target.files)}
          />
        </div>
        {submitAttempted && <Err msg={errors.images} />}

        {/* ── Previews grid ── */}
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {previews.map((src, i) => (
              <div
                key={src}
                className="group relative aspect-square overflow-hidden rounded-md border border-[#e8ecee]"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {/* Cover badge on first image */}
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0b5d68]/80 py-px text-center text-[8px] font-bold text-white">
                    Cover
                  </div>
                )}
                {/* Remove button */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove(i) }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
                </button>
              </div>
            ))}

            {/* Add-more tile */}
            {images.length < MAX_IMG && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-[#e2e8ea] text-[#bbb] hover:border-[#2eb5c2] hover:text-[#2eb5c2]"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
              </button>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Visibility / publish toggle ── */}
      <SectionCard title="Visibility" icon="visibility">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={publishNow}
            onChange={onTogglePublish}
            className="h-4 w-4 cursor-pointer accent-[#0b5d68]"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0b5d68]">Publish immediately</p>
            <p className="text-xs text-[#999]">Listing goes live as soon as it's submitted</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${publishNow ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
          >
            {publishNow ? 'Live' : 'Draft'}
          </span>
        </label>
      </SectionCard>

    </div>
  )
}



export default DynamicForm
