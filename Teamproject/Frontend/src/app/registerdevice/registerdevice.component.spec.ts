import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterdeviceComponent } from './registerdevice.component';

describe('RegisterdeviceComponent', () => {
  let component: RegisterdeviceComponent;
  let fixture: ComponentFixture<RegisterdeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterdeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterdeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
