import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="catalog-container">
      <h2>Product Catalog</h2>
      <p>Manage your farm's product catalog here.</p>

      <div class="placeholder-content">
        <p>Your products will be listed here.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .catalog-container {
        padding: 1rem 0;
      }
      .placeholder-content {
        background-color: #f0f0f0;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        margin-top: 1rem;
      }
    `,
  ],
})
export class CatalogComponent {}
