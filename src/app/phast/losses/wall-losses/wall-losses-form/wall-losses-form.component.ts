import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-wall-losses-form',
  templateUrl: './wall-losses-form.component.html',
  styleUrls: ['./wall-losses-form.component.css']
})
export class WallLossesFormComponent implements OnInit {
  @Input()
  wallLossesForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }

  checkForm() {
    if (this.wallLossesForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

}
