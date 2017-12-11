import { Component, OnInit, ViewChild, ViewChildren, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory, DirectoryDbRef } from '../../shared/models/directory';
import { ModelService } from '../../shared/model.service';
import { Router } from '@angular/router';
import { AssessmentService } from '../assessment.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-assessment-create',
  templateUrl: './assessment-create.component.html',
  styleUrls: ['./assessment-create.component.css']
})
export class AssessmentCreateComponent implements OnInit {
  @Input()
  directory: Directory;
  @ViewChildren('assessmentName') vc;
  @Output('hideModal')
  hideModal = new EventEmitter<boolean>();
  @Input()
  type: string;

  newAssessment: any;
  selectedEquip: string = 'new';
  showDropdown: boolean = false;
  selectedAssessment: string = 'Select Pump';
  allAssessments: any[] = new Array();
  filteredAssessments: any[] = new Array();
  settings: Settings;
  canCreate: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private assessmentService: AssessmentService,
    private modelService: ModelService,
    private router: Router,
    private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    console.log('init');
    this.indexedDbService.getDirectorySettings(this.directory.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
        } else {
          this.getParentDirectorySettings(this.directory.parentDirectoryId);
        }
      });
    this.newAssessment = this.initForm();
    this.allAssessments = this.directory.assessments;
    this.filteredAssessments = this.allAssessments;
    this.canCreate = true;
    if(this.type){
      this.newAssessment.patchValue({
        assessmentType: this.type
      })
    }
  }

  getParentDirectorySettings(parentDirectoryId: number) {
    //get parent directory
    this.indexedDbService.getDirectory(parentDirectoryId).then(
      results => {
        let parentDirectory = results;
        //get parent directory settings
        this.indexedDbService.getDirectorySettings(parentDirectory.id).then(
          results => {
            if (results.length != 0) {
              this.settings = results[0];
            } else {
              //no settings try again with parents parent directory
              this.getParentDirectorySettings(parentDirectory.parentDirectoryId)
            }
          })
      }
    )
  }

  ngAfterViewInit() {
    this.showCreateModal();
  }

  initForm() {
    return this.formBuilder.group({
      'assessmentName': ['New Assessment', Validators.required],
      'assessmentType': ['Pump', Validators.required]
    });
  }

  //  CREATE ASSESSMENT MODAL
  @ViewChild('createModal') public createModal: ModalDirective;
  showCreateModal() {
    this.createModal.show();
    this.createModal.onShown.subscribe(() => {
      this.vc.first.nativeElement.select();
    })
  }

  hideCreateModal(bool?: boolean) {
    this.showDropdown = false;
    this.createModal.hide();
    this.hideModal.emit(true);
    // this.hideModal.emit(true);
    if (!bool) {
      this.assessmentService.createAssessment.next(false);
    }

  }

  createAssessment() {
    if (this.newAssessment.valid && this.canCreate) {
      this.canCreate = false;
      this.hideCreateModal(true);
      this.createModal.onHidden.subscribe(() => {
        this.assessmentService.tab = 'system-setup';
        if (this.newAssessment.value.assessmentType == 'Pump') {
          let tmpAssessment = this.assessmentService.getNewAssessment('PSAT');
          tmpAssessment.name = this.newAssessment.value.assessmentName;

          let tmpPsat = this.assessmentService.getNewPsat();
          tmpAssessment.psat = tmpPsat;
          if (this.settings.powerMeasurement != 'hp') {
            tmpAssessment.psat.inputs.motor_rated_power = 150;
          }
          tmpAssessment.directoryId = this.directory.id;
          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.indexedDbService.getAssessment(assessmentId).then(assessment => {
              tmpAssessment = assessment;
              if (this.directory.assessments) {
                this.directory.assessments.push(tmpAssessment);
              } else {
                this.directory.assessments = new Array();
                this.directory.assessments.push(tmpAssessment);
              }
              let tmpDirRef: DirectoryDbRef = {
                name: this.directory.name,
                id: this.directory.id,
                parentDirectoryId: this.directory.parentDirectoryId,
                createdDate: this.directory.createdDate,
                modifiedDate: this.directory.modifiedDate
              }

              this.indexedDbService.putDirectory(tmpDirRef).then(results => {
                this.assessmentService.createAssessment.next(false);
                this.router.navigateByUrl('/psat/' + tmpAssessment.id)
              });
            })
          });
        }
        else if (this.newAssessment.value.assessmentType == 'Furnace') {
          let tmpAssessment = this.assessmentService.getNewAssessment('PHAST');
          tmpAssessment.name = this.newAssessment.value.assessmentName;

          let tmpPhast = this.assessmentService.getNewPhast();
          tmpAssessment.phast = tmpPhast;
          tmpAssessment.phast.setupDone = false;
          tmpAssessment.directoryId = this.directory.id;

          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.indexedDbService.getAssessment(assessmentId).then(assessment => {
              tmpAssessment = assessment;
              if (this.directory.assessments) {
                this.directory.assessments.push(tmpAssessment);
              } else {
                this.directory.assessments = new Array();
                this.directory.assessments.push(tmpAssessment);
              }

              let tmpDirRef: DirectoryDbRef = {
                name: this.directory.name,
                id: this.directory.id,
                parentDirectoryId: this.directory.parentDirectoryId,
                createdDate: this.directory.createdDate,
                modifiedDate: this.directory.modifiedDate
              }
              this.indexedDbService.putDirectory(tmpDirRef).then(results => {
                this.assessmentService.createAssessment.next(false);
                this.router.navigateByUrl('/phast/' + tmpAssessment.id)
              });
            })
          });
        }
      })
    }
  }

  selectEquip(eq: string) {
    this.selectedEquip = eq;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  setAssessment(psatName: string) {
    this.selectedAssessment = psatName;
    this.toggleDropdown();
  }

  onKey(str: string) {
    if (str != '') {
      let temp = this.allAssessments.filter(f => f.name.toLowerCase().indexOf(str.toLowerCase()) >= 0);
      if (temp.length != 0) {
        this.filteredAssessments = temp;
      } else {
        this.filteredAssessments = this.allAssessments;
      }
    } else {
      this.filteredAssessments = this.allAssessments;
    }
  }

}
