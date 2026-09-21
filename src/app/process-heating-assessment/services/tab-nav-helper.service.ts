import { inject, Injectable } from '@angular/core';
import { ViewLink } from '../models/views';
import { ProcessHeatingUiService } from './process-heating-ui.service';

@Injectable()
export class TabNavHelper {
  private readonly uiService = inject(ProcessHeatingUiService);

  isLinkDisabled(link: ViewLink): boolean {
    return !this.uiService.canVisitView(link.view);
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink): boolean {
    if (this.isLinkDisabled(link)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  }
}
