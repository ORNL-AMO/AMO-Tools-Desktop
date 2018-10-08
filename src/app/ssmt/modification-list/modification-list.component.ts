import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import * as _ from 'lodash';
import { SSMT, Modification } from '../../shared/models/steam/ssmt';
import { SsmtService } from '../ssmt.service';


@Component({
  selector: 'app-modification-list',
  templateUrl: './modification-list.component.html',
  styleUrls: ['./modification-list.component.css']
})
export class ModificationListComponent implements OnInit {
  @Input()
  modificationIndex: number;
  @Input()
  ssmt: SSMT;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Output('close')
  close = new EventEmitter<boolean>();

  newModificationName: string;
  dropdown: Array<boolean>;
  rename: Array<boolean>;
  deleteArr: Array<boolean>;
  assessmentTab: string;
  assessmentTabSubscription: Subscription;
  constructor(private compareService: CompareService, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.initDropdown();
    this.assessmentTabSubscription = this.ssmtService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })
  }

  ngOnDestroy() {
    this.assessmentTabSubscription.unsubscribe();
  }

  initDropdown() {
    this.dropdown = Array<boolean>(this.ssmt.modifications.length);
    this.rename = Array<boolean>(this.ssmt.modifications.length);
    this.deleteArr = Array<boolean>(this.ssmt.modifications.length);
  }
  selectModification(index: number, close?: boolean) {
    this.compareService.setCompareVals(this.ssmt, index);
    this.initDropdown()
    if (close) {
      this.close.emit(true);
    }
  }

  goToModification(index: number, componentStr: string) {
    this.ssmtService.steamModelTab.next(componentStr);
    this.selectModification(index, true);
  }
  selectModificationBadge(modifiction: SSMT, index: number) {
    let testBadges = this.getBadges(modifiction);
    if (testBadges.length == 1) {
      this.goToModification(index, testBadges[0].componentStr);
    } else {
      this.goToModification(index, 'operations')
    }
  }
  getBadges(modification: SSMT) {
    if (modification) {
      return this.compareService.getBadges(this.ssmt, modification);
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
    this.ssmt.modifications.splice(index, 1);
    this.rename.splice(index, 1);
    this.dropdown.splice(index, 1);
    this.deleteArr.splice(index, 1);
    if (this.ssmt.modifications.length == 0) {
      this.compareService.setCompareVals(this.ssmt, 0);
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

  addNewModification(ssmt?: SSMT) {
    if (ssmt) {
      this.newModificationName = ssmt.name;
      let testName = _.filter(this.ssmt.modifications, (mod) => { return mod.ssmt.name.includes(this.newModificationName) });
      if (testName) {
        this.newModificationName = this.newModificationName + '(' + testName.length + ')';
      }
    }

    if (!ssmt) {
      ssmt = this.ssmt;
    }
    let ssmtCopy: SSMT = (JSON.parse(JSON.stringify(this.ssmt)));
    let tmpModification: Modification = {
      ssmt: ssmtCopy,
      exploreOpportunities: (this.assessmentTab == 'explore-opportunities')
    }
    ssmtCopy.name = this.newModificationName;
    this.dropdown.push(false);
    this.rename.push(false);
    this.deleteArr.push(false);
    this.ssmt.modifications.push(tmpModification);
    this.save.emit(true);
    this.selectModification(this.ssmt.modifications.length - 1);
    this.newModificationName = undefined;
  }

}
