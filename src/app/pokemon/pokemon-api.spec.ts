import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PokemonDto } from './pokemon-api.models';
import { POKE_API_BASE_URL, PokemonApi } from './pokemon-api';
import { PokemonReference } from './pokemon.models';

const BASE_URL = 'https://example.test/api/v2';

function pokemonDto(id: number): PokemonDto {
  return {
    id,
    name: `pokemon-${id}`,
    height: 10,
    weight: 100,
    abilities: [],
    sprites: { front_default: `${id}.png` },
    stats: [],
    types: [],
  };
}

function reference(id: number): PokemonReference {
  return { id, name: `pokemon-${id}`, displayName: `Pokemon ${id}` };
}

describe('PokemonApi', () => {
  let api: PokemonApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: POKE_API_BASE_URL, useValue: `${BASE_URL}/` },
      ],
    });

    api = TestBed.inject(PokemonApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests a typed page with limit and offset', async () => {
    const result = firstValueFrom(api.listPokemon(20, 40));
    const request = http.expectOne(
      (candidate) => candidate.url === `${BASE_URL}/pokemon`
        && candidate.params.get('limit') === '20'
        && candidate.params.get('offset') === '40',
    );

    request.flush({
      count: 100,
      next: 'next-page',
      previous: 'previous-page',
      results: [{ name: 'pokemon-41', url: `${BASE_URL}/pokemon/41/` }],
    });

    await expect(result).resolves.toMatchObject({ count: 100, nextOffset: 60 });
  });

  it('shares and caches detail requests by ID and resolved name', async () => {
    const byId = firstValueFrom(api.getPokemon(25));
    const duplicate = firstValueFrom(api.getPokemon(25));
    const request = http.expectOne(`${BASE_URL}/pokemon/25`);

    request.flush({ ...pokemonDto(25), name: 'pikachu' });

    await expect(Promise.all([byId, duplicate])).resolves.toHaveLength(2);
    await expect(firstValueFrom(api.getPokemon('pikachu'))).resolves.toMatchObject({ id: 25 });
  });

  it('retries a detail request after an error instead of caching the failure', async () => {
    const failed = firstValueFrom(api.getPokemon(7));
    http.expectOne(`${BASE_URL}/pokemon/7`).flush('Nope', { status: 503, statusText: 'Unavailable' });
    await expect(failed).rejects.toBeTruthy();

    const retried = firstValueFrom(api.getPokemon(7));
    http.expectOne(`${BASE_URL}/pokemon/7`).flush(pokemonDto(7));
    await expect(retried).resolves.toMatchObject({ id: 7 });
  });

  it('limits concurrent detail requests and restores reference order', async () => {
    const result = firstValueFrom(api.getPokemonBatch([reference(1), reference(2), reference(3)], 2));
    const first = http.expectOne(`${BASE_URL}/pokemon/1`);
    const second = http.expectOne(`${BASE_URL}/pokemon/2`);
    http.expectNone(`${BASE_URL}/pokemon/3`);

    second.flush(pokemonDto(2));
    const third = http.expectOne(`${BASE_URL}/pokemon/3`);
    third.flush(pokemonDto(3));
    first.flush(pokemonDto(1));

    const pokemon = await result;
    expect(pokemon.map(({ id }) => id)).toEqual([1, 2, 3]);
  });

  it('requests available types and Pokémon references for one type', async () => {
    const types = firstValueFrom(api.listTypes());
    http.expectOne(`${BASE_URL}/type`).flush({
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'fire', url: `${BASE_URL}/type/10/` }],
    });
    await expect(types).resolves.toEqual([{ id: 10, name: 'fire', displayName: 'Fire' }]);

    const firePokemon = firstValueFrom(api.listPokemonByType(' Fire '));
    http.expectOne(`${BASE_URL}/type/fire`).flush({
      id: 10,
      name: 'fire',
      pokemon: [{ pokemon: { name: 'charizard', url: `${BASE_URL}/pokemon/6/` }, slot: 1 }],
    });
    await expect(firePokemon).resolves.toEqual([
      { id: 6, name: 'charizard', displayName: 'Charizard' },
    ]);
  });
});
