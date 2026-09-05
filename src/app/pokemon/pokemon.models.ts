export interface PokemonReference {
  id: number;
  name: string;
  displayName: string;
}

export interface PokemonReferencePage {
  count: number;
  items: PokemonReference[];
  nextOffset: number | null;
}

export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  imageUrl: string;
  heightDecimetres: number;
  weightHectograms: number;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  types: PokemonType[];
}

export interface PokemonAbility {
  name: string;
  displayName: string;
  isHidden: boolean;
}

export interface PokemonStat {
  name: string;
  displayName: string;
  value: number;
}

export interface PokemonType {
  name: string;
  displayName: string;
}

export interface PokemonTypeReference extends PokemonType {
  id: number;
}
