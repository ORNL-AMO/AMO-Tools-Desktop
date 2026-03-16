import { Component } from '@angular/core';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-replace-compressor-help',
  templateUrl: './replace-compressor-help.component.html',
  styleUrl: './replace-compressor-help.component.css',
  standalone: false
})
export class ReplaceCompressorHelpComponent {
  
  helpTextField: string;
  helpTextFieldSub: Subscription;
  constructor(private compressedAirService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.helpTextFieldSub = this.compressedAirService.helpTextField.subscribe(val => {
      this.helpTextField = val;
    });
  }

  ngOnDestroy(){
    this.helpTextFieldSub.unsubscribe();
  }
}
