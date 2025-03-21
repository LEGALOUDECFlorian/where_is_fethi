import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, NgModule } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-map-case',
  imports: [GoogleMapsModule, CommonModule],
  template: `
    <google-map
      height="100vh"
      width="100%"
      [center]="userPosition"
      [zoom]="zoom"
      [options]="mapOptions"
      (mapClick)="addMarker($event)"
    >
      
      
      <map-marker
        *ngFor="let char of characters; let i = index"
        [position]="char.position"
        [icon]="{
          url: char.iconUrl,
          }"
        (mapClick)="handleMarkerClick(i, marker)"
        #marker="mapMarker"
      >
      </map-marker>

      <map-marker
        [position]="userPosition"
        [label]="{ text: 'Moi', color: 'white' }"
        [icon]="{
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }"
      >
      </map-marker>
      <map-info-window>{{infoContent}}</map-info-window>
    </google-map>

    <div  *ngIf="showReplay" class="overlay-button">
    <button class="button" (click)="spawnCharacters()">Rejouer</button>
    </div>
    
    <!-- <div *ngIf="message" style="margin-top: 10px">
      <p>{{ message }}</p>
      <button *ngIf="showReplay" (click)="spawnCharacters()">Rejouer</button>
    </div> -->
  `,
  styles: `
  google-map {
    display: block;
    margin: 0 auto;
    border: 2px solid #333;
    border-radius: 8px;
    position: relative;
  }

  button {
    padding: 10px 15px;
    font-size: 16px;
    margin-top: 10px;
    cursor: pointer;
  }

  .overlay-button {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }
  `,
})
export class MapCaseComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
//  scaledSize = new google.maps.Size(24, 24);
  infoContent = '';
  userPosition: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 15;
  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    gestureHandling: 'none',
    styles: [
      {
        featureType: 'poi', // points d'interets
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit', // transports
        stylers: [{ visibility: 'off' }],
      },
    ],
  };
  charlyIndex = -1;
  characters: {
    position: google.maps.LatLngLiteral;
    isCharly: boolean;
    iconUrl: string;
  }[] = [];
  message = '';
  showReplay = false;

  ngOnInit() {
    console.log(`navigator: ${navigator.geolocation}`);
    if (!navigator.geolocation) {
      this.userPosition = {
        lat: -22.9068467,
        lng: -43.1728965,
      };
      console.log(`not navigator`);
      this.spawnCharacters();
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        console.log(`${pos.coords.latitude}`);
        this.userPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log(`spawnCharacters`);
        this.spawnCharacters();
      });
    }
  }

  spawnCharacters() {
    this.characters = [];
    this.showReplay = false;
    this.message = '';
    this.charlyIndex = Math.floor(Math.random() * 550);

    for (let i = 0; i < 550; i++) {
      const position = this.randomPositionAround(this.userPosition, 5000);
      const isCharly = i === this.charlyIndex;

      this.characters.push({
        position,
        isCharly,
        iconUrl: isCharly ? 'isFethi-small.png' : 'charly-walk-small.png',
      });
    }
  }

  randomPositionAround(
    origin: google.maps.LatLngLiteral,
    radius: number
  ): google.maps.LatLngLiteral {
    const y0 = origin.lat;
    const x0 = origin.lng;
    const rd = radius / 111300;
    const u = Math.random();
    const v = Math.random();
    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    return { lat: y0 + y, lng: x0 + x };
  }

  handleMarkerClick(index: number, marker: MapMarker) {
    const selected = this.characters[index];
    // if (selected.isCharly) {
    //   this.message = '🎉 Gagné ! Tu as trouvé Charly !';
    //   this.showReplay = true;
    // } else {
    //   this.message = '❌ Raté ! Ce n\'était pas Charly.';
    // };
    if (selected.isCharly) {
      this.infoContent = '🎉 Gagné ! Tu as trouvé Fethi !';
      this.showReplay = true;
    } else {
      this.infoContent = '❌ Raté ! Ce n\'était pas Fethi.';
    };
  //  this.infoContent = selected.isCharly ? '🎉 Gagné ! Tu as trouvé Charly !' : '❌ Raté ! Ce n\'était pas Charly.';
    this.infoWindow.open(marker);
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const position = event.latLng.toJSON();
      this.characters.push({
        position,
        isCharly: false,
        iconUrl: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      });
    } else {
      console.error('La position du clic sur la carte est nulle.');
    }
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  // ngOnInit(): void {
  //   if (!navigator.geolocation) {
  //     console.log('not location');
  //   }
  //   navigator.geolocation.getCurrentPosition((position) => {
  //     console.log(
  //       `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
  //     );
  //   });
  //   this.watchPosition();
  // }

  // watchPosition() {
  //   let desLat = 0;
  //   let desLon = 0;
  //   let id = navigator.geolocation.watchPosition((position) => {
  //     console.log(
  //       `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
  //     );
  //     if(position.coords.latitude === desLat){
  //       navigator.geolocation.clearWatch(id);
  //     }
  //   }, (err) => {
  //     console.log(err);
  //   }, {
  //     enableHighAccuracy: true,
  //     timeout: 5000,
  //     maximumAge: 0
  //   })
  // }
}
