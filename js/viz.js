


var CSV_FILE_LOC = "./data/GOVLAB_transparency_lit_review.csv";


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

var rowNames = [
    "Accountability actors' avenues of redress",
    "Service providers' duties and obligations",
    "Accountability actors' civic duties",
    "Inputs available to service providers",
    "Service providers' level of effort",
    "Outputs/outcomes produced by providers"
];

var colNames =[
    "Knowledge of how to monitor agents",
    "Knowledge of how to sanction agents",
    "Monitoring of agents",
    "Sanctioning of agents",
    "Providers' level of effort",
    "Providers' level of corruption",
    "Outputs",
    "Development outcomes"
];


var filters = [
    "delivery_mode",
    "sector",
    "methodology",
    "government_level",
    "setting",
    "principal",
    "agent"
];

var filterNames = [
    "delivery mode",
    "sector",
    "methodology",
    "government level",
    "setting",
    "principal",
    "agent"
];

var filterValues = [
    [
        "Any",
        "Trainings",
        "Media campaign",
        "Pamphlets or letters",
        "Other",
        "FOIA"
    ],
    [
        "Any",
        "Education",
        "Health",
        "Entitlements",
        "Other"
    ],
    [
        "Any",
        "Experimental",
        "SOO",
        "FE",
        "DiD",
        "RDD",
        "IV",
        "Correlational",
        "Qualitative"
    ],
    [
        "Any",
        "National",
        "Intermediate",
        "Local"
    ],
    [
        "Any",
        "Urban",
        "Rural",
        "Peri-urban"
    ],
    [
        "Any",
        "Citizens",
        "Politicians",
        "Bureaucrats",
        "Judicial body",
        "Other"
    ],
    [
        "Any",
        "Citizens",
        "Politicians",
        "Bureaucrats",
        "Judicial body",
        "Other"
    ]
]


var CURR_FILTER_VALS = [];
var CURR_COUNTRY_SEL = null;
var CURR_REGION_SEL = null;

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
    CURR_FILTER_VALS = collectUserFilters();
    CURR_COUNTRY_SEL = document.getElementById("country").querySelector("option:checked").text;
    CURR_REGION_SEL = document.getElementById("region").querySelector("option:checked").text;

    if (CURR_COUNTRY_SEL != "Any") {
        var loc_filter = "country";
        var loc_value = CURR_COUNTRY_SEL;
    } else if (CURR_REGION_SEL != "Any") {
        var loc_filter = "region";
        var loc_value = CURR_REGION_SEL;
    }
    // apply user inputs
    var flt_data = data.filter(function(d) {

        for (var i=0; i < filters.length; i++){
            var filter = filters[i];
            var d_vals = d[filter].split(";");

            if (CURR_FILTER_VALS[i].indexOf(0) != -1) {
                // if user selected the '0' option ('All'), then
                // include this row.
                continue;
            }

            var any_vals = false;
            for (var j=0, len=d_vals.length; j<len; j++){
                var d_val = parseInt(d_vals[j], 10);

                if (CURR_FILTER_VALS[i].indexOf(d_val) != -1){
                    // check if the user specified any 
                    // value present for this category
                    any_vals = true;
                }    
            }

            if (any_vals == false) {
                return false;
            }

        }

        if (!(CURR_COUNTRY_SEL == "Any" &&  CURR_REGION_SEL == "Any" )) { 
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
                var cell_uniq_studynames = [];
                for (var d=0; d < data.length; d++ ){
                    if (data[d][rows[r]] >= 1 && data[d][cols[c]] >= 1){
                        if (cell_uniq_studynames.indexOf(data[d].studyname) == -1){
                            cell.studies.push(data[d]);
                            cell.N += 1;
                            cell_uniq_studynames.push(data[d].studyname);
                        }
                    }
                }
                p++;
                fmt_data.push(cell);
            }
        }
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

                        var uniq_studies = d.studies;
                        N = uniq_studies.length;

                        if (N == 1) {
                            var html = "<h5><b>"+N+"</b>"+ " study<br></h5>";
                        } else {
                            var html = "<h5><b>"+N+"</b>"+ " studies<br></h5>";
                        }

                        for (var i=0; i < uniq_studies.length; i++) {
                            html += '<b>"'+uniq_studies[i].studyname+'" </b><br>';
                            html += uniq_studies[i].authors + " (" + uniq_studies[i].year + ")<br><br>";
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
                   .style("cursor", "pointer")
                   .attr("fill", "red");
            })
            .on('mouseout', function(d){
                tip.hide(d);
                d3.select(this)
                   .transition()
                   .style("cursor", "default")
                   .attr("fill", "black");
            })
            .on("click", function(d){
                generatePDF(d, CURR_FILTER_VALS);
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
            .attr("fill", "black")
            .attr("id", function(d){
                return d.id;
            })
        
        var N = 0;
        var uniq_studies = [];
        for (s = 0; s < data.length; s++) {
            if (uniq_studies.indexOf(data[s].studyname) == -1){
                uniq_studies.push(data[s].studyname);
            }
        }

        N = uniq_studies.length;
        // console.log(uniq_studies);

        if (N == 1) {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> unique study:</h5>");  
        } else {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> unique studies:</h5>");  
        }
    });

    return true;
}


