import React from 'react';
import styles from './Button.module.css';

function Button({children, onClick, disabled, type = 'button', value}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            value={value}
            className={styles.button}
        >
            {children}
        </button>
    );
}

export default Button;
