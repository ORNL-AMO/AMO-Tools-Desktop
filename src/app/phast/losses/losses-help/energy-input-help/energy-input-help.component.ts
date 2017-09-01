import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-energy-input-help',
  templateUrl: './energy-input-help.component.html',
  styleUrls: ['./energy-input-help.component.css']
})
export class EnergyInputHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
