import { trigger, state, style, transition, animate } from "@angular/animations";

export const collapseAnimation = [
    trigger('collapsed', [
        state('open', style({
            height: 500,
            opacity: 100
        })),
        state('closed', style({
            height: 0,
            opacity: 0
        })),
        transition('closed => open', animate('.5s ease-in')),
        transition('open => closed', animate('.5s ease-out'))
    ])
]