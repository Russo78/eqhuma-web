"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeadhuntingSection() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Headhunting Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">HEADHUNTING</h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              Tu empresa necesita al mejor talento,
              <span className="block text-indigo-600">tenemos +26 años de experiencia para ayudarte a encontrarlo</span>
            </h3>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700">
            <p>
              Elaboramos un detallado levantamiento de perfil en donde definimos en conjunto contigo los musts del puesto que necesitas,
              así sentamos las bases necesarias para identificar al candidato idóneo.
            </p>
            <p>
              Tenemos claro nuestro compromiso con el proceso de talent acquisition; generando las herramientas más eficientes de Headhunting
              para ofrecerte al candidato ideal.
            </p>
            <p>
              Además de todo esto, contamos con nuestra base de talento, con lo que aceleramos el proceso de executive search.
            </p>
            <div className="pt-6 flex justify-center">
              <Link href="/contacto">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Contacto
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Experience Banner */}
        <div className="bg-blue-50 p-8 rounded-lg mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              En EQHuma contamos con la experiencia y las plataformas necesarias que nos permitirán colocar a los mejores líderes en tu empresa.
            </h3>
            <div className="mt-4">
              <Link href="/contacto">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Contacto
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Specialized Positions */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">HEADHUNTING</h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              Nos distinguimos por proveer al mejor talento para tu empresa,
              <span className="block text-indigo-600">nos especializamos en el reclutamiento y selección de puestos claves, como:</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <PositionCard title="Alta Dirección" />
            <PositionCard title="Gerentes" />
            <PositionCard title="PMO's" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Position Card Component
function PositionCard({ title }: { title: string }) {
  return (
    <Card className="border-indigo-200 hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-10 text-center">
        <h4 className="text-2xl font-bold text-gray-800">{title}</h4>
      </CardContent>
    </Card>
  );
}
