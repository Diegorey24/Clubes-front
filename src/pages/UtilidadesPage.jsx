import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader/PageHeader";
import Title from "../components/ui/Title/Title";
import styles from "./UtilidadesPage.module.css";

// Un ícono representativo por sección, para el badge de color junto al
// título. Son decorativos: el mismo criterio de heroicons 20x20 que ya se
// usa en el resto de los tiles.
const ProcesosSectionIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
  </svg>
);

const InformesSectionIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
  </svg>
);

const TablasSectionIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h2V5H5zm4 0v2h2V5H9zm4 0v2h2V5h-2zM5 9v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zM5 13v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z"
      clipRule="evenodd"
    />
  </svg>
);

const ParametrosSectionIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
      clipRule="evenodd"
    />
  </svg>
);

// Procesos: antes eran tarjetas grandes destacadas; ahora son accesos
// discretos más, con el mismo look chico (icono + label) que el resto de
// las secciones, para que no compitan visualmente con Informes/Tablas/etc.
const PROCESOS = [
  {
    to: "/generar-cuotas",
    label: "Generar Cuotas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h6.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm9 9a1 1 0 10-2 0v1H9a1 1 0 100 2h2v1a1 1 0 102 0v-1h2a1 1 0 100-2h-2v-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/generacion-archivos",
    label: "Generación de Archivos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/rechazos",
    label: "Rechazos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const INFORMES = [
  {
    to: "/informe-socios-contacto",
    label: "Listado de Socios con Datos de Contacto",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    ),
  },
  {
    to: "/informe-socios-deudas",
    label: "Listado de Socios y sus Deudas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/informe-planilla-socios",
    label: "Planilla de Socios y Deudas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h2V5H5zm4 0v2h2V5H9zm4 0v2h2V5h-2zM5 9v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zM5 13v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/informe-cobranza-periodo",
    label: "Cobranza por Período",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-6zM8 7a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 3a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z" />
      </svg>
    ),
  },
];

const TABLAS = [
  {
    to: "/categorias-socios",
    label: "Categorías",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/grupos-familiares",
    label: "Grupos Familiares",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
      </svg>
    ),
  },
  {
    to: "/rubros",
    label: "Rubros",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    to: "/radios",
    label: "Radios",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/formapago",
    label: "Forma de Pago",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path
          fillRule="evenodd"
          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/mediospago",
    label: "Medio de Pago",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/motivos-baja",
    label: "Motivos de Baja",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 01.894.553l7 14A1 1 0 0117 18H3a1 1 0 01-.894-1.447l7-14A1 1 0 0110 2zm0 5a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1zm0 7a1 1 0 100 2 1 1 0 000-2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const PARAMETROS = [
  {
    to: "/parametros",
    label: "Parámetros",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    to: "/parametros-debitos",
    label: "Parámetros Débitos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path
          fillRule="evenodd"
          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

// Usuarios era antes su propia sección "Administración"; ahora es un tile
// más dentro de Parámetros. Solo se admin puede gestionar usuarios, así que
// se agrega condicionalmente (ver más abajo) en vez de ir fijo en PARAMETROS.
const USUARIOS_TILE = {
  to: "/usuarios",
  label: "Usuarios",
  icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
};

/**
 * Página "Utilidades": reemplaza al viejo dropdown del header. Agrupa los
 * accesos a procesos, informes, tablas maestras y parámetros en una sola
 * vista, sin depender de un menú desplegable que en pantallas chicas
 * terminaba ocupando media pantalla de alto.
 */
const UtilidadesPage = ({ usuario }) => {
  const isAdmin = usuario?.tipo === "Administrador";
  const parametrosTiles = isAdmin ? [...PARAMETROS, USUARIOS_TILE] : PARAMETROS;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Utilidades"
        subtitle="Procesos, tablas maestras y parámetros del sistema"
      />

      <section className={`${styles.panel} ${styles.procesos}`}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIcon}>{ProcesosSectionIcon}</span>
          <Title variant="section" subtitle="Tareas operativas del día a día">Procesos</Title>
        </div>
        <div className={styles.tileGrid}>
          {PROCESOS.map((item) => (
            <Link key={item.to} to={item.to} className={styles.tile}>
              <span className={styles.tileIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.informes}`}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIcon}>{InformesSectionIcon}</span>
          <Title variant="section" subtitle="Reportes y listados para seguir el estado del club">Informes</Title>
        </div>
        <div className={styles.tileGrid}>
          {INFORMES.map((item) => (
            <Link key={item.to} to={item.to} className={styles.tile}>
              <span className={styles.tileIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.tablas}`}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIcon}>{TablasSectionIcon}</span>
          <Title variant="section" subtitle="Catálogos maestros que alimentan el resto del sistema">Tablas</Title>
        </div>
        <div className={styles.tileGrid}>
          {TABLAS.map((item) => (
            <Link key={item.to} to={item.to} className={styles.tile}>
              <span className={styles.tileIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.parametros}`}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIcon}>{ParametrosSectionIcon}</span>
          <Title variant="section" subtitle="Configuración general y accesos administrativos">Parámetros</Title>
        </div>
        <div className={styles.tileGrid}>
          {parametrosTiles.map((item) => (
            <Link key={item.to} to={item.to} className={styles.tile}>
              <span className={styles.tileIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UtilidadesPage;
