import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

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
  ]
})
export class DateFormatHelpComponent implements OnInit {
  showDateHelpDrawer: boolean = false;

  constructor() {

  }
  
  ngOnInit(): void {
  }

  toggleDateAndTimeHelp() {
    this.showDateHelpDrawer = !this.showDateHelpDrawer;
  }
}
