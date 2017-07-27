import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-metered-energy',
  templateUrl: './metered-energy.component.html',
  styleUrls: ['./metered-energy.component.css']
})
export class MeteredEnergyComponent implements OnInit {
  @Input()
  settings: Settings;

  // energyType: string = 'steam';

  constructor() { }

  ngOnInit() {
  }

}
