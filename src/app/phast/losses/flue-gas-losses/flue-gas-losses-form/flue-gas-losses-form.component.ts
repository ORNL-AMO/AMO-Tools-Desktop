import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-flue-gas-losses-form',
  templateUrl: './flue-gas-losses-form.component.html',
  styleUrls: ['./flue-gas-losses-form.component.css']
})
export class FlueGasLossesFormComponent implements OnInit {
  @Input()
  flueGasLossForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  constructor() { }

  ngOnInit() {
  }

  checkForm(){
    this.lossState = false;
    if(this.flueGasLossForm.status == 'VALID'){
      this.calculate.emit(true);
    }
  }

}
