"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PsicometriaSection() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Why Choose Us Section */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-semibold text-indigo-600 mb-2">¿POR QUÉ ELEGIRNOS?</h2>
          <h3 className="text-3xl md:text-4xl font-bold">
            Nuestro <span className="text-indigo-600">enfoque científico</span>
          </h3>
        </div>

        {/* Methodology Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon={<IntelligenceIcon />}
            title="Test de Inteligencia (IQ)"
            description="Evaluamos la capacidad cognitiva general y habilidades de razonamiento lógico-abstracto."
          />
          <FeatureCard
            icon={<PersonalityIcon />}
            title="Evaluación de Personalidad"
            description="Identificamos rasgos clave, motivadores y patrones de comportamiento laboral."
          />
          <FeatureCard
            icon={<CompetenciesIcon />}
            title="Pruebas de Competencias"
            description="Medimos habilidades específicas requeridas para desempeñar roles con excelencia."
          />
          <FeatureCard
            icon={<LeadershipIcon />}
            title="Test de Liderazgo"
            description="Analizamos capacidades para dirigir equipos, tomar decisiones y gestionar talento."
          />
          <FeatureCard
            icon={<WorkStyleIcon />}
            title="Estilo de Trabajo"
            description="Evaluamos preferencias laborales, comunicación y adaptación al cambio."
          />
          <FeatureCard
            icon={<ReportIcon />}
            title="Informe detallado"
            description="Entregamos reportes completos, claros y accionables para la toma de decisiones."
          />
        </div>

        <Separator className="my-16" />

        {/* Evaluaciones Psicométricas Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">EVALUACIONES PSICOMÉTRICAS</h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              Herramientas <span className="text-indigo-600">validadas y confiables</span>
            </h3>
          </div>

          <div className="max-w-4xl mx-auto">
            <ul className="space-y-4 text-lg">
              <TestItem text="Test Raven de Inteligencia" />
              <TestItem text="MBTI / DISC de Personalidad" />
              <TestItem text="Baterías de Competencias Cognitivas" />
              <TestItem text="Pruebas de Estilo de Liderazgo" />
              <TestItem text="Evaluaciones de Toma de Decisiones" />
            </ul>

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
    </section>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-start p-5 bg-white rounded-lg border border-gray-200 hover:shadow-md transition duration-300">
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-4">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Test Item Component
function TestItem({ text }: { text: string }) {
  return (
    <li className="flex items-start space-x-3 text-gray-700">
      <span className="text-indigo-600 mt-1">•</span>
      <span>{text}</span>
    </li>
  );
}

// Icon Components
function IntelligenceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h10"></path>
      <path d="M9 4v16"></path>
      <path d="M14.5 4h.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.5"></path>
      <path d="M14.5 14h.5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.5"></path>
      <path d="M14.5 9h5.5"></path>
    </svg>
  );
}

function PersonalityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function CompetenciesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function LeadershipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5"></path>
      <path d="M5 17v5"></path>
      <path d="M19 17v5"></path>
      <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      <path d="M5 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      <path d="M19 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      <path d="M12 9V5"></path>
      <path d="M5 9V5"></path>
      <path d="M19 9V5"></path>
    </svg>
  );
}

function WorkStyleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <path d="M20.8 14.2 16.5 9.9a1 1 0 0 0-1.4 0L8.5 16.6"></path>
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <path d="M14 2v6h6"></path>
      <path d="M16 13H8"></path>
      <path d="M16 17H8"></path>
      <path d="M10 9H8"></path>
    </svg>
  );
}
