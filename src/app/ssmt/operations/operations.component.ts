import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SSMT } from '../../shared/models/ssmt';
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
  constructor() { }

  ngOnInit() {
  
  }

  save(){
    this.emitSave.emit(true);
  }
}
