// Ajax Post Related
function logout() {
    window.location.href = window.location.origin + '/logout';
}

function editEmail() {
    var email = $('#email').val();

    editUser(email, "email");
}

function editPassword() {
    var password = $('#password').val();
    var repassword = $('#repassword').val();
    var error = [];

    if (password.length < 6) {
        error.push("Password must be longer than 6.");
    }

    if (/\s/.test(password)) {
        error.push("Password should not contain any spaces.");
    }

    if (password !== repassword) {
        error.push("Password doesn't match!");
    }

    if (error.length > 0) {
        var errMsg = "Error: <br>";

        jQuery.each(error, function (i, val) {
            errMsg += val + "<br>"
        });

        displayModal(errMsg + " ");
    }
    else {
        editUser(password, "password");

        $('#password').val("");
        $('#repassword').val("");
    }
}
function editUsername() {
    var username = $('#username').val();
    var error = [];

    if (username === "") {
        error.push("You must fill everything in.");
    }

    if (username.length >= 17 || username.length <= 2) {
        error.push("Username must be between 3-16 charaters.");
    }

    if (/\s/.test(username)) {
        error.push("Username could not contain any spaces.");
    }

    if (!(/^[A-Za-z0-9]+$/.test(username))) {
        error.push("Username could not contains symbols.")
    }

    if (error.length > 0) {
        var errMsg = "Error: <br>";

        jQuery.each(error, function (i, val) {
            errMsg += val + "<br>"
        });

        displayModal(errMsg + " ");
    }
    else {
        editUser(username, "username");
    }
}

function editUser(items, type) {
    var editUser = {
        "type": type,
        "datas": items
    }

    $.ajax({
        url: "/settings",
        type: "POST",
        data: editUser,
        success: (returned) => {

            if (returned === "profile-pic") {
                window.location.href = window.location.href;
                displayModal("Your image has been changed! But it may takes a while to change from your browsers. Keep refreshing if it does not change.");
            }

            if (type === "username") {
                if (returned === "pass") {
                    displayModal("You'r username has changed.");
                }
                else if (returned === "user-exist") {
                    displayModal("Unable to change your username: Username already exists!");
                }
                else {
                    displayModal("Opps.. Something went wrong! Try reloading the page instead?");
                }
            }

            if (type === "password") {
                if (returned === "pass") {
                    displayModal("You'r password has changed.");
                }
                else {
                    displayModal("Something went wrong... Try reloading your page.")
                }
            }

            if (type == "email") {
                if (returned === "pass") {
                    displayModal("You'r email has changed.");
                }
                else if (returned === "email-exist") {
                    displayModal("Unable to change your email: Email already exists!");
                }
                else {
                    displayModal("Something went wrong... Try reloading your page.")
                }
            }

        },
        error: (returned) => {
            window.location.href = window.location.href + "?error=fail";
        }
    });
}

function searchUser() {
    var username = $('#username').val();
    var error = [];

    if (username === "") {
        error.push("You must fill everything in.");
    }

    if (username.length >= 17 || username.length <= 2) {
        error.push("Username must be between 3-16 charaters.");
    }

    if (/\s/.test(username)) {
        error.push("Username could not contain any spaces.");
    }

    if (!(/^[A-Za-z0-9]+$/.test(username))) {
        error.push("Username could not contains symbols.")
    }

    if (error.length > 0) {
        var errMsg = "Error: <br>";

        jQuery.each(error, function (i, val) {
            errMsg += val + "<br>"
        });

        displayModal(errMsg + " ");
    }
    else {
        var search = {
            "name": username
        }

        $.ajax({
            url: "/search",
            type: "POST",
            data: search,
            success: (returned) => {

                $('.user-list-col').remove();

                if (returned.length == 0) {
                    $(".appendnext:last").after('<div class="user-list-col"><a href=""#><div class="search-profile"><div class="user-picture" style="background-image: url(./img/profile-pic/default.jpg);"></div><p class="username">No User</p></div></a></div>');
                } else {
                    returned.forEach((user) => {
                        $(".appendnext:last").after('<div class="user-list-col"><a href="/u/' + user.user_name + '"><div class="search-profile"><div class="user-picture" style="background-image: url(./img/profile-pic/' + user.user_profilepic + ');"></div><p class="username">' + user.user_name + '</p></div></a></div>');
                    });
                }

            },
            error: (returned) => {
                window.location.href = window.location.href + "?search=fail";
            }
        });
    }

}

