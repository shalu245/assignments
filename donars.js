// script.js

// Dummy donation data (you can replace this with real API later).
// Each donation: { id, donor, amount, date (YYYY-MM-DD), note }
const donations = [
  { id:1, donor:"Asha Patel", amount:500, date:"2025-11-02", note:"Monthly" },
  { id:2, donor:"Rohit Kumar", amount:1200, date:"2025-11-10", note:"One-time" },
  { id:3, donor:"Sanya Mehta", amount:250, date:"2025-10-13", note:"Event" },
  { id:4, donor:"Asha Patel", amount:300, date:"2025-09-28", note:"Monthly" },
  { id:5, donor:"Vikram Singh", amount:1500, date:"2025-09-02", note:"Donation drive" },
  { id:6, donor:"Priya Sharma", amount:700, date:"2025-10-25", note:"One-time" },
  { id:7, donor:"Rohit Kumar", amount:400, date:"2025-11-20", note:"Support" },
  { id:8, donor:"Nisha R.", amount:2000, date:"2025-08-18", note:"Corporate" },
  { id:9, donor:"Karan", amount:350, date:"2025-08-28", note:"Crowd" },
  { id:10, donor:"Sunita", amount:1000, date:"2025-11-22", note:"Event" }
];

// Utility: format currency (INR)
function formatINR(x){
  return "₹" + x.toLocaleString('en-IN');
}

// Calculate totals and unique donors
function calculateStats(data){
  const totalAmount = data.reduce((s, d) => s + Number(d.amount || 0), 0);
  const donorsSet = new Set(data.map(d => d.donor));
  const numDonors = donorsSet.size;
  const numDonations = data.length;
  return { totalAmount, numDonors, numDonations };
}

// Populate stat cards
function renderStats(){
  const stats = calculateStats(donations);
  document.getElementById('total-amount').innerText = formatINR(stats.totalAmount);
  document.getElementById('num-donors').innerText = stats.numDonors;
  document.getElementById('num-donations').innerText = stats.numDonations;
}

// Populate recent donations table (sorted by date desc)
function renderTable(){
  const tbody = document.querySelector('#donation-table tbody');
  tbody.innerHTML = '';
  // sort descending by date
  const sorted = donations.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.date}</td>
      <td>${d.donor}</td>
      <td>${d.amount.toLocaleString('en-IN')}</td>
      <td>${d.note || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Build monthly trend data (group by YYYY-MM)
function buildMonthlyTrend(data){
  const map = new Map();
  data.forEach(d => {
    const dt = new Date(d.date);
    const key = dt.getFullYear() + "-" + String(dt.getMonth()+1).padStart(2,'0'); // e.g. 2025-11
    map.set(key, (map.get(key) || 0) + Number(d.amount || 0));
  });
  // sort keys ascending
  const keys = Array.from(map.keys()).sort();
  const labels = keys.map(k => {
    const [y,m] = k.split('-');
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return monthNames[Number(m)-1] + ' ' + y;
  });
  const values = keys.map(k => map.get(k));
  return { labels, values };
}

// Render Chart.js line chart
let chartInstance = null;
function renderChart(){
  const ctx = document.getElementById('trendChart').getContext('2d');
  const trend = buildMonthlyTrend(donations);
  // if no data for last months, you can provide last 6 months labels with zeros (optional)
  if(chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trend.labels,
      datasets: [{
        label: 'Donations (₹)',
        data: trend.values,
        fill: true,
        tension: 0.25,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(val){ return '₹' + val.toLocaleString('en-IN'); }
          }
        }
      }
    }
  });
}

// Initialize page
function init(){
  renderStats();
  renderTable();
  renderChart();
}

// run
document.addEventListener('DOMContentLoaded', init);
