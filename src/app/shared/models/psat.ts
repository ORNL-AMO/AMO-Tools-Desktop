export interface PSAT {
  pump_style?: any,
  pump_specified?: any,
  pump_rated_speed?: any,
  drive?: any,
  kinematic_viscosity?: any,
  specific_gravity?: any,
  stages?: any,
  fixed_speed?: any,
  line_frequency?: any,
  motor_rated_power?: any,
  motor_rated_speed?: any,
  efficiency_class?: any,
  efficiency?: any,
  motor_rated_voltage?: any,
  load_estimation_method?: any,
  motor_rated_flc?: any,
  full_load_amps?: any,
  margin?: any,
  operating_fraction?: any,
  flow_rate?: any,
  head?: any,
  motor_field_power?: any,
  motor_field_current?: any,
  motor_field_voltage?: any,
  cost_kw_hour?: any,
  adjustments?: Adjustment[],
  selected?: boolean
  
}

export interface Adjustment {
  psat: PSAT,
  name: string,
  savings?: number,
  optimizationRating?: number
}
