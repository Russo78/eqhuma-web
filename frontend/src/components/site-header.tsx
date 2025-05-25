import Link from "next/link";
import Image from "next/image";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

// Definición de items principales de navegación
const mainNavItems = [
  { title: "Inicio", href: "/" },
  {
    title: "Servicios para empresas",
    href: "#",
    submenu:  [
      {
        title: "Soluciones de personal",
        href: "#",
        subitems: [
          { title: "Capacitación", href: "/servicios/capacitacion" },
         /* { title: "NOM-035", href: "/servicios/nom-035" },
          { title: "NOM 037", href: "/servicios/nom-037" },*/
        ],
      },
      {
        title: "Reclutamiento",
        href: "#",
        subitems: [
          { title: "Reclutamiento y Selección", href: "/servicios/reclutamiento-y-seleccion" },
         // { title: "Reclutamiento TI", href: "/servicios/reclutamiento-ti" },
          { title: "Headhunting", href: "/servicios/headhunting" },
          //{ title: "RPO", href: "/servicios/rpo" },
        ],
      },
      {
        title: "Evaluaciones Laborales",
        href: "#",
        subitems: [
          { title: "Investigaciones Laborales", href: "/servicios/verificaciones-laborales" },
          { title: "Evaluaciones Psicométricas", href: "/servicios/evaluaciones-psicometricas" },
          { title: "Probity Test", href: "/servicios/probity" },
        ],
      },
      /*{
        title: "Servicios Modulares",
        href: "/servicios/hr-bpo",
        subitems: [
          { title: "HR BPO", href: "/servicios/hr-bpo" },
          { title: "Estudio de Sueldos", href: "/servicios/estudio-de-sueldos" },
        ],
      },*/
    ],
  },
  { title: "Webinars", href: "#" },
  { title: "eBooks", href: "#" },
  //{ title: "eqhumaols", href: "#" },
  { title: "Bolsa de Trabajo", href: "https://eqhuma.contratamos.mx/" },
  { title: "Blog", href: "/blog" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="eqhuma"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
            <span className="sr-only">eqhuma</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <DesktopNav />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <SocialIcons />
            <Link href="tel: 555080580" className="text-sm text-muted-foreground hover:text-primary">
              Teléfono 55 5080 5800
            </Link>
            <Button className="bg-eqhuma-primary hover:bg-eqhuma-accent text-white rounded-full">Hablemos</Button>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

function DesktopNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {mainNavItems.map((item) =>
          item.submenu ? (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuTrigger className="h-auto">{item.title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[500px] md:w-[600px] lg:w-[700px] lg:grid-cols-4">
                  {item.submenu.map((submenu) => (
                    <div key={submenu.title} className="space-y-2">
                      <Link
                        href={submenu.href}
                        className="block font-medium text-sm text-eqhuma-primary hover:text-eqhuma-accent"
                      >
                        {submenu.title}
                      </Link>
                      {submenu.subitems && (
                        <ul className="space-y-1">
                          {submenu.subitems.map((subitem) => (
                            <li key={subitem.title}>
                              <Link
                                href={subitem.href}
                                className="block text-muted-foreground hover:text-eqhuma-primary text-sm"
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.title}>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink className="font-medium">
                  {item.title}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <Link href="/" className="flex items-center py-4">
          <Image
            src="/logo.png"
            alt="eqhuma"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
          <span className="sr-only">eqhuma</span>
        </Link>
        <nav className="mt-6 flex flex-col gap-4">
          {mainNavItems.map((item) => (
            <div key={item.title} className="mb-4">
              <Link
                href={item.href}
                className="text-base font-medium text-foreground hover:text-eqhuma-primary"
              >
                {item.title}
              </Link>
              {item.submenu && (
                <div className="mt-2 space-y-2 ml-4">
                  {item.submenu.map((submenu) => (
                    <div key={submenu.title} className="space-y-1">
                      <Link
                        href={submenu.href}
                        className="block font-medium text-sm text-eqhuma-primary hover:text-eqhuma-accent"
                      >
                        {submenu.title}
                      </Link>
                      {submenu.subitems && (
                        <ul className="space-y-1 ml-2">
                          {submenu.subitems.map((subitem) => (
                            <li key={subitem.title}>
                              <Link
                                href={subitem.href}
                                className="block text-muted-foreground hover:text-eqhuma-primary text-xs"
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-4">
          <SocialIcons />
          <Link href="tel: 8183408031" className="text-sm text-muted-foreground hover:text-primary">
            Teléfono 8183408031
          </Link>
          <Button className="bg-eqhuma-primary hover:bg-eqhuma-accent text-white rounded-full">Hablemos</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SocialIcons() {
  return (
    <div className="flex gap-2">
      <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
          </svg>
        </Button>
      </Link>
      <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
          </svg>
        </Button>
      </Link>
      <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
          </svg>
        </Button>
      </Link>
    </div>
  );
}