function askQuestions(username) {
    var questions = $("#questions").val();

    if (/\s/.test(questions)) {
        var questions = {
            "questions": questions
        }

        $.ajax({
            url: "/u/" + username + "/ask",
            type: "POST",
            data: questions,
            success: (returned) => {

                if (returned === "pass") {
                    $("#questions").val("");
                    displayModal("Done! Reload the page to see your questions.");
                }
                else {
                    displayModal("Failed! Something went wrong, reload the page.")
                }

            },
            error: (returned) => {
                window.location.href = window.location.href + "?ask=fail";
            }
        });
    }
    else {
        displayModal("Umm, I don't think that's a question.")
    }

}

function showDeleteModal(q_id, username) {
    var username = username;
    var html = "<p>Are you sure you want to delete this questions?</p> <br> <button id='btn-del' class='btn-delete'>Delete Question</button>"

    displayModal(html);

    $('#btn-del').attr('onclick', 'deleteQuestions(' + q_id + ', "' + username + '")');
}

function deleteQuestions(q_id, username) {
    var del = {
        "id": q_id
    }

    $.ajax({
        url: "/u/" + username + "/del",
        type: "POST",
        data: del,
        success: (returned) => {

            if (returned === "pass") {
                displayModal("Successfully deleted the questions.")
            }
            else {
                displayModal("Something went wrong... Reload the page and try again.")
            }
        },
        error: (returned) => {
            window.location.href = window.location.origin + window.location.pathname + "?del=Something went wrong..";
        }
    });
}

function addAnswer(q_id, username) {
    var ans = {
        "answers": $("#questions").val(),
        "id": q_id
    }

    $.ajax({
        url: "/u/" + username + "/ans",
        type: "POST",
        data: ans,
        success: (returned) => {

            if (returned === "pass") {
                displayModal("Successfully answered the questions. Reload to see your answer...")
            }
            else {
                displayModal("Something went wrong... Reload the page and try again.")
            }

        },
        error: (returned) => {
            window.location.href = window.location.origin + window.location.pathname + "?del=Something went wrong..";
        }
    });
}

function deleteAnswer(q_id, username) {
    var delAns = {
        "id": q_id
    }

    $.ajax({
        url: "/u/" + username + "/delans",
        type: "POST",
        data: delAns,
        success: (returned) => {
            if (returned === "pass") {
                displayModal("Successfully removed your answer. Reload the page to answer again.")
            }
            else {
                displayModal("Something went wrong... Reload the page and try again.")
            }
        },
        error: (returned) => {
            window.location.href = window.location.origin + window.location.pathname + "?del=Something went wrong..";
        }
    });

}

function starQuestions(q_id, username) {
    var stars = {
        "id": q_id
    }
    $.ajax({
        url: "/u/" + username + "/star",
        type: "POST",
        data: stars,
        success: (returned) => {

            if (returned === "pass") {
                displayModal("+1 Star to " + username);
            }
            else {
                displayModal("You already gave star to this questions.")
            }
        },
        error: (returned) => {
            window.location.href = window.location.origin + window.location.pathname + "?star=Something went wrong..";
        }
    });
}

function loginUser() {
    var name = $('#username').val();
    var password = $('#password').val();
    var error = [];

    if (name === "" || password === "") {
        error.push("You must fill everything in.");
    }

    if (name.length >= 17 || name.length <= 2) {
        error.push("Username must be between 3-16 charaters.");
    }

    if (/\s/.test(name)) {
        error.push("Username could not contain any spaces.");
    }

    if (!(/^[A-Za-z0-9]+$/.test(name))) {
        error.push("Username could not contains symbols.")
    }

    if (password.length < 6) {
        error.push("Password must be longer than 6.");
    }

    if (/\s/.test(password)) {
        error.push("Password should not contain any spaces.");
    }

    if (error.length > 0) {
        var errMsg = "Error: <br>";

        jQuery.each(error, function (i, val) {
            errMsg += val + "<br>"
        });

        $('#error').html(errMsg);
    }
    else {
        $.post(window.location.origin + "/login", {
            username: name,
            password: password,
        }, function (data) {
            window.location.href = data.redirect;
        });
    }
}

