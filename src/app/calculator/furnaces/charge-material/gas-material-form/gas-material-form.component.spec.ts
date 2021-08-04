import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GasMaterialFormComponent } from './gas-material-form.component';

describe('GasMaterialFormComponent', () => {
  let component: GasMaterialFormComponent;
  let fixture: ComponentFixture<GasMaterialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GasMaterialFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GasMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
