"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function VerificacionesSection() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Why Choose Us Section */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-semibold text-indigo-600 mb-2">¿POR QUÉ ELEGIRNOS?</h2>
          <h3 className="text-3xl md:text-4xl font-bold">
            Nuestra <span className="text-indigo-600">metodología</span>
          </h3>
        </div>

        {/* Methodology Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon={<VerificationIcon />}
            title="Verificaciones exhaustivas"
            description="Análisis minucioso de antecedentes laborales y personales para asegurar la veracidad de la información."
          />
          <FeatureCard
            icon={<SocioeconomicIcon />}
            title="Estudios socioeconómicos"
            description="Evaluación integral del entorno social y económico del candidato para entender su contexto."
          />
          <FeatureCard
            icon={<BackgroundIcon />}
            title="Antecedentes laborales"
            description="Confirmación de experiencia previa, logros y motivos de separación de empleos anteriores."
          />
          <FeatureCard
            icon={<HomeInterviewIcon />}
            title="Entrevistas domiciliarias"
            description="Visitas presenciales para validar información de residencia y entorno familiar."
          />
          <FeatureCard
            icon={<ReportIcon />}
            title="Reportes claros y accionables"
            description="Informes detallados con hallazgos, análisis y recomendaciones específicas para la toma de decisiones."
          />
          <FeatureCard
            icon={<ConfidentialityIcon />}
            title="Confidencialidad garantizada"
            description="Procesos que aseguran el manejo discreto y seguro de la información sensible de los candidatos."
          />
        </div>

        <Separator className="my-16" />

        {/* Verificaciones Laborales Solutions Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">VERIFICACIONES LABORALES</h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              Un servicio <span className="text-indigo-600">integral y confiable</span>
            </h3>
          </div>

          <div className="max-w-4xl mx-auto">
            <ul className="space-y-4 text-lg">
              <ServiceItem text="Investigaciones laborales exhaustivas" />
              <ServiceItem text="Estudios socioeconómicos personalizados" />
              <ServiceItem text="Verificación de referencias y antecedentes" />
              <ServiceItem text="Detección de riesgos y fraudes internos" />
              <ServiceItem text="Evaluaciones presenciales y remotas" />
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

// Service Item Component
function ServiceItem({ text }: { text: string }) {
  return (
    <li className="flex items-start space-x-3 text-gray-700">
      <span className="text-indigo-600 mt-1">•</span>
      <span>{text}</span>
    </li>
  );
}

// Icon Components
function VerificationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function SocioeconomicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="18" height="12" rx="2"></rect>
      <path d="M12 12h9"></path>
      <path d="M3 10h6"></path>
      <path d="M3 14h6"></path>
    </svg>
  );
}

function BackgroundIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M16 13H8"></path>
      <path d="M16 17H8"></path>
      <path d="M10 9H8"></path>
    </svg>
  );
}

function HomeInterviewIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
      <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path>
    </svg>
  );
}

function ConfidentialityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
