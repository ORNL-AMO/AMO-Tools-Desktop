import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-energy-equivalency-help',
    templateUrl: './energy-equivalency-help.component.html',
    styleUrls: ['./energy-equivalency-help.component.css'],
    standalone: false
})
export class EnergyEquivalencyHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
