/**
 * LicenseService - Sistema de Validación de Licencias
 * 
 * Controla el acceso basado en:
 * - Límite de empleados
 * - Fecha de vencimiento
 */

export interface License {
    id: string;
    companyName: string;
    companyNIT: string;
    employeeLimit: number;
    expirationDate: Date;
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    planName: string;
}

export interface LicenseValidation {
    isValid: boolean;
    canAddEmployees: boolean;
    canEditData: boolean;
    isReadOnly: boolean;
    message: string;
    daysUntilExpiration: number;
    employeesUsed: number;
    employeesRemaining: number;
}

export class LicenseService {
    private license: License | null = null;
    private currentEmployeeCount: number = 0;

    /**
     * Carga la licencia actual
     */
    loadLicense(license: License): void {
        this.license = license;
    }

    /**
     * Actualiza el conteo de empleados activos
     */
    setEmployeeCount(count: number): void {
        this.currentEmployeeCount = count;
    }

    /**
     * Valida si se puede crear un nuevo empleado
     */
    canCreateEmployee(): { allowed: boolean; reason?: string } {
        if (!this.license) {
            return { allowed: false, reason: "No hay licencia activa" };
        }

        // Verificar expiración
        const now = new Date();
        if (now > this.license.expirationDate) {
            return {
                allowed: false,
                reason: "La licencia ha expirado. Solo lectura de datos históricos."
            };
        }

        // Verificar estado
        if (this.license.status !== 'ACTIVE') {
            return {
                allowed: false,
                reason: `Licencia ${this.license.status.toLowerCase()}. Contacte soporte.`
            };
        }

        // Verificar límite de empleados
        if (this.currentEmployeeCount >= this.license.employeeLimit) {
            return {
                allowed: false,
                reason: `Límite alcanzado: ${this.license.employeeLimit} empleados. Actualice su plan.`
            };
        }

        return { allowed: true };
    }

    /**
     * Hard-stop: Verifica si el sistema está en modo solo lectura
     */
    isReadOnly(): boolean {
        if (!this.license) return true;

        const now = new Date();
        if (now > this.license.expirationDate) return true;
        if (this.license.status !== 'ACTIVE') return true;

        return false;
    }

    /**
     * Obtiene el estado completo de la licencia
     */
    getValidation(): LicenseValidation {
        if (!this.license) {
            return {
                isValid: false,
                canAddEmployees: false,
                canEditData: false,
                isReadOnly: true,
                message: "No hay licencia activa",
                daysUntilExpiration: 0,
                employeesUsed: 0,
                employeesRemaining: 0,
            };
        }

        const now = new Date();
        const daysUntilExpiration = Math.ceil(
            (this.license.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isExpired = daysUntilExpiration < 0;
        const isActive = this.license.status === 'ACTIVE' && !isExpired;
        const canAddMore = this.currentEmployeeCount < this.license.employeeLimit;

        let message = "";
        if (isExpired) {
            message = `Licencia expirada hace ${Math.abs(daysUntilExpiration)} días`;
        } else if (daysUntilExpiration <= 7) {
            message = `¡Atención! Licencia expira en ${daysUntilExpiration} días`;
        } else if (!canAddMore) {
            message = `Límite de ${this.license.employeeLimit} empleados alcanzado`;
        } else {
            message = `Licencia activa - ${this.license.planName}`;
        }

        return {
            isValid: isActive,
            canAddEmployees: isActive && canAddMore,
            canEditData: isActive,
            isReadOnly: !isActive,
            message,
            daysUntilExpiration: Math.max(0, daysUntilExpiration),
            employeesUsed: this.currentEmployeeCount,
            employeesRemaining: Math.max(0, this.license.employeeLimit - this.currentEmployeeCount),
        };
    }

    /**
     * Verifica y lanza error si no se puede crear empleado
     */
    assertCanCreateEmployee(): void {
        const check = this.canCreateEmployee();
        if (!check.allowed) {
            throw new Error(check.reason);
        }
    }

    /**
     * Verifica y lanza error si el sistema está en modo solo lectura
     */
    assertNotReadOnly(): void {
        if (this.isReadOnly()) {
            throw new Error("Sistema en modo solo lectura. Renueve su licencia para continuar.");
        }
    }
}

export const licenseService = new LicenseService();
