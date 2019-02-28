import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-designed-energy-help',
  templateUrl: './designed-energy-help.component.html',
  styleUrls: ['./designed-energy-help.component.css']
})
export class DesignedEnergyHelpComponent implements OnInit {
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
}
