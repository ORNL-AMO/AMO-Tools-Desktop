import { Validators } from '@angular/forms';

/** Applied to every Metered and Designed Energy input while its energy source is turned on. */
export const ENERGY_INPUT_VALIDATORS = [Validators.required, Validators.min(0)];
