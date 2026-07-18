import React from "react";


// function ParameterInput({
//                             title,
//                             value,
//                             onChange,
//                             decimals = null,
//        readOnly = false
//                         }) {
//
//     return (
//
//         <div className="parameter">
//
//             <label>
//                 {title}
//             </label>
//
//
//             <input
//                 type="number"
//                 value={value}
//                 // value={
//                 //     decimals === null || value === ""
//                 //         ? value
//                 //         : Number(value).toFixed(decimals)
//                 // }
//                 onChange={(e) => onChange(e.target.value)}
//                 step="0.0001"
//             />
//
//         </div>
//
//     );
//
// }

function ParameterInput({
    title,
    value,
    onChange,
    decimals = null,
    readOnly = false,
     step = "0.0001"
}) {

    const displayedValue =
        decimals === null || value === ""
            ? value
            : Number(value).toFixed(decimals);


    return (

        <div className="parameter">

            <label>
                {title}
            </label>


            <input
                type="number"
                value={displayedValue}
                readOnly={readOnly}
                onChange={(e) => onChange(e.target.value)}
                step={step}
            />

        </div>

    );

}

export default ParameterInput;