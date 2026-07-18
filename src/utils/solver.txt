/*
    Implements Equation (3):

    m =
    (u-t+1)/(v-u) *
    (r^(v-t+1)-r^(u-t+1))
    /
    (r^(u-t+1)-1)

    where:

    r = monthly growth factor
    m = multiplier
    RP = Reference Period length
    RCP = Recent Comparison Period length

    We set:

    t = 1
    u = RP
    v = RP + RCP

*/


function impliedMultiplier(
    growthFactor,
    referencePeriod,
    comparisonPeriod
) {

    const t = 1;
    const u = referencePeriod;
    const v = referencePeriod + comparisonPeriod;


    const numerator =
        (u - t + 1) /
        (v - u);


    const powerPart =
        (
            Math.pow(growthFactor, v - t + 1)
            -
            Math.pow(growthFactor, u - t + 1)
        )
        /
        (
            Math.pow(growthFactor, u - t + 1)
            -
            1
        );


    return numerator * powerPart;

}



/*
    Bisection solver.

    Finds x where:

    f(x)=target

*/


function bisection(
    fn,
    target,
    low,
    high,
    tolerance = 0.00000001,
    maxIterations = 200
) {

    let lower = low;
    let upper = high;


    for (let i = 0; i < maxIterations; i++) {

        const middle =
            (lower + upper) / 2;


        const value =
            fn(middle);



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

    Example:
    ETS1:
    m=2.4
    RP=24
    RCP=6

    returns:
    r=1.0665
*/


export function solveForGrowthFactor(
    multiplier,
    referencePeriod,
    comparisonPeriod
) {


    return bisection(
        (r) =>
            impliedMultiplier(
                r,
                referencePeriod,
                comparisonPeriod
            ),
        multiplier,
        1.000001,
        5
    );

}



/*
    Solve Equation (3) for m.

    Here r is known.
*/


export function solveForMultiplier(
    growthFactor,
    referencePeriod,
    comparisonPeriod
) {

    return impliedMultiplier(
        growthFactor,
        referencePeriod,
        comparisonPeriod
    );

}



/*
    Convert monthly growth factor
    into yearly factor.

    Example:

    1.0665^12 = 2.16

*/


export function annualFactor(
    growthFactor
) {

    return Math.pow(
        growthFactor,
        12
    );

}



/*
    Annual percentage growth rate.

    Example:

    factor 2.16

    gives

    116%

*/


export function annualGrowthRate(
    growthFactor
) {

    return annualFactor(growthFactor) - 1;

}

/*
    Convert annual price factor into monthly growth factor.
    Example:     2.16 gives 1.0665
*/

export function monthlyFactorFromAnnualFactor(
    annualFactor
) {

    return Math.pow(
        annualFactor,
        1 / 12
    );

}