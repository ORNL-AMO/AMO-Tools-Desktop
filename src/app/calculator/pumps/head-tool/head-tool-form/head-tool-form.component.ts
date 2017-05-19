import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-head-tool-form',
  templateUrl: './head-tool-form.component.html',
  styleUrls: ['./head-tool-form.component.css']
})
export class HeadToolFormComponent implements OnInit {
  @Input()
  headToolForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  smallUnit: string;
  constructor() { }

  ngOnInit() {
    if (this.settings.distanceMeasurement == 'ft') {
      this.smallUnit = 'in'
    } else {
      this.smallUnit = 'mm'
    }
    this.calc();
  }

  calc() {
    if (this.headToolForm.valid) {
      this.calculate.emit(true);
    }
  }

}
