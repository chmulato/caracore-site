/**
 * Gráficos de Investimento e Retorno para Apresentações
 * 
 * Este módulo cria gráficos interativos usando Chart.js para visualizar
 * investimento, receita e ROI dos projetos CaraCore Hub e Seed.
 * 
 * @author CaraCore Team
 * @version 1.0
 * @date 2025-11-19
 */

(function() {
  'use strict';
  
  // Aguardar Chart.js carregar
  function waitForChartJS() {
    return new Promise((resolve) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }
      
      const checkInterval = setInterval(() => {
        if (typeof Chart !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout após 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        if (typeof Chart !== 'undefined') {
          resolve();
        } else {
          console.warn('Chart.js não carregou. Gráficos não serão exibidos.');
        }
      }, 5000);
    });
  }
  
  // Configuração padrão do Chart.js
  Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = '#475569';
  Chart.defaults.borderColor = '#e2e8f0';
  Chart.defaults.backgroundColor = '#f8fafc';
  
  // Cores do tema
  const colors = {
    primary: '#2563eb',
    secondary: '#4f46e5',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    accent: '#38bdf8',
    gradient1: 'rgba(37, 99, 235, 0.8)',
    gradient2: 'rgba(79, 70, 229, 0.8)',
    gradient3: 'rgba(34, 197, 94, 0.8)'
  };
  
  // Criar gráfico de receita ao longo do tempo (Hub)
  function createHubRevenueChart() {
    const ctx = document.getElementById('hubRevenueChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ano 1', 'Ano 2', 'Ano 3'],
        datasets: [{
          label: 'Receita Total',
          data: [759000, 1790000, 2930000],
          borderColor: colors.primary,
          backgroundColor: colors.gradient1,
          tension: 0.4,
          fill: true,
          borderWidth: 3
        }, {
          label: 'Receita Licenciamento',
          data: [615000, 1070000, 1490000],
          borderColor: colors.secondary,
          backgroundColor: colors.gradient2,
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }, {
          label: 'Receita Recorrente',
          data: [144000, 720000, 1440000],
          borderColor: colors.success,
          backgroundColor: colors.gradient3,
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: { size: 13, weight: '500' }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': R$ ' + context.parsed.y.toLocaleString('pt-BR');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  // Criar gráfico de investimento vs retorno (Hub)
  function createHubInvestmentChart() {
    const ctx = document.getElementById('hubInvestmentChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Investimento', 'Retorno Ano 1', 'Retorno Ano 2', 'Retorno Ano 3'],
        datasets: [{
          label: 'Valor (R$)',
          data: [-1200000, 759000, 1790000, 2930000],
          backgroundColor: [
            colors.danger,
            colors.success,
            colors.success,
            colors.success
          ],
          borderColor: [
            colors.danger,
            colors.success,
            colors.success,
            colors.success
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const sign = value < 0 ? '-' : '+';
                return sign + 'R$ ' + Math.abs(value).toLocaleString('pt-BR');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  // Criar gráfico de receita ao longo do tempo (Seed)
  function createSeedRevenueChart() {
    const ctx = document.getElementById('seedRevenueChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ano 1', 'Ano 2', 'Ano 3'],
        datasets: [{
          label: 'Receita Anual (ARR)',
          data: [432000, 864000, 1728000],
          borderColor: colors.primary,
          backgroundColor: colors.gradient1,
          tension: 0.4,
          fill: true,
          borderWidth: 3
        }, {
          label: 'Receita Mensal (MRR)',
          data: [36000, 72000, 144000],
          borderColor: colors.secondary,
          backgroundColor: colors.gradient2,
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: { size: 13, weight: '500' }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': R$ ' + context.parsed.y.toLocaleString('pt-BR');
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
              }
            },
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  // Criar gráfico de investimento vs retorno (Seed)
  function createSeedInvestmentChart() {
    const ctx = document.getElementById('seedInvestmentChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Investimento Total', 'Retorno Ano 1', 'Retorno Ano 2', 'Retorno Ano 3'],
        datasets: [{
          label: 'Valor (R$)',
          data: [-300000, 432000, 864000, 1728000],
          backgroundColor: [
            colors.danger,
            colors.success,
            colors.success,
            colors.success
          ],
          borderColor: [
            colors.danger,
            colors.success,
            colors.success,
            colors.success
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const sign = value < 0 ? '-' : '+';
                return sign + 'R$ ' + Math.abs(value).toLocaleString('pt-BR');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  // Inicializar gráficos quando Chart.js estiver pronto
  async function initCharts() {
    await waitForChartJS();
    
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js não disponível. Gráficos não serão criados.');
      return;
    }
    
    // Detectar qual página está sendo carregada
    const isHub = document.getElementById('hubRevenueChart') !== null;
    const isSeed = document.getElementById('seedRevenueChart') !== null;
    
    if (isHub) {
      createHubRevenueChart();
      createHubInvestmentChart();
    }
    
    if (isSeed) {
      createSeedRevenueChart();
      createSeedInvestmentChart();
    }
  }
  
  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
  } else {
    initCharts();
  }
})();

