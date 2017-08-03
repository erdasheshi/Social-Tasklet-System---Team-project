import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {RouterModule} from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { RegisterComponent } from './register/register.component';
import { NetworkComponent } from './network/network.component';
import { CoinsComponent } from './coins/coins.component';
import { HeaderComponent } from './header/header.component';

import { UserService } from './shared/services/user.service';
import { DevicemanagementComponent } from './devicemanagement/devicemanagement.component';
import { RegisterdeviceComponent } from './registerdevice/registerdevice.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TransactionsComponent,
    RegisterComponent,
    CoinsComponent,
    NetworkComponent,
    HeaderComponent,
    DevicemanagementComponent,
    RegisterdeviceComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        'path': '',
        'component': LoginComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'register',
        'component': RegisterComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'transactions',
        'component': TransactionsComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'network',
        'component': NetworkComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'devices',
        'component': DevicemanagementComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'adddevice',
        'component': RegisterdeviceComponent,
        'pathMatch': 'full'
      },
      {
        'path': 'coins',
        'component': CoinsComponent,
        'pathMatch': 'full'
      }

    ], {useHash: true})
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
