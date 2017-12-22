import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-nema-energy-efficiency-help',
  templateUrl: './nema-energy-efficiency-help.component.html',
  styleUrls: ['./nema-energy-efficiency-help.component.css']
})
export class NemaEnergyEfficiencyHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
