self.addEventListener('message', function getFrameBrightness(event) {
  // http://www.w3.org/TR/WCAG20/#relativeluminancedef
  const data = event.data;
  let brightness = 0;
  let pixelsCount = 0;

  for (var i = 0; i < data.length; i += 4) {
    brightness += 0.2126 * data[i + 1] +
      0.7152 * data[i + 2] +
      0.0722 * data[i + 3];
  }

  self.postMessage(brightness * (1 / (640 * 480)));
}, false);
