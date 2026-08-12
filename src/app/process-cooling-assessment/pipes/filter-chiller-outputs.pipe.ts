import { Pipe, PipeTransform } from '@angular/core';
import { SystemProfileChillerOutput } from '../services/system-profile.service';
import { ProcessCoolingChillerOutput } from '../../shared/models/process-cooling-assessment';

@Pipe({
  name: 'filterChillerOutputs',
  standalone: false
})
export class FilterChillerOutputsPipe implements PipeTransform {
  transform(chillerOutputs: SystemProfileChillerOutput[], selectedId: string): ProcessCoolingChillerOutput[] {
    if (!chillerOutputs) {
        return [];
    }
    return chillerOutputs.find(c => c.id === selectedId)?.chillerOutputs || [];
  }
}
