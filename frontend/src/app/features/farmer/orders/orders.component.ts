import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-container">
      <h2>Your Orders</h2>
      <p>View and manage customer orders here.</p>

      <div class="placeholder-content">
        <p>Your orders will be listed here.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .orders-container {
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
export class OrdersComponent {}
