import { Component, OnInit, Input, ViewChild, SimpleChanges, ElementRef, Pipe } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsService } from '../../settings/settings.service';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-folder-contact-info',
  templateUrl: './folder-contact-info.component.html',
  styleUrls: ['./folder-contact-info.component.css']
})
export class FolderContactInfoComponent implements OnInit {
  @Input()
  directory: Directory;

  @ViewChild('facilityModal') public facilityModal: ModalDirective;
  settings: Settings;
  showModal: boolean = false;
  isParentSettings: boolean = false;

  isExpanded: boolean = false;
  // btnExpandText: string = "More Info";

  settingsReady: boolean = false;

  showAddress: boolean = false;
  showFacilityContact: boolean = false;
  showAssessmentContact: boolean = false;
  showNoData: boolean = true;
  collapse: boolean = false;
  constructor(private indexedDbService: IndexedDbService, private settingsService: SettingsService) { }

  ngOnInit() {
    this.getSettings(this.directory.id, this.directory);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.directory) {
      this.getSettings(this.directory.id, this.directory);
    }
  }
  showFacilityModal() {
    this.showModal = true;
    this.facilityModal.show();
  }

  hideFacilityModal() {
    this.facilityModal.hide();
    this.showModal = false;
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  save() {
    if (this.isParentSettings) {
      this.indexedDbService.addSettings(this.settings).then(val => {
        this.isParentSettings = false;
        this.checkShow();
        this.hideFacilityModal();
      })
    } else {
      this.indexedDbService.putSettings(this.settings).then(returnVal => {
        this.checkShow();
        this.hideFacilityModal();
      })
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
      }

      if (this.settings.facilityInfo.facilityContact) {
        if (this.settings.facilityInfo.facilityContact.contactName || this.settings.facilityInfo.facilityContact.email || this.settings.facilityInfo.facilityContact.phoneNumber) {
          this.showFacilityContact = true;
        } else {
          this.showFacilityContact = false;
        }
      }

      if (this.settings.facilityInfo.assessmentContact) {
        if (this.settings.facilityInfo.assessmentContact.contactName || this.settings.facilityInfo.assessmentContact.email || this.settings.facilityInfo.assessmentContact.phoneNumber) {
          this.showAssessmentContact = true;
        } else {
          this.showAssessmentContact = false;
        }
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
    }
  }

  getSettings(id: number, directory?: Directory) {
    this.indexedDbService.getDirectorySettings(id).then(settings => {
      if (settings && settings.length != 0) {
        if (this.isParentSettings) {
          let settingsForm = this.settingsService.getFormFromSettings(settings[0]);
          let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
          tmpSettings.createdDate = new Date();
          tmpSettings.modifiedDate = new Date();
          tmpSettings.directoryId = this.directory.id;
          tmpSettings.facilityInfo = settings[0].facilityInfo;
          this.settings = tmpSettings;
          this.settingsReady = true;
          this.checkShow();
        } else {
          this.settings = settings[0];
          this.settingsReady = true;
          this.checkShow();
        }
      } else {
        this.settingsReady = false;
        // if (directory.parentDirectoryId) {
        //   this.isParentSettings = true;
        //   this.getSettings(directory.parentDirectoryId);
        // }
      }
    })
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    // if (this.isExpanded) {
    //   this.revealFacilityInfo();
    // }
    // else {
    //   this.hideFacilityInfo();
    // }
  }

  // revealFacilityInfo() {
  //   this.btnExpandText = "Less Info";
  // }

  // hideFacilityInfo() {
  //   this.btnExpandText = "More Info";
  // }
}
