import styles from './GoPokemonButton.module.css';

function GoPokemonButton({ children, onClick, disabled, type = 'button' }) {
    // Zet de tekst van de knop leeg zodat we alleen de ::after content gebruiken
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={styles.goButton}
            data-text={children} // Toevoegen van data-text attribuut voor ::after
            aria-label={children} // Toegankelijkheid behouden
        >
            <span style={{ opacity: 0 }}>{children}</span> {/* Originele tekst onzichtbaar maken */}
        </button>
    );
}

export default GoPokemonButton;
