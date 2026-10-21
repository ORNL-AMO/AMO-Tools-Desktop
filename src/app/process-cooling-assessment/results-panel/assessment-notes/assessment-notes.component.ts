import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { ModificationService } from '../../services/modification.service';

@Component({
  selector: 'app-assessment-notes',
  standalone: false,
  templateUrl: './assessment-notes.component.html',
  styleUrl: './assessment-notes.component.css'
})
export class AssessmentNotesComponent implements OnInit, OnDestroy {
  private readonly modificationService = inject(ModificationService);

  selectedModificationSub: Subscription;
  isFormChange: boolean = false;
  modification: Modification;

  ngOnInit(): void {
    this.selectedModificationSub = this.modificationService.selectedModification$.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.selectedModificationSub?.unsubscribe();
  }

  save(): void {
    this.isFormChange = true;
    this.modificationService.updateModification(this.modification);
  }
}
