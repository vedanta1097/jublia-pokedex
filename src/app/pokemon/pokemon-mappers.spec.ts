import { describe, expect, it } from 'vitest';
import { NamedApiResourceDto, PokemonDto } from './pokemon-api.models';
import {
  extractResourceId,
  formatPokemonName,
  mapPokemon,
  mapPokemonReferencePage,
  POKEMON_IMAGE_FALLBACK,
} from './pokemon-mappers';

function resource(name: string, id: number): NamedApiResourceDto {
  return { name, url: `https://pokeapi.co/api/v2/pokemon/${id}/` };
}

function pokemonDto(overrides: Partial<PokemonDto> = {}): PokemonDto {
  return {
    id: 6,
    name: 'charizard',
    height: 17,
    weight: 905,
    abilities: [
      { ability: resource('blaze', 66), is_hidden: false, slot: 1 },
      { ability: resource('solar-power', 94), is_hidden: true, slot: 3 },
    ],
    sprites: {
      front_default: 'default.png',
      other: {
        home: { front_default: 'home.png' },
        'official-artwork': { front_default: 'official.png' },
      },
    },
    stats: [{ base_stat: 84, effort: 0, stat: resource('attack', 2) }],
    types: [
      { slot: 1, type: resource('fire', 10) },
      { slot: 2, type: resource('flying', 3) },
    ],
    ...overrides,
  };
}

describe('pokemon mappers', () => {
  it('extracts IDs from PokéAPI resource URLs', () => {
    expect(extractResourceId('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('formats API slugs for display', () => {
    expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
  });

  it('maps a list response and its next offset', () => {
    const page = mapPokemonReferencePage({
      count: 1302,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      previous: null,
      results: [resource('bulbasaur', 1)],
    }, 20, 0);

    expect(page).toEqual({
      count: 1302,
      items: [{ id: 1, name: 'bulbasaur', displayName: 'Bulbasaur' }],
      nextOffset: 20,
    });
  });

  it('maps details into UI-facing data', () => {
    const pokemon = mapPokemon(pokemonDto());

    expect(pokemon).toMatchObject({
      id: 6,
      displayName: 'Charizard',
      imageUrl: 'official.png',
      heightDecimetres: 17,
      weightHectograms: 905,
    });
    expect(pokemon.types.map(({ name }) => name)).toEqual(['fire', 'flying']);
    expect(pokemon.abilities.map(({ name }) => name)).toEqual(['blaze', 'solar-power']);
    expect(pokemon.stats).toEqual([{ name: 'attack', displayName: 'Attack', value: 84 }]);
  });

  it('uses artwork, sprite, and local image fallbacks in priority order', () => {
    expect(mapPokemon(pokemonDto()).imageUrl).toBe('official.png');
    expect(mapPokemon(pokemonDto({
      sprites: {
        front_default: 'default.png',
        other: {
          home: { front_default: 'home.png' },
          'official-artwork': { front_default: null },
        },
      },
    })).imageUrl).toBe('home.png');
    expect(mapPokemon(pokemonDto({
      sprites: { front_default: null },
    })).imageUrl).toBe(POKEMON_IMAGE_FALLBACK);
  });
});
