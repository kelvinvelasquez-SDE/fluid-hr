import { DesglosePlanilla } from "@/lib/calculadora-salarial";

interface PayrollSummaryProps {
    items: {
        employeeName: string;
        desglose: DesglosePlanilla;
    }[];
    periodLabel: string;
}

export function PayrollSummary({ items, periodLabel }: PayrollSummaryProps) {
    // Calcular totales
    const totals = items.reduce(
        (acc, item) => ({
            bruto: acc.bruto + item.desglose.salarioBruto,
            isss: acc.isss + item.desglose.isssLaboral,
            afp: acc.afp + item.desglose.afpLaboral,
            renta: acc.renta + item.desglose.rentaISR,
            neto: acc.neto + item.desglose.salarioNeto,
            patronalIsss: acc.patronalIsss + item.desglose.isssPatronal,
            patronalAfp: acc.patronalAfp + item.desglose.afpPatronal,
            insaforp: acc.insaforp + item.desglose.insaforp,
        }),
        {
            bruto: 0,
            isss: 0,
            afp: 0,
            renta: 0,
            neto: 0,
            patronalIsss: 0,
            patronalAfp: 0,
            insaforp: 0,
        }
    );

    const totalPatronal = totals.patronalIsss + totals.patronalAfp + totals.insaforp;

    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Resumen de Planilla</h2>
                <span className="px-3 py-1 text-sm rounded-full bg-indigo-500/20 text-indigo-400">
                    {periodLabel}
                </span>
            </div>

            {/* Totales principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-white/50">Salarios Brutos</p>
                    <p className="text-2xl font-bold mt-1">${totals.bruto.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-white/50">Total Deducciones</p>
                    <p className="text-2xl font-bold mt-1 text-red-400">
                        -${(totals.isss + totals.afp + totals.renta).toFixed(2)}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-white/50">Salarios Netos</p>
                    <p className="text-2xl font-bold mt-1 text-green-400">${totals.neto.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-white/50">Carga Patronal</p>
                    <p className="text-2xl font-bold mt-1 text-yellow-400">${totalPatronal.toFixed(2)}</p>
                </div>
            </div>

            {/* Desglose de deducciones */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/70">Desglose de Deducciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/60">ISSS (3%)</span>
                        <span className="font-semibold">${totals.isss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/60">AFP (7.25%)</span>
                        <span className="font-semibold">${totals.afp.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/60">Renta (ISR)</span>
                        <span className="font-semibold">${totals.renta.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Desglose patronal */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/70">Aportes Patronales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/60">ISSS (7.5%)</span>
                        <span className="font-semibold">${totals.patronalIsss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/60">AFP (8.75%)</span>
                        <span className="font-semibold">${totals.patronalAfp.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/60">INSAFORP (1%)</span>
                        <span className="font-semibold">${totals.insaforp.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Empleados */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/70">
                    Empleados ({items.length})
                </h3>
                <div className="overflow-x-auto">
                    <table className="table-glass">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th className="text-right">Bruto</th>
                                <th className="text-right">ISSS</th>
                                <th className="text-right">AFP</th>
                                <th className="text-right">Renta</th>
                                <th className="text-right">Neto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.employeeName}</td>
                                    <td className="text-right">${item.desglose.salarioBruto.toFixed(2)}</td>
                                    <td className="text-right text-red-400">-${item.desglose.isssLaboral.toFixed(2)}</td>
                                    <td className="text-right text-red-400">-${item.desglose.afpLaboral.toFixed(2)}</td>
                                    <td className="text-right text-red-400">-${item.desglose.rentaISR.toFixed(2)}</td>
                                    <td className="text-right text-green-400 font-semibold">${item.desglose.salarioNeto.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PayrollSummary;
