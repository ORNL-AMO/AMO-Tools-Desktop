import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CsvToJsonService, CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import { LogToolService } from '../../log-tool.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';
import { VisualizeService } from '../../visualize/visualize.service';
import { DayTypeGraphService } from '../../day-type-analysis/day-type-graph/day-type-graph.service';
import { IndividualDataFromCsv } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-setup-data',
  templateUrl: './setup-data.component.html',
  styleUrls: ['./setup-data.component.css']
})
export class SetupDataComponent implements OnInit {

  fileReference: any;
  validFile: boolean;
  importData: any = null;
  importDataFromCsv: CsvImportData;
  importingData: boolean = false;
  dataExists: boolean = false;
  importSuccesful: boolean = false;
  individualDataFromCsv: Array<IndividualDataFromCsv>;
  previousDataAvailableSub: Subscription;
  previousDataAvailable: Date;
  constructor(private csvToJsonService: CsvToJsonService, private logToolService: LogToolService, private cd: ChangeDetectorRef,
    private dayTypeAnalysisService: DayTypeAnalysisService, private visualizeService: VisualizeService, private dayTypeGraphService: DayTypeGraphService,
    private logToolDataService: LogToolDataService, private logToolDbService: LogToolDbService) { }

  ngOnInit() {
    this.individualDataFromCsv = this.logToolService.individualDataFromCsv;
    if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
      this.dataExists = true;
    }
    if (this.dataExists == false && this.logToolService.dataSubmitted.getValue() == false) {
      this.previousDataAvailableSub = this.logToolDbService.previousDataAvailable.subscribe(val => {
        this.previousDataAvailable = val;
      });
    }
  }

  ngOnDestroy() {
    if (this.previousDataAvailableSub) {
      this.previousDataAvailableSub.unsubscribe();
    }
  }

  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
        let regex = /.csv$/;
        let regex2 = /.CSV$/;
        if (regex.test($event.target.files[0].name) || regex2.test($event.target.files[0].name)) {
          this.fileReference = $event.target.files[0];
          this.validFile = true;
          this.importFile();
        } else {
          this.validFile = false;
        }
      }
    }
  }

  importFile() {
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference);
    fr.onloadend = (e) => {
      this.importData = JSON.parse(JSON.stringify(fr.result));
    };
  }

  parseImportData() {
    this.importingData = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.importDataFromCsv = this.csvToJsonService.parseCSV(this.importData);
      this.logToolService.addCsvData(this.importDataFromCsv, this.fileReference.name);
      this.importSuccesful = true;
      this.importData = undefined;
      this.importingData = false;
      this.logToolService.dataSubmitted.next(true);
      this.previousDataAvailable = undefined;
      this.logToolDbService.saveData();
      this.cd.detectChanges();
    }, 100);
  }

  resetData() {
    this.dayTypeAnalysisService.resetData();
    this.visualizeService.resetData();
    this.dayTypeGraphService.resetData();
    this.logToolService.resetData();
    this.logToolDataService.resetData();
    this.dataExists = false;
    this.logToolDbService.saveData()
    this.cd.detectChanges();
  }

  usePreviousData(){
    this.logToolDbService.setLogToolData();
    this.previousDataAvailable = undefined;
    if (this.dayTypeAnalysisService.dayTypesCalculated == true || this.visualizeService.visualizeDataInitialized == true) {
      this.dataExists = true;
    }
  }
}
