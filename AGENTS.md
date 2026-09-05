# Jublia Pokédex Agent Instructions

## Sources of truth

- Treat `docs/Jublia AI - Front End Take Home Test.pdf` as the authoritative product brief.
- Read `docs/implementation-plan.md` before starting implementation work and continue from the next incomplete phase.
- If the plan conflicts with the take-home brief, follow the brief and update the plan to match.
- Use the implementation plan for routine phase work. Reopen the PDF only when a requirement is unclear, missing from the plan, or conflicts with it.

## Project scope

- Build one maintainable Pokédex for desktop web, mobile web, native iOS, and native Android.
- Use Angular, Ionic, and Capacitor as specified in the implementation plan.
- Keep the solution intentionally simple. Do not add speculative features or abstractions without a concrete need.
- Prefer code that is easy to understand and explain. Choose direct, descriptive state and control flow over clever or highly generalized solutions.
- Do not store the same UI concept in multiple state variables. Add a separate state or abstraction only when it represents meaningfully different behavior.
- Keep only complexity required by current product behavior. Do not add configurability, validation, caching strategies, or concurrency handling for scenarios the application does not actually have.
- Prefer fixed constants and successful-value caches when they satisfy the current use case. Use more advanced patterns, such as caching Observables or deduplicating simultaneous requests, only when the application has that concrete requirement.
- Trust typed API contracts where appropriate. Add defensive parsing or normalization only for realistic input or failure cases at the application boundary.
- Preserve user-provided assets and documents unless the user explicitly asks to change or remove them.

## Angular conventions

- This project uses Angular 22. Verify Angular-specific recommendations against the installed version and current Angular 22 documentation instead of relying on older Angular conventions.
- Prefer Angular 22's `@Service()` for automatically provided application services.
- Use `@Service({ autoProvided: false })` when a service should be registered manually.
- Do not replace `@Service()` with `@Injectable({ providedIn: 'root' })` without a concrete technical reason.
- Prefer `inject()` for dependency injection.
- Use standalone components and lazy-loaded routed pages.
- Treat the current [Angular coding style guide](https://angular.dev/style-guide) as authoritative. If a recommendation conflicts with an established convention in an existing file, preserve consistency within that file.
- Use hyphenated file names that match their primary TypeScript identifier. Give component TypeScript, template, style, and test files the same base name.
- Colocate tests with the code under test. Organize directories by feature rather than code type; avoid generic `components`, `services`, and `utils` directories.
- Prefer one primary concept per file and split files when they become difficult to navigate.
- Group Angular-specific properties, including injected dependencies, inputs, outputs, and queries, near the top of component and directive classes.
- Keep components and directives focused on presentation. Move independent transformations and business logic into focused functions or services.
- Keep template expressions straightforward; move complex derived logic into TypeScript, typically with `computed()`.
- Mark template-only class members as `protected` where practical. Mark signal inputs, models, outputs, and queries as `readonly`.
- Prefer native `class` and `style` bindings over `ngClass` and `ngStyle`.
- Name event handlers for the action they perform rather than the event that triggered them.
- Keep lifecycle hooks small and implement the corresponding lifecycle interface whenever a hook is used.
- Use RxJS for HTTP workflows and asynchronous coordination; use signals for synchronous UI state and derived state.
- Keep external API DTOs separate from internal UI-facing models.

## Testing conventions

- Use Angular's `@angular/build:unit-test` builder with Vitest and jsdom.
- Import test APIs such as `describe`, `it`, `expect`, `beforeEach`, and `afterEach` explicitly from `vitest`.
- Follow the current Angular testing and HTTP testing guides.
- Unit tests must not call the live PokéAPI. Use `provideHttpClientTesting()` and `HttpTestingController` with controlled fixtures.
- Put `provideHttpClient()` before `provideHttpClientTesting()` when both are required.
- Call `HttpTestingController.verify()` after HTTP tests to detect unexpected requests.
- Test observable behavior and meaningful failure modes rather than private implementation details or framework behavior.
- Keep pure logic tests free of `TestBed` when Angular dependency injection is not required.

## Verification

- Use a Node.js version supported by the installed Angular version.
- Before considering an implementation phase complete, run lint, the non-watch test suite, and a production build.
- Keep `docs/implementation-plan.md` phase checkboxes synchronized with completed and verified work.
- Do not create commits or push changes unless the user asks.
