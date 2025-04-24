import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { WasteWaterResults } from '../../../shared/models/waste-water';
import { WasteWaterService } from '../../waste-water.service';
import { DataTableVariable, DataTableVariables } from '../dataTableVariables';
import { WasteWaterAnalysisService } from '../waste-water-analysis.service';

@Component({
    selector: 'app-waste-water-calculations-table',
    templateUrl: './waste-water-calculations-table.component.html',
    styleUrls: ['./waste-water-calculations-table.component.css'],
    standalone: false
})
export class WasteWaterCalculationsTableComponent implements OnInit {
  @Input()
  containerHeight: number;

  selectedTableData: { name: string, results: WasteWaterResults };
  selectedTableDataSub: Subscription;
  dataTableVariables: Array<DataTableVariable>
  settings: Settings;
  constructor(private wasteWaterService: WasteWaterService, private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    this.dataTableVariables = DataTableVariables;
    this.selectedTableDataSub = this.wasteWaterAnalysisService.selectedTableData.subscribe(val => {
      this.selectedTableData = val;
    });
  }

  ngOnDestroy() {
    this.selectedTableDataSub.unsubscribe();
  }

}
