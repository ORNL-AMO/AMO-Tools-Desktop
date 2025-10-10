import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { CompressedAirAssessment } from '../../shared/models/compressed-air-assessment';

@Component({
  selector: 'app-assessment-tab-content',
  standalone: false,
  templateUrl: './assessment-tab-content.component.html',
  styleUrl: './assessment-tab-content.component.css'
})
export class AssessmentTabContentComponent {

  initializingModification: boolean = true;
  constructor(private activatedRoute: ActivatedRoute, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private router: Router
  ) { }

  ngOnInit() {
    //baseline not setup, navigate back to start
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (!compressedAirAssessment || !compressedAirAssessment.setupDone) {
      let routerStr: string = this.router.url.replace(/\/assessment\/.*/, '')
      this.router.navigateByUrl(routerStr);
    } else {
      this.activatedRoute.params.subscribe(params => {
        this.initializingModification = true;
        let modificationId: string = params['id'];
        this.compressedAirAssessmentService.setSelectedModificationById(modificationId);
        this.initializingModification = false;
      });
    }
  }
}
