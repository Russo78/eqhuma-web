"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CapacitacionSection() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Why Choose Us Section */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-semibold text-indigo-600 mb-2">¿POR QUÉ ELEGIRNOS?</h2>
          <h3 className="text-3xl md:text-4xl font-bold">
            Así lo <span className="text-indigo-600">hacemos</span>
          </h3>
        </div>

        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon={<DiagnosisIcon />}
            title="Diagnóstico personalizado"
            description="Analizamos las necesidades específicas de tu organización para crear planes de capacitación a la medida."
          />
          <FeatureCard
            icon={<InstructorsIcon />}
            title="Instructores certificados"
            description="Contamos con especialistas calificados y con experiencia en cada área de formación empresarial."
          />
          <FeatureCard
            icon={<MethodologyIcon />}
            title="Metodologías ágiles"
            description="Incorporamos técnicas de aprendizaje modernas que garantizan una mejor retención y aplicación del conocimiento."
          />
          <FeatureCard
            icon={<ContentIcon />}
            title="Contenido actualizado"
            description="Nuestros programas se actualizan constantemente para incorporar las últimas tendencias y mejores prácticas."
          />
          <FeatureCard
            icon={<ModalityIcon />}
            title="Modalidad presencial y online"
            description="Ofrecemos flexibilidad en la implementación de nuestros programas adaptándonos a tus necesidades."
          />
          <FeatureCard
            icon={<FollowUpIcon />}
            title="Seguimiento post-curso"
            description="Evaluamos el impacto de la capacitación con métricas claras y planes de refuerzo continuo."
          />
        </div>

        <Separator className="my-16" />

        {/* Capacitación Solutions Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">CAPACITACIÓN</h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              Soluciones formativas <span className="text-indigo-600">integrales</span>
            </h3>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TrainingCard
                title="Programas de inducción y onboarding"
                description="Facilitamos la integración de nuevos colaboradores a tu cultura organizacional y procesos internos."
              />
              <TrainingCard
                title="Habilidades gerenciales y liderazgo"
                description="Desarrollamos las competencias clave para la gestión efectiva de equipos y la toma de decisiones estratégicas."
              />
              <TrainingCard
                title="Formación técnica y certificaciones"
                description="Implementamos programas especializados para fortalecer las habilidades técnicas específicas de cada sector."
              />
              <TrainingCard
                title="Desarrollo de competencias blandas"
                description="Potenciamos las habilidades interpersonales, comunicacionales y emocionales fundamentales para el éxito profesional."
              />
              <TrainingCard
                title="Cursos a la medida de tu sector"
                description="Diseñamos capacitaciones específicas para las necesidades y desafíos particulares de tu industria."
                className="md:col-span-2"
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

// Training Card Component
function TrainingCard({ title, description, className = "" }: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={`border-indigo-200 hover:shadow-md transition-shadow duration-300 ${className}`}>
      <CardContent className="p-6">
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-gray-700">{description}</p>
      </CardContent>
    </Card>
  );
}

// Icon Components
function DiagnosisIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}

function InstructorsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function MethodologyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function ModalityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  );
}

function FollowUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
