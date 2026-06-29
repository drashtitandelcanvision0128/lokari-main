'use client';

import { useEffect, useState } from 'react';
// import { Listing } from '@/types/dashboard';
import { AdminListing } from '@/types/admin';
import { apiUrl, getAuthToken } from '@/lib/api';

interface UpdateListingImagesModalProps {
    open: boolean;
    listing: AdminListing | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpdateListingImagesModal({
    open,
    listing,
    onClose,
    onSuccess,
}: UpdateListingImagesModalProps) {

    const [listingImages, setListingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
    const [replacedImages, setReplacedImages] = useState<Record<number, File>>({});

    const [activeImage, setActiveImage] = useState(0);
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        if (open && listing) {
            setListingImages(listing.images || []);
            setNewImages([]);
            setReplacedImages({});
            setActiveImage(0);
            setCurrentImage(0);
        }
    }, [open, listing]);

    if (!open || !listing) return null;

    const closeImageModal = () => {
        setListingImages(listing.images || []);
        setReplacedImages({});
        setNewImages([]);
        onClose();
        setActiveImage(0);
    };

    const getImageSrc = (img?: string) => {
        if (!img) return '';

        if (img.startsWith('blob:')) return img;
        if (img.startsWith('http')) return img;

        return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`;
    };


    const buildFormData = () => {
        const formData = new FormData();

        // Existing images (mark replaced ones)
        const existingWithPlaceholders = listingImages.map((img, index) =>
            replacedImages[index] ? '__replaced__' : img
        );

        formData.append(
            'existingImages',
            JSON.stringify(existingWithPlaceholders)
        );

        // Replacement images
        const replacedEntries = Object.entries(replacedImages);

        replacedEntries.forEach(([_, file]) => {
            formData.append('replaced_images', file);
        });

        formData.append(
            'replacedIndices',
            JSON.stringify(
                replacedEntries.map(([index]) => Number(index))
            )
        );

        // Newly uploaded images
        newImages.forEach((file) => {
            formData.append('product_images', file);
        });

        return formData;
    };

    const saveImages = async () => {
        if (!listing) return;

        const formData = buildFormData();

        const res = await fetch(
            apiUrl(`/listings/${listing.id}/images`),
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: formData,
            }
        );

        const result = await res.json();

        if (!result.success) return;

        onSuccess();
        closeImageModal();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                // className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                className="absolute inset-0 bg-black/50"
                onClick={closeImageModal}
            />

            <div
                className="
            relative w-full max-w-lg
            rounded-2xl bg-white shadow-2xl
            overflow-hidden
        "
            >
                {/* Header */}
                <div className="relative bg-white border-b border-[#edf1f3]">
                    {/* Accent bar */}
                    <div
                        className="
            absolute top-0 left-0 w-full h-[3px]
            bg-gradient-to-r
            from-[#0b5d68]
            via-[#2eb5c2]
            to-[#2eb5c2]/30
        "
                    />

                    <div className="flex items-center justify-between px-5 pt-5 pb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="
                    w-10 h-10
                    rounded-md
                    bg-gradient-to-br
                    from-[#0b5d68]
                    to-[#2eb5c2]
                    flex items-center justify-center
                    shadow-md
                "
                            >
                                <span className="material-symbols-outlined text-white text-[18px]">
                                    photo_library
                                </span>
                            </div>

                            <div>
                                <h3 className="font-bold text-[#0b5d68]">Update Images</h3>

                                <p className="text-[11px] text-[#888]">
                                    Manage listing gallery and cover image
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={closeImageModal}
                            className="
                w-8 h-8
                rounded
                flex items-center justify-center
                text-[#999]
                hover:bg-[#f3f6f7]
                hover:text-[#0b5d68]
                transition
            "
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="space-y-5">

                        {/* Big Preview */}
                        <div className="group relative">

                            <div className="relative h-72 rounded-2xl overflow-hidden bg-gray-100">

                                {listingImages.length > 0 && (
                                    <img
                                        // src={getImageSrc(listingImages[activeImage])}
                                        src={getImageSrc(listingImages[currentImage])}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {activeImage === 0 && (
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                                        Cover Image
                                    </div>
                                )}

                                {/* Previous */}

                                {listingImages.length > 1 && (
                                    <button
                                        // onClick={() =>
                                        //     setActiveImage(prev =>
                                        //         prev === 0
                                        //             ? listingImages.length - 1
                                        //             : prev - 1
                                        //     )
                                        // }
                                        onClick={() =>
                                            setCurrentImage(prev =>
                                                prev === 0 ? listingImages.length - 1 : prev - 1
                                            )
                                        }
                                        className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    opacity-0
                    group-hover:opacity-100

                    transition

                    w-10
                    h-10
                    rounded-full
                    bg-black/45
                    text-white
                    backdrop-blur-sm
                "
                                    >
                                        <span className="material-symbols-outlined">
                                            chevron_left
                                        </span>
                                    </button>
                                )}

                                {/* Next */}

                                {listingImages.length > 1 && (
                                    <button
                                        // onClick={() =>
                                        //     setActiveImage(prev =>
                                        //         prev === listingImages.length - 1
                                        //             ? 0
                                        //             : prev + 1
                                        //     )
                                        // }

                                        onClick={() =>
                                            setCurrentImage(prev =>
                                                prev === listingImages.length - 1 ? 0 : prev + 1
                                            )
                                        }
                                        className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2

                    opacity-0
                    group-hover:opacity-100

                    transition

                    w-10
                    h-10
                    rounded-full
                    bg-black/45
                    text-white
                    backdrop-blur-sm
                "
                                    >
                                        <span className="material-symbols-outlined">
                                            chevron_right
                                        </span>
                                    </button>
                                )}

                                {/* Replace */}

                                <label
                                    htmlFor="listing-image-replace"
                                    onClick={() => setReplacingIndex(activeImage)}
                                    className="
                absolute
                bottom-4
                left-4

                opacity-0
                group-hover:opacity-100

                transition

                cursor-pointer

                bg-white
                rounded-full

                w-10
                h-10

                flex
                items-center
                justify-center

                shadow-lg
            "
                                >
                                    <span className="material-symbols-outlined text-[#0b5d68]">
                                        upload
                                    </span>
                                </label>

                                {/* Delete */}

                                <button
                                    onClick={() => {

                                        setListingImages(prev =>
                                            prev.filter((_, i) => i !== activeImage)
                                        );

                                        setReplacedImages(prev => {
                                            const updated = { ...prev };
                                            delete updated[activeImage];
                                            return updated;
                                        });

                                        setActiveImage(prev =>
                                            Math.max(
                                                0,
                                                prev === listingImages.length - 1
                                                    ? prev - 1
                                                    : prev
                                            )
                                        );

                                    }}
                                    className="
                absolute
                bottom-4
                right-4

                opacity-0
                group-hover:opacity-100

                transition

                w-10
                h-10

                rounded-full

                bg-white

                shadow-lg

                flex
                items-center
                justify-center

                hover:text-red-500
            "
                                >
                                    ×
                                </button>

                            </div>

                        </div>


                        <div className="flex items-center justify-center gap-2 mt-4 mb-5">
                            {listingImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImage(index)}
                                    className={`
        rounded-full transition-all duration-300
        ${currentImage === index
                                            ? "w-6 h-2 bg-[#0b5d68]"
                                            : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                                        }
      `}
                                />
                            ))}
                        </div>

                        {/* Thumbnails */}

                        <div className="flex gap-3 overflow-x-auto pb-1">

                            {listingImages.map((img, index) => (

                                <button
                                    key={index}
                                    // onClick={() => setActiveImage(index)}
                                    onClick={() => setCurrentImage(index)}
                                    className={`
                    relative
                    flex-shrink-0

                    w-24
                    h-24

                    rounded-xl
                    overflow-hidden

                    border-2

                    transition

                    ${currentImage === index
                                            ? 'border-[#2eb5c2]'
                                            : 'border-transparent hover:border-gray-300'
                                        }
                `}
                                >
                                    <img
                                        src={getImageSrc(img)}
                                        className="w-full h-full object-cover"
                                    />

                                    {index === 0 && (
                                        <div className="absolute bottom-1 left-1 right-1 rounded bg-black/55 text-white text-[9px] py-0.5">
                                            Cover
                                        </div>
                                    )}

                                </button>

                            ))}

                        </div>

                    </div>



                    {/* Hidden input for per-image replacement */}
                    <input
                        id="listing-image-replace"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file || replacingIndex === null) return;

                            const objectUrl = URL.createObjectURL(file);

                            // Swap the image at replacingIndex with a preview URL
                            setListingImages((prev) =>
                                prev.map((img, i) => (i === replacingIndex ? objectUrl : img)),
                            );

                            // Track the replacement so saveImages can send it
                            setReplacedImages((prev) => ({
                                ...prev,
                                [replacingIndex]: file,
                            }));

                            setReplacingIndex(null);
                            e.target.value = ''; // reset so same file can be re-selected
                        }}
                    />

                    <label
                        htmlFor="listing-image-upload"
                        className="
        mt-4
        flex flex-col items-center justify-center
        gap-2
        p-6
        border-2 border-dashed border-[#2eb5c2]/30
        rounded-xl
        bg-[#f8fcfc]
        cursor-pointer
        hover:border-[#2eb5c2]
        hover:bg-[#f2fbfc]
        transition
    "
                    >
                        <span
                            className="
            material-symbols-outlined
            text-[#2eb5c2]
            text-[32px]
        "
                        >
                            cloud_upload
                        </span>

                        <div className="text-sm font-semibold text-[#0b5d68]">Choose Images</div>

                        <div className="text-xs text-gray-500">
                            PNG, JPG, WEBP • Multiple files allowed
                        </div>

                        {newImages.length > 0 && (
                            <div
                                className="
            mt-2
            px-3 py-1
            rounded-full
            bg-[#2eb5c2]/10
            text-[#0b5d68]
            text-xs
            font-medium
        "
                            >
                                {newImages.length} file{newImages.length > 1 ? 's' : ''} selected
                            </div>
                        )}
                    </label>

                    <input
                        id="listing-image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            if (!e.target.files) return;

                            setNewImages(Array.from(e.target.files));
                        }}
                    />
                </div>

                {/* Footer */}
                <div
                    className="
        flex items-center justify-between
        gap-3
        px-5 py-4
        bg-white
        border-t border-[#edf1f3]
    "
                >
                    {/* <p className="text-xs text-[#999]">
                                The first image will be used as the cover image.
                            </p> */}

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={closeImageModal}
                            className="
                px-4 py-2
                rounded-md
                text-sm font-medium
                text-[#555]
                border border-[#e0e4e6]
                bg-white
                hover:bg-[#f5f7f8]
                hover:border-[#cdd3d6]
                transition-all
            "
                        >
                            Cancel
                        </button>

                        <button
                            onClick={saveImages}
                            className="
                inline-flex items-center gap-2
                px-5 py-2
                rounded-md
                text-sm font-semibold
                text-white
                bg-gradient-to-r
                from-[#0b5d68]
                to-[#2eb5c2]
                hover:from-[#0a5260]
                hover:to-[#28a8b4]
                shadow-[0_2px_12px_rgba(46,181,194,0.35)]
                transition-all
            "
                        >
                            <span className="material-symbols-outlined text-[16px]">save</span>
                            Save Images
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}