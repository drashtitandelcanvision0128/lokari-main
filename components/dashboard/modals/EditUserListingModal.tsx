import { Icon } from '@/components/ui/Icon'
import { useEffect, useState } from 'react'
import { apiUrl, authHeaders } from '@/lib/api';

interface EditUserListingModalProps {
    isOpen: boolean
    listing: any
    onClose: () => void
    onSuccess: () => Promise<void>
}

// ── Field wrapper ──────────────────────────────────────────────────────────────
const Field = ({
    label,
    icon,
    children,
    readOnly = false,
}: {
    label: string
    icon?: string
    children: React.ReactNode
    readOnly?: boolean
}) => (
    <div className="flex flex-col gap-1">
        <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0b5d68]/70">
            <span
                className="material-symbols-outlined text-[#2eb5c2]"
                style={{ fontSize: '21px' }}
            >
                {icon}
            </span>
            {label}
            {readOnly && (
                <span className="ml-auto text-[0.65rem] font-medium text-[#999] normal-case tracking-normal">
                    read-only
                </span>
            )}
        </label>
        {children}
    </div>
)

// ── Editable input ─────────────────────────────────────────────────────────────
const PremiumInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`
            w-full px-3.5 py-2.5 rounded-md text-sm text-[#1a1a1a]
            bg-white border border-[#e2e8ea]
            placeholder:text-[#bbb]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]/30 focus:border-[#2eb5c2]
            hover:border-[#2eb5c2]/50
            shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]
            ${props.className ?? ''}
        `}
    />
)

