# telemetry-overlay
  <body>
    <div class="telemetry-overlay">
      <video id="stream" autoplay playsinline muted>Your browser does not support video</video>
      <div class="overlay"><canvas></canvas></div>
      <div class="navigation-map">
        <div id="map"></div>
        <div id="gui"></div>
      </div>
      <div class="compass">
        <div class="compass-scale"><span>W</span><span>NW</span><span>N</span><span>NE</span><span>E</span><span>SE</span><span>S</span><span>SW</span><span>W</span></div>
        <div class="indicator">▲</div>
      </div>
      <div class="head-up-display">
        <div class="crosshair"></div>
      </div>
      <div class="footer">
        <div>
          <button id="fullscreen-btn">Go Fullscreen</button>
        </div>
        <div id="chart"></div>
      </div>
    </div>
  </body>