function registerUser() {
    var name = $('#username').val();
    var email = $('#email').val();
    var password = $('#password').val();
    var repassword = $('#repassword').val();
    var error = [];

    if (name === "" || email === "" || password === "" || repassword === "") {
        error.push("You must fill everything in.");
    }

    if (name.length >= 17 || name.length <= 3) {
        error.push("Username must be between 3-16 charaters.");
    }

    if (/\s/.test(name)) {
        error.push("Username could not contain any spaces.");
    }

    if (!(/^[A-Za-z0-9]+$/.test(name))) {
        error.push("Username could not contains symbols.")
    }

    if (!validateEmail(email)) {
        error.push("Email is not valid!");
    }

    if (password.length < 6) {
        error.push("Password must be longer than 6.");
    }

    if (/\s/.test(password)) {
        error.push("Password should not contain any spaces.");
    }

    if (password !== repassword) {
        error.push("Password didn't match!");
    }

    if (error.length > 0) {
        var errMsg = "Error: <br>";

        jQuery.each(error, function (i, val) {
            errMsg += val + "<br>"
        });

        $('#error').html(errMsg);
    }
    else {
        $.post(window.location.origin + "/register", {
            username: name,
            password: password,
            repassword: repassword,
            email: email,
        }, function (data) {
            window.location.href = data.redirect;
        });
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Modal Related
function displayModal(message) {
    var modal = document.getElementById("modal");
    var modalMsg = document.getElementById("modal-message");

    modalMsg.innerHTML = message;
    modal.style.display = "block";
}

function removeModal() {
    var modal = document.getElementById("modal");

    modal.style.display = "none";
}

window.onclick = function (e) {
    var modal = document.getElementById("modal");

    if (e.target == modal) {
        modal.style.display = "none";
    }
}

// Profile Picture loader
$(document).ready( () => {
    if ($('.user-picture')[0]) {
        console.log("have");
    }
});

// Notifications Related
var fetching = false;
var loadPerPage = 10;

setInterval(() => {
    if (window.location.pathname !== "/notification") {
        if (loadPerPage != 10) {
            loadPerPage = 10;
            fetching = false;
        }
    }
}, 1000);

$(window).scroll((e) => {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {

        if (window.location.pathname === "/notification") {
            if (!fetching) {
                fetching = true;

                var dataSend = {
                    "offset": loadPerPage
                }

                $.ajax({
                    url: "/notification",
                    type: "POST",
                    data: dataSend,
                    success: (returned) => {
                        loadPerPage = loadPerPage + 10;

                        if (returned.length > 0) {
                            fetching = false;
                            var username = returned[0].name;

                            returned.forEach((data) => {
                                var date = moment(parseInt(data.bell_time)).format('DD/MM/YYYY , hh:mm A');

                                if (data.bell_type == 1) {
                                    $(".notifications-container:last").after('<div class="notifications-container"><a href="/u/' + username + '/q/ ' + data.q_id + '"><div class="notifications-pic"><div class="pic" style="background-image: url(./img/bell.png); background-color: #FFC107;"></div></div><div class="notifications-content"><div class="content"><p class="not-type">A-Non gave you a star.</p><p class="date"><i class="fas fa-calendar-alt"></i>' + date + "</p></div></div></a></div>");
                                }
                                else if (data.bell_type == 0) {
                                    $("div.notifications-container:last").after('<div class="notifications-container"><a href="/u/' + username + '/q/ ' + data.q_id + '"><div class="notifications-pic"><div class="pic" style="background-image: url(./img/bell.png); background-color: #2196F3;"></div></div><div class="notifications-content"><div class="content"><p class="not-type">A-Non asked you a questions.</p><p class="date"><i class="fas fa-calendar-alt"></i>' + date + "</p></div></div></a></div>");
                                }

                            });
                        }

                    },
                    error: (returned) => {
                        window.location.href = window.location.href + "?del=Something went wrong..";
                    }
                });
            }
        }
    }
});

