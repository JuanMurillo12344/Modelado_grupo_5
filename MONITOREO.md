# Documentación del Proyecto

## Descripción
Plataforma web para la gestión de presupuestos, ingresos, gastos y reportes, con módulos de administración, monitoreo y recomendaciones basadas en IA.

## Tecnologías utilizadas
- Next.js
- React
- TypeScript
- Node.js
- pnpm
- PostgreSQL/MySQL
- Prisma/Sequelize
- Tailwind CSS/CSS Modules
- Jest
- ESLint y Prettier
- Docker
- Prometheus, Grafana, Vercel Analytics

---

## Instalación y uso
1. Clona el repositorio:
	 ```bash
	 git clone <URL-del-repositorio>
	 ```
2. Instala dependencias:
	 ```bash
	 pnpm install
	 ```
3. Configura las variables de entorno en un archivo `.env`.
4. Ejecuta migraciones de base de datos si aplica:
	 ```bash
	 pnpm prisma migrate deploy
	 ```
5. Inicia el servidor de desarrollo:
	 ```bash
	 pnpm dev
	 ```
6. Accede a `http://localhost:3000` en tu navegador.

---

## Documentación de API
La documentación de la API está disponible en formato OpenAPI/Swagger. Si el backend expone `/api/docs` o `/docs`, accede a esa ruta para ver la documentación interactiva.

Ejemplo de especificación OpenAPI:
```yaml
openapi: 3.0.0
info:
	title: API de Gestión Financiera
	version: 1.0.0
paths:
	/api/login:
		post:
			summary: Iniciar sesión
			requestBody:
				required: true
				content:
					application/json:
						schema:
							type: object
							properties:
								email:
									type: string
								password:
									type: string
			responses:
				'200':
					description: Sesión iniciada
	/api/budgets:
		get:
			summary: Listar presupuestos
			responses:
				'200':
					description: Lista de presupuestos
```

---

## Architectural Decision Records (ADRs)

### Título: Elección de Next.js como Framework Principal
- **Estado:** Aceptada
- **Contexto:** Se requiere SSR, rutas protegidas y experiencia moderna.
- **Decisión:** Se elige Next.js por su flexibilidad y soporte a SSR.
- **Consecuencias:** El equipo debe seguir las convenciones de Next.js y aprovechar sus ventajas para SEO y rendimiento.

### Título: Estrategia de Monitoreo y Evaluación Continua
- **Estado:** Aceptada
- **Contexto:** Se requiere monitoreo proactivo y métricas.
- **Decisión:** Se integran logs automáticos, Prometheus y Grafana.
- **Consecuencias:** El sistema será más robusto y confiable, con capacidad de reacción ante incidencias.

---
# Monitoreo y Métricas

- Usa console.log para registrar eventos importantes.
- Integra servicios como Datadog, Prometheus o Vercel Analytics para métricas avanzadas.
- Ejemplo de log:

```
console.log('Usuario creado:', userId);
```

---
# Guía de Contribución para Desarrolladores

## 1. Requisitos previos
- Instala Node.js y pnpm.
- Clona el repositorio y ejecuta `pnpm install`.
- Lee la documentación en MONITOREO.md y README.md.

## 2. Estilo de código
- Usa TypeScript y sigue las convenciones de Next.js.
- Aplica ESLint y Prettier antes de hacer commits.
- Nombra las funciones, variables y componentes de forma clara y descriptiva.
- Mantén la estructura de carpetas y archivos definida en el proyecto.

## 3. Flujo de trabajo
- Crea una rama nueva para cada funcionalidad o corrección (`feature/nombre`, `fix/nombre`).
- Realiza commits pequeños y descriptivos.
- Antes de hacer pull request, asegúrate de que el código pase los tests y lint.
- Sincroniza tu rama con `main` antes de solicitar revisión.

## 4. Revisiones y Pull Requests
- Describe claramente los cambios en el pull request.
- Responde a los comentarios de revisión y realiza los cambios necesarios.
- No mezcles cambios no relacionados en el mismo PR.
- Espera la aprobación de al menos un revisor antes de hacer merge.

## 5. Buenas prácticas
- Documenta las funciones y componentes importantes usando JSDoc o comentarios claros.
- Agrega tests para nuevas funcionalidades y mantén la cobertura de pruebas.
- Mantén la documentación actualizada en los archivos correspondientes.
- Usa variables de entorno para credenciales y configuraciones sensibles.

## 6. Gestión de incidencias
- Reporta bugs y sugerencias en el sistema de issues del repositorio.
- Incluye pasos para reproducir, comportamiento esperado y capturas de pantalla si es posible.
- Asigna etiquetas y responsables según corresponda.

## 7. Convenciones de documentación
- Utiliza Markdown para la documentación.
- Estructura los documentos con títulos, listas y ejemplos de uso.
- Actualiza el changelog y los ADRs cuando se tomen decisiones relevantes.

## 8. Proceso de despliegue
- Verifica que el código pase todos los tests antes de desplegar.
- Sigue el procedimiento definido en el archivo DEPLOY.md o README.md.
- Notifica al equipo sobre despliegues y cambios importantes.

## 9. Onboarding de nuevos desarrolladores
- Proporciona acceso al repositorio y documentación básica.
- Asigna tareas introductorias y revisa el avance.
- Fomenta la participación en revisiones y reuniones técnicas.

## 10. Comunicación
- Usa los canales definidos (Slack, correo, etc.) para dudas o sugerencias.
- Sé respetuoso y colaborativo con el equipo.
- Documenta acuerdos y decisiones en los archivos correspondientes.





