# Assessment Module - PSAT

## Pump & Fluid Help

### Field Name: Pump Type
Pump Type represents what style of pump is being used based off of the listings in the standard ANSI/HI 1.3-2000. This value will be used to estimate achievable pump efficiencies based on pump style and operating conditions.

#### Pump Types
- Overhung Impeller
- Between Bearings Impeller
- Vertical Turbine

Overhung impeller pumps have the impeller(s) mounted on the end of a shaft that is “overhung” from its bearing supports. The impeller can be mounted directly on the driver shaft or on a separate pump shaft supported by its own bearings.

Between Bearings pumps have the impeller(s) mounted on a shaft with bearings on both sides.

Vertically suspended pumps have an impeller with a vertical axis of rotation. Vertical turbine pumps typically use radial, modified radial or mixed flow impellers.

See ANSI/HI 1.1-1.2, 1.3, 2.1-2.2, 2.3 and 20.3 or Hydraulic Institute webpage for more information.

---

### Field Name: Pump Efficiency
Efficiency of the pump in the modified scenario calculations. The default value for a modification's pump efficiency is the efficiency value calculated in the baseline. There are several reasons to model a change to the pump’s efficiency. Installing a more efficient pump, restoring the existing pump, or changing the impeller size can all result in changes to the pump efficiency. Changing the pumps operating conditions (head, flow) can also result in a change to pump efficiency. Use your pump curve and the affinity laws to determine your pump efficiency at the new conditions and enter the value here. Clicking “Optimize Pump” will provide an estimate of a top-of-the-line, commercially available pump’s efficiency at the modification’s flow rate for the pump type (using curves developed in the Hydraulic Institute’s ANSI/HI 1.3 standard).

#### Min/Max Table
Minimum | Maximum
--- | ---
0% | 100%

---

### Field Name: Pump Speed
The operating or nameplate speed at which the pump is running at. Used along with the measure/required flow rate, head, and number of stages, to calculate the pump specific speed. The specific speed is used to determine efficiency penalty associated with the particular pump application.

#### Min/Max Table
Drive Type | Minimum | Maximum
--- | --- | ---
Direct Drive | 540 rpm | 3960 rpm
Belt Drives | 1 rpm | —

---

### Field Name: Drive
This drop-down selection menu allows the user to define whether the pump is direct driven by the motor or belt-driven. There are three options for belt drives: V-Belt, Notched V-Belt and Synchronous Belt Drives. Of the three, V-Belt drives are the least efficient, Notched V-Belts are slightly better, and Synchronous Belts are the most efficient belts. This value is used in the Load Estimation calculation. Note: The current estimating method should NOT be used if adjustable frequency drives are used.

Drive options include Direct Drive, V-Belt Drive, Notched V-Belt, or Synchronous Drive.

---

### Field Name: Drive Efficiency
Drive efficiency is the approximate efficiency of the drive connecting the pump to the motor. The combined efficiency of the motor drive and VFD efficiency at the scenario’s load (if modifying system using a VFD). VFD efficiency can be approximated as 95% if unknown.

---

### Field Name: Fluid Type
Fluid Type is the type of fluid in your system.

---

### Field Name: Fluid Temperature
Fluid Temperature is the average temperature of the fluid in your system. This is used in combination with properties of the fluid itself to calculate specific gravity.

#### Suggested Min/Max Table
Suggested Minimum | Suggested Maximum
--- | ---
Fluid Freezing Point | Fluid Boiling Point

---

### Field Name: Specific Gravity
Specific Gravity is the ratio of the density of the fluid to water at standard condition. This is used in calculating the fluid power at the specified pump flow rate and head conditions. This can be found through fluid property tables. This value is automatically calculated for the chosen fluid at the specified temperature. It can also be edited manually if desired.

---

### Field Name: Kinematic Viscosity
Kinematic viscosity is the ratio of absolute (or dynamic) viscosity to density - a quantity in which no force is involved. This can be obtained by dividing the absolute viscosity of a fluid with the fluid mass density. It is expressed here in terms of CentiStokes. This value is automatically calculated for the chosen fluid at the specified temperature. For all fluids other than water, this value is only valid at the reference temperature, usually 25 deg C (68 deg F). It can also be edited manually.

---

### Field Name: Stages
The number of pump stages. This value is used to calculate pump specific speed.

---

**Source: src/app/psat/help-panel/pump-fluid-help/pump-fluid-help.component.html**