import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import styles from "./PokemonGrid.module.css";
import {round} from "./helpers/numberHelper.js";
import Button from "./Button.jsx";
import GoPokemonButton from "./GoPokemonButton.jsx";

function PokemonGrid() {
    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonDetails, setPokemonDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pageStart, setPageStart] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInputValue, setPageInputValue] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(48);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        async function fetchPokemonList(limit, offset) {
            try {
                setIsLoading(true);
                setError(null);
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`, {
                    signal: controller.signal
                });

                if (isMounted) {
                    setPokemonList(response.data.results);
                    setTotalCount(response.data.count);
                    // Reset pokemon details when fetching new list
                    setPokemonDetails({});

                    // Fetch details for each Pokemon
                    response.data.results.forEach(pokemon => {
                        fetchPokemonDetails(pokemon.url, controller.signal);
                    });
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.name === 'CanceledError') {
                    console.log('Request canceled:', error.message);
                } else if (isMounted) {
                    console.error("Error fetching Pokemon list", error);
                    setError("Failed to load Pokemon list");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchPokemonList(itemsPerPage, 0);

        return () => {
            isMounted = false;
            controller.abort('Component unmounted');
        };
    }, []);


    const handleItemsPerPageChange = (e) => {
        const newValue = parseInt(e.target.value);

        // Bereken huidige offset (startpunt in de totale lijst)
        const currentOffset = pageStart;

        // Bereken nieuwe paginanummer op basis van huidige offset en nieuwe itemsPerPage
        const newPage = Math.floor(currentOffset / newValue) + 1;
        const newOffset = (newPage - 1) * newValue;

        // Update state
        setItemsPerPage(newValue);
        setCurrentPage(newPage);
        setPageStart(newOffset);

        // Haal data op met de nieuwe parameters
        fetchPokemonList(newValue, newOffset);
    };

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
        if (e) e.preventDefault();
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
        const controller = new AbortController();
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`, {
                signal: controller.signal
            });
            setPokemonList(response.data.results);
            setTotalCount(response.data.count);
            // Reset pokemon details when fetching new list
            setPokemonDetails({});

            // Fetch details for each Pokemon
            response.data.results.forEach(pokemon => {
                fetchPokemonDetails(pokemon.url, controller.signal);
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.name === 'CanceledError') {
                console.log('Request canceled:', error.message);
            } else {
                console.error("Error fetching Pokemon list", error);
                setError("Failed to load Pokemon list");
            }
        } finally {
            setIsLoading(false);
        }

        return controller; // Return the controller in case we need to abort later
    }

    async function fetchPokemonDetails(url, signal) {
        try {
            const response = await axios.get(url, {signal});
            setPokemonDetails(prev => ({
                ...prev,
                [response.data.name]: response.data
            }));
        } catch (error) {
            if (axios.isAxiosError(error) && error.name === 'CanceledError') {
                console.log('Request canceled:', error.message);
            } else {
                console.error(`Error fetching Pokemon details`, error);
            }
        }
    }

    const hasNextPage = pageStart + itemsPerPage < totalCount;
    const minCardValue = 36
    const maxCardValue = 160
    const stepValue = 12

    return (
        <div className={styles.container}>
            <h1 className={`${styles.title} title`}>Pokemon Wiki</h1>
            <div className={styles.paginationControls}>
                <Button
                    value="previous"
                    onClick={pageSetter}
                    disabled={currentPage === 1 || isLoading}
                    className={styles.navButton}
                >
                    Previous
                </Button>
                <span className={styles.pageInfo}> Page {currentPage} of {maxPage} </span>
                <Button
                    value="next"
                    onClick={pageSetter}
                    disabled={!hasNextPage || isLoading}
                    className={styles.navButton}
                >
                    Next
                </Button>
            </div>

            {/* Slider voor cards per pagina */}
            <label htmlFor="items-per-page">Cards per pagina: </label>
            <span className={styles.sliderValue}>{itemsPerPage}{" "}/ {maxCardValue}</span>
            <div className={styles.sliderContainer}>
                {/*<label htmlFor="items-per-page">Cards per pagina: </label>*/}
                <button
                    className={styles.sliderButton}
                    onClick={() => {
                        const newValue = {minCardValue}; // Minimum waarde
                        setItemsPerPage(newValue);
                        setCurrentPage(1);
                        setPageStart(0);
                        fetchPokemonList(newValue, 0);
                    }}
                    disabled={itemsPerPage <= {minCardValue}}  // Disabled when already at minimum
                    title={`Minimum (${minCardValue} cards)`}
                >
                    Min
                </button>
                <button
                    className={styles.sliderButton}
                    onClick={() => {
                        const newValue = Math.max(minCardValue, itemsPerPage - {stepValue});
                        setItemsPerPage(newValue);
                        setCurrentPage(1);
                        setPageStart(0);
                        fetchPokemonList(newValue, 0);
                    }}
                    disabled={itemsPerPage <= {minCardValue}}
                    title={`${minCardValue} cards less`}
                >
                    &lt;

                </button>
                <div className={styles.sliderWithHint}>
                    <input
                        id="items-per-page"
                        type="range"
                        min={minCardValue}
                        max={maxCardValue}
                        step={stepValue}
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className={styles.slider}
                        style={{width: "250px"}}
                    />
                    <div className={styles.stepHint}>{`+/- ${stepValue}`}</div>
                </div>
                <button
                    className={styles.sliderButton}
                    onClick={() => {
                        const newValue = Math.min(maxCardValue, itemsPerPage + stepValue);
                        setItemsPerPage(newValue);
                        setCurrentPage(1);
                        setPageStart(0);
                        fetchPokemonList(newValue, 0);
                    }}
                    disabled={itemsPerPage >= {maxCardValue}}
                    title={`${stepValue} cards meer`}
                >
                    &gt;
                </button>
                <button
                    className={styles.sliderButton}
                    onClick={() => {
                        const newValue = {maxCardValue}; // Maximum waarde
                        setItemsPerPage(newValue);
                        setCurrentPage(1);
                        setPageStart(0);
                        fetchPokemonList(newValue, 0);
                    }}
                    disabled={itemsPerPage >= {maxCardValue}}  // Disabled when already at maximum
                    title={`Maximum (${maxCardValue} cards)`}
                >
                    Max
                </button>

            </div>


            <form onSubmit={handlePageJump} className={styles.pageJumpForm}>
                <span className={styles.goToText}>Go to Page:</span>
                <input
                    type="number"
                    min="1"
                    max={Math.ceil(totalCount / itemsPerPage)}
                    value={pageInputValue}
                    onChange={(e) => setPageInputValue(e.target.value)}
                    className={styles.pageInput}
                />
                <div className={styles.goButtonWrapper}>
                    <GoPokemonButton type="submit" disabled={isLoading}>
                        GO!
                    </GoPokemonButton>
                </div>
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

            <div className={styles.paginationControls}>
                <Button
                    value="previous"
                    onClick={pageSetter}
                    disabled={currentPage === 1 || isLoading}
                    className={styles.navButton}
                >
                    Previous
                </Button>
                <span className={styles.pageInfo}> Page {currentPage} of {maxPage} </span>
                <Button
                    value="next"
                    onClick={pageSetter}
                    disabled={!hasNextPage || isLoading}
                    className={styles.navButton}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default PokemonGrid;
