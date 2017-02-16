import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import { Directory } from '../../shared/models/directory';

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
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.newAssessment = this.initForm();
  }

  initForm(){
    return this.formBuilder.group({
      'assessmentName': ['', Validators.required]
    });
  }

  //  CREATE ASSESSMENT MODAL
  @ViewChild('createModal') public createModal: ModalDirective;
  showCreateModal(){
    this.createModal.show();
  }

  hideCreateModal(){
    this.createModal.hide();
  }

  createAssessment(){
    this.hideCreateModal();

    // TODO: Create assessment logic
   }

   selectEquip(eq: string){
    this.selectedEquip = eq;
   }
}
