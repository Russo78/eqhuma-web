import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const blogPosts = [
  {
    image: "https://ext.same-assets.com/2566223604/2109795848.jpeg",
    category: "Reclutamiento IT",
    date: "Dic 04, 2024",
    title: "Cómo en eqhuma Encontramos al Talento IT Ideal para tu Empresa",
    author: "RR.HH.",
    href: "/blog/como-en-eqhuma-encontramos-al-talento-it-ideal-para-tu-empresa",
    excerpt: "En un mercado laboral tan competitivo como el actual, encontrar profesionales IT cualificados se ha convertido en uno de los mayores desafíos para las empresas. En eqhuma, contamos con métodos específicos para identificar y atraer al mejor talento tecnológico."
  },
  {
    image: "https://ext.same-assets.com/2566223604/3549694509.jpeg",
    category: "Reclutamiento y selección",
    date: "Dic 02, 2024",
    title: "Contratar por Habilidades o Actitud: ¿Qué Es Más Importante para una Empresa en Crecimiento?",
    author: "RR.HH.",
    href: "/blog/contratar-por-habilidades-o-actitud-que-es-mas-importante-para-una-empresa-en-crecimiento",
    excerpt: "El dilema entre priorizar habilidades técnicas o actitud positiva sigue siendo uno de los grandes debates en el mundo del reclutamiento. Analizamos qué enfoque resulta más beneficioso para empresas en fase de crecimiento."
  },
  {
    image: "https://ext.same-assets.com/2566223604/2319833887.jpeg",
    category: "Reclutamiento IT",
    date: "Nov 27, 2024",
    title: "Cómo el Reclutamiento IT estratégico puede transformar tu empresa",
    author: "RR.HH.",
    href: "/blog/como-el-reclutamiento-it-estrategico-puede-transformar-tu-empresa",
    excerpt: "La transformación digital ya no es una opción, sino una necesidad. Descubre cómo implementar un proceso de reclutamiento IT estratégico puede ser el catalizador que impulse la innovación y competitividad en tu organización."
  },
  {
    image: "https://ext.same-assets.com/2566223604/1069454745.jpeg",
    category: "Recursos Humanos",
    date: "Nov 20, 2024",
    title: "Aplicación efectiva de la NOM-035: Casos de éxito en empresas mexicanas",
    author: "RR.HH.",
    href: "/blog/aplicacion-efectiva-de-la-nom-035-casos-de-exito-en-empresas-mexicanas",
    excerpt: "La NOM-035 ha representado un cambio paradigmático en la forma en que las empresas mexicanas abordan la salud mental en el entorno laboral. Compartimos experiencias de implementación exitosa."
  },
  {
    image: "https://ext.same-assets.com/2566223604/808501582.jpeg",
    category: "HR BPO",
    date: "Nov 15, 2024",
    title: "Ventajas de externalizar la gestión de Recursos Humanos con un proveedor especializado",
    author: "RR.HH.",
    href: "/blog/ventajas-de-externalizar-la-gestion-de-recursos-humanos-con-un-proveedor-especializado",
    excerpt: "La subcontratación de procesos de RRHH (HR BPO) permite a las empresas centrarse en su core business mientras optimizan costos y mejoran la eficiencia de sus procesos de capital humano."
  },
  {
    image: "https://ext.same-assets.com/2566223604/1941457086.jpeg",
    category: "Servicios Especializados",
    date: "Nov 10, 2024",
    title: "El impacto del REPSE en la contratación de servicios especializados",
    author: "RR.HH.",
    href: "/blog/el-impacto-del-repse-en-la-contratacion-de-servicios-especializados",
    excerpt: "El Registro de Prestadoras de Servicios Especializados u Obras Especializadas (REPSE) ha transformado el panorama de la subcontratación en México. Analizamos los beneficios y desafíos de este nuevo marco regulatorio."
  }
];

export default function BlogPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Nuestro blog de <span className="italic text-eqhuma-primary">Recursos Humanos</span>
          </h1>
          <p className="text-lg mt-6 text-center max-w-3xl mx-auto text-gray-600">
            Encuentra información relevante y actualizada sobre tendencias en recursos humanos, reclutamiento, gestión del talento y normativas laborales en México.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.href}
                image={post.image}
                category={post.category}
                date={post.date}
                title={post.title}
                author={post.author}
                href={post.href}
                excerpt={post.excerpt}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BlogCard({
  image,
  category,
  date,
  title,
  author,
  href,
  excerpt
}: {
  image: string;
  category: string;
  date: string;
  title: string;
  author: string;
  href: string;
  excerpt: string;
}) {
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
          <Link href={href}>{title}</Link>
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>
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
