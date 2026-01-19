"use client";

import { useState } from "react";

export type PermissionLevel = 1 | 2 | 3;

interface PermissionSelectorProps {
    value: PermissionLevel;
    onChange: (level: PermissionLevel) => void;
    disabled?: boolean;
}

const PERMISSION_LEVELS = [
    {
        level: 1 as PermissionLevel,
        name: "Solo Lectura",
        description: "Ver información de empleados y reportes",
        icon: "👁️",
        color: "from-gray-500 to-gray-600",
    },
    {
        level: 2 as PermissionLevel,
        name: "Editor",
        description: "Editar empleados y marcas de asistencia",
        icon: "✏️",
        color: "from-blue-500 to-indigo-600",
    },
    {
        level: 3 as PermissionLevel,
        name: "Administrador",
        description: "Ver salarios, cerrar planilla, configurar licencias",
        icon: "👑",
        color: "from-purple-500 to-pink-600",
    },
];

export function PermissionSelector({
    value,
    onChange,
    disabled = false,
}: PermissionSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-white/70">
                Nivel de Permisos
            </label>

            <div className="grid gap-3">
                {PERMISSION_LEVELS.map((perm) => {
                    const isSelected = value === perm.level;

                    return (
                        <button
                            key={perm.level}
                            type="button"
                            onClick={() => !disabled && onChange(perm.level)}
                            disabled={disabled}
                            className={`
                w-full p-4 rounded-xl text-left transition-all duration-300
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected
                                    ? `bg-gradient-to-r ${perm.color} shadow-lg scale-[1.02]`
                                    : 'glass hover:bg-white/10'
                                }
              `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-xl
                  ${isSelected ? 'bg-white/20' : 'bg-white/5'}
                `}>
                                    {perm.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{perm.name}</span>
                                        <span className={`
                      px-2 py-0.5 text-xs rounded-full
                      ${isSelected ? 'bg-white/20' : 'bg-white/10'}
                    `}>
                                            Nivel {perm.level}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                                        {perm.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="text-xs text-white/40 mt-2">
                Los permisos se aplican a todas las funciones del sistema
            </p>
        </div>
    );
}

export default PermissionSelector;
