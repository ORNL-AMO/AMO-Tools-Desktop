import { Component, Input, OnInit } from '@angular/core';
import { EffluentEnergyResults } from '../../report-rollup-models';

@Component({
    selector: 'app-effluent-energy-use-table',
    templateUrl: './effluent-energy-use-table.component.html',
    styleUrls: ['./effluent-energy-use-table.component.css'],
    standalone: false
})
export class EffluentEnergyUseTableComponent implements OnInit {

  @Input()
  tableData: Array<EffluentEnergyResults>;
  constructor() { }

  ngOnInit(): void {
  }

}