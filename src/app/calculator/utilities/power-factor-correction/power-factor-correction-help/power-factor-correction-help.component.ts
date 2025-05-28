import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-power-factor-correction-help',
    templateUrl: './power-factor-correction-help.component.html',
    styleUrls: ['./power-factor-correction-help.component.css'],
    standalone: false
})
export class PowerFactorCorrectionHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
