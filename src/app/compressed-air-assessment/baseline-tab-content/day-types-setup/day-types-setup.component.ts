import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-day-types-setup',
  standalone: false,
  templateUrl: './day-types-setup.component.html',
  styleUrl: './day-types-setup.component.css'
})
export class DayTypesSetupComponent {

  isModalOpen: boolean = false;
  isModalOpenSub: Subscription;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) {
  }

  ngOnInit() {
    this.isModalOpenSub = this.compressedAirAssessmentService.modalOpen.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    });
  }

  ngOnDestroy(){
    this.isModalOpenSub.unsubscribe();
  }
}
