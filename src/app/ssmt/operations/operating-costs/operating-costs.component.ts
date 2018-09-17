import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OperatingCosts } from '../../../shared/models/operations';
import { Settings } from 'electron';

@Component({
  selector: 'app-operating-costs',
  templateUrl: './operating-costs.component.html',
  styleUrls: ['./operating-costs.component.css']
})
export  class OperatingCostsComponent implements OnInit {
  @Input()
  operatingCosts: OperatingCosts;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }

  save(){
    this.emitSave.emit(true);
  }
}
