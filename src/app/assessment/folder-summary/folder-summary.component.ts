import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import * as _ from 'lodash';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';

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
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.getData();
    this.getForm();
  }

  ngOnChanges() {
    this.getData();
    this.getForm();
  }

  getForm() {
    if (this.directorySettings) {
      this.settingsForm = this.settingsService.getFormFromSettings(this.directorySettings);
    }
  }

  getData() {
    if (this.assessments) {
      this.numAssessments = this.directory.assessments.length;
      let test = _.countBy(this.directory.assessments, 'type');
      this.numPhasts = test.PHAST || 0;
      this.numPsats = test.PSAT || 0;
    }
  }

  showSettingsModal() {
    this.settingsModal.show();
  }

  hideSettingsModal(bool: boolean) {
    if(bool){
      let id = this.directorySettings.id;
      this.directorySettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      this.directorySettings.directoryId = this.directory.id;
      this.directorySettings.id = id;
      this.indexedDbService.putSettings(this.directorySettings);
    }
    this.getForm();
    this.getData();
    this.settingsModal.hide();
  }
}
