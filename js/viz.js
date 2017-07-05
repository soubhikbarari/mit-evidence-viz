


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


$(document).ready(function() {

    initButtons();
    initFilters();
    initTable();
    initToolTips();

});

function initButtons() {
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

function filterCsvData(data) {

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

    var selected_country = document.getElementById("country").querySelector("option:checked").text;
    var selected_region = document.getElementById("country").querySelector("option:checked").text;

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

        if (selected_country != "All"){
            return (d.country == selected_country);
        } else if (selected_region != "All"){
            return (d.region == selected_region);
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


    });

    return true;
}


function updateTable() {

    // TODO: need to update filters to be resolved based on selected ...
    //       also need to create error message if bad set of filters chosen

    d3.csv(CSV_FILE_LOC, function(data){

        new_data = formatCsvData( filterCsvData(data) );
        
        d3.select("body")
            .selectAll("circle")
            .data(new_data)
            .transition()
            .attr("r", function(d){
                return d.N == 0 ? 0 : d.N+5;
            });

    });
    
    

    
    return false;

}

