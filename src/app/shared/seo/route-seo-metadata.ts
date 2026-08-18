import { SeoConfig } from './seo.service';

const SHARED_KEYWORDS = 'MEASUR, DOE energy tool, manufacturing energy assessment, industrial energy savings, energy efficiency calculator, AMO tools, Oak Ridge National Laboratory';

export const defaultSeoConfig: SeoConfig = {
  title: 'MEASUR - Manufacturing Energy Assessment Software for Utility Reduction',
  description: 'MEASUR is a free DOE tool for conducting energy assessments on manufacturing equipment and systems, helping identify energy savings opportunities.',
  canonicalPath: '/',
  keywords: `${SHARED_KEYWORDS}, energy assessment software, utility reduction`,
};

export const routeSeoMetadata: Record<string, SeoConfig> = {

  // ── Top-level info routes ────────────────────────────────────────────────
  '/': {
    title: 'MEASUR - Manufacturing Energy Assessment Software for Utility Reduction',
    description: 'MEASUR is a free DOE tool for conducting energy assessments on manufacturing equipment and systems, helping identify energy savings opportunities.',
    canonicalPath: '/',
    keywords: `${SHARED_KEYWORDS}, energy assessment software, utility reduction, industrial energy audit`,
  },
  '/landing-screen': {
    title: 'Home',
    description: 'Start your energy assessment with MEASUR. Access calculators, tutorials, and tools for analyzing industrial energy use.',
    canonicalPath: '/landing-screen',
    keywords: `${SHARED_KEYWORDS}, energy assessment, industrial energy tools, energy calculators`,
  },
  '/about': {
    title: 'About MEASUR',
    description: 'Learn about MEASUR — the Manufacturing Energy Assessment Software for Utility Reduction — developed by the DOE\'s Industrial Technologies Office at Oak Ridge National Laboratory.',
    canonicalPath: '/about',
    keywords: `${SHARED_KEYWORDS}, Industrial Technologies Office, DOE ITO, ORNL, energy software`,
  },
  '/tutorials': {
    title: 'Tutorials',
    description: 'Step-by-step tutorials for getting started with MEASUR energy assessments and calculators.',
    canonicalPath: '/tutorials',
    keywords: `${SHARED_KEYWORDS}, energy assessment tutorial, how to use MEASUR, energy tool guide`,
  },
  '/contact': {
    title: 'Contact',
    description: 'Get in touch with the MEASUR team at Oak Ridge National Laboratory for support and feedback.',
    canonicalPath: '/contact',
    keywords: `${SHARED_KEYWORDS}, MEASUR support, contact ORNL`,
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'Privacy policy for the MEASUR web application.',
    canonicalPath: '/privacy',
    keywords: `MEASUR, privacy policy`,
  },
  '/acknowledgments': {
    title: 'Acknowledgments',
    description: 'Acknowledgments and credits for the MEASUR application.',
    canonicalPath: '/acknowledgments',
    keywords: `MEASUR, acknowledgments, credits`,
  },

  // ── Calculator category list pages ───────────────────────────────────────
  '/calculators/calculators-list': {
    title: 'All Calculators',
    description: 'Browse all MEASUR energy calculators for compressed air, fans, motors, pumps, steam, lighting, and process heating — free industrial energy assessment tools.',
    canonicalPath: '/calculators/calculators-list',
    keywords: `${SHARED_KEYWORDS}, free energy calculators, industrial calculators, compressed air calculator, motor efficiency calculator, steam calculator, pump calculator`,
  },
  '/calculators/compressed-air-list': {
    title: 'Compressed Air Calculators',
    description: 'Free compressed air energy calculators: pipe sizing, leak surveys, receiver tank sizing, pressure reduction, operating cost, and more.',
    canonicalPath: '/calculators/compressed-air-list',
    keywords: `${SHARED_KEYWORDS}, compressed air calculator, air compressor energy, compressed air leaks, pipe sizing calculator, air compressor efficiency`,
  },
  '/calculators/fans-list': {
    title: 'Fan System Calculators',
    description: 'Free fan system energy calculators including fan efficiency, traverse analysis, fan curve development, and system optimization checklists.',
    canonicalPath: '/calculators/fans-list',
    keywords: `${SHARED_KEYWORDS}, fan efficiency calculator, industrial fan, fan system optimization, fan curve, fan energy savings`,
  },
  '/calculators/process-heating-list': {
    title: 'Process Heating Calculators',
    description: 'Free process heating energy calculators for furnaces: flue gas analysis, charge material, wall loss, oxygen enrichment, heat cascading, and more.',
    canonicalPath: '/calculators/process-heating-list',
    keywords: `${SHARED_KEYWORDS}, process heating calculator, furnace efficiency, combustion efficiency, flue gas analysis, industrial furnace, heat loss calculator`,
  },
  '/calculators/process-cooling-list': {
    title: 'Process Cooling Calculators',
    description: 'Free process cooling energy calculators: cooling tower performance, chiller staging, chiller performance, and basin calculations.',
    canonicalPath: '/calculators/process-cooling-list',
    keywords: `${SHARED_KEYWORDS}, chiller efficiency calculator, cooling tower calculator, process cooling energy, chiller COP, industrial cooling`,
  },
  '/calculators/lighting-list': {
    title: 'Lighting Calculators',
    description: 'Calculate energy savings from lighting replacement and upgrades with MEASUR\'s free industrial lighting calculator.',
    canonicalPath: '/calculators/lighting-list',
    keywords: `${SHARED_KEYWORDS}, lighting replacement calculator, industrial lighting energy savings, LED retrofit calculator, lighting efficiency`,
  },
  '/calculators/motors-list': {
    title: 'Motor Calculators',
    description: 'Free motor energy calculators: NEMA efficiency, motor performance, percent load estimation, replace vs rewind, motor drive comparison, and full-load amps.',
    canonicalPath: '/calculators/motors-list',
    keywords: `${SHARED_KEYWORDS}, motor efficiency calculator, NEMA motor efficiency, electric motor energy savings, VFD calculator, motor load calculator`,
  },
  '/calculators/pumps-list': {
    title: 'Pump Calculators',
    description: 'Free pump energy calculators: pump curve, head tool, specific speed, and achievable efficiency for industrial pump systems.',
    canonicalPath: '/calculators/pumps-list',
    keywords: `${SHARED_KEYWORDS}, pump efficiency calculator, centrifugal pump, pump curve calculator, pump energy savings, hydraulic efficiency`,
  },
  '/calculators/steam-list': {
    title: 'Steam System Calculators',
    description: 'Free steam system energy calculators: boiler, stack loss, steam properties, turbine, flash tank, PRV, heat loss, deaerator, and more.',
    canonicalPath: '/calculators/steam-list',
    keywords: `${SHARED_KEYWORDS}, steam system calculator, boiler efficiency, steam properties calculator, industrial steam, steam energy savings`,
  },
  '/calculators/general-list': {
    title: 'General Energy Calculators',
    description: 'General-purpose energy calculators: unit converter, electricity reduction, natural gas reduction, CO₂ conversion, combined heat and power, cash flow, and more.',
    canonicalPath: '/calculators/general-list',
    keywords: `${SHARED_KEYWORDS}, electricity reduction calculator, natural gas savings, combined heat and power, energy unit converter`,
  },
  '/calculators/waste-water-list': {
    title: 'Waste Water Calculators',
    description: 'Free waste water energy calculators: O₂ utilization rate, state point analysis, and valve energy loss for industrial wastewater treatment.',
    canonicalPath: '/calculators/waste-water-list',
    keywords: `${SHARED_KEYWORDS}, wastewater treatment energy, aeration efficiency, oxygen utilization, activated sludge calculator`,
  },

  // ── General / Utility Calculators ────────────────────────────────────────
  '/calculators/unit-converter': {
    title: 'Unit Converter',
    description: 'Perform quick unit conversion calculations across a wide range of engineering and energy units.',
    canonicalPath: '/calculators/unit-converter',
    keywords: `${SHARED_KEYWORDS}, unit converter, engineering unit conversion, energy unit converter, BTU conversion, kWh conversion`,
  },
  '/calculators/combined-heat-power': {
    title: 'Combined Heat and Power (CHP) Calculator',
    description: 'Conduct a preliminary screening of the potential cost savings from combined heat and power (CHP) systems at your facility.',
    canonicalPath: '/calculators/combined-heat-power',
    keywords: `${SHARED_KEYWORDS}, combined heat and power calculator, CHP screening, cogeneration calculator, CHP cost savings`,
  },
  '/calculators/cash-flow': {
    title: 'Cash Flow Calculator',
    description: 'Plot the savings and costs associated with an energy efficiency investment to evaluate payback period and net present value.',
    canonicalPath: '/calculators/cash-flow',
    keywords: `${SHARED_KEYWORDS}, energy investment cash flow, payback period calculator, energy project ROI, simple payback calculator`,
  },
  '/calculators/power-factor-correction': {
    title: 'Power Factor Correction Calculator',
    description: 'Identify the capacitance (in kVAR) required to improve power factor to a target level and reduce electricity costs.',
    canonicalPath: '/calculators/power-factor-correction',
    keywords: `${SHARED_KEYWORDS}, power factor correction, kVAR calculator, capacitor bank sizing, power factor improvement, reactive power`,
  },
  '/calculators/power-factor-triangle': {
    title: 'Power Factor Triangle Calculator',
    description: 'Calculate apparent power, real power, reactive power, and power factor angle using the power factor triangle.',
    canonicalPath: '/calculators/power-factor-triangle',
    keywords: `${SHARED_KEYWORDS}, power factor triangle, apparent power, reactive power, real power, kVA kW kVAR calculator`,
  },
  '/calculators/co2-conversion': {
    title: 'CO₂ Conversion Calculator',
    description: 'Estimate carbon dioxide (CO₂) for given electricity and fuel uses to support carbon accounting and sustainability reporting.',
    canonicalPath: '/calculators/co2-conversion',
    keywords: `${SHARED_KEYWORDS}, CO2 calculator, carbon footprint industrial, greenhouse gas calculator, carbon accounting`,
  },
  '/calculators/electricity-reduction': {
    title: 'Electricity Reduction Calculator',
    description: 'Quantify the energy and cost savings associated with reducing electricity usage at an industrial facility.',
    canonicalPath: '/calculators/electricity-reduction',
    keywords: `${SHARED_KEYWORDS}, electricity reduction calculator, kWh savings calculator, electricity cost savings, industrial electricity use`,
  },
  '/calculators/natural-gas-reduction': {
    title: 'Natural Gas Reduction Calculator',
    description: 'Quantify the energy and cost savings associated with reducing natural gas usage at an industrial facility.',
    canonicalPath: '/calculators/natural-gas-reduction',
    keywords: `${SHARED_KEYWORDS}, natural gas reduction calculator, gas savings calculator, natural gas cost savings, industrial gas use`,
  },
  '/calculators/altitude-correction': {
    title: 'Altitude Correction Calculator',
    description: 'Calculate barometric pressure from altitude for use in compressor and combustion system calculations.',
    canonicalPath: '/calculators/altitude-correction',
    keywords: `${SHARED_KEYWORDS}, altitude correction calculator, barometric pressure altitude, elevation pressure calculator, air density altitude`,
  },
  '/calculators/weather-bins': {
    title: 'Weather Bins Calculator',
    description: 'Perform a bin analysis on TMY (Typical Meteorological Year) data to determine the number of hours per year meeting specific weather conditions.',
    canonicalPath: '/calculators/weather-bins',
    keywords: `${SHARED_KEYWORDS}, weather bin analysis, TMY data analysis, bin analysis calculator, heating degree days, cooling degree days`,
  },
  '/calculators/pre-assessment': {
    title: 'Pre-Assessment Calculator',
    description: 'Estimate preliminary energy savings opportunities before conducting a full industrial energy assessment.',
    canonicalPath: '/calculators/pre-assessment',
    keywords: `${SHARED_KEYWORDS}, energy pre-assessment, preliminary energy audit, energy savings estimate, industrial energy screening`,
  },
  '/calculators/water-reduction': {
    title: 'Water Reduction Calculator',
    description: 'Quantify the energy and cost savings associated with reducing water usage and water heating loads at an industrial facility.',
    canonicalPath: '/calculators/water-reduction',
    keywords: `${SHARED_KEYWORDS}, water reduction calculator, industrial water savings, water heating energy, water use efficiency`,
  },
  '/calculators/energy-equivalency': {
    title: 'Energy Equivalency Calculator',
    description: 'Convert energy values between different fuel types and units to compare and evaluate energy efficiency measures.',
    canonicalPath: '/calculators/energy-equivalency',
    keywords: `${SHARED_KEYWORDS}, energy equivalency calculator, fuel energy conversion, BTU equivalency, MMBTU conversion, energy comparison`,
  },
  '/calculators/energy-use': {
    title: 'Energy Use Calculator',
    description: 'Calculate and analyze energy use data for industrial facilities to identify efficiency improvement opportunities.',
    canonicalPath: '/calculators/energy-use',
    keywords: `${SHARED_KEYWORDS}, energy use calculator, industrial energy analysis, facility energy consumption, energy baseline`,
  },
  '/calculators/pipe-insulation-reduction': {
    title: 'Pipe Insulation Reduction Calculator',
    description: 'Quantify the energy savings associated with adding or improving insulation on steam or hot water distribution pipes.',
    canonicalPath: '/calculators/pipe-insulation-reduction',
    keywords: `${SHARED_KEYWORDS}, pipe insulation calculator, steam pipe heat loss, insulation energy savings, pipe heat loss reduction`,
  },
  '/calculators/tank-insulation-reduction': {
    title: 'Tank Insulation Reduction Calculator',
    description: 'Estimate energy savings from improving insulation on hot water tanks and industrial vessels.',
    canonicalPath: '/calculators/tank-insulation-reduction',
    keywords: `${SHARED_KEYWORDS}, tank insulation calculator, hot water tank heat loss, vessel insulation savings, thermal insulation calculator`,
  },

  // ── Compressed Air Calculators ───────────────────────────────────────────
  '/calculators/compressed-air-reduction': {
    title: 'Compressed Air Reduction Calculator',
    description: 'Quantify the energy and cost savings associated with reducing compressed air usage in industrial facilities.',
    canonicalPath: '/calculators/compressed-air-reduction',
    keywords: `${SHARED_KEYWORDS}, compressed air reduction, compressed air energy savings, reduce compressed air use, air compressor kWh savings`,
  },
  '/calculators/compressed-air-pressure-reduction': {
    title: 'Compressed Air Pressure Reduction Calculator',
    description: 'Quantify the energy savings associated with reducing the operating pressure of an industrial compressed air system.',
    canonicalPath: '/calculators/compressed-air-pressure-reduction',
    keywords: `${SHARED_KEYWORDS}, compressed air pressure reduction, lower system pressure savings, air compressor pressure, PSI reduction energy savings`,
  },
  '/calculators/air-leak': {
    title: 'Compressed Air Leak Survey Calculator',
    description: 'Quantify the energy and cost savings associated with identifying and repairing compressed air leaks in industrial systems.',
    canonicalPath: '/calculators/air-leak',
    keywords: `${SHARED_KEYWORDS}, compressed air leak calculator, air leak survey, air leak energy loss, compressed air leak detection, leak repair savings`,
  },
  '/calculators/air-flow-conversion': {
    title: 'Actual to Standard Airflow Conversion Calculator',
    description: 'Convert between ACFM (actual cubic feet per minute) and SCFM (standard cubic feet per minute) using ASME or CAGI/ISO standard conditions.',
    canonicalPath: '/calculators/air-flow-conversion',
    keywords: `${SHARED_KEYWORDS}, ACFM to SCFM converter, airflow conversion calculator, actual cubic feet per minute, standard cubic feet per minute`,
  },
  '/calculators/bleed-test': {
    title: 'Bleed Test (Pressure Decay) Calculator',
    description: 'Estimate compressed air leak rate using the bleed-down, dropdown, or pressure decay test method.',
    canonicalPath: '/calculators/bleed-test',
    keywords: `${SHARED_KEYWORDS}, bleed test calculator, pressure decay test, compressed air leak rate, dropdown test, air system leak estimation`,
  },
  '/calculators/bag-method': {
    title: 'Leak Loss Estimator — Bag Method Calculator',
    description: 'Estimate compressed air leakage losses using the bag method for leak detection and quantification.',
    canonicalPath: '/calculators/bag-method',
    keywords: `${SHARED_KEYWORDS}, bag method compressed air, air leak bag test, leak loss estimator, compressed air leakage quantification`,
  },
  '/calculators/pneumatic-air': {
    title: 'Pneumatic Air Requirement Calculator',
    description: 'Estimate the compressed air requirement for single-acting or double-acting piston cylinder pneumatic devices.',
    canonicalPath: '/calculators/pneumatic-air',
    keywords: `${SHARED_KEYWORDS}, pneumatic air calculator, piston cylinder air requirement, pneumatic system design, compressed air demand`,
  },
  '/calculators/receiver-tank': {
    title: 'Receiver Tank Sizing Calculator',
    description: 'Calculate the required receiver tank size for a compressed air system based on demand, supply, and pressure parameters.',
    canonicalPath: '/calculators/receiver-tank',
    keywords: `${SHARED_KEYWORDS}, receiver tank sizing, air receiver tank calculator, compressed air storage, receiver tank size`,
  },
  '/calculators/receiver-tank-usable-air': {
    title: 'Usable Air Capacity Calculator',
    description: 'Estimate the usable quantity of compressed air available from a receiver tank between specified pressure limits.',
    canonicalPath: '/calculators/receiver-tank-usable-air',
    keywords: `${SHARED_KEYWORDS}, usable air capacity, receiver tank air calculator, compressed air storage capacity, available compressed air`,
  },
  '/calculators/pipe-sizing': {
    title: 'Compressed Air Pipe Sizing Calculator',
    description: 'Determine the optimal pipe diameter for a compressed air distribution system given flow rate, pressure, and design velocity.',
    canonicalPath: '/calculators/pipe-sizing',
    keywords: `${SHARED_KEYWORDS}, compressed air pipe sizing, air distribution pipe diameter, pipe sizing calculator, compressed air piping design`,
  },
  '/calculators/air-velocity': {
    title: 'Air Velocity in Piping Calculator',
    description: 'Estimate the velocity of compressed air throughout system piping to identify potential issues with pressure drop and noise.',
    canonicalPath: '/calculators/air-velocity',
    keywords: `${SHARED_KEYWORDS}, air velocity calculator, compressed air pipe velocity, air flow velocity, piping velocity calculator`,
  },
  '/calculators/system-capacity': {
    title: 'Compressed Air System Capacity Calculator',
    description: 'Determine the total storage capacity of a compressed air system including pipes and receiver tanks.',
    canonicalPath: '/calculators/system-capacity',
    keywords: `${SHARED_KEYWORDS}, compressed air system capacity, total air storage, compressed air volume calculator, system storage calculation`,
  },
  '/calculators/operating-cost': {
    title: 'Compressor Operating Cost Calculator',
    description: 'Estimate the annual operating cost of an air compressor in fully loaded and partially loaded operating modes.',
    canonicalPath: '/calculators/operating-cost',
    keywords: `${SHARED_KEYWORDS}, compressor operating cost, air compressor cost calculator, annual compressor cost, compressor energy cost`,
  },

  // ── Fan Calculators ──────────────────────────────────────────────────────
  '/calculators/fan-system-checklist': {
    title: 'Fan System Optimization Checklist',
    description: 'Step-by-step checklist for identifying and implementing fan system energy efficiency improvements.',
    canonicalPath: '/calculators/fan-system-checklist',
    keywords: `${SHARED_KEYWORDS}, fan system checklist, fan efficiency improvement, industrial fan optimization, fan energy audit`,
  },
  '/calculators/fan-analysis': {
    title: 'Fan Traverse Analysis Calculator',
    description: 'Analyze fan traverse measurements to determine actual airflow and compare against design conditions.',
    canonicalPath: '/calculators/fan-analysis',
    keywords: `${SHARED_KEYWORDS}, fan traverse analysis, fan airflow measurement, fan performance testing, duct traverse calculation`,
  },
  '/calculators/fan-curve': {
    title: 'Fan Curve Calculator',
    description: 'Develop a fan curve and explore the effects of changes in head, flow, speed, and impeller diameter on fan performance.',
    canonicalPath: '/calculators/fan-curve',
    keywords: `${SHARED_KEYWORDS}, fan curve calculator, fan performance curve, fan affinity laws, fan speed vs flow, impeller sizing`,
  },
  '/calculators/fan-efficiency': {
    title: 'Fan Achievable Efficiency Calculator',
    description: 'Estimate the maximum achievable efficiency for various fan types and styles to evaluate upgrade potential.',
    canonicalPath: '/calculators/fan-efficiency',
    keywords: `${SHARED_KEYWORDS}, fan efficiency calculator, fan peak efficiency, achievable fan efficiency, fan type comparison`,
  },
  '/calculators/fan-psychrometric': {
    title: 'Fan Psychrometric Calculator',
    description: 'Calculate psychrometric properties of air for fan system analysis including humidity, density, and enthalpy.',
    canonicalPath: '/calculators/fan-psychrometric',
    keywords: `${SHARED_KEYWORDS}, psychrometric calculator, air density calculator, humidity enthalpy calculator, fan air properties`,
  },

  // ── Lighting Calculators ─────────────────────────────────────────────────
  '/calculators/lighting-replacement': {
    title: 'Lighting Replacement Calculator',
    description: 'Calculate the energy and cost savings associated with replacing existing lighting with more efficient fixtures in industrial and commercial facilities.',
    canonicalPath: '/calculators/lighting-replacement',
    keywords: `${SHARED_KEYWORDS}, lighting replacement calculator, LED lighting savings, lighting retrofit calculator, lighting energy savings, industrial LED upgrade`,
  },
  '/calculators/fixture': {
    title: 'Lighting Fixture Calculator',
    description: 'Analyze lighting fixture performance and calculate energy use for industrial lighting systems.',
    canonicalPath: '/calculators/fixture',
    keywords: `${SHARED_KEYWORDS}, lighting fixture calculator, industrial lighting, fixture energy use, lumens per watt calculator`,
  },

  // ── Motor Calculators ────────────────────────────────────────────────────
  '/calculators/nema-energy-efficiency': {
    title: 'NEMA Motor Energy Efficiency Calculator',
    description: 'View predicted efficiency of NEMA induction motors based on horsepower rating, rotating speed, and efficiency class.',
    canonicalPath: '/calculators/nema-energy-efficiency',
    keywords: `${SHARED_KEYWORDS}, NEMA motor efficiency, induction motor efficiency, motor efficiency class, NEMA premium efficiency, motor hp efficiency`,
  },
  '/calculators/motor-performance': {
    title: 'Motor Performance Calculator',
    description: 'Plot current, efficiency, and power factor versus motor shaft load for a given motor to analyze part-load performance.',
    canonicalPath: '/calculators/motor-performance',
    keywords: `${SHARED_KEYWORDS}, motor performance calculator, motor efficiency curve, motor part load efficiency, motor shaft load, motor current calculator`,
  },
  '/calculators/percent-load-estimation': {
    title: 'Motor Percent Load Estimation Calculator',
    description: 'Calculate the percent load of an operating motor using field measurements such as current, voltage, and power.',
    canonicalPath: '/calculators/percent-load-estimation',
    keywords: `${SHARED_KEYWORDS}, motor load estimation, percent load calculator, motor field measurement, motor loading calculator, motor amps load`,
  },
  '/calculators/motor-drive': {
    title: 'Motor Drive Comparison Calculator',
    description: 'Compare the annual energy cost of different motor drive options including variable frequency drives (VFDs) for industrial applications.',
    canonicalPath: '/calculators/motor-drive',
    keywords: `${SHARED_KEYWORDS}, motor drive comparison, VFD savings calculator, variable frequency drive energy savings, motor drive efficiency`,
  },
  '/calculators/replace-existing': {
    title: 'Replace vs. Rewind Motor Calculator',
    description: 'Compare the life-cycle cost and energy savings of rewinding a failed motor versus replacing it with a new energy-efficient motor.',
    canonicalPath: '/calculators/replace-existing',
    keywords: `${SHARED_KEYWORDS}, motor rewind vs replace, motor replacement calculator, motor rewind cost, energy efficient motor replacement`,
  },
  '/calculators/full-load-amps': {
    title: 'Motor Full-Load Amps Calculator',
    description: 'Calculate the full-load amperage (FLA) of a three-phase induction motor from nameplate data.',
    canonicalPath: '/calculators/full-load-amps',
    keywords: `${SHARED_KEYWORDS}, full load amps calculator, motor FLA, motor nameplate amps, three phase motor current, motor amperage`,
  },

  // ── Process Heating (Furnace) Calculators ────────────────────────────────
  '/calculators/o2-enrichment': {
    title: 'O₂ Enrichment Calculator',
    description: 'Calculate the energy savings from oxygen enrichment of combustion air in industrial furnaces and process heating systems.',
    canonicalPath: '/calculators/o2-enrichment',
    keywords: `${SHARED_KEYWORDS}, oxygen enrichment calculator, combustion oxygen enrichment, furnace O2 enrichment, oxy-fuel combustion savings`,
  },
  '/calculators/atmosphere': {
    title: 'Furnace Atmosphere Calculator',
    description: 'Analyze furnace atmosphere composition and heat losses for process heating systems.',
    canonicalPath: '/calculators/atmosphere',
    keywords: `${SHARED_KEYWORDS}, furnace atmosphere calculator, controlled atmosphere furnace, furnace gas composition, heat treating atmosphere`,
  },
  '/calculators/cooling': {
    title: 'Furnace Cooling Loss Calculator',
    description: 'Calculate heat losses from furnace cooling water and cooling systems to identify energy savings opportunities.',
    canonicalPath: '/calculators/cooling',
    keywords: `${SHARED_KEYWORDS}, furnace cooling loss, furnace water cooling, furnace heat loss calculator, cooling jacket heat loss`,
  },
  '/calculators/wall-loss': {
    title: 'Furnace Wall Loss Calculator',
    description: 'Calculate heat losses through furnace walls and refractory materials to assess insulation improvement opportunities.',
    canonicalPath: '/calculators/wall-loss',
    keywords: `${SHARED_KEYWORDS}, furnace wall loss, refractory heat loss, furnace insulation calculator, furnace wall heat loss`,
  },
  '/calculators/opening': {
    title: 'Furnace Opening Loss Calculator',
    description: 'Calculate radiation heat losses through furnace openings, doors, and slots to identify sealing improvement opportunities.',
    canonicalPath: '/calculators/opening',
    keywords: `${SHARED_KEYWORDS}, furnace opening loss, furnace door heat loss, radiation loss furnace, furnace slot heat loss`,
  },
  '/calculators/heat-cascading': {
    title: 'Heat Cascading Calculator',
    description: 'Evaluate opportunities to recover and reuse waste heat from high-temperature processes in lower-temperature applications.',
    canonicalPath: '/calculators/heat-cascading',
    keywords: `${SHARED_KEYWORDS}, heat cascading calculator, waste heat recovery, heat integration, process heat reuse, cascading heat`,
  },
  '/calculators/flue-gas': {
    title: 'Flue Gas Analysis Calculator',
    description: 'Analyze flue gas composition and calculate combustion efficiency, excess air, and heat loss for industrial burners and furnaces.',
    canonicalPath: '/calculators/flue-gas',
    keywords: `${SHARED_KEYWORDS}, flue gas analysis, combustion efficiency calculator, excess air calculator, flue gas heat loss, boiler flue gas`,
  },
  '/calculators/air-heating': {
    title: 'Combustion Air Heating Calculator',
    description: 'Calculate the energy savings from preheating combustion air using waste heat from industrial furnaces and kilns.',
    canonicalPath: '/calculators/air-heating',
    keywords: `${SHARED_KEYWORDS}, combustion air preheat, recuperator savings, air preheater calculator, furnace combustion air savings`,
  },
  '/calculators/waste-heat': {
    title: 'Waste Heat Reduction Calculator',
    description: 'Quantify recoverable waste heat from industrial processes and estimate the potential energy savings from heat recovery.',
    canonicalPath: '/calculators/waste-heat',
    keywords: `${SHARED_KEYWORDS}, waste heat recovery calculator, industrial heat recovery, exhaust heat recovery, waste heat potential`,
  },
  '/calculators/charge-material': {
    title: 'Charge Material Heat Loss Calculator',
    description: 'Calculate heat losses absorbed by charge materials in industrial furnaces and process heating equipment.',
    canonicalPath: '/calculators/charge-material',
    keywords: `${SHARED_KEYWORDS}, charge material heat loss, furnace charge heating, process heating charge, heat treating energy`,
  },
  '/calculators/leakage': {
    title: 'Furnace Leakage Loss Calculator',
    description: 'Estimate heat losses from air infiltration and gas leakage in industrial furnaces.',
    canonicalPath: '/calculators/leakage',
    keywords: `${SHARED_KEYWORDS}, furnace leakage loss, air infiltration furnace, furnace gas leakage, furnace infiltration heat loss`,
  },
  '/calculators/stack-loss': {
    title: 'Stack Loss Calculator',
    description: 'Calculate flue gas stack losses and combustion efficiency for gas-fired industrial furnaces and process heaters.',
    canonicalPath: '/calculators/stack-loss',
    keywords: `${SHARED_KEYWORDS}, stack loss calculator, flue gas stack loss, combustion stack loss, furnace efficiency stack`,
  },

  // ── Pump Calculators ─────────────────────────────────────────────────────
  '/calculators/achievable-efficiency': {
    title: 'Pump Achievable Efficiency Calculator',
    description: 'Estimate the maximum achievable hydraulic efficiency for centrifugal pumps based on specific speed and flow rate.',
    canonicalPath: '/calculators/achievable-efficiency',
    keywords: `${SHARED_KEYWORDS}, pump achievable efficiency, centrifugal pump efficiency, pump maximum efficiency, hydraulic efficiency calculator`,
  },
  '/calculators/head-tool': {
    title: 'Pump Head Tool Calculator',
    description: 'Calculate total dynamic head (TDH) for a pump system from suction and discharge pressure measurements.',
    canonicalPath: '/calculators/head-tool',
    keywords: `${SHARED_KEYWORDS}, pump head calculator, total dynamic head, TDH calculator, pump suction discharge head`,
  },
  '/calculators/specific-speed': {
    title: 'Pump Specific Speed Calculator',
    description: 'Calculate the specific speed of a centrifugal pump to characterize its design and select the optimal pump type.',
    canonicalPath: '/calculators/specific-speed',
    keywords: `${SHARED_KEYWORDS}, pump specific speed, centrifugal pump design, pump selection calculator, specific speed Ns`,
  },
  '/calculators/pump-curve': {
    title: 'Pump Curve Calculator',
    description: 'Develop a pump curve and analyze the interaction between pump performance and system resistance curves.',
    canonicalPath: '/calculators/pump-curve',
    keywords: `${SHARED_KEYWORDS}, pump curve calculator, pump performance curve, system curve, pump operating point, pump affinity laws`,
  },

  // ── Steam Calculators ────────────────────────────────────────────────────
  '/calculators/boiler': {
    title: 'Boiler Efficiency Calculator',
    description: 'Calculate boiler efficiency, fuel consumption, and steam generation for industrial steam boilers.',
    canonicalPath: '/calculators/boiler',
    keywords: `${SHARED_KEYWORDS}, boiler efficiency calculator, industrial boiler, steam boiler efficiency, boiler fuel consumption`,
  },
  '/calculators/boiler-blowdown-rate': {
    title: 'Boiler Blowdown Rate Calculator',
    description: 'Calculate the optimal boiler blowdown rate to control dissolved solids while minimizing energy waste.',
    canonicalPath: '/calculators/boiler-blowdown-rate',
    keywords: `${SHARED_KEYWORDS}, boiler blowdown calculator, blowdown rate, boiler TDS control, boiler water treatment energy`,
  },
  '/calculators/deaerator': {
    title: 'Deaerator Calculator',
    description: 'Analyze deaerator performance and calculate steam and feedwater flows for industrial boiler systems.',
    canonicalPath: '/calculators/deaerator',
    keywords: `${SHARED_KEYWORDS}, deaerator calculator, boiler deaerator, feedwater deaeration, oxygen removal boiler`,
  },
  '/calculators/flash-tank': {
    title: 'Flash Tank Calculator',
    description: 'Calculate flash steam generation and energy recovery potential from high-pressure condensate in steam systems.',
    canonicalPath: '/calculators/flash-tank',
    keywords: `${SHARED_KEYWORDS}, flash tank calculator, flash steam calculator, condensate flash steam, steam condensate recovery`,
  },
  '/calculators/header': {
    title: 'Steam Header Calculator',
    description: 'Analyze steam header conditions and calculate heat and mass balances for multi-pressure steam distribution systems.',
    canonicalPath: '/calculators/header',
    keywords: `${SHARED_KEYWORDS}, steam header calculator, steam distribution system, steam balance, multi-pressure steam header`,
  },
  '/calculators/heat-loss': {
    title: 'Steam Heat Loss Calculator',
    description: 'Calculate heat losses from steam distribution piping, fittings, and insulation in industrial steam systems.',
    canonicalPath: '/calculators/heat-loss',
    keywords: `${SHARED_KEYWORDS}, steam heat loss, steam pipe heat loss, steam distribution loss, steam insulation savings`,
  },
  '/calculators/prv': {
    title: 'Pressure Reducing Valve (PRV) Calculator',
    description: 'Analyze pressure reducing valve performance and calculate steam conditions downstream of PRV stations.',
    canonicalPath: '/calculators/prv',
    keywords: `${SHARED_KEYWORDS}, PRV calculator, pressure reducing valve steam, steam pressure reduction, PRV station steam`,
  },
  '/calculators/saturated-properties': {
    title: 'Saturated Steam Properties Calculator',
    description: 'Look up saturated steam and water properties (enthalpy, entropy, specific volume) at any pressure or temperature.',
    canonicalPath: '/calculators/saturated-properties',
    keywords: `${SHARED_KEYWORDS}, saturated steam properties, steam tables calculator, steam enthalpy, steam entropy, saturated water properties`,
  },
  '/calculators/steam-properties': {
    title: 'Steam Properties Calculator',
    description: 'Calculate thermodynamic properties of steam and water including enthalpy, entropy, density, and quality at any state point.',
    canonicalPath: '/calculators/steam-properties',
    keywords: `${SHARED_KEYWORDS}, steam properties calculator, steam thermodynamic properties, superheated steam, steam quality calculator, steam tables`,
  },
  '/calculators/condensing-economizer': {
    title: 'Condensing Economizer Calculator',
    description: 'Estimate energy savings from installing a condensing economizer to recover heat from boiler flue gases.',
    canonicalPath: '/calculators/condensing-economizer',
    keywords: `${SHARED_KEYWORDS}, condensing economizer, boiler economizer savings, flue gas heat recovery, condensing heat recovery`,
  },
  '/calculators/turbine': {
    title: 'Steam Turbine Calculator',
    description: 'Calculate steam turbine performance, steam flows, and power output for backpressure and condensing turbines.',
    canonicalPath: '/calculators/turbine',
    keywords: `${SHARED_KEYWORDS}, steam turbine calculator, backpressure turbine, condensing turbine, turbine power output, steam turbine efficiency`,
  },
  '/calculators/steam-reduction': {
    title: 'Steam Reduction Calculator',
    description: 'Quantify the energy and cost savings associated with reducing steam consumption at an industrial facility.',
    canonicalPath: '/calculators/steam-reduction',
    keywords: `${SHARED_KEYWORDS}, steam reduction calculator, reduce steam use, steam energy savings, steam consumption reduction`,
  },
  '/calculators/water-heating': {
    title: 'Water Heating Calculator',
    description: 'Calculate the energy required to heat water and estimate savings from water heating system improvements.',
    canonicalPath: '/calculators/water-heating',
    keywords: `${SHARED_KEYWORDS}, water heating calculator, hot water energy, water heat load, industrial water heating energy`,
  },
  '/calculators/feedwater-economizer': {
    title: 'Feedwater Economizer Calculator',
    description: 'Estimate energy savings from installing a feedwater economizer to preheat boiler feedwater using flue gas heat.',
    canonicalPath: '/calculators/feedwater-economizer',
    keywords: `${SHARED_KEYWORDS}, feedwater economizer, boiler feedwater preheat, economizer savings, stack heat recovery boiler`,
  },

  // ── Process Cooling Calculators ──────────────────────────────────────────
  '/calculators/cooling-tower-fan': {
    title: 'Cooling Tower Fan Calculator',
    description: 'Calculate cooling tower fan energy use and savings from fan speed adjustments and variable frequency drives.',
    canonicalPath: '/calculators/cooling-tower-fan',
    keywords: `${SHARED_KEYWORDS}, cooling tower fan calculator, cooling tower fan VFD, cooling tower fan energy, cooling tower optimization`,
  },
  '/calculators/cooling-tower': {
    title: 'Cooling Tower Performance Calculator',
    description: 'Analyze cooling tower performance, approach temperature, and efficiency for industrial process cooling systems.',
    canonicalPath: '/calculators/cooling-tower',
    keywords: `${SHARED_KEYWORDS}, cooling tower performance, cooling tower approach temperature, cooling tower efficiency, industrial cooling tower`,
  },
  '/calculators/chiller-performance': {
    title: 'Chiller Performance Calculator',
    description: 'Calculate chiller COP, kW/ton, and energy use for mechanical refrigeration systems in industrial and commercial facilities.',
    canonicalPath: '/calculators/chiller-performance',
    keywords: `${SHARED_KEYWORDS}, chiller performance calculator, chiller COP, chiller kW per ton, chiller efficiency, centrifugal chiller`,
  },
  '/calculators/cooling-tower-basin': {
    title: 'Cooling Tower Basin Heater Calculator',
    description: 'Calculate energy use and savings opportunities for cooling tower basin heaters used to prevent freezing.',
    canonicalPath: '/calculators/cooling-tower-basin',
    keywords: `${SHARED_KEYWORDS}, cooling tower basin heater, basin heater energy, cooling tower freeze protection, basin heater savings`,
  },
  '/calculators/chiller-staging': {
    title: 'Chiller Staging Calculator',
    description: 'Optimize chiller plant energy efficiency by analyzing the most efficient staging and sequencing of multiple chillers.',
    canonicalPath: '/calculators/chiller-staging',
    keywords: `${SHARED_KEYWORDS}, chiller staging calculator, chiller sequencing, chiller plant optimization, multiple chiller efficiency`,
  },

  // ── Waste Water Calculators ──────────────────────────────────────────────
  '/calculators/o2-utilization-rate': {
    title: 'O₂ Utilization Rate Calculator',
    description: 'Calculate oxygen utilization rate and aeration efficiency for wastewater treatment aeration systems.',
    canonicalPath: '/calculators/o2-utilization-rate',
    keywords: `${SHARED_KEYWORDS}, oxygen utilization rate, aeration efficiency calculator, wastewater aeration, O2 transfer efficiency`,
  },
  '/calculators/state-point-analysis': {
    title: 'State Point Analysis Calculator',
    description: 'Perform state point analysis for secondary clarifiers in activated sludge wastewater treatment systems.',
    canonicalPath: '/calculators/state-point-analysis',
    keywords: `${SHARED_KEYWORDS}, state point analysis, secondary clarifier, activated sludge, clarifier loading, wastewater solids`,
  },
  '/calculators/valve-energy-loss': {
    title: 'Valve Energy Loss Calculator',
    description: 'Estimate energy losses across throttling valves in wastewater treatment and industrial piping systems.',
    canonicalPath: '/calculators/valve-energy-loss',
    keywords: `${SHARED_KEYWORDS}, valve energy loss, throttling valve loss, valve pressure drop, control valve energy loss`,
  },
};
