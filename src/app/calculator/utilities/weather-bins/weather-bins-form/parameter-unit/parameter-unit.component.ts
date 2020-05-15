import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-parameter-unit',
  templateUrl: './parameter-unit.component.html',
  styleUrls: ['./parameter-unit.component.css']
})
export class ParameterUnitComponent implements OnInit {
  @Input()
  parameter: string;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit(): void {
  }

}
