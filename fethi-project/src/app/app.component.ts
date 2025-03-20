import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapCaseComponent } from './components/map-case.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MapCaseComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'Where is Fethi ?';
}
