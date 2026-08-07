/*
    Implements Equation (3):
    m = (P1 / P2) * (r^(P1+P2) - r^P1) / (r^P1 - 1)
*/

function impliedMultiplier(growthFactor, referencePeriod, comparisonPeriod) {
    const P1 = referencePeriod;
    const P2 = comparisonPeriod;
    const r = growthFactor;

    // Handle edge case where r = 1
    if (Math.abs(r - 1) < 1e-15) {
        return 1;
    }

    const ratio = P1 / P2;
    const powerPart = (Math.pow(r, P1 + P2) - Math.pow(r, P1)) / (Math.pow(r, P1) - 1);

    return ratio * powerPart;
}

/*
    Bisection solver.
*/
function bisection(fn, target, low, high, tolerance = 1e-15, maxIterations = 800) {
    let lower = low;
    let upper = high;

    for (let i = 0; i < maxIterations; i++) {
        const middle = (lower + upper) / 2;
        const value = fn(middle);

        if (Math.abs(value - target) < tolerance) {
            return middle;
        }

        if (value > target) {
            upper = middle;
        } else {
            lower = middle;
        }
    }

    return (lower + upper) / 2;
}

/*
    Solve Equation (3) for r.
    Supports both m >= 1 (r > 1) and m < 1 (0 < r < 1).
*/
export function solveForGrowthFactor(multiplier, referencePeriod, comparisonPeriod) {
    // If multiplier < 1, r will be in (0, 1). If m >= 1, r will be in (1, 5).
    const low = multiplier < 1 ? 0.000001 : 1.000001;
    const high = multiplier < 1 ? 0.999999 : 5.0;

    return bisection(
        (r) => impliedMultiplier(r, referencePeriod, comparisonPeriod),
        multiplier,
        low,
        high
    );
}

export function solveForMultiplier(growthFactor, referencePeriod, comparisonPeriod) {
    return impliedMultiplier(growthFactor, referencePeriod, comparisonPeriod);
}

export function annualFactor(growthFactor) {
    return Math.pow(growthFactor, 12);
}

export function annualGrowthRate(growthFactor) {
    return annualFactor(growthFactor) - 1;
}

export function monthlyFactorFromAnnualFactor(annualFactorVal) {
    return Math.pow(annualFactorVal, 1 / 12);
}

/* Helper functions for shrink factor (s = 1/r) */
export function shrinkFactorFromGrowth(r) {
    return 1 / r;
}

export function growthFromShrinkFactor(s) {
    return 1 / s;
}