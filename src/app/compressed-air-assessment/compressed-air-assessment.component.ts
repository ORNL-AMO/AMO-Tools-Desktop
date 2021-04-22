import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';

@Component({
  selector: 'app-compressed-air-assessment',
  templateUrl: './compressed-air-assessment.component.html',
  styleUrls: ['./compressed-air-assessment.component.css']
})
export class CompressedAirAssessmentComponent implements OnInit {

  assessment: Assessment;
  settings: Settings;
  mainTab: string;
  mainTabSubscription: Subscription;
  setupTab: string;
  setupTabSubscription: Subscription;
  constructor(private activatedRoute: ActivatedRoute, private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private indexedDbService: IndexedDbService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']));
      // this.wasteWaterService.updateWasteWater(this.assessment.wasteWater);
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      if (!settings) {
        settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
        this.addSettings(settings);
      } else {
        this.settings = settings;
        this.compressedAirAssessmentService.settings.next(settings);
      }
      // if (this.assessmentService.tab) {
      //   this.wasteWaterService.mainTab.next(this.assessmentService.tab);
      // }
    });

    this.mainTabSubscription = this.compressedAirAssessmentService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.setupTabSubscription = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
    });
  }

  ngOnDestroy(){
    this.mainTabSubscription.unsubscribe();
    this.setupTabSubscription.unsubscribe();
  }


  addSettings(settings: Settings) {
    delete settings.id;
    delete settings.directoryId;
    settings.assessmentId = this.assessment.id;
    this.indexedDbService.addSettings(settings).then(() => {
      this.settingsDbService.setAll().then(() => {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
        this.compressedAirAssessmentService.settings.next(this.settings);
      });
    });
  }


  initUpdateUnitsModal(){
    
  }

}
