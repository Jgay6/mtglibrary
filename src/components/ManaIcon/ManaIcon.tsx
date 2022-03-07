import React from 'react';
import styles from './ManaIcon.module.scss';


interface IManaIconProps {
    mana: string;
}

const ManaIcon = (props: IManaIconProps) => {

    return (
        <span className={styles.ManaIcon}>
            <span className={styles['card-symbol-' + props.mana]} />
        </span>
    );

}

export default ManaIcon;
