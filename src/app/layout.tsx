import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Fluid-HR | Sistema de Planilla El Salvador",
    description: "MVP de Recursos Humanos con cálculos legales salvadoreños, integración SAP B1 y biométricos",
    keywords: ["RRHH", "Planilla", "El Salvador", "ISSS", "AFP", "SAP B1"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className="dark">
            <body className={inter.className}>
                <div className="min-h-screen">
                    {/* Sidebar */}
                    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 hidden lg:block">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xl">💼</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">Fluid-HR</h1>
                                <p className="text-xs text-white/50">El Salvador</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white">
                                <span>📊</span>
                                <span>Dashboard</span>
                            </a>
                            <a href="/employees" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                                <span>👥</span>
                                <span>Empleados</span>
                            </a>
                            <a href="/attendance" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                                <span>🕐</span>
                                <span>Asistencia</span>
                            </a>
                            <a href="/payroll" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                                <span>💰</span>
                                <span>Planilla</span>
                            </a>
                            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                                <span>⚙️</span>
                                <span>Configuración</span>
                            </a>
                        </nav>

                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="glass-card p-4">
                                <p className="text-xs text-white/50 mb-1">Plan Activo</p>
                                <p className="font-semibold">Profesional</p>
                                <div className="mt-2 flex justify-between text-xs">
                                    <span className="text-white/50">Empleados</span>
                                    <span>8/50</span>
                                </div>
                                <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[16%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="lg:ml-64 min-h-screen p-6 lg:p-10">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
