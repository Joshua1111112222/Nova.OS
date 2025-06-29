export const app_name = "perceptra-app";

export const app = _component("perceptra-app", html`
  <div>
    <img src="./apps/perceptra-app/icon.png" alt="Perceptra Icon" style="width:24px; height:24px; vertical-align:middle; margin-right:8px;">
    <span style="font-weight:bold; font-size:14px; vertical-align:middle;">Perceptra</span>
  </div>
  <iframe src="https://joshua1111112222.github.io/Perceptra" style="width:100%; height:calc(100% - 32px); border:none;"></iframe>
`);
