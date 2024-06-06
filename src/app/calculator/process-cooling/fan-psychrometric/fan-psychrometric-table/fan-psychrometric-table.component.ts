import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { Subscription } from 'rxjs';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';


@Component({
  selector: 'app-fan-psychrometric-table',
  templateUrl: './fan-psychrometric-table.component.html',
  styleUrls: ['./fan-psychrometric-table.component.css']
})
export class FanPsychrometricTableComponent implements OnInit {
  @Input()
  settings: Settings
  @Input()
  resultData: Array<PsychrometricResults>;
  @Input()
  psychrometricResults: PsychrometricResults;
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;



  constructor(private fanPsychrometricService: FanPsychrometricService) { }

  ngOnInit(): void {
  }


  addResult() {
    this.resultData.push(this.psychrometricResults);
  }

  deleteResult(index: number) {
    this.resultData.splice(index, 1);
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText.replace(/Delete/g, '');
  }
}
