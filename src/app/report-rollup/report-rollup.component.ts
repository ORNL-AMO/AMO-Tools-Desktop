import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ReportRollupService } from './report-rollup.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
@Component({
  selector: 'app-report-rollup',
  templateUrl: './report-rollup.component.html',
  styleUrls: ['./report-rollup.component.css']
})
export class ReportRollupComponent implements OnInit {
  @Input()
  selectedItems: Array<Assessment>;
  @Output('emitCloseReport')
  emitCloseReport = new EventEmitter<boolean>();
  
  constructor(private reportRollupService: ReportRollupService,
    private windowRefService: WindowRefService) { }

  ngOnInit() {
    let phastItems = new Array<Assessment>();
    let psatItems = new Array<Assessment>();
    console.log(this.selectedItems);
    this.selectedItems.forEach(item => {
      if (item.psat) {
        psatItems.push(item);
        this.reportRollupService.psats.next(psatItems);
      } else if (item.phast) {
        phastItems.push(item);
        this.reportRollupService.phasts.next(phastItems);
      }
    });
  }

  exportToCsv() {
    // let tmpDataArr = new Array();
    // this.exportReports.forEach(report => {
    //   let tmpData = this.jsonToCsvService.getPsatCsvData(report.assessment, report.settings, report.assessment.psat);
    //   tmpDataArr.push(tmpData);
    //   if (report.assessment.psat.modifications) {
    //     report.assessment.psat.modifications.forEach(mod => {
    //       tmpData = this.jsonToCsvService.getPsatCsvData(report.assessment, report.settings, mod.psat);
    //       tmpDataArr.push(tmpData);
    //     })
    //   }
    // })
    // this.jsonToCsvService.downloadData(tmpDataArr, 'psatRollup');
  }

  print() {
    let win = this.windowRefService.nativeWindow;
    let doc = this.windowRefService.getDoc();
    win.print();
  }

  closeReport() {
    this.emitCloseReport.emit(true);
  }

}
