import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, InjectionToken, Service } from '@angular/core';
import { catchError, from, map, mergeMap, Observable, of, shareReplay, tap, throwError, toArray } from 'rxjs';
import { environment } from '../../environments/environment';
import { NamedApiResourceListDto, PokemonDto, PokemonTypeDto } from './pokemon-api.models';
import { mapPokemon, mapPokemonByType, mapPokemonReferencePage, mapPokemonTypes } from './pokemon-mappers';
import { Pokemon, PokemonReference, PokemonReferencePage, PokemonTypeReference } from './pokemon.models';

export const POKE_API_BASE_URL = new InjectionToken<string>('POKE_API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.pokeApiBaseUrl,
});

export const DEFAULT_DETAIL_CONCURRENCY = 4;

@Service()
export class PokemonApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(POKE_API_BASE_URL).replace(/\/$/, '');
  private readonly detailCache = new Map<string, Observable<Pokemon>>();

  listPokemon(limit: number, offset: number): Observable<PokemonReferencePage> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http
      .get<NamedApiResourceListDto>(`${this.baseUrl}/pokemon`, { params })
      .pipe(map((response) => mapPokemonReferencePage(response, limit, offset)));
  }

  getPokemon(identifier: number | string): Observable<Pokemon> {
    const cacheKey = String(identifier).trim().toLowerCase();
    const cached = this.detailCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const request = this.http
      .get<PokemonDto>(`${this.baseUrl}/pokemon/${encodeURIComponent(cacheKey)}`)
      .pipe(
        map(mapPokemon),
        tap((pokemon) => {
          this.detailCache.set(String(pokemon.id), request);
          this.detailCache.set(pokemon.name.toLowerCase(), request);
        }),
        catchError((error: unknown) => {
          if (this.detailCache.get(cacheKey) === request) {
            this.detailCache.delete(cacheKey);
          }
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.detailCache.set(cacheKey, request);
    return request;
  }

  getPokemonBatch(
    references: readonly PokemonReference[],
    concurrency = DEFAULT_DETAIL_CONCURRENCY,
  ): Observable<Pokemon[]> {
    if (references.length === 0) {
      return of([]);
    }

    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error('Detail request concurrency must be a positive integer.');
    }

    return from(references.map((reference, index) => ({ reference, index }))).pipe(
      mergeMap(
        ({ reference, index }) => this.getPokemon(reference.id).pipe(
          map((pokemon) => ({ index, pokemon })),
        ),
        concurrency,
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
    const normalizedType = type.trim().toLowerCase();
    return this.http
      .get<PokemonTypeDto>(`${this.baseUrl}/type/${encodeURIComponent(normalizedType)}`)
      .pipe(map(mapPokemonByType));
  }
}
