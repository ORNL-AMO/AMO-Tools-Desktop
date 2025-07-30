export const CONDENSER_COOLING_METHODS = [
    { value: 0, name: 'Water' },
    { value: 1, name: 'Air' },
] as const;

// * avoid accidental mutation, ex. we pop, shift options
export const getCondenserCoolingMethods = () => {
    return [...CONDENSER_COOLING_METHODS ];
};