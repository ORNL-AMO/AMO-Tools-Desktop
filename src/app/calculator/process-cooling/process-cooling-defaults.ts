export const chillerCharacteristics: ChillerCharacteristics = {
  chillerTypes: [
    {
      value: 0,
      display: "Centrifugal",
    },
    {
      value: 1,
      display: "Screw",
    },
  ],
  condenserCoolingTypes: [
    {
      value: 0,
      display: "Water Cooled",
    },
    {
      value: 1,
      display: "Air Cooled",
    },
  ],
  motorDriveTypes: [
    {
      value: 0,
      display: "Hermetic",
    },
    {
      value: 1,
      display: "Open",
    },
    {
      value: 2,
      display: "N/A",
    },
  ],
  compressorConfigTypes: [
    {
      value: 0,
      display: "No VFD",
    },
    {
      value: 1,
      display: "VFD",
    },
    {
      value: 2,
      display: "Magnetic Bearing",
    },
  ],
};

export interface ChillerCharacteristics {
  chillerTypes: Array<{ value: number; display: string }>;
  condenserCoolingTypes: Array<{ value: number; display: string }>;
  motorDriveTypes: Array<{ value: number; display: string }>;
  compressorConfigTypes: Array<{ value: number; display: string }>;
}
