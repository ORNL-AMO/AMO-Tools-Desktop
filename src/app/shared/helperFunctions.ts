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

export function getNewIdString() {
    return Math.random().toString(36).substr(2, 9);
}
