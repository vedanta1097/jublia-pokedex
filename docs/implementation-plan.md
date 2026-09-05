# Jublia Pokédex - Implementation Plan

## 1. Objective

Build a polished but intentionally simple Pokédex for Jublia's front-end take-home assessment. The solution will use one Angular codebase for:

- Desktop web
- Mobile web
- Native iOS
- Native Android

Ionic will provide cross-platform UI primitives and mobile behavior. Capacitor will package the web application for iOS and Android.

The implementation should demonstrate practical Angular knowledge, maintainable code, responsive design, accessibility, source-control discipline, and clear documentation. It should not contain unnecessary abstractions or features added only to make the project appear more complex.

## 2. Assessment Requirements

### Required product features

- Browse all Pokémon using infinite scrolling.
- View detailed information about an individual Pokémon.
- View an image for each Pokémon.
- Add and remove Pokémon from favourites.
- View a dedicated list of favourited Pokémon.
- Filter Pokémon by type, such as Water, Grass, Fire, Ghost, and Flying.

### Required delivery targets

- Responsive desktop web application.
- Responsive mobile web application.
- Native iOS application using Ionic and Capacitor.
- Native Android application using Ionic and Capacitor.
- Source code uploaded to a source-control platform.
- Either:
  - documented instructions for running the application locally; or
  - an accessible cloud deployment.

The project will provide both local setup documentation and a web deployment if time permits.

### Assessment quality criteria

- Code quality and maintainability.
- Sensible application design and abstraction boundaries.
- Source-control familiarity.
- A reliably runnable application.
- Clear application documentation.

### Optional scoring item

- A Figma mock-up or prototype, at least low fidelity.

The Figma design will be created manually and will be treated as a supporting design artifact, not as a blocker for implementation.

## 3. Agreed Technical Decisions

### Core stack

- Angular 22 using standalone components.
- TypeScript 6 with strict compiler and strict template checking.
- Ionic Angular 9 for cross-platform UI primitives.
- Capacitor 8 for iOS and Android packaging.
- RxJS for HTTP workflows, pagination, cancellation, and error recovery.
- Angular signals for local synchronous UI state and derived state.
- SCSS for application styling.
- Vitest through Angular's unit-test builder.
- Angular ESLint for static analysis.
- npm for dependency and lockfile management.

### Deliberate exclusions

- No Angular Material: Ionic already supplies the cross-platform component layer required by the assessment.
- No Tailwind, Bootstrap, or additional CSS framework: the visual design is small enough for component SCSS and Ionic theme tokens.
- No NgRx: the application state is small and can be expressed clearly with signals and focused state services.
- No custom SVG artwork generated for the project. Use the supplied raster assets and API-provided Pokémon artwork.
- No backend or authentication: neither is required by the assessment.
- No SSR: this is a client-side application that must also run inside Capacitor.
- No speculative features such as teams, accounts, battles, or offline synchronization.

### API choice

