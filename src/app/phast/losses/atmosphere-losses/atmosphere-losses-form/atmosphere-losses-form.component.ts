import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-atmosphere-losses-form',
  templateUrl: './atmosphere-losses-form.component.html',
  styleUrls: ['./atmosphere-losses-form.component.css']
})
export class AtmosphereLossesFormComponent implements OnInit {
  @Input()
  atmosphereLossForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  constructor() { }

  ngOnInit() {
  }

  checkForm() {
    this.lossState.saved = false;
    if (this.atmosphereLossForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

}
