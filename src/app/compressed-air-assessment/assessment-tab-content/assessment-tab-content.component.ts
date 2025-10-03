import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
  selector: 'app-assessment-tab-content',
  standalone: false,
  templateUrl: './assessment-tab-content.component.html',
  styleUrl: './assessment-tab-content.component.css'
})
export class AssessmentTabContentComponent {

  constructor(private activatedRoute: ActivatedRoute, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(){
    this.activatedRoute.params.subscribe(params => {
      let modificationId: string = params['id'];
      this.compressedAirAssessmentService.setSelectedModificationById(modificationId);
    });
  }
}
