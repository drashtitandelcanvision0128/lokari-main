import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import Input from '@/components/common/Input'
import { useEffect, useState } from 'react'
import { apiUrl, authHeaders } from '@/lib/api';


interface EditUserListingModalProps {
    isOpen: boolean
    listing: any
    onClose: () => void
    onSuccess: () => Promise<void>
}

const SectionCard = ({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) => (
    <div className=" bg-white
    rounded-3xl
    border border-[#eef2f4]
    p-6
    shadow-[0_4px_20px_rgba(0,0,0,0.04)]
    hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    transition-all">
        <h3 className="text-base font-bold text-[#0b5d68] mb-5">
            {title}
        </h3>
        {children}
    </div>
)

export default function EditUserListingModal({
    isOpen,
    listing,
    onClose,
    onSuccess,
}: EditUserListingModalProps) {

    const [formData, setFormData] = useState({
        product: '',
        listingLocation: '',
        price: '',
        priceType: '',
        listingType: '',
        quantity: '',
        description: '',
    })

    useEffect(() => {
        if (listing) {
            setFormData({
                product: listing.product || '',
                listingLocation: listing.listingLocation || '',
                price: listing.price || '',
                priceType: listing.priceType || '',
                listingType: listing.listingType || '',
                quantity: listing.quantity || '',
                description: listing.description || '',
            })
        }
    }, [listing])

    const handleSave = async () => {
        try {
            console.log("EDIT LISTING:", listing)
            const response = await fetch(
                // apiUrl(`/listings/${listing.listing_id}`),
                apiUrl(`/listings/${listing.id}`),
                {
                    method: 'PUT',
                    headers: {
                        ...authHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: formData.product,
                        description: formData.description,
                        price: formData.price.replace('₹', ''),
                        listing_location: formData.listingLocation,
                        quantity: formData.quantity.replace(' kg', ''),
                    }),
                }
            )

            const result = await response.json()

            if (result.success) {
                await onSuccess()
                onClose()
            }

        } catch (error) {
            console.error(error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#f9f9f7] rounded-3xl shadow-2xl">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#f9f9f7] to-[#f0f9ff] p-6 border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-[#0b5d68]">
                                Edit Listing
                            </h2>

                            <p className="text-sm text-[#666666] mt-1">
                                Manage your marketplace item
                            </p>
                        </div>

                        <button onClick={onClose}>
                            <Icon name="close" />
                        </button>
                    </div>
                </div>
                {/* Product Preview */}
                <div className="p-4">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left */}
                        <div className="space-y-6">
                            <SectionCard title="Product Image">
                                <div className="overflow-hidden rounded-2xl">
                                    <img
                                        // src={listing?.images?.[0] || '/placeholder-image.jpg'}
                                        src="https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg"
                                        alt={listing?.product}
                                        // className="w-full h-64 object-cover"
                                        className="w-full h-[320px] object-cover"
                                    />
                                </div>
                            </SectionCard>

                        </div>

                        {/* Right */}
                        <div className="lg:col-span-2 space-y-6">
                            <SectionCard title="Listing Information">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                                    <div className="space-y-4">

                                        <div>
                                            <label className="text-sm font-semibold text-[#0b5d68]">
                                                Title
                                            </label>

                                            <Input
                                                value={formData.product}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        product: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>



                                        <div>
                                            <label className="text-sm font-semibold text-[#0b5d68]">
                                                Location
                                            </label>

                                            <Input
                                                value={formData.listingLocation}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        listingLocation: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                    </div>

                                    <div className="space-y-4">

                                        <div>
                                            <label className="text-sm font-semibold text-[#0b5d68]">
                                                Price
                                            </label>

                                            <Input
                                                value={formData.price}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        price: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-[#0b5d68]">
                                                Price Type
                                            </label>

                                            <Input
                                                value={listing?.priceType || ''}
                                                readOnly
                                            />
                                        </div>

                                        {/* <div>
                                            <label className="text-sm font-semibold text-[#0b5d68]">
                                                Status
                                            </label>

                                            <Input
                                                value={listing?.status || ''}
                                                readOnly
                                            />
                                        </div> */}

                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Listing Details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

                                    <div>
                                        <label className="text-sm font-semibold text-[#0b5d68]">
                                            Listing Type
                                        </label>

                                        <Input
                                            value={listing?.listingType || ''}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-[#0b5d68]">
                                            Quantity
                                        </label>

                                        <Input
                                            value={formData.quantity}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    quantity: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                </div>
                            </SectionCard>
                        </div>


                    </div>
                    <SectionCard title="Description">
                        <div>
                            {/* <label className="text-sm font-semibold text-[#0b5d68]">
                                Description
                            </label> */}

                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                className="
        h-24
        w-full
        px-3
        py-2
        border
        border-[#e0e0e0]
        rounded-lg
        shadow-sm
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-[#0b5d68]
        focus:border-[#0b5d68]
    "
                            />
                        </div>
                    </SectionCard>
                    <div className="sticky bottom-0 bg-white border-t p-5 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button onClick={handleSave}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}