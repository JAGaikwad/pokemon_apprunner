/** ポケモンの取得 */
//import { ProxyAgent } from "proxy-agent"; 
//const agent = new ProxyAgent();

export const findPokemon = async (name) => {
  try{
    console.log("start findPokemon");
    console.log(name);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await response.json();
    return pokemon;
  } catch (error) {
    console.log("err findPokemon");
    console.log(error);
  }  
};
