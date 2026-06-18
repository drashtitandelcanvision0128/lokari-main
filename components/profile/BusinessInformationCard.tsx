'use client'

import Input from '@/components/common/Input'

interface Props {
    user: any
    setUser: any
}

export default function BusinessInformationCard({
    user,
    setUser
}: Props) {

    return (

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">


            <div className="bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68] text-white px-6 py-4">

                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">
                        Business Information
                    </h3>

                    <button
                        className="bg-white/20 border border-white/30 text-white hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        Edit Profile
                    </button>
                </div>

            </div>



            <div className="p-6 space-y-6">


                <div className="grid md:grid-cols-2 gap-4">

                    <div>
                        <label className="text-sm font-semibold text-[#0b5d68]">
                            Full Name
                        </label>

                        <Input
                            value={user.name}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    name: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-[#0b5d68]">
                            Email
                        </label>

                        <Input
                            value={user.email}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    email: e.target.value
                                })
                            }
                        />
                    </div>

                </div>

                <div className="grid md:grid-cols-2 gap-4">

                    <div>
                        <label className="text-sm font-semibold text-[#0b5d68]">
                            Business Location
                        </label>

                        <Input
                            value={user.businessLocation || ''}
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-[#0b5d68]">
                            Business Type
                        </label>

                        <Input
                            value={user.businessType || ''}
                            readOnly
                        />
                    </div>

                </div>



                <div>

                    <label className="text-sm font-semibold text-[#0b5d68]">
                        Phone
                    </label>


                    <Input

                        value={user.phone || ''}

                        onChange={(e) =>
                            setUser({
                                ...user,
                                phone: e.target.value
                            })
                        }

                    />

                </div>



                <div>

                    <label className="text-sm font-semibold text-[#0b5d68]">
                        Description
                    </label>


                    <textarea

                        rows={4}

                        value={user.bio || ''}

                        onChange={(e) =>
                            setUser({
                                ...user,
                                bio: e.target.value
                            })
                        }

                        className="w-full border rounded-lg p-3"

                    />


                </div>


            </div>


        </div>


    )

}