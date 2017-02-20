function init(){
    range = 2;
    $("#timeline-range").html(
        '<li onclick="changeRange(\'Month\', 1)" id="timeline-1" class="timeline-range">1D</li>' +
        '<li onclick="changeRange(\'Month\', 7)" id="timeline-2" class="timeline-range entity-radioset-cur">7D</li>' +
        '<li onclick="changeRange(\'Month\', 14)" id="timeline-14" class="timeline-range">14D</li>' +
        '<li onclick="changeRange(\'Month\', 0)" id="timeline-0" class="timeline-range">Last 1M</li>'
    );
    $("#span-range").html('Month');
    filterFolder = "BUILDING";
    var data = {};
    $.ajax({
        method: "POST",
        url: "/api/common/init/",
        data: data
    })
        .done(function (data) {
            if (data.error) displayModal("API", data.error);
            else if (data.warning) displayModal("CUSTOM", data.warning);
            else {
                locations = data.locations;
                displayTree();
                $("#location-tree input:checkbox").prop("checked", true);
                updateLocationAnalytics();
                updateTimeline();
            }
        });
}

