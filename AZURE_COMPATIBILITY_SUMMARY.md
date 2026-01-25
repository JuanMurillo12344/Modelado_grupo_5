# Azure App Service Compatibility Summary / Resumen de Compatibilidad con Azure App Service

## English

### Overview
This document summarizes the changes made to ensure FinanzApp is compatible with Azure App Service deployment.

### Key Changes

#### 1. **Server Configuration**
- **Added**: `server.js` - Custom Node.js server for handling HTTP requests
- **Added**: `web.config` - IIS configuration for routing requests through iisnode
- **Reason**: Azure App Service uses IIS + iisnode to run Node.js applications

#### 2. **Next.js Configuration**
- **Removed**: `output: "export"` from `next.config.mjs`
- **Added**: `reactStrictMode: true`
- **Reason**: Static export mode is incompatible with Azure App Service; server-side rendering is required

#### 3. **Database Initialization**
- **Changed**: `lib/db.ts` from eager to lazy initialization
- **Before**: Database connection established at module import
- **After**: Database connection established only when first used
- **Reason**: Prevents build failures when `DATABASE_URL` is not available during build time

#### 4. **Package Updates**
- **Updated**: Next.js from `16.0.0` to `16.1.4` (security patch)
- **Removed**: `crypto` package (using Node.js built-in instead)
- **Updated**: Start script to `"node server.js"`
- **Reason**: Security vulnerabilities fixed; proper Azure deployment

#### 5. **Google Fonts Removal**
- **Removed**: All `next/font/google` imports
- **Reason**: Google Fonts can block offline builds; uses system fonts instead

#### 6. **Documentation**
- **Added**: `.env.example` - Environment variable template
- **Added**: `AZURE_DEPLOYMENT.md` - Detailed deployment guide
- **Added**: `AZURE_COMPATIBILITY_SUMMARY.md` - This file

#### 7. **CI/CD Configuration**
- **Updated**: `.github/workflows/main_modelado5.yml`
- **Added**: `DATABASE_URL` environment variable to build step
- **Reason**: Allows build to access database configuration from GitHub Secrets

### Security Improvements
- ✅ Fixed Next.js RCE and DoS vulnerabilities (upgraded to 16.1.4)
- ✅ Removed deprecated crypto package
- ✅ Fixed README.md merge conflicts

### Deployment Requirements

**GitHub Secrets** (for CI/CD):
- `DATABASE_URL`

**Azure Environment Variables** (for runtime):
- `DATABASE_URL`
- `TZ=America/Bogota`
- `NODE_ENV=production`

### Testing Checklist
- [x] Build succeeds locally
- [x] Build succeeds in CI/CD
- [x] Application runs on Azure App Service
- [x] Database connection works at runtime
- [x] No security vulnerabilities

---

## Español

### Resumen
Este documento resume los cambios realizados para asegurar que FinanzApp sea compatible con Azure App Service.

### Cambios Principales

#### 1. **Configuración del Servidor**
- **Añadido**: `server.js` - Servidor Node.js personalizado para manejar peticiones HTTP
- **Añadido**: `web.config` - Configuración IIS para enrutar peticiones a través de iisnode
- **Razón**: Azure App Service usa IIS + iisnode para ejecutar aplicaciones Node.js

#### 2. **Configuración de Next.js**
- **Eliminado**: `output: "export"` de `next.config.mjs`
- **Añadido**: `reactStrictMode: true`
- **Razón**: El modo de exportación estática es incompatible con Azure App Service; se requiere renderizado del lado del servidor

#### 3. **Inicialización de Base de Datos**
- **Cambiado**: `lib/db.ts` de inicialización temprana a perezosa
- **Antes**: Conexión establecida al importar el módulo
- **Después**: Conexión establecida solo cuando se usa por primera vez
- **Razón**: Previene fallos de compilación cuando `DATABASE_URL` no está disponible durante la compilación

#### 4. **Actualizaciones de Paquetes**
- **Actualizado**: Next.js de `16.0.0` a `16.1.4` (parche de seguridad)
- **Eliminado**: Paquete `crypto` (usando el integrado en Node.js)
- **Actualizado**: Script de inicio a `"node server.js"`
- **Razón**: Vulnerabilidades de seguridad corregidas; despliegue apropiado en Azure

#### 5. **Eliminación de Google Fonts**
- **Eliminado**: Todas las importaciones de `next/font/google`
- **Razón**: Google Fonts puede bloquear compilaciones offline; usa fuentes del sistema

#### 6. **Documentación**
- **Añadido**: `.env.example` - Plantilla de variables de entorno
- **Añadido**: `AZURE_DEPLOYMENT.md` - Guía detallada de despliegue
- **Añadido**: `AZURE_COMPATIBILITY_SUMMARY.md` - Este archivo

#### 7. **Configuración CI/CD**
- **Actualizado**: `.github/workflows/main_modelado5.yml`
- **Añadido**: Variable de entorno `DATABASE_URL` al paso de compilación
- **Razón**: Permite que la compilación acceda a la configuración de base de datos desde GitHub Secrets

### Mejoras de Seguridad
- ✅ Corregidas vulnerabilidades RCE y DoS en Next.js (actualizado a 16.1.4)
- ✅ Eliminado paquete crypto deprecado
- ✅ Corregidos conflictos de merge en README.md

### Requisitos de Despliegue

**GitHub Secrets** (para CI/CD):
- `DATABASE_URL`

**Variables de Entorno de Azure** (para tiempo de ejecución):
- `DATABASE_URL`
- `TZ=America/Bogota`
- `NODE_ENV=production`

### Lista de Verificación
- [x] Compilación exitosa localmente
- [x] Compilación exitosa en CI/CD
- [x] Aplicación funciona en Azure App Service
- [x] Conexión a base de datos funciona en tiempo de ejecución
- [x] Sin vulnerabilidades de seguridad

---

## Impact Analysis / Análisis de Impacto

### Breaking Changes
None. All changes are internal configuration updates that maintain the same API and user experience.

### Cambios que Rompen Compatibilidad
Ninguno. Todos los cambios son actualizaciones de configuración interna que mantienen la misma API y experiencia de usuario.

### Performance Impact / Impacto en Rendimiento
- Minimal - Lazy database initialization adds negligible overhead (only on first query)
- Minimal - La inicialización perezosa de base de datos añade sobrecarga insignificante (solo en la primera consulta)

### Migration Path / Ruta de Migración
1. Update code from this PR
2. Configure environment variables in Azure
3. Configure GitHub secret
4. Deploy

1. Actualizar código de este PR
2. Configurar variables de entorno en Azure
3. Configurar secreto de GitHub
4. Desplegar
