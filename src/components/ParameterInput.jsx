import React from "react";


function ParameterInput({
                            title,
                            value,
                            onChange,
                            decimals = null
                        }) {

    return (

        <div className="parameter">

            <label>
                {title}
            </label>


            <input
                type="number"
                value={value}
                // value={
                //     decimals === null || value === ""
                //         ? value
                //         : Number(value).toFixed(decimals)
                // }
                onChange={(e) => onChange(e.target.value)}
                step="0.0001"
            />

        </div>

    );

}


export default ParameterInput;