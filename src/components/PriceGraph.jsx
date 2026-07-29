import React from "react";

function PriceGraph({ growthFactor, referencePeriod, comparisonPeriod }) {
    // Sanitize inputs
    const r = isNaN(growthFactor) || growthFactor <= 0 ? 1.0 : growthFactor;
    const rp = isNaN(referencePeriod) || referencePeriod <= 0 ? 24 : referencePeriod;
    const rcp = isNaN(comparisonPeriod) || comparisonPeriod <= 0 ? 6 : comparisonPeriod;

    // Total time horizon in months (at least 24 months / 2 years)
    const totalMonths = Math.max(24, rp + rcp);

    // Calculate price series starting at 100
    const points = [];
    for (let m = 0; m <= totalMonths; m++) {
        const price = 100 * Math.pow(r, m);
        points.push({ month: m, price });
    }

    const startPrice = 100;
    const maxPrice = points[points.length - 1].price;

    // Dimensions
    const width = 520;
    const height = 320;
    const padding = { top: 30, right: 30, bottom: 45, left: 85 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Y-axis starts strictly at base price 100
    const yMin = 100;
    const yMax = Math.max(startPrice * 1.25, maxPrice * 1.05);

    // Coordinate mapping functions
    const getX = (m) => padding.left + (m / totalMonths) * plotWidth;
    const getY = (p) => padding.top + plotHeight - ((p - yMin) / (yMax - yMin)) * plotHeight;

    // Build SVG path
    const pathD = points
        .map((pt, i) => `${i === 0 ? "M" : "L"} ${getX(pt.month)} ${getY(pt.price)}`)
        .join(" ");

    const areaD = `${pathD} L ${getX(totalMonths)} ${getY(100)} L ${getX(0)} ${getY(100)} Z`;

    // Standard Y-axis ticks starting at 100
    const standardTickCount = 4;
    const standardYTicks = [];
    for (let i = 0; i <= standardTickCount; i++) {
        const val = 100 + (i / standardTickCount) * (yMax - 100);
        standardYTicks.push(val);
    }

    // Dedicated Year Ticks (Month 12, 24, 36...)
    const yearTicks = [];
    for (let yr = 1; yr * 12 <= totalMonths; yr++) {
        const m = yr * 12;
        const priceAtYear = 100 * Math.pow(r, m);
        yearTicks.push({
            year: yr,
            month: m,
            price: priceAtYear,
            x: getX(m),
            y: getY(priceAtYear),
        });
    }

    // X-axis ticks (every 6 or 12 months)
    const stepX = totalMonths > 36 ? 12 : 6;
    const xTicks = [];
    for (let m = 0; m <= totalMonths; m += stepX) {
        xTicks.push(m);
    }

    return (
        <div className="price-graph-container">
            <div className="graph-header">
                <h3>Price Projection</h3>
                <span className="graph-subtitle">Base Price = 100</span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="price-graph-svg">
                {/* Background Grid Lines */}
                {standardYTicks.map((val, idx) => (
                    <line
                        key={`grid-y-${idx}`}
                        x1={padding.left}
                        y1={getY(val)}
                        x2={width - padding.right}
                        y2={getY(val)}
                        stroke="#e2e8f0"
                        strokeDasharray="4,4"
                    />
                ))}

                {/* Shaded area under curve */}
                <path d={areaD} fill="rgba(40, 120, 200, 0.08)" />

                {/* Main trajectory curve */}
                <path d={pathD} fill="none" stroke="#2878c8" strokeWidth="2.5" />

                {/* Standard Y-Axis Ticks (Starts at 100) */}
                {standardYTicks.map((val, idx) => (
                    <g key={`y-tick-${idx}`}>
                        <line
                            x1={padding.left - 5}
                            y1={getY(val)}
                            x2={padding.left}
                            y2={getY(val)}
                            stroke="#94a3b8"
                        />
                        <text
                            x={padding.left - 10}
                            y={getY(val) + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill={idx === 0 ? "#0f172a" : "#64748b"}
                            fontWeight={idx === 0 ? "bold" : "normal"}
                        >
                            {val.toFixed(0)}
                        </text>
                    </g>
                ))}

                {/* Dedicated Yearly Ticks & Indicators on Left Y-Axis */}
                {yearTicks.map((yt) => (
                    <g key={`year-tick-${yt.year}`}>
                        {/* Reference line to curve */}
                        <line
                            x1={padding.left}
                            y1={yt.y}
                            x2={yt.x}
                            y2={yt.y}
                            stroke="#e67e22"
                            strokeDasharray="3,3"
                            strokeWidth="1.2"
                        />
                        <line
                            x1={yt.x}
                            y1={yt.y}
                            x2={yt.x}
                            y2={height - padding.bottom}
                            stroke="#e67e22"
                            strokeDasharray="3,3"
                            strokeWidth="1.2"
                        />

                        {/* Highlighted Y-axis tick mark on the left */}
                        <line
                            x1={padding.left - 8}
                            y1={yt.y}
                            x2={padding.left}
                            y2={yt.y}
                            stroke="#d35400"
                            strokeWidth="2"
                        />
                        <text
                            x={padding.left - 12}
                            y={yt.y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#d35400"
                        >
                            Yr {yt.year}: {yt.price.toFixed(0)}
                        </text>

                        {/* Point on curve */}
                        <circle cx={yt.x} cy={yt.y} r="4" fill="#e67e22" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                ))}

                {/* Start Point (Month 0, Price 100) */}
                <circle cx={getX(0)} cy={getY(100)} r="4" fill="#2878c8" />

                {/* Axes Lines */}
                <line
                    x1={padding.left}
                    y1={height - padding.bottom}
                    x2={width - padding.right}
                    y2={height - padding.bottom}
                    stroke="#475569"
                    strokeWidth="1.5"
                />
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={height - padding.bottom}
                    stroke="#475569"
                    strokeWidth="1.5"
                />

                {/* X-Axis Ticks (Time in Months) */}
                {xTicks.map((m) => (
                    <g key={`x-tick-${m}`}>
                        <line
                            x1={getX(m)}
                            y1={height - padding.bottom}
                            x2={getX(m)}
                            y2={height - padding.bottom + 5}
                            stroke="#475569"
                        />
                        <text
                            x={getX(m)}
                            y={height - padding.bottom + 18}
                            textAnchor="middle"
                            fontSize="11"
                            fill={m % 12 === 0 ? "#0f172a" : "#64748b"}
                            fontWeight={m % 12 === 0 ? "bold" : "normal"}
                        >
                            {m}m
                        </text>
                    </g>
                ))}

                {/* Axis Labels */}
                <text
                    x={padding.left + plotWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#334155"
                >
                    Time (months)
                </text>
                <text
                    transform={`rotate(-90)`}
                    x={-(padding.top + plotHeight / 2)}
                    y={16}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#334155"
                >
                    Price
                </text>
            </svg>
        </div>
    );
}

export default PriceGraph;