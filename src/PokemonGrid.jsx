import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import styles from "./PokemonGrid.module.css";
import {round} from "./helpers/numberHelper.js";
import Button from "./Button.jsx";

function PokemonGrid() {
    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonDetails, setPokemonDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pageStart, setPageStart] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInputValue, setPageInputValue] = useState("");
    const [totalCount, setTotalCount] = useState(0);

    const itemsPerPage = 20;

    useEffect(() => {
        fetchPokemonList(itemsPerPage, 0);
    }, []);

    function pageSetter(e) {
        if (e.target.value === "next") {
            setCurrentPage(prev => prev + 1);
            setPageStart(prev => prev + itemsPerPage);
            fetchPokemonList(itemsPerPage, pageStart + itemsPerPage);
        } else if (e.target.value === "previous") {
            setCurrentPage(prev => prev - 1);
            setPageStart(prev => prev - itemsPerPage);
            fetchPokemonList(itemsPerPage, pageStart - itemsPerPage);
        }
    }

    const maxPage = Math.ceil(totalCount / itemsPerPage);


    function handlePageJump(e) {
        e.preventDefault();
        const pageNumber = parseInt(pageInputValue);
        if (pageNumber && pageNumber >= 1 && pageNumber <= maxPage) {
            const newOffset = (pageNumber - 1) * itemsPerPage;
            setCurrentPage(pageNumber);
            setPageStart(newOffset);
            fetchPokemonList(itemsPerPage, newOffset);
            setPageInputValue(""); // Clear input after jump
        }
    }

    async function fetchPokemonList(limit, offset) {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`);
            setPokemonList(response.data.results);
            setTotalCount(response.data.count);
            // Reset pokemon details when fetching new list
            setPokemonDetails({});

            // Fetch details for each Pokemon
            response.data.results.forEach(pokemon => {
                fetchPokemonDetails(pokemon.url);
            });
        } catch (error) {
            console.error("Error fetching Pokemon list", error);
            setError("Failed to load Pokemon list");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchPokemonDetails(url) {
        try {
            const response = await axios.get(url);
            setPokemonDetails(prev => ({
                ...prev,
                [response.data.name]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching Pokemon details`, error);
        }
    }

    const hasNextPage = pageStart + itemsPerPage < totalCount;


    return (
        <div className={styles.container}>
            <h1 className={`${styles.title} title`}>Pokemon Wiki</h1>
            <div className={styles.paginationControls}>
                <Button
                    value="previous"
                    onClick={pageSetter}
                    disabled={currentPage === 1 || isLoading}
                >
                    Previous page
                </Button>
                <span> Page {currentPage} of {maxPage} </span>
                <Button
                    value="next"
                    onClick={pageSetter}
                    disabled={!hasNextPage || isLoading}
                >
                    Next page
                </Button>
            </div>

            <form onSubmit={handlePageJump} className={styles.pageJumpForm}>
                <label>
                    Go to Page:
                    <input
                        type="number"
                        min="1"
                        max={Math.ceil(totalCount / itemsPerPage)}
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        className={styles.pageInput}
                    />
                </label>
                <Button type="submit" disabled={isLoading}>
                    Go
                </Button>
            </form>

            {isLoading && <p>Loading pokemons. Hold on.</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.pokeWrapper}>
                {pokemonList.map((pokemon) => (
                    <div key={pokemon.name} className={styles.pokemonCardSmall}>
                        {pokemonDetails[pokemon.name] ? (
                            <Link to={`/pokemon/${pokemon.name}`} className={styles.pokemonLink}>
                                <article className={styles.pokemonCardGrid}>
                                    <h2 className={`${styles.pokemonName} pokemonName`}>{pokemon.name}</h2>
                                    <div className={styles.imageContainer}>
                                        <img
                                            src={pokemonDetails[pokemon.name].sprites.other["official-artwork"].front_default}
                                            alt={pokemon.name}
                                            className={styles.pokemonImageSmall}
                                        />
                                    </div>
                                    <div className={styles.gridInfo}>
                                        <ul>
                                            <li><strong>Moves:</strong> {pokemonDetails[pokemon.name].moves.length}</li>
                                            <li><strong>Weight:</strong> {round(pokemonDetails[pokemon.name].weight / 10, 1)} kg</li>
                                            <li>
                                                <strong>Abilities:</strong>
                                                <ul className={styles.abilitiesList}>
                                                    {pokemonDetails[pokemon.name].abilities.map((ability, index) => (
                                                        <li key={index}>{ability.ability.name}</li>
                                                    ))}
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </article>
                            </Link>
                        ) : (
                            <p>Loading {pokemon.name}...</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PokemonGrid;
