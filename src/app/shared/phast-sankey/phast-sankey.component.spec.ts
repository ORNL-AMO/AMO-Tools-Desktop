import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastSankeyComponent } from './phast-sankey.component';

describe('PhastSankeyComponent', () => {
  let component: PhastSankeyComponent;
  let fixture: ComponentFixture<PhastSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhastSankeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
