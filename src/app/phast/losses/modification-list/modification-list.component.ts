import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Modification } from '../../../shared/models/psat';

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
  @Output('emitSelectModification')
  emitSelectModification = new EventEmitter<number>();
  constructor() { }

  ngOnInit() {
  }


  selectModification(num: number){
    this.emitSelectModification.emit(num);
  }
}
