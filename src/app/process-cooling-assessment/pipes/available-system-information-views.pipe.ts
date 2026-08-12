import { Pipe, PipeTransform } from '@angular/core';
import { CondenserCoolingMethod } from '../../shared/models/process-cooling-assessment';
import { SystemInformationView, ViewLink } from '../models/views';

@Pipe({
  name: 'availableSystemInformationViews',
  standalone: false
})
export class FilterAvailableViewsPipe implements PipeTransform {
  transform(links: ViewLink[], condenserCoolingMethod: CondenserCoolingMethod): ViewLink[] {
    return links.filter(link => {
      if (link.view === SystemInformationView.TOWER) {
        return condenserCoolingMethod !== CondenserCoolingMethod.Air;
      }
      return true;
    });
  }
}
