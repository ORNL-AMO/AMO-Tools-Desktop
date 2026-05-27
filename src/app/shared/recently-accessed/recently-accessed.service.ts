import { Injectable } from '@angular/core';
import { AssessmentType } from '../models/assessment';

export type RecentItemType = 'assessment' | 'inventory' | 'diagram';
export type InventoryType = 'motorInventory' | 'pumpInventory' | 'compressedAirInventory';
export type DiagramType = 'Water';

export interface RecentItem {
  id: number;
  name: string;
  itemType: RecentItemType;
  assessmentType?: AssessmentType;
  inventoryType?: InventoryType;
  diagramType?: DiagramType;
  route: string;
  accessedAt: number;
}

export interface ItemMeta {
  image: string;
  gradient: string;
  label: string;
}

const STORAGE_KEY = 'measur_recent_items';
const MAX_ITEMS = 6;

const ASSESSMENT_META: Record<AssessmentType, ItemMeta> = {
  PSAT:          { image: 'assets/images/pump.png',                     gradient: 'linear-gradient(160deg, #5dade2, #2471a3)', label: 'Pump' },
  PHAST:         { image: 'assets/images/ph.png',                       gradient: 'linear-gradient(160deg, #f0b27a, #e67e22)', label: 'Process Heating' },
  FSAT:          { image: 'assets/images/ico-fsat-diagram.png',         gradient: 'linear-gradient(160deg, #f9e79f, #d4ac0d)', label: 'Fan' },
  SSMT:          { image: 'assets/images/ico-ssmt-diagram.png',         gradient: 'linear-gradient(160deg, #fad7a0, #ca6f1e)', label: 'Steam' },
  TreasureHunt:  { image: 'assets/images/treasure-hunt.png',            gradient: 'linear-gradient(160deg, #7f8c8d, #2c3e50)', label: 'Treasure Hunt' },
  WasteWater:    { image: 'assets/images/waste-water-icon-landing.png', gradient: 'linear-gradient(160deg, #a9cce3, #2e86c1)', label: 'Wastewater' },
  Water:         { image: 'assets/images/water-assessment-large.png',   gradient: 'linear-gradient(160deg, #d4e2f4, #306dbe)', label: 'Water' },
  CompressedAir: { image: 'assets/images/ca-icon.png',                  gradient: 'linear-gradient(160deg, #d2b4de, #8e44ad)', label: 'Compressed Air' },
};

const INVENTORY_META: Record<InventoryType, ItemMeta> = {
  motorInventory:         { image: 'assets/images/motor-inventory-icon.png', gradient: 'linear-gradient(160deg, #d5f5e3, #1e8449)', label: 'Motor Inventory' },
  pumpInventory:          { image: 'assets/images/pump-inventory-icon.png',  gradient: 'linear-gradient(160deg, #aed6f1, #2471a3)', label: 'Pump Inventory' },
  compressedAirInventory: { image: 'assets/images/ca-inventory-icon.png',    gradient: 'linear-gradient(160deg, #d7bde2, #7030a0)', label: 'Compressed Air Inventory' },
};

const DIAGRAM_META: Record<DiagramType, ItemMeta> = {
  Water: { image: 'assets/images/water-process-diagram-large.png', gradient: 'linear-gradient(160deg, #d4e2f4, #306dbe)', label: 'Water Diagram' },
};

const ASSESSMENT_ROUTE: Record<AssessmentType, string> = {
  PSAT:          '/psat/',
  PHAST:         '/phast/',
  FSAT:          '/fsat/',
  SSMT:          '/ssmt/',
  TreasureHunt:  '/treasure-hunt/',
  WasteWater:    '/waste-water/',
  Water:         '/water/',
  CompressedAir: '/compressed-air/',
};

const INVENTORY_ROUTE: Record<InventoryType, string> = {
  motorInventory:         '/motor-inventory/',
  pumpInventory:          '/pump-inventory/',
  compressedAirInventory: '/compressed-air-inventory/',
};

@Injectable({ providedIn: 'root' })
export class RecentlyAccessedService {

  record(item: Omit<RecentItem, 'accessedAt'>): void {
    const deduped = this.getRecent().filter(i => !(i.id === item.id && i.itemType === item.itemType));
    const updated = [{ ...item, accessedAt: Date.now() }, ...deduped].slice(0, MAX_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* storage unavailable */ }
  }

  getRecent(): RecentItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RecentItem[]) : [];
    } catch {
      return [];
    }
  }

  getRouteForAssessment(type: AssessmentType, id: number): string {
    return ASSESSMENT_ROUTE[type] + id;
  }

  getRouteForInventory(type: InventoryType, id: number): string {
    return INVENTORY_ROUTE[type] + id;
  }

  getRouteForDiagram(_type: DiagramType, id: number): string {
    return '/process-flow-diagram/' + id;
  }

  getItemMeta(item: RecentItem): ItemMeta {
    if (item.itemType === 'assessment' && item.assessmentType) {
      return ASSESSMENT_META[item.assessmentType];
    }
    if (item.itemType === 'inventory' && item.inventoryType) {
      return INVENTORY_META[item.inventoryType];
    }
    if (item.itemType === 'diagram' && item.diagramType) {
      return DIAGRAM_META[item.diagramType];
    }
    return { image: '', gradient: 'linear-gradient(160deg, #ccc, #999)', label: 'Item' };
  }

  formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
}
