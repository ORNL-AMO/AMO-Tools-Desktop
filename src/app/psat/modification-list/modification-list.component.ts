import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { PsatService } from '../psat.service';
import * as _ from 'lodash';
import { Modification } from '../../shared/models/psat';

@Component({
  selector: 'app-modification-list',
  templateUrl: './modification-list.component.html',
  styleUrls: ['./modification-list.component.css']
})
export class ModificationListComponent implements OnInit {
  @Input()
  modificationIndex: number;
  @Input()
  psat: PSAT;
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
  constructor(private compareService: CompareService, private psatService: PsatService) { }

  ngOnInit() {
    this.initDropdown();
    this.assessmentTabSubscription = this.psatService.secondaryTab.subscribe(val => {
      this.asssessmentTab = val;
    })
  }

  ngOnDestroy() {
    this.assessmentTabSubscription.unsubscribe();
  }

  initDropdown() {
    this.dropdown = Array<boolean>(this.psat.modifications.length);
    this.rename = Array<boolean>(this.psat.modifications.length);
    this.deleteArr = Array<boolean>(this.psat.modifications.length);
  }
  selectModification(index: number, close?: boolean) {
    this.compareService.setCompareVals(this.psat, index);
    this.psatService.getResults.next(true);
    this.initDropdown()
    if (close) {
      this.close.emit(true);
    }
  }
  goToModification(index: number, componentStr: string) {
    // let tabs = this.lossesService.lossesTabs;
    // let selectedTab = _.find(tabs, (tab) => {
    //   return tab.componentStr == componentStr;
    // })
    // this.lossesService.lossesTab.next(selectedTab.step);
    this.selectModification(index, true);
  }
  selectModificationBadge(modifiction: PSAT, index: number) {
    let testBadges = this.getBadges(modifiction);
    if (testBadges.length == 1) {
      this.goToModification(index, testBadges[0].componentStr);
    } else {
      this.goToModification(index, 'field-data')
    }
  }
  getBadges(modification: PSAT) {
    if (modification) {
      return this.compareService.getBadges(this.psat, modification);
    } else {
      return []
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
    this.psat.modifications.splice(index, 1);
    this.rename.splice(index, 1);
    this.dropdown.splice(index, 1);
    this.deleteArr.splice(index, 1);
    if (this.psat.modifications.length == 0) {
      this.compareService.setCompareVals(this.psat, 0);
    } else if (index == this.modificationIndex) {
      this.selectModification(0);
    } else if (index < this.modificationIndex) {
      this.selectModification(this.modificationIndex - 1);
    }
    this.save.emit(true);
  }
  saveUpdates(index: number) {
    this.save.emit(true);
    this.renameMod(index);
  }

  addNewModification(psat?: PSAT) {
    if (psat) {
      this.newModificationName = psat.name;
      let testName = _.filter(this.psat.modifications, (mod) => { return mod.psat.name.includes(this.newModificationName) });
      if (testName) {
        this.newModificationName = this.newModificationName + '(' + testName.length + ')';
      }
    }

    if (!psat) {
      psat = this.psat;
    }
    let tmpModification: Modification = {
      psat: {
        name: this.newModificationName,
      },
      notes: {
        fieldDataNotes: '',
        motorNotes: '',
        pumpFluidNotes: '',
        systemBasicsNotes: ''
      },
    }
    if (this.asssessmentTab == 'explore-opportunities') {
      tmpModification.exploreOpportunities = true;
    }
    tmpModification.psat.inputs = (JSON.parse(JSON.stringify(psat.inputs)));
    this.dropdown.push(false);
    this.rename.push(false);
    this.deleteArr.push(false);
    this.psat.modifications.push(tmpModification);
    console.log(this.psat.modifications);
    this.save.emit(true);
    this.selectModification(this.psat.modifications.length - 1);
    this.newModificationName = undefined;
  }

}
