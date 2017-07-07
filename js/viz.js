


var CSV_FILE_LOC = "./data/TAI_data1.csv";

var cols = [
    "know_monitor",
    "know_sanction",
    "effort_to_monitor",
    "effort_to_sanction",
    "provider_effort",
    "provider_corruption",
    "outputs",
    "outcomes"
];

var rows = [
    "aa_avenues_of_redress",
    "providers_duties", 
    "aa_duties", 
    "provider_inputs",
    "provider_effortcorr", 
    "provider_outputs"
    // , "provider_outcomes"
];

var filters = [
    "delivery_mode",
    "sector",
    "setting",
    "methodology",
    "government_level"
];

var filterNames = [
    "delivery mode",
    "sector",
    "setting",
    "methodology",
    "government level"
]

$(document).ready(function() {

    initButtons();
    initFilters();
    initTable();
    initToolTips();

});

function initButtons() {
    $(".alert").hide();
    $('#showFormBtn').click(function() {
        if (document.getElementById("showFormBtn").innerHTML == "Show filter menu"){
            $("#showFormBtn").text('Hide filter menu');
        } else {
            $("#showFormBtn").text('Show filter menu');
        }
        
    });

}

function initToolTips(){
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });
}

function initFilters() {

    d3.csv(CSV_FILE_LOC, function(data) {

        // dynamic filters
        d3.select("#region").selectAll("option")
            .data(data.map(function(d){ return d.region; })
                                .reduce(function(p, v){ return p.indexOf(v) == -1 ? p.concat(v) : p; }, [])
                                .filter(function(d){ return (d !== "NA"); })
                        )
            .enter()
            .append("option")
            .text(function(d){return d;})
            .attr("value",function(d){return d;});
            
            d3.select("#country").selectAll("option")
                .data(data.map(function(d){ return d.country; })
                                    .reduce(function(p, v){ return p.indexOf(v) == -1 ? p.concat(v) : p; }, [])
                                    .filter(function(d){ return (d !== "NA"); })
                            )    .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value",function(d){return d;});

    });
}

function collectUserFilters() {
    // collect user inputs
    var filter_vals = [];
    for (var i=0; i < filters.length; i++){
        var filter = filters[i];
        var inputs = document.querySelectorAll( '[name="'+filter+'"]' );
        var input_vals = [];
        for (var j=0; j < inputs.length; j ++){
            if (inputs[j].checked){
                input_vals.push(parseInt(inputs[j].value));
            }
        }
        filter_vals.push(input_vals);
    }
    return filter_vals;
}

function filterCsvData(data) {

    // collect user inputs
    var filter_vals = collectUserFilters();
    var selected_country = document.getElementById("country").querySelector("option:checked").text;
    var selected_region = document.getElementById("region").querySelector("option:checked").text;

    if (selected_country != "All") {
        var loc_filter = "country";
        var loc_value = selected_country;
    } else if (selected_region != "All") {
        var loc_filter = "region";
        var loc_value = selected_region;
    }
    // apply user inputs
    var flt_data = data.filter(function(d){

        for (var i=0; i < filters.length; i++){
            var filter = filters[i];
            var d_val = parseInt(d[filter]);
            if (filter_vals[i].indexOf(0) != -1) {
                // if user selected the '0' option ('All'), then
                // include this row.
                continue;
            }
            if (filter_vals[i].indexOf(d_val) === -1){
                // if the value for `filter` for this row does not 
                // exist in the user's inputs, then throw the row out.
                return false;
            }
        }

        if (!(selected_country == "All" &&  selected_region == "All" )) { 
            if ( d[loc_filter] != loc_value ) {
                return false;
            }
        }

        return true;

    })

    return flt_data;
}

