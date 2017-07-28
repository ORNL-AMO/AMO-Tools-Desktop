import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-designed-energy-fuel-help',
  templateUrl: './designed-energy-fuel-help.component.html',
  styleUrls: ['./designed-energy-fuel-help.component.css']
})
export class DesignedEnergyFuelHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
