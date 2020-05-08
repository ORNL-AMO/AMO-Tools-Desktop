import { Component, OnInit } from '@angular/core';
import { WeatherBinsService, WeatherBinsInput, CaseParameter, WeatherBinCase } from '../../weather-bins.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-case-form',
  templateUrl: './case-form.component.html',
  styleUrls: ['./case-form.component.css']
})
export class CaseFormComponent implements OnInit {

  inputData: WeatherBinsInput;
  inputDataSub: Subscription;
  dataFields: Array<string>;
  dataFieldsSub: Subscription;
  constructor(private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.inputDataSub = this.weatherBinsService.inputData.subscribe(val => {
      this.inputData = val;
    });

    this.dataFieldsSub = this.weatherBinsService.dataFields.subscribe(dataFields => {
      this.dataFields = dataFields;
    })
  }

  ngOnDestroy() {
    this.inputDataSub.unsubscribe();
    this.dataFieldsSub.unsubscribe();
  }

  save() {
    this.weatherBinsService.inputData.next(this.inputData);
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
}
