import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { OpeningService } from '../opening.service';

@Component({
    selector: 'app-opening-help',
    templateUrl: './opening-help.component.html',
    styleUrls: ['./opening-help.component.css'],
    standalone: false
})
export class OpeningHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  displaySuggestions: boolean = false;

  @ViewChild('viewFactorModal', { static: false }) public viewFactorModal: ModalDirective;
  currentFieldSub: Subscription;
  currentField: string;
  constructor(private openingService: OpeningService) { }

  ngOnInit() {
    this.currentFieldSub = this.openingService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

  showViewFactor() {
    this.openingService.modalOpen.next(true);
    this.viewFactorModal.show();
  }

  hideViewFactorModal() {
    this.openingService.modalOpen.next(false);
    this.viewFactorModal.hide();
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
}