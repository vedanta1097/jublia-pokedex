import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pokemon/:id',
    loadComponent: () => import('./pokemon/pokemon-detail/pokemon-detail.page')
      .then((module) => module.PokemonDetailPage),
  },
  {
    path: 'pokemon',
    loadComponent: () => import('./pokemon/pokemon-list/pokemon-list.page')
      .then((module) => module.PokemonListPage),
  },
  {
    path: 'favourites',
    loadComponent: () => import('./favourites/favourite-list/favourite-list.page')
      .then((module) => module.FavouriteListPage),
  },
  {
    path: '',
    redirectTo: 'pokemon',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'pokemon',
  },
];
