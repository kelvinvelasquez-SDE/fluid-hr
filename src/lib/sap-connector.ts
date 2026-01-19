/**
 * SAPConnector - Generador de Asientos de Diario para SAP Business One
 * 
 * Genera el JSON necesario para crear asientos contables en SAP B1
 * a través de la Service Layer.
 */

export interface JournalEntryLine {
    AccountCode: string;
    Debit?: number;
    Credit?: number;
    CostingCode?: string;  // Centro de costos
    LineMemo?: string;
}

export interface JournalEntry {
    ReferenceDate: string;
    Memo: string;
    Reference: string;
    Reference2?: string;
    JournalEntryLines: JournalEntryLine[];
}

export interface PayrollSAPMapping {
    gastoSueldos: string;        // Cuenta de gasto de sueldos (Débito)
    retISS: string;              // Retención ISSS por pagar (Crédito)
    retAFP: string;              // Retención AFP por pagar (Crédito)
    retRenta: string;            // Retención ISR por pagar (Crédito)
    sueldosPorPagar: string;     // Sueldos por pagar (Crédito - neto)
    gastoPatronalISS: string;    // Gasto patronal ISSS (Débito)
    gastoPatronalAFP: string;    // Gasto patronal AFP (Débito)
    gastoInsaforp: string;       // Gasto INSAFORP (Débito)
    provPatronalISS: string;     // Provisión patronal ISSS (Crédito)
    provPatronalAFP: string;     // Provisión patronal AFP (Crédito)
    provInsaforp: string;        // Provisión INSAFORP (Crédito)
}

export interface PayrollTotals {
    salarioBruto: number;
    isssLaboral: number;
    afpLaboral: number;
    rentaISR: number;
    salarioNeto: number;
    isssPatronal: number;
    afpPatronal: number;
    insaforp: number;
    centroCostos: string;
}

// Mapeo de cuentas por defecto (debe configurarse según el plan contable del cliente)
const DEFAULT_ACCOUNT_MAPPING: PayrollSAPMapping = {
    gastoSueldos: "5101",        // Gasto de sueldos y salarios
    retISS: "2101",              // ISSS por pagar
    retAFP: "2102",              // AFP por pagar
    retRenta: "2103",            // ISR por pagar
    sueldosPorPagar: "2104",     // Sueldos por pagar
    gastoPatronalISS: "5102",    // Gasto patronal ISSS
    gastoPatronalAFP: "5103",    // Gasto patronal AFP
    gastoInsaforp: "5104",       // Gasto INSAFORP
    provPatronalISS: "2105",     // Provisión ISSS patronal
    provPatronalAFP: "2106",     // Provisión AFP patronal
    provInsaforp: "2107",        // Provisión INSAFORP
};

export class SAPConnector {
    private accountMapping: PayrollSAPMapping;
    private baseUrl: string;
    private sessionId: string | null = null;

    constructor(
        baseUrl: string = "https://localhost:50000/b1s/v1",
        accountMapping: PayrollSAPMapping = DEFAULT_ACCOUNT_MAPPING
    ) {
        this.baseUrl = baseUrl;
        this.accountMapping = accountMapping;
    }

