import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-gas-leakage-losses-form',
  templateUrl: './gas-leakage-losses-form.component.html',
  styleUrls: ['./gas-leakage-losses-form.component.css']
})
export class GasLeakageLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  constructor() { }

  ngOnInit() {
  }

  checkForm() {
    this.lossState.saved = false;
    if (this.lossesForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }
}
