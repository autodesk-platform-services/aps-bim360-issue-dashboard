
export async function refreshReports(projectId, containerId) {
   
  const dateInput = new Date($("#oneWeekDueIssueDate").val());
  const weekDueStart = `${dateInput.getUTCFullYear()}-${(("0" + (dateInput.getUTCMonth() + 1)).slice(-2))}-${("0" + dateInput.getUTCDate()).slice(-2)}`;
  const res = await fetch(`/api/issueState/${projectId}/${containerId}`,
    {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekDueStart: weekDueStart })
    });

  const stats = await res.json();

  destoryAllViews();
  refreshIssueOverview(stats.overview);
  refreshIssuebySubType(stats.subType);
  refreshRootcause(stats.rootCause);
  refreshWeekDue(stats.weekDue);

}

//sort the nodes of the timeliner according to the sequence of time.
var overallStatusPie = null;
var issueBySubtypeBar = null;
var issueByRootCauseBar = null;
var issueByWeekDueBar = null;

function sortOnKeys(dict) {

  var sorted = [];
  for (var key in dict) {
    sorted[sorted.length] = key;
  }
  sorted.sort();

  var tempDict = {};
  for (var i = 0; i < sorted.length; i++) {
    tempDict[sorted[i]] = dict[sorted[i]];
  }

  return tempDict;
}

var Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.5 + ')';
}

function refreshIssueOverview(overview) {

  var labels = [], dataTotals = [], colors = [];
  for (var status in overview) {
    labels.push(status);
    dataTotals.push(overview[status]);
    colors.push(random_rgba())
  }

  var chartData = {
    datasets: [{
      data: dataTotals,
      backgroundColor: colors
    }],
    labels: labels
  };

  var config = {
    type: 'pie',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,

      title: {
        display: true,
        text: 'Overall Status'
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      legend: {
        display: true
      },
      plugins: {
        datalabels: {
          display: true,
          align: 'center',
          anchor: 'center'
        }
      }
    }
  };


  var canvas = document.getElementById('issueOverview');
  var ctx = canvas.getContext('2d');

  overallStatusPie = new Chart(ctx, config);
  overallStatusPie.update();

}

function refreshRootcause(rootcause) {

  var labels = [], dataTotals = [], colors = [];
  for (var cause in rootcause) {
    labels.push(cause);
    dataTotals.push(rootcause[cause]);
    colors.push(random_rgba())
  }

  var chartData = {
    datasets: [{
      data: dataTotals,
      backgroundColor: colors
    }],
    labels: labels
  };

  var config = {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,

      title: {
        display: true,
        text: 'Root Cause'
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      legend: {
        display: true
      },
      plugins: {
        datalabels: {
          display: true,
          align: 'center',
          anchor: 'center'
        }
      }
    }
  };


  var canvas = document.getElementById('issueByRootCause');
  var ctx = canvas.getContext('2d');

  issueByRootCauseBar = new Chart(ctx, config);
  issueByRootCauseBar.update();
}

function refreshIssuebySubType(subType) {

  var labels = [], dataTotals = [], colors = [];
  for (var t in subType) {
    labels.push(t);
    dataTotals.push(subType[t]);
    colors.push(random_rgba())
  }

  var chartData = {
    datasets: [{
      data: dataTotals,
      backgroundColor: colors
    }],
    labels: labels
  };


  var canvas = document.getElementById('issueBySubtype');
  var ctx = canvas.getContext('2d');

  issueBySubtypeBar = new Chart(ctx, {
    type: 'horizontalBar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      title: {
        display: true,
        text: 'Open Issue by SubType'
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      legend: {
        display: false
      }
    }
  });
  issueBySubtypeBar.update();

}

function refreshWeekDue(weekdue) {

  weekdue = sortOnKeys(weekdue);

  var labels = [], dataTotal = [], dataClosed = [];
  for (var due_date in weekdue) {
    labels.push(Months[new Date(Number(due_date)).getMonth()] + ' ' +
      new Date(Number(due_date)).getDate());
    dataTotal.push(weekdue[due_date].dueissue);
    dataClosed.push(weekdue[due_date].isclosed);
  }

  var chartData = {
    labels: labels,
    datasets: [{
      type: 'bar',
      label: 'Due',
      backgroundColor: random_rgba(),
      data: dataTotal,
      borderColor: 'white',
      borderWidth: 2
    }, {
      type: 'bar',
      label: 'Closed',
      backgroundColor: random_rgba(),
      data: dataClosed
    }]
  };
 

  var canvas = document.getElementById('issueWeekDue');
  var ctx = canvas.getContext('2d');

  issueByWeekDueBar = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      maintainAspectRatio: false,
      responsive: true,
      title: {
        display: true,
        text: 'Number of Issues Due This Week'
      },
      legend: {
        display: true,
        position: 'top'
      },
      tooltips: {
        mode: 'index',
        intersect: true
      },
      scales: {
        yAxes: [{
          ticks: {
            stepSize: 1
          }
        }]
      }
    }
  });
  issueByWeekDueBar.update();

}

function destoryAllViews() {
  if (issueByWeekDueBar)
    issueByWeekDueBar.destroy();
  if (issueByRootCauseBar)
    issueByRootCauseBar.destroy();
  if (overallStatusPie)
    overallStatusPie.destroy();
  if (issueBySubtypeBar)
    issueBySubtypeBar.destroy();
}
 