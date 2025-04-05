import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Airport {
  name: string;
  code: string;
  skyscannerCode: string;
}

interface Airline {
  name: string;
  code: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <h1>Skyscanner Link Generator</h1>
        
        <div class="steps">
          <p class="step"><span class="step-number">1</span> Go to Skyscanner and search for flights between the airports listed below</p>
          <p class="step"><span class="step-number">2</span> Fill in the form below with your flight details</p>
          <p class="step"><span class="step-number">3</span> Use the generated link to test specific flight combinations</p>
        </div>

        <div class="form-section">
          <h2>Flight Details</h2>
          
          <div class="form-group">
            <label>Source Airport:</label>
            <select [(ngModel)]="selectedSource" class="modern-select">
              <option value="" disabled selected>Select source airport</option>
              <option *ngFor="let airport of airports" [value]="airport.skyscannerCode">
                {{airport.name}} ({{airport.code}})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Destination Airport:</label>
            <select [(ngModel)]="selectedDestination" class="modern-select">
              <option value="" disabled selected>Select destination airport</option>
              <option *ngFor="let airport of airports" [value]="airport.skyscannerCode">
                {{airport.name}} ({{airport.code}})
              </option>
            </select>
          </div>

          <div class="date-time-group">
            <div class="form-group">
              <label>Departure Date:</label>
              <input type="date" [(ngModel)]="departureDate" (change)="updateDateFormat('departure')">
            </div>

            <div class="form-group">
              <label>Departure Time:</label>
              <input type="time" [(ngModel)]="departureTimeInput" (change)="updateTimeFormat('departure')">
            </div>
          </div>

          <div class="date-time-group">
            <div class="form-group">
              <label>Arrival Date:</label>
              <input type="date" [(ngModel)]="arrivalDate" (change)="updateDateFormat('arrival')">
            </div>

            <div class="form-group">
              <label>Arrival Time:</label>
              <input type="time" [(ngModel)]="arrivalTimeInput" (change)="updateTimeFormat('arrival')">
            </div>
          </div>

          <div class="form-group">
            <label>Number of Layovers:</label>
            <input type="number" [(ngModel)]="layovers" min="0" max="3" class="modern-input" (change)="handleLayoverChange()">
          </div>

          <div class="form-group" *ngIf="layovers > 0">
            <label>Multiple Airlines?</label>
            <div class="toggle-group">
              <button 
                [class]="'toggle-btn ' + (multipleAirlines ? 'active' : '')"
                (click)="toggleMultipleAirlines(true)">
                Yes
              </button>
              <button 
                [class]="'toggle-btn ' + (!multipleAirlines ? 'active' : '')"
                (click)="toggleMultipleAirlines(false)">
                No
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Airline{{ multipleAirlines ? 's' : '' }}:</label>
            <div *ngIf="!multipleAirlines">
              <select [(ngModel)]="selectedAirlines[0]" class="modern-select">
                <option value="" disabled selected>Select airline</option>
                <option *ngFor="let airline of airlines" [value]="airline.code">
                  {{airline.name}}
                </option>
              </select>
            </div>
            <div *ngIf="multipleAirlines">
              <div *ngFor="let i of getLayoverArray(); let idx = index" class="multi-airline-select">
                <select [(ngModel)]="selectedAirlines[idx]" class="modern-select">
                  <option value="" disabled selected>Select airline {{idx + 1}}</option>
                  <option *ngFor="let airline of airlines" [value]="airline.code">
                    {{airline.name}}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Cabin Class:</label>
            <select [(ngModel)]="cabinClass" class="modern-select">
              <option value="economy">Economy</option>
              <option value="premiumeconomy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>

          <button (click)="generateLink()" class="generate-btn">Generate Link</button>
        </div>

