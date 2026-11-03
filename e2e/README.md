# Tests E2E y de integración (Playwright)

Todas las pruebas se corren con Playwright: unitarias de utilidades, API contra el backend real, migración contra MySQL y UI en Chromium.

## Requisitos

1. **MySQL 8 en Docker** (root/root, puerto 3306):
   ```bash
   docker run -d --name cyp-test-mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8.0
   ```
2. **Backend** en :8080, con Flyway activo para aplicar V5 igual que en prod:
   ```bash
   cd Backend/CambioJoyasLourdes
   DB_PASSWORD=root ADMIN_PASSWORD=admin-test-123 \
     SPRING_FLYWAY_ENABLED=true SPRING_JPA_HIBERNATE_DDL_AUTO=validate \
     ./mvnw spring-boot:run
   ```
   La base `cambio_joyas_prueba_db` debe crearse limpia. Si ya existía con una V5 anterior, borrarla (`DROP DATABASE cambio_joyas_prueba_db`): Flyway rechaza cambios de checksum.
3. Chromium de Playwright: `npx playwright install chromium`.

## Ejecutar

```bash
npm run test:e2e                     # todo
npx playwright test --project=unit   # utilidades (sin navegador)
npx playwright test --project=api    # backend real
npx playwright test --project=migration  # ejecuta V5 sobre una base de prueba
npx playwright test --project=ui     # UI en Chromium (usa el setup de login)
```

## Notas

- El backend limita los logins a 10 por minuto. La suite hace un solo login de UI (`auth.setup.ts`) y cachea el token de API (`support/api.ts`). Si se reinicia la suite muchas veces seguidas, esperar un minuto o reiniciar el backend.
- Los tests de API/UI resetean `intercambios` y los saldos de `balance` antes de cada prueba (`support/db.ts`).
- `migration/` usa su propia base (`mig_cotizacion_test`) y la borra al terminar.
