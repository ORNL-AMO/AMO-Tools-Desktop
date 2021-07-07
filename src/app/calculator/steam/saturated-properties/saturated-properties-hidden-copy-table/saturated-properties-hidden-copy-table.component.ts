import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-saturated-properties-hidden-copy-table',
  templateUrl: './saturated-properties-hidden-copy-table.component.html',
  styleUrls: ['./saturated-properties-hidden-copy-table.component.css']
})
export class SaturatedPropertiesHiddenCopyTableComponent implements OnInit {
 
  @Input()
  settings: Settings;
 
  @Input()
  rowData: Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>;


  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: string;

  constructor(private steamService: SteamService) { }

  ngOnInit():void {
   
  }
  
  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