    /**
     * Genera el JSON del asiento de provisión de planilla
     */
    generatePayrollJournalEntry(
        payrollPeriod: string,
        totals: PayrollTotals[],
        reference?: string
    ): JournalEntry {
        const lines: JournalEntryLine[] = [];
        const today = new Date().toISOString().split('T')[0];

        // Agrupar por centro de costos
        const byCostCenter = this.groupByCostCenter(totals);

        for (const [costCenter, data] of byCostCenter) {
            // 1. DÉBITO: Gasto de sueldos (bruto)
            lines.push({
                AccountCode: this.accountMapping.gastoSueldos,
                Debit: data.salarioBruto,
                CostingCode: costCenter || undefined,
                LineMemo: `Sueldos ${payrollPeriod}`,
            });

            // 2. CRÉDITO: Retención ISSS
            if (data.isssLaboral > 0) {
                lines.push({
                    AccountCode: this.accountMapping.retISS,
                    Credit: data.isssLaboral,
                    LineMemo: `Ret. ISSS ${payrollPeriod}`,
                });
            }

            // 3. CRÉDITO: Retención AFP
            if (data.afpLaboral > 0) {
                lines.push({
                    AccountCode: this.accountMapping.retAFP,
                    Credit: data.afpLaboral,
                    LineMemo: `Ret. AFP ${payrollPeriod}`,
                });
            }

            // 4. CRÉDITO: Retención Renta
            if (data.rentaISR > 0) {
                lines.push({
                    AccountCode: this.accountMapping.retRenta,
                    Credit: data.rentaISR,
                    LineMemo: `Ret. ISR ${payrollPeriod}`,
                });
            }

            // 5. CRÉDITO: Sueldos por pagar (neto)
            lines.push({
                AccountCode: this.accountMapping.sueldosPorPagar,
                Credit: data.salarioNeto,
                LineMemo: `Sueldos por pagar ${payrollPeriod}`,
            });

            // === ASIENTO DE PROVISIÓN PATRONAL ===

            // 6. DÉBITO: Gasto patronal ISSS
            if (data.isssPatronal > 0) {
                lines.push({
                    AccountCode: this.accountMapping.gastoPatronalISS,
                    Debit: data.isssPatronal,
                    CostingCode: costCenter || undefined,
                    LineMemo: `ISSS Patronal ${payrollPeriod}`,
                });

                lines.push({
                    AccountCode: this.accountMapping.provPatronalISS,
                    Credit: data.isssPatronal,
                    LineMemo: `Prov. ISSS Patronal ${payrollPeriod}`,
                });
            }

            // 7. DÉBITO: Gasto patronal AFP
            if (data.afpPatronal > 0) {
                lines.push({
                    AccountCode: this.accountMapping.gastoPatronalAFP,
                    Debit: data.afpPatronal,
                    CostingCode: costCenter || undefined,
                    LineMemo: `AFP Patronal ${payrollPeriod}`,
                });

                lines.push({
                    AccountCode: this.accountMapping.provPatronalAFP,
                    Credit: data.afpPatronal,
                    LineMemo: `Prov. AFP Patronal ${payrollPeriod}`,
                });
            }

            // 8. DÉBITO: Gasto INSAFORP
            if (data.insaforp > 0) {
                lines.push({
                    AccountCode: this.accountMapping.gastoInsaforp,
                    Debit: data.insaforp,
                    CostingCode: costCenter || undefined,
                    LineMemo: `INSAFORP ${payrollPeriod}`,
                });

                lines.push({
                    AccountCode: this.accountMapping.provInsaforp,
                    Credit: data.insaforp,
                    LineMemo: `Prov. INSAFORP ${payrollPeriod}`,
                });
            }
        }

        return {
            ReferenceDate: today,
            Memo: `Provisión de planilla ${payrollPeriod}`,
            Reference: reference || `PLANILLA-${payrollPeriod}`,
            Reference2: payrollPeriod,
            JournalEntryLines: lines,
        };
    }

    /**
     * Agrupa totales por centro de costos
     */
    private groupByCostCenter(totals: PayrollTotals[]): Map<string, PayrollTotals> {
        const grouped = new Map<string, PayrollTotals>();

        for (const item of totals) {
            const cc = item.centroCostos || "";

            if (!grouped.has(cc)) {
                grouped.set(cc, {
                    salarioBruto: 0,
                    isssLaboral: 0,
                    afpLaboral: 0,
                    rentaISR: 0,
                    salarioNeto: 0,
                    isssPatronal: 0,
                    afpPatronal: 0,
                    insaforp: 0,
                    centroCostos: cc,
                });
            }

            const current = grouped.get(cc)!;
            current.salarioBruto += item.salarioBruto;
            current.isssLaboral += item.isssLaboral;
            current.afpLaboral += item.afpLaboral;
            current.rentaISR += item.rentaISR;
            current.salarioNeto += item.salarioNeto;
            current.isssPatronal += item.isssPatronal;
            current.afpPatronal += item.afpPatronal;
            current.insaforp += item.insaforp;
        }

        return grouped;
    }

    /**
     * Valida que el asiento esté cuadrado (débitos = créditos)
     */
    validateJournalEntry(entry: JournalEntry): { valid: boolean; difference: number } {
        let totalDebit = 0;
        let totalCredit = 0;

        for (const line of entry.JournalEntryLines) {
            totalDebit += line.Debit || 0;
            totalCredit += line.Credit || 0;
        }

        const difference = Math.round((totalDebit - totalCredit) * 100) / 100;

        return {
            valid: difference === 0,
            difference,
        };
    }

    /**
     * Genera JSON listo para enviar a SAP Service Layer
     */
    toJSON(entry: JournalEntry): string {
        return JSON.stringify(entry, null, 2);
    }
}

export const sapConnector = new SAPConnector();
