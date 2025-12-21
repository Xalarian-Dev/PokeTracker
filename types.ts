
export interface Pokemon {
  id: string;
  name: string;
  sprite: string;
  shinySprite: string;
  generation: number;
  region?: string;
}

export interface User {
  username: string;
}
