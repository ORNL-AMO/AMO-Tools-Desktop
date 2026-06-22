import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentService } from '../assessment.service';
import { DashboardService } from '../dashboard.service';
import { FeedItem, HomeFeedService } from '../../shared/home-feed/home-feed.service';
import { RecentItem, RecentlyAccessedService } from '../../shared/recently-accessed/recently-accessed.service';
import { environment } from '../../../environments/environment';

interface AssessmentCard {
  id: string;
  label: string;
  img: string;
  gradient: string;
  badge?: string;
}

interface CalculatorCard {
  id: string;
  label: string;
  img: string;
  route: string;
}

interface ModelingCard {
  id: string;
  label: string;
  img: string;
  gradient: string;
  badge?: string;
  route?: string;
  action?: string;
}

interface CalculatorTab {
  id: string;
  label: string;
  gradient: string;
  calculators: CalculatorCard[];
}

@Component({
    selector: 'app-landing-screen',
    templateUrl: './landing-screen.component.html',
    styleUrls: ['./landing-screen.component.css'],
    standalone: false
})
export class LandingScreenComponent implements OnInit, OnDestroy {
  feedItems: FeedItem[] = [];
  showAllNotifications = false;
  readonly notificationsPageSize = 2;
  recentItems: RecentItem[] = [];
  private feedSub: Subscription;

  showGettingStarted = true;
  completedGsSteps = new Set<string>();
  private readonly gsStepIds = ['gs-create', 'gs-import', 'gs-explore', 'gs-pin'];
  pinnedIds = new Set<string>();

  get allGsStepsDone(): boolean {
    return this.completedGsSteps.size >= this.gsStepIds.length;
  }

  completeGsStep(id: string): void {
    const next = new Set(this.completedGsSteps);
    next.add(id);
    this.completedGsSteps = next;
  }
  activeCalculatorTab = 'pumps';
  pinnedCalcIds = new Set<string>();
  pinnedModelingIds = new Set<string>();

  readonly modelingCards: ModelingCard[] = [
    { id: 'modeling-water-diagram', label: 'Water Diagram',              img: 'assets/images/water-process-diagram-large.png', gradient: 'linear-gradient(160deg, #d4e2f4, #306dbe)', badge: 'Beta', action: 'diagram' },
    { id: 'modeling-data-exploration', label: 'Data Exploration',        img: 'assets/images/data-explorer-icon.png',          gradient: 'linear-gradient(160deg, #a2d9ce, #117a65)', route: '/log-tool' },
    { id: 'modeling-motor-inventory', label: 'Motor Inventory',          img: 'assets/images/motor-inventory-icon.png',        gradient: 'linear-gradient(160deg, #d5f5e3, #1e8449)', action: 'inventory-motorInventory' },
    { id: 'modeling-pump-inventory', label: 'Pump Inventory',            img: 'assets/images/pump-inventory-icon.png',         gradient: 'linear-gradient(160deg, #aed6f1, #2471a3)', action: 'inventory-pumpInventory' },
    { id: 'modeling-ca-inventory', label: 'Compressed Air Inventory',    img: 'assets/images/ca-inventory-icon.png',           gradient: 'linear-gradient(160deg, #d7bde2, #7030a0)', action: 'inventory-compressedAirInventory' },
  ];

  readonly assessmentCards: AssessmentCard[] = [
    { id: 'Pump',          label: 'Pump',             img: 'assets/images/pump.png',                      gradient: 'linear-gradient(160deg, #5dade2, #2471a3)' },
    { id: 'CompressedAir', label: 'Compressed Air',   img: 'assets/images/ca-icon.png',                   gradient: 'linear-gradient(160deg, #d2b4de, #8e44ad)' },
    { id: 'Furnace',       label: 'Process Heating',  img: 'assets/images/ph.png',                        gradient: 'linear-gradient(160deg, #f0b27a, #e67e22)' },
    { id: 'Fan',           label: 'Fan',              img: 'assets/images/ico-fsat-diagram.png',           gradient: 'linear-gradient(160deg, #f9e79f, #d4ac0d)' },
    { id: 'Steam',         label: 'Steam',            img: 'assets/images/ico-ssmt-diagram.png',          gradient: 'linear-gradient(160deg, #fad7a0, #ca6f1e)' },
    { id: 'TreasureHunt',  label: 'Treasure Hunt',    img: 'assets/images/treasure-hunt.png',             gradient: 'linear-gradient(160deg, #7f8c8d, #2c3e50)' },
    { id: 'WasteWater',    label: 'Wastewater',       img: 'assets/images/waste-water-icon-landing.png',  gradient: 'linear-gradient(160deg, #a9cce3, #2e86c1)' },
    { id: 'Water',         label: 'Water',            img: 'assets/images/water-assessment-large.png',    gradient: 'linear-gradient(160deg, #d4e2f4, #306dbe)', badge: 'Beta' },
  ];

