import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-wall-losses-form',
  templateUrl: './wall-losses-form.component.html',
  styleUrls: ['./wall-losses-form.component.css']
})
export class WallLossesFormComponent implements OnInit {
  @Input()
  wallLossesForm: any;
  @Output('calculateBaseline')
  calculate = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }

  checkBaseline() {
    if (this.wallLossesForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

}
