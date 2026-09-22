const TOWN = "/models/fantasy-town";
const FOREST = "/models/mini-forest";
const CHAR = "/models/characters";
const SURVIVAL = "/models/survival";
const INDUSTRIAL = "/models/city-industrial";
const ROADS = "/models/city-roads";
const CARS = "/models/car-kit";

export const town = (name: string) => `${TOWN}/${name}.glb`;
export const forest = (name: string) => `${FOREST}/${name}.glb`;
export const character = (letter: string) => `${CHAR}/character-${letter}.glb`;
export const survival = (name: string) => `${SURVIVAL}/${name}.glb`;
export const industrial = (name: string) => `${INDUSTRIAL}/${name}.glb`;
export const roads = (name: string) => `${ROADS}/${name}.glb`;
export const cars = (name: string) => `${CARS}/${name}.glb`;
