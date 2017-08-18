import { Component } from '@angular/core';
import {ChangeDevice} from "./shared/model/ChangeDevice";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './shared/styles/grid.css'],
  providers: [ChangeDevice]
})
export class AppComponent {
}
