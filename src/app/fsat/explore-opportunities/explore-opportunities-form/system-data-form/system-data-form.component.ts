import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-system-data-form',
  templateUrl: './system-data-form.component.html',
  styleUrls: ['./system-data-form.component.css']
})
export class SystemDataFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;


  // showSystemData: boolean = false;
  // showCost: boolean = false;
  // showFlowRate: boolean = false;
  // showOperatingFraction: boolean = false;
  // showHead: boolean = false;
  // showName: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
