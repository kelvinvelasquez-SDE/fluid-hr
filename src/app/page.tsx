"use client";

import { useState } from "react";
import { CalculadoraSalarialSV } from "@/lib/calculadora-salarial";

// Datos de ejemplo para demostración
const MOCK_EMPLOYEES = [
    { id: "1", name: "María García", position: "Desarrolladora Senior", salary: 1500, department: "Tecnología", hasInconsistency: false },
    { id: "2", name: "Carlos López", position: "Contador", salary: 1200, department: "Finanzas", hasInconsistency: false },
    { id: "3", name: "Ana Martínez", position: "Analista de RRHH", salary: 900, department: "Recursos Humanos", hasInconsistency: true },
    { id: "4", name: "José Hernández", position: "Gerente de Ventas", salary: 2500, department: "Ventas", hasInconsistency: false },
    { id: "5", name: "Laura Sánchez", position: "Diseñadora UX", salary: 1100, department: "Tecnología", hasInconsistency: true },
];

export default function Dashboard() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const calculadora = new CalculadoraSalarialSV(MOCK_EMPLOYEES.length);

    const handleGeneratePayroll = async () => {
        setIsGenerating(true);
        // Simular proceso
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsGenerating(false);
        alert("¡Planilla generada exitosamente!");
    };

    const getDesglose = (salario: number) => {
        return calculadora.generarDesglosePlanilla(salario);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                    <p className="text-white/60 mt-1">Quincena 2 - Enero 2026</p>
                </div>

                {/* Main CTA Button */}
                <button
                    onClick={handleGeneratePayroll}
                    disabled={isGenerating}
                    className="btn-primary text-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <div className="spinner w-5 h-5"></div>
                            Generando...
                        </>
                    ) : (
                        <>
                            <span className="text-xl">🚀</span>
                            Generar Planilla de la Quincena
                        </>
                    )}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-sm">Total Empleados</p>
                            <p className="text-3xl font-bold mt-1">{MOCK_EMPLOYEES.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <span className="text-2xl">👥</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-sm">Planilla Bruta</p>
                            <p className="text-3xl font-bold mt-1">
                                ${MOCK_EMPLOYEES.reduce((acc, e) => acc + e.salary, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <span className="text-2xl">💵</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-sm">Inconsistencias</p>
                            <p className="text-3xl font-bold mt-1 text-red-400">
                                {MOCK_EMPLOYEES.filter(e => e.hasInconsistency).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <span className="text-2xl">⚠️</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-sm">Estado Planilla</p>
                            <p className="text-lg font-semibold mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                Abierta
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Cards */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Empleados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {MOCK_EMPLOYEES.map((employee, index) => {
                        const desglose = getDesglose(employee.salary);
                        const isSelected = selectedEmployee === employee.id;

                        return (
                            <div
                                key={employee.id}
                                onClick={() => setSelectedEmployee(isSelected ? null : employee.id)}
                                className={`glass-card p-6 cursor-pointer animate-fadeIn ${employee.hasInconsistency ? 'inconsistency-highlight' : ''
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                                            {employee.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{employee.name}</h3>
                                            <p className="text-sm text-white/50">{employee.position}</p>
                                        </div>
                                    </div>
                                    {employee.hasInconsistency && (
                                        <span className="px-2 py-1 text-xs rounded-full badge-error">
                                            Revisar
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Departamento</span>
                                        <span>{employee.department}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-white/50">Salario Bruto</span>
                                        <span className="font-semibold">${employee.salary.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Desglose expandible */}
                                {isSelected && (
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2 animate-fadeIn">
                                        <h4 className="font-semibold text-sm text-indigo-400 mb-3">Desglose de Planilla</h4>

                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/50">ISSS (3%)</span>
                                                <span className="text-red-400">-${desglose.isssLaboral.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/50">AFP (7.25%)</span>
                                                <span className="text-red-400">-${desglose.afpLaboral.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/50">Renta (ISR)</span>
                                                <span className="text-red-400">-${desglose.rentaISR.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-white/10">
                                                <span className="text-white/50">Total Deducciones</span>
                                                <span className="text-red-400 font-semibold">-${desglose.totalDeducciones.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 text-lg">
                                                <span className="font-semibold">Salario Neto</span>
                                                <span className="font-bold text-green-400">${desglose.salarioNeto.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <p className="text-xs text-white/40">Aportes Patronales</p>
                                            <div className="flex gap-4 mt-1 text-xs">
                                                <span>ISSS: ${desglose.isssPatronal.toFixed(2)}</span>
                                                <span>AFP: ${desglose.afpPatronal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer note */}
            <div className="text-center text-white/30 text-sm pt-8">
                <p>Fluid-HR MVP • Cálculos según legislación salvadoreña 2024-2026</p>
            </div>
        </div>
    );
}
