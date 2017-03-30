import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-extended-surface-losses-form',
  templateUrl: './extended-surface-losses-form.component.html',
  styleUrls: ['./extended-surface-losses-form.component.css']
})
export class ExtendedSurfaceLossesFormComponent implements OnInit {
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
