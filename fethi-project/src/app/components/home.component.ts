import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { sprites } from '../data/sprites.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="home-wrapper">
      <div class="title-box">
        <h1>Where is Fethi ?</h1>
      </div>

      <div class="home">
        <div class="image-container">
          <img [src]="currentSprite" alt="Fethi">
        </div>

        <button (click)="navigate()">Jouer</button>
      </div>
    </div>
  `,
  styles: [`
    .home-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #933712;
      padding: 2rem;
    }

    .title-box {
      background-color: #ab3f13;
      color: aliceblue;
      padding: 1rem 4rem;
      margin-bottom: 40px;
      border-top-left-radius: 25px;
      border-top-right-radius: 45px;
      border-bottom-left-radius: 45px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }

    h1 {
      margin: 0;
      font-size: 2.5rem;
    }

    .home {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .image-container {
      width: 160px;
      height: 260px; 
      margin: 30px auto;
      animation: walk 2s ease-in-out infinite alternate;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-container img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }

    @keyframes walk {
      0% { transform: translateX(-30px) scaleX(1); }
      100% { transform: translateX(30px) scaleX(-1); }
    }

    button {
      padding: 12px 55px;
      font-size: 18px;
      background-color: #ffc107;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      color: #000;
      transition: background-color 0.3s ease;
      margin-top: 20px;
      box-shadow: 2px 4px 8px rgba(0,0,0,0.5);
    }

    button:hover {
      background-color: #ffb300;
    }
  `]
})
export class HomeComponent {
  currentSprite = sprites[0];
  private intervalId: any;
  private currentIndex = 0;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % sprites.length;
      this.currentSprite = sprites[this.currentIndex];
    }, 5650);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  navigate() {
    this.router.navigate(['/map']);
  }
}

