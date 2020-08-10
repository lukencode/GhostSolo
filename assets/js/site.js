var toggle = document.getElementById("theme-toggle");

if (toggle) {
    var storedTheme = localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (storedTheme)
        document.documentElement.setAttribute('data-theme', storedTheme)

    setTimeout(function() {
        var targetTheme = storedTheme == "dark" ? "light" : "dark";
        switchTweetTheme(targetTheme, storedTheme);
    }, 1000);

    toggle.onclick = function() {
        var currentTheme = document.documentElement.getAttribute("data-theme");
        var targetTheme = "light";

        if (currentTheme === "light") {
            targetTheme = "dark";
        }

        document.documentElement.setAttribute('data-theme', targetTheme)
        localStorage.setItem('theme', targetTheme);

        switchTweetTheme(currentTheme, targetTheme);
    };
}

function switchTweetTheme(currentTheme, targetTheme) {
    var tweets = document.querySelectorAll('[data-tweet-id]');

    tweets.forEach(function(tweet) {
        var src = tweet.getAttribute("src");
        tweet.setAttribute("src", src.replace("theme=" + currentTheme, "theme=" + targetTheme));
    });
}