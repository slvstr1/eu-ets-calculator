import React, { useState } from "react";

function Header() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="header-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="header">
                <h1>EU ETS Price Containment Mechanism Calculator</h1>
                <p>
                    This calculator determines the relationship between the legal parameters of EU ETS price containment mechanisms and the maximum constant permit price growth that can occur without triggering intervention.
                </p>
                <p>
                    Modify any of the fields and the calculator solves for the corresponding values of the other fields.
                </p>
                <p className="paper-citation">
                    Accompanying the paper Silvester van Koten, 2026. "the Price Containment Mechanism"
                </p>
            </div>

            {/* Hover Pop-up Balloon */}
            {isHovered && (
                <div className="header-balloon">
                    <p className="balloon-title">
                        The relationship between the parameters is given by:
                    </p>

                    {/* Formatted Equation */}
                    <div className="math-formula">
                        <span className="math-var">m</span> =
                        <div className="fraction">
                            <span className="numerator">#P<sub>1</sub></span>
                            <span className="denominator">#P<sub>2</sub></span>
                        </div>
                        <span className="math-op">&times;</span>
                        <div className="fraction">
                            <span className="numerator">
                                r<sup>(#P<sub>1</sub> + #P<sub>2</sub>)</sup> &minus; r<sup>#P<sub>1</sub></sup>
                            </span>
                            <span className="denominator">
                                r<sup>(#P<sub>1</sub> + #P<sub>2</sub>)</sup> &minus; 1
                            </span>
                        </div>
                    </div>

                    <p className="balloon-explanation">
                        Where <strong>m</strong> is the multiplier, <strong>#P<sub>1</sub></strong> and <strong>#P<sub>2</sub></strong> are the lengths of the first and second periods in months.
                    </p>
                </div>
            )}
        </div>
    );
}

export default Header;