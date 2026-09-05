import {
  NamedApiResourceDto,
  NamedApiResourceListDto,
  PokemonDto,
  PokemonTypeDto,
} from './pokemon-api.models';
import {
  Pokemon,
  PokemonReference,
  PokemonReferencePage,
  PokemonTypeReference,
} from './pokemon.models';

export const POKEMON_IMAGE_FALLBACK = 'assets/pokemon-error.png';

export function extractResourceId(url: string): number {
  return Number(url.split('/').filter(Boolean).at(-1));
}

export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function mapPokemonReference(resource: NamedApiResourceDto): PokemonReference {
  return {
    id: extractResourceId(resource.url),
    name: resource.name,
    displayName: formatPokemonName(resource.name),
  };
}

export function mapPokemonReferencePage(
  response: NamedApiResourceListDto,
  limit: number,
  offset: number,
): PokemonReferencePage {
  return {
    count: response.count,
    items: response.results.map(mapPokemonReference),
    nextOffset: response.next === null ? null : offset + limit,
  };
}

export function mapPokemon(response: PokemonDto): Pokemon {
  return {
    id: response.id,
    name: response.name,
    displayName: formatPokemonName(response.name),
    imageUrl: selectPokemonImage(response),
    heightDecimetres: response.height,
    weightHectograms: response.weight,
    abilities: response.abilities.map(({ ability, is_hidden: isHidden }) => ({
      name: ability.name,
      displayName: formatPokemonName(ability.name),
      isHidden,
    })),
    stats: response.stats.map(({ base_stat: value, stat }) => ({
      name: stat.name,
      displayName: formatPokemonName(stat.name),
      value,
    })),
    types: response.types.map(({ type }) => ({
      name: type.name,
      displayName: formatPokemonName(type.name),
    })),
  };
}

export function selectPokemonImage(response: PokemonDto): string {
  return response.sprites.other?.['official-artwork']?.front_default
    ?? response.sprites.other?.home?.front_default
    ?? response.sprites.front_default
    ?? POKEMON_IMAGE_FALLBACK;
}

export function mapPokemonTypes(response: NamedApiResourceListDto): PokemonTypeReference[] {
  return response.results.map(mapPokemonReference);
}

export function mapPokemonByType(response: PokemonTypeDto): PokemonReference[] {
  return response.pokemon.map(({ pokemon }) => mapPokemonReference(pokemon));
}
