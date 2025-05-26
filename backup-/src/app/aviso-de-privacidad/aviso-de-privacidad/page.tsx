export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center">Aviso de Privacidad</h1>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="prose prose-lg max-w-none">
              <p>
                <strong>EQHuma Servicios Empresariales, S.A. de C.V.</strong> (en adelante "EQHuma"),
                con domicilio en Lázaro Cárdenas 1010 Col. Residencial San Agustín, San Pedro Garza Garcia, N.L. CP 66260,
                es responsable del tratamiento de sus datos personales.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">¿Para qué fines utilizaremos sus datos personales?</h2>
              <p>
                Los datos personales que recabamos de usted, los utilizaremos para las siguientes finalidades
                que son necesarias para el servicio que solicita:
              </p>
              <ul className="list-disc pl-8 space-y-2 my-4">
                <li>Para verificar y confirmar su identidad.</li>
                <li>Para administrar y operar los servicios que contrata con nosotros.</li>
                <li>Para proveer los servicios y productos requeridos por usted.</li>
                <li>Para fines de reclutamiento, selección de personal, y en su caso, para contratación laboral.</li>
                <li>Para formar expedientes laborales de los colaboradores.</li>
                <li>Para informar sobre cambios o nuevos servicios relacionados con los contratados por el cliente.</li>
              </ul>

              <p>
                De manera adicional, utilizaremos su información personal para las siguientes
                finalidades que no son necesarias para el servicio solicitado, pero que nos permiten
                brindarle una mejor atención:
              </p>
              <ul className="list-disc pl-8 space-y-2 my-4">
                <li>Para enviar comunicados y promociones comerciales.</li>
                <li>Para evaluar la calidad de nuestros servicios.</li>
                <li>Para realizar estudios internos sobre hábitos de consumo.</li>
                <li>Para fines estadísticos.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">¿Qué datos personales utilizaremos para estos fines?</h2>
              <p>
                Para llevar a cabo las finalidades descritas en el presente aviso de privacidad,
                utilizaremos los siguientes datos personales:
              </p>
              <ul className="list-disc pl-8 space-y-2 my-4">
                <li>Datos de identificación y contacto: nombre, domicilio, teléfono, correo electrónico, firma, CURP, RFC, fecha de nacimiento, edad, nacionalidad, imagen.</li>
                <li>Datos laborales: puesto, domicilio laboral, correo electrónico laboral, teléfono laboral, referencias laborales, experiencia laboral, historial académico.</li>
                <li>Datos académicos: trayectoria educativa, títulos, cédula profesional, certificados, reconocimientos.</li>
                <li>Datos patrimoniales o financieros: información fiscal, historial crediticio, ingresos, egresos, cuentas bancarias, seguros, afores, fianzas.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">¿Cómo puede acceder, rectificar o cancelar sus datos personales, u oponerse a su uso?</h2>
              <p>
                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y
                las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección
                de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación);
                que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo
                utilizada conforme a los principios, deberes y obligaciones previstas en la normativa (Cancelación);
                así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos
                se conocen como derechos ARCO.
              </p>
              <p>
                Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva
                a través del siguiente medio: enviando un correo electrónico a <span className="text-eqhuma-primary">privacidad@eqhuma.com</span>
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">¿Cómo puede revocar su consentimiento para el uso de sus datos personales?</h2>
              <p>
                Usted puede revocar el consentimiento que, en su caso, nos haya otorgado para el tratamiento de sus
                datos personales. Sin embargo, es importante que tenga en cuenta que no en todos los casos podremos
                atender su solicitud o concluir el uso de forma inmediata, ya que es posible que por alguna obligación
                legal requiramos seguir tratando sus datos personales.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">¿Cómo puede limitar el uso o divulgación de su información personal?</h2>
              <p>
                Con objeto de que usted pueda limitar el uso y divulgación de su información personal, le ofrecemos los
                siguientes medios: enviando un correo electrónico a <span className="text-eqhuma-primary">privacidad@eqhuma.com</span>
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Modificaciones al aviso de privacidad</h2>
              <p>
                El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos
                requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras
                prácticas de privacidad; de cambios en nuestro modelo de negocio, o por otras causas.
              </p>
              <p>
                Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad,
                a través de nuestro sitio web: <span className="text-eqhuma-primary">www.eqhuma.com</span>
              </p>

              <p className="text-right mt-8">
                Última actualización: Mayo 2025
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
