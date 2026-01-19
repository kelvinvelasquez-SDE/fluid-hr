/**
 * CalculadoraSalarialSV - Motor de Cálculo de Planilla para El Salvador
 * 
 * Implementa los cálculos según la legislación salvadoreña:
 * - ISSS: 3% laboral (techo $1,000)
 * - AFP: 7.25% laboral (sin techo)
 * - Renta: 4 tramos según tabla de Hacienda 2024-2026
 * - Patronales: ISSS 7.5%, AFP 8.75%, INSAFORP 1%
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export interface DesglosePlanilla {
    // Ingresos
    salarioBruto: number;
    horasExtra: number;
    pagoHorasExtra: number;
    horasNocturnas: number;
    pagoNocturnidad: number;
    bonificaciones: number;
    totalIngresos: number;

    // Deducciones
    isssLaboral: number;
    afpLaboral: number;
    salarioGravable: number;
    rentaISR: number;
    otrasDeducciones: number;
    totalDeducciones: number;

    // Neto
    salarioNeto: number;

    // Patronales (referencia)
    isssPatronal: number;
    afpPatronal: number;
    insaforp: number;
    totalPatronal: number;
}

export interface PatronalResult {
    isssPatronal: number;
    afpPatronal: number;
    insaforp: number;
    total: number;
}

// ============================================
// CONSTANTS - TABLAS DE EL SALVADOR
// ============================================

// Techo ISSS: salario máximo para cálculo
const TECHO_ISSS = 1000.00;

// Porcentajes
const PORCENTAJE_ISSS_LABORAL = 0.03;  // 3%
const PORCENTAJE_AFP_LABORAL = 0.0725; // 7.25%
const PORCENTAJE_ISSS_PATRONAL = 0.075; // 7.5%
const PORCENTAJE_AFP_PATRONAL = 0.0875; // 8.75%
const PORCENTAJE_INSAFORP = 0.01; // 1%

// Tabla de Renta 2024-2026 (Hacienda El Salvador)
const TRAMOS_RENTA = [
    { tramoId: 1, desde: 0.01, hasta: 472.00, porcentaje: 0, cuotaFija: 0, exceso: 0 },
    { tramoId: 2, desde: 472.01, hasta: 895.24, porcentaje: 0.10, cuotaFija: 17.67, exceso: 472.00 },
    { tramoId: 3, desde: 895.25, hasta: 2038.10, porcentaje: 0.20, cuotaFija: 60.00, exceso: 895.24 },
    { tramoId: 4, desde: 2038.11, hasta: Infinity, porcentaje: 0.30, cuotaFija: 288.57, exceso: 2038.10 },
];

// Multiplicadores
const MULTIPLICADOR_HORAS_EXTRA = 2;
const PORCENTAJE_NOCTURNIDAD = 0.25;

// Umbral para INSAFORP
const MINIMO_EMPLEADOS_INSAFORP = 10;

// ============================================
// CALCULADORA PRINCIPAL
// ============================================

export class CalculadoraSalarialSV {
    private totalEmpleados: number;

    constructor(totalEmpleados: number = 0) {
        this.totalEmpleados = totalEmpleados;
    }

    /**
     * Calcula el ISSS laboral (3% con techo de $1,000)
     */
    calcularISSSLaboral(salarioBruto: number): number {
        const salarioBase = Math.min(salarioBruto, TECHO_ISSS);
        return this.redondear(salarioBase * PORCENTAJE_ISSS_LABORAL);
    }

    /**
     * Calcula el AFP laboral (7.25% sin techo)
     */
    calcularAFPLaboral(salarioBruto: number): number {
        return this.redondear(salarioBruto * PORCENTAJE_AFP_LABORAL);
    }

    /**
     * Calcula el salario gravable para renta
     * Salario Gravable = Salario Bruto - ISSS - AFP
     */
    calcularSalarioGravable(salarioBruto: number): number {
        const isss = this.calcularISSSLaboral(salarioBruto);
        const afp = this.calcularAFPLaboral(salarioBruto);
        return this.redondear(salarioBruto - isss - afp);
    }

    /**
     * Calcula la renta (ISR) según la tabla de tramos
     */
    calcularRenta(salarioGravable: number): number {
        // Si el salario es menor o igual al mínimo exento
        if (salarioGravable <= TRAMOS_RENTA[0].hasta) {
            return 0;
        }

        // Encontrar el tramo correspondiente
        for (const tramo of TRAMOS_RENTA) {
            if (salarioGravable >= tramo.desde && salarioGravable <= tramo.hasta) {
                if (tramo.tramoId === 1) return 0;

                const exceso = salarioGravable - tramo.exceso;
                const impuesto = tramo.cuotaFija + (exceso * tramo.porcentaje);
                return this.redondear(impuesto);
            }
        }

        // Si está en el último tramo (sin límite superior)
        const ultimoTramo = TRAMOS_RENTA[TRAMOS_RENTA.length - 1];
        const exceso = salarioGravable - ultimoTramo.exceso;
        const impuesto = ultimoTramo.cuotaFija + (exceso * ultimoTramo.porcentaje);
        return this.redondear(impuesto);
    }

    /**
     * Calcula los aportes patronales
     */
    calcularDescuentosPatronales(salarioBruto: number, totalEmpleados?: number): PatronalResult {
        const empleados = totalEmpleados ?? this.totalEmpleados;

        // ISSS Patronal (7.5% con techo de $1,000)
        const salarioBaseISS = Math.min(salarioBruto, TECHO_ISSS);
        const isssPatronal = this.redondear(salarioBaseISS * PORCENTAJE_ISSS_PATRONAL);

        // AFP Patronal (8.75% sin techo)
        const afpPatronal = this.redondear(salarioBruto * PORCENTAJE_AFP_PATRONAL);

        // INSAFORP (1% solo si la empresa tiene más de 10 empleados)
        const insaforp = empleados > MINIMO_EMPLEADOS_INSAFORP
            ? this.redondear(salarioBruto * PORCENTAJE_INSAFORP)
            : 0;

        return {
            isssPatronal,
            afpPatronal,
            insaforp,
            total: this.redondear(isssPatronal + afpPatronal + insaforp),
        };
    }

    /**
     * Calcula el pago de horas extra
     * Las horas extras se pagan al doble
     */
    calcularHorasExtra(salarioHora: number, horas: number): number {
        return this.redondear(salarioHora * horas * MULTIPLICADOR_HORAS_EXTRA);
    }

    /**
     * Calcula el pago por nocturnidad
     * Aplica +25% para trabajo entre 7PM y 6AM
     */
    calcularNocturnidad(salarioHora: number, horas: number): number {
        const pagoBase = salarioHora * horas;
        const bonoNocturnidad = pagoBase * PORCENTAJE_NOCTURNIDAD;
        return this.redondear(bonoNocturnidad);
    }

    /**
     * Genera el desglose completo de la planilla para un empleado
     */
    generarDesglosePlanilla(
        salarioBase: number,
        horasExtra: number = 0,
        horasNocturnas: number = 0,
        bonificaciones: number = 0,
        otrasDeducciones: number = 0
    ): DesglosePlanilla {
        // Calcular salario por hora (asumiendo jornada de 30 días, 8 horas)
        const salarioHora = salarioBase / (30 * 8);

        // Ingresos adicionales
        const pagoHorasExtra = this.calcularHorasExtra(salarioHora, horasExtra);
        const pagoNocturnidad = this.calcularNocturnidad(salarioHora, horasNocturnas);

        // Total de ingresos brutos
        const totalIngresos = this.redondear(
            salarioBase + pagoHorasExtra + pagoNocturnidad + bonificaciones
        );
        const salarioBruto = totalIngresos;

        // Deducciones
        const isssLaboral = this.calcularISSSLaboral(salarioBruto);
        const afpLaboral = this.calcularAFPLaboral(salarioBruto);
        const salarioGravable = this.calcularSalarioGravable(salarioBruto);
        const rentaISR = this.calcularRenta(salarioGravable);

        const totalDeducciones = this.redondear(
            isssLaboral + afpLaboral + rentaISR + otrasDeducciones
        );

        // Salario neto
        const salarioNeto = this.redondear(salarioBruto - totalDeducciones);

        // Patronales
        const patronales = this.calcularDescuentosPatronales(salarioBruto);

        return {
            salarioBruto,
            horasExtra,
            pagoHorasExtra,
            horasNocturnas,
            pagoNocturnidad,
            bonificaciones,
            totalIngresos,
            isssLaboral,
            afpLaboral,
            salarioGravable,
            rentaISR,
            otrasDeducciones,
            totalDeducciones,
            salarioNeto,
            isssPatronal: patronales.isssPatronal,
            afpPatronal: patronales.afpPatronal,
            insaforp: patronales.insaforp,
            totalPatronal: patronales.total,
        };
    }

    /**
     * Redondea a 2 decimales
     */
    private redondear(valor: number): number {
        return Math.round(valor * 100) / 100;
    }

    /**
     * Obtiene información del tramo de renta
     */
    obtenerTramoRenta(salarioGravable: number): { tramo: number; descripcion: string } {
        for (const tramo of TRAMOS_RENTA) {
            if (salarioGravable >= tramo.desde && salarioGravable <= tramo.hasta) {
                const descripciones: { [key: number]: string } = {
                    1: "Exento",
                    2: "10% sobre exceso de $472.00",
                    3: "20% sobre exceso de $895.24",
                    4: "30% sobre exceso de $2,038.10",
                };
                return {
                    tramo: tramo.tramoId,
                    descripcion: descripciones[tramo.tramoId] || "Desconocido",
                };
            }
        }
        return { tramo: 4, descripcion: "30% sobre exceso de $2,038.10" };
    }
}

// ============================================
// EXPORT DEFAULT INSTANCE
// ============================================

export const calculadoraSalarial = new CalculadoraSalarialSV();
