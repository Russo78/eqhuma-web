import { Button } from "@/components/ui/button";
import { RecruitmentSection } from "@/components/sections/recruitment-section";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reclutamiento y Selección - EQHuma",
  description: "Enfócate en tu negocio, nosotros en el Capital Humano. Con nuestro servicio de Reclutamiento y Selección de personal te garantizamos al talento que tu empresa necesita. Somos expertos en atracción, selección, y evaluación de candidatos. ¡Contáctanos!",
};

export default function RecruitmentPage() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Enfócate en tu negocio
                <span className="block">Nosotros en el Capital Humano</span>
              </h1>
              <p className="text-lg text-gray-600">
                Te garantizamos al talento que tu empresa necesita.
                <br />
                Somos expertos en atracción, selección, y evaluación de candidatos.
              </p>
              <div className="pt-4">
                <Link href="/contacto">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    HABLEMOS
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <img
                src="/imagenes/reclutamientomasivo.png"
                alt="EQHuma - Reclutamiento y Selección"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <RecruitmentSection />

      {/* Contact Form Section */}
      <section className="w-full bg-blue-50 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                Descubre por qué más de 300 empresas confían en nosotros.
              </h2>
              <p className="text-lg text-gray-600">
                Solicita una asesoría gratuita.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nombre" className="text-sm font-medium">
                      Nombre*
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Nombre"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="apellido" className="text-sm font-medium">
                      Apellido*
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      placeholder="Apellido"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="puesto" className="text-sm font-medium">
                    Puesto/Cargo*
                  </label>
                  <input
                    id="puesto"
                    type="text"
                    placeholder="Puesto/Cargo"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="empresa" className="text-sm font-medium">
                    Empresa*
                  </label>
                  <input
                    id="empresa"
                    type="text"
                    placeholder="Empresa"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Corporativo*
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="correo@empresa.com"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="telefono" className="text-sm font-medium">
                      Número de Celular
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      placeholder="(55) 1234 5678"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="mensaje" className="text-sm font-medium">
                    Mensaje*
                  </label>
                  <textarea
                    id="mensaje"
                    placeholder="Explícanos un poco más de lo que necesitas..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  ></textarea>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Enviar
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
