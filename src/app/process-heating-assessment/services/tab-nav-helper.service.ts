import { inject, Injectable } from '@angular/core';
import { ViewLink } from '../models/views';
import { ProcessHeatingUiService } from './process-heating-ui.service';

@Injectable()
export class TabNavHelper {
  private readonly uiService = inject(ProcessHeatingUiService);

  isLinkDisabled(link: ViewLink): boolean {
    return !this.uiService.canVisitView(link.view);
  }

  isTabInvalid(link: ViewLink): boolean {
    return this.uiService.isViewInvalid(link.view);
  }

  /** @returns the accessible name and tooltip for a marked tab, or null while its inputs are valid */
  invalidTabLabel(link: ViewLink): string | null {
    return this.isTabInvalid(link) ? `${link.label}, has invalid inputs` : null;
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
