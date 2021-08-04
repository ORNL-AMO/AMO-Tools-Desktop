import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { FullLoadAmpsService } from './full-load-amps.service';

@Component({
  selector: 'app-full-load-amps',
  templateUrl: './full-load-amps.component.html',
  styleUrls: ['./full-load-amps.component.css']
})
export class FullLoadAmpsComponent implements OnInit {


  flaInputSub: Subscription;
  settings: Settings;
  constructor(private settingsDbService: SettingsDbService, private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit() {
    this.settings = this.settingsDbService.globalSettings;
    this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);

    
  }

  ngOnDestroy(){
    this.flaInputSub.unsubscribe();
  }

  initSubscriptions() {
    this.flaInputSub = this.fullLoadAmpsService.fullLoadAmpsInputs.subscribe(value => {
      this.fullLoadAmpsService.getFormFromObj(value);
    })
  }

  // calculate() {
  //   this.fullLoadAmpsService.calculate(this.settings);
  // }

  btnGenerateExample() {
    this.fullLoadAmpsService.generateExampleData(this.settings);
    this.fullLoadAmpsService.generateExample.next(true);
  }

}
