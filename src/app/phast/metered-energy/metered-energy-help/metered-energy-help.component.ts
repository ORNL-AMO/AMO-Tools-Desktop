import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-metered-energy-help',
  templateUrl: './metered-energy-help.component.html',
  styleUrls: ['./metered-energy-help.component.css']
})
export class MeteredEnergyHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  inPreAssessment: boolean;
  @Input()
  showSteam: boolean;
  @Input()
  showElectricity: boolean;
  @Input()
  showFuel: boolean;
  

  constructor() { }

  ngOnInit() {
  }

  setField(str: string) {
    this.currentField = str;
  }
}
