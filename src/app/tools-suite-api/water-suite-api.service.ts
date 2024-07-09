import { Injectable } from '@angular/core';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
@Injectable({
  providedIn: 'root'
})
export class WaterSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }


}
