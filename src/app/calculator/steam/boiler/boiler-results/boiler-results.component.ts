import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerOutput } from '../../../../shared/models/steam';
@Component({
  selector: 'app-boiler-results',
  templateUrl: './boiler-results.component.html',
  styleUrls: ['./boiler-results.component.css']
})
export class BoilerResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: BoilerOutput;
  constructor() { }

  ngOnInit() {
  }

}
