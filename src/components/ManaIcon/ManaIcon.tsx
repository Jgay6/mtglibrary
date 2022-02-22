import React from 'react';
import styles from './ManaIcon.module.scss';


interface IManaIconProps {
    mana: string;
}

const ManaIcon = (props: IManaIconProps) => {

    return (
        <div className={styles.ManaIcon}>
            <div className={styles['card-symbol-' + props.mana]} />
        </div>
    );

}

export default ManaIcon;
