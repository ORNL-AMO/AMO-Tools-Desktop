import { Component, inject } from '@angular/core';
import { ModificationService } from '../../services/modification.service';
import { DialogRef } from '@angular/cdk/dialog';
import { Modification } from '../../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-add-modification',
  standalone: false,
  templateUrl: './add-modification.component.html',
  styleUrls: ['./add-modification.component.css']
})
export class AddModificationComponent {
  private modificationService = inject(ModificationService);
  private dialogRef = inject(DialogRef<AddModificationComponent>);

  newModificationName: string;
  modifications: Modification[];

  constructor( ) { }

  ngOnInit(): void {
    this.modifications = this.modificationService.modifications();
    this.newModificationName = 'Scenario ' + (this.modifications.length + 1);
  }

  close() {
    this.dialogRef.close();
  }

  createModification() {
    this.modificationService.addNewModificationToAssessment(this.newModificationName);
    this.close();
  }

}