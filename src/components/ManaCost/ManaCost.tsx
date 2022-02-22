import React, { useEffect, useState } from 'react';
import ManaIcon from "../ManaIcon/ManaIcon";
import styles from './ManaCost.module.scss';


interface IManaCostProps {
    cost: string | null | undefined;
}

const ManaCost = (props: IManaCostProps) => {
    const regex: RegExp = /{[A-Z0-9\/]+}/g;
    const [manas, setManas] = useState<string[]>();

    useEffect(() => {
        let m;
        let tmp: string[] = [];

        while ((m = regex.exec(props.cost || '')) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            m.forEach((match) => {
                tmp.push(match.replaceAll('{', '').replaceAll('}', ''));
            });
        }

        setManas(tmp);
    }, []);

    return (
        <div className={styles.ManaCost}>
            {manas?.map((mana, index) =>
                <ManaIcon mana={mana} key={index} />
            )}
        </div>
    );

}

export default ManaCost;
