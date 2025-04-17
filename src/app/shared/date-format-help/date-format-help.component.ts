import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-date-format-help',
    templateUrl: './date-format-help.component.html',
    styleUrls: ['./date-format-help.component.css'],
    animations: [
        trigger('collapse', [
            state('true', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
            state('false', style({ height: '0', visibility: 'hidden' })),
            transition('false => true', animate(200 + 'ms ease-in')),
            transition('true => false', animate(200 + 'ms ease-out'))
        ])
    ],
    standalone: false
})
export class DateFormatHelpComponent implements OnInit, OnChanges {
  @Input()
  forceShowHelp: boolean;

  showDateHelpDrawer: boolean = false;

  constructor() {

  }

  ngOnInit(): void {
    
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes.forceShowHelp && !changes.forceShowHelp.firstChange 
      && changes.forceShowHelp.currentValue === true) {
      this.showDateHelpDrawer = true;
    }
  }

  toggleDateAndTimeHelp() {
    this.showDateHelpDrawer = !this.showDateHelpDrawer;
  }
}