// ── Read-only display ──────────────────────────────────────────────────────────
const ReadOnlyField = ({ value }: { value: string }) => (
    <div className="
        w-full px-3.5 py-2.5 rounded-md text-sm text-[#666]
        bg-[#f5f7f8] border border-[#e8ecee]
        select-none cursor-default
    ">
        {value || <span className="text-[#bbb]">—</span>}
    </div>
)

// ── Section card ───────────────────────────────────────────────────────────────
const SectionCard = ({
    title,
    icon,
    children,
    showHeader = true,
    noPadding = false,
    action,
}: {
    title: string
    icon?: string
    children: React.ReactNode
    showHeader?: boolean
    noPadding?: boolean
    action?: React.ReactNode
}) => (
    <div className="
    bg-white rounded-lg
    border border-[#e8ecee]
        shadow-[0_1px_4px_rgba(11,93,104,0.06)]
        overflow-hidden
    ">
        {showHeader && (
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0f4f5]">

                <div className="flex items-center gap-2">
                    <span
                        className="material-symbols-outlined text-[#2eb5c2]"
                        style={{ fontSize: '20px' }}
                    >
                        {icon}
                    </span>

                    <h3 className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[#0b5d68]">
                        {title}
                    </h3>
                </div>

                {action}

            </div>
        )}
        <div className={noPadding ? '' : 'p-3'}>
            {children}
        </div>
    </div>
)

// ── Main modal ─────────────────────────────────────────────────────────────────
export default function EditUserListingModal({
    isOpen,
    listing,
    onClose,
    onSuccess,
}: EditUserListingModalProps) {

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        priceType: '',
        listingType: '',
        quantity: '',
        description: '',
    })
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    })

    const [tempAddress, setTempAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    })
    const [saving, setSaving] = useState(false)

    const [addressError, setAddressError] = useState<string | null>(null)
    const [addressSaved, setAddressSaved] = useState(false)
    const [addressErrors, setAddressErrors] = useState<any>({})


    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [addressModalOpen, setAddressModalOpen] = useState(false)
    useEffect(() => {
        if (!listing) return;

        setFormData({
            title: listing.product || '',
            price: listing.price || '',
            priceType: listing.priceType || '',
            listingType: listing.listingType || '',
            quantity: listing.quantity || '',
            description: listing.description || '',
        });

        const loadedAddress = {
            street: listing.address?.street || '',
            city: listing.address?.city || '',
            state: listing.address?.state || '',
            pincode: listing.address?.pincode || '',
            country: listing.address?.country || 'India',
        }

        setAddress(loadedAddress)
        setTempAddress(loadedAddress)

    }, [listing]);

    const handleSave = async () => {

        // console.log("SAVE CLICKED")
        // console.log("CURRENT LISTING:", listing)
        // console.log("CURRENT FORM:", formData)
        // console.log("SENDING PAYLOAD:", {
        //     title: formData.title,
        //     description: formData.description,
        //     price: formData.price.replace('₹', ''),
        //     quantity: formData.quantity.replace(/[^0-9.]/g, ''),
        //     address
        // })

        try {
            setSaving(true)
            console.log("EDIT LISTING:", listing)
            const response = await fetch(
                apiUrl(`/listings/${listing.id}`),
                {
                    method: 'PUT',
                    headers: {
                        ...authHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        price: formData.price.replace('₹', ''),
                        quantity: formData.quantity.replace(/[^0-9.]/g, ''),

                        address: {
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode,
                            country: address.country
                        }
                    }),
                }
            )

            const result = await response.json()
            console.log("UPDATE RESPONSE:", result)

            if (result.success) {
                await onSuccess()
                onClose()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const validateAddress = () => {
        const errs: Record<string, string> = {}
        const street = (tempAddress.street || '').trim()
        const city = (tempAddress.city || '').trim()
        const state = (tempAddress.state || '').trim()
        const pincode = (tempAddress.pincode || '').trim()

        if (!street) errs.street = 'Street address is required.'
        else if (street.length < 5) errs.street = 'Enter a more complete street address.'
        else if (street.length > 200) errs.street = 'Street address is too long.'

        if (!city) errs.city = 'City is required.'
        else if (city.length < 2) errs.city = 'Enter a valid city name.'

        if (!state) errs.state = 'Please select a state.'

        if (!pincode) errs.pincode = 'Pincode is required.'
        else if (!/^\d{6}$/.test(pincode)) errs.pincode = 'Pincode must be exactly 6 digits.'

        return errs
    }

    const closeAddressModal = () => {
        setTempAddress(address)
        setAddressErrors({})
        setAddressError(null)
        setAddressModalOpen(false)
    }

    const handleSaveAddress = () => {
        const errs = validateAddress()

        if (Object.keys(errs).length) {
            setAddressErrors(errs)
            return
        }

        setAddressErrors({})
        setAddressError(null)

        // Commit changes
        setAddress(tempAddress)

        setAddressSaved(true)

        setTimeout(() => {
            setAddressSaved(false)
            setAddressModalOpen(false)
        }, 1200)
    }

    if (!isOpen) return null

    const isLive = listing?.status === 'live'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(10, 30, 35, 0.55)', backdropFilter: 'blur(6px)' }}
        >
            {/* Modal shell */}
            <div
                className="
                    w-full max-w-5xl max-h-[98vh] flex flex-col
                    bg-[#f7f9fa] rounded-md
                    shadow-[0_32px_80px_rgba(11,93,104,0.18),0_0_0_1px_rgba(11,93,104,0.08)]
                    overflow-hidden
                "
            >
                {/* ── Header ── */}
                <div className="relative flex items-start justify-between px-7 pt-7 pb-5 bg-white border-b border-[#edf1f3] shrink-0">
                    {/* Teal accent bar */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0b5d68] via-[#2eb5c2] to-[#2eb5c2]/30 rounded-t-3xl" />

                    <div className="flex items-center gap-4">
                        {/* Icon badge */}
                        <div className="w-11 h-11 rounded-md bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] flex items-center justify-center shadow-md shrink-0">
                            <span className="material-symbols-outlined text-white text-[18px]">edit</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0b5d68] leading-tight">
                                Edit Listing
                            </h2>
                            <p className="text-xs text-[#888] mt-0.5 font-medium">
                                {listing?.product || 'Marketplace item'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live / Paused pill */}
                        <span className={`
                            inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border
                            ${isLive
                                ? 'bg-[#e6f8f9] text-[#0b8a96] border-[#2eb5c2]/30'
                                : 'bg-[#fdf0ec] text-[#c04a27] border-[#d55b39]/30'
                            }
                        `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#2eb5c2]' : 'bg-[#d55b39]'}`} />
                            {isLive ? 'Live' : 'Paused'}
                        </span>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="
                                w-8 h-8 rounded flex items-center justify-center
                                text-[#999] hover:text-[#0b5d68] hover:bg-[#f0f4f5]
                                transition-all duration-150
                            "
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                    {/* Top grid: image + info */}
                    <div className="grid lg:grid-cols-3 gap-3 items-start">

                        {/* Image card */}
                        <SectionCard title="title Image" showHeader={false} noPadding>
                            <div className="relative h-[295px] bg-gradient-to-br from-[#e8f4f5] to-[#d0ecee] overflow-hidden rounded">
                                <div className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(45deg, #2eb5c2 0, #2eb5c2 1px, transparent 0, transparent 50%)',
                                        backgroundSize: '12px 12px'
                                    }}
                                />
                                <img
                                    src="https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg"
                                    alt={listing?.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient overlay at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                        </SectionCard>

                        {/* Right side: 2 section cards */}
                        <div className="lg:col-span-2 flex flex-col gap-3">

                            {/* Listing Information */}
                            <SectionCard
                                title="Listing Information"
                                icon="store"
                                action={
                                    <button
                                        onClick={() => setIsEditingInfo(!isEditingInfo)}
                                        className="text-[#888] hover:text-[#0b5d68]"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {/* edit */}
                                            {isEditingInfo ? 'check_small' : 'edit_note'}
                                        </span>
                                    </button>
                                }
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Field label="Title" icon="title">
                                        {isEditingInfo ? (
                                            <PremiumInput
                                                value={formData.title}
                                                placeholder="e.g. Premium Organic Wheat"
                                                onChange={(e) =>
                                                    setFormData({ ...formData, title: e.target.value })
                                                }
                                            />
                                        ) : (
                                            <ReadOnlyField value={formData.title} />
                                        )}
                                    </Field>

                                    <Field label="Location" icon="location_on">
                                        <div className="relative">
                                            <ReadOnlyField
                                                value={
                                                    address.city && address.state
                                                        ? `${address.city}, ${address.state}`
                                                        : 'Not added'
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTempAddress(address)
                                                    setAddressErrors({})
                                                    setAddressError(null)
                                                    setAddressModalOpen(true)
                                                }}
                                                className="
        absolute right-2 top-2
        text-[#888]
        hover:text-[#0b5d68]
    "
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    edit_location
                                                </span>
                                            </button>
                                        </div>

                                    </Field>

                                    <Field label="Quantity" icon="scale">
                                        {isEditingInfo ? (
                                            <PremiumInput
                                                value={formData.quantity}
                                                placeholder="e.g. 500 kg"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        quantity: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <ReadOnlyField value={formData.quantity} />
                                        )}
                                    </Field>

                                    <Field label="Price" icon="payments">
                                        {isEditingInfo ? (
                                            <PremiumInput
                                                value={formData.price}
                                                placeholder="e.g. ₹1200"
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        price: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <ReadOnlyField value={formData.price} />
                                        )}
                                    </Field>

                                    <Field label="Listing Type" icon="category" readOnly>
                                        <ReadOnlyField value={(listing?.listingType || '').toUpperCase()} />
                                    </Field>

                                    <Field label="Price Type" icon="sell" readOnly>
                                        <ReadOnlyField value={(listing?.priceType || '').replace(/_/g, ' ')} />
                                    </Field>


                                </div>
                            </SectionCard>
                        </div>
                    </div>

                    {/* Description — full width */}
                    <SectionCard title="Description" icon="notes">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[11px] text-[#888]">
                                Provide additional details about the listing.
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsEditingDescription(!isEditingDescription)}
                                className="text-[#888] hover:text-[#0b5d68]"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {/* edit */}
                                    {isEditingDescription ? 'check_small' : 'edit_note'}
                                </span>
                            </button>
                        </div>

                        {isEditingDescription ? (
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                className="
        w-full
        min-h-[120px]
        p-3
        rounded
        bg-[#fafafa]
        border border-[#e8ecee]
        text-[13px]
        text-[#555]
        resize-none
        focus:outline-none
        focus:ring-0
        focus:border-[#e8ecee]
        shadow-none
    "
                            />
                        ) : (
                            <div
                                className="
            min-h-[120px]
            p-3
            rounded
            bg-[#fafafa]
            border border-[#e8ecee]
            text-[13px]
            text-[#555]
            whitespace-pre-wrap
        "
                            >
                                {formData.description || 'No description provided'}
                            </div>
                        )}
                    </SectionCard>

                </div>

                {/* ── Sticky footer ── */}
                <div className="
                    shrink-0 px-6 py-4
                    bg-white border-t border-[#edf1f3]
                    flex items-center justify-between gap-3
                ">
                    <p className="text-xs text-[#aaa] hidden sm:block">
                        Changes will be visible in the marketplace immediately.
                    </p>

                    <div className="flex items-center gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="
                                px-5 py-2.5 rounded-md text-sm font-semibold
                                text-[#555] border border-[#e0e4e6]
                                bg-white hover:bg-[#f5f7f8] hover:border-[#cdd3d6]
                                transition-all duration-150
                            "
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="
                                inline-flex items-center gap-2
                                px-6 py-2.5 rounded-md text-sm font-semibold text-white
                                bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2]
                                hover:from-[#0a5260] hover:to-[#28a8b4]
                                active:scale-[0.98]
                                shadow-[0_2px_12px_rgba(46,181,194,0.35)]
                                hover:shadow-[0_4px_20px_rgba(46,181,194,0.45)]
                                transition-all duration-200
                                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                            "
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[17px]">check_circle</span>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {addressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeAddressModal}
                    />


                    <div className="
        relative w-full max-w-sm
        overflow-hidden rounded-2xl
        bg-white shadow-2xl
    ">


                        {/* Header */}
                        <div className="
          flex items-center justify-between
          border-b border-gray-100
          px-5 py-4
        ">

                            <div className="flex items-center gap-2">

                                <span className="
              material-symbols-outlined
              text-[#2eb5c2]
            ">
                                    home_pin
                                </span>


                                <h3 className="
              font-bold
              text-[#0b5d68]
            ">
                                    Update Address
                                </h3>

                            </div>


                            <button
                                type="button"
                                onClick={closeAddressModal}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <span className="material-symbols-outlined text-[1rem]">
                                    close
                                </span>
                            </button>

                        </div>


                        {/* Body */}
                        <div className="space-y-4 p-5">


                            <AddrField
                                label="Street Address"
                                required
                                error={addressErrors.street}
                            >
                                <input
                                    type="text"
                                    value={tempAddress.street}
                                    placeholder="House no., street name, area"
                                    onChange={(e) =>
                                        setTempAddress({
                                            ...tempAddress,
                                            street: e.target.value
                                        })
                                    }
                                    className={addrFieldCls(!!addressErrors.street)}
                                />
                            </AddrField>



                            <div className="grid grid-cols-2 gap-3">

                                <AddrField
                                    label="City / Area"
                                    required
                                    error={addressErrors.city}
                                >
                                    <input
                                        type="text"
                                        value={tempAddress.city}
                                        placeholder="City"
                                        onChange={(e) =>
                                            setTempAddress({
                                                ...tempAddress,
                                                city: e.target.value
                                            })
                                        }
                                        className={addrFieldCls(!!addressErrors.city)}
                                    />
                                </AddrField>



                                <AddrField
                                    label="State"
                                    required
                                    error={addressErrors.state}
                                >
                                    <select
                                        value={tempAddress.state}
                                        onChange={(e) =>
                                            setTempAddress({
                                                ...tempAddress,
                                                state: e.target.value
                                            })
                                        }
                                        className={`${addrFieldCls(
                                            !!addressErrors.state
                                        )} appearance-none`}
                                    >
                                        <option value="">Select</option>

                                        {INDIAN_STATES.map((state) => (
                                            <option key={state} value={state}>
                                                {state}
                                            </option>
                                        ))}
                                    </select>
                                </AddrField>


                            </div>


                            <div className="grid grid-cols-2 gap-3">
                                <AddrField
                                    label="Pincode"
                                    required
                                    error={addressErrors.pincode}
                                >
                                    <input
                                        type="text"
                                        value={tempAddress.pincode}
                                        placeholder="6-digit"
                                        maxLength={6}
                                        onChange={(e) =>
                                            setTempAddress({
                                                ...tempAddress,
                                                pincode: e.target.value.replace(/\D/g, '')
                                            })
                                        }
                                        className={addrFieldCls(!!addressErrors.pincode)}
                                    />
                                </AddrField>

                                <AddrField label="Country">
                                    <input
                                        type="text"
                                        value="India"
                                        readOnly
                                        className="
        w-full cursor-not-allowed rounded
        border border-gray-100
        bg-gray-50
        px-3 py-2
        text-sm text-gray-400
      "
                                    />
                                </AddrField>
                            </div>


                            {addressError && (
                                <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">
                                    {addressError}
                                </p>
                            )}

                            {addressSaved && (
                                <p className="flex items-center gap-1.5 rounded bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                                    <span className="material-symbols-outlined text-[0.9rem]">
                                        check_circle
                                    </span>
                                    Address saved!
                                </p>
                            )}
                        </div>


                        {/* Footer */}
                        <div className="
          flex justify-end gap-2
          border-t border-gray-100
          px-5 py-3
        ">


                            <button
                                onClick={closeAddressModal}
                                className="
rounded border border-gray-200
px-4 py-2 text-xs font-medium
text-gray-600
hover:bg-gray-50
"
                            >
                                Cancel
                            </button>



                            <button
                                onClick={handleSaveAddress}
                                className="
    inline-flex items-center gap-1.5
    rounded
    bg-gradient-to-r
    from-[#0b5d68]
    to-[#2eb5c2]
    px-4 py-2
    text-xs
    font-semibold
    text-white
  "
                            >
                                <span className="material-symbols-outlined text-[0.9rem]">
                                    save
                                </span>
                                Save Address
                            </button>


                        </div>


                    </div>

                </div>
            )}
        </div>
    )
}



const addrFieldCls = (err?: boolean) =>
    `w-full rounded border px-3 py-2 text-sm text-gray-700 transition-all focus:outline-none focus:ring-2 ${err
        ? 'border-red-400 hover:border-red-400 focus:border-red-400 focus:ring-red-400/20'
        : 'border-gray-200 hover:border-gray-300 focus:border-[#2eb5c2] focus:ring-[#2eb5c2]/30'
    }`

const INDIAN_STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

function AddrField({ label, required, error, children }: {
    label: string
    required?: boolean
    error?: string
    children: React.ReactNode
}) {
    return (
        <div>
            <label className="mb-1 block text-[11px] font-semibold text-gray-500">
                {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    )
}