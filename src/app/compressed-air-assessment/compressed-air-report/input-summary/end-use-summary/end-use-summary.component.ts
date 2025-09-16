import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, DayTypeEndUse, EndUse } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';

@Component({
    selector: 'app-end-use-summary',
    templateUrl: './end-use-summary.component.html',
    styleUrls: ['./end-use-summary.component.css'],
    standalone: false
})
export class EndUseSummaryComponent implements OnInit {
  @Input()
  endUses: Array<EndUse>;
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;

  dayTypeEndUseData: { [daytypeId: string]: Array<DayTypeEndUse> } = {}; 
  compressedAirDayTypes: Array<CompressedAirDayType> = []
  collapse: boolean = false;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;
  
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.setAllDayTypeEndUses();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  setAllDayTypeEndUses() {
    if (this.endUses && this.endUses.length > 0) {
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      if (compressedAirAssessment && compressedAirAssessment.compressedAirDayTypes.length > 0) {
        this.compressedAirDayTypes = compressedAirAssessment.compressedAirDayTypes;
        this.compressedAirDayTypes.forEach(dayType => {
          this.dayTypeEndUseData[dayType.dayTypeId] = []; 
          this.endUses.forEach(endUse => {
            let dayTypeUse: DayTypeEndUse = endUse.dayTypeEndUses.find(dayTypeUse => dayTypeUse.dayTypeId === dayType.dayTypeId);
            this.dayTypeEndUseData[dayType.dayTypeId].push(dayTypeUse); 
          })
        });
      }
    }
  }

  getDayTypeEndUses(daytype: CompressedAirDayType): Array<DayTypeEndUse> {
    return this.dayTypeEndUseData[daytype.dayTypeId];
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
