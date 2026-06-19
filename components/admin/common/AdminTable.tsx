//Reuseable Admin table Wrapper
interface AdminTableProps {
    children: React.ReactNode
}

export default function AdminTable({
    children,
}: AdminTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                {children}
            </div>
        </div>
    )
}