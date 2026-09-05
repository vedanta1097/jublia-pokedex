export interface NamedApiResourceDto {
  name: string;
  url: string;
}

export interface NamedApiResourceListDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResourceDto[];
}

export interface PokemonDto {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: PokemonAbilityDto[];
  sprites: PokemonSpritesDto;
  stats: PokemonStatDto[];
  types: PokemonTypeSlotDto[];
}

export interface PokemonAbilityDto {
  ability: NamedApiResourceDto;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSpritesDto {
  front_default: string | null;
  other?: {
    home?: PokemonArtworkDto;
    'official-artwork'?: PokemonArtworkDto;
  };
}

export interface PokemonArtworkDto {
  front_default: string | null;
}

export interface PokemonStatDto {
  base_stat: number;
  effort: number;
  stat: NamedApiResourceDto;
}

export interface PokemonTypeSlotDto {
  slot: number;
  type: NamedApiResourceDto;
}

export interface PokemonTypeDto {
  id: number;
  name: string;
  pokemon: PokemonTypePokemonDto[];
}

export interface PokemonTypePokemonDto {
  pokemon: NamedApiResourceDto;
  slot: number;
}
