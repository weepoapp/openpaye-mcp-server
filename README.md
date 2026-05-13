# OpenPaye MCP Server

Serveur MCP (Model Context Protocol) pour l'API OpenPaye, avec la meme stack TypeScript/Node et une architecture modulaire proche du serveur BoondManager.

## Stack

- Node.js >= 20
- TypeScript strict
- `@modelcontextprotocol/sdk`
- Zod
- Pino
- Vitest + ESLint

## Installation

```bash
npm install
npm run build
```

## Configuration

L’API OpenPaye utilise une authentification **Basic Auth** avec un **identifiant** et une **clé API** (pas nécessairement le même couple que la connexion web). Où les trouver : depuis la liste des dossiers de paie, menu **Paramètres → Accès API**. Voir la documentation officielle : [Accès API](https://www.openpaye.co/docs/acces-api).

### Claude Desktop / extension `.mcpb`

Lorsque vous installez le bundle MCP (`.mcpb`), Claude peut afficher un formulaire de configuration : renseignez-y les mêmes champs que dans OpenPaye (**identifiant** et **clé API**). Ils sont transmis au serveur sous forme de variables d’environnement `OPENPAYE_API_USER` et `OPENPAYE_API_KEY` (voir `manifest.json`, section `user_config` et `mcp_config.env`).

### Variables d’environnement (ligne de commande ou config MCP manuelle)

Variables requises pour les appels API :

- `OPENPAYE_API_USER` — identifiant API (Basic Auth)
- `OPENPAYE_API_KEY` — clé API (Basic Auth)

Variables optionnelles :

- `OPENPAYE_BASE_URL` (defaut: `https://api.openpaye.co`)
- `OPENPAYE_HTTP_TIMEOUT_MS` (defaut: `30000`)
- `MCP_TRANSPORT` (`stdio` par defaut, `http` pour streamable HTTP)
- `MCP_HTTP_HOST` (defaut: `127.0.0.1`)
- `MCP_HTTP_PORT` (defaut: `3000`)
- `MCP_HTTP_PATH` (defaut: `/mcp`)

## Lancement

```bash
npm start
```

Ou en local:

```bash
npx openpaye-mcp-server
```

## Outils exposes

Le serveur expose un catalogue etendu de tools correspondant aux endpoints OpenPaye documentes:

- Absences (`get`, `periode`, `create`, `update`)
- Bulletins de paie (`liste`, `detail`, `liste par periode`)
- Cotisations (`CaisseCotisations`)
- Contrats (`list`, `get`, `create`, `update`, `delete`, `ContratSortant`)
- Dossiers (`list`, `get`, `create`, `update`, `delete`, `by siret`)
- Etablissements (`list`, `get`, `create`, `update`, `delete`)
- Heures supplementaires, NetEntreprise, Options, Primes (`create` + `update`)
- Salaries (`list`, `get`, `create`, `update`, `delete`)
- DSN, editions, solde tout compte, variables, variables bulletin, compteurs conges, variables reprise dossier

## Prompts MCP

Prompts pre-orchestres exposes:

- `paie_mensuelle`
- `controle_dossier`
- `onboarding_salarie`

## Packaging MCPB

La commande `npm run package:mcpb` enchaine : compilation TypeScript (`tsc`), **bundle** des dependances dans `dist/mcp-main.cjs` (esbuild, requis pour un `.mcpb` autonome sans `node_modules` dans l'archive), puis creation du zip `.mcpb` (voir `manifest.json`, point d'entree `dist/mcp-main.cjs`).

```bash
npm run package:mcpb
```

Le workflow GitHub Actions `release.yml` le build et l'attache automatiquement a chaque tag `v*`.

## Workflow release locale

Pour preparer une release (met a jour versions + build + mcpb):

```bash
npm run release:prepare -- patch
```

Puis:

```bash
git add .
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push && git push --tags
```
