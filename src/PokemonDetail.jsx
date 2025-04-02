import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import styles from "./PokemonDetail.module.css";
import {round} from "./helpers/numberHelper.js";
import Button from "./Button.jsx";

function PokemonDetail() {
    const navigate = useNavigate();
    const {name} = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [speciesData, setSpeciesData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchPokemonData() {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch basic Pokemon data
                const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);

                if (isMounted) {
                    setPokemon(pokemonResponse.data);

                    // Fetch additional species data
                    const speciesResponse = await axios.get(pokemonResponse.data.species.url);
                    if (isMounted) {
                        setSpeciesData(speciesResponse.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching Pokemon details", error);
                if (isMounted) {
                    setError("Failed to load Pokemon details");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchPokemonData();

        return () => {
            isMounted = false;
        };
    }, [name]);

    // Find English flavor text
    const englishFlavorText = speciesData?.flavor_text_entries?.find(
        entry => entry.language.name === "en"
    )?.flavor_text?.replace(/\f/g, ' ');

    // Get habitat
    const habitat = speciesData?.habitat?.name;

    return (
        <section className={styles.pageWrapper}>
            <div className={styles.container}>
                <Button onClick={() => navigate('/')}>Back to List</Button>

                <h1 className={`${styles.title} title`}>Pokemon Details</h1>
                {isLoading && <p>Loading Pokemon details...</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}

                {pokemon && (
                    <article className={`${styles.pokemonCard} pokemonDetail`}>
                        <h2 className={`${styles.pokemonName} pokemonName`}>{pokemon.name}</h2>
                        <div className={styles.imageContainer}>
                            <img
                                src={pokemon.sprites.other["official-artwork"].front_shiny}
                                alt={pokemon.name}
                                className={styles.pokemonImage}
                            />
                        </div>

                        {englishFlavorText && (
                            <p className={styles.flavorText}>{englishFlavorText}</p>
                        )}

                        <div className={styles.pokemonInfo}>
                            <ul>
                                <li><strong>Moves:</strong> {pokemon.moves.length}</li>
                                <li><strong>Weight:</strong> {round(pokemon.weight / 10, 1)} kg</li>
                                <li><strong>Abilities:</strong>
                                    <ul className={styles.abilitiesList}>
                                        {pokemon.abilities.map((ability, index) => (
                                            <li key={index}><em>{ability.ability.name}</em></li>
                                        ))}
                                    </ul>
                                </li>
                                <li><strong>Types:</strong> {pokemon.types.map(type => type.type.name).join(", ")}</li>
                                <li><strong>Height:</strong> {round(pokemon.height / 10, 1)} m</li>
                                <li><strong>Base Experience:</strong> {pokemon.base_experience}</li>
                                {habitat && <li><strong>Habitat:</strong> {habitat}</li>}
                                {speciesData?.is_legendary && <li><strong>Legendary:</strong> Yes</li>}
                                {speciesData?.is_mythical && <li><strong>Mythical:</strong> Yes</li>}
                                <li><strong>Base Stats:</strong>
                                    <ul className={styles.statsList}>
                                        {pokemon.stats.map(stat => (
                                            <li key={stat.stat.name}>
                                                <strong>{stat.stat.name}:</strong> {stat.base_stat}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}

export default PokemonDetail;
