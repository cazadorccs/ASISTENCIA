# 📦 Kit de Arquitectura y Extracción (Estándar "Itero")

**Versión del Kit:** 1.0.0
**Basado en:** Proyecto Itero (React + Vite + TypeScript)
**Objetivo:** Proveer una base sólida, escalable y bien documentada para el inicio rápido de nuevas aplicaciones SPA (Single Page Applications) de alta calidad.

---

## 1. 📂 Estructura de Directorios (Blueprint)

Crea esta estructura de carpetas inmediatamente al iniciar el proyecto (`npm create vite@latest`).

```text
nombre-proyecto/
├── .storybook/          # Configuración de Storybook (main.ts, preview.tsx)
├── docs/                # El "Cerebro" del proyecto
│   ├── ARCHITECTURE.md  # Por qué se tomaron las decisiones técnicas
│   ├── ROADMAP.md       # Futuro del proyecto (Ahora / Próximo / Futuro)
│   └── SESSION_LOG.md   # Bitácora diaria de desarrollo (CRÍTICO)
├── public/
│   └── locales/         # i18n (es.json, en.json)
├── src/
│   ├── components/      # Componentes React
│   │   ├── ui/          # Átomos básicos (Button, Input, Modal)
│   │   └── [Feature]/   # Componentes específicos de una funcionalidad
│   ├── context/         # Estado Global (SettingsContext, AppContext)
│   ├── hooks/           # Lógica de negocio extraída (useUIState, etc.)
│   ├── types/           # Definiciones TypeScript centralizadas (types.ts)
│   ├── util/            # Funciones puras, helpers, constantes
│   ├── App.tsx          # Orquestador principal
│   └── main.tsx         # Punto de entrada
├── tests/               # Pruebas E2E (Playwright)
├── .gitignore           # Ignorar node_modules, dist, .env
├── CHANGELOG.md         # Registro de cambios (Formato Keep a Changelog)
├── CONTRIBUTING.md      # Guía para desarrolladores
├── README.md            # Portada del proyecto
└── vite.config.ts       # Configuración de build
```

---

## 2. 🛠️ Configuración y Herramientas (Stack)

Instala estas dependencias para replicar el entorno de desarrollo:

*   **Core:** React 18+, TypeScript, Vite.
*   **Estilos:** TailwindCSS (`npm install -D tailwindcss postcss autoprefixer`).
*   **Iconos:** `lucide-react` (Ligera y consistente).
*   **Calidad:**
    *   `eslint` + `prettier`.
    *   `@playwright/test` (Testing E2E).
    *   `storybook` (Desarrollo aislado de UI).
*   **Utilidades:** `nanoid` (IDs únicos), `clsx` o `tailwind-merge` (opcional, para clases dinámicas).

### Scripts recomendados (`package.json`)
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test:e2e": "playwright test",
  "storybook": "storybook dev -p 6006",
  "lint:fix": "eslint . --ext ts,tsx --fix"
}
```

---

## 3. 🧠 Patrones de Arquitectura (Código Reutilizable)

Copia estos patrones para desacoplar la lógica de la vista desde el día 1.

### A. Patrón de Gestión de UI (`hooks/useUIStateManagement.ts`)
Evita llenar `App.tsx` con `useState`. Usa un reducer para modales y estados de interfaz.

```typescript
// Estructura básica para copiar
import { useReducer, useCallback } from 'react';

const initialUIState = {
  isSettingsOpen: false,
  isModalXOpen: false,
  // ...otros estados
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_SETTINGS': return { ...state, isSettingsOpen: true };
    case 'CLOSE_SETTINGS': return { ...state, isSettingsOpen: false };
    // ...otros casos
    default: return state;
  }
};

export const useUIStateManagement = () => {
  const [uiState, dispatch] = useReducer(uiReducer, initialUIState);

  // Handlers memoizados para exportar
  const settingsHandlers = {
    open: useCallback(() => dispatch({ type: 'OPEN_SETTINGS' }), []),
    close: useCallback(() => dispatch({ type: 'CLOSE_SETTINGS' }), []),
  };

  return { uiState, settingsHandlers };
};
```

### B. El Componente Escudo (`components/ErrorBoundary.tsx`)
Nunca permitas que la app se ponga en blanco. Envuelve tu `App` con esto.

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children?: ReactNode }
interface State { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center">
          <h1>¡Ups! Algo salió mal.</h1>
          <button onClick={() => window.location.reload()}>Recargar</button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
```

### C. Contexto de Configuración (`context/SettingsContext.tsx`)
Para manejar temas (Dark Mode) e Internacionalización (i18n) de forma centralizada.

---

## 4. 📝 Estándares de Documentación

Copia estos archivos del proyecto "Itero" y adáptalos. Son la clave para el mantenimiento a largo plazo.

1.  **`docs/SESSION_LOG.md`**:
    *   *Formato:* Fecha | Versión | Tema | Cambios Técnicos.
    *   *Uso:* Rellenar al final de cada sesión de programación.

2.  **`CHANGELOG.md`**:
    *   *Formato:* Basado en "Keep a Changelog".
    *   *Secciones:* `Added`, `Changed`, `Fixed`.

3.  **`README.md`**:
    *   Debe incluir: Descripción, Características, "Cómo ejecutar", y Stack Tecnológico.

---

## 5. 🎨 UI Base (Tailwind Config)

En `index.html` o `tailwind.config.js`, establece las fuentes y colores base desde el principio.

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Cuerpo
        heading: ['"Open Sans"', 'sans-serif'], // Títulos
      },
      colors: {
        primary: '#2563EB', // Define tu color semántico
      }
    },
  },
}
```

---

## 6. ✅ Checklist de Arranque

1.  [ ] Inicializar repo git y estructura de carpetas.
2.  [ ] Copiar `tsconfig.json` y `vite.config.ts` (ajustar alias `@/`).
3.  [ ] Copiar `ErrorBoundary.tsx` y envolver la app en `main.tsx`.
4.  [ ] Crear `docs/SESSION_LOG.md` y hacer la primera entrada.
5.  [ ] Instalar Tailwind y configurar fuentes.
6.  [ ] Configurar Storybook para componentes UI base.

---
*Este kit es propiedad intelectual derivada del proyecto Itero. Úsalo para mantener la excelencia en ingeniería.*