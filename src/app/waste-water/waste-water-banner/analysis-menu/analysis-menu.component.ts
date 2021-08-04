import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterResults } from '../../../shared/models/waste-water';
import { DataTableVariable } from '../../waste-water-analysis/dataTableVariables';
import { AnalysisGraphItem, WasteWaterAnalysisService } from '../../waste-water-analysis/waste-water-analysis.service';

@Component({
  selector: 'app-analysis-menu',
  templateUrl: './analysis-menu.component.html',
  styleUrls: ['./analysis-menu.component.css']
})
export class AnalysisMenuComponent implements OnInit {

  analysisTab: string;
  analysisTabSub: Subscription;
  analysisGraphItemsSub: Subscription;
  analysisGraphItems: Array<AnalysisGraphItem>;
  analysisXAxisVariables: Array<DataTableVariable>;
  showGraphDropdown: boolean = false;
  showTableDropdown: boolean = false;
  showXAxisDropdown: boolean = false;
  baselineResults: WasteWaterResults;
  modificationsResultsArr: Array<{
    name: string,
    results: WasteWaterResults,
  }>;
  selectedTableData: {
    name: string,
    results: WasteWaterResults,
  };
  selectedTableDataSub: Subscription;
  constructor(private wasteWaterAnalysisService: WasteWaterAnalysisService) { }

  ngOnInit(): void {
    this.analysisTabSub = this.wasteWaterAnalysisService.analysisTab.subscribe(val => {
      this.analysisTab = val;
    });

    this.analysisGraphItemsSub = this.wasteWaterAnalysisService.analysisGraphItems.subscribe(val => {
      this.analysisGraphItems = val;
      this.analysisXAxisVariables = this.wasteWaterAnalysisService.analysisXAxisVariables.getValue();
    });

    this.selectedTableDataSub = this.wasteWaterAnalysisService.selectedTableData.subscribe(val => {
      this.selectedTableData = val;
    });

    this.baselineResults = this.wasteWaterAnalysisService.baselineResults;
    this.modificationsResultsArr = this.wasteWaterAnalysisService.modificationsResultsArr;
  }

  ngOnDestroy() {
    this.analysisTabSub.unsubscribe();
    this.analysisGraphItemsSub.unsubscribe();
    this.selectedTableDataSub.unsubscribe();
  }

  changeTab(str: string) {
    this.wasteWaterAnalysisService.analysisTab.next(str);
  }

  toggleGraphDropdown() {
    this.showGraphDropdown = !this.showGraphDropdown;
  }

  toggleXAxisDropdown() {
    this.showXAxisDropdown = !this.showXAxisDropdown;
  }

  toggleTableDropdown() {
    this.showTableDropdown = !this.showTableDropdown;
  }

  toggleSelected(analysisGraphItem: AnalysisGraphItem) {
    analysisGraphItem.selected = !analysisGraphItem.selected;
    this.wasteWaterAnalysisService.analysisGraphItems.next(this.analysisGraphItems);
  }

  toggleSelectedXAxis(selectedXVariable: DataTableVariable) {
    selectedXVariable.selected = true;
    this.analysisXAxisVariables.forEach(x => {
      if (x.name != selectedXVariable.name) {
        x.selected = false;
      }
    });
    this.wasteWaterAnalysisService.analysisXAxisVariables.next(this.analysisXAxisVariables);
    this.wasteWaterAnalysisService.setGraphData(selectedXVariable);
    this.toggleXAxisDropdown()
  }

  selectTableData(name: string, results: WasteWaterResults) {
    this.wasteWaterAnalysisService.selectedTableData.next({
      name: name,
      results: results
    });
  }


}
