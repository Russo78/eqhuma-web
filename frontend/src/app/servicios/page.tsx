import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-eqhuma-primary">Servicios</h1>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {/* Service Card 1 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/3054552725.jpeg"
              category="Servicio modular"
              title="Estudio de Sueldos"
              href="/servicios/estudio-de-sueldos"
            /> 

            {/* Service Card 2 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/1069454745.jpeg"
              category="NOM-035"
              title="NOM-035: Juntos por un Entorno Laboral Saludable"
              href="/servicios/nom-035-juntos-por-un-entorno-laboral-saludable"
            />

            {/* Service Card 3 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/808501582.jpeg"
              category="Servicio modular"
              title="HR BPO"
              href="/servicios/hr-bpo"
            />

            {/* Service Card 4 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/1941457086.jpeg"
              category="Soluciones de personal"
              title="Servicios Especializados"
              href="/servicios/servicios-especializados"
            />

            {/* Service Card 5 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/2514419492.jpeg"
              category="Nómina"
              title="Payrolling"
              href="/servicios/payrolling"
            />

            {/* Service Card 6 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/3134837751.jpeg"
              category="Reclutamiento"
              title="RPO"
              href="/servicios/rpo"
            />

            {/* Service Card 7 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/2753799804.jpeg"
              category="Reclutamiento"
              title="Headhunting"
              href="/servicios/headhunting"
            />

            {/* Service Card 8 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/1476329533.jpeg"
              category="Reclutamiento"
              title="Reclutamiento TI"
              href="/servicios/reclutamiento-ti"
            />

            {/* Service Card 9 */}
            <ServiceCard
              image="https://ext.same-assets.com/2566223604/1542860947.jpeg"
              category="Reclutamiento"
              title="Reclutamiento y Selección"
              href="/servicios/reclutamiento-y-seleccion"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ image, category, title, href }: { image: string; category: string; title: string; href: string }) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <div className="relative h-60 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
          <span className="text-sm font-medium uppercase text-eqhuma-secondary mb-2">
            {category}
          </span>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      </div>
      <CardContent className="p-4 flex justify-end">
        <Link
          href={href}
          className="text-eqhuma-primary hover:text-eqhuma-accent"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
}
