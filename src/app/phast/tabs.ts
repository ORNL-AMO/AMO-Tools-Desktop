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
]

export const specTabs: Array<StepTab> = [
    {
        step: 1,
        tabName: 'System Basics',
        next: 2
    },
    {
        step: 2,
        tabName: 'Operating Hours',
        next: 3,
        back: 1
    },
    {
        step: 3,
        tabName: 'Operating Costs',
        back: 2
    }
]


export interface StepTab {
    step: number,
    tabName: string,
    next?: number,
    back?: number
}

export const defaultTabs: Array<LossTab> = [
    {
        tabName: 'Charge Material',
        step: 1,
        next: 2,
        componentStr: 'charge-material',
        showAdd: true  
    },
    {
        tabName: 'Fixtures, Trays, etc.',
        step: 2,
        next: 3,
        back: 1,
        componentStr: 'fixture-losses',
        showAdd: true  
    },
    {
        tabName: 'Wall',
        step: 3,
        next: 4,
        back: 2,
        componentStr: 'wall-losses',
        showAdd: true  
    },
    {
        tabName: 'Atmosphere',
        step: 4,
        next: 5,
        back: 3,
        componentStr: 'atmosphere-losses',  
    },
    {
        tabName: 'Opening',
        step: 5,
        next: 6,
        back: 4,
        componentStr: 'opening-losses',
        showAdd: true  
    },
    {
        tabName: 'Gas Leakage',
        step: 6,
        next: 7,
        back: 5,
        componentStr: 'gas-leakage-losses',
        showAdd: true  
    },  
    {
        tabName: 'Extended Surface',
        step: 7,
        next: 8,
        back: 6,
        componentStr: 'extended-surface-losses',
        showAdd: true  
    },
    {
        tabName: 'Other',
        step: 8,
        next: 9,
        back: 7,
        componentStr: 'other-losses',
        showAdd: true  
    },

]

export interface LossTab {
    step: number,
    tabName: string,
    next?: number,
    back?: number,
    lastStep?: boolean,
    componentStr: string,
    showAdd?: boolean
}