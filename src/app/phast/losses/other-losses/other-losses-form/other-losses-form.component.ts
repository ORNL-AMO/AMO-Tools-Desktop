import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-other-losses-form',
  templateUrl: './other-losses-form.component.html',
  styleUrls: ['./other-losses-form.component.css']
})
export class OtherLossesFormComponent implements OnInit {
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
