$(document).ready(function () {

    var x;
    var url_string = window.location.href
    var url = new URL(url_string)
    var c = url.searchParams.get("auth")

    if (c === 'success') {
        x = document.getElementById("snackbar");
        x.className = "show"
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000)
    }
    else if (c === 'error') {
        x = document.getElementById("snackbar-error");
        x.className = 'show'
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000)
    }
});


