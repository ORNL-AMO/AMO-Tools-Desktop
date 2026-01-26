# Calculator Group - Pumps

## Valve Energy Loss Calculator

Commonly, pumping systems are designed with an oversized pump which then has its flow restricted via valve to achieve the necessary flow rate. These valves are necessarily bleeding off fluid power to reduce the flow rate. As variable speed drives (VSD) are capable of adjusting the input energy of a pump and thusly adjusting the flow rate, there is potential to open a throttled valve and adjust fluid flow with VSD instead, thereby saving the energy that would’ve been lost through the valve.

This calculator is intended to provide an estimate of electrical power loss incurred by throttled valves.

### Field Name: Annual Operating Hours
Number of hours the valve participates in the pumping system in a year. 8760 if it runs year-round.

#### Min/Max Table
Minimum | Maximum
--- | ---
0 hrs/yr | 8760 hrs/yr

---

### Field Name: Electrical Cost
The cost of electricity per kilowatt-hour (kWh) used by the facility.

---

### Field Name: Pump Efficiency
The hydraulic efficiency of the pump, or how effectively it pumps fluid. 85% is typical. Value should range from 1 – 100%.

---

### Field Name: Motor Efficiency
The electrical efficiency of the motor driving the pump. If the motor hasn’t been through rewind, this is the efficiency listed on the nameplate. 95% can be used as a default if unknown. Value should range from 1 – 100%.

---

### Field Name: Specific Gravity
Density of the working fluid relative to water, with water itself as 1. A fluid which is twice as dense as water has a specific gravity of 2. Value cannot be equal to or less than 0.

---

### Field Name: Flow Rate
Volume of fluid flow through the valve. Best taken from immediately upstream of the valve assuming there are no branches downstream of measurement location. Value cannot be equal to or less than 0.

---

### Field Name: Upstream Pressure
Gauge pressure *before* the valve.

---

### Field Name: Upstream Diameter
Inner diameter of the pipe that feeds into the valve. If a reducer is present, use the size prior to the reducer.

---

### Field Name: Upstream Gage Elevation
Height difference of the pressure gauge from the valve. Can be negative, zero, or positive as the position is relative to the valve.

---

### Field Name: Valve Diameter
Inner diameter of the valve itself. If a reducer is present, use the size prior to the reducer.

---

### Field Name: Downstream Pressure
Gauge pressure *after* the valve.

---

### Field Name: Downstream Pipe Inner Diameter
Inner diameter of the pipe that exits the valve. If an expander is present, use the size after the expander.

---

### Field Name: Downstream Gauge Elevation
Height difference of the pressure gauge from the valve. Can be negative, zero, or positive as the position is relative to the valve.

---

### Field Name: Pipe Sizing Geometry Factor
This is a unitless term that influences the expressed flow resistance of the fittings and pipe geometry around the valve. For piping of the same diameter as the valve both in and out, Pipe Sizing Factor is 1. Typically, this value ranges only from 0.9 to 1.1, though extreme reductions or expansions can exceed this range. Derive experimentally if possible, else use 1.

---

**Source: src/app/calculator/pumps/valve-energy-loss/valve-energy-loss-help/valve-energy-loss-help.component.html**