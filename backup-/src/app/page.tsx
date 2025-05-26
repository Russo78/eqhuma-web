import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-eqhuma-darkBlue to-eqhuma-primary text-white py-20 md:py-32">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="text-eqhuma-secondary">+26 Años</span> <br />
              Transformando Organizaciones<br />
              con Talento
            </h1>
            <Button asChild className="rounded-full mt-6 bg-white text-eqhuma-primary hover:bg-gray-100">
              <Link href="/contacto">Contacto</Link>
            </Button>
          </div>
          <div className="relative hidden md:block">
            <Image
              src="/827097227.jpeg"
              alt="EQHuma Especialistas"
              width={600}
              height={450}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <p className="text-lg max-w-4xl mx-auto text-center text-gray-600">
            "Hacemos simple lo complejo, transformando la experiencia del capital humano con soluciones que conectan innovación, ética y excelencia."
          </p>
          <div className="flex justify-center mt-8">
            <Button asChild className="rounded-full bg-eqhuma-primary hover:bg-eqhuma-accent">
              <Link href="/contacto">HABLEMOS</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-wider text-eqhuma-accent font-medium mb-3">NUESTROS SERVICIOS</p>
            <h2 className="text-2xl font-bold">
              "Impulsamos la eficiencia y el rendimiento de tu negocio<br />
              <span className="italic text-eqhuma-primary">con soluciones que generan resultados."</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <ServiceCard
              image="/imagenes/reclutamiento1.png"
              category="Reclutamiento"
              title="Reclutamiento y Seleccion"
              href="/servicios/reclutamiento-y-seleccion"
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
          </div>
        </div>
      </section>

      {/* "Be our ally" Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="relative bg-gradient-to-r from-eqhuma-primary to-eqhuma-accent p-10 rounded-xl text-white">
            <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden rounded-r-xl">
              <Image
                src="https://ext.same-assets.com/2566223604/4237004906.jpeg"
                alt="EQHuma team"
                fill
                className="object-cover"
              />
            </div>
            <div className="md:w-2/3 relative z-10">
              <h2 className="text-3xl font-bold mb-8">
                Somos <span className="italic">tu mejor opción</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-center mb-2">Estrategia personalizada</h3>
                </div>
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-center mb-2">Respuesta inmediata</h3>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild className="rounded-full bg-white text-eqhuma-primary hover:bg-gray-100">
                  <Link href="/contacto">Obtén asesoría</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl font-bold mb-12 text-center">
            Con ellos <span className="italic text-eqhuma-primary">hacemos equipo</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-10 items-center">
            <Image
              src="/partners/coaching-efectivo.png"
              alt="Coaching Efectivo"
              width={180}
              height={80}
              className="object-contain"
            />
            <Image
              src="/partners/coparmex.png"
              alt="COPARMEX"
              width={180}
              height={80}
              className="object-contain"
            />
            <Image
              src="/partners/asem.png"
              alt="ASEM"
              width={180}
              height={80}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="bg-gray-50 p-10 rounded-xl">
            <div className="text-center mb-10">
              <p className="text-sm text-gray-500 mb-2">Conoce nuestras maravillosas</p>
              <h2 className="text-3xl font-bold">Historias de éxito</h2>
            </div>

            <div className="md:w-3/4 mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm mb-6">
                <blockquote className="text-gray-600 italic mb-4">
                  "EQHuma nos ha ayudado a formar las estructuras de nuestra organización, paso a paso, desde la creación de perfiles, el reclutamiento, y la parte recurrente del pago nómina. Trabajar juntos ha sido una experiencia gratificante"
                </blockquote>
                <div className="font-semibold">
                  <h4 className="text-eqhuma-primary">Cliente</h4>
                  <p className="text-sm text-gray-500">Sector Retail</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 md:py-24 bg-eqhuma-darkBlue text-white">
        <div className="container text-center">
          <p className="text-sm uppercase tracking-wider text-eqhuma-secondary font-medium mb-3">ESPECIALISTAS EN RRHH</p>
          <h2 className="text-3xl font-bold mb-8">Llegamos a donde nos necesites</h2>
          <Button asChild className="rounded-full bg-eqhuma-secondary hover:bg-eqhuma-accent">
            <Link href="/contacto">Contacto</Link>
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-4">
              <h3 className="text-4xl font-bold text-eqhuma-secondary mb-1">+ 300</h3>
              <p className="uppercase font-semibold">CLIENTES</p>
            </div>
            <div className="p-4">
              <h3 className="text-4xl font-bold text-eqhuma-secondary mb-1">+ 7500</h3>
              <p className="uppercase font-semibold">VACANTES CUBIERTAS</p>
            </div>
            <div className="p-4">
              <h3 className="text-4xl font-bold text-eqhuma-secondary mb-1">+ 30 mil</h3>
              <p className="uppercase font-semibold">TRABAJADORES CAPACITADOS</p>
            </div>
            <div className="p-4">
              <h3 className="text-4xl font-bold text-eqhuma-secondary mb-1">+ 26</h3>
              <p className="uppercase font-semibold">AÑOS DE EXPERIENCIA</p>
            </div>
          </div>
        </div>
      </section>

      {/* REPSE Section */}
      <section className="py-10 bg-eqhuma-secondary text-white">
        <div className="container text-center">
          <h2 className="text-xl md:text-2xl font-semibold">Pregunta por nuestra membresía a Socios</h2>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              Nuestro blog de <span className="italic text-eqhuma-primary">Recursos Humanos</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlogCard
              image="https://ext.same-assets.com/2566223604/2109795848.jpeg"
              category="Reclutamiento IT"
              date="Mar 04, 2025"
              title="Cómo en EQHuma Encontramos al Talento IT Ideal para tu Empresa"
              author="RR.HH."
              href="/blog/como-en-eqhuma-encontramos-al-talento-it-ideal-para-tu-empresa"
            />

            <BlogCard
              image="https://ext.same-assets.com/2566223604/3549694509.jpeg"
              category="Reclutamiento y selección"
              date="Abr 02, 2025"
              title="Contratar por Habilidades o Actitud: ¿Qué Es Más Importante para una Empresa en Crecimiento?"
              author="RR.HH."
              href="/blog/contratar-por-habilidades-o-actitud-que-es-mas-importante-para-una-empresa-en-crecimiento"
            />

            <BlogCard
              image="https://ext.same-assets.com/2566223604/2319833887.jpeg"
              category="Reclutamiento IT"
              date="May 27, 2025"
              title="Cómo el Reclutamiento IT estratégico puede transformar tu empresa"
              author="RR.HH."
              href="/blog/como-el-reclutamiento-it-estrategico-puede-transformar-tu-empresa"
            />
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-gray-50" id="Contacto">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Hablemos</h2>
          </div>

          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm">
            <ContactForm />
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

