import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-head-tool-suction-form',
  templateUrl: './head-tool-suction-form.component.html',
  styleUrls: ['./head-tool-suction-form.component.css']
})
export class HeadToolSuctionFormComponent implements OnInit {
  @Input()
  headToolSuctionForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  smallUnit: string;

  constructor() { }

  ngOnInit() {
    if(this.settings.distanceMeasurement == 'ft'){
      this.smallUnit = 'in'
    }else{
      this.smallUnit = 'mm'
    }
    this.calc();
  }

  calc() {
    if (this.headToolSuctionForm.valid) {
      this.calculate.emit(true);
    }
  }
}
