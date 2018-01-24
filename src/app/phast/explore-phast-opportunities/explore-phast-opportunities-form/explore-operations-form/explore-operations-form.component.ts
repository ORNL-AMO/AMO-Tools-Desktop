import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-explore-operations-form',
  templateUrl: './explore-operations-form.component.html',
  styleUrls: ['./explore-operations-form.component.css']
})
export class ExploreOperationsFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;

  showOperations: boolean = false;
  showOpHours: boolean = false;
  showFuelCosts: boolean = false;
  showSteamCosts: boolean = false;
  showElectricityCosts: boolean = false;
  constructor() { }

  ngOnInit() {
    this.initElectricityCosts();
    this.initSteamCosts();
    this.initFuelCosts();
    this.initOpHours();
    if (this.showElectricityCosts || this.showFuelCosts || this.showSteamCosts || this.showOpHours) {
      this.showOperations = true;
    }
  }

  initElectricityCosts() {
    if (this.phast.operatingCosts.electricityCost != this.phast.modifications[this.exploreModIndex].phast.operatingCosts.electricityCost) {
      this.showElectricityCosts = true;
    }
  }

  initSteamCosts() {
    if (this.phast.operatingCosts.steamCost != this.phast.modifications[this.exploreModIndex].phast.operatingCosts.steamCost) {
      this.showSteamCosts = true;
    }
  }

  initFuelCosts() {
    if (this.phast.operatingCosts.fuelCost != this.phast.modifications[this.exploreModIndex].phast.operatingCosts.fuelCost) {
      this.showFuelCosts = true;
    }
  }

  initOpHours() {
    if (this.phast.operatingHours.hoursPerYear != this.phast.modifications[this.exploreModIndex].phast.operatingHours.hoursPerYear) {
      this.showOpHours = true;
    }
  }

  toggleElectricityCosts() {
    if (this.showElectricityCosts == false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingCosts.electricityCost = this.phast.operatingCosts.electricityCost;
    }
  }

  toggleSteamCosts() {
    if (this.showSteamCosts == false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingCosts.steamCost = this.phast.operatingCosts.steamCost;
    }
  }

  toggleFuelCosts() {
    if (this.showFuelCosts == false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingCosts.fuelCost = this.phast.operatingCosts.fuelCost;
    }
  }

  toggleOpHours() {
    if (this.showOpHours == false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingHours.hoursPerYear = this.phast.operatingHours.hoursPerYear;
    }
  }

  toggleOperations() {
    if (this.showOperations == false) {
      this.showOpHours = false;
      this.showElectricityCosts = false;
      this.showSteamCosts = false;
      this.showFuelCosts = false;
      this.toggleOpHours();
      this.toggleFuelCosts();
      this.toggleSteamCosts();
      this.toggleElectricityCosts();
    }
  }

  focusField(str: string) {
    //this.changeField.emit(str);
  }

  calculate() {
    //this.emitCalculate.emit(true);
  }

  focusOut() {

  }
}
