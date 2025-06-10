import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExportToJustifiTemplateService } from './export-to-justifi-services/export-to-justifi-template.service';
import { Directory } from '../models/directory';
import { Assessment } from '../models/assessment';
import { Settings } from '../models/settings';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';

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

  context: 'assessment' | 'directory' = 'directory';
  constructor(private directoryDashboardService: DirectoryDashboardService,
    private exportToJustifiTemplateService: ExportToJustifiTemplateService,
    private directoryDbService: DirectoryDbService,
    private settingsDbService: SettingsDbService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private assessmentDbService: AssessmentDbService
  ) { }

  ngOnInit() {
    if (this.router.url.includes('directory-dashboard')) {
      this.context = 'directory';
      let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
      this.directory = this.directoryDbService.getById(directoryId);
      this.settings = this.settingsDbService.getByDirectoryId(this.directory.id);
      this.directory.assessments.forEach(assessment => {
        if (assessment.selected) {
          this.addAssessment(assessment);
        }
      });
    } else {
      this.context = 'assessment';
      let id = this.activatedRoute.firstChild.snapshot.paramMap.get('id')
      let assessmentId: number = Number(id);
      let assessment: Assessment = this.assessmentDbService.findById(assessmentId);
      this.selectedAssessments.push(assessment);
      this.settings = this.settingsDbService.getByAssessmentId(assessment, true);
    }
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

  setValue() {
    console.log(this.selectedAssessments)
  }


  addAssessment(assessment: Assessment) {
    if (assessment.type == 'PSAT') {
      assessment.psat.selectedModificationId = assessment.psat.modifications[0]?.id;
    } else if (assessment.type == 'FSAT') {
      assessment.fsat.selectedModificationId = assessment.fsat.modifications[0]?.id;
    } else if (assessment.type == 'PHAST') {
      assessment.phast.selectedModificationId = assessment.phast.modifications[0]?.id;
    } else if (assessment.type == 'SSMT') {
      assessment.ssmt.selectedModificationId = assessment.ssmt.modifications[0]?.modificationId;
    } else if (assessment.type == 'WasteWater') {
      assessment.wasteWater.selectedModificationId = assessment.wasteWater.modifications[0]?.id;
    } else if (assessment.type == 'CompressedAir') {
      assessment.compressedAirAssessment.selectedModificationId = assessment.compressedAirAssessment.modifications[0]?.modificationId;
    }

    if (assessment.type != 'Water') {
      this.selectedAssessments.push(assessment);
    }

  }

}
