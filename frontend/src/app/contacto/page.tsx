import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">CONTÁCTANOS</h1>
            <h2 className="text-2xl font-bold mb-4">
              Enfócate en tu negocio, <span className="italic text-eqhuma-primary">déjanos tu Capital Humano</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conversemos sobre cómo podemos ayudarte. Compártenos tus datos y nuestro equipo se pondrá en contacto contigo en breve.
            </p>
            <p className="mt-4 text-gray-600">
              <strong>¿Buscas empleo?</strong> Envíanos tu CV a: <Link href="mailto:reclutamiento@eqhuma.com" className="text-eqhuma-primary hover:text-eqhuma-accent">reclutamiento@eqhuma.com</Link> y forma parte de nuestro equipo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <ContactForm />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <SocialIcons />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <LocationCard
              city="San Pedro Garza García, Nuevo León"
              address="Lázaro Cárdenas 1010 Col. Residencial San Agustín, San Pedro Garza Garcia, N.L. CP 66260"
            />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative h-[400px] bg-gray-200">
        <iframe
          title="Ubicación de EQHuma - Lázaro Cárdenas 1010, San Pedro Garza García"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3595.9486493464483!2d-100.3714144!3d25.6526252!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662bd7042f22ced%3A0x89f740fe2dd76df!2sLazaro%20Cardenas%201010%2C%20Residencial%20San%20Agust%C3%ADn%2C%2066260%20San%20Pedro%20Garza%20Garc%C3%ADa%2C%20N.L.!5e0!3m2!1sen!2smx!4v1714973644729!5m2!1sen!2smx"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        />
      </section>
    </div>
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

function LocationCard({ city, address }: { city: string; address: string }) {
  return (
    <div className="border border-gray-100 rounded-lg p-8 text-center">
      <h3 className="text-xl font-bold text-eqhuma-primary mb-4">{city}</h3>
      <p className="text-gray-600">{address}</p>
    </div>
  );
}

function SocialIcons() {
  return (
    <>
      <Link
        href="https://www.facebook.com/share/19D5AbZvbB/?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        className="text-eqhuma-primary hover:text-eqhuma-accent"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
        </svg>
      </Link>
      <Link
        href="https://www.linkedin.com/company/eqhuma-consultores/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-eqhuma-primary hover:text-eqhuma-accent"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
          <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
        </svg>
      </Link>
      <Link
        href="https://twitter.com/EQHuma"
        target="_blank"
        rel="noopener noreferrer"
        className="text-eqhuma-primary hover:text-eqhuma-accent"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
          <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
        </svg>
      </Link>
    </>
  );
}
