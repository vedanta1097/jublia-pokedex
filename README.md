# Jublia Pokédex

A responsive Pokédex built with Angular 22, Ionic 9, and Capacitor 8. It uses the [PokéAPI](https://pokeapi.co/) REST API and runs as a desktop web app, mobile web app, native iOS app, and native Android app.

## Links

- [Live web app](https://jublia-pokedex.vercel.app/)
- [Figma prototype](https://www.figma.com/design/1wJBQrOft6jKihihCOzPkg/Jublia-Pokedex?node-id=0-1&t=7tiboYoEzItWzmBz-1)
- [Android testing video](https://drive.google.com/file/d/1-tT0m5Hhi2kyr1eZLJ5KuLsgA0zezbJu/view?usp=drive_link)
- [iOS testing video](https://drive.google.com/file/d/1btPpwF_C14L3dP8jtd89mh2qNfHe0Ue2/view?usp=drive_link)

## Features

- Browse Pokémon with infinite scrolling.
- Filter the list by Pokémon type.
- View artwork, measurements, abilities, types, and base stats.
- Add or remove favourites from cards and detail pages.
- Keep favourites between sessions with local storage.
- Recover from failed API and image requests with clear retry and fallback states.
- Use the same responsive interface on web, iOS, and Android.

## Run locally

### Prerequisites

- Node.js 22 and npm. Node.js 22.22.3 is the version used for release validation.
- Git.

### Install and start

```bash
git clone https://github.com/vedanta1097/jublia-pokedex.git
cd jublia-pokedex
npm ci
npm start
```

Open `http://localhost:4200`.

The PokéAPI base URL is public configuration in `src/environments/`; no environment variables or secrets are required.

## Run the native apps

The `ios/` and `android/` projects are already included. Install Xcode with an iOS platform and simulator runtime for iOS development. For Android development, install Android Studio, an Android SDK, and JDK 21.

After installing dependencies, build and synchronize the web application:

```bash
npm run build
npx cap sync
```

Then open the platform you want to run:

```bash
npx cap open ios
npx cap open android
```

Choose a simulator, emulator, or connected device in Xcode or Android Studio and run the app there. Repeat `npm run build` and `npx cap sync` after web-code changes that must be copied into the native projects.

## Verification

```bash
npm run lint
npm test -- --watch=false
npm run build
```

Tests use Vitest, Angular's testing utilities, and controlled API fixtures. They do not call the live PokéAPI.

## Architecture

- `src/app/pokemon/` owns the typed PokéAPI client, DTO mapping, list, cards, and detail page.
- `src/app/favourites/` owns favourite persistence and the dedicated favourites page.
- `src/app/shared/` contains the small set of reusable presentation components.
- Angular signals hold synchronous UI and favourite state; RxJS coordinates HTTP requests and cancellation.
- Routed pages are standalone and lazy-loaded. Ionic supplies cross-platform UI behavior, while Capacitor packages the production build from `www/` for iOS and Android.

## Important trade-offs

- List responses contain references rather than full card data, so detail requests run with a fixed concurrency limit of four. Successful details are cached in memory for the current session.
- Favourite IDs use `localStorage`. The state is small, requires no account, and works in the browser and Capacitor WebView without another persistence dependency.
- The app is client-rendered because the same bundle must run inside Capacitor. Vercel rewrites application routes to `index.html` so direct links such as `/pokemon/25` work.

## Requirement coverage

| Requirement                      | Implementation                                                         |
| -------------------------------- | ---------------------------------------------------------------------- |
| Infinite Pokémon browsing        | Paginated PokéAPI requests with Ionic infinite scroll                  |
| Pokémon details and images       | Lazy-loaded detail route with artwork and fallback states              |
| Favourites and favourites list   | Shared signal store, local persistence, and `/favourites` route        |
| Type filtering                   | Accessible single-select filter with incremental results               |
| Desktop and mobile web           | Responsive layouts deployed on Vercel                                  |
| Native iOS and Android           | Committed Capacitor projects generated from the same Ionic Angular app |
| Documentation and source control | This README, focused tests, and incremental Git history                |
| Optional Figma prototype         | Linked in the Links section above                                      |
