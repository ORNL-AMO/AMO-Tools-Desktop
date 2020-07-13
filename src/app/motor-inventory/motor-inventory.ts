
export interface MotorInventoryData {
    departments: Array<MotorInventoryDepartment>,
    displayOptions: MotorPropertyDisplayOptions
  }
  
  export interface MotorInventoryDepartment {
    name: string,
    operatingHours: number,
    description: string,
    id: string,
    catalog: Array<MotorItem>
  }
  
  export interface MotorItem {
    id: string,
    suiteDbItemId?: number,
    departmentId?: string,
    description: string,
    //required properties
    lineFrequency: number,
    motorRpm: number,
    ratedMotorPower: number,
    efficiencyClass: number,
    nominalEfficiency: number,
    ratedVoltage: number,
    fullLoadAmps: number,
    annualOperatingHours: number,
    percentLoad: number,
    //optional properties
    driveType?: number,
    isVFD?: boolean,
    hasLoggerData?: boolean,
    numberOfPhases?: number,
    name: string,
    enclosureType?: string,
    nemaTable?: string,
    poles?: number,
    synchronousSpeed?: number
    //additional from excel
    manufacturer?: string,
    model?: string,
    catalogId?: string,
    motorType?: string,
    ratedSpeed?: number,
    fullLoadSpeed?: number,
    frameNumber?: string,
    purpose?: string
    uFrame?: number,
    cFace?: number,
    verticalShaft?: number,
    dFlange?: number,
    serviceFactor?: number,
    insulationClass?: number,
    weight?: number,
    listPrice?: number,
    windingResistance?: number,
    //should warranty = boolean?
    warranty?: number,
    rotoBars?: number,
    statorSlots?: number,
    efficiency75?: number,
    efficiency50?: number,
    efficiency25?: number,
    powerFactor100?: number,
    powerFactor75?: number,
    powerFactor50?: number,
    powerFactor25?: number,
    torqueFullLoad?: number,
    torqueBreakDown?: number,
    torqueLockedRotor?: number,
    ampsIdle?: number,
    ampsLockedRotor?: number,
    stalledRotorTimeHot?: number,
    stalledRotorTimeCold?: number
    voltageConnectionType?: string,
    currentType?: number,
    averageLoadFactor?: number,
    utilizationFactor?: number
  }
  
  export interface MotorPropertyDisplayOptions {
    //required properties
    ratedVoltage: boolean,
    annualOperatingHours: boolean,
    percentLoad: boolean,
    //optional properties
    driveType: boolean,
    isVFD: boolean,
    hasLoggerData: boolean,
    numberOfPhases: boolean,
    enclosureType: boolean,
    poles: boolean,
    //additional from excel
    manufacturer: boolean,
    model: boolean,
    catalogId: boolean,
    motorType: boolean,
    ratedSpeed: boolean,
    fullLoadSpeed: boolean,
    frameNumber: boolean,
    purpose: boolean
    uFrame: boolean,
    cFace: boolean,
    verticalShaft: boolean,
    dFlange: boolean,
    serviceFactor: boolean,
    insulationClass: boolean,
    weight: boolean,
    listPrice: boolean,
    windingResistance: boolean,
    warranty: boolean,
    rotorBars: boolean,
    statorSlots: boolean,
    efficiency75: boolean,
    efficiency50: boolean,
    efficiency25: boolean,
    powerFactor100: boolean,
    powerFactor75: boolean,
    powerFactor50: boolean,
    powerFactor25: boolean,
    torqueFullLoad: boolean,
    torqueBreakDown: boolean,
    torqueLockedRotor: boolean,
    ampsIdle: boolean,
    ampsLockedRotor: boolean,
    stalledRotorTimeHot: boolean,
    stalledRotorTimeCold: boolean,
    voltageConnectionType: boolean,
    currentType: boolean,
    averageLoadFactor: boolean,
    utilizationFactor: boolean
  }