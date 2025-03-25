import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker, MapPolygon, GoogleMap } from '@angular/google-maps';
import { CHARACTER_POOL } from '../data/characters.data';
import {MatIconModule} from '@angular/material/icon'
import { notFethiMessages } from '../data/notFethiMessages.data';
import { Router } from '@angular/router';


@Component({
  selector: 'app-map-case',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule, MatIconModule],
  template: `
    <div class="map-wrapper">
      <google-map
        #map
        height="100vh"
        width="100%"
        [center]="userPosition"
        [zoom]="zoom"
        [options]="mapOptions"
        (mapClick)="closeInfoWindow()"
      >
        <map-polygon [paths]="zonePolygon" [options]="polygonOptions"></map-polygon>

        <map-marker
          *ngFor="let char of characters; let i = index"
          [position]="char.position"
          [icon]="{ url: char.iconUrl }"
          (mapClick)="handleMarkerClick(i, marker)"
          #marker="mapMarker"
        ></map-marker>

        <map-info-window>{{ infoContent }}</map-info-window>
      </google-map>

      <div *ngIf="showReplay" class="overlay-button">
        <button class="button help" (click)="spawnCharacters()">Rejouer</button>
      </div>

      <div class="home-button">
        <button class="button help" (click)="homeNavigate()"><mat-icon>home</mat-icon></button>
      </div>

      <div class="help-button">
        <button class="button help" (click)="reloadMap()"><mat-icon>replay</mat-icon></button>
        <button class="button help" (click)="highlightFethi()">?</button>
      </div>
    </div>
  `,
  styles: `
    .map-wrapper {
      position: relative;
      height: 100vh;
      overflow: hidden;
    }

    google-map {
      position: relative;
      z-index: 1;
      display: block;
      margin: 0 auto;
      border: 2px solid #333;
      border-radius: 8px;
    }

    .gm-style-iw button.gm-ui-hover-effect {
      transform: scale(0.7);
    }

    button {
      padding: 10px 15px;
      font-size: 16px;
      margin-top: 350px;
      cursor: pointer;
    }

    .reload-button {}

    .overlay-button {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }

    .home-button {
      position: absolute;
      top: -340px;
      left: 40px;
      transform: translateX(-50%);
      z-index: 1000;
    }

    .help-button {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      gap: 6px;
    }

    .button.help {
      background-color: #ffc107;
      border: none;
      border-radius: 6px;
      color: #000;
    }
  `
})
export class MapCaseComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChildren('marker') markers!: QueryList<MapMarker>;

  margin = 0.0045;
  bounds = {
    north: 48.9 - this.margin,
    south: 48.85 + this.margin - 0.0020,
    east: 2.4 - this.margin,
    west: 2.3 + this.margin 
  };

  originalBounds = {
    north: 48.9,
    south: 48.85,
    east: 2.4,
    west: 2.3
  };

  infoContent = '';
  userPosition: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 15;

  zonePolygon: google.maps.LatLngLiteral[] = [];
  polygonOptions: google.maps.PolygonOptions = {
    fillColor: '#00BFFF',
    fillOpacity: 0.05,
    strokeColor: '#FF0000',
    strokeOpacity: 0.9,
    strokeWeight: 10,
    clickable: false,
    editable: false,
    geodesic: false
  };

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    restriction: {
      latLngBounds: {
        north: 48.9,
        south: 48.85,
        east: 2.4,
        west: 2.3
      },
      strictBounds: true
    },
    styles: []
  };

  characters: {
    position: google.maps.LatLngLiteral;
    isFethi: boolean;
    iconUrl: string;
  }[] = [];
  message = '';
  showReplay = false;
  fethiIndex = -1;

  constructor(private router: Router) {}

  homeNavigate() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.userPosition = {
      lat: 48.875,
      lng: 2.35
    };

    this.zonePolygon = [
      { lat: this.originalBounds.north, lng: this.originalBounds.west },
      { lat: this.originalBounds.north, lng: this.originalBounds.east },
      { lat: this.originalBounds.south, lng: this.originalBounds.east },
      { lat: this.originalBounds.south, lng: this.originalBounds.west }
    ];

    this.spawnCharacters();
  }

  spawnCharacters() {
    this.characters = [];
    this.showReplay = false;
    this.message = '';

    const fethiCharacter = CHARACTER_POOL.filter(c => c.isFethi);
    const nonFethiCharacters = CHARACTER_POOL.filter(c => !c.isFethi);

    let position: google.maps.LatLngLiteral;
    let attempts = 0;
    do {
      position = this.randomPositionWithinInnerBounds();
      attempts++;
    } while (!this.isWithinBounds(position) && attempts < 10);

    const fethi = fethiCharacter[Math.floor(Math.random() * fethiCharacter.length)];
    this.characters.push({
      position,
      isFethi: true,
      iconUrl: fethi.path
    });
    this.fethiIndex = 0;

    for (let i = 1; i < 550; i++) {
      let pos: google.maps.LatLngLiteral;
      let tries = 0;
      do {
        pos = this.randomPositionWithinInnerBounds();
        tries++;
      } while (!this.isWithinBounds(pos) && tries < 10);

      const char = nonFethiCharacters[Math.floor(Math.random() * nonFethiCharacters.length)];
      this.characters.push({
        position: pos,
        isFethi: false,
        iconUrl: char.path
      });
    }
  }

  randomPositionWithinInnerBounds(): google.maps.LatLngLiteral {
    const lat = Math.random() * (this.bounds.north - this.bounds.south) + this.bounds.south;
    const lng = Math.random() * (this.bounds.east - this.bounds.west) + this.bounds.west;
    return { lat, lng };
  }

  isWithinBounds(pos: google.maps.LatLngLiteral): boolean {
    return (
      pos.lat >= this.bounds.south &&
      pos.lat <= this.bounds.north &&
      pos.lng >= this.bounds.west &&
      pos.lng <= this.bounds.east
    );
  }

  getRandomNotFethiMessage(): string {
    const index = Math.floor(Math.random() * notFethiMessages.length);
    return notFethiMessages[index];
  }

  handleMarkerClick(index: number, marker: MapMarker) {
    const selected = this.characters[index];
    if (selected.isFethi) {
      this.infoContent = '🎉 Gagné ! Tu as trouvé Fethi !';
      this.showReplay = true;
    } else {
      this.infoContent = this.getRandomNotFethiMessage();
    }
    this.infoWindow.open(marker);
  }

  closeInfoWindow() {
    this.infoWindow.close();
  }

  highlightFethi() {
    const markerArray = this.markers.toArray();
    const fethiMarker = markerArray[this.fethiIndex];
    if (fethiMarker) {
      this.infoContent = '👀 Mouais, j\'éspère que tu as \n cherché un peu avant !';
      this.infoWindow.open(fethiMarker);
    }
  }

  reloadMap() {
    this.spawnCharacters();
    this.closeInfoWindow();
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const position = event.latLng.toJSON();
      if (this.isWithinBounds(position)) {
        this.characters.push({
          position,
          isFethi: false,
          iconUrl: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
      }
    } else {
      console.error('La position du clic sur la carte est nulle.');
    }
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }
}
