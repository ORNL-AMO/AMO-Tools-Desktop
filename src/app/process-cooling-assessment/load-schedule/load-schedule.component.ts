import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { FormControlIds, generateFormControlIds } from '../../shared/helperFunctions';

@Component({
  selector: 'app-load-schedule',
  standalone: false,
  templateUrl: './load-schedule.component.html',
  styleUrl: './load-schedule.component.css'
})
export class LoadScheduleComponent {
private processCoolingAssessmentService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
destroyRef: DestroyRef = inject(DestroyRef);
// form type
controlIds: FormControlIds<LoadForm>;


loadForm: FormGroup;

// todo likely not needed
loadPercentages = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];


  constructor(private fb: FormBuilder) {
    this.loadForm = this.fb.group({}, { validators: [this.totalPercentageValidator] });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.controlIds = generateFormControlIds(this.loadForm.controls);
    this.observeFormChanges();
  }

    observeFormChanges() {
      this.loadForm.valueChanges.pipe(
        tap(formValue => {
          console.log('Form value changed:', this.loadForm.getRawValue());
          // let systemInformation = this.processCooling().systemInformation;
          // const operations = this.systemInformationFormService.getOperations(this.form.getRawValue(), systemInformation.operations);
          // this.processCoolingAssessmentService.updateSystemInformation('operations', operations);
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    }
  

  get totalPercentLoad(): number {
    return this.loadPercentages.reduce((total, load) => {
      const value = this.loadForm.get('load' + load)?.value;
      return total + (value ? parseFloat(value) : 0);
    }, 0);
  }

  private initializeForm(): void {
    const formControls: { [key: string]: any } = {};
    
    this.loadPercentages.forEach(load => {
      formControls['load' + load] = [
        '', 
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100),
        ]
      ];
    });

    this.loadForm = this.fb.group(formControls, { 
      validators: [this.totalPercentageValidator] 
    });
  }


  getFieldControl(fieldName: string): AbstractControl | null {
    return this.loadForm.get(fieldName);
  }

  totalPercentageValidator = (formGroup: FormGroup): ValidationErrors | null => {
    const total = Object.keys(formGroup.controls).reduce((sum, key) => {
      const value = formGroup.get(key)?.value;
      return sum + (value ? parseFloat(value) : 0);
    }, 0);

    if (total > 100) {
      return { 'totalExceedsHundred': true };
    }
    
    if (total < 100 && total > 0) {
      return { 'totalLessThanHundred': true };
    }

    return null;
  }


  private convertToLoadArray(formData: any): number[][] {
    // Create 11x12 array (11 load levels, 12 months)
    const loadArray: number[][] = [];
    
    this.loadPercentages.forEach(load => {
      const monthlyData: number[] = [];
      const value = parseFloat(formData['load' + load]) || 0;
      
      // Same value for all 12 months (Version A behavior)
      for (let month = 0; month < 12; month++) {
        monthlyData.push(value);
      }
      
      loadArray.push(monthlyData);
    });
    
    return loadArray;
  }


}