import { Component, Input, OnInit } from '@angular/core';
import { NutrientRemovalResults } from '../../report-rollup-models';

@Component({
  selector: 'app-nutrient-removal-table',
  templateUrl: './nutrient-removal-table.component.html',
  styleUrls: ['./nutrient-removal-table.component.css']
})
export class NutrientRemovalTableComponent implements OnInit {
  @Input()
  tableData: Array<NutrientRemovalResults>;
  constructor() { }

  ngOnInit(): void {
  }

}