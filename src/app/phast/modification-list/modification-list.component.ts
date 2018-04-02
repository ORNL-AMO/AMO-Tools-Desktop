import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Modification } from '../../shared/models/psat';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastCompareService } from '../phast-compare.service';

@Component({
  selector: 'app-modification-list',
  templateUrl: './modification-list.component.html',
  styleUrls: ['./modification-list.component.css']
})
export class ModificationListComponent implements OnInit {
  @Input()
  modifications: Array<Modification>;
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
  constructor(private phastCompareService: PhastCompareService) { }

  ngOnInit() {
    this.dropdown = Array<boolean>(this.modifications.length);
    this.rename = Array<boolean>(this.modifications.length);
    this.deleteArr = Array<boolean>(this.modifications.length);
  }


  selectModification(mod: PHAST) {
    this.emitSelectModification.emit(mod);
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

  renameMod(index: number){
    this.dropdown[index] = false;
    if (!this.rename[index]) {
      this.rename[index] = true;
    } else {
      this.rename[index] = false;
    }
  }

  deleteMod(index: number){
    this.dropdown[index] = false;
    if (!this.deleteArr[index]) {
      this.deleteArr[index] = true;
    } else {
      this.deleteArr[index] = false;
    }
  }

  saveUpdates(index: number){
    this.save.emit(true);
    this.renameMod(index);
  }
}
