import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-designed-energy-electricity-help',
  templateUrl: './designed-energy-electricity-help.component.html',
  styleUrls: ['./designed-energy-electricity-help.component.css']
})
export class DesignedEnergyElectricityHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  inPreAssessment: boolean;
  constructor() { }

  ngOnInit() {
  }

}