        <div *ngIf="generatedLink" class="result">
          <h3>Generated Link:</h3>
          <a [href]="generatedLink" target="_blank" class="link">{{generatedLink}}</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 20px;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    h1 {
      color: #1a1a1a;
      margin: 0 0 1.5rem;
      font-size: 2rem;
      text-align: center;
    }
    h2 {
      color: #2c3e50;
      margin: 1.5rem 0;
      font-size: 1.5rem;
    }
    .steps {
      background: #f8fafc;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .step {
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .step-number {
      background: #3b82f6;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .form-section {
      background: #ffffff;
      border-radius: 8px;
      padding: 1rem 0;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .date-time-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4b5563;
      font-weight: 500;
    }
    .modern-select, .modern-input, input[type="date"], input[type="time"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background-color: #f9fafb;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .modern-select:focus, .modern-input:focus, input[type="date"]:focus, input[type="time"]:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .generate-btn {
      background-color: #3b82f6;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: background-color 0.2s;
    }
    .generate-btn:hover {
      background-color: #2563eb;
    }
    .result {
      margin-top: 2rem;
      padding: 1.5rem;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .result h3 {
      margin: 0 0 1rem;
      color: #2c3e50;
    }
    .link {
      color: #3b82f6;
      word-break: break-all;
      text-decoration: none;
    }
    .link:hover {
      text-decoration: underline;
    }
    .toggle-group {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .toggle-btn {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background-color: #f9fafb;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }
    .toggle-btn.active {
      background-color: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    .multi-airline-select {
      margin-bottom: 0.75rem;
    }
    .multi-airline-select:last-child {
      margin-bottom: 0;
    }
  `]
})
export class App {
  airports: Airport[] = [
    { name: 'Bombay', code: 'BOM', skyscannerCode: '10075' },
    { name: 'Delhi', code: 'DEL', skyscannerCode: '10957' },
    { name: 'Bangalore', code: 'BLR', skyscannerCode: '10002' },
    { name: 'Paris', code: 'CDG', skyscannerCode: '10413' },
    { name: 'Dubai', code: 'DXB', skyscannerCode: '11182' },
    { name: 'Tokyo', code: 'NRT', skyscannerCode: '14788' },
    { name: 'Amsterdam', code: 'AMS', skyscannerCode: '9451' },
    { name: 'Istanbul', code: 'IST', skyscannerCode: '12585' },
    { name: 'Capetown', code: 'CPT', skyscannerCode: '10703' },
    { name: 'New York', code: 'JFK', skyscannerCode: '12712' },
    { name: 'Frankfurt', code: 'FRA', skyscannerCode: '11616' }
  ];

  airlines: Airline[] = [
    { name: 'Spicejet', code: '31826' },
    { name: 'Indigo', code: '32213' },
    { name: 'Emirates', code: '32348' },
    { name: 'Qatar', code: '31939' },
    { name: 'Turkish', code: '31734' },
    { name: 'Air India', code: '32672' },
    { name: 'Ethiad', code: '32339' },
    { name: 'Lufthansa', code: '32090' },
    { name: 'Air France', code: '32677' },
    { name: 'Hong Kong Airlines', code: '32229' }
  ];

  selectedSource = '';
  selectedDestination = '';
  departureDate = '';
  arrivalDate = '';
  departureTimeInput = '';
  arrivalTimeInput = '';
  departureFormattedDate = '';
  arrivalFormattedDate = '';
  departureTime = '';
  arrivalTime = '';
  layovers = 0;
  multipleAirlines = false;
  selectedAirlines: string[] = [''];
  cabinClass = 'economy';
  generatedLink = '';

  handleLayoverChange() {
    if (this.layovers > 0) {
      this.selectedAirlines = Array(this.layovers + 1).fill('');
    } else {
      this.selectedAirlines = [''];
      this.multipleAirlines = false;
    }
  }

  toggleMultipleAirlines(value: boolean) {
    this.multipleAirlines = value;
    if (value) {
      this.selectedAirlines = Array(this.layovers + 1).fill('');
    } else {
      this.selectedAirlines = [''];
    }
  }

  getLayoverArray() {
    return Array(this.layovers + 1).fill(0);
  }

  updateDateFormat(type: 'departure' | 'arrival') {
    const dateObj = type === 'departure' ? new Date(this.departureDate) : new Date(this.arrivalDate);
    const year = dateObj.getFullYear().toString().slice(-2);
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    
    if (type === 'departure') {
      this.departureFormattedDate = formattedDate;
    } else {
      this.arrivalFormattedDate = formattedDate;
    }
  }

  updateTimeFormat(type: 'departure' | 'arrival') {
    const timeStr = type === 'departure' ? this.departureTimeInput : this.arrivalTimeInput;
    const [hours, minutes] = timeStr.split(':');
    if (type === 'departure') {
      this.departureTime = `${hours}${minutes}`;
    } else {
      this.arrivalTime = `${hours}${minutes}`;
    }
  }

  generateLink() {
  const baseUrl = 'https://www.skyscanner.co.in/transport/flights';
  const sourceAirport = this.airports.find(a => a.skyscannerCode === this.selectedSource)?.code.toLowerCase();
  const destAirport = this.airports.find(a => a.skyscannerCode === this.selectedDestination)?.code.toLowerCase();

  let airlineConfig: string;
  if (this.multipleAirlines) {
    const uniqueAirlines = [...new Set(this.selectedAirlines)];
    // Prefix each code with a hyphen, then join with commas
    airlineConfig = uniqueAirlines.map(code => `-${code}`).join(',');
  } else {
    airlineConfig = `-${this.selectedAirlines[0]}`;
  }

  const configPart = `${this.selectedSource}-${this.departureFormattedDate}${this.departureTime}-${airlineConfig}-${this.layovers}-${this.selectedDestination}-${this.arrivalFormattedDate}${this.arrivalTime}`;

  this.generatedLink = `${baseUrl}/${sourceAirport}/${destAirport}/${this.departureFormattedDate}/config/${configPart}?adults=1&cabinclass=${this.cabinClass}&children=0&infants=0&preferdirects=${this.layovers === 0}&rtn=0`;
}

}
bootstrapApplication(App);