import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { Chart, ScriptableContext, TooltipItem } from 'chart.js';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('kpiLine',  { static: false }) kpiLineRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('attBar',   { static: false }) attBarRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('npsGauge', { static: false }) npsRef!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('empPie',   { static: false }) empPieRef!:   ElementRef<HTMLCanvasElement>;

  private charts: any[] = [];
  totalEmployees = 1242;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const { default: Chart } = await import('chart.js/auto');

    const centerText = {
      id: 'centerText',
      afterDraw: (chart: any) => {
        const { ctx, chartArea } = chart;
        const { left, right, top, bottom } = chartArea;
        const x = (left + right) / 2;
        const y = (top + bottom) / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#111827';
        ctx.font = '600 26px Inter, system-ui';
        ctx.fillText(String(this.totalEmployees.toLocaleString()), x, y - 4);

        ctx.fillStyle = '#6B7280';
        ctx.font = '500 12px Inter, system-ui';
        ctx.fillText('Total Employees', x, y + 16);
        ctx.restore();
      }
    };

    const empEl = this.empPieRef?.nativeElement;
    if (empEl) {
      const empPie = new Chart(empEl.getContext('2d')!, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [55, 25, 20],
            backgroundColor: ['#fb6a34', '#fde7df', '#9bd0ff'],
            borderWidth: 0,
            spacing: 4,
            borderRadius: 10,
            hoverOffset: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          rotation: -90,
          circumference: 360,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          animation: { duration: 900 }
        },
        plugins: [centerText]
      });
      this.charts.push(empPie);
    }

    const lineCanvas = this.kpiLineRef?.nativeElement;
    if (lineCanvas) {
      const ctx = lineCanvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(59,130,246,0.18)');
        gradient.addColorStop(1, 'rgba(59,130,246,0.00)');

        const data = [48, 62, 55, 40, 52, 58, 66, 72, 85.45, 68, 74, 79];

        const lineChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets: [{
              data,
              tension: 0.4,
              borderColor: '#ef4444',
              borderWidth: 2,
              fill: true,
              backgroundColor: gradient,
              pointRadius: (c: ScriptableContext<'line'>) => (c.dataIndex === 8 ? 4 : 0),
              pointHoverRadius: 5,
              pointBackgroundColor: '#ef4444',
              spanGaps: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                displayColors: false,
                callbacks: {
                  label: (tt: TooltipItem<'line'>) => `${Number(tt.parsed.y).toFixed(2)}%`
                }
              }
            },
            scales: {
              y: {
                min: 0, max: 100,
                ticks: { stepSize: 25, callback: (v) => v + '%', color: '#9ca3af' },
                grid: { color: 'rgba(156,163,175,0.15)' },
                border: { display: false }
              },
              x: {
                ticks: { color: '#9ca3af' },
                grid: { display: false },
                border: { display: false }
              }
            },
            interaction: { intersect: false, mode: 'index' }
          }
        });
        this.charts.push(lineChart);
      }
    }

    const semicircleGauge = {
      id: 'semicircleGauge',
      afterDraw: (chart: any) => {
        const ctx = chart.ctx as CanvasRenderingContext2D;
        const { left, right, bottom, top } = chart.chartArea;
        const cx = (left + right) / 2;
        const cy = bottom; 
        const radius = Math.min(right - left, bottom - top) * 0.8 / 2;

        const value: number = chart.config.options.plugins.gauge?.value ?? 84; // 0–100
        const lw = 18;
        const start = -Math.PI;
        const end = 0;
        const angle = start + (value / 100) * Math.PI;

        ctx.save();
        ctx.lineWidth = lw; ctx.lineCap = 'round';
        ctx.strokeStyle = '#FCE7D8';
        ctx.beginPath(); ctx.arc(cx, cy, radius, start, end); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.lineWidth = lw; ctx.lineCap = 'round';
        const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
        grad.addColorStop(0, '#fb923c'); grad.addColorStop(1, '#fb923c');
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, radius, start, angle); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#D1D5DB';
        ctx.font = '11px Inter, system-ui, -apple-system, Segoe UI, Roboto';
        const marks = [20, 40, 60, 80, 100]; const rMark = radius + 16;
        marks.forEach((m) => {
          const a = start + (m / 100) * Math.PI;
          ctx.fillText(String(m), cx + Math.cos(a) * rMark, cy + Math.sin(a) * rMark);
        });
        ctx.restore();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#111827';
        ctx.font = '600 28px Inter, system-ui';
        ctx.fillText(String(Math.round(value)), cx, cy - radius * 0.35);
        ctx.fillStyle = '#6B7280';
        ctx.font = '500 12px Inter, system-ui';
        ctx.fillText('NPS Score', cx, cy - radius * 0.18);
        ctx.restore();
      },
    };

    const gaugeCanvas = this.npsRef?.nativeElement;
    if (gaugeCanvas) {
      const gauge = new Chart(gaugeCanvas.getContext('2d')!, {
        type: 'doughnut',
        data: { datasets: [{ data: [1], backgroundColor: 'transparent', borderWidth: 0 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            gauge: { value: 84 }, 
          } as any,
          animation: { duration: 900 },
        },
        plugins: [semicircleGauge],
      });
      this.charts.push(gauge);
    }

    const barCanvas = this.attBarRef?.nativeElement;
    if (barCanvas) {
      const bar = new Chart(barCanvas.getContext('2d')!, {
        type: 'bar',
        data: {
          labels: ['7 Jun','8 Jun','9 Jun','10 Jun','11 Jun','14 Jun','15 Jun'],
          datasets: [
            { label: 'On-Time', data: [50, 42, 52, 44, 56, 65, 60],
              backgroundColor: '#93c5fd', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.66, stack: 'attendance' },
            { label: 'Late', data: [35, 45, 30, 50, 38, 17, 25],
              backgroundColor: '#f97316', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.66, stack: 'attendance' },
            { label: 'Absent', data: [15, 12, 17, 12, 12, 18, 15],
              backgroundColor: '#e5e7eb', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.66, stack: 'attendance' },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle' } },
            tooltip: {
              callbacks: {
                label: (tt: TooltipItem<'bar'>) => `${tt.dataset.label}: ${Number(tt.parsed.y).toFixed(0)}%`
              }
            }
          },
          scales: {
            x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: '#9ca3af' } },
            y: {
              stacked: true, min: 0, max: 100,
              ticks: { stepSize: 25, callback: (v) => v + '%', color: '#9ca3af' },
              grid: { color: 'rgba(156,163,175,0.15)' },
              border: { display: false }
            }
          }
        }
      });
      this.charts.push(bar);
    }
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c?.destroy());
  }
}