  readonly calculatorTabs: CalculatorTab[] = [
    {
      id: 'pumps', label: 'Pumps', gradient: 'linear-gradient(160deg, #5dade2, #2471a3)',
      calculators: [
        { id: 'calc-head-tool',      label: 'Pump Head Tool',        img: 'assets/images/calculator-icons/pump-icons/head-tool.png',         route: '/calculators/head-tool' },
        { id: 'calc-specific-speed', label: 'Specific Speed',        img: 'assets/images/calculator-icons/pump-icons/speed-tran.png',        route: '/calculators/specific-speed' },
        { id: 'calc-pump-eff',       label: 'Achievable Efficiency', img: 'assets/images/calculator-icons/pump-icons/pump-efficiency.png',   route: '/calculators/achievable-efficiency' },
        { id: 'calc-pump-curve',     label: 'Pump Curve',            img: 'assets/images/calculator-icons/pump-icons/system-curve-tran.png', route: '/calculators/pump-curve' },
        { id: 'calc-valve-energy',   label: 'Valve Energy Loss',     img: 'assets/images/calculator-icons/pump-icons/valve.png',             route: '/calculators/valve-energy-loss' },
      ]
    },
    {
      id: 'fans', label: 'Fans', gradient: 'linear-gradient(160deg, #f9e79f, #d4ac0d)',
      calculators: [
        { id: 'calc-fan-traverse',   label: 'Fan Traverse',        img: 'assets/images/calculator-icons/fan-icons/operating-point-icon.png', route: '/calculators/fan-analysis' },
        { id: 'calc-fan-curve',      label: 'Fan Curve',           img: 'assets/images/calculator-icons/fan-icons/system-curve-tran.png',   route: '/calculators/fan-curve' },
        { id: 'calc-fan-eff',        label: 'Achievable Efficiency', img: 'assets/images/calculator-icons/fan-icons/pump-eff.png',          route: '/calculators/fan-efficiency' },
        { id: 'calc-fan-checklist',  label: 'System Checklist',    img: 'assets/images/calculator-icons/utilities-icons/assessment.png',    route: '/calculators/fan-system-checklist' },
      ]
    },
    {
      id: 'compressed-air', label: 'Compressed Air', gradient: 'linear-gradient(160deg, #d2b4de, #8e44ad)',
      calculators: [
        { id: 'calc-ca-reduction',    label: 'Air Reduction',         img: 'assets/images/calculator-icons/utilities-icons/compressed-air-reduction-icon.png',          route: '/calculators/compressed-air-reduction' },
        { id: 'calc-ca-pressure',     label: 'Pressure Reduction',    img: 'assets/images/calculator-icons/utilities-icons/compressed-air-pressure-reduction-icon.png', route: '/calculators/compressed-air-pressure-reduction' },
        { id: 'calc-air-leak',        label: 'Leak Survey',           img: 'assets/images/calculator-icons/compressed-air-icons/CAleak-icon.png',                       route: '/calculators/air-leak' },
        { id: 'calc-airflow-conv',    label: 'Airflow Conversion',    img: 'assets/images/calculator-icons/compressed-air-icons/scfm-acfm-icon.png',                    route: '/calculators/air-flow-conversion' },
        { id: 'calc-bleed-test',      label: 'Bleed Test',            img: 'assets/images/calculator-icons/compressed-air-icons/bleedTestIcon.png',                     route: '/calculators/bleed-test' },
        { id: 'calc-bag-method',      label: 'Leak Loss Estimator',   img: 'assets/images/calculator-icons/compressed-air-icons/leakage-loss-estimator.png',            route: '/calculators/bag-method' },
        { id: 'calc-pneumatic-air',   label: 'Pneumatic Air',         img: 'assets/images/calculator-icons/compressed-air-icons/pneumatic-air-requirement.png',         route: '/calculators/pneumatic-air' },
        { id: 'calc-receiver-tank',   label: 'Receiver Tank Sizing',  img: 'assets/images/calculator-icons/compressed-air-icons/receiver-tank-calculation.png',         route: '/calculators/receiver-tank' },
        { id: 'calc-usable-air',      label: 'Usable Air Capacity',   img: 'assets/images/calculator-icons/compressed-air-icons/receiver-tank-calculation.png',         route: '/calculators/receiver-tank-usable-air' },
        { id: 'calc-pipe-sizing',     label: 'Pipe Sizing',           img: 'assets/images/calculator-icons/compressed-air-icons/pipe-sizing.png',                       route: '/calculators/pipe-sizing' },
        { id: 'calc-air-velocity',    label: 'Velocity in Piping',    img: 'assets/images/calculator-icons/compressed-air-icons/velocity-in-piping.png',                route: '/calculators/air-velocity' },
        { id: 'calc-system-capacity', label: 'System Capacity',       img: 'assets/images/calculator-icons/compressed-air-icons/air-system-capacity.png',               route: '/calculators/system-capacity' },
        { id: 'calc-operating-cost',  label: 'Operation Costs',       img: 'assets/images/calculator-icons/compressed-air-icons/operation-cost.png',                    route: '/calculators/operating-cost' },
      ]
    },
    {
      id: 'steam', label: 'Steam', gradient: 'linear-gradient(160deg, #fad7a0, #ca6f1e)',
      calculators: [
        { id: 'calc-steam-props',     label: 'Steam Properties',       img: 'assets/images/calculator-icons/steam-icons/steam-properties.png',      route: '/calculators/steam-properties' },
        { id: 'calc-sat-props',       label: 'Saturated Properties',   img: 'assets/images/calculator-icons/steam-icons/saturated-properties.png',  route: '/calculators/saturated-properties' },
        { id: 'calc-steam-reduction', label: 'Steam Reduction',        img: 'assets/images/calculator-icons/utilities-icons/steam-reduction-icon.png', route: '/calculators/steam-reduction' },
        { id: 'calc-stack-loss',      label: 'Stack Loss',             img: 'assets/images/calculator-icons/steam-icons/stack-loss.png',             route: '/calculators/stack-loss' },
        { id: 'calc-boiler',          label: 'Boiler',                 img: 'assets/images/calculator-icons/steam-icons/boiler.png',                 route: '/calculators/boiler' },
        { id: 'calc-turbine',         label: 'Steam Turbine',          img: 'assets/images/calculator-icons/steam-icons/steam-turbine.png',          route: '/calculators/turbine' },
        { id: 'calc-pipe-ins',        label: 'Pipe Insulation',        img: 'assets/images/calculator-icons/utilities-icons/pipe-ins.png',           route: '/calculators/pipe-insulation-reduction' },
        { id: 'calc-tank-ins',        label: 'Tank Insulation',        img: 'assets/images/calculator-icons/utilities-icons/tank-ins.png',           route: '/calculators/tank-insulation-reduction' },
        { id: 'calc-blowdown',        label: 'Boiler Blowdown',        img: 'assets/images/calculator-icons/steam-icons/blowdown-rate.png',          route: '/calculators/boiler-blowdown-rate' },
        { id: 'calc-deaerator',       label: 'Deaerator',              img: 'assets/images/calculator-icons/steam-icons/deaerator.png',              route: '/calculators/deaerator' },
        { id: 'calc-flash-tank',      label: 'Flash Tank',             img: 'assets/images/calculator-icons/steam-icons/flash-tank.png',             route: '/calculators/flash-tank' },
        { id: 'calc-prv',             label: 'PRV',                    img: 'assets/images/calculator-icons/steam-icons/prv.png',                    route: '/calculators/prv' },
        { id: 'calc-header',          label: 'Header',                 img: 'assets/images/calculator-icons/steam-icons/header.png',                 route: '/calculators/header' },
        { id: 'calc-heat-loss',       label: 'Heat Loss',              img: 'assets/images/calculator-icons/steam-icons/heat-loss.png',              route: '/calculators/heat-loss' },
        { id: 'calc-water-heating',   label: 'Vent Steam to Heat Water', img: 'assets/images/calculator-icons/steam-icons/water-heating-icon.png',  route: '/calculators/water-heating' },
        { id: 'calc-condensing-econ', label: 'Condensing Economizer',  img: 'assets/images/calculator-icons/steam-icons/condensing-economizer.png', route: '/calculators/condensing-economizer' },
        { id: 'calc-feedwater-econ',  label: 'Feedwater Economizer',   img: 'assets/images/calculator-icons/steam-icons/feedwater-econ-icon.png',   route: '/calculators/feedwater-economizer' },
      ]
    },
    {
      id: 'process-heating', label: 'Process Heating', gradient: 'linear-gradient(160deg, #f0b27a, #e67e22)',
      calculators: [
        { id: 'calc-ph-preassess',    label: 'Pre-Assessment',        img: 'assets/images/calculator-icons/utilities-icons/assessment.png',           route: '/calculators/pre-assessment' },
        { id: 'calc-flue-gas',        label: 'Flue Gas Loss',         img: 'assets/images/calculator-icons/furnace-icons/fluegas.png',                route: '/calculators/flue-gas' },
        { id: 'calc-charge-material', label: 'Charge Material',       img: 'assets/images/calculator-icons/furnace-icons/charge-materials.png',       route: '/calculators/charge-material' },
        { id: 'calc-fixture',         label: 'Fixture Loss',          img: 'assets/images/calculator-icons/furnace-icons/fixture.png',                route: '/calculators/fixture' },
        { id: 'calc-wall-loss',       label: 'Wall Loss',             img: 'assets/images/calculator-icons/furnace-icons/wall-loss.png',              route: '/calculators/wall-loss' },
        { id: 'calc-cooling-loss',    label: 'Cooling Loss',          img: 'assets/images/calculator-icons/furnace-icons/cooling.png',                route: '/calculators/cooling' },
        { id: 'calc-atmosphere',      label: 'Atmosphere Loss',       img: 'assets/images/calculator-icons/furnace-icons/atmosphere.png',             route: '/calculators/atmosphere' },
        { id: 'calc-opening',         label: 'Opening Loss',          img: 'assets/images/calculator-icons/furnace-icons/opening.png',                route: '/calculators/opening' },
        { id: 'calc-leakage',         label: 'Gas Leakage Loss',      img: 'assets/images/calculator-icons/furnace-icons/leakage.png',                route: '/calculators/leakage' },
        { id: 'calc-waste-heat',      label: 'Waste Heat',            img: 'assets/images/calculator-icons/furnace-icons/waste-heat-icon.png',        route: '/calculators/waste-heat' },
        { id: 'calc-heat-cascade',    label: 'Heat Cascading',        img: 'assets/images/calculator-icons/furnace-icons/heat-cascading.png',         route: '/calculators/heat-cascading' },
        { id: 'calc-air-heating',     label: 'Air Heating (Flue Gas)', img: 'assets/images/calculator-icons/furnace-icons/air-heating-icon.png',     route: '/calculators/air-heating' },
        { id: 'calc-o2-enrich',       label: 'O2 Enrichment',         img: 'assets/images/calculator-icons/furnace-icons/o2.png',                    route: '/calculators/o2-enrichment' },
        { id: 'calc-energy-equiv',    label: 'Fuel to Electricity',   img: 'assets/images/calculator-icons/furnace-icons/energy-equ.png',             route: '/calculators/energy-equivalency' },
        { id: 'calc-orifice',         label: 'Orifice Meter Flow',    img: 'assets/images/calculator-icons/furnace-icons/flow.png',                   route: '/calculators/energy-use' },
      ]
    },
    {
      id: 'motors', label: 'Motors', gradient: 'linear-gradient(160deg, #d5f5e3, #1e8449)',
      calculators: [
        { id: 'calc-nema',           label: 'NEMA Efficiency',       img: 'assets/images/calculator-icons/motor-icons/nema.png',           route: '/calculators/nema-energy-efficiency' },
        { id: 'calc-motor-perf',     label: 'Motor Performance',     img: 'assets/images/calculator-icons/motor-icons/performance.png',    route: '/calculators/motor-performance' },
        { id: 'calc-percent-load',   label: 'Percent Load',          img: 'assets/images/calculator-icons/motor-icons/load-est.png',       route: '/calculators/percent-load-estimation' },
        { id: 'calc-motor-drive',    label: 'Motor Drive Comparison', img: 'assets/images/calculator-icons/motor-icons/motor-drive.png',  route: '/calculators/motor-drive' },
        { id: 'calc-replace-rewind', label: 'Replace vs Rewind',     img: 'assets/images/calculator-icons/motor-icons/replace.png',       route: '/calculators/replace-existing' },
        { id: 'calc-full-load-amps', label: 'Full-Load Amps',        img: 'assets/images/calculator-icons/motor-icons/full-load-amps.png', route: '/calculators/full-load-amps' },
      ]
    },
    {
      id: 'process-cooling', label: 'Process Cooling', gradient: 'linear-gradient(160deg, #a2d9ce, #117a65)',
      calculators: [
        { id: 'calc-chiller-staging', label: 'Chiller Staging',        img: 'assets/images/calculator-icons/process-cooling-icons/chiller-staging.png',           route: '/calculators/chiller-staging' },
        { id: 'calc-chiller-perf',    label: 'Chiller Performance',    img: 'assets/images/calculator-icons/process-cooling-icons/chiller-performance.png',       route: '/calculators/chiller-performance' },
        { id: 'calc-ct-basin',        label: 'Cooling Tower Basin',    img: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-basin-heater.png', route: '/calculators/cooling-tower-basin' },
        { id: 'calc-ct-fan',          label: 'Cooling Tower Fan',      img: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-fan.png',         route: '/calculators/cooling-tower-fan' },
        { id: 'calc-ct-makeup',       label: 'Cooling Tower Makeup',   img: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-makeup-water.png', route: '/calculators/cooling-tower' },
        { id: 'calc-psychrometric',   label: 'Psychrometric Calc',     img: 'assets/images/calculator-icons/process-cooling-icons/psychrometric-icon.png',        route: '/calculators/fan-psychrometric' },
      ]
    },
    {
      id: 'wastewater', label: 'Wastewater', gradient: 'linear-gradient(160deg, #a9cce3, #2e86c1)',
      calculators: [
        { id: 'calc-o2-util',         label: 'O2 Utilization Rate',   img: 'assets/images/calculator-icons/waste-water-icons/OUR-icon.png',             route: '/calculators/o2-utilization-rate' },
        { id: 'calc-state-point',     label: 'State Point Analysis',  img: 'assets/images/calculator-icons/waste-water-icons/state-point-analysis.png', route: '/calculators/state-point-analysis' },
        { id: 'calc-water-reduction', label: 'Water Reduction',       img: 'assets/images/calculator-icons/utilities-icons/water-reduction-icon.png',   route: '/calculators/water-reduction' },
      ]
    },
    {
      id: 'general', label: 'General', gradient: 'linear-gradient(160deg, #95a5a6, #5d6d7e)',
      calculators: [
        { id: 'calc-unit-converter',  label: 'Unit Converter',          img: 'assets/images/calculator-icons/utilities-icons/unit-converter.png',                 route: '/calculators/unit-converter' },
        { id: 'calc-chp',             label: 'Combined Heat & Power',   img: 'assets/images/calculator-icons/utilities-icons/chp.png',                            route: '/calculators/combined-heat-power' },
        { id: 'calc-cash-flow',       label: 'Cash Flow',               img: 'assets/images/calculator-icons/utilities-icons/cash-flow.png',                      route: '/calculators/cash-flow' },
        { id: 'calc-pf-correction',   label: 'Power Factor Correction', img: 'assets/images/calculator-icons/utilities-icons/power-factor-correction-icon.png',   route: '/calculators/power-factor-correction' },
        { id: 'calc-pf-triangle',     label: 'Power Factor Triangle',   img: 'assets/images/calculator-icons/utilities-icons/power-factor-triangle-icon.png',     route: '/calculators/power-factor-triangle' },
        { id: 'calc-elec-reduction',  label: 'Electricity Reduction',   img: 'assets/images/calculator-icons/utilities-icons/electricity-reduction-icon.png',     route: '/calculators/electricity-reduction' },
        { id: 'calc-gas-reduction',   label: 'Natural Gas Reduction',   img: 'assets/images/calculator-icons/utilities-icons/natural-gas-reduction-icon.png',     route: '/calculators/natural-gas-reduction' },
        { id: 'calc-altitude',        label: 'Altitude Correction',     img: 'assets/images/calculator-icons/utilities-icons/altitude-correction-icon.png',       route: '/calculators/altitude-correction' },
        { id: 'calc-weather-bins',    label: 'Weather Bins',            img: 'assets/images/calculator-icons/utilities-icons/weather-bins-icon.png',              route: '/calculators/weather-bins' },
      ]
    },
  ];

  get pinnedCards(): AssessmentCard[] {
    return this.assessmentCards.filter(c => this.pinnedIds.has(c.id));
  }

  get pinnedCalcCards(): CalculatorCard[] {
    return this.calculatorTabs.flatMap(t => t.calculators).filter(c => this.pinnedCalcIds.has(c.id));
  }

  get activeTab(): CalculatorTab {
    return this.calculatorTabs.find(t => t.id === this.activeCalculatorTab) ?? this.calculatorTabs[0];
  }

  get pinnedModelingCards(): ModelingCard[] {
    return this.modelingCards.filter(c => this.pinnedModelingIds.has(c.id));
  }

  get hasPinnedItems(): boolean {
    return this.pinnedIds.size > 0 || this.pinnedCalcIds.size > 0 || this.pinnedModelingIds.size > 0;
  }

  togglePin(id: string): void {
    const next = new Set(this.pinnedIds);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    this.pinnedIds = next;
  }

  toggleCalcPin(id: string): void {
    const next = new Set(this.pinnedCalcIds);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    this.pinnedCalcIds = next;
  }

  toggleModelingPin(id: string): void {
    const next = new Set(this.pinnedModelingIds);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    this.pinnedModelingIds = next;
  }

  handleModelingAction(card: ModelingCard): void {
    if (card.route) {
      this.dashboardService.navigateWithSidebarOptions(card.route, { shouldCollapse: true });
    } else if (card.action === 'diagram') {
      this.dashboardService.showCreateDiagram.next(true);
    } else if (card.action?.startsWith('inventory-')) {
      this.dashboardService.showCreateInventory.next(card.action.split('inventory-')[1]);
    }
  }

  getCalcGradient(calcId: string): string {
    const tab = this.calculatorTabs.find(t => t.calculators.some(c => c.id === calcId));
    return tab?.gradient ?? 'linear-gradient(160deg, #95a5a6, #5d6d7e)';
  }

  constructor(
    private dashboardService: DashboardService,
    private settingsDbService: SettingsDbService,
    private assessmentService: AssessmentService,
    private homeFeedService: HomeFeedService,
    private recentlyAccessedService: RecentlyAccessedService
  ) { }

  ngOnInit() {
    if (!this.settingsDbService.globalSettings.disableTutorial) {
      this.assessmentService.showTutorial.next('landing-screen');
    }
    this.feedSub = this.homeFeedService.items$.subscribe(items => {
      this.feedItems = items;
    });
    this.recentItems = this.recentlyAccessedService.getRecent();

    // TODO: remove before merge — seeds all notification types for visual testing
    if (!environment.production) {
      this.homeFeedService.loadTestNotifications();
    }
  }

  ngOnDestroy() {
    this.feedSub?.unsubscribe();
  }

  get visibleFeedItems(): FeedItem[] {
    return this.showAllNotifications
      ? this.feedItems
      : this.feedItems.slice(0, this.notificationsPageSize);
  }

  get hiddenCount(): number {
    return Math.max(0, this.feedItems.length - this.notificationsPageSize);
  }

  toggleShowAllNotifications(): void {
    this.showAllNotifications = !this.showAllNotifications;
  }

  dismissItem(id: string): void {
    this.homeFeedService.dismiss(id);
  }

  primaryAction(item: FeedItem): void {
    switch (item.id) {
      case 'survey':
        this.homeFeedService.triggerSurvey();
        break;
      case 'subscribe':
        this.homeFeedService.triggerSubscribe();
        break;
    }
  }

  openRecentItem(item: RecentItem): void {
    this.recentlyAccessedService.record(item);
    this.dashboardService.navigateWithSidebarOptions(item.route, { shouldCollapse: true });
  }

  getItemMeta(item: RecentItem) {
    return this.recentlyAccessedService.getItemMeta(item);
  }

  formatTimeAgo(timestamp: number): string {
    return this.recentlyAccessedService.formatTimeAgo(timestamp);
  }

  createAssessment(str?: string) {
    if (str) {
      this.dashboardService.newAssessmentType = str;
    }
    this.dashboardService.createAssessment.next(true);
  }

  createDiagram(str?: string) {
    this.dashboardService.showCreateDiagram.next(true);
  }

  showCreateInventory(inventoryType: string) {
    this.dashboardService.showCreateInventory.next(inventoryType);
  }
}
