import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-metered-fuel-help',
  templateUrl: './metered-fuel-help.component.html',
  styleUrls: ['./metered-fuel-help.component.css']
})
export class MeteredFuelHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  inPreAssessment: boolean;
  constructor() { }

  ngOnInit() {
  }

}
