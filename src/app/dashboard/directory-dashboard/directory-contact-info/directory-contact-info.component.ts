import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Settings } from '../../../shared/models/settings';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { Subscription } from 'rxjs';
import { Directory } from '../../../shared/models/directory';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-directory-contact-info',
  templateUrl: './directory-contact-info.component.html',
  styleUrls: ['./directory-contact-info.component.css']
})
export class DirectoryContactInfoComponent implements OnInit {

  @ViewChild('facilityModal', { static: false }) public facilityModal: ModalDirective;

  settings: Settings;
  directory: Directory;
  isExpanded: boolean = false;
  showAddress: boolean = false;
  showFacilityContact: boolean = false;
  showAssessmentContact: boolean = false;
  showNoData: boolean = true;
  selectedDirectorySub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private settingsService: SettingsService, private settingsDbService: SettingsDbService,
    private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService, private dashboardService: DashboardService) { }

  ngOnInit() {
    this.selectedDirectorySub = this.directoryDashboardService.selectedDirectoryId.subscribe(dirId => {
      this.directory = this.directoryDbService.getById(dirId);
      this.settings = this.settingsDbService.getByDirectoryId(dirId);
      this.checkShow();
    });
  }

  ngOnDestroy() {
    this.selectedDirectorySub.unsubscribe();
  }

  showFacilityModal() {
    this.facilityModal.show();
  }

  hideFacilityModal() {
    this.facilityModal.hide();
  }

  save() {
    if (this.settings.directoryId != this.directory.id) {
      let settingsForm = this.settingsService.getFormFromSettings(this.settings);
      let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
      tmpSettings.createdDate = new Date();
      tmpSettings.modifiedDate = new Date();
      tmpSettings.directoryId = this.directory.id;
      tmpSettings.facilityInfo = this.settings.facilityInfo;
      this.settings = tmpSettings;
      this.indexedDbService.addSettings(this.settings).then(val => {
        this.settingsDbService.setAll().then(() => {
          this.checkShow();
          this.dashboardService.updateDashboardData.next(true);
          this.hideFacilityModal();
        });
      });
    } else {
      this.indexedDbService.putSettings(this.settings).then(returnVal => {
        this.settingsDbService.setAll().then(() => {
          this.checkShow();
          this.dashboardService.updateDashboardData.next(true);
          this.hideFacilityModal();
        });
      });
    }
  }

  checkShow() {
    if (this.settings.facilityInfo) {
      if (this.settings.facilityInfo.address) {
        if (this.settings.facilityInfo.address.city ||
          this.settings.facilityInfo.address.state ||
          this.settings.facilityInfo.address.zip ||
          this.settings.facilityInfo.address.street ||
          this.settings.facilityInfo.address.country) {
          this.showAddress = true;
        } else {
          this.showAddress = false;
        }
      } else {
        this.showAddress = false;
      }

      if (this.settings.facilityInfo.facilityContact) {
        if (this.settings.facilityInfo.facilityContact.contactName || this.settings.facilityInfo.facilityContact.email || this.settings.facilityInfo.facilityContact.phoneNumber) {
          this.showFacilityContact = true;
        } else {
          this.showFacilityContact = false;
        }
      } else {
        this.showFacilityContact = false;
      }

      if (this.settings.facilityInfo.assessmentContact) {
        if (this.settings.facilityInfo.assessmentContact.contactName || this.settings.facilityInfo.assessmentContact.email || this.settings.facilityInfo.assessmentContact.phoneNumber) {
          this.showAssessmentContact = true;
        } else {
          this.showAssessmentContact = false;
        }
      } else {
        this.showAssessmentContact = false;
      }

      if (!this.showFacilityContact && !this.showAddress && !this.showAssessmentContact) {
        if (this.settings.facilityInfo.facilityName || this.settings.facilityInfo.companyName) {
          this.showNoData = false;
        } else {
          this.showNoData = true;
        }
      } else {
        this.showNoData = false;
      }
    } else {
      this.showNoData = true;
      this.showAddress = false;
      this.showAssessmentContact = false;
      this.showFacilityContact = false;
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
