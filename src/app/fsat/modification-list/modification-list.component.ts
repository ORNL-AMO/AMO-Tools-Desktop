import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FSAT, Modification } from '../../shared/models/fans';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { FsatService } from '../fsat.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-modification-list',
  templateUrl: './modification-list.component.html',
  styleUrls: ['./modification-list.component.css']
})
export class ModificationListComponent implements OnInit {
  @Input()
  modificationIndex: number;
  @Input()
  fsat: FSAT;
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
  constructor(private compareService: CompareService, private fsatService: FsatService) { }

  ngOnInit() {
    this.initDropdown();
    // this.assessmentTabSubscription = this.fsatService.secondaryTab.subscribe(val => {
    //   this.asssessmentTab = val;
    // })
  }

  ngOnDestroy() {
    //this.assessmentTabSubscription.unsubscribe();
  }

  initDropdown() {
    this.dropdown = Array<boolean>(this.fsat.modifications.length);
    this.rename = Array<boolean>(this.fsat.modifications.length);
    this.deleteArr = Array<boolean>(this.fsat.modifications.length);
  }
  selectModification(index: number, close?: boolean) {
    this.compareService.setCompareVals(this.fsat, index);
    //this.fsatService.getResults.next(true);
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
    //this.fsatService.modifyConditionsTab.next(componentStr);
    this.selectModification(index, true);
  }
   selectModificationBadge(modifiction: FSAT, index: number) {
  //   let testBadges = this.getBadges(modifiction);
    // if (testBadges.length == 1) {
    //   this.goToModification(index, testBadges[0].componentStr);
     //} else {
       //this.goToModification(index, 'field-data')
     //}
     this.goToModification(index, 'field-data')     
   }
  // getBadges(modification: FSAT) {
  //   if (modification) {
  //     return this.compareService.getBadges(this.fsat, modification);
  //   } else {
  //     return []
  //   }
  // }

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
    this.fsat.modifications.splice(index, 1);
    this.rename.splice(index, 1);
    this.dropdown.splice(index, 1);
    this.deleteArr.splice(index, 1);
    if (this.fsat.modifications.length == 0) {
      this.compareService.setCompareVals(this.fsat, 0);
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

  addNewModification(fsat?: FSAT) {
    if (fsat) {
      this.newModificationName = fsat.name;
      let testName = _.filter(this.fsat.modifications, (mod) => { return mod.fsat.name.includes(this.newModificationName) });
      if (testName) {
        this.newModificationName = this.newModificationName + '(' + testName.length + ')';
      }
    }

    if (!fsat) {
      fsat = this.fsat;
    }
    let tmpModification: Modification = {
      fsat: {
        name: this.newModificationName,
        notes: {
          fieldDataNotes: '',
          fanMotorNotes: '',
          fanSetupNotes: '',
          fluidNotes: ''
        }
      }
    }
    // if (this.asssessmentTab == 'explore-opportunities') {
    //   tmpModification.exploreOpportunities = true;
    // }
    let fsatCopy: FSAT = (JSON.parse(JSON.stringify(this.fsat)));
    tmpModification.fsat.baseGasDensity = fsatCopy.baseGasDensity;
    tmpModification.fsat.fanMotor = fsatCopy.fanMotor;
    tmpModification.fsat.fanSetup = fsatCopy.fanSetup;
    tmpModification.fsat.fieldData = fsatCopy.fieldData;
    this.dropdown.push(false);
    this.rename.push(false);
    this.deleteArr.push(false);
    this.fsat.modifications.push(tmpModification);
    this.save.emit(true);
    this.selectModification(this.fsat.modifications.length - 1);
    this.newModificationName = undefined;
  }

}
