/**
 * @fileoverview
 * @namespace components
 * Questo file contiene il componente React `Footer`, che visualizza il piè di pagina dell'applicazione.
 * Il componente può essere reso in una versione minimalista, mostrando solo il copyright e il contatto via email,
 * oppure con informazioni aggiuntive, come la versione della dashboard.
 *
 * @module Footer
 */

import React from "react";

/**
 * Componente che visualizza il piè di pagina dell'applicazione.
 * Se la proprietà `minimal` è vera, viene mostrato un piè di pagina semplificato.
 * Altrimenti, vengono mostrate anche informazioni sulla versione dell'applicazione.
 *
 * @component
 *
 * @param {Object} props - Le proprietà passate al componente.
 * @param {boolean} [props.minimal=false] - Se impostato su `true`, visualizza solo il copyright e il contatto via email.
 *
 * @returns {JSX.Element} Un elemento JSX che rappresenta il piè di pagina dell'applicazione.
 */

function Footer({ minimal = false }) {
  return (
    <>
      {/* Sezione footer con informazioni aggiuntive */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        {minimal ? (
          <>
            <p>
              &copy; 2025 Centro di Sostenibilità e Transizione Ecologica di
              Ateneo
            </p>
            <p>
              <a
                href="mailto:cste@unipa.it"
                className="text-blue-500 hover:underline"
              >
                Contatta via email
              </a>
            </p>
          </>
        ) : (
          <>
            <p>
              &copy; 2025 Centro di Sostenibilità e Transizione Ecologica di
              Ateneo
            </p>
            <p>Dashboard consumi - Versione 2.0.0</p>
            <p>
              <a
                href="mailto:cste@unipa.it"
                className="text-blue-500 hover:underline"
              >
                Contatta via email
              </a>
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default Footer;
