import { Component, Input } from '@angular/core';
import { CaseParameter, WeatherBinCase, WeatherBinsInput, WeatherBinsService } from '../../weather-bins.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-bin-detail-form',
    templateUrl: './bin-detail-form.component.html',
    styleUrl: './bin-detail-form.component.css',
    standalone: false
})
export class BinDetailFormComponent {
  @Input()
  settings: Settings;
  @Input()
  parameterIndex: number;
  weatherBinsInput: WeatherBinsInput;

  parameterBins: Array<WeatherBinCase | CaseParameter>;
  isCollapsed: boolean = true;
  form: FormGroup;
  weatherBinsInputSub: Subscription;
  isYParameter: boolean;
  constructor(private weatherBinsService: WeatherBinsService) { }

  ngOnInit() {
    this.weatherBinsInputSub = this.weatherBinsService.inputData.subscribe(val => {
      this.weatherBinsInput = val;
      if (this.isYParameter) {
        this.parameterBins = this.weatherBinsInput.cases;
      } else if (this.weatherBinsInput.cases.length > 0) {
        this.parameterBins = this.weatherBinsInput.cases[0].caseParameters;
      }
    });
  }

  ngOnChanges() {
    this.isYParameter = this.parameterIndex === 0? true : false;
  }

  ngOnDestroy() {
    this.weatherBinsInputSub.unsubscribe();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  focusField(str: string) {
    this.weatherBinsService.currentField.next(str);
  }

  save(bin: CaseParameter | WeatherBinCase, updatedIndex: number) {
    if (!this.isYParameter) {
      this.weatherBinsInput.cases.map(yParameterCase => {
        yParameterCase.caseParameters[updatedIndex] = bin as CaseParameter;
      });
    }
    this.weatherBinsService.save(this.weatherBinsInput, this.settings);
  }





}