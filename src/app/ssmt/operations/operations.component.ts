import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SSMT } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  idString: string = 'baseline_';
  constructor() { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = 'modification_';
    }
  }

  save() {
    this.emitSave.emit(true);
  }
}
