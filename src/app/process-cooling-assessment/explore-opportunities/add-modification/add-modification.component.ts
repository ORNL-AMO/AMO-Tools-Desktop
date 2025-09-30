import { Component, inject } from '@angular/core';
import { Modification, ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { ModificationService } from '../../services/modification.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-add-modification',
  standalone: false,
  templateUrl: './add-modification.component.html',
  styleUrl: './add-modification.component.css'
})
export class AddModificationComponent {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  private processCoolingSignal = this.processCoolingAssessmentService.processCoolingSignal;
  private dialogRef = inject(DialogRef<AddModificationComponent>);

  modificationsExists: boolean;
  newModificationName: string;
  
  constructor( ) { }

  ngOnInit(): void {
    // todo remove for selectedModificationId
    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingSignal();
    this.newModificationName = 'Scenario ' + (processCoolingAssessment.modifications.length + 1);
    this.modificationsExists = (processCoolingAssessment.modifications && processCoolingAssessment.modifications.length != 0);
  }

  close() {
    this.dialogRef.close();
  }

  createModification() {
    this.modificationService.addNewModificationToAssessment(this.newModificationName);
    this.close();
  }

}