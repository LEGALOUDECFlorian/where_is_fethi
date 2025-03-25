import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { MapCaseComponent } from './components/map-case.component';

export const routes: Routes = [ 
  { path: '', component: HomeComponent },
  { path: 'map', component: MapCaseComponent },
  { path: '**', redirectTo: '' }
];
