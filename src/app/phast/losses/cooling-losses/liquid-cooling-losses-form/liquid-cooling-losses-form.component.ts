import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-liquid-cooling-losses-form',
  templateUrl: './liquid-cooling-losses-form.component.html',
  styleUrls: ['./liquid-cooling-losses-form.component.css']
})
export class LiquidCoolingLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  constructor() { }

  ngOnInit() {
  }

  checkForm(){
    this.lossState.saved = false;
    if(this.lossesForm.status == 'VALID'){
      this.calculate.emit(true)
    }
  }


}
