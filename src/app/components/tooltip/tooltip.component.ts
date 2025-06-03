import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <div
        class="cursor-help"
        (mouseenter)="showTooltip = true"
        (mouseleave)="showTooltip = false"
      >
        <ng-content></ng-content>
      </div>
      @if (showTooltip) {
        <div
          class="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip"
          [class]="getPositionClass()"
          role="tooltip"
        >
          {{ text }}
          <div class="tooltip-arrow" [class]="getArrowClass()"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tooltip {
      white-space: nowrap;
    }
    .tooltip-top {
      bottom: calc(100% + 5px);
      left: 50%;
      transform: translateX(-50%);
    }
    .tooltip-bottom {
      top: calc(100% + 5px);
      left: 50%;
      transform: translateX(-50%);
    }
    .tooltip-left {
      right: calc(100% + 5px);
      top: 50%;
      transform: translateY(-50%);
    }
    .tooltip-right {
      left: calc(100% + 5px);
      top: 50%;
      transform: translateY(-50%);
    }
    .tooltip-arrow {
      position: absolute;
      width: 8px;
      height: 8px;
      background: inherit;
    }
    .arrow-top {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }
    .arrow-bottom {
      top: -4px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }
    .arrow-left {
      right: -4px;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }
    .arrow-right {
      left: -4px;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
    }
  `]
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  showTooltip = false;

  getPositionClass(): string {
    return `tooltip-${this.position}`;
  }

  getArrowClass(): string {
    return `arrow-${this.position}`;
  }
} 