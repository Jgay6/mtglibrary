import React, { useState } from 'react';
import styles from './TemplateName.module.scss';


interface ITemplateNameProps {
}

const TemplateName = (props: ITemplateNameProps) => {
    const [name] = useState('TemplateName');

    return (
        <div className={style.TemplateName}>
            {name} Component
        </div>
    );

}

export default TemplateName;
