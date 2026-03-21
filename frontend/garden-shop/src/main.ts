import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// ✅ bootstrapApplication solo acepta 2 argumentos en Angular 17+
// Los providers (incluido HttpClient) ya están en appConfig (app.config.ts)
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
