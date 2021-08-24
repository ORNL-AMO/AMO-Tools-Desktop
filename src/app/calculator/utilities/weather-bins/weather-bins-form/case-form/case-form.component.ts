import { Component, OnInit, Input } from '@angular/core';
import { WeatherBinsService, WeatherBinsInput, CaseParameter, WeatherBinCase } from '../../weather-bins.service';
import { Subscription } from 'rxjs';
import { CsvImportData } from '../../../../../shared/helper-services/csv-to-json.service';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-case-form',
  templateUrl: './case-form.component.html',
  styleUrls: ['./case-form.component.css']
})
export class CaseFormComponent implements OnInit {
  @Input()
  settings: Settings;

  inputData: WeatherBinsInput;
  inputDataSub: Subscription;
  importDataFromCsvSub: Subscription;
  importDataFromCsv: CsvImportData;
  constructor(private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.inputDataSub = this.weatherBinsService.inputData.subscribe(val => {
      this.inputData = val;
    });

    this.importDataFromCsvSub = this.weatherBinsService.importDataFromCsv.subscribe(importData => {
      this.importDataFromCsv = importData;
    });
  }

  ngOnDestroy() {
    this.inputDataSub.unsubscribe();
    this.importDataFromCsvSub.unsubscribe();
  }

  save() {
    this.weatherBinsService.save(this.inputData, this.settings);
  }

  addCase() {
    let newCase: WeatherBinCase = this.weatherBinsService.getNewCase(this.inputData.cases.length + 1);
    this.inputData.cases.push(newCase);
    this.save();
  }

  addParameter(caseIndex: number) {
    let emptyParameter: CaseParameter = this.weatherBinsService.getEmptyCaseParameter();
    this.inputData.cases[caseIndex].caseParameters.push(emptyParameter);
    this.save();
  }

  deleteParameter(caseIndex: number, parameterIndex: number) {
    this.inputData.cases[caseIndex].caseParameters.splice(parameterIndex, 1);
    this.save();
  }

  deleteCase(index: number) {
    this.inputData.cases.splice(index, 1);
    let newNameIndex: number = 1;
    this.inputData.cases.forEach(caseItem => {
      caseItem.caseName = 'Bin #' + newNameIndex;
      newNameIndex++;
    });
    this.save();
  }
}
