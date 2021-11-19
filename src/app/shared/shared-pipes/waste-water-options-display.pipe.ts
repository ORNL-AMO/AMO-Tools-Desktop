import { Pipe, PipeTransform } from '@angular/core';
import { aeratorTypes } from '../../waste-water/waste-water-defaults';

@Pipe({
  name: 'wasteWaterOptionsDisplay'
})
export class WasteWaterOptionsDisplayPipe implements PipeTransform {

  transform(value: number): string {
      let aeratorType: {display: string, value: number} = aeratorTypes.find(type => {return type.value == value});
      return aeratorType.display;
  }
}
