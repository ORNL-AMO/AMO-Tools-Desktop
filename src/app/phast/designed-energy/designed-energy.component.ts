import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-designed-energy',
  templateUrl: './designed-energy.component.html',
  styleUrls: ['./designed-energy.component.css']
})
export class DesignedEnergyComponent implements OnInit {
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

}
