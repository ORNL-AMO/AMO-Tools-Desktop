# Assessment Module - PSAT

## Motor Help

### Field Name: Line Frequency
Line Frequency is the mains supply frequency. In North America, the standard frequency is 60 HZ. Elsewhere, 50 HZ is often the standard. The only use of this input is to determine the number of poles, based on the specified motor speed.

Line Frequency options include 50 Hz or 60 Hz.

---

### Field Name: Motor Power
Motor Power represents the rated power for the motor.

---

### Field Name: Motor RPM
Motor RPM is the nameplate speed of the motor. This value is used with the line frequency to determine the number of motor poles. This, in turn, is used (along with motor class and size) to estimate motor efficiency and output shaft power for the measured electrical power or current conditions.

---

### Field Name: Efficiency Class
Efficiency Class is the classification of efficiency given to motor. This can be found either on the nameplate or based on how the motor compares with the NEMA MG 1-2003. Efficiency Class options include Standard Efficiency, Energy Efficient, Premium Efficient, or Specified. The Premium (IE3) and Energy Efficient (IE2) classes are based on motors that match those NEMA classes. Standard motors should be used if the efficiency is below Energy Efficient (IE2). If the user knows the full load efficiency, it can be directly entered using the "Specified" option. The motor efficiency at load will be calculated based on the same curves used for the other efficiency classes.

---

### Field Name: Efficiency
If the user knows the full load efficiency of the motor, it can be entered here instead of estimated via the efficiency class. Motor efficiency is the ratio between the amount of mechanical work the motor performs and the electrical power it consumes to do the work, represented by a percentage. A higher percentage represents a more efficient motor. Electric motor efficiency is dependent on (but not limited to) design, materials, construction, rating, load, power quality, and operating conditions. Enter this value as a percentage.

#### Min/Max Table
Minimum | Maximum
--- | ---
1% | 100%

---

### Field Name: Rated Voltage
This voltage is the motor design (nameplate) voltage.

#### Min/Max Table
Minimum | Maximum
--- | ---
200 V | 15180 V

---

### Field Name: Full Load Amps
Full Load Amps represent either the known or estimated amps. This value will be used as a normalizing value in the Field Data section if Current is the selected Load estimation method. If the Full-Load Amps is not known, an estimate can be made by clicking the "Estimate Full-Load Amps" button. Note: The correct Rated Voltage, Rated Motor Power, and Motor RPM should be entered before the button is pressed. If any of these values change (either in the baseline or when creating a scenario), this button should be used again.

---

**Source: src/app/psat/help-panel/motor-help/motor-help.component.html**