import { Component, OnInit, Input } from '@angular/core';
import { MotorInventoryDepartment, MotorPropertyDisplayOptions } from '../../../motor-inventory';

@Component({
  selector: 'app-department-overview',
  templateUrl: './department-overview.component.html',
  styleUrls: ['./department-overview.component.css']
})
export class DepartmentOverviewComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;


  selectedDataTable: string = 'nameplate';
  dataTableOptions: Array<{ label: string, value: string }>;
  constructor() { }

  ngOnInit(): void {
    this.dataTableOptions = [
      {value: 'nameplate', label: 'Nameplate Data'},
      {value: 'loadCharacteristics', label: 'Load Characteristics'}
    ];
    if(this.displayOptions.batchAnalysisOptions.displayBatchAnalysis){
      this.dataTableOptions.push({
        value: 'batchAnalysis', label: 'Replacement Data'
      });
    }
    if(this.displayOptions.manualSpecificationOptions.displayManualSpecifications){
      this.dataTableOptions.push({
        value: 'manualSpecifications', label: 'Manual Specifications'
      });
    }
    if(this.displayOptions.operationDataOptions.displayOperationData){
      this.dataTableOptions.push({
        value: 'operationData', label: 'Operation Data'
      });
    }
    if(this.displayOptions.purchaseInformationOptions.displayPurchaseInformation){
      this.dataTableOptions.push({
        value: 'purchaseInformation', label: 'Purchase Information'
      });
    }
    if(this.displayOptions.torqueOptions.displayTorque){
      this.dataTableOptions.push({
        value: 'torque', label: 'Torque Data'
      });
    }
    if(this.displayOptions.otherOptions.displayOther){
      this.dataTableOptions.push({
        value: 'other', label: 'Other Data'
      });
    }
  }

}
