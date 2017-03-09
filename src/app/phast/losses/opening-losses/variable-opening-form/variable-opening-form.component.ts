import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-variable-opening-form',
  templateUrl: './variable-opening-form.component.html',
  styleUrls: ['./variable-opening-form.component.css']
})
export class VariableOpeningFormComponent implements OnInit {
  @Input()
  openingLossesForm: any;
  constructor() { }

  ngOnInit() {
  }

}
