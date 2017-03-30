import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-gas-charge-material-form',
  templateUrl: './gas-charge-material-form.component.html',
  styleUrls: ['./gas-charge-material-form.component.css']
})
export class GasChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  constructor() { }

  ngOnInit() {
  }

  checkForm() {
    this.lossState.saved = false;
    if (this.chargeMaterialForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }
}
