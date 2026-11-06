# Orvane

API de gestion de membres : CRUD, validation, PostgreSQL, documentation OpenAPI, tests, Docker et CI.

**Stack** : NestJS 11, TypeScript, Prisma 7 (adapter `pg`), PostgreSQL 17, Vitest, Docker, GitHub Actions. Node 22.

## Démarrage rapide (Docker)

Prérequis : Docker.

```bash
cp .env.example .env        # puis remplace POSTGRES_PASSWORD (et la même valeur dans DATABASE_URL)
docker compose up -d --build
```

Cela démarre PostgreSQL, applique les migrations (service `migrate`), puis lance l'API.

- API : http://localhost:3005
- Santé : http://localhost:3005/health

Le conteneur tourne en `NODE_ENV=production` : la documentation Swagger y est désactivée.

Arrêter : `docker compose down` (ajoute `-v` pour supprimer aussi les données).

## Développement local

Prérequis : Node 22, Docker.

```bash
docker compose up -d db          # PostgreSQL seul
npm ci
npm run prisma:generate          # génère le client Prisma (non versionné)
npm run prisma:migrate:deploy    # applique les migrations
npm run dev
```

- Documentation interactive (hors production) : http://localhost:3005/docs
- Spécification JSON : http://localhost:3005/docs/json

### Modifier le schéma de données

1. Édite `prisma/schema.prisma`.
2. `npm run prisma:migrate:dev -- --name <nom_de_la_migration>` crée et applique la migration.
3. `npm run prisma:generate` régénère le client.
4. Versionne le dossier `prisma/migrations`.

## API

| Méthode | Route          | Description                       | Succès |
|---------|----------------|-----------------------------------|--------|
| POST    | `/members`     | Créer un membre                   | 201    |
| GET     | `/members`     | Lister (paginé : `page`, `limit`) | 200    |
| GET     | `/members/:id` | Lire un membre                    | 200    |
| PATCH   | `/members/:id` | Modifier partiellement            | 200    |
| DELETE  | `/members/:id` | Supprimer                         | 204    |
| GET     | `/health`      | Santé de l'app et de la base      | 200    |

Erreurs : `400` (validation, UUID invalide, champ inconnu), `404` (membre introuvable), `409` (email déjà utilisé),
`503` (`/health` : base injoignable).

L'email est nettoyé et converti en minuscules ; les noms sont nettoyés.

## Tests

```bash
npm test            # tests unitaires (Prisma mocké)
npm run test:e2e    # tests e2e sur une vraie base PostgreSQL de test
```

Les tests e2e vident la table `members`. Ils exigent `TEST_DATABASE_URL` et refusent de tourner si le nom de la base ne
se termine pas par `_test`. Préparation, une seule fois :

```bash
docker compose up -d db
docker compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB> -c "CREATE DATABASE orvane_test"
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/orvane_test" npx prisma migrate deploy
```

## Qualité

```bash
npm run lint        # vérifie (ne modifie rien)
npm run lint:fix    # corrige
npm run format      # Prettier
```

## Intégration continue

`.github/workflows/ci.yml` exécute, à chaque push sur `main` et chaque pull request :

- job `ci` : installation, génération du client Prisma, lint, tests unitaires, build, migrations puis tests e2e (
  PostgreSQL en service) ;
- job `docker` : construction de l'image de production.

## Variables d'environnement

| Variable                                                             | Rôle                                                                    |
|----------------------------------------------------------------------|-------------------------------------------------------------------------|
| `NODE_ENV`                                                           | `development`, `test` ou `production` (désactive Swagger en production) |
| `PORT`                                                               | Port d'écoute de l'app (défaut 3005)                                    |
| `DATABASE_URL`                                                       | URL PostgreSQL de l'app (validée au démarrage)                          |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Conteneur PostgreSQL (Docker Compose)                                   |
| `APP_PORT`                                                           | Port hôte du conteneur `app` (défaut 3005)                              |
| `TEST_DATABASE_URL`                                                  | Base dédiée aux tests e2e (nom en `_test`)                              |

L'app refuse de démarrer si la configuration est invalide.

## Structure

```
src/
  config/      validation de l'environnement, Swagger
  common/      utilitaires partagés (transformations de DTO)
  health/      endpoint /health (Terminus)
  members/     module CRUD (controller, service, DTO, entité)
  prisma/      PrismaService et PrismaModule
  generated/   client Prisma (généré, non versionné)
prisma/        schéma et migrations
test/          tests e2e
```