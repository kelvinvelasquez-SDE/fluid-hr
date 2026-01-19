interface EmployeeCardProps {
    id: string;
    name: string;
    position: string;
    department: string;
    salary: number;
    hasInconsistency?: boolean;
    avatarUrl?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

export function EmployeeCard({
    id,
    name,
    position,
    department,
    salary,
    hasInconsistency = false,
    avatarUrl,
    onClick,
    children,
}: EmployeeCardProps) {
    // Generar iniciales del nombre
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            onClick={onClick}
            className={`glass-card p-6 cursor-pointer transition-all duration-300 ${hasInconsistency ? 'inconsistency-highlight' : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                            {initials}
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-white">{name}</h3>
                        <p className="text-sm text-white/50">{position}</p>
                    </div>
                </div>
                {hasInconsistency && (
                    <span className="px-2 py-1 text-xs rounded-full badge-error">
                        Revisar
                    </span>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                    <span className="text-white/50">Departamento</span>
                    <span className="text-white">{department}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                    <span className="text-white/50">Salario Bruto</span>
                    <span className="font-semibold text-white">${salary.toLocaleString()}</span>
                </div>
            </div>

            {children && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    {children}
                </div>
            )}
        </div>
    );
}

export default EmployeeCard;
