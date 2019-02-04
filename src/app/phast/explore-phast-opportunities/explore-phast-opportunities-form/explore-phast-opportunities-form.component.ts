import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PHAST, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastResultsService } from '../../phast-results.service';
import { LossTab } from '../../tabs';

@Component({
  selector: 'app-explore-phast-opportunities-form',
  templateUrl: './explore-phast-opportunities-form.component.html',
  styleUrls: ['./explore-phast-opportunities-form.component.css']
})
export class ExplorePhastOpportunitiesFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();

  resultsCategories: ShowResultsCategories;

  showCharge: boolean = false;
  showFixture: boolean = false;
  showLeakage: boolean = false;
  showWall: boolean = false;
  showOpening: boolean = false;
  showSlag: boolean = false;
  showCooling: boolean = false;
  showAtmosphere: boolean = false;
  constructor(private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    this.resultsCategories = this.phastResultsService.getResultCategories(this.settings);

    if (this.phast.losses.chargeMaterials && this.phast.losses.chargeMaterials.length != 0) {
      this.showCharge = true;
    }
    if (this.phast.losses.fixtureLosses && this.phast.losses.fixtureLosses.length != 0) {
      this.showFixture = true;
    }
    if (this.phast.losses.leakageLosses && this.phast.losses.leakageLosses.length != 0) {
      this.showLeakage = true;
    }
    if (this.phast.losses.wallLosses && this.phast.losses.wallLosses.length != 0) {
      this.showWall = true;
    }
    if (this.phast.losses.openingLosses && this.phast.losses.openingLosses.length != 0) {
      this.showOpening = true;
    }
    if (this.phast.losses.slagLosses && this.phast.losses.slagLosses.length != 0) {
      this.showSlag = true;
    }
    if (this.phast.losses.atmosphereLosses && this.phast.losses.atmosphereLosses.length != 0) {
      this.showAtmosphere = true;
    }
    if (this.phast.losses.coolingLosses && this.phast.losses.coolingLosses.length != 0) {
      this.showCooling = true;
    }
  }

  ngOnDestroy() {
    if (this.phast.modifications[this.exploreModIndex] && !this.phast.modifications[this.exploreModIndex].phast.name) {
      this.phast.modifications[this.exploreModIndex].phast.name = 'Opportunities Modification';
      this.calculate();
    }
  }


  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitLossTab(tab: LossTab) {
    this.changeTab.emit(tab);
  }

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }
}
