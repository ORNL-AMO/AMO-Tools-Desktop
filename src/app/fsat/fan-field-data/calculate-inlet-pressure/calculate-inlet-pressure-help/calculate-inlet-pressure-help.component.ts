import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-calculate-inlet-pressure-help',
  templateUrl: './calculate-inlet-pressure-help.component.html',
  styleUrls: ['./calculate-inlet-pressure-help.component.css']
})
export class CalculateInletPressureHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
