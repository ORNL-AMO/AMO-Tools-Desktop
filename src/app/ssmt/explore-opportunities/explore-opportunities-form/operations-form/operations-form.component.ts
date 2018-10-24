import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SsmtService } from '../../../ssmt.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';

@Component({
  selector: 'app-operations-form',
  templateUrl: './operations-form.component.html',
  styleUrls: ['./operations-form.component.css']
})
export class OperationsFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();

  showHoursPerYear: boolean = false;
  showOperationsData: boolean = false;
  showMakeupWaterTemp: boolean = false;
  showUnitCosts: boolean = false;
  showElectricityCost: boolean = false;
  showFuelCost: boolean = false;
  showMakeupWaterCost: boolean = false;

  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit() {
    this.initGeneralOperations();
    this.initOperatingCosts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.showHoursPerYear = false;
        this.showOperationsData = false;
        this.showMakeupWaterTemp = false;
        this.showUnitCosts = false;
        this.showElectricityCost = false;
        this.showFuelCost = false;
        this.showMakeupWaterCost = false;
        this.initGeneralOperations();
        this.initOperatingCosts();

      }
    }
  }

  //General Operations Functions
  initOperatingHours() {
    if (this.ssmt.operatingHours.hoursPerYear != this.ssmt.modifications[this.exploreModIndex].ssmt.operatingHours.hoursPerYear) {
      this.showHoursPerYear = true;
    } else {
      this.showHoursPerYear = false;
    }
  }

  initMakeupWaterTemp() {
    if (this.ssmt.generalSteamOperations.makeUpWaterTemperature != this.ssmt.modifications[this.exploreModIndex].ssmt.generalSteamOperations.makeUpWaterTemperature) {
      this.showMakeupWaterTemp = true;
    } else {
      this.showMakeupWaterTemp = false;
    }
  }

  initGeneralOperations() {
    this.initOperatingHours();
    this.initMakeupWaterTemp();
    if (this.showHoursPerYear || this.showMakeupWaterTemp) {
      this.showOperationsData = true;
    } else {
      this.showOperationsData = false;
    }
  }

  toggleOperationsData() {
    if (this.showOperationsData == false) {
      this.showMakeupWaterTemp = false;
      this.showHoursPerYear = false;
      this.toggleHoursPerYear();
      this.toggleMakeupWaterTemp();
    }
  }

  toggleHoursPerYear() {
    if (this.showHoursPerYear == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.operatingHours.hoursPerYear = this.ssmt.operatingHours.hoursPerYear;
      this.save();
    }
  }

  toggleMakeupWaterTemp() {
    if (this.showMakeupWaterTemp == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.generalSteamOperations.makeUpWaterTemperature = this.ssmt.generalSteamOperations.makeUpWaterTemperature;
      this.save();
    }
  }

  setBaselineOperatingHours() {
    this.ssmt.operatingHours.isCalculated = false;
    this.save()
  }

  setModificationOperatingHours() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.operatingHours.isCalculated = false;
    this.save();
  }

  //Operating Costs functions
  initOperatingCosts() {
    this.initFuelCosts();
    this.initElectricityCost();
    this.initMakeupWaterCost();
    if(this.showFuelCost || this.showElectricityCost || this.showMakeupWaterCost){
      this.showUnitCosts = true;
    }
  }

  initFuelCosts() {
    if (this.ssmt.operatingCosts.fuelCost != this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.fuelCost) {
      this.showFuelCost = true;
    } else {
      this.showFuelCost = false;
    }
  }

  initElectricityCost() {
    if (this.ssmt.operatingCosts.electricityCost != this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.electricityCost) {
      this.showElectricityCost = true;
    } else {
      this.showElectricityCost = false;
    }
  }

  initMakeupWaterCost() {
    if (this.ssmt.operatingCosts.makeUpWaterCost != this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.makeUpWaterCost) {
      this.showMakeupWaterCost = true;
    } else {
      this.showMakeupWaterCost = false;
    }
  }

  toggleFuelCost() {
    if (this.showFuelCost == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.fuelCost = this.ssmt.operatingCosts.fuelCost;
      this.save();
    }
  }
  toggleMakeupWaterCost() {
    if (this.showMakeupWaterTemp == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.makeUpWaterCost = this.ssmt.operatingCosts.makeUpWaterCost;
      this.save();
    }
  }
  toggleElectricityCost() {
    if (this.showElectricityCost == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.operatingCosts.electricityCost = this.ssmt.operatingCosts.electricityCost;
      this.save();
    }
  }

  toggleUnitCosts() {
    if(this.showUnitCosts == false){
      this.showElectricityCost = false;
      this.showMakeupWaterCost = false;
      this.showFuelCost = false;
      this.toggleElectricityCost();
      this.toggleMakeupWaterCost();
      this.toggleFuelCost();
    }
  }


  save() {
    this.emitSave.emit(this.ssmt);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('operations');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('operations');
    // this.exploreOpportunitiesService.currentField.next('default');
  }
}
