import {Component, Input, OnInit} from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import {FormBuilder, Validators} from "@angular/forms";
import {IndexedDbService} from "../../../indexedDb/indexed-db.service";

@Component({
  selector: 'app-percent-load-estimation',
  templateUrl: './percent-load-estimation.component.html',
  styleUrls: ['./percent-load-estimation.component.css']
})
export class PercentLoadEstimationComponent implements OnInit {
  @Input()
  settings: Settings;

  loadEstimationResult: number;
  percentLoadEstimationForm: any;
  tabSelect: string = 'results';  
  toggleCalculate = false;

  constructor(private formBuilder: FormBuilder, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if (!this.percentLoadEstimationForm) {
      this.percentLoadEstimationForm = this.formBuilder.group({
        'measuredSpeed': ['', Validators.required],
        'nameplateFullLoadSpeed': ['', Validators.required],
        'synchronousSpeed': ['', ],
        'loadEstimation': ['', ]
      });
    }

    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(
        results => {
          if (results.length !== 0) {
            this.settings = results[0];
          }
        }
      );
    }
  }
  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.loadEstimationResult = ((this.percentLoadEstimationForm.value.synchronousSpeed - this.percentLoadEstimationForm.value.measuredSpeed) 
                              / (this.percentLoadEstimationForm.value.synchronousSpeed - this.percentLoadEstimationForm.value.nameplateFullLoadSpeed)) * 100;    
  }

}
