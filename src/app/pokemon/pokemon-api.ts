import { HttpClient } from '@angular/common/http';
import { inject, InjectionToken, Service } from '@angular/core';
import { from, map, mergeMap, Observable, of, tap, toArray } from 'rxjs';
import { environment } from '../../environments/environment';
import { NamedApiResourceListDto, PokemonDto, PokemonTypeDto } from './pokemon-api.models';
import { mapPokemon, mapPokemonByType, mapPokemonReferencePage, mapPokemonTypes } from './pokemon-mappers';
import { Pokemon, PokemonReference, PokemonReferencePage, PokemonTypeReference } from './pokemon.models';

export const POKE_API_BASE_URL = new InjectionToken<string>('POKE_API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.pokeApiBaseUrl,
});

const DETAIL_REQUEST_CONCURRENCY = 4;

@Service()
export class PokemonApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(POKE_API_BASE_URL);
  private readonly detailCache = new Map<string, Pokemon>();

  listPokemon(limit: number, offset: number): Observable<PokemonReferencePage> {
    return this.http
      .get<NamedApiResourceListDto>(`${this.baseUrl}/pokemon`, {
        params: { limit, offset },
      })
      .pipe(map((response) => mapPokemonReferencePage(response, limit, offset)));
  }

  getPokemon(identifier: number | string): Observable<Pokemon> {
    const key = String(identifier).toLowerCase();
    const cached = this.detailCache.get(key);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<PokemonDto>(`${this.baseUrl}/pokemon/${encodeURIComponent(key)}`)
      .pipe(
        map(mapPokemon),
        tap((pokemon) => {
          this.detailCache.set(String(pokemon.id), pokemon);
          this.detailCache.set(pokemon.name, pokemon);
        }),
      );
  }

  getPokemonBatch(references: readonly PokemonReference[]): Observable<Pokemon[]> {
    return from(references).pipe(
      mergeMap(
        (reference, index) => this.getPokemon(reference.id).pipe(
          map((pokemon) => ({ index, pokemon })),
        ),
        DETAIL_REQUEST_CONCURRENCY,
      ),
      toArray(),
      map((results) => results
        .sort((left, right) => left.index - right.index)
        .map(({ pokemon }) => pokemon)),
    );
  }

  listTypes(): Observable<PokemonTypeReference[]> {
    return this.http
      .get<NamedApiResourceListDto>(`${this.baseUrl}/type`)
      .pipe(map(mapPokemonTypes));
  }

  listPokemonByType(type: string): Observable<PokemonReference[]> {
    return this.http
      .get<PokemonTypeDto>(`${this.baseUrl}/type/${encodeURIComponent(type)}`)
      .pipe(map(mapPokemonByType));
  }
}
