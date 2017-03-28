import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-water-cooling-losses-form',
  templateUrl: './water-cooling-losses-form.component.html',
  styleUrls: ['./water-cooling-losses-form.component.css']
})
export class WaterCoolingLossesFormComponent implements OnInit {
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
