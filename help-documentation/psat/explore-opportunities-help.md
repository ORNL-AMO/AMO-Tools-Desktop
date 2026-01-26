# Assessment Module - PSAT

## Explore Opportunities Help

Use the list on the left to discover potential opportunities for energy and cost savings within your system.

### Field Name: System Data
Within the System Data tab you can modify Cost, Flow Rate, and Head.

---

### Field Name: Modify Cost
Per unit cost of electricity in ($/kWh). Used to calculate annual cost and potential annual savings.

---

### Field Name: Flow Rate
Flow Rate represents either the measured or required rate of flow. The Flow Rate value is used by the software to calculate the fluid power and to estimate the optimal pump operating efficiency.

#### Min/Max Table
Minimum | Maximum
--- | ---
{{minFlowRate}} {{settings.flowMeasurement}} | {{maxFlowRate}} {{settings.flowMeasurement}}

---

### Field Name: Head
Head represents either the measured or required pump head in feet or meters. Head, Flow Rate, and Specific Gravity are used to calculate fluid power for the Existing condition.

---

### Field Name: Motor Rated Data
Within the Motor Rated Data tab you can edit Motor Rated Power, Efficiency Class, and Motor Efficiency.

---

### Field Name: Motor Rated Power
Motor Power represents the rated power for the motor.

---

### Field Name: Efficiency Class
Efficiency Class is the classification of efficiency given to motor. This can be found either on the nameplate or based on how the motor compares with the NEMA MG 1-2003. Efficiency Class options include Standard Efficiency, Energy Efficient, Premium Efficient, or Specified. The Premium (IE3) and Energy Efficient (IE2) classes are based on motors that match those NEMA classes. Standard motors should be used if the efficiency is below Energy Efficient (IE2). If the user knows the full load efficiency, it can be directly entered using the "Specified" option. The motor efficiency at load will be calculated based on the same curves used for the other efficiency classes.

---

### Field Name: Motor Efficiency
If the user knows the full load efficiency of the motor, it can be entered here instead of estimated via the efficiency class. Motor efficiency is the ratio between the amount of mechanical work the motor performs and the electrical power it consumes to do the work, represented by a percentage. A higher percentage represents a more efficient motor. Electric motor efficiency is dependent on (but not limited to) design, materials, construction, rating, load, power quality, and operating conditions. Enter this value as a percentage.

#### Min/Max Table
Minimum | Maximum
--- | ---
1 | 100

---

### Field Name: Pump Data
Within the Pump Data tab you can edit Pump Speed, Pump Type, and Pump Specified Efficiency.

---

### Field Name: Operating Fraction
Operating Fraction represents the fraction of calendar hours the equipment is running. It is used in calculating the annual cost results.

#### Min/Max Table
Minimum | Maximum
--- | ---
0 | 1

---

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

### Field Name: Drive
This drop-down selection menu allows the user to define whether the pump is direct driven by the motor or belt-driven. There are three options for belt drives: V-Belt, Notched V-Belt and Synchronous Belt Drives. Of the three, V-Belt drives are the least efficient, Notched V-Belts are slightly better, and Synchronous Belts are the most efficient belts. This value is used in the Load Estimation calculation. Note: The current estimating method should NOT be used if adjustable frequency drives are used.

Drive options include Direct Drive, V-Belt Drive, Notched V-Belt, or Synchronous Drive.

---

### Field Name: Pump Efficiency
Efficiency of the pump in the modified scenario calculations. The default value for a modification's pump efficiency is the efficiency value calculated in the baseline. There are several reasons to model a change to the pump’s efficiency. Installing a more efficient pump, restoring the existing pump, or changing the impeller size can all result in changes to the pump efficiency. Changing the pumps operating conditions (head, flow) can also result in a change to pump efficiency. Use your pump curve and the affinity laws to determine your pump efficiency at the new conditions and enter the value here. Clicking “Optimize Pump” will provide an estimate of a top-of-the-line, commercially available pump’s efficiency at the modification’s flow rate for the pump type (using curves developed in the Hydraulic Institute’s ANSI/HI 1.3 standard).

#### Min/Max Table
Minimum | Maximum
--- | ---
0 % | 100 %

---

### Field Name: Optimization
This enables the tool to replace the modified condition with the estimate of the top of the line, commercially available equipment (pump and motor) performance for the input parameters. The optimal pump is estimated based on the efficiency estimating algorithms contained in Hydraulic Institute Standard HI 1.3-2000, Centrifugal Pump Design and Application and the calculated fluid power. The optimal motor is based on the specified flow rate, head, and specific gravity values, along with the HI 1.3 achievable efficiency algorithms.

---

### Field Name: Kinematic Viscosity
Kinematic Viscosity is the viscosity of the fluid being pumped, in centistokes. This is used, in conjunction with algorithms from ANSI/HI 1.3-2000 to estimate reductions in achievable efficiency associated with elevated fluid viscosity. This value can be found through fluid property tables.

---

### Field Name: Fixed Specific Speed
The Fixed specific speed switch allows the user to specify whether a specific speed penalty that is a part of the HI achievable efficiency algorithm sequence, is actually imposed. Generally speaking, it is more conservative to select YES. If, however, the basic pump design can be changed (such as number of stages adjusted) in an effort to improve achievable efficiency, NO may be chosen.

---

**Source: src/app/psat/explore-opportunities/explore-opportunities-help/explore-opportunities-help.component.html**