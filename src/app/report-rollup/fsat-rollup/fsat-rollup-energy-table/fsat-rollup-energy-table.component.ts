import { Component, OnInit, Input } from '@angular/core';
import { FsatResultsData } from '../../report-rollup.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-fsat-rollup-energy-table',
  templateUrl: './fsat-rollup-energy-table.component.html',
  styleUrls: ['./fsat-rollup-energy-table.component.css']
})
export class FsatRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  resultData: Array<FsatResultsData>;
  @Input()
  totalEnergyUse: number;
  @Input()
  totalCost: number;
  @Input()
  graphColors: Array<string>;

  constructor() { }

  ngOnInit() {
  }

}
