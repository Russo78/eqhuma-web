"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RecruitmentSection() {
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
            icon={<PersonIcon />}
            title="Encontramos al personal que necesitas"
            description="Con nuestras estrategias enfocadas en la búsqueda de personal, garantizamos que tendrás al mejor talento posible."
          />
          <FeatureCard
            icon={<ClockIcon />}
            title="Sin tiempos de espera"
            description="Gracias a nuestros procesos de selección, tendrás al perfil que necesitas en el menor tiempo."
          />
          <FeatureCard
            icon={<FilterIcon />}
            title="Filtros"
            description="Nuestros reclutadores cuentan con toda la experiencia para ofrecer proceso de selección ágil, amable y con resultados validados de los diferentes candidatos."
          />
          <FeatureCard
            icon={<MapIcon />}
            title="Mapeo"
            description="Realizamos un mapeo de sueldos tomando en cuenta: ubicación, tipo de perfil, habilidades y especialización."
          />
          <FeatureCard
            icon={<StrategyIcon />}
            title="Medios y estrategias"
            description="Tenemos alianzas con diferentes medios de comunicación para encontrar al mejor talento en poco tiempo."
          />
          <FeatureCard
            icon={<GuaranteeIcon />}
            title="Garantía"
            description="En EQHuma contamos con diferentes garantías. Nuestro objetivo es garantizar la continuidad de tu negocio."
          />
        </div>

        <Separator className="my-16" />

        {/* Integral Solution Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">RECLUTAMIENTO Y SELECCIÓN</h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              Una solución <span className="text-indigo-600">integral</span>
            </h3>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Contamos con los mejores consultores y profesionales experimentados para ofrecer
              servicios integrales de reclutamiento y selección.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-indigo-200 bg-blue-50">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-3">Reclutamiento y Selección</h4>
                <p className="text-gray-700 mb-4">
                  Proporcionamos al perfil que necesitas para seguir creciendo tu negocio.
                </p>
              </CardContent>
            </Card>
            <Card className="border-indigo-200 bg-blue-50">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-3">Reclutamiento y Selección masiva</h4>
                <p className="text-gray-700 mb-4">
                  Ahorra tiempo y reduce costos en procesos de contratación a gran escala.
                </p>
              </CardContent>
            </Card>
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

// Icon Components
function PersonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  );
}

function StrategyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}

function GuaranteeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}