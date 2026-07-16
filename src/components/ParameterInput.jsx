import React from "react";


function ParameterInput({
    title,
    value,
    onChange
}) {

    return (

        <div className="parameter">

            <label>
                {title}
            </label>


            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                step="0.0001"
            />

        </div>

    );

}


export default ParameterInput;