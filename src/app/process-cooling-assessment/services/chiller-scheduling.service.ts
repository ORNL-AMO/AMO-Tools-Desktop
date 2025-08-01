import { Injectable } from '@angular/core';


// ! IMPORTANT: THIS SERVICE HAS NOT BEEN TESTED AND IS ONLY USED FOR UNDERSTANDING ORIGINAL CWSAT PROCESS
// Adapted from CWSAT's frm_CallSchedule.vb
// Translated by copilot

@Injectable({
  providedIn: 'root'
})
export class ChillerSchedulingService {
  // todo some unused
  readonly HOURS_PER_YEAR = 8760;
  readonly MONTHS_IN_YEAR = 12;
  readonly HOURS_IN_DAY = 24;
  readonly DAYS_IN_WEEK = 7;
  readonly TEMP_BINS_START = 30;
  readonly TEMP_BINS_END = 120;

  tempDryBulbArray: number[] = new Array(8800).fill(0);
  tempWetBulbArray: number[] = new Array(8800).fill(0);
  weeklyOperationOccurenceAtHour: number[] = new Array(25).fill(0); // 1-24
  monthlyOperationOccurenceAtHour: number[][] = Array.from({ length: 12 }, () => new Array(25).fill(0));
  systemOperationAnnual: number[] = new Array(8761).fill(0); // 1-8760
  systemOperationMonthly: number[] = new Array(12).fill(0);
  monthOperatingHoursAtDryBulb: number[][] = Array.from({ length: 12 }, () => new Array(121).fill(0)); // Monthly_DB
  monthOperatingHoursAtWetBulb: number[][] = Array.from({ length: 12 }, () => new Array(121).fill(0)); // Monthly_WB
  annualOperatingHoursAtDryBulb: number[] = new Array(121).fill(0); // Annual_DB
  annualOperatingHoursAtWetBulb: number[] = new Array(121).fill(0); // Annual_WB
  dbOpMonth: number[][] = Array.from({ length: 12 }, () => new Array(8800).fill(0));
  wbOpMonth: number[][] = Array.from({ length: 12 }, () => new Array(8800).fill(0));
  dbOp: number[] = new Array(8800).fill(0);
  wbOp: number[] = new Array(8800).fill(0);
  monthStop: number[] = new Array(12).fill(0);
  lastCounter: number = 0;
  monthDayCounts: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  constructor(private inputs: SchedulerInputs) { }

  public calculateSchedule() {
    this.calculateWeeklyOperationOccurenceAtHour();
    this.calculateMonthlyOperationOccurenceAtHour();
    this.calculateSystemOperationAnnual();
    this.binMonthlyOperatingHours();
    this.binAnnualOperatingHours();
  }

