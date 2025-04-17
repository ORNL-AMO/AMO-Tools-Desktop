import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-fan-setup-help',
    templateUrl: './fan-setup-help.component.html',
    styleUrls: ['./fan-setup-help.component.css'],
    standalone: false
})
export class FanSetupHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
