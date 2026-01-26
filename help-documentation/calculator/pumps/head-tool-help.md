# Calculator Group - Pumps

## Pump Head Tool Calculator

Given a measured pressure, elevation, flow rate, and line size data calculate the head for a pump.

### Field Name: Suction Gauge Reference Point
Choose the location of the suction side gauge (at the tank fluid surface or before the pump).

---

### Field Name: Specific Gravity
Specific gravity of the fluid (relative to water).

---

### Field Name: Flow Rate
Pump flow rate.

---

### Field Name: Suction Pipe Diameter (ID)
Inner diameter of the suction side pipe (in inches or mm). This is used to calculate the fluid velocity in the suction pipe, which is then used to determine the suction velocity head.

---

### Field Name: Suction Tank gas overpressure (Pg)
The gas overpressure within the suction side tank (in psig or kPA). If the tank (or well, lake, etc.) is open to the atmosphere, the gauge pressure should be set to 0.

---

### Field Name: Suction Tank fluid surface elevation (Zs)
The elevation of the tank (or well, lake, etc.) (in feet or meters). Both the suction tank fluid surface elevation and the discharge gauge elevation should be relative to a common elevation, which could be absolute (e.g., sea level) or relative (e.g., floor level).

---

### Field Name: Suction Line loss coefficients (Ks)
The suction line loss coefficients (the sum of all suction line loss elements) are used to estimate the frictional head losses between the suction reference point (e.g., tank level) and the pump suction flange. Note that these coefficients apply to the Darcy-Weisbach style calculation (loss – K x velocity head). These losses might come from elbows, tees, suction isolation valve, entrance loss from the tank to the pipe, etc. IMPORTANT: All losses must be normalized to the specific suction pipe diameter, and loss coefficient adjustments are made to the 4th order of the pipe diameter ratio. For example if there is a 12-inch isolation valve with a loss coefficient (K) of 0.4, but the suction pipe diameter at the point where the pressure is measured is 16-inches (such as in a suction header) the loss coefficient for the valve would be 0.4 x (16/12)^4 = 1.26.

---

### Field Name: Discharge Pipe diameter (ID)
Inner diameter of the discharge pipe. This is used to calculate the fluid velocity in the discharge pipe, which is then used to determine the discharge velocity head.

---

### Field Name: Discharge Gauge pressure (Pd)
Discharge gauge pressure.

---

### Field Name: Discharge Gauge elevation (Zd)
The elevation of the discharge gauge (in feet or meters). Both the suction tank fluid surface elevation and the discharge gauge elevation should be relative to a common elevation, which could be absolute (e.g., sea level) or relative (e.g., floor level).

---

### Field Name: Discharge Line loss coefficients (Kd)
The discharge line loss coefficients (the sum of all discharge line loss elements) are used to estimate the pump discharge flange and the discharge pressure gauge. Note that these coefficients apply to the Darcy-Weisbach style calculation (loss – K x velocity head). These losses might come from elbows, tees, suction isolation valve, entrance loss from the tank to the pipe, etc. IMPORTANT: All losses must be normalized to the specific suction pipe diameter, and loss coefficient adjustments are made to the 4th order of the pipe diameter ratio. For example if there is a 12-inch isolation valve with a loss coefficient (K) of 0.4, but the suction pipe diameter at the point where the pressure is measured is 16-inches (such as in a suction header) the loss coefficient for the valve would be 0.4 x (16/12)^4 = 1.26.

---

**Source: src/app/calculator/pumps/head-tool/head-tool-help/head-tool-help.component.html**