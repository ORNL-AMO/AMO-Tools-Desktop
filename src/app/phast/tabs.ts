export const stepTabs: Array<StepTab> = [
    {
        step: 1,
        tabName: 'Assessment Settings',
        next: 2
    },
    {
        step: 2,
        tabName: 'Heat Balance',
        next: 3,
        back: 1
    },
    {
        step: 3,
        tabName: 'Aux Equipment',
        next: 4,
        back: 2
    },
    {
        step: 4,
        tabName: 'Design Energy Use',
        next: 5,
        back: 3
    },
    {
        step: 5,
        tabName: 'Metered Energy',
        back: 4
    }
];

export const specTabs: Array<StepTab> = [
    {
        step: 1,
        tabName: 'Baseline'
    }
    // {
    //     step: 2,
    //     tabName: 'Operating Hours',
    //     next: 3,
    //     back: 1
    // },
    // {
    //     step: 3,
    //     tabName: 'Operating Costs',
    //     back: 2
    // }
];


export interface StepTab {
    step: number;
    tabName: string;
    next?: number;
    back?: number;
}

export const defaultTabs: Array<LossTab> = [
    // {
    //     tabName: 'Charge Material',
    //     componentStr: 'charge-material',
    //     showAdd: true  
    // },
    {
        tabName: 'Fixtures, Trays, etc.',
        componentStr: 'fixture-losses',
        showAdd: true  
    },
    {
        tabName: 'Wall',
        componentStr: 'wall-losses',
        showAdd: true  
    },
    {
        tabName: 'Cooling',
        componentStr: 'cooling-losses',  
        showAdd: true
    },
    {
        tabName: 'Atmosphere',
        componentStr: 'atmosphere-losses',  
    },
    {
        tabName: 'Opening',
        componentStr: 'opening-losses',
        showAdd: true  
    },
    {
        tabName: 'Gas Leakage',
        componentStr: 'gas-leakage-losses',
        showAdd: true  
    },  
    {
        tabName: 'Extended Surface',
        componentStr: 'extended-surface-losses',
        showAdd: true  
    },
    {
        tabName: 'Other',
        componentStr: 'other-losses',
        showAdd: true  
    },

];

export interface LossTab {
    step?: number;
    tabName: string;
    next?: number;
    back?: number;
    lastStep?: boolean;
    componentStr: string;
    showAdd?: boolean;
}
