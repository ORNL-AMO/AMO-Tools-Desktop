import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import { Directory } from '../../shared/models/directory';
import { ModelService } from '../../shared/model.service';
import { Router } from '@angular/router';
import { AssessmentService } from '../assessment.service';

@Component({
  selector: 'app-assessment-create',
  templateUrl: './assessment-create.component.html',
  styleUrls: ['./assessment-create.component.css']
})
export class AssessmentCreateComponent implements OnInit {
  @Input()
  directory: Directory;

  newAssessment: any;
  selectedEquip: string = 'new';
  showDropdown: boolean = false;
  selectedAssessment: string = 'Select Pump';
  allAssessments: any[] = new Array();
  filteredAssessments: any[] = new Array();
  constructor(private formBuilder: FormBuilder, private assessmentService: AssessmentService, private modelService: ModelService, private router: Router) { }

  ngOnInit() {
    this.newAssessment = this.initForm();
    this.allAssessments = this.directory.assessments;
    this.filteredAssessments = this.allAssessments;

  }

  initForm() {
    return this.formBuilder.group({
      'assessmentName': ['', Validators.required],
      'assessmentType': ['']
    });
  }

  //  CREATE ASSESSMENT MODAL
  @ViewChild('createModal') public createModal: ModalDirective;
  showCreateModal() {
    this.createModal.show();
  }

  hideCreateModal() {
    this.showDropdown = false;
    this.createModal.hide();
  }

  createAssessment() {
    this.hideCreateModal();

    this.createModal.onHidden.subscribe(() => {
      if (this.newAssessment.value.assessmentType == 'Pump') {
        let tmpAssessment = this.assessmentService.getNewAssessment('PSAT');
        tmpAssessment.name = this.newAssessment.value.assessmentName;

        let tmpPsat = this.assessmentService.getNewPsat();
        tmpAssessment.psat = tmpPsat;
        this.assessmentService.setWorkingAssessment(tmpAssessment);

        if (this.directory.assessments) {
          this.directory.assessments.push(tmpAssessment);
        } else {
          this.directory.assessments = new Array();
          this.directory.assessments.push(tmpAssessment);
        }

        this.router.navigateByUrl('/psat')

      } else if (this.newAssessment.value.assessmentType == 'Furnace') {
        let tmpAssessment = this.assessmentService.getNewAssessment('PHAST');
        tmpAssessment.name = this.newAssessment.value.assessmentName;

        let tmpPhast = this.assessmentService.getNewPhast();
        tmpAssessment.phast = tmpPhast;

        this.assessmentService.setWorkingAssessment(tmpAssessment);
        if (this.directory.assessments) {
          this.directory.assessments.push(tmpAssessment);
        } else {
          this.directory.assessments = new Array();
          this.directory.assessments.push(tmpAssessment);
        }
        this.router.navigateByUrl('/phast')
      }
    })
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