function BlogCard({ image, category, date, title, author, href }: { image: string; category: string; date: string; title: string; author: string; href: string }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-eqhuma-primary font-medium">
            {category}
          </span>
          <span className="text-xs text-gray-500">
            {date}
          </span>
        </div>
        <h3 className="text-lg font-bold mb-4 hover:text-eqhuma-primary transition-colors">
          <Link href={href} >{title}</Link>
        </h3>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            por {author}
          </span>
          <Link href={href} className="text-eqhuma-primary hover:text-eqhuma-accent text-sm font-medium">
            Leer más →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactForm() {
  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre*
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eqhuma-primary focus:border-eqhuma-primary"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Apellido*
          </label>
          <input
            type="text"
            id="lastName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eqhuma-primary focus:border-eqhuma-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
          Puesto/Cargo*
        </label>
        <input
          type="text"
          id="position"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eqhuma-primary focus:border-eqhuma-primary"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Empresa*
        </label>
        <input
          type="text"
          id="company"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eqhuma-primary focus:border-eqhuma-primary"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Corporativo*
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eqhuma-primary focus:border-eqhuma-primary"
        />
      </div>

      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
          ¿Qué servicio necesitas?*
        </label>
        <select
          id="service"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eqhuma-primary focus:border-eqhuma-primary"
        >
          <option value="">Selecciona</option>
          <option value="servicios-especializados">Servicios Especializados</option>
          <option value="reclutamiento">Reclutamiento</option>
          <option value="nomina">Nómina</option>
          <option value="hr-bpo">HR BPO</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje
        </label>
        <textarea
          id="message"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eqhuma-primary focus:border-eqhuma-primary"
          placeholder="Explícanos un poco más qué es lo que necesitas."
        />
      </div>

      <div className="flex justify-center">
        <Button className="rounded-full bg-eqhuma-accent hover:bg-eqhuma-primary px-8">
          Enviar
        </Button>
      </div>
    </form>
  );
}
