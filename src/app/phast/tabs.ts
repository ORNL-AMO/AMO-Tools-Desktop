export const stepTabs: Array<StepTab> = [
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
        next: 4,
        back: 2
    },
    {
        step: 4,
        tabName: 'Heat Balance',
        next: 5,
        back: 3
    },
    {
        step: 5,
        tabName: 'Aux Equipment',
        next: 6,
        back: 4
    },
    {
        step: 6,
        tabName: 'Design Energy Use',
        next: 7,
        back: 5
    },
    {
        step: 7,
        tabName: 'Metered Energy',
        back: 6
    }
]

export interface StepTab {
    step: number,
    tabName: string,
    next?: number,
    back?: number
}