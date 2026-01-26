# Assessment Module - PSAT

## Field Data Help

### Field Name: Flow Rate
Flow Rate represents either the measured or required rate of flow. The Flow Rate value is used by the software to calculate the fluid power and to estimate the optimal pump operating efficiency.

Flow rate for modified scenario should be determined from an analysis of required/desired modification flow rate or head, using manufacturer’s pump curve and the pump affinity laws to find accurate values. This is also used to calculate the optimal pump efficiency, if activated (must change the flow rate before calculating optimal pump efficiency).

#### Min/Max Table
Minimum | Maximum
--- | ---
{{minFlowRate}} {{settings.flowMeasurement}} | {{maxFlowRate}} {{settings.flowMeasurement}}

---

### Field Name: Head
Head represents either the measured or required pump head in feet or meters. Head, Flow Rate, and Specific Gravity are used to calculate fluid power for the Existing condition. To assist in calculating measured pump head, the "Calculate Head" button can be clicked to bring up a head calculation panel.

Pump head for modified scenario should be determined from an analysis of required/desired modification flow rate or head, using manufacturer’s pump curve and the pump affinity laws to find accurate values.

---

### Field Name: Load Estimation Method
Load Estimation Method can either be one of two choices: Power or Current. Both of which calculate Motor Input which will be used for efficiency calculations. The preferred load estimation method is power. However, if a power measurement is not practical, current can be used.

---

### Field Name: Motor Power or Motor Current
Either Motor Power (kW) or Motor Current (amps) will be displayed, depending on the Load Estimation Method selected. Power is the preferred measurement, but unless a permanently-installed power meter is available, is much more intrusive and challenging.

---

### Field Name: Measured Voltage
The measured bus voltage is used, along with measured current, to estimate input motor power if Current is the specified Load estimation method. If Power is the Load estimation method, the current is estimated from power and voltage.

#### Suggested Min/Max Table
Suggested Minimum | Suggested Maximum
--- | ---
1 V | 13800 V

---

### Field Name: Optimize Calculation
This enables the tool to replace the modified condition with the estimate of the top of the line, commercially available equipment (pump and motor) performance for the input parameters. The optimal pump is estimated based on the efficiency estimating algorithms contained in Hydraulic Institute Standard HI 1.3-2000, Centrifugal Pump Design and Application and the calculated fluid power. The optimal motor is based on the specified flow rate, head, and specific gravity values, along with the HI 1.3 achievable efficiency algorithms.

---

### Field Name: Kinematic Viscosity
Kinematic Viscosity is the viscosity of the fluid being pumped, in centistokes. This is used, in conjunction with algorithms from ANSI/HI 1.3-2000 to estimate reductions in achievable efficiency associated with elevated fluid viscosity. This value can be found through fluid property tables.

---

### Field Name: Fixed Specific Speed
The Fixed specific speed switch allows the user to specify whether a specific speed penalty that is a part of the HI achievable efficiency algorithm sequence, is actually imposed. Generally speaking, it is more conservative to select YES. If, however, the basic pump design can be changed (such as number of stages adjusted) in an effort to improve achievable efficiency, NO may be chosen.

---

### Field Name: Implementation Costs
Estimated cost to implement modifications.

---

**Source: src/app/psat/help-panel/field-data-help/field-data-help.component.html**