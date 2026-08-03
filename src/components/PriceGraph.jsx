import React from "react";

function PriceGraph({ growthFactor, referencePeriod, comparisonPeriod, isShrinkMode = false }) {
    const r = isNaN(growthFactor) || growthFactor <= 0 ? 1.0 : growthFactor;
    const rp = isNaN(referencePeriod) || referencePeriod <= 0 ? 24 : referencePeriod;
    const rcp = isNaN(comparisonPeriod) || comparisonPeriod <= 0 ? 6 : comparisonPeriod;

    const totalMonths = Math.max(24, rp + rcp);

    const points = [];
    for (let m = 0; m <= totalMonths; m++) {
        const price = 100 * Math.pow(r, m);
        points.push({ month: m, price });
    }

    const maxPriceInPoints = Math.max(...points.map(p => p.price));
    const minPriceInPoints = Math.min(...points.map(p => p.price));

    const width = 520;
    const height = 320;
    const padding = { top: 30, right: 30, bottom: 45, left: 85 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const yMin = Math.max(0, isShrinkMode ? minPriceInPoints * 0.9 : 90);
    const yMax = isShrinkMode ? 110 : Math.max(120, maxPriceInPoints * 1.08);

    const getX = (m) => padding.left + (m / totalMonths) * plotWidth;
    const getY = (p) => padding.top + plotHeight - ((p - yMin) / (yMax - yMin)) * plotHeight;

    const pathD = points
        .map((pt, i) => `${i === 0 ? "M" : "L"} ${getX(pt.month)} ${getY(pt.price)}`)
        .join(" ");

    const areaD = `${pathD} L ${getX(totalMonths)} ${getY(yMin)} L ${getX(0)} ${getY(yMin)} Z`;

    const standardTickCount = 4;
    const standardYTicks = [];
    for (let i = 0; i <= standardTickCount; i++) {
        const val = yMin + (i / standardTickCount) * (yMax - yMin);
        standardYTicks.push(val);
    }

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

    const stepX = totalMonths > 36 ? 12 : 6;
    const xTicks = [];
    for (let m = 0; m <= totalMonths; m += stepX) {
        xTicks.push(m);
    }

    // Color definitions based on mode
    const mainColor = isShrinkMode ? "#dc2626" : "#2878c8";
    const areaColor = isShrinkMode ? "rgba(220, 38, 38, 0.08)" : "rgba(40, 120, 200, 0.08)";
    const dotColor = isShrinkMode ? "#b91c1c" : "#e67e22";

    return (
        <div className="price-graph-container">
            <div className="graph-header">
                <h3>Price Projection</h3>
                <span className={`graph-subtitle ${isShrinkMode ? "text-red" : ""}`}>
                    Base Price = 100 {isShrinkMode ? "(Shrink Regime)" : ""}
                </span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="price-graph-svg">
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

                <path d={areaD} fill={areaColor} />
                <path d={pathD} fill="none" stroke={mainColor} strokeWidth="2.5" />

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
                            fill="#64748b"
                        >
                            {val.toFixed(0)}
                        </text>
                    </g>
                ))}

                {yearTicks.map((yt) => (
                    <g key={`year-tick-${yt.year}`}>
                        <line
                            x1={padding.left}
                            y1={yt.y}
                            x2={yt.x}
                            y2={yt.y}
                            stroke={dotColor}
                            strokeDasharray="3,3"
                            strokeWidth="1.2"
                        />
                        <line
                            x1={yt.x}
                            y1={yt.y}
                            x2={yt.x}
                            y2={height - padding.bottom}
                            stroke={dotColor}
                            strokeDasharray="3,3"
                            strokeWidth="1.2"
                        />

                        <line
                            x1={padding.left - 8}
                            y1={yt.y}
                            x2={padding.left}
                            y2={yt.y}
                            stroke={dotColor}
                            strokeWidth="2"
                        />
                        <text
                            x={padding.left - 12}
                            y={yt.y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fontWeight="bold"
                            fill={dotColor}
                        >
                            Yr {yt.year}: {yt.price.toFixed(0)}
                        </text>

                        <circle cx={yt.x} cy={yt.y} r="4" fill={dotColor} stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                ))}

                <circle cx={getX(0)} cy={getY(100)} r="4" fill={mainColor} />

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