# Estrategia de Backup y Rollback

## Backup
- Realiza backups automáticos de la base de datos con herramientas como pg_dump o servicios de tu proveedor cloud.
- Ejemplo:
```
pg_dump $DATABASE_URL > backup.sql
```

## Rollback
- Para restaurar, usa:
```
psql $DATABASE_URL < backup.sql
```
- Documenta los cambios importantes y realiza backups antes de actualizaciones críticas.
