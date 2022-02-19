import React, { useState } from 'react';
import './TemplateName.module.scss';


interface ITemplateNameProps {
}

const TemplateName = (props: ITemplateNameProps) => {
    const [name] = useState('TemplateName');

    return (
        <div className="TemplateName">
            {name} Component
        </div>);

}

export default TemplateName;
