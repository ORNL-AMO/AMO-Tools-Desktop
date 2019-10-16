import { MetalHalideFixtures } from "./metal-halide";
import { HighPressureSodiumFixtures } from "./high-pressure-sodium";
import { HighBayFluorescentFixtures } from "./high-bay-fluorescent";
import { FluorescentXpRetrofitFixtures } from "./fluorescent-xp-retrofit";
import { FluorescentFourFootFixtures } from "./fluorescent-four-foot";
import { FluorescentEightFootFixtures } from "./fluorescent-eight-foot";
import { InductionHighBayFixtures } from "./induction-high-bay";
import { MercuryVaporFixtures } from "./mercury-vapor";
import { HighBayLEDFixtures } from "./high-bay-LED";
import { LEDTroffersFixtures } from "./LED-troffers";

export interface LightingFixtureData {
    category: number,
    type: string,
    lampsPerFixture: number,
    wattsPerLamp: number,
    lumensPerLamp: number,
    lampLife: number,
    coefficientOfUtilization: number,
    ballastFactor: number,
    lumenDegradationFactor: number
}


export const LightingFixtureCategories: Array<{ category: number, label: string, fixturesData: Array<LightingFixtureData> }> = [
    {
        category: 0,
        label: 'Custom',
        fixturesData: []
    },
    {
        category: 1,
        label: 'Metal Halide',
        fixturesData: MetalHalideFixtures
    },
    {
        category: 2,
        label: 'High Pressure Sodium',
        fixturesData: HighPressureSodiumFixtures
    },
    {
        category: 3,
        label: 'High Bay Fluorescent',
        fixturesData: HighBayFluorescentFixtures
    },
    {
        category: 4,
        label: 'Fluorescent XP Retrofit',
        fixturesData: FluorescentXpRetrofitFixtures
    },
    {
        category: 5,
        label: 'Fluorescent 4 ft',
        fixturesData: FluorescentFourFootFixtures
    },
    {
        category: 6,
        label: 'Fluorescent 8 ft',
        fixturesData: FluorescentEightFootFixtures
    },
    {
        category: 7,
        label: 'Induction High Bay',
        fixturesData: InductionHighBayFixtures
    },
    {
        category: 8,
        label: 'Mercury Vapor',
        fixturesData: MercuryVaporFixtures
    },
    {
        category: 9,
        label: 'High Bay LED',
        fixturesData: HighBayLEDFixtures
    },
    {
        category: 10,
        label: 'LED Troffers',
        fixturesData: LEDTroffersFixtures
    }
]