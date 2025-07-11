import { styling } from "./styling.js";

export const app_name = "object-detector-app";

export const app = _component("object-detector-app", html`
  <main-container>
    <top-bar>Nova.OS Custom Object Detector</top-bar>
    
    <camera-container style="position: relative; width: 100%; max-width: 400px; margin: auto;">
      <video id="video" autoplay playsinline muted style="width: 100%; border-radius: 10px;"></video>
      <canvas id="overlay" style="position: absolute; top:0; left:0;"></canvas>
    </camera-container>
    
    <controls style="margin-top: 10px; text-align: center;">
      <button id="capture-btn">Capture Photo</button>
      <button id="train-btn" disabled>Train Model</button>
      <button id="detect-btn" disabled>Start Detection</button>
      <button id="reset-btn">Reset</button>
    </controls>
    
    <photos-container style="display: flex; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
      <h3 style="width: 100%;">Captured Photos (click to toggle label)</h3>
      <div id="photos" style="display: flex; flex-wrap: wrap; gap: 5px;"></div>
    </photos-container>
    
    <status style="margin-top: 10px; text-align: center; color: white;"></status>
  </main-container>
  ${styling}
`, app_bootup);


// === GLOBAL STATE ===
let capturedImages = []; // { imgDataUrl: string, label: string }
let model;
let isDetecting = false;
let videoWidth, videoHeight;

