import { Component, OnInit, Input } from '@angular/core';
import { PhastResultsData } from '../report-rollup.service';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-phast-rollup',
  templateUrl: './phast-rollup.component.html',
  styleUrls: ['./phast-rollup.component.css']
})
export class PhastRollupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phastResults: Array<PhastResultsData>;

  constructor() { }

  ngOnInit() {

  }
}
