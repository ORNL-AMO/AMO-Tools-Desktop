import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesGraphComponent } from './steam-properties-graph.component';

describe('SteamPropertiesGraphComponent', () => {
  let component: SteamPropertiesGraphComponent;
  let fixture: ComponentFixture<SteamPropertiesGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
