import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-wall-losses-adjustment-form',
  templateUrl: './wall-losses-adjustment-form.component.html',
  styleUrls: ['./wall-losses-adjustment-form.component.css']
})
export class WallLossesAdjustmentFormComponent implements OnInit {
  @Input()
  adjustmentForm: any;
  @Output('calculateBaseline')
  calculate = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }

  checkBaseline() {
    if (this.adjustmentForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

}
