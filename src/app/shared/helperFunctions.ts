import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export function copyObject(object) {
    return cloneDeep(object);
}

export function truncate(text: string, specifiedLimit?: number) {
    let limit = specifiedLimit ? specifiedLimit : 50;
    if (text.length > limit) {
        return text.slice(0, limit) + '...'
    } else {
        return text;
    }
}


export function roundVal(val: number, places: number): number {
    let rounded = Number(val.toFixed(places));
    return rounded;
  }

export function getNewIdString() {
    return uuidv4();
}

export function getNameDateString(currentDate: Date) {
    const dateStr = (currentDate.getMonth() + 1) + '-' + currentDate.getDate() + '-' + currentDate.getFullYear();
    return dateStr;
}


export type FormControlIds<T> = {
  [K in keyof T]: string;
};


export const generateFormControlIds = <T extends Record<string, any>>(obj: T): FormControlIds<T> => {
  const result = {} as FormControlIds<T>;
  const idString = getNewIdString();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = `${idString}_${key}`;
    }
  }
  return result;
}
