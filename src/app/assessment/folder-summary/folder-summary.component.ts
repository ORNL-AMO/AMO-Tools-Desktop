import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import * as _ from 'lodash';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { PsatService } from '../../psat/psat.service';
import { ExecutiveSummaryService } from '../../phast/phast-report/executive-summary.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-folder-summary',
  templateUrl: './folder-summary.component.html',
  styleUrls: ['./folder-summary.component.css']
})
export class FolderSummaryComponent implements OnInit {
  @Input()
  directory: Directory;
  @Input()
  directorySettings: Settings;
  @Input()
  assessments: Array<Assessment>;

  @ViewChild('settingsModal') public settingsModal: ModalDirective;

  numAssessments: number = 0;
  numPhasts: number = 0;
  numPsats: number = 0;
  settingsForm: FormGroup;
  psatEnergyUsed: number = 0;
  psatEnergyCost: number = 0;
  phastEnergyUsed: number = 0;
  phastEnergyCost: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  counter: any;
  constructor(private settingsService: SettingsService, private psatService: PsatService,
    private convertUnitsService: ConvertUnitsService, private executiveSummaryService: ExecutiveSummaryService,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.counter) {
      clearTimeout(this.counter);
    }

    this.counter = setTimeout(() => {
      this.getData();
      this.getForm();
    }, 150)
  }

  getForm() {
    if (this.directorySettings) {
      this.settingsForm = this.settingsService.getFormFromSettings(this.directorySettings);
    }
  }

  getData() {
    this.psatEnergyUsed = 0;
    this.psatEnergyCost = 0;
    this.phastEnergyUsed = 0;
    this.phastEnergyCost = 0;
    this.totalCost = 0;
    this.totalEnergy = 0;
    if (this.assessments) {
      this.numAssessments = this.directory.assessments.length;
      let test = _.countBy(this.directory.assessments, 'type');
      this.numPhasts = test.PHAST || 0;
      this.numPsats = test.PSAT || 0;
      this.directory.assessments.forEach(assessment => {
        if (assessment.type == 'PSAT') {
          if (assessment.psat.setupDone) {
            let result = this.psatService.resultsExisting(assessment.psat.inputs, this.directorySettings);
            this.psatEnergyUsed = result.annual_energy + this.psatEnergyUsed;
            this.psatEnergyCost = result.annual_cost + this.psatEnergyCost;
          }
        } else if (assessment.type == 'PHAST') {
          if (assessment.phast.setupDone) {
            let settings: Settings = this.settingsDbService.getByAssessmentId(assessment.id);
            let result = this.executiveSummaryService.getSummary(assessment.phast, false, settings, assessment.phast);
            this.phastEnergyUsed = this.phastEnergyUsed + this.convertUnitsService.value(result.annualEnergyUsed).from(settings.energyResultUnit).to(this.directorySettings.energyResultUnit);
            this.phastEnergyCost = this.phastEnergyCost + result.annualCost;
          }
        }
      })
    }
  }

  getTotals() {
    this.totalCost = this.phastEnergyCost + this.psatEnergyCost;
    this.totalEnergy = this.phastEnergyUsed + this.convertUnitsService.value(this.psatEnergyUsed).from('kWh').to(this.directorySettings.energyResultUnit);
    return { totalCost: this.totalCost, totalEnergy: this.totalEnergy };
  }

  showSettingsModal() {
    this.settingsModal.show();
  }

  hideSettingsModal(bool: boolean) {
    if (bool) {
      let id = this.directorySettings.id;
      this.directorySettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      this.directorySettings.directoryId = this.directory.id;
      this.directorySettings.id = id;
      this.indexedDbService.putSettings(this.directorySettings).then(() => {
        this.settingsDbService.setAll().then(() => {
          this.getForm();
          this.getData();
          this.settingsModal.hide();
        })
      });
    } else {
      this.getForm();
      this.getData();
      this.settingsModal.hide();
    }
  }
}
