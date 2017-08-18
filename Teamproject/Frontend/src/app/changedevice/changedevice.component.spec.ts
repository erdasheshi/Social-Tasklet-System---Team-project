import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangedeviceComponent } from './changedevice.component';

describe('ChangedeviceComponent', () => {
  let component: ChangedeviceComponent;
  let fixture: ComponentFixture<ChangedeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangedeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangedeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
