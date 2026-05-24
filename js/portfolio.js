$(function () {
  // ── Graffiti Intro Loop ──
  var graffitiTargets = [
    '.graffiti-green-fill',
    '.graffiti-text-wrap',
    '.graffiti-portfolio',
    '.graffiti-streak',
    '.graffiti-badge',
    '.graffiti-badge span'
  ];

  function replayGraffiti() {
    graffitiTargets.forEach(function(sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });
  }

  if (document.querySelector('.hero-graffiti')) {
    var LOOP_MS = 3800;
    setTimeout(function loop() {
      replayGraffiti();
      setTimeout(loop, LOOP_MS);
    }, LOOP_MS);
  }

  const projects = [
    {
      title: "타이포",
      url: "https://www.youtube.com/embed/S2JsTS0WkqY?si=Cvj-HQo7mk04UQ-D",
      thumb: "images/5.jpg",
    },
    {
      title: "설화수",
      url: "https://www.youtube.com/embed/OXLQ7dEtEZ4?si=FxEVm1t25xonDYSe",
    },
    {
      title: "공모전",
      url: "https://www.youtube.com/embed/4xZXZYNNzc8?si=2DLr8BXc9jpMOC7-",
    },
    {
      title: "앨리스",
      url: "https://www.youtube.com/embed/_EywHi01O3w",
    },
    {
      title: "Wedding",
      url: "https://www.youtube.com/embed/QVI0CnB9imU?si=0vtciLCSZw-BVg2n",
      thumb: "images/wedding.jpg",
      thumbClass: "wedding-thumb",
      start: 1,
    },
  ];

  function getYoutubeId(url) {
    if (!url) return "";
    const match = url.match(/(?:embed\/|shorts\/|watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : "";
  }

  function getEmbedUrl(url, start) {
    const videoId = getYoutubeId(url);
    const startParam = start ? `&start=${start}` : "";
    const cleanParams = `autoplay=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0${startParam}`;
    return videoId ? `https://www.youtube.com/embed/${videoId}?${cleanParams}` : "";
  }

  function getThumbUrl(url) {
    const videoId = getYoutubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
  }

  // ── Swiper 슬라이드 생성 ──
  const $wrapper = $(".project .swiper-wrapper");
  $wrapper.empty();

  projects.forEach(function (project, idx) {
    if (!project.url) return;
    const thumbUrl = project.thumb || getThumbUrl(project.url);
    const $slide = $('<div class="swiper-slide"></div>').attr("data-project-index", idx);
    const $img = $('<img src="" alt="">');
    if (project.thumbClass) $img.addClass(project.thumbClass);
    if (thumbUrl) $img.attr({ src: thumbUrl, alt: `${project.title} 썸네일` });
    $slide.append($img);
    $wrapper.append($slide);
  });

  // ── 프로젝트 클릭 → 팝업 ──
  $(".project").on("click", ".swiper-slide", function () {
    const idx = $(this).data("project-index");
    const embedUrl = getEmbedUrl(projects[idx].url, projects[idx].start);
    if (!embedUrl) return;
    $(".project .swiper-slide").removeClass("is-active");
    $(this).addClass("is-active");
    setTimeout(function () {
      $(".popup iframe").attr("src", embedUrl);
      $(".popupbox").fadeIn(200);
    }, 180);
  });

  $(".popup .exit").click(function () {
    $(".popupbox").fadeOut(200);
    $(".popup iframe").attr("src", "");
    $(".project .swiper-slide").removeClass("is-active");
  });

  // ── Shorts 생성 ──
  const shorts = [
    "https://youtube.com/shorts/0537ld_XGMU?si=gD1JpQPdrVP8IN8I",
    "https://youtube.com/shorts/zboiPKDSFVM?si=ecimqJ6ClcB28Puz",
    "https://youtube.com/shorts/_vB76EE3Jc0?si=BA_aVmvK_fvq-fs_",
  ];

  const $shortsList = $(".shorts-list");

  shorts.forEach(function (url, idx) {
    const videoId = getYoutubeId(url);
    if (!videoId) return;
    const $item = $('<button type="button" class="shorts-item"></button>').attr({
      "data-url": getEmbedUrl(url),
      "aria-label": `쇼츠 ${idx + 1} 재생`,
    });
    $item.append($("<img>").attr({
      src: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      alt: `쇼츠 ${idx + 1} 썸네일`,
    }));
    $shortsList.append($item);
  });

  $(".shorts-list").on("click", ".shorts-item", function () {
    const embedUrl = $(this).attr("data-url");
    if (!embedUrl) return;

    $(".shorts-item iframe").each(function () {
      const $item = $(this).closest(".shorts-item");
      const thumbSrc = $item.attr("data-thumb");
      if (thumbSrc) {
        $item.empty().append($("<img>").attr({ src: thumbSrc, alt: $item.attr("aria-label") }));
      }
    });

    if (!$(this).attr("data-thumb")) {
      $(this).attr("data-thumb", $(this).find("img").attr("src"));
    }

    $(this).empty().append(
      $("<iframe>").attr({
        src: embedUrl,
        title: "YouTube Shorts player",
        frameborder: "0",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        referrerpolicy: "strict-origin-when-cross-origin",
        allowfullscreen: "allowfullscreen",
      })
    );
  });

  // ── 네비 클릭 → 섹션 이동 ──
  $("header ul li").click(function () {
    let idx = $(this).index() + 1;
    let targetTop = $("main section").eq(idx).offset().top;
    $("html, body").stop(true).animate({ scrollTop: targetTop }, 800);
  });

  // ── 스크롤 → 사이드바 전환 + 네비 활성화 ──
  $(window).scroll(function () {
    let sct = $(window).scrollTop();
    let winH = $(window).height();

    if (sct > 100) {
      $("header").addClass("sticky-right");
    } else {
      $("header").removeClass("sticky-right");
    }

    $("main section").each(function (i) {
      if (sct >= $(this).offset().top - winH / 3) {
        let menuIdx = i - 1;
        if (menuIdx >= 0) {
          $("header ul li").removeClass("on").eq(menuIdx).addClass("on");
        }
      }
    });
  });

  // ── YouTube IFrame API (Blender 탭 7~10초 루프) ──
  var blenderPlayer = null;
  var blenderLoopTimer = null;

  function startBlenderLoop(player) {
    if (blenderLoopTimer) clearInterval(blenderLoopTimer);
    blenderLoopTimer = setInterval(function () {
      try {
        if (player.getCurrentTime() >= 10) player.seekTo(7, true);
      } catch (e) {}
    }, 150);
  }

  window.onYouTubeIframeAPIReady = function () {
    blenderPlayer = new YT.Player('blender-yt-player', {
      videoId: 'OXLQ7dEtEZ4',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        mute: 1,
        playsinline: 1,
        rel: 0,
        start: 7
      },
      events: {
        onReady: function (e) { startBlenderLoop(e.target); },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.PLAYING) startBlenderLoop(e.target);
        }
      }
    });
  };

  var ytTag = document.createElement('script');
  ytTag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(ytTag);

  // ── Tools 탭 ──
  $(".toolbox .button > li").click(function () {
    $(".button ul").slideUp();
    $(this).find("ul").slideToggle();
    let idx = $(this).index();
    $(".tabitem .tab-media").hide();
    $(".tabitem .tab-media").eq(idx).fadeToggle(700);

    if (idx === 1 && blenderPlayer && blenderPlayer.seekTo) {
      setTimeout(function () {
        blenderPlayer.seekTo(7, true);
        blenderPlayer.playVideo();
      }, 100);
    }
  });
  $(".toolbox .button > li").eq(0).trigger("click");

  // ── About 카드 뒤집기 ──
  $(".ab1").on("click", function () {
    $(this).toggleClass("is-flipped");
  });

  $(".ab1").on("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      $(this).toggleClass("is-flipped");
    }
  });
});
