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

## API OpenPaye

Ce serveur cible la **documentation API V2** d’OpenPaye : [openpaye.redoc.ly](https://openpaye.redoc.ly/).

Les requêtes partent de `https://api.openpaye.co` **sans préfixe `/v2`** dans les chemins (`/dossiers`, `/bulletinspaies`, etc.). Il n’existe pas de base URL séparée du type `api.openpaye.co/v2` — le « V2 » désigne le portail de documentation actuel.

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

- Absences (`get`, `periode`, `create`, `update`, `saisir_absence`)
- Bulletins de paie (`liste`, `calculer`, `generer`, `detail`, `liste par periode`)
- Cotisations (`CaisseCotisations`)
- Contrats (`list`, `get`, `create`, `update`, `delete`, `ContratSortant`)
- Dossiers (`list`, `get`, `create`, `update`, `delete`, `by siret`)
- Etablissements (`list`, `get`, `create`, `update`, `delete`)
- **Elements variables** : saisie absences, primes, heures sup, options, reprise, Net-Entreprises (`variables_saisir_*` + `create`/`update`)
- **Periode de paie** : `openpaye_periode_ouvrir` (verifier/preparer un mois — pas de POST dedie)
- Heures supplementaires, NetEntreprise, Options, Primes (`create` + `update`)
- Salaries (`list`, `get`, `create`, `update`, `delete`)
- DSN, editions, solde tout compte, variables, variables bulletin, compteurs conges, variables reprise dossier

## Prompts MCP

Prompts pre-orchestres exposes:

- `paie_mensuelle`
- `ouvrir_periode_paie`
- `saisie_variables_paie`
- `calculer_bulletin`
- `controle_dossier`
- `onboarding_salarie`

## Packaging MCPB

La commande `npm run package:mcpb` enchaine : compilation TypeScript (`tsc`), **bundle** des dependances dans `dist/mcp-main.cjs` (esbuild, requis pour un `.mcpb` autonome sans `node_modules` dans l'archive), puis creation du zip `.mcpb` (voir `manifest.json`, point d'entree `dist/mcp-main.cjs`).

```bash
npm run package:mcpb
```

### Declencher la release sur GitHub

Le workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) ne part **pas** sur un simple `git push` de branche. Il s'execute uniquement si :

1. Tu pousses un **tag** dont le nom commence par `v` (ex. `v0.1.0`) — y compris un tag cree par le workflow [autotag.yml](.github/workflows/autotag.yml) sur push `main`, **ou**
2. Tu lances l'action a la main : onglet **Actions** du depot → workflow **Release** → **Run workflow** (`workflow_dispatch`).

Sans tag, le build release / piece jointe `.mcpb` ne sera pas cree par la CI.

### Auto-tag sur push `main` (GitHub Actions)

Le workflow [`.github/workflows/autotag.yml`](.github/workflows/autotag.yml) peut **creer et pousser un tag** a chaque push sur `main` (sauf message de commit contenant `[skip autotag]`).

- **Comportement par defaut** (`AUTOTAG_STRATEGY` non definie ou `package`) : tag = `v` + `version` du `package.json`, uniquement si ce tag n’existe pas encore — apres avoir mis a jour la version (ex. `npm run release:prepare -- patch`), commit + push sur `main`.
- **Variable de depot `AUTOTAG_STRATEGY = increment`** : patch successif sur le dernier tag `v*.*.*` (ex. v0.0.1, v0.0.2) ; peut diverger du `package.json` et du manifest dans le `.mcpb`.

Le push du tag declenche ensuite [`.github/workflows/release.yml`](.github/workflows/release.yml) (build `.mcpb` + GitHub Release).

Apres chaque run, ouvre l’onglet **Summary** du workflow : un bloc **Auto tag** indique strategie, tag calcule, et **Skip** / **OK** (les skips sont des succes GitHub Actions — le job est vert meme si aucun tag n’a ete pousse).

Pour versions, changelog et releases entierement pilotes par les messages de commit (`feat:`, `fix:`, etc.), regarder [semantic-release](https://github.com/semantic-release/semantic-release).

## Workflow release locale

Preparer une release (bump semver dans `package.json` / `manifest.json` / `server.json` + `src/constants.ts`, puis build `.mcpb`) :

```bash
npm run release:prepare -- patch
```

Puis commit, **creer le tag**, pousser branche **et** tag :

```bash
git add .
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main && git push origin vX.Y.Z
```

Pour pousser uniquement le tag correspondant a la version actuelle du `package.json` :

```bash
git push origin main && git push origin "v$(npm pkg get version | tr -d '"')"
```
