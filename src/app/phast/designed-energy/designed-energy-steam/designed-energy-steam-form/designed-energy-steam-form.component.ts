import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergySteam } from '../../../../shared/models/phast/designedEnergy';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-designed-energy-steam-form',
  templateUrl: './designed-energy-steam-form.component.html',
  styleUrls: ['./designed-energy-steam-form.component.css']
})
export class DesignedEnergySteamFormComponent implements OnInit {
  @Input()
  inputs: DesignedEnergySteam;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  counter: any;

  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate() {
    this.startSavePolling();
    this.emitCalculate.emit(true);
  }

  startSavePolling() {
    this.emitSave.emit(true);
  }
}
