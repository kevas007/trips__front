# AGENTS-frontend.md — TripShare (React Native + Expo)

> Guide de contribution pour le dépôt **TripShare (frontend mobile)**. À lire avant toute contribution.

---

## 1) Objectifs
- Uniformiser les pratiques RN (Expo, TS).
- Sécuriser l’app (tokens, stockage sécurisé, supply-chain).
- Maintenir des performances élevées et un bundle propre.
- Documenter clairement et tester systématiquement.

---

## 2) Structure recommandée
```
TripShare/
├─ app/                 # Expo Router (routes, layouts)
├─ src/
│  ├─ features/         # Domaines (feed, itinéraires, budget…)
│  ├─ components/       # UI réutilisable
│  ├─ services/         # apiClient, notifications, storage
│  ├─ store/            # Zustand (slices par domaine)
│  ├─ hooks/            # Hooks génériques
│  ├─ lib/              # utils purs (date, format, etc.)
│  ├─ assets/           # images, fonts
│  └─ i18n/             # traductions
├─ tests/               # Jest + RN Testing Library
├─ package.json
└─ README.md
```

**Conventions**
- Dossiers en *kebab-case*, composants en **PascalCase**.
- TypeScript **strict** (`noImplicitAny`, `strictNullChecks`).
- Imports absolus (tsconfig paths) si utile.

---

## 3) Développement
- Démarrer: `pnpm install` puis `pnpm expo start`.
- EAS builds: `eas build --platform android|ios` (profiles dans `eas.json`).
- Variables: `.env.local` (jamais commité), via `expo-constants`/`react-native-dotenv` si besoin.
- Lint: `pnpm lint` (ESLint + Prettier).
- Tests: `pnpm test` (Jest + RN Testing Library).

---

## 4) Bonnes pratiques RN
### Architecture & état
- **Feature-first** (`src/features/<domain>`). Éviter god-modules.
- **Zustand** par **slices**; logique réseau **pas** dans le store.
- **React Query** (ou SWR) pour cache HTTP; invalider sur mutations.

### UI, accessibilité, i18n
- Design system (tokens: couleurs, typo, spacing). Composants **presentational** vs **container**.
- Accessibilité: labels, roles, focus order, contrastes (tests RTL).
- i18n: `i18next`, clés stables, pas de concat dynamiques.

### Performance
- Mémoïsation ciblée (`memo`, `useMemo`, `useCallback`).
- **FlatList/SectionList**: pagination, `getItemLayout`, `removeClippedSubviews`.
- Images: tailles adaptées, CDN/transform via MinIO + presigned URLs.
- **Hermes** activé; minify + Proguard en prod.
- `babel-plugin-transform-remove-console` en prod.

### Sécurité app
- **Aucun secret** dans le binaire. Toute clé → backend.
- Tokens: Access court + Refresh en **SecureStore/Keychain**; purge au logout.
- Optionnel: **TLS pinning** (bibliothèque dédiée).
- Validation et sanitization basiques côté client (UX) + fondamentales côté API.

---

## 5) Qualité & CI
- ESLint (react, react-native, import, unused-imports) + Prettier.
- Tests d’interaction > snapshots. Couvrir flows critiques (auth, création itinéraire).
- CI: lint + tests sur PR + build EAS preview si tag/branche `beta`.
- Analyse deps: `npx depcheck` + `ts-prune` en CI (warning → PR bloque si non justifié).

---

## 6) Observabilité légère
- Logger applicatif (niveau DEBUG en dev, WARN/ERROR en prod).
- Capture erreurs (Sentry ou similaire) sans PII.
- Feature flags pour activer/désactiver modules expérimentaux.

---

## 7) Hygiène & suppression
- Nettoyer components non utilisés, assets orphelins.
- Mutualiser utilitaires dupliqués dans `src/lib`.
- Revue des tailles d’images et de polices.
- Garder `pnpm-lock.yaml` à jour.

---

## 8) Sécurité supply‑chain
- Verrouillage des versions (semver ^ limité quand nécessaire).
- `npm audit` (niveau high) et exclusion justifiée en PR si besoin.
- Signer les commits si possible (GPG).

---

## 9) Checklists
**PR**
- [ ] Lint OK, tests verts
- [ ] No unused exports (`ts-prune`)
- [ ] Screenshots/vidéo si UI
- [ ] Docs/README mis à jour si impact

---
## 10) import
- anlayse tout les imports pour voir si ils sont corrects

--- 

## 11) Docs
- met tous les docs dans un dossier ./doc et reorginse le contenu

---
## 12) script
- met tous les scripts dans un dossier ./script

**Onboarding**
1. Cloner le repo frontend.
2. Créer `.env.local` (URL API, S3 endpoint si besoin).
3. `pnpm install && pnpm expo start`.
4. Lancer `pnpm test` et vérifier l’auth avec l’API locale.
