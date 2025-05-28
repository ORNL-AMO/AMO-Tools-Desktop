import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-designed-energy-help',
    templateUrl: './designed-energy-help.component.html',
    styleUrls: ['./designed-energy-help.component.css'],
    standalone: false
})
export class DesignedEnergyHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }
}
