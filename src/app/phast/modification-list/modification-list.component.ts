import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PHAST, Modification } from '../../shared/models/phast/phast';
import { PhastCompareService } from '../phast-compare.service';
import { LossesService } from '../losses/losses.service';

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
  @Output('emitSelectModification')
  emitSelectModification = new EventEmitter<PHAST>();
  @Output('save')
  save = new EventEmitter<boolean>();

  newModificationName: string;
  dropdown: Array<boolean>;
  rename: Array<boolean>;
  deleteArr: Array<boolean>;
  constructor(private phastCompareService: PhastCompareService, private lossesService: LossesService) { }

  ngOnInit() {
    this.dropdown = Array<boolean>(this.phast.modifications.length);
    this.rename = Array<boolean>(this.phast.modifications.length);
    this.deleteArr = Array<boolean>(this.phast.modifications.length);
  }


  selectModification(index: number) {
    // this.phastCompareService.selectedModification.next(mod);
    this.phastCompareService.setCompareVals(this.phast, index);
    this.lossesService.updateTabs.next(true);
  }

  getBadges(modification: PHAST) {
    if (modification) {
      return this.phastCompareService.getBadges(this.phast, modification);
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
    this.phast.modifications.splice(index, 1);
    this.rename.splice(index, 1);
    this.dropdown.splice(index, 1);
    this.deleteArr.splice(index, 1);
    if (this.phast.modifications.length == 0) {
      this.phastCompareService.setCompareVals(this.phast, 0);
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

  addNewModification() {
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
      }
    }
    tmpModification.phast.losses = (JSON.parse(JSON.stringify(this.phast.losses)));
    tmpModification.phast.operatingCosts = (JSON.parse(JSON.stringify(this.phast.operatingCosts)));
    tmpModification.phast.operatingHours = (JSON.parse(JSON.stringify(this.phast.operatingHours)));
    tmpModification.phast.systemEfficiency = (JSON.parse(JSON.stringify(this.phast.systemEfficiency)));
    this.dropdown.push(false);
    this.rename.push(false);
    this.deleteArr.push(false);
    this.phast.modifications.push(tmpModification);
    this.save.emit(true);
    this.selectModification(this.phast.modifications.length - 1);
  }
}