function formatCsvData(data) {
        // [ { pos: i, studies : [ {}, {}, {}, {} ], N : x } ... ]
        fmt_data = [];
        p = 0;
        for (var r=0; r < rows.length; r++ ){
            for (var c=0; c < cols.length; c++){
                var cell = { "pos" : p, "studies" : [], "N" : 0, "row" : rows[r], "col" : cols[c] };
                for (var d=0; d < data.length; d++ ){
                    if (data[d][rows[r]] >= 1 && data[d][cols[c]] >= 1){
                        cell.studies.push( { 
                            "studyname" : data[d].studyname,
                            "authors" : data[d].authors,
                            "journal" : data[d].journal,
                            "year" : data[d].year,
                            "quality_score" : data[d].quality_score
                        });
                        cell.N += 1;
                    }
                }
                p++;
                fmt_data.push(cell);
            }
        }
        // console.log(fmt_data);
        return fmt_data;
}

function initTable(){
    d3.select("body").selectAll("svg").remove();


    d3.csv(CSV_FILE_LOC, function(data){
        init_data = formatCsvData( data );

        var svgs = d3.select("body")
            .selectAll("td")
            .append("svg")
            .attr("width", "90%")
            .attr("height", "40%")

        var tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-8, -55])
                    // .html(function(d) { return "<b>"+d.N+"</b>"+ " studies<br>"; });
                    .html(function(d) { 
                        if (d.N == 1) {
                            var html = "<h5><b>"+d.N+"</b>"+ " study<br></h5>";
                        } else {
                            var html = "<h5><b>"+d.N+"</b>"+ " studies<br></h5>";
                        }

                        for (var i=0; i < d.studies.length; i++) {
                            html += d.studies[i].authors + " (" + d.studies[i].year + ")<br><br>";
                            console.log(d.studies[i].authors);
                        }

                        return html;
                    });

        svgs.call(tip);

        svgs.data(init_data)
            .append("circle")
            .attr("class", "summaryCircle")
            .attr("r", function(d){ 
                return d.N == 0 ? 0 : d.N+5;
            })
            .on('mouseover', function(d){
                tip.show(d);
                d3.select(this)
                   .transition()
                   .attr("fill", "black");
            })
            .on('mouseout', function(d){
                tip.hide(d);
                d3.select(this)
                   .transition()
                   .attr("fill", "grey");
            })
            .transition()
            .attr("r", function(d){
                if (d.N == 0) {
                    return 0;
                }
                return d.N+5;
            })
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("fill", "grey")
            .attr("id", function(d){
                return d.id;
            })

        var N = init_data.reduce(function(a, b) { return a + b.N; }, 0);

        if (N == 1) {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> total study.</h5>");  
        } else {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> total studies.</h5>");  
        }
    });

    return true;
}


function updateTable() {

    // check for errors
    var error_text = "";

    //// mixed up location  filter
    var selected_country = document.getElementById("country").querySelector("option:checked").text;
    var selected_region = document.getElementById("region").querySelector("option:checked").text;
    if (selected_country != "All" && selected_region != "All" ) {
        error_text += "Please select EITHER <strong>region</strong> filter OR <strong>country</strong> filter.<br>"
    }

    //// incomplete filters
    var filter_vals = collectUserFilters();
    for (var i=0; i < filters.length; i++){
        if (filter_vals[i].length == 0) {
            error_text += "Please select an appropriate filter for <strong>"+filterNames[i]+"</strong>.<br>";
        }
    }

    if (error_text.length > 0) {
        d3.select("#errorText").html(error_text);
        $('.alert').hide().show();
        return false;
    }

    d3.select("#errorText").html("");
    $('.alert').hide();

    d3.csv(CSV_FILE_LOC, function(data){

        new_data = formatCsvData( filterCsvData(data) );
        
        d3.select("body")
            .selectAll("circle")
            .data(new_data)
            .transition()
            .attr("r", function(d){
                return d.N == 0 ? 0 : d.N+5;
            });

        var N = new_data.reduce(function(a, b) { return a + b.N; }, 0);

        if (N == 1) {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> total study.</h5>");  
        } else {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> total studies.</h5>");  
        }


    });
    
    
    return false;

}

