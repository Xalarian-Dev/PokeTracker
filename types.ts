
export interface Pokemon {
  id: string;
  name: string;
  sprite: string;
  shinySprite: string;
  generation: number;
  region?: string;
  hasMultipleForms?: boolean;
}

export interface PokemonForm {
  id: string;
  name: string;
  sprite: string;
  shinySprite: string;
}

export interface User {
  username: string;
  email: string;
  passwordHash?: string; // Simulated security
}
