import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Assessment } from '../shared/models/assessment';
import { FsatService } from './fsat.service';
import { Settings } from '../shared/models/settings';
import { SettingsService } from '../settings/settings.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Directory } from '../shared/models/directory';
import { Subscription } from 'rxjs';
import { FSAT, Modification } from '../shared/models/fans';
import * as _ from 'lodash';
import { CompareService } from './compare.service';

@Component({
  selector: 'app-fsat',
  templateUrl: './fsat.component.html',
  styleUrls: ['./fsat.component.css']
})
export class FsatComponent implements OnInit {
  @ViewChild('changeModificationModal') public changeModificationModal: ModalDirective;

  @ViewChild('fsat203Modal') public fsat203Modal: ModalDirective;
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;

  @ViewChild('addNewModal') public addNewModal: ModalDirective;
  containerHeight: number;


  _fsat: FSAT;
  assessment: Assessment;
  mainTab: string;
  stepTab: string;
  settings: Settings;
  isAssessmentSettings: boolean;
  assessmentTab: string;
  mainTabSub: Subscription;
  stepTabSub: Subscription;
  assessmentTabSub: Subscription;
  //TODO: Add Modification logic
  modificationExists: boolean = true;
  modificationIndex: number;
  selectedModSubscription: Subscription;
  addNewSub: Subscription;
  showAdd: boolean;
  isModalOpen: boolean;
  openModSub: Subscription;
  constructor(private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
    private fsatService: FsatService,
    private settingsService: SettingsService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private compareService: CompareService) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this._fsat = (JSON.parse(JSON.stringify(this.assessment.fsat)));
        if (this._fsat.modifications) {
          if (this._fsat.modifications.length != 0) {
            this.modificationExists = true;
            this.modificationIndex = 0;
            this.compareService.setCompareVals(this._fsat, 0);
          }
        } else {
          this._fsat.modifications = new Array<Modification>();
          this.modificationExists = false;
        }
        this.getSettings();
      })
    })
    this.mainTabSub = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.stepTabSub = this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    })

    this.addNewSub = this.fsatService.openNewModal.subscribe(val => {
      this.showAdd = val;
      if (val) {
        this.showAddNewModal();
      }
    })
    this.openModSub = this.compareService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal()
      }
    })
    this.selectedModSubscription = this.compareService.selectedModification.subscribe(mod => {
      if (mod && this._fsat) {
        this.modificationIndex = _.findIndex(this._fsat.modifications, (val) => {
          return val.fsat.name == mod.name
        })
      } else {
        this.modificationIndex = undefined;
      }
    })
  }

  ngOnDestroy() {
    this.compareService.baselineFSAT = undefined;
    this.compareService.modifiedFSAT = undefined;
    this.compareService.selectedModification.next(undefined);
    this.mainTabSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.stepTabSub.unsubscribe();
    this.openModSub.unsubscribe();
    this.selectedModSubscription.unsubscribe();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }

  saveSettings() {
    //TODO:implement saving settings
  }


  getSettings(update?: boolean) {
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (tmpSettings) {
      this.settings = tmpSettings;
      this.isAssessmentSettings = true;
    } else {
      //if no settings found for assessment, check directory settings
      this.getParentDirectorySettings(this.assessment.directoryId);
    }
  }

  getParentDirectorySettings(parentId: number) {
    let dirSettings: Settings = this.settingsDbService.getByDirectoryId(parentId);
    if (dirSettings) {
      let settingsForm = this.settingsService.getFormFromSettings(dirSettings);
      let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
      tmpSettings.createdDate = new Date();
      tmpSettings.modifiedDate = new Date();
      tmpSettings.assessmentId = this.assessment.id;
      //create settings for assessment
      this.indexedDbService.addSettings(tmpSettings).then(
        results => {
          this.settingsDbService.setAll().then(() => {
            // this.addToast('Settings Saved');
            this.getSettings();
          })
        })
    }
    else {
      //if no settings for directory check parent directory
      let tmpDir: Directory = this.directoryDbService.getById(parentId);
      this.getParentDirectorySettings(tmpDir.parentDirectoryId);
    }
  }

  show203Modal() {
    this.fsat203Modal.show();
  }

  hide203Modal() {
    this.fsat203Modal.hide();
  }

  showAddNewModal() {
    //this.isModalOpen = true;
    this.addNewModal.show();
  }
  closeAddNewModal() {
    //this.isModalOpen = false;
    this.fsatService.openNewModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(mod: Modification) {
    this._fsat.modifications.push(mod);
    this.compareService.setCompareVals(this._fsat, this._fsat.modifications.length - 1);
    this.closeAddNewModal();
    this.save();
  }

  save() {
    if (this._fsat.modifications) {
      if (this._fsat.modifications.length == 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
      }
    } else {
      this.modificationExists = false;
    }
    this.compareService.setCompareVals(this._fsat, this.modificationIndex);
    this.assessment.fsat = (JSON.parse(JSON.stringify(this._fsat)));
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        // this.psatService.getResults.next(true);
      })
    })
  }

  selectModificationModal() {
    this.isModalOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.isModalOpen = false;
    this.compareService.openModificationModal.next(false);
    this.changeModificationModal.hide();
  }
}
