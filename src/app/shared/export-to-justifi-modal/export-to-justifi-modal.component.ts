import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExportToJustifiTemplateService } from './export-to-justifi-services/export-to-justifi-template.service';
import { Directory } from '../models/directory';
import { Assessment } from '../models/assessment';
import { Settings } from '../models/settings';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-export-to-justifi-modal',
  templateUrl: './export-to-justifi-modal.component.html',
  styleUrl: './export-to-justifi-modal.component.css',
  standalone: false
})
export class ExportToJustifiModalComponent {

  @ViewChild('exportToJustifiModal', { static: false }) public exportToJustifiModal: ModalDirective;
  directory: Directory;
  selectedAssessments: Array<Assessment> = [];
  settings: Settings;
  constructor(private directoryDashboardService: DirectoryDashboardService,
    private exportToJustifiTemplateService: ExportToJustifiTemplateService,
    private directoryDbService: DirectoryDbService,
    private settingsDbService: SettingsDbService
  ) { }

  ngOnInit() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.settings = this.settingsDbService.getByDirectoryId(this.directory.id);
    this.directory.assessments.forEach(assessment => {
      if (assessment.selected && assessment.type != 'Water') {
        this.selectedAssessments.push(assessment);
      }
    });
  }

  ngAfterViewInit() {
    this.showModal();
  }

  showModal() {
    this.exportToJustifiModal.show();
  }

  hideModal() {
    this.exportToJustifiModal.hide();
    this.exportToJustifiModal.onHidden.subscribe(val => {
      this.exportToJustifiTemplateService.showExportToJustifiModal.next(false);
    });
  }

  async exportToJustifi() {
    this.exportToJustifiTemplateService.exportData(this.settings, this.selectedAssessments);
  }


}
