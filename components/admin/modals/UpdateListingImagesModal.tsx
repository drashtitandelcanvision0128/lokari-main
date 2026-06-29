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

    useEffect(() => {
        if (open && listing) {
            setListingImages(listing.images || []);
            setNewImages([]);
            setReplacedImages({});
        }
    }, [open, listing]);

    if (!open || !listing) return null;

    const closeImageModal = () => {
        setListingImages(listing.images || []);
        setReplacedImages({});
        setNewImages([]);
        onClose();
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
                    <div
                        className="
                    grid grid-cols-3 gap-3
                "
                    >
                        {listingImages.map((img, index) => (
                            <div
                                key={img}
                                className="
        group
        relative
        h-28
        rounded
        overflow-hidden
        bg-gray-100
    "
                            >
                                {index === 0 && (
                                    <div
                                        className="
                                                absolute top-2 left-2 z-10
                                                px-2 py-1
                                                rounded-md
                                                bg-black/45
                                                backdrop-blur-md
                                                text-white
                                                text-[10px]
                                                font-medium
                                                tracking-wide
                                            "
                                    >
                                        Cover Image
                                    </div>


                                )}

                                <img
                                    src={getImageSrc(img)}
                                    className="
        w-full
        h-full
        object-cover
        transition-transform
        duration-300
        group-hover:scale-105
    "
                                />

                                <div
                                    className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        bg-black/40
        opacity-0
        group-hover:opacity-100
        transition
    "
                                >
                                    <label
                                        htmlFor="listing-image-replace" // ← shared input, index tracked via state
                                        onClick={() => setReplacingIndex(index)}
                                        className="
            w-10
            h-10
            rounded-full
            bg-white/90
            flex
            items-center
            justify-center
            cursor-pointer
            shadow-lg
            hover:bg-white
            transition
        "
                                    >
                                        <span className="material-symbols-outlined text-[#0b5d68] text-[22px]">
                                            upload
                                        </span>
                                    </label>
                                </div>
                                <button
                                    onClick={() => {
                                        setListingImages((prev) => prev.filter((_, i) => i !== index));

                                        setReplacedImages((prev) => {
                                            const updated = { ...prev };
                                            delete updated[index];
                                            return updated;
                                        });
                                    }}
                                    className="
    absolute top-1.5 right-1.5
    w-5 h-5
    rounded-full
    bg-[#faf7f2]
    border border-[#f0ebe3]
    flex items-center justify-center
    text-[#666]
    shadow-sm
    transition-all duration-300
    hover:bg-white
    hover:text-red-500
    group/delete
"
                                >
                                    <span
                                        className="
        block text-sm
        leading-none
        transition-transform duration-300
        group-hover/delete:rotate-90
    "
                                    >
                                        ×
                                    </span>
                                </button>
                            </div>
                        ))}
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