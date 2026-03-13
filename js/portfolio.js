$(function () {
  let popup = [
    "images/1.jpg",
    "images/2.jpg",
    "images/3.jpg",
    "images/4.jpg",
    "images/5.jpg",
    "images/6.jpg",
    "images/7.jpg",
  ];
  $(".project .swiper-slide").click(function () {
    let idx = $(this).index();
    console.log(idx);
    $(".popup img").attr("src", popup[idx]);
  });
  $(".project .swiper-slide").click(function () {
    $(".popupbox").show();
  });
  $(".popup .exit").click(function () {
    $(".popupbox").hide();
  });
  // header ul li 클릭했을 때 할일
  $("header .container ul li").click(function () {
    // 클릭한 li의 색(on 클래스)깔이 바뀜
    $(this).addClass("on").siblings().removeClass("on");
    // 해당하는 section 이동
    let idx = $(this).index() + 1;
    let sd = $("main section").eq(idx).offset().top;
    $("html, body").animate({
      scrollTop: sd,
    });
  });
  // window 스크롤 했을 때 할일
  $(window).scroll(function () {
    $("main section").each(function () {
      //해당하는 section offset().top <= scrollTop()
      if ($(this).offset().top <= $(window).scrollTop()) {
        let idx = $(this).index() + 1;
        $("header .container ul li").removeClass("on");
        $("header .container ul li").eq(idx).addClass("on");
      }
    });
  });

  $(".toolbox .button > li").click(function () {
    $(".button ul").slideUp();
    $(this).find("ul").slideToggle();
    let idx = $(this).index();
    $(".tabitem img").hide();
    $(".tabitem img").eq(idx).fadeToggle(700);
  });
  $(".toolbox .button > li").eq(0).trigger("click");
});
$(function () {
  $(window).scroll(function () {
    let sct = $(window).scrollTop();
    let winH = $(window).height();

    // 사이드바 전환 시점
    if (sct > 100) {
      $("header").addClass("sticky-right");
    } else {
      $("header").removeClass("sticky-right");
    }

    // 섹션 위치 감지 (정확한 인덱스 매칭)
    $("main section").each(function (i) {
      let target = $(this).offset().top;
      // 화면의 1/3 지점을 지날 때 메뉴가 바뀌도록 설정
      if (sct >= target - winH / 3) {
        let menuIdx = i - 1; // 0번(영상) 제외하고 1번(Motion)부터 시작
        if (menuIdx >= 0) {
          $("header ul li").removeClass("on").eq(menuIdx).addClass("on");
        }
      }
    });
  });

  // 클릭 시 이동
  $("header ul li").click(function () {
    let idx = $(this).index() + 1;
    let targetTop = $("main section").eq(idx).offset().top;
    
    $("html, body").stop().animate({
      scrollTop: targetTop
    }, 800);
  });
});