import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCompressorsPipe',
  pure: false
})
export class FilterCompressorsPipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
