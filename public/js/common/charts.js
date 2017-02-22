function showLoading(id){
    $("#"+id+"Data").hide();
    $("#"+id+"Empty").hide();
    $("#"+id+"Loading").show();
}
function showEmpty(id){
    $("#"+id+"Data").hide();
    $("#"+id+"Empty").show();
    $("#"+id+"Loading").hide();
}
function showData(id){
    $("#"+id+"Data").show();
    $("#"+id+"Empty").hide();
    $("#"+id+"Loading").hide();
}
