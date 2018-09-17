import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-energy-costs',
  templateUrl: './energy-costs.component.html',
  styleUrls: ['./energy-costs.component.css']
})
export class EnergyCostsComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {

  }

  startSavePolling() {
    this.save.emit(true);
  }
}
