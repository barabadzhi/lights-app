const electron = require('electron');
const { ipcRenderer } = electron;

const Chart = require('chart.js');

ipcRenderer.on('section-clicked' , function (event, tabSelector) {
  document.querySelector(tabSelector).click();
});


function openTab(event, tabName) {
  let tabcontent = document.getElementsByClassName('tabcontent');

  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }

  let tabs = document.getElementsByClassName('tab');

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }

  document.getElementById(tabName).style.display = 'block';
  event ? event.currentTarget.classList.add('active') : null;
}

document.querySelector('.webcams-tab').click();


document.getElementById('Webcams').addEventListener('click', function (event) {
  openTab(null, 'Graph');
}, false);

document.getElementById('Graph').addEventListener('click', function (event) {
  openTab(null, 'Webcams');
  document.querySelector('.webcams-tab').classList.add('active');
}, false);


navigator.getUserMedia({
  video: true,
  audio: false
},
(stream) => {
  let video = document.getElementById('video');
  let canvases = document.querySelectorAll('canvas[id^="canvas-"]');
  let contexts = [];

  const fps = 15;

  video.src = URL.createObjectURL(stream);

  video.addEventListener('loadedmetadata', function () {
    for (let i = 0; i < canvases.length; i++) {
      let context = canvases[i].getContext('2d');

      canvases[i].width = video.videoWidth / 2;
      canvases[i].height = video.videoHeight / 2;
      context.scale(0.5, 0.5);
      contexts.push(context);
    }
  });

  video.addEventListener('play', frame, false);

  function frame() {
    setTimeout(function () {
      requestAnimationFrame(frame);
      for (let i = 0; i < contexts.length; i++) {
        contexts[i].drawImage(video, 0, 0);
      }
    }, 1000/fps);
  }


  let graphCanvasContext = document.getElementById('graph-canvas')
    .getContext('2d');
  let data = {
    labels: [],
    datasets: [
      {
        label: 'Освещенность, Лк',
        lineTension: 0.1,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgb(220,220,220)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgb(220,220,220)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 10,
        data : []
      }
    ]
  };

  const options = {
    legend: {
      onClick: function (event, legendItem) {}
    },
    title: {
      display: true,
      text: 'Освещенность помещений'
    },
    responsive: true,
    maintainAspectRatio: false
  };

  let graphChart = new Chart(graphCanvasContext, {
    type: 'line',
    data: data,
    options: options
  });


  let worker = new Worker('worker.js');

  worker.addEventListener('message', function (event) {
    let data = graphChart.data.datasets[0].data;

    if (data.length > 49) {
      data.splice(0, data.length);
      graphChart.data.labels.splice(0, graphChart.data.labels.length);
      graphChart.clear();

      console.clear();
    }

    data.push(event.data.toFixed(3));

    console.log(data.length + ':', event.data);

    graphChart.data.labels.push(data.length);
    graphChart.update();
  });

  setInterval(function () {
    worker.postMessage(contexts[0]
      .getImageData(0, 0, video.videoWidth, video.videoHeight).data);
  }, 1000);


  video.play();
},
(error) => {
  alert('Can\'t get user media!\nError: ' + error);
});