async function app_bootup(root) {
  const video = root.querySelector("#video");
  const overlay = root.querySelector("#overlay");
  const captureBtn = root.querySelector("#capture-btn");
  const trainBtn = root.querySelector("#train-btn");
  const detectBtn = root.querySelector("#detect-btn");
  const resetBtn = root.querySelector("#reset-btn");
  const photosDiv = root.querySelector("#photos");
  const status = root.querySelector("status");
  
  // Setup canvas size after video stream starts
  function resizeCanvas() {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
  }

  // Start camera stream
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      resizeCanvas();
    };
  } catch(e) {
    status.textContent = "Error: Unable to access camera.";
    return;
  }

  // Show status helper
  function setStatus(msg) {
    status.textContent = msg;
  }

  // Render captured photos thumbnails with label toggling on click
  function renderCapturedPhotos() {
    photosDiv.innerHTML = "";
    capturedImages.forEach((item, idx) => {
      let img = document.createElement("img");
      img.src = item.imgDataUrl;
      img.style.width = "100px";
      img.style.cursor = "pointer";
      img.title = "Click to toggle label";
      photosDiv.appendChild(img);

      // Show label below image
      let labelSpan = document.createElement("span");
      labelSpan.textContent = item.label || "[no label]";
      labelSpan.style.color = "white";
      labelSpan.style.display = "block";
      labelSpan.style.textAlign = "center";
      photosDiv.appendChild(labelSpan);

      // Toggle label prompt on image click
      img.addEventListener("click", () => {
        let newLabel = prompt("Enter label for this photo (e.g. 'myObject', 'background'):", item.label || "");
        if (newLabel !== null) {
          capturedImages[idx].label = newLabel.trim() || "[no label]";
          renderCapturedPhotos();
          updateTrainButton();
        }
      });
    });
  }

  // Update train button enabled state (need at least 2 labels and some photos)
  function updateTrainButton() {
    const uniqueLabels = new Set(capturedImages.map(img => img.label).filter(l => l && l !== "[no label]"));
    trainBtn.disabled = uniqueLabels.size < 2 || capturedImages.length < 3;
  }

  // Capture photo event
  captureBtn.onclick = () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");

    capturedImages.push({ imgDataUrl: dataUrl, label: "" });
    renderCapturedPhotos();
    setStatus(`Captured ${capturedImages.length} photos.`);
    updateTrainButton();
  };

  // Load TensorFlow.js dynamically (cdn)
  setStatus("Loading TensorFlow.js...");
  await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0/dist/tf.min.js");
  setStatus("TensorFlow.js loaded.");

  // Prepare MobileNet feature extractor for transfer learning
  const mobilenet = await tf.loadLayersModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json");
  // Remove the last layer to use as feature extractor
  const layer = mobilenet.getLayer("conv_pw_13_relu"); // last conv layer before classification
  const featureExtractor = tf.model({ inputs: mobilenet.inputs, outputs: layer.output });

  setStatus("Feature extractor ready.");

  // Prepare UI for training
  trainBtn.onclick = async () => {
    if (capturedImages.length === 0) {
      setStatus("Capture photos before training.");
      return;
    }

    setStatus("Training...");

    // Prepare training data tensors
    // Preprocess images: resize to 224x224, normalize, and convert to tensor
    const labels = [];
    const imageTensors = [];

    // Map label to class index
    const labelSet = [...new Set(capturedImages.map(img => img.label).filter(l => l && l !== "[no label]"))];
    if(labelSet.length < 2) {
      setStatus("Need at least two different labels for training.");
      return;
    }

    const labelToIndex = {};
    labelSet.forEach((l, i) => (labelToIndex[l] = i));

    for (let img of capturedImages) {
      if(!img.label || img.label === "[no label]") continue;
      const imgTensor = await imageToTensor(img.imgDataUrl);
      imageTensors.push(imgTensor);
      labels.push(labelToIndex[img.label]);
    }

    if(imageTensors.length === 0) {
      setStatus("No labeled images to train on.");
      return;
    }

    // Extract features for all images using feature extractor
    const xs = tf.stack(imageTensors.map(t => featureExtractor.predict(t.expandDims()).squeeze()));
    const ys = tf.tensor1d(labels, "int32");
    const ysOneHot = tf.oneHot(ys, labelSet.length);

    // Define a simple classification head
    model = tf.sequential();
    model.add(tf.layers.flatten({inputShape: xs.shape.slice(1)}));
    model.add(tf.layers.dense({units: 100, activation: "relu"}));
    model.add(tf.layers.dropout({rate: 0.5}));
    model.add(tf.layers.dense({units: labelSet.length, activation: "softmax"}));

    model.compile({
      optimizer: tf.train.adam(0.0001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"]
    });

    await model.fit(xs, ysOneHot, {
      epochs: 10,
      batchSize: Math.min(16, imageTensors.length),
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          setStatus(`Training epoch ${epoch + 1}/10 - Loss: ${logs.loss.toFixed(4)} Accuracy: ${(logs.acc*100).toFixed(2)}%`);
        }
      }
    });

    setStatus("Training complete! Model ready for detection.");
    detectBtn.disabled = false;
  };

  // Convert base64 image to tensor of shape [224,224,3]
  async function imageToTensor(dataUrl) {
    return new Promise((resolve) => {
      let img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 224, 224);
        let imgData = ctx.getImageData(0, 0, 224, 224);
        const imgTensor = tf.browser.fromPixels(imgData).toFloat().div(255);
        resolve(imgTensor);
      };
      img.src = dataUrl;
    });
  }

  // Start detection loop
  detectBtn.onclick = () => {
    if (!model) {
      setStatus("Train model before detection.");
      return;
    }
    if (isDetecting) {
      isDetecting = false;
      detectBtn.textContent = "Start Detection";
      setStatus("Detection stopped.");
    } else {
      isDetecting = true;
      detectBtn.textContent = "Stop Detection";
      detectLoop();
    }
  };

  // Detection loop: grab video frame, classify, draw bounding box + label
  async function detectLoop() {
    if (!isDetecting) return;

    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Capture frame from video
    ctx.drawImage(video, 0, 0, overlay.width, overlay.height);
    // Downscale frame for prediction
    const imgTensor = tf.tidy(() => {
      const frameTensor = tf.browser.fromPixels(video);
      return tf.image.resizeBilinear(frameTensor, [224, 224])
        .toFloat()
        .div(255)
        .expandDims();
    });

    // Extract features & predict
    const features = featureExtractor.predict(imgTensor).squeeze().expandDims(0);
    const preds = model.predict(features);
    const predData = await preds.data();

    // Find best class and confidence
    let maxIndex = 0;
    let maxVal = predData[0];
    for (let i = 1; i < predData.length; i++) {
      if (predData[i] > maxVal) {
        maxVal = predData[i];
        maxIndex = i;
      }
    }

    // Threshold for detection
    const threshold = 0.7;

    // Draw bounding box if confidence high
    if (maxVal > threshold) {
      const label = Object.keys(labelToIndex).find(key => labelToIndex[key] === maxIndex);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "lime";
      ctx.fillStyle = "lime";
      ctx.font = "20px Arial";
      ctx.strokeRect(5, 5, overlay.width - 10, overlay.height - 10);
      ctx.fillText(`${label} (${(maxVal * 100).toFixed(1)}%)`, 10, 30);
    }

    tf.dispose([imgTensor, features, preds]);

    // Loop next frame
    requestAnimationFrame(detectLoop);
  }

  // Reset button clears everything
  resetBtn.onclick = () => {
    capturedImages = [];
    photosDiv.innerHTML = "";
    trainBtn.disabled = true;
    detectBtn.disabled = true;
    isDetecting = false;
    detectBtn.textContent = "Start Detection";
    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    setStatus("Reset complete.");
  };
}

// Helper to load external scripts dynamically
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.onload = resolve;
    script.onerror = reject;
    script.src = src;
    document.head.appendChild(script);
  });
}
