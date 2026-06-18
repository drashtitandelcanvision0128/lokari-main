'use client'

interface ProfileCardProps {
    user: any
}

export default function ProfileCard({
    user
}: ProfileCardProps) {

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68]" />

            <div className="relative px-6 pb-6">

                {/* Avatar */}
                <div className="absolute -top-12 left-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68] rounded-full flex items-center justify-center shadow-lg border-4 border-white">

                        <span className="text-3xl font-bold text-white">
                            {user.name?.charAt(0)}
                        </span>

                    </div>
                </div>


                <div className="pt-14">

                    <h2 className="text-2xl font-bold text-[#0b5d68]">
                        {user.name}
                    </h2>

                    <p className="text-gray-600 text-sm">
                        {user.email}
                    </p>


                    <div className="mt-6 space-y-3">

                        <div className="grid grid-cols-3 gap-3 mt-6">

                            <div className="bg-[#f9f9f7] rounded-xl p-4 text-center">
                                <h3 className="text-xl font-bold text-[#0b5d68]">
                                    {user.listings || 0}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Listings
                                </p>
                            </div>

                            <div className="bg-[#f9f9f7] rounded-xl p-4 text-center">
                                <h3 className="text-xl font-bold text-[#0b5d68]">
                                    {user.completed || 0}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Completed
                                </p>
                            </div>

                            <div className="bg-[#f9f9f7] rounded-xl p-4 text-center">
                                <h3 className="text-xl font-bold text-[#0b5d68]">
                                    {user.createdAt
                                        ? new Date(user.createdAt).getFullYear()
                                        : 'N/A'}
                                </h3>

                                <p className="text-xs text-gray-500">
                                    Since
                                </p>
                            </div>

                        </div>

                        <div className="flex justify-between items-center px-4 py-2.5 bg-[#f9f9f7] rounded-lg">
                            <span className="text-sm text-gray-500">
                                Role
                            </span>

                            <span className="text-sm text-[#0b5d68] capitalize">
                                {user.role}
                            </span>
                        </div>


                        <div className="flex justify-between items-center px-4 py-2.5 bg-[#f9f9f7] rounded-lg">
                            <span className="text-sm text-gray-500">
                                Location
                            </span>

                            <span className="text-sm text-[#0b5d68]">
                                {user.location || "Not added"}
                            </span>
                        </div>

                    </div>


                </div>

            </div>

        </div>
    )
}