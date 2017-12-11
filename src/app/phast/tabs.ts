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

export interface StepTab {
    step: number,
    tabName: string,
    next?: number,
    back?: number
}