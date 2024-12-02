import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PHAST, Modification } from '../../shared/models/phast/phast';
import { PhastCompareService } from '../phast-compare.service';
import { LossesService } from '../losses/losses.service';
import { PhastService } from '../phast.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { SavingsOpportunity } from '../../shared/models/explore-opps';
import { getNewIdString } from '../../shared/helperFunctions';

@Component({
  selector: 'app-modification-list',
  templateUrl: './modification-list.component.html',
  styleUrls: ['./modification-list.component.css']
})
export class ModificationListComponent implements OnInit {
  // @Input()
  // modifications: Array<Modification>;
  @Input()
  modificationIndex: number;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Output('close')
  close = new EventEmitter<boolean>();

  newModificationName: string;
  dropdown: Array<boolean>;
  rename: Array<boolean>;
  deleteArr: Array<boolean>;
  asssessmentTab: string;
  assessmentTabSubscription: Subscription;
    constructor(private phastCompareService: PhastCompareService, private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.initDropdown();
    this.assessmentTabSubscription = this.phastService.assessmentTab.subscribe(val => {
      this.asssessmentTab = val;
    });
  }

  initDropdown() {
    this.dropdown = Array<boolean>(this.phast.modifications.length);
    this.rename = Array<boolean>(this.phast.modifications.length);
    this.deleteArr = Array<boolean>(this.phast.modifications.length);
  }

  selectModification(index: number, close?: boolean) {
    this.phastCompareService.setCompareVals(this.phast, index, false);
    this.lossesService.updateTabs.next(true);
    this.initDropdown();
    if (close) {
      this.close.emit(true);
    }
  }

  goToModification(index: number, componentStr: string) {
    let tabs = this.lossesService.lossesTabs;
    let selectedTab = _.find(tabs, (tab) => {
      return tab.componentStr === componentStr;
    });
    this.lossesService.lossesTab.next(selectedTab.step);
    this.selectModification(index, true);
  }

  selectModificationBadge(modifiction: PHAST, index: number) {
    let testBadges = this.getBadges(modifiction);
    if (testBadges.length === 1) {
      this.goToModification(index, testBadges[0].componentStr);
    } else {
      this.goToModification(index, 'operations');
    }
  }

  getBadges(modification: PHAST) {
    if (modification) {
      return this.phastCompareService.getBadges(this.phast, modification);
    } else {
      return [];
    }
  }

  showDropdown(index: number) {
    if (!this.dropdown[index]) {
      this.dropdown[index] = true;
    } else {
      this.dropdown[index] = false;
    }
  }

  renameMod(index: number) {
    this.dropdown[index] = false;
    if (!this.rename[index]) {
      this.rename[index] = true;
    } else {
      this.rename[index] = false;
    }
  }

  deleteMod(index: number) {
    this.dropdown[index] = false;
    if (!this.deleteArr[index]) {
      this.deleteArr[index] = true;
    } else {
      this.deleteArr[index] = false;
    }
  }

  deleteModification(index: number) {
    this.phast.modifications.splice(index, 1);
    this.rename.splice(index, 1);
    this.dropdown.splice(index, 1);
    this.deleteArr.splice(index, 1);
    if (this.phast.modifications.length === 0) {
      this.phastCompareService.setCompareVals(this.phast, 0, false);
      this.close.emit(true);
    } else if (index === this.modificationIndex) {
      this.selectModification(0, false);
    } else if (index < this.modificationIndex) {
      this.selectModification(this.modificationIndex - 1, false);
    }
    this.save.emit(true);
  }

  saveUpdates(index: number) {
    this.save.emit(true);
    this.renameMod(index);
  }

  addNewModification(phast?: PHAST) {
    if (phast) {
      this.newModificationName = phast.name;
      let testName = _.filter(this.phast.modifications, (mod) => { return mod.phast.name.includes(this.newModificationName); });
      if (testName) {
        this.newModificationName = this.newModificationName + '(' + testName.length + ')';
      }
    }

    if (!phast) {
      phast = this.phast;
    }
    let exploreOppsDefault: SavingsOpportunity = {hasOpportunity: false, display: ''};
    let tmpModification: Modification = {
      phast: {
        losses: {},
        name: this.newModificationName,
      },
      notes: {
        chargeNotes: '',
        wallNotes: '',
        atmosphereNotes: '',
        fixtureNotes: '',
        openingNotes: '',
        coolingNotes: '',
        flueGasNotes: '',
        otherNotes: '',
        leakageNotes: '',
        extendedNotes: '',
        slagNotes: '',
        auxiliaryPowerNotes: '',
        exhaustGasNotes: '',
        energyInputExhaustGasNotes: '',
        operationsNotes: ''
      },
      id: getNewIdString(),
      exploreOppsShowFlueGas: exploreOppsDefault,
      exploreOppsShowAirTemp: exploreOppsDefault,
      exploreOppsShowMaterial: exploreOppsDefault,
      exploreOppsShowAllTimeOpen: exploreOppsDefault,
      exploreOppsShowOpening: exploreOppsDefault,
      exploreOppsShowAllEmissivity: exploreOppsDefault,
      exploreOppsShowCooling: exploreOppsDefault,
      exploreOppsShowAtmosphere: exploreOppsDefault,
      exploreOppsShowOperations: exploreOppsDefault,
      exploreOppsShowLeakage: exploreOppsDefault,
      exploreOppsShowSlag: exploreOppsDefault,
      exploreOppsShowEfficiencyData: exploreOppsDefault,
      exploreOppsShowWall: exploreOppsDefault,
      exploreOppsShowAllTemp: exploreOppsDefault,
      exploreOppsShowFixtures: exploreOppsDefault,
    };
    if (this.asssessmentTab === 'explore-opportunities') {
      tmpModification.exploreOpportunities = true;
    }
    tmpModification.phast.co2SavingsData = (JSON.parse(JSON.stringify(phast.co2SavingsData)));
    tmpModification.phast.co2SavingsData.userEnteredModificationEmissions = tmpModification.phast.co2SavingsData.userEnteredBaselineEmissions; 
    tmpModification.phast.losses = (JSON.parse(JSON.stringify(phast.losses)));
    tmpModification.phast.operatingCosts = (JSON.parse(JSON.stringify(phast.operatingCosts)));
    tmpModification.phast.operatingHours = (JSON.parse(JSON.stringify(phast.operatingHours)));
    tmpModification.phast.systemEfficiency = (JSON.parse(JSON.stringify(phast.systemEfficiency)));
    this.dropdown.push(false);
    this.rename.push(false);
    this.deleteArr.push(false);
    this.phast.modifications.push(tmpModification);
    this.save.emit(true);
    this.selectModification(this.phast.modifications.length - 1, true);
    this.newModificationName = undefined;
  }

}
