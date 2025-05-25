import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import { HeadhuntingSection } from "@/components/sections/headhunting-section";

export const metadata: Metadata = {
  title: "Headhunting - EQHuma",
  description: "Encontramos a los líderes que guiarán a tu empresa hacía el éxito. En EQHuma contamos con la experiencia y las herramientas necesarias que nos permitirán encontrar a los mejores candidatos para tu empresa. Conoce nuestro servicio de Headhunting.",
};

export default function HeadhuntingPage() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Encontramos a los líderes
                <span className="block">que guiarán a tu empresa hacia el éxito</span>
              </h1>
              <p className="text-lg text-gray-600">
                Elaboramos un detallado levantamiento de perfil en donde definimos en conjunto contigo los musts del puesto que necesitas, así sentamos las bases necesarias para identificar al candidato idóneo.
              </p>
              <div className="pt-4">
                <Link href="/contacto">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    Contacto
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <img
                src="/imagenes/reclutamiento1.png"
                alt="EQHuma - Headhunting"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <HeadhuntingSection />

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
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo electrónico*
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
                    Número de teléfono móvil*
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    placeholder="(55) 1234 5678"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="empresa" className="text-sm font-medium">
                    Nombre de la empresa*
                  </label>
                  <input
                    id="empresa"
                    type="text"
                    placeholder="Empresa"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mensaje" className="text-sm font-medium">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    placeholder="Explícanos un poco más de lo que necesitas..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
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
