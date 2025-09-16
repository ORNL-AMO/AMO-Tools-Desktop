import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-energy-use-help',
    templateUrl: './energy-use-help.component.html',
    styleUrls: ['./energy-use-help.component.css'],
    standalone: false
})
export class EnergyUseHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
