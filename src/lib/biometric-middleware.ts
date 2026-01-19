/**
 * BiometricMiddleware - Procesador de Marcas Biométricas
 * 
 * Procesa marcas crudas de biométricos y calcula:
 * - Horas trabajadas
 * - Horas extra (después de jornada regular)
 * - Nocturnidad (entre 7PM y 6AM)
 */

export interface RawAttendance {
    employeeId: string;
    timestamp: Date;
    type: 'IN' | 'OUT';
    source: 'FACE_ID' | 'FINGERPRINT' | 'WEB' | 'MANUAL';
}

export interface ProcessedWorkday {
    employeeId: string;
    date: string;
    clockIn: Date | null;
    clockOut: Date | null;
    regularHours: number;
    overtimeHours: number;
    nightHours: number;
    hasInconsistency: boolean;
    inconsistencyReason?: string;
}

export interface AttendanceSummary {
    employeeId: string;
    periodStart: Date;
    periodEnd: Date;
    totalDaysWorked: number;
    totalRegularHours: number;
    totalOvertimeHours: number;
    totalNightHours: number;
    inconsistencies: { date: string; reason: string }[];
}

// Horarios estándar
const JORNADA_INICIO = 8; // 8:00 AM
const JORNADA_FIN = 17; // 5:00 PM (17:00)
const HORA_INICIO_NOCHE = 19; // 7:00 PM
const HORA_FIN_NOCHE = 6; // 6:00 AM
const HORAS_JORNADA_NORMAL = 8;

export class BiometricMiddleware {

    /**
     * Procesa un conjunto de marcas crudas y las agrupa por día
     */
    processRawAttendances(marks: RawAttendance[]): Map<string, ProcessedWorkday> {
        const workdays = new Map<string, ProcessedWorkday>();

        // Agrupar por empleado y fecha
        const grouped = this.groupByEmployeeAndDate(marks);

        for (const [key, dayMarks] of grouped) {
            const [employeeId, dateStr] = key.split('|');
            const processed = this.processWorkday(employeeId, dateStr, dayMarks);
            workdays.set(key, processed);
        }

        return workdays;
    }

    /**
     * Procesa las marcas de un día para un empleado
     */
    private processWorkday(
        employeeId: string,
        dateStr: string,
        marks: RawAttendance[]
    ): ProcessedWorkday {
        // Ordenar marcas por timestamp
        const sorted = [...marks].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const result: ProcessedWorkday = {
            employeeId,
            date: dateStr,
            clockIn: null,
            clockOut: null,
            regularHours: 0,
            overtimeHours: 0,
            nightHours: 0,
            hasInconsistency: false,
        };

        // Buscar primera entrada y última salida
        const entries = sorted.filter(m => m.type === 'IN');
        const exits = sorted.filter(m => m.type === 'OUT');

        if (entries.length > 0) {
            result.clockIn = new Date(entries[0].timestamp);
        }

        if (exits.length > 0) {
            result.clockOut = new Date(exits[exits.length - 1].timestamp);
        }

        // Detectar inconsistencias
        if (result.clockIn && !result.clockOut) {
            result.hasInconsistency = true;
            result.inconsistencyReason = 'Entrada sin salida registrada';
        } else if (!result.clockIn && result.clockOut) {
            result.hasInconsistency = true;
            result.inconsistencyReason = 'Salida sin entrada registrada';
        }

        // Calcular horas si hay entrada y salida válidas
        if (result.clockIn && result.clockOut) {
            const hours = this.calculateHours(result.clockIn, result.clockOut);
            result.regularHours = hours.regular;
            result.overtimeHours = hours.overtime;
            result.nightHours = hours.night;
        }

        return result;
    }

    /**
     * Calcula horas regulares, extra y nocturnas
     */
    private calculateHours(clockIn: Date, clockOut: Date): {
        regular: number;
        overtime: number;
        night: number;
    } {
        const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
        const totalHours = totalMinutes / 60;

        // Horas regulares (máximo 8)
        const regular = Math.min(totalHours, HORAS_JORNADA_NORMAL);

        // Horas extra (todo lo que exceda las 8 horas)
        const overtime = Math.max(0, totalHours - HORAS_JORNADA_NORMAL);

        // Horas nocturnas (entre 7PM y 6AM)
        const night = this.calculateNightHours(clockIn, clockOut);

        return {
            regular: this.round(regular),
            overtime: this.round(overtime),
            night: this.round(night),
        };
    }

    /**
     * Calcula las horas trabajadas en horario nocturno (7PM - 6AM)
     */
    private calculateNightHours(clockIn: Date, clockOut: Date): number {
        let nightMinutes = 0;
        const current = new Date(clockIn);

        while (current < clockOut) {
            const hour = current.getHours();

            // Si es horario nocturno (19:00 - 23:59 o 00:00 - 05:59)
            if (hour >= HORA_INICIO_NOCHE || hour < HORA_FIN_NOCHE) {
                nightMinutes++;
            }

            current.setMinutes(current.getMinutes() + 1);
        }

        return nightMinutes / 60;
    }

    /**
     * Genera resumen de asistencia para un período
     */
    generateSummary(
        employeeId: string,
        workdays: ProcessedWorkday[],
        periodStart: Date,
        periodEnd: Date
    ): AttendanceSummary {
        const employeeWorkdays = workdays.filter(w => w.employeeId === employeeId);

        const summary: AttendanceSummary = {
            employeeId,
            periodStart,
            periodEnd,
            totalDaysWorked: employeeWorkdays.filter(w => w.clockIn && w.clockOut).length,
            totalRegularHours: 0,
            totalOvertimeHours: 0,
            totalNightHours: 0,
            inconsistencies: [],
        };

        for (const day of employeeWorkdays) {
            summary.totalRegularHours += day.regularHours;
            summary.totalOvertimeHours += day.overtimeHours;
            summary.totalNightHours += day.nightHours;

            if (day.hasInconsistency) {
                summary.inconsistencies.push({
                    date: day.date,
                    reason: day.inconsistencyReason || 'Inconsistencia detectada',
                });
            }
        }

        return summary;
    }

    /**
     * Agrupa marcas por empleado y fecha
     */
    private groupByEmployeeAndDate(marks: RawAttendance[]): Map<string, RawAttendance[]> {
        const grouped = new Map<string, RawAttendance[]>();

        for (const mark of marks) {
            const date = new Date(mark.timestamp);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const key = `${mark.employeeId}|${dateStr}`;

            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(mark);
        }

        return grouped;
    }

    private round(value: number): number {
        return Math.round(value * 100) / 100;
    }
}

export const biometricMiddleware = new BiometricMiddleware();
