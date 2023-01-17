const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

const getVideo = async () => {
  // for more information https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    if ("srcObject" in video) {
      video.srcObject = mediaStream;
    } else {
      // Avoid using this in new browsers, as it is going away.
      video.src = URL.createObjectURL(mediaStream);
    }

    video.play();
  } catch (error) {
    console.error(error);
  }
};

//this will have the canvas to display the video
const paintToCanvas = () => {
  const width = video.videoWidth;
  const height = video.videoHeight;
  console.log(width, height);
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    //take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);

    //this function is if you want the effect to be just red
    // pixels = redEffect(pixels);

    //this function has red green blue split effect
    pixels = rgbSplit(pixels);
    ctx.globalAlpha = 0.09;

    //function greenScreen
    pixels = greenScreen(pixels);
    ctx.putImageData(pixels, 0, 0);
  }, 16);
};

const takePhoto = () => {
  //not playing the sound
//   snap.currentTime = 0;
//   snap.play();

  //take the data out of canvas
  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "cute");
  link.innerHTML = `<img src="${data}" alt="it is you!" />`;
  strip.insertBefore(link, strip.firstChild);
};

const redEffect = (pixels) => {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 200; //red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
  }
  return pixels;
};

const rgbSplit = (pixels) => {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 200] = pixels.data[i + 0]; //red
    pixels.data[i + 100] = pixels.data[i + 1]; //green
    pixels.data[i - 150] = pixels.data[i + 2]; //blue
  }
  return pixels;
};

//this function is different effect
const greenScreen = (pixels) => {
  const levels = {};
  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
    // console.log(levels)
  });

  for (let i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      pixels.data[i + 3] = 0;
    }
  }
  return pixels;
};

getVideo();

video.addEventListener("canplay", paintToCanvas);
