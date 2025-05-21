export const COLORS = {
  PLAYER: 0x00ffaa,
  ENEMY: 0xff3366,
  BOOST: 0x6600ff,
  ENVIRONMENT: {
    SKY: 0x0a0a2a,
    GROUND: 0x101035,
    GRID: 0x00ffaa
  }
};

export const GAME_SETTINGS = {
  DEFAULTS: {
    ENEMY_SPEED: 0.15,
    PLAYER_SPEED: 0.2,
    ENEMIES_COUNT: 1
  },
  LIMITS: {
    ENEMY_SPEED: { MIN: 0.05, MAX: 0.5 },
    PLAYER_SPEED: { MIN: 0.1, MAX: 0.5 },
    ENEMIES_COUNT: { MIN: 1, MAX: 10 }
  }
};