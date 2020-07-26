var fetching = false;
var loadPerPage = 10;

$(window).scroll((e) => {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {

        console.log(window.location.pathname === "/notification");

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