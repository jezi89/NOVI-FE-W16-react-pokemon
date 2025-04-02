import styles from './Button.module.css';

function Button({children, onClick, disabled, type = 'button', value, className}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            value={value}
            className={`${styles.button} ${className || ''}`}
        >
            {children}
        </button>
    );
}

export default Button;
