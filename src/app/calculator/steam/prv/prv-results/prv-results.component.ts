import { Component, OnInit, Input } from '@angular/core';
import { PrvOutput } from '../../../../shared/models/steam';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-prv-results',
  templateUrl: './prv-results.component.html',
  styleUrls: ['./prv-results.component.css']
})
export class PrvResultsComponent implements OnInit {
  @Input()
  results: PrvOutput;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

}
