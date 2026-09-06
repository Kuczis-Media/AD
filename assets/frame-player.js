export function createFramePlayer(frameCount, options = {}) {
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas?.getContext("2d", {
    alpha: false,
    desynchronized: true
  });

  if (!canvas || !ctx) {
    throw new Error("Canvas is unavailable");
  }

  const basePath = options.basePath || "frames";

  /*
   * Ile zdekodowanych obrazów trzymamy wokół aktualnej klatki.
   *
   * Same wszystkie 800 plików zostaną pobrane do cache HTTP
   * w tle, ale nie trzymamy wszystkich 800 jako rozpakowane
   * bitmapy, bo przy dużych rozdzielczościach mogłoby to zająć
   * kilka GB RAM.
   */
  const windowAhead = options.windowAhead ?? 110;
  const windowBehind = options.windowBehind ?? 24;

  // Trochę większe niż w poprzedniej wersji.
  const decodedRadius = Math.max(
    options.windowEvict ?? 140,
    180
  );

  // Równoległe ładowanie klatek potrzebnych do wyświetlania.
  const maxImageRequests = 12;

  // Równoległy prefetch całego filmu do cache przeglądarki.
  const backgroundFetches = 8;

  const frames = new Map();
  const pending = new Map();
  const failedUntil = new Map();

  let current = 0;
  let previous = 0;
  let direction = 1;

  let wanted = [];

  let stopped = false;
  let rafPending = false;

  let backgroundStarted = false;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function clamp(index) {
    return Math.max(
      0,
      Math.min(
        frameCount - 1,
        Math.round(index)
      )
    );
  }

  function frameUrl(index) {
    return `${basePath}/frame_${String(index + 1).padStart(4, "0")}.webp`;
  }

  // ---------------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------------

  function requestPaint() {
    if (rafPending || stopped) return;

    rafPending = true;

    requestAnimationFrame(() => {
      rafPending = false;
      paint();
    });
  }

  function getBestFrame() {
    // Idealnie: dokładnie ta klatka.
    const exact = frames.get(current);

    if (exact) {
      return exact;
    }

    /*
     * Jeżeli użytkownik przewinął bardzo szybko i dana klatka
     * jeszcze nie została zdekodowana, szukamy najbliższej.
     *
     * Najpierw preferujemy kierunek ruchu.
     */
    for (let distance = 1; distance <= 40; distance++) {
      if (direction >= 0) {
        const forward = frames.get(current + distance);
        if (forward) return forward;

        const backward = frames.get(current - distance);
        if (backward) return backward;
      } else {
        const backward = frames.get(current - distance);
        if (backward) return backward;

        const forward = frames.get(current + distance);
        if (forward) return forward;
      }
    }

    return null;
  }

  function paint() {
    if (stopped) return;

    const image = getBestFrame();

    if (!image) {
      return;
    }

    const cw = canvas.width;
    const ch = canvas.height;

    const iw = image.naturalWidth;
    const ih = image.naturalHeight;

    if (!iw || !ih) return;

    /*
     * cover — dokładnie tak, żeby obraz zawsze pokrywał
     * cały canvas.
     */
    const scale = Math.max(
      cw / iw,
      ch / ih
    );

    const width = iw * scale;
    const height = ih * scale;

    const x = (cw - width) / 2;
    const y = (ch - height) / 2;

    ctx.drawImage(
      image,
      x,
      y,
      width,
      height
    );

    canvas.style.opacity = "1";
  }

  // ---------------------------------------------------------------------------
  // Decoded image cache
  // ---------------------------------------------------------------------------

  function pruneDecodedFrames() {
    /*
     * Wszystkie pliki nadal mogą być w cache przeglądarki.
     * Usuwamy tylko stare zdekodowane Image, aby RAM nie eksplodował.
     */
    for (const index of frames.keys()) {
      if (
        Math.abs(index - current) >
        decodedRadius
      ) {
        frames.delete(index);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Loading a frame as Image
  // ---------------------------------------------------------------------------

  function loadImage(index, highPriority = false) {
    index = clamp(index);

    if (stopped) {
      return Promise.resolve();
    }

    if (frames.has(index)) {
      return Promise.resolve();
    }

    if (pending.has(index)) {
      return pending.get(index);
    }

    const failed = failedUntil.get(index);

    if (
      failed &&
      Date.now() < failed
    ) {
      return Promise.resolve();
    }

    const image = new Image();

    image.decoding = "async";

    try {
      image.fetchPriority =
        highPriority
          ? "high"
          : "auto";
    } catch {}

    const promise = new Promise((resolve) => {
      let done = false;

      const finish = (success) => {
        if (done) return;

        done = true;

        clearTimeout(timeout);

        image.onload = null;
        image.onerror = null;

        pending.delete(index);

        if (
          success &&
          !stopped
        ) {
          frames.set(
            index,
            image
          );

          failedUntil.delete(index);

          /*
           * Jeżeli właśnie przyszła aktualnie potrzebna
           * klatka, od razu ją malujemy.
           */
          if (
            index === current ||
            !frames.has(current)
          ) {
            requestPaint();
          }
        } else {
          failedUntil.set(
            index,
            Date.now() + 5000
          );
        }

        pruneDecodedFrames();

        resolve();

        /*
         * Zwolniło się miejsce na kolejne żądanie.
         */
        pump();
      };

      const timeout = setTimeout(
        () => finish(false),
        15000
      );

      image.onload = () => {
        finish(
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        );
      };

      image.onerror = () => {
        finish(false);
      };

      image.src = frameUrl(index);
    });

    pending.set(
      index,
      promise
    );

    return promise;
  }

  // ---------------------------------------------------------------------------
  // Which frames should be decoded next
  // ---------------------------------------------------------------------------

  function buildWanted() {
    const result = [current];

    /*
     * Najbliższe klatki mają najwyższy priorytet.
     *
     * Przeplatamy:
     *
     * current
     * current+1
     * current-1
     * current+2
     * current-2
     * ...
     *
     * ale więcej pobieramy w kierunku przewijania.
     */

    if (direction >= 0) {
      const longest = Math.max(
        windowAhead,
        windowBehind
      );

      for (
        let distance = 1;
        distance <= longest;
        distance++
      ) {
        if (
          distance <= windowAhead
        ) {
          result.push(
            current + distance
          );
        }

        if (
          distance <= windowBehind
        ) {
          result.push(
            current - distance
          );
        }
      }
    } else {
      const longest = Math.max(
        windowAhead,
        windowBehind
      );

      for (
        let distance = 1;
        distance <= longest;
        distance++
      ) {
        if (
          distance <= windowAhead
        ) {
          result.push(
            current - distance
          );
        }

        if (
          distance <= windowBehind
        ) {
          result.push(
            current + distance
          );
        }
      }
    }

    return result.filter(
      index =>
        index >= 0 &&
        index < frameCount
    );
  }

  function pump() {
    if (stopped) return;

    let active = pending.size;

    if (
      active >= maxImageRequests
    ) {
      return;
    }

    for (const index of wanted) {
      if (
        active >= maxImageRequests
      ) {
        break;
      }

      if (
        frames.has(index) ||
        pending.has(index)
      ) {
        continue;
      }

      const failed =
        failedUntil.get(index);

      if (
        failed &&
        Date.now() < failed
      ) {
        continue;
      }

      active++;

      void loadImage(
        index,
        index === current
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Background download of ALL frames
  // ---------------------------------------------------------------------------

  async function backgroundFetch(index) {
    try {
      await fetch(
        frameUrl(index),
        {
          cache: "force-cache",
          priority: "low"
        }
      );
    } catch {
      /*
       * To jest tylko prefetch.
       * Normalny Image loader może spróbować ponownie później.
       */
    }
  }

  function startBackgroundPreload(startAt = 0) {
    if (backgroundStarted) {
      return;
    }

    backgroundStarted = true;

    /*
     * Kolejność jest celowa:
     *
     * najpierw klatki od początku filmu,
     * później cała pozostała część.
     */
    const queue = [];

    for (
      let i = startAt;
      i < frameCount;
      i++
    ) {
      queue.push(i);
    }

    let cursor = 0;

    async function worker() {
      while (
        !stopped &&
        cursor < queue.length
      ) {
        const index =
          queue[cursor++];

        await backgroundFetch(
          index
        );

        /*
         * Co kilka pobrań oddajemy browserowi chwilę
         * na renderowanie animacji.
         */
        if (
          index % 12 === 0
        ) {
          await new Promise(
            resolve =>
              setTimeout(resolve, 0)
          );
        }
      }
    }

    for (
      let i = 0;
      i < backgroundFetches;
      i++
    ) {
      void worker();
    }
  }

  // ---------------------------------------------------------------------------
  // Scroll -> frame
  // ---------------------------------------------------------------------------

  function drawAt(position) {
    const next = clamp(position);

    if (
      next !== current
    ) {
      previous = current;

      current = next;

      direction =
        current >= previous
          ? 1
          : -1;

      wanted =
        buildWanted();

      pruneDecodedFrames();

      /*
       * Aktualna klatka zawsze pierwsza.
       */
      if (
        !frames.has(current)
      ) {
        void loadImage(
          current,
          true
        );
      }

      pump();
    }

    /*
     * requestAnimationFrame powoduje, że nawet gdy GSAP
     * wywoła drawAt wiele razy w jednym cyklu,
     * canvas malujemy tylko raz na ekranową klatkę.
     */
    requestPaint();
  }

  // ---------------------------------------------------------------------------
  // Resize
  // ---------------------------------------------------------------------------

  function resize() {
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      options.dprCap || 2
    );

    const cssWidth =
      canvas.clientWidth ||
      window.innerWidth;

    const cssHeight =
      canvas.clientHeight ||
      window.innerHeight;

    const width =
      Math.round(
        cssWidth * dpr
      );

    const height =
      Math.round(
        cssHeight * dpr
      );

    if (
      canvas.width !== width
    ) {
      canvas.width = width;
    }

    if (
      canvas.height !== height
    ) {
      canvas.height = height;
    }

    /*
     * To NIE jest blur.
     *
     * Browser wygładza skalowanie obrazu podczas
     * drawImage().
     */
    ctx.imageSmoothingEnabled = true;

    if (
      "imageSmoothingQuality" in ctx
    ) {
      ctx.imageSmoothingQuality =
        "high";
    }

    requestPaint();
  }

  // ---------------------------------------------------------------------------
  // Initial preload
  // ---------------------------------------------------------------------------

  async function preloadAll(
    onProgress = () => {},
    preloadCount = frameCount
  ) {
    /*
     * Twój script.js przekazuje tutaj 90.
     *
     * Czyli loader czeka na pierwszych 90 klatek,
     * żeby początek animacji był całkowicie płynny.
     */
    const count = Math.max(
      1,
      Math.min(
        frameCount,
        Math.round(preloadCount)
      )
    );

    let cursor = 0;
    let completed = 0;

    /*
     * Podczas początkowego preloadu możemy
     * pozwolić sobie na większą współbieżność.
     */
    const workers = Math.min(
      12,
      count
    );

    async function worker() {
      while (
        !stopped
      ) {
        const index =
          cursor++;

        if (
          index >= count
        ) {
          return;
        }

        await loadImage(
          index,
          index < 5
        );

        completed++;

        onProgress(
          completed,
          count
        );
      }
    }

    await Promise.all(
      Array.from(
        {
          length: workers
        },
        () => worker()
      )
    );

    current = 0;
    previous = 0;
    direction = 1;

    wanted =
      buildWanted();

    requestPaint();
    pump();

    /*
     * KLUCZOWA ZMIANA:
     *
     * loader już znika i użytkownik może przewijać,
     * ale klatki 91 -> 800 nadal pobierają się
     * po cichu w tle.
     */
    startBackgroundPreload(
      count
    );
  }

  function preloadOne(index) {
    return loadImage(
      clamp(index),
      true
    );
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  window.addEventListener(
    "pagehide",
    () => {
      stopped = true;
      frames.clear();
      pending.clear();
    }
  );

  window.addEventListener(
    "pageshow",
    event => {
      if (
        event.persisted
      ) {
        stopped = false;

        wanted =
          buildWanted();

        drawAt(current);

        startBackgroundPreload(0);
      }
    }
  );

  resize();

  return {
    frameCount,
    draw: drawAt,
    drawAt,
    resize,
    preloadAll,
    preloadOne
  };
}