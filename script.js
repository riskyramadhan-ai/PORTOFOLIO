document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // MENU MOBILE
    // ==============================
    const menu = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#nav");

    if (menu && nav) {
        menu.addEventListener("click", function () {
            nav.classList.toggle("open");
        });

        document.querySelectorAll("#nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("open");
            });
        });
    }


    // ==============================
    // ANIMASI REVEAL
    // ==============================
    const elements = document.querySelectorAll(".reveal");

    // Tampilkan semua elemen terlebih dahulu
    elements.forEach(function (element) {
        element.classList.add("show");
    });


    // ==============================
    // ANIMASI SAAT SCROLL
    // ==============================
    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                    }

                });

            },
            {
                threshold: 0.05
            }
        );

        elements.forEach(function (element) {
            observer.observe(element);
        });
    }

});
