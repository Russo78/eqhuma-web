import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-eqhuma-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Button asChild className="rounded-full bg-eqhuma-primary hover:bg-eqhuma-accent">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
