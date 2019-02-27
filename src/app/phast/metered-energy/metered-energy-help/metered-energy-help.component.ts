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
  calcType: string;
  @Input()
  currentEnergySourceType: string;
  @Input()
  currentAssessmentType: string;
  @Input()
  showElectricity: boolean;
  @Input()
  showSteam: boolean;
  @Input()
  showFuel: boolean;
  @Input()
  showDescription: boolean;

  constructor() { }

  ngOnInit() {
  }
  ngOnChanges() {
    if (this.calcType !== 'pump') {
      this.showDescription = true;
    } else {
      this.showDescription = false;
    }

    if (this.currentEnergySourceType === 'Electricity') {
      this.showElectricity = true;
      this.showSteam = false;
      this.showFuel = false;
    } else if (this.currentEnergySourceType === 'Fuel') {
      this.showElectricity = false;
      this.showSteam = false;
      this.showFuel = true;
    } else if (this.currentEnergySourceType === 'Steam') {
      this.showElectricity = false;
      this.showSteam = true;
      this.showFuel = false;
    } else if (this.currentEnergySourceType === 'Hybrid') {
      if (this.currentField !== 'kwRating') {
        this.showElectricity = false;
        this.showSteam = false;
        this.showFuel = true;
      } else {

        this.showElectricity = true;
        this.showSteam = false;
        this.showFuel = false;
      }
    }
  }
  }