function updateTable() {

    // check for errors
    var error_text = "";

    //// mixed up location  filter
    CURR_COUNTRY_SEL = document.getElementById("country").querySelector("option:checked").text;
    CURR_REGION_SEL = document.getElementById("region").querySelector("option:checked").text;
    if (CURR_COUNTRY_SEL != "Any" && CURR_REGION_SEL != "Any" ) {
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
        flt_data = filterCsvData(data);
        new_data = formatCsvData(flt_data);

        
        d3.select("body")
            .selectAll("circle")
            .data(new_data)
            .transition()
            .attr("r", function(d){
                return d.N == 0 ? 0 : d.N+5;
            });

        var N = 0;
        var uniq_studies = [];
        for (s = 0; s < flt_data.length; s++) {
            if (uniq_studies.indexOf(flt_data[s].studyname) == -1){
                uniq_studies.push(flt_data[s].studyname);
            }
        }

        N = uniq_studies.length;

        if (N == 1) {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> unique study:</h5>");  
        } else {
            d3.select("#numStudies").html("<h5><b>" + N + "</b> unique studies:</h5>");  
        }
        
        // console.log(uniq_studies);


    });
    
    
    return false;

}

function generatePDF(data, filters) {
    // generate PDF upon click of a specific cell in the table

    // PDF generator object (see `generatePDF` function)
    const pdf = new jsPDF(); 

    // pdf.addImage(GOVLAB_LOGO_DATA_URL, 'JPEG', 4, 10, 75, 18);

    pdf.setFont("helvetica");
    pdf.setFontType("bold");
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.text(10, 25, "MIT GOV/LAB Evidence Gap Report");

    pdf.setFont("helvetica");
    pdf.setFontType("normal");
    pdf.setTextColor(40, 82, 190);
    pdf.setFontSize(12);
    pdf.text(10, 33, "http://www.mitgovlab.org");

    pdf.setLineWidth(0.5);
    pdf.line(10, 37, 180, 37);

    pdf.setFont("helvetica");
    pdf.setFontType("bold");
    pdf.setTextColor(0,0,0);
    pdf.setFontSize(14);

    var yOffset = 10;
    if (CURR_FILTER_VALS.length > 0) {

        pdf.setFont("helvetica");
        pdf.setFontType("bold");
        pdf.text(10, 45, "Subset of studies:");
        pdf.setFontSize(12);

        allAny = true;

        if (CURR_REGION_SEL != null & CURR_REGION_SEL != "Any") {
            pdf.setFont("helvetica");
            pdf.setFontType("bold");
            pdf.text(15, 45+yOffset, "region? ");
            pdf.setFontType("italic");
            pdf.text(80, 45+yOffset, CURR_REGION_SEL)
            yOffset += 5;
            allAny = false;
        }

        if (CURR_COUNTRY_SEL != null & CURR_COUNTRY_SEL != "Any") {
            pdf.setFont("helvetica");
            pdf.setFontType("bold");
            pdf.text(15, 45+yOffset, "country? ");
            pdf.setFontType("italic");
            pdf.text(80, 45+yOffset, CURR_COUNTRY_SEL);
            allAny = false;
            yOffset += 5;
        }

        for (i=0; i < CURR_FILTER_VALS.length; i++) {

            if (CURR_FILTER_VALS[i].indexOf(0) == -1){

                allAny = false;

                pdf.setFont("helvetica");
                pdf.setFontType("bold");
                pdf.text(15, 45+yOffset, filterNames[i]+"? ");

                filterText = "";
                for (j=0; j < CURR_FILTER_VALS[i].length; j++) {
                    filterText += filterValues[i][j+1];
                    if (j != CURR_FILTER_VALS[i].length-1) {
                        filterText += ", ";
                    }
                }
                pdf.setFontType("italic");
                pdf.text(80, 45+yOffset, filterText)

                yOffset += 5;
            }
        }

        if (allAny) {
            pdf.setFontType("normal");
            pdf.text(15, 45+yOffset, "(all)")
            yOffset += 5;
        }

    }

    var uniq_studies = data.studies;
    N = uniq_studies.length;

    if (N == 1) {
        var study_num = N+" matching study:";
    } else {
        var study_num = N+" matching studies:";
    }

    pdf.setFontType("bold");
    pdf.setFontSize(14);
    pdf.text(10, 50+yOffset, study_num);

    var ypos = 45+yOffset+10;
    var studytext = "";
    pdf.setFont("helvetica");
    pdf.setFontType("normal");
    pdf.setFontSize(12);
    pdf.page = 1;
    pdf.text(180, 285, "page "+pdf.page);


    var studytext = "";
    for (var i=0; i < uniq_studies.length; i++) {
        console.log(uniq_studies);
        studytext += "\nTitle:  ";
        studytext += uniq_studies[i].studyname;
        studytext += "\nAuthors:  ";
        studytext += uniq_studies[i].authors 
        studytext += "\nYear:  " 
        studytext += uniq_studies[i].year;
        studytext += "\nAbstract:  " + uniq_studies[i].abstract;
        studytext += "\nURL:  " + uniq_studies[i].URL;
        
        studytext += "\n\nINFORMATION PROVIDED: "
        for (var r=0; r < rows.length; r++) {
            if (uniq_studies[i][rows[r]] == 1) {
                studytext += rowNames[r] + ", ";
            }
        }
        studytext = studytext.slice(0, studytext.length-2);


        studytext += "\nOUTCOMES MEASURED: "
        for (var c=0; c < cols.length; c++) {
            if (uniq_studies[i][cols[c]] == 1) {
                studytext += colNames[c] + ", ";
            }
        }
        studytext = studytext.slice(0, studytext.length-2);


        studytext += "\n\n\n";

        if (i == uniq_studies.length-1){
            pdf.text(10, ypos, pdf.splitTextToSize(studytext, 150));
        }

        if (i % 2 == 1 & i != uniq_studies.length-1) {
            pdf.text(10, ypos, pdf.splitTextToSize(studytext, 150));
            pdf.addPage();
            pdf.page++;
            pdf.text(180, 285, "page "+pdf.page);
    
            studytext = "";
            var ypos = 38;
        }

    }


    pdf.save();
}

