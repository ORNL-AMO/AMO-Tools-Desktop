import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Settings} from "../../../../shared/models/settings";

@Component({
  selector: 'app-percent-load-estimation-form',
  templateUrl: './percent-load-estimation-form.component.html',
  styleUrls: ['./percent-load-estimation-form.component.css']
})
export class PercentLoadEstimationFormComponent implements OnInit {
  @Input()
  percentLoadEstimationForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  tmpMeasuredSpeed: number;
  tmpNameplateFullLoadSpeed: number;
  tmpSynchronousSpeed: number;

  constructor() { }

  ngOnInit() {
  }

  emitChange() {
    this.percentLoadEstimationForm.patchValue({
      measuredSpeed: this.tmpMeasuredSpeed,
      nameplateFullLoadSpeed: this.tmpNameplateFullLoadSpeed,
      synchronousSpeed: this.tmpSynchronousSpeed
    });
    this.calculate.emit(true);
  }

}
