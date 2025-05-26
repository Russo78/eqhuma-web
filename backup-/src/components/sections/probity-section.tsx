"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ProbitySection() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Why Choose Us Section */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-semibold text-indigo-600 mb-2">¿POR QUÉ ELEGIRNOS?</h2>
          <h3 className="text-3xl md:text-4xl font-bold">
            Enfoque <span className="text-indigo-600">basado en evidencia</span>
          </h3>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
            <FeatureItem text="Prevé riesgos de robo, alcohol y agresión" />
            <FeatureItem text="Cobertura completa: moral y anticorrupción" />
            <FeatureItem text="Test validado en México y América Latina" />
            <FeatureItem text="Informes individuales y grupales" />
            <FeatureItem text="Fácil integración con tu gestión de talento" />
            <FeatureItem text="Confidencialidad y seguridad de datos" />
          </ul>
        </div>

        <Separator className="my-16" />

        {/* What Probity Measures Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">¿QUÉ MIDE PROBITY?</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-12">
              Dimensiones <span className="text-indigo-600">clave</span>
            </h3>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                <DimensionSection
                  title="Moral Laboral"
                  items={["Honradez", "Responsabilidad", "Deber"]}
                />

                <DimensionSection
                  title="Adecuación Laboral"
                  items={["Lealtad", "Transparencia", "Soborno", "Alcohol y Drogas"]}
                />

                <DimensionSection
                  title="Anti-Corrupción"
                  items={["Soborno", "Obediencia excesiva", "Acoso laboral"]}
                />

                <DimensionSection
                  title="Líderes"
                  items={["+ Discriminación", "Tolerancia"]}
                />

                <DimensionSection
                  title="Estabilidad Laboral"
                  items={["Pertenencia", "Capacidad", "Preocupaciones ambientales y financieras"]}
                />
              </div>

              <div className="text-center mt-12">
                <Link href="/contacto">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    Hablemos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Item Component
function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start space-x-3 text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <span className="text-indigo-600 mt-1">•</span>
      <span>{text}</span>
    </li>
  );
}

// Dimension Section Component
function DimensionSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="text-left">
      <h4 className="text-xl font-bold mb-3 text-gray-800">{title}:</h4>
      <div className="flex flex-wrap gap-2 ml-4">
        {items.map((item, index) => (
          <span key={index} className="inline-flex items-center">
            {item}
            {index < items.length - 1 && <span className="mx-2 text-indigo-400">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