  // Calculate number of system operation occurrences per hour in a week
  // How many occurances of system operation at given hour in a week
  // Example weeklyOperationOccurenceAtHour = [0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0];
  // Hours 8 to 17 (inclusive) have a value of 5, meaning the system is running during those hours on 5 days (Monday to Friday).
  private calculateWeeklyOperationOccurenceAtHour() {
    this.weeklyOperationOccurenceAtHour.fill(0);
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour <= 24; hour++) {
        if (this.inputs.startTimes[day] === this.inputs.finishTimes[day]) {
          continue;
        } else if (
          this.inputs.startTimes[day] / 100 < hour &&
          this.inputs.finishTimes[day] / 100 >= hour
        ) {
          this.weeklyOperationOccurenceAtHour[hour] += 1;
        }
      }
    }
  }

  // Calculate number of chiller operation occurrences per hour in each month
  private calculateMonthlyOperationOccurenceAtHour() {
    this.monthlyOperationOccurenceAtHour = Array.from({ length: 12 }, () => new Array(25).fill(0));
    for (let month = 0; month < 12; month++) {
      for (let hour = 1; hour <= 24; hour++) {
        this.monthlyOperationOccurenceAtHour[month][hour] = Math.round(this.weeklyOperationOccurenceAtHour[hour] * (this.inputs.monthHours[month] / (24 * 7)) * 100) / 100;
      }
    }
  }

  // Core logic for annual system operation schedule
  private calculateSystemOperationAnnual() {
    this.systemOperationAnnual.fill(0);
    this.systemOperationMonthly.fill(0);
    let hourOfYear = 1;
    for (let month = 0; month < 12; month++) {
      let monthDayCount = this.monthDayCounts[month];
      let dayMonthStart = this.getDayMonthStart(month);
      this.systemOperationMonthly[month] = 0;
      for (let dayOfMonth = 1; dayOfMonth <= monthDayCount; dayOfMonth++) {
        let dayNum = this.getDayNum(dayOfMonth, dayMonthStart);
        for (let hour = 1; hour <= 24; hour++) {
          if (
            this.inputs.monthHours[month] !== 0 &&
            this.inputs.startTimes[dayNum] / 100 < hour &&
            this.inputs.finishTimes[dayNum] / 100 >= hour &&
            this.inputs.monthHours[month] > this.systemOperationMonthly[month]
          ) {
            this.systemOperationAnnual[hourOfYear] = 1;
            this.systemOperationMonthly[month] += 1;
          } else {
            this.systemOperationAnnual[hourOfYear] = 0;
          }
          hourOfYear++;
        }
      }
    }
  }

  // Helper to get the starting day offset for each month (from VB logic)
  private getDayMonthStart(month: number): number {
    // These values are from the VB code's logic
    switch (month) {
      case 0: return 0;
      case 1: return 3;
      case 2: return 3;
      case 3: return 6;
      case 4: return 1;
      case 5: return 4;
      case 6: return 6;
      case 7: return 2;
      case 8: return 5;
      case 9: return 0;
      case 10: return 3;
      case 11: return 5;
      default: return 0;
    }
  }

  // Helper to get the day of week for a given day of month
  private getDayNum(m: number, dayMonthStart: number): number {
    if (m + dayMonthStart <= 7) return m - 1 + dayMonthStart;
    else if (m + dayMonthStart <= 14) return m - 8 + dayMonthStart;
    else if (m + dayMonthStart <= 21) return m - 15 + dayMonthStart;
    else if (m + dayMonthStart <= 28) return m - 22 + dayMonthStart;
    else if (m + dayMonthStart <= 35) return m - 29 + dayMonthStart;
    else return m - 36 + dayMonthStart;
  }

  // Bin monthly operating hours by dry bulb and wet bulb
  private binMonthlyOperatingHours() {
    let oldStop = 0;
    let counter = 0;
    // For each month, for each hour, assign DB/WB to op arrays
    for (let month = 0; month < 12; month++) {
      for (let hour = 1; hour <= 24; hour++) {
        let newStop = oldStop + Math.round(this.monthlyOperationOccurenceAtHour[month][hour]);
        for (let c = oldStop + 1; c <= newStop; c++) {
          this.dbOpMonth[month][c] = this.inputs.dryBulb[month * 24 + (hour - 1)];
          this.wbOpMonth[month][c] = this.inputs.wetBulb[month * 24 + (hour - 1)];
        }
        oldStop = 0; // Note: original VB resets to 0, but this may be a bug; adjust as needed
      }
      this.monthStop[month] = counter;
    }
    // Bin into 1F bins
    for (let month = 0; month < 12; month++) {
      for (let c = 1; c <= this.monthStop[month]; c++) {
        const db = this.dbOpMonth[month][c];
        const wb = this.wbOpMonth[month][c];
        if (db > -200 && db < this.TEMP_BINS_START) this.monthOperatingHoursAtDryBulb[month][this.TEMP_BINS_START] += 1;
        else if (db >= 119 && db < 200) this.monthOperatingHoursAtDryBulb[month][this.TEMP_BINS_END] += 1;
        for (let bin = 31; bin <= 119; bin++) {
          if (db >= bin - 1 && db < bin) this.monthOperatingHoursAtDryBulb[month][bin] += 1;
        }
        if (wb > -200 && wb < this.TEMP_BINS_START) this.monthOperatingHoursAtWetBulb[month][this.TEMP_BINS_START] += 1;
        else if (wb >= 119 && wb < 200) this.monthOperatingHoursAtWetBulb[month][this.TEMP_BINS_END] += 1;
        for (let bin = 31; bin <= 119; bin++) {
          if (wb >= bin - 1 && wb < bin) this.monthOperatingHoursAtWetBulb[month][bin] += 1;
        }
      }
    }
  }

  // Bin annual operating hours by dry bulb and wet bulb
  private binAnnualOperatingHours() {
    let oldStop = 0;
    let newStop = 0;
    // Assign DB/WB to op arrays for the year
    for (let month = 0; month < 12; month++) {
      if (this.inputs.monthHours[month] > 0) {
        for (let hour = 1; hour <= 24; hour++) {
          newStop = oldStop + Math.round(this.monthlyOperationOccurenceAtHour[month][hour]);
          for (let c = oldStop + 1; c <= newStop; c++) {
            this.dbOp[c] = this.inputs.dryBulb[month * 24 + (hour - 1)];
            this.wbOp[c] = this.inputs.wetBulb[month * 24 + (hour - 1)];
          }
          oldStop = newStop;
        }
      }
    }
    this.lastCounter = newStop;
    // Reset bins
    for (let bin = this.TEMP_BINS_START; bin <= this.TEMP_BINS_END; bin++) {
      this.annualOperatingHoursAtDryBulb[bin] = 0;
      this.annualOperatingHoursAtWetBulb[bin] = 0;
    }
    // Bin
    for (let c = 1; c <= this.lastCounter; c++) {
      const db = this.dbOp[c];
      const wb = this.wbOp[c];
      if (db > -200 && db < this.TEMP_BINS_START) this.annualOperatingHoursAtDryBulb[this.TEMP_BINS_START] += 1;
      else if (db >= 119 && db < 200) this.annualOperatingHoursAtDryBulb[this.TEMP_BINS_END] += 1;
      for (let bin = 31; bin <= 119; bin++) {
        if (db >= bin - 1 && db < bin) this.annualOperatingHoursAtDryBulb[bin] += 1;
      }
      if (wb > -200 && wb < this.TEMP_BINS_START) this.annualOperatingHoursAtWetBulb[this.TEMP_BINS_START] += 1;
      else if (wb >= 119 && wb < 200) this.annualOperatingHoursAtWetBulb[this.TEMP_BINS_END] += 1;
      for (let bin = 31; bin <= 119; bin++) {
        if (wb >= bin - 1 && wb < bin) this.annualOperatingHoursAtWetBulb[bin] += 1;
      }
    }
  }

}


export interface SchedulerInputs {
  dryBulb: number[]; // 288 hourly dry bulb temps (12 months x 24 hours)
  wetBulb: number[]; // 288 hourly wet bulb temps
  startTimes: number[]; // 7 days, e.g. [800, 800, ...]
  finishTimes: number[]; // 7 days
  monthHours: number[]; // 12 months, hours of operation per month
}
