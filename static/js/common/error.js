function displayModal(errorSource, error){
    console.log(errorSource);
    console.log(error);
    var title, body, footer;
    switch (errorSource){
        case "API":
            title = (error.code).replace(/_/g, " ");
            body = 'Got HTTP' + error.status + " error from Aerohive Cloud Service.";
            footer =
                '<a href="" class="btn btn-primary"> Try to reload the page</a> ' +
                '<a href="/" class="btn btn-primary"> Try to use other credentials </a> ';
            break;
    }
    $("#modalLabel").html(title);
    $("#modalBody").html(body);
    $("#modalFooter").html(footer);
    $('#modal').modal();
}