Use the REST version of [PokéAPI](https://pokeapi.co/).

Primary endpoints:

- `GET /api/v2/pokemon?limit={limit}&offset={offset}` for the main list.
- `GET /api/v2/pokemon/{id-or-name}` for card and detail data.
- `GET /api/v2/type` for available filters.
- `GET /api/v2/type/{type}` for Pokémon belonging to a selected type.

REST is preferred because it is the canonical PokéAPI interface, is sufficient for every assessment requirement, and gives us a useful opportunity to demonstrate typed Angular HTTP and RxJS data orchestration.

## 4. Existing Project Baseline

The repository is already configured with:

- Angular `22.0.1`.
- Ionic Angular `9.0.x`.
- Capacitor `8.5.x`.
- Standalone application bootstrap.
- Lazy-loaded Angular routing.
- Strict TypeScript and Angular template checks.
- ESLint.
- Vitest.
- Production output in `www/`, ready for Capacitor synchronization.

Available supplied assets:

- `src/assets/icon/favicon.ico`
- `src/assets/pokeball.png`
- `src/assets/pokemon-error.png`
- `src/assets/pokemon-logo.png`

Current native application identity:

- App name: `Jublia Pokédex`
- Capacitor app ID: `com.vedanta.jubliapokedex`

## 5. Product Scope and User Flows

### Pokémon browsing

1. The user opens the application and sees an initial loading state.
2. The first batch of Pokémon cards is loaded.
3. Reaching the end of the list loads the next batch without replacing existing results.
4. While the next batch is loading, duplicate requests are prevented.
5. Infinite scrolling stops when no additional results are available.
6. Selecting a card navigates to its detail page.

### Type filtering

1. The user opens the type filter.
2. The user selects one Pokémon type.
3. Existing list and pagination state are reset.
4. Pokémon belonging to that type are displayed in incremental batches.
5. Clearing the filter returns to the complete paginated list.

The first version will support one active type at a time. Multi-type intersection behavior is outside the assessment scope and would add ambiguity without meaningful scoring value.

### Pokémon details

The detail page will show useful information already supplied by PokéAPI:

- Official artwork or the best available fallback sprite.
- Pokédex number.
- Name.
- Type badges.
- Height.
- Weight.
- Abilities.
- Base statistics.
- Favourite state and an add/remove favourite action.

### Favourites

1. A Pokémon can be favourited or unfavourited from its card and detail page.
2. Favourite IDs are persisted locally so they survive reloads and native app restarts.
3. A dedicated favourites page displays the current collection.
4. Removing an item updates every visible favourite control immediately.
5. An intentional empty state displays the supplied `pokemon-error.png`, a clear message, and a route back to Pokémon browsing when there are no favourites.

`localStorage` is sufficient for this assessment. Capacitor Preferences can be considered only if native testing reveals a concrete storage issue.

## 6. Screens and Responsive Behavior

### Shared application shell

- Application branding using the supplied Pokémon logo where appropriate.
- Navigation between the Pokédex and Favourites views.
- Safe-area-aware spacing on iOS.
- Keyboard and screen-reader accessible navigation.

### Pokémon list page

- Page heading and short context.
- Type filter control.
- Responsive card grid.
- Initial loading skeletons.
- Incremental loading indicator.
- Recoverable error state using `pokemon-error.png`, an action-specific message, and a retry action.
- Empty state using `pokemon-error.png` when a filter has no results, with an action to clear the filter.
- Infinite scroll trigger.

### Pokémon detail page

- Back navigation that works on web and native shells.
- Hero artwork.
- Name, number, and types.
- Core measurements and abilities.
- Readable base-stat presentation.
- Favourite action.
- Loading, not-found, and API error states. Not-found and error states use `pokemon-error.png` with context-appropriate copy and recovery actions.

### Favourites page

- Responsive list or card grid consistent with the main Pokédex.
- Empty state using `pokemon-error.png`, a clear message, and an action that returns to Pokémon browsing.
- Navigation back to browsing.

### Responsive layout targets

- Mobile: single-column content, touch-friendly controls, and compact navigation.
- Tablet: two- or three-column card layout when space permits.
- Desktop: bounded content width and a multi-column card grid without stretching cards excessively.

Breakpoints should follow actual layout needs rather than device brand names. The same semantic markup and components will serve all web sizes and native builds.

## 7. Visual and Accessibility Direction

### Visual direction

- Keep the design simple, human, and consistent with the manually produced Figma mock-up.
- Avoid the harsh red `#DC2626` when paired with black text.
- Use a softer warm accent for pale surfaces that contain dark text.
- Use strong red only when its foreground colour has verified contrast.
- Use whitespace, borders, and subtle elevation instead of excessive gradients or decorative effects.
- Do not introduce generated illustrations when supplied assets or API artwork are available.

### Pokémon type badges

- Badge text should be white.
- Each type background must be dark enough to maintain at least a `4.5:1` contrast ratio for small text.
- Do not assume white text is accessible on the default bright Pokémon type colours; adjust each background token individually.
- Type colour must not be the only source of information: every badge includes its textual type name.

### Accessibility acceptance criteria

- Meet WCAG 2.2 AA contrast requirements for text and controls.
- Provide meaningful alternative text for Pokémon artwork.
- Mark decorative images appropriately so screen readers can ignore them.
- Use semantic headings in a logical order.
- Provide visible keyboard focus states.
- Ensure every interactive element works with a keyboard.
- Use real buttons and links instead of clickable generic containers.
- Provide accessible names for icon-only controls.
- Ensure touch targets are comfortably sized.
- Announce important loading or error changes where appropriate.
- Respect `prefers-reduced-motion` for non-essential animation.

## 8. Angular Architecture

Follow the current [Angular coding style guide](https://angular.dev/style-guide): group code by feature area, colocate related files and tests, use hyphenated filenames, keep one primary concept per file, prefer `inject()` for dependency injection, and keep components focused on presentation.

Proposed feature-oriented structure:

```text
src/app/
├── app.component.html
├── app.component.spec.ts
├── app.component.ts
├── app.routes.ts
├── pokemon/
│   ├── pokemon-api.ts
│   ├── pokemon-api.spec.ts
│   ├── pokemon.models.ts
│   ├── pokemon-mappers.ts
│   ├── pokemon-card/
│   │   ├── pokemon-card.html
│   │   ├── pokemon-card.scss
│   │   ├── pokemon-card.spec.ts
│   │   └── pokemon-card.ts
│   ├── pokemon-detail/
│   │   ├── pokemon-detail.page.html
│   │   ├── pokemon-detail.page.scss
│   │   ├── pokemon-detail.page.spec.ts
│   │   └── pokemon-detail.page.ts
│   ├── pokemon-list/
│   │   ├── pokemon-list.page.html
│   │   ├── pokemon-list.page.scss
│   │   ├── pokemon-list.page.spec.ts
│   │   └── pokemon-list.page.ts
│   └── type-filter/
│       ├── type-filter.html
│       ├── type-filter.scss
│       ├── type-filter.spec.ts
│       └── type-filter.ts
├── favourites/
│   ├── favourites-store.ts
│   ├── favourites-store.spec.ts
│   └── favourite-list/
│       ├── favourite-list.page.html
│       ├── favourite-list.page.scss
│       ├── favourite-list.page.spec.ts
│       └── favourite-list.page.ts
└── shared/
    ├── app-error/
    ├── empty-state/
    └── loading-card/
```

The exact structure may evolve when implementation exposes a clearer boundary. Avoid generic `components/`, `services/`, and `utils/` buckets.

### Routing

Planned routes:

```text
/pokemon          Pokémon list
/pokemon/:id      Pokémon detail
/favourites       Favourite Pokémon
/**               Redirect or friendly not-found handling
```

All routed pages should be lazy-loaded.

### Component boundaries

- Routed pages coordinate data and page-level UI state.
- Presentational components receive data through signal inputs and communicate actions through outputs.
- API mapping and transformations remain outside templates.
- Template-only members should be `protected` where practical.
- Angular-created properties such as inputs, outputs, and queries should be `readonly`.
- Prefer native class and style bindings over `ngClass` and `ngStyle`.
- Lifecycle hooks should be used only when their timing is genuinely required and should remain small.

### State boundaries

- Use RxJS for HTTP requests and event streams where cancellation, concurrency, or error recovery matters.
- Use signals for page state, selected filters, favourites, loading flags, and computed UI values.
- Keep API DTOs separate from UI-facing models.
- Keep the favourites state in one root-provided store because it is application-wide state.
- Do not subscribe manually when the `async` pipe, signal interop, or a bounded effect provides clearer ownership.

## 9. Data Strategy

PokéAPI's list endpoint returns names and URLs but not all card metadata. Card enrichment must therefore be controlled carefully.

### Main list

- Request Pokémon references in fixed-size pages using `limit` and `offset`.
- Extract IDs from resource URLs.
- Fetch required Pokémon details with bounded concurrency rather than firing an unlimited number of requests.
- Map external responses into a small internal card model.
- Cache already fetched Pokémon details in memory to avoid duplicate requests during navigation and filtering.
- Preserve the server's ordering.

### Filtered list

The type endpoint returns a complete set of Pokémon references rather than an offset-based page. The application will:

1. Fetch references for the selected type once.
2. Keep the references in memory for the current filter.
3. Slice them into UI-sized batches.
4. Enrich only the visible batch.

This preserves infinite-scroll behavior without loading details for the full filtered result up front.

### Images

Use this fallback order:

1. Official artwork.
2. Home artwork or default sprite when available.
3. Supplied `pokemon-error.png` when no API image is available or image loading fails.

The supplied `pokemon-error.png` is also the shared illustration for page-level and action-level failures, not-found results, filtered lists with no matches, and empty collections such as an empty favourites list. The accompanying text and action must distinguish an actual error from a valid empty result.

The supplied `pokeball.png` may be used for a restrained loading treatment. The supplied `pokemon-logo.png` may be used for application branding.

### Error handling

- Convert raw HTTP errors into user-meaningful states.
- Do not silently replace an initial API failure with an empty list.
- Display `pokemon-error.png` when loading the Pokémon list fails or when any user action that depends on the API fails.
- Display `pokemon-error.png` for valid empty states, including an empty favourites list and a type filter with no matching Pokémon.
- Pair the shared illustration with context-specific headings, descriptions, and actions: errors offer retry, while empty states offer navigation or filter clearing.
- Preserve already loaded content if loading a later page fails.
- Provide an explicit retry action.
- Distinguish loading, empty, error, and success states.
- Prevent rapid retries or duplicate infinite-scroll requests.

## 10. Implementation Phases and Commit Plan

Each phase should remain small enough to review and commit independently.

### Phase 0 - Foundation

- [x] Scaffold standalone Ionic Angular application.
- [x] Confirm Angular 22, Ionic, and Capacitor versions.
- [x] Enable strict compilation, linting, and unit testing.
- [x] Add and verify supplied assets and favicon.
- [x] Remove unused starter assets and stale browser configuration.
- [x] Confirm lint, tests, and production build pass.

Existing commit:

```text
chore: configure project foundation and assets
```

### Phase 1 - Domain and API foundation

- [x] Add environment-based PokéAPI base URL.
- [x] Define external API DTOs and internal Pokémon models.
- [x] Implement and unit-test response mapping.
- [x] Implement typed API requests for Pokémon, details, and types.
- [x] Add bounded request concurrency and in-memory detail caching.

Suggested commits:

```text
feat: add pokemon domain models and mappers
feat: add typed pokeapi data access
```

### Phase 2 - Application shell and theme

- [x] Replace the Ionic starter screen.
- [x] Define colour, typography, spacing, radius, and elevation tokens.
- [x] Define accessible Pokémon type colours.
- [x] Build responsive application navigation.
- [x] Add routes for list, detail, and favourites.

Suggested commit:

```text
feat: add responsive app shell and theme
```

### Phase 3 - Pokémon browsing

- [x] Build the reusable Pokémon card.
- [x] Build the responsive list grid.
- [x] Load the initial page.
- [x] Add infinite scrolling and pagination guards.
- [x] Add initial and incremental loading states.
- [x] Add retryable error state using `pokemon-error.png`.
- [x] Add relevant component and data-flow tests.

Suggested commits:

```text
feat: add pokemon card component
feat: add paginated pokemon browsing
feat: add infinite scrolling states
```

### Phase 4 - Type filtering

- [x] Load supported Pokémon types.
- [x] Build an accessible single-select type filter.
- [x] Reset list state when selection changes.
- [x] Incrementally render filtered results.
- [x] Add filtered empty and error states using `pokemon-error.png` and different recovery actions.
- [x] Test selection, clearing, reset, and pagination behavior.

Suggested commit:

```text
feat: add pokemon type filtering
```

### Phase 5 - Pokémon details

- [x] Add lazy-loaded detail route.
- [x] Build detail loading, success, error, and not-found states.
- [x] Present artwork, measurements, abilities, and base stats.
- [x] Add resilient image fallback.
- [x] Test route-input and view-state behavior.

Suggested commit:

```text
feat: add pokemon detail page
```

### Phase 6 - Favourites

- [ ] Implement favourites store using signals.
- [ ] Persist favourite IDs locally.
- [ ] Add favourite controls to cards and details.
- [ ] Build the favourites page and its `pokemon-error.png` empty state.
- [ ] Keep favourite state synchronized across routes.
- [ ] Test persistence and add/remove behavior.

Suggested commits:

```text
feat: add persistent pokemon favourites
feat: add favourites page
```

### Phase 7 - Responsive and accessibility pass

- [ ] Compare implementation against the manual Figma mock-up.
- [ ] Verify mobile, tablet, and desktop layouts.
- [ ] Test keyboard navigation and visible focus.
- [ ] Audit labels, alternative text, heading order, and semantics.
- [ ] Verify text and control contrast, especially every type badge.
- [ ] Verify loading and error announcements.
- [ ] Check reduced-motion behavior.
- [ ] Test at browser zoom up to 200%.

Suggested commit:

```text
fix: improve responsive layout and accessibility
```

### Phase 8 - Native platforms

- [ ] Install matching `@capacitor/ios` and `@capacitor/android` packages.
- [ ] Add the iOS and Android platform projects.
- [ ] Build the Angular application and run `npx cap sync`.
- [ ] Verify safe areas, status bar, keyboard behavior, navigation, and persistence.
- [ ] Test at least one iOS simulator and one Android emulator if the local toolchains are available.
- [ ] Document any platform limitation that cannot be verified locally.

Expected commands:

```bash
npm install @capacitor/ios@8 @capacitor/android@8
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios
npx cap open android
```

Suggested commits:

```text
chore: add capacitor native platforms
fix: polish native platform behavior
```

### Phase 9 - Documentation and release validation

- [ ] Write a concise README with prerequisites and exact commands.
- [ ] Explain architecture and important trade-offs.
- [ ] Document web and native run instructions.
- [ ] Add the Figma prototype link when available.
- [ ] Add deployment URL when available.
- [ ] Run the complete verification suite from a clean install.
- [ ] Verify the repository contains no secrets, generated caches, or machine-specific files.

Suggested commits:

```text
docs: add setup and architecture documentation
chore: prepare take-home submission
```

## 11. Testing Strategy

### Unit tests

Prioritize logic with meaningful failure modes:

- API response mapping.
- ID extraction and image fallback selection.
- Pagination accumulation and reset behavior.
- Type-filter pagination.
- Favourite persistence and derived state.
- Error-to-view-state mapping.

### Component tests

- Pokémon card renders accessible content and emits user actions.
- Type filter exposes and changes selection correctly.
- List page distinguishes loading, error, empty, and populated states.
- Detail page renders API data and image fallback.
- Favourites page reacts to store updates and renders the correct illustrated empty state.
- Shared error and empty-state UI renders `pokemon-error.png` while exposing context-specific copy and actions.

### Manual verification matrix

- Current Chrome and Safari desktop browsers.
- Narrow mobile viewport in browser developer tools.
- Keyboard-only navigation.
- Slow network and offline simulation.
- Initial request failure and later-page failure.
- Empty favourites.
- Broken Pokémon image.
- iOS simulator, if available.
- Android emulator, if available.

Avoid tests that merely repeat framework behavior or assert implementation details without protecting user-visible behavior.

## 12. Definition of Done

The application is ready to submit when:

- Every required assessment feature works.
- Infinite scrolling does not duplicate records or requests.
- Filtering resets and paginates predictably.
- Pokémon details and images have loading and failure handling.
- Favourites persist across reloads.
- Desktop and mobile web layouts are usable and visually consistent.
- iOS and Android projects can be built from the same Angular source.
- Keyboard interaction, semantics, focus, and colour contrast pass the accessibility review.
- `npm run lint` passes.
- `npm test -- --watch=false` passes.
- `npm run build` passes.
- Capacitor synchronization succeeds after the web build.
- README instructions work from a fresh clone.
- The repository is pushed to source control.
- The Figma link and deployed URL are included if available.

## 13. Final Submission Checklist

- [ ] Confirm the repository is accessible to the reviewers.
- [ ] Confirm the latest commit is pushed.
- [ ] Include repository URL.
- [ ] Include live web URL, if deployed.
- [ ] Include Figma URL.
- [ ] Include local setup instructions in README.
- [ ] State which native platforms and simulators were verified.
- [ ] Mention only genuine limitations or incomplete work.
- [ ] Reply to all recipients on the original assessment email.
- [ ] Reconfirm the deadline with HR if necessary: the email states "Monday, 7 August 2026, before 11:59 PM Indonesian Time," but 7 August 2026 falls on a Friday.

## 14. Working Principles

- Prefer small, reviewable commits with one clear purpose.
- Keep the application runnable after every feature commit.
- Do not hide errors behind empty states.
- Do not add abstractions before a concrete second use appears.
- Keep business and data logic outside templates.
- Treat accessibility and responsive behavior as acceptance criteria, not final cosmetic work.
- Use supplied assets intentionally and avoid generated visual filler.
- Record important deviations from this plan in the README or commit history.
