import { cloneDeep } from 'lodash';

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
    return Math.random().toString(36).substr(2, 9);
}

export function getNameDateString(currentDate: Date) {
    const dateStr = (currentDate.getMonth() + 1) + '-' + currentDate.getDate() + '-' + currentDate.getFullYear();
    return dateStr;
}
