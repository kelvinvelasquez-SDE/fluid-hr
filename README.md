# Fluid-HR

🇸🇻 **Sistema de Planilla y Recursos Humanos para El Salvador**

MVP de RRHH con cálculos legales salvadoreños precisos, integración con SAP B1 y biométricos.

## 🚀 Características

- **Motor de Cálculo Salarial**: ISSS (3%), AFP (7.25%), Renta (4 tramos)
- **Integración SAP B1**: Generación automática de asientos de diario
- **Biométricos**: Procesamiento de marcas, horas extra y nocturnidad
- **UI Moderna**: Dashboard con diseño glassmorphism y dark mode
- **Licenciamiento**: Control de empleados y vencimiento

## 📊 Tabla de Renta (Hacienda 2024-2026)

| Tramo | Desde | Hasta | Porcentaje | Cuota Fija |
|-------|-------|-------|------------|------------|
| I | $0.01 | $472.00 | Exento | $0.00 |
| II | $472.01 | $895.24 | 10% | $17.67 |
| III | $895.25 | $2,038.10 | 20% | $60.00 |
| IV | $2,038.11 | En adelante | 30% | $288.57 |

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + React 18
- **Styling**: Tailwind CSS
- **Base de Datos**: Prisma ORM + SQLite
- **Testing**: Vitest

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run db:generate

# Inicializar base de datos
npm run db:push

# Iniciar servidor de desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
fluid-hr/
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
├── src/
│   ├── app/
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── layout.tsx     # Layout con navegación
│   │   └── globals.css    # Estilos globales
│   ├── components/
│   │   ├── EmployeeCard.tsx
│   │   ├── PermissionSelector.tsx
│   │   └── PayrollSummary.tsx
│   └── lib/
│       ├── calculadora-salarial.ts  # Motor de cálculo
│       ├── biometric-middleware.ts  # Procesador biométrico
│       ├── sap-connector.ts         # Conector SAP B1
│       └── license-service.ts       # Validación de licencias
└── package.json
```

## 🔐 Roles de Usuario

| Nivel | Nombre | Permisos |
|-------|--------|----------|
| 1 | Solo Lectura | Ver información y reportes |
| 2 | Editor | Editar empleados y marcas |
| 3 | Administrador | Ver salarios, cerrar planilla, configurar |

## 📄 Licencia

MIT © 2026 Kelvin Velasquez
