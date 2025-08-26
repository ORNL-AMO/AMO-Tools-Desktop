export interface MeasurMessageData {
    show: boolean,
    msg?: string,
    detailHTML?: string,
    objectType?: string,
    objectRefs?: Array<MeasurObjectRef>,
    dismissButtonText?: string
}

export interface MeasurObjectRef {
    id: string, 
    name: string
}

export const MEASUR_RESOURCES_URL = 'https://industrialresources.ornl.gov/measur/user-guides/view-guide/MEASUR-tips-tricks';