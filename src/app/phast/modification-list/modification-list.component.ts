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

  newModificationName: string;
  constructor(private phastCompareService: PhastCompareService) { }

  ngOnInit() {
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
